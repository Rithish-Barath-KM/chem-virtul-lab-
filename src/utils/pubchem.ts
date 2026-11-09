import { Conformer3D } from '../types/chemistry';

export interface PubChemPropertyResult {
  cid?: number;
  iupacName?: string;
  inchi?: string;
  inchiKey?: string;
  xLogP?: number;
  tpsa?: number;
  molecularWeight?: number;
  molecularFormula?: string;
  hBondDonorCount?: number;
  hBondAcceptorCount?: number;
  rotatableBondCount?: number;
  heavyAtomCount?: number;
}

const pubchemCache = new Map<string, PubChemPropertyResult>();
const conformerCache = new Map<string, string>(); // smiles -> SDF 3D data

/**
 * Fetch verified properties from PubChem PUG REST API
 */
export async function fetchPubChemProperties(smiles: string): Promise<PubChemPropertyResult | null> {
  const key = smiles.trim();
  if (pubchemCache.has(key)) {
    return pubchemCache.get(key)!;
  }

  try {
    const encoded = encodeURIComponent(key);
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encoded}/property/IUPACName,InChI,InChIKey,XLogP,TPSA,MolecularWeight,MolecularFormula,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,HeavyAtomCount/JSON`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    const props = json?.PropertyTable?.Properties?.[0];
    if (!props) return null;

    const result: PubChemPropertyResult = {
      cid: props.CID,
      iupacName: props.IUPACName,
      inchi: props.InChI,
      inchiKey: props.InChIKey,
      xLogP: props.XLogP !== undefined ? props.XLogP : undefined,
      tpsa: props.TPSA !== undefined ? props.TPSA : undefined,
      molecularWeight: props.MolecularWeight ? parseFloat(props.MolecularWeight) : undefined,
      molecularFormula: props.MolecularFormula,
      hBondDonorCount: props.HBondDonorCount,
      hBondAcceptorCount: props.HBondAcceptorCount,
      rotatableBondCount: props.RotatableBondCount,
      heavyAtomCount: props.HeavyAtomCount,
    };

    pubchemCache.set(key, result);
    return result;
  } catch {
    // Graceful fallback to client-side computational calculations
    return null;
  }
}

/**
 * Fetch verified 3D conformer SDF data from PubChem
 */
export async function fetchPubChem3DConformer(smiles: string): Promise<string | null> {
  const key = smiles.trim();
  if (conformerCache.has(key)) {
    return conformerCache.get(key)!;
  }

  try {
    const encoded = encodeURIComponent(key);
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encoded}/record/SDF/?record_type=3d`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const sdf = await res.text();
    if (sdf && sdf.includes('M  END')) {
      conformerCache.set(key, sdf);
      return sdf;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Parses SDF / MOL V2000 text into Cartesian 3D coordinates for the viewer
 */
export function parseSdfToConformer(sdfText: string): Conformer3D | null {
  try {
    const lines = sdfText.split('\n');
    let countsLineIdx = -1;

    for (let i = 0; i < Math.min(10, lines.length); i++) {
      if (lines[i].includes('V2000')) {
        countsLineIdx = i;
        break;
      }
    }

    if (countsLineIdx === -1) return null;

    const countsLine = lines[countsLineIdx];
    const atomCount = parseInt(countsLine.substring(0, 3).trim(), 10);
    const bondCount = parseInt(countsLine.substring(3, 6).trim(), 10);

    if (isNaN(atomCount) || atomCount <= 0) return null;

    const atoms: Conformer3D['atoms'] = [];
    let currentIdx = countsLineIdx + 1;

    for (let a = 0; a < atomCount; a++) {
      const line = lines[currentIdx++];
      if (!line) break;
      const x = parseFloat(line.substring(0, 10).trim());
      const y = parseFloat(line.substring(10, 20).trim());
      const z = parseFloat(line.substring(20, 30).trim());
      const elem = line.substring(31, 34).trim();
      atoms.push({ elem, x, y, z });
    }

    const bonds: Conformer3D['bonds'] = [];
    for (let b = 0; b < bondCount; b++) {
      const line = lines[currentIdx++];
      if (!line) break;
      const a1 = parseInt(line.substring(0, 3).trim(), 10) - 1;
      const a2 = parseInt(line.substring(3, 6).trim(), 10) - 1;
      const order = parseInt(line.substring(6, 9).trim(), 10);
      bonds.push({ atom1: a1, atom2: a2, order });
    }

    return {
      atoms,
      bonds,
      sdfData: sdfText,
    };
  } catch {
    return null;
  }
}
