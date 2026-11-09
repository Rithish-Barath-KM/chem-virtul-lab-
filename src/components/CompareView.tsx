import React, { useState, useMemo } from 'react';
import {
  GitCompare,
  ArrowRightLeft,
  Sparkles,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Copy,
} from 'lucide-react';
import { MoleculeData } from '../types/chemistry';
import {
  parseSmiles,
  analyzeSmiles,
  validateSmiles,
  generateFingerprint,
  calculateTanimoto,
} from '../utils/cheminformatics';
import { CURATED_LIBRARY } from '../utils/chemicalLibrary';
import { Molecular2DViewer } from './Molecular2DViewer';

interface CompareViewProps {
  initialMoleculeA?: MoleculeData | null;
  initialMoleculeB?: MoleculeData | null;
}

export const CompareView: React.FC<CompareViewProps> = ({
  initialMoleculeA,
  initialMoleculeB,
}) => {
  const [smilesA, setSmilesA] = useState(
    initialMoleculeA?.smiles || 'CC(=O)Oc1ccccc1C(=O)O' // Aspirin
  );
  const [nameA, setNameA] = useState(initialMoleculeA?.name || 'Aspirin');

  const [smilesB, setSmilesB] = useState(
    initialMoleculeB?.smiles || 'CC(=O)Nc1ccc(O)cc1' // Paracetamol
  );
  const [nameB, setNameB] = useState(initialMoleculeB?.name || 'Paracetamol');

  const [errorA, setErrorA] = useState<string | null>(null);
  const [errorB, setErrorB] = useState<string | null>(null);

  // Computed molecules
  const molA = useMemo(() => {
    try {
      const val = validateSmiles(smilesA);
      if (!val.valid) {
        setErrorA(val.error || 'Invalid SMILES');
        return null;
      }
      setErrorA(null);
      return analyzeSmiles(smilesA, nameA);
    } catch (e: any) {
      setErrorA(e.message);
      return null;
    }
  }, [smilesA, nameA]);

  const molB = useMemo(() => {
    try {
      const val = validateSmiles(smilesB);
      if (!val.valid) {
        setErrorB(val.error || 'Invalid SMILES');
        return null;
      }
      setErrorB(null);
      return analyzeSmiles(smilesB, nameB);
    } catch (e: any) {
      setErrorB(e.message);
      return null;
    }
  }, [smilesB, nameB]);

  // Compute Tanimoto similarity using circular Morgan/ECFP fingerprints
  const tanimotoScore = useMemo(() => {
    if (!molA || !molB) return null;
    try {
      const parsedA = parseSmiles(molA.smiles);
      const parsedB = parseSmiles(molB.smiles);
      const fpA = generateFingerprint(parsedA.atoms);
      const fpB = generateFingerprint(parsedB.atoms);
      return calculateTanimoto(fpA, fpB);
    } catch {
      return null;
    }
  }, [molA, molB]);

  const handleSwap = () => {
    const tempS = smilesA;
    const tempN = nameA;
    setSmilesA(smilesB);
    setNameA(nameB);
    setSmilesB(tempS);
    setNameB(tempN);
  };

  const handleSelectPresetA = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const c = CURATED_LIBRARY.find((item) => item.id === e.target.value);
    if (c) {
      setSmilesA(c.smiles);
      setNameA(c.name);
    }
  };

  const handleSelectPresetB = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const c = CURATED_LIBRARY.find((item) => item.id === e.target.value);
    if (c) {
      setSmilesB(c.smiles);
      setNameB(c.name);
    }
  };

  const descriptorComparisons = useMemo(() => {
    if (!molA || !molB) return [];

    const formatDiff = (valA: number, valB: number) => {
      const diff = parseFloat((valB - valA).toFixed(2));
      const pct = valA !== 0 ? parseFloat((((valB - valA) / Math.abs(valA)) * 100).toFixed(1)) : 0;
      return { diff, pct };
    };

    return [
      {
        label: 'Molecular Formula',
        valA: molA.formula,
        valB: molB.formula,
        diff: null,
      },
      {
        label: 'Molecular Weight (g/mol)',
        valA: molA.molecularWeight,
        valB: molB.molecularWeight,
        ...formatDiff(molA.molecularWeight, molB.molecularWeight),
      },
      {
        label: 'Partition Coefficient (LogP)',
        valA: molA.logP,
        valB: molB.logP,
        ...formatDiff(molA.logP, molB.logP),
      },
      {
        label: 'Polar Surface Area (TPSA, Å²)',
        valA: molA.tpsa,
        valB: molB.tpsa,
        ...formatDiff(molA.tpsa, molB.tpsa),
      },
      {
        label: 'H-Bond Donors (HBD)',
        valA: molA.hBondDonors,
        valB: molB.hBondDonors,
        ...formatDiff(molA.hBondDonors, molB.hBondDonors),
      },
      {
        label: 'H-Bond Acceptors (HBA)',
        valA: molA.hBondAcceptors,
        valB: molB.hBondAcceptors,
        ...formatDiff(molA.hBondAcceptors, molB.hBondAcceptors),
      },
      {
        label: 'Rotatable Bonds',
        valA: molA.rotatableBonds,
        valB: molB.rotatableBonds,
        ...formatDiff(molA.rotatableBonds, molB.rotatableBonds),
      },
      {
        label: 'Total Ring Count',
        valA: molA.ringCount,
        valB: molB.ringCount,
        ...formatDiff(molA.ringCount, molB.ringCount),
      },
      {
        label: 'Aromatic Rings',
        valA: molA.aromaticRingCount,
        valB: molB.aromaticRingCount,
        ...formatDiff(molA.aromaticRingCount, molB.aromaticRingCount),
      },
      {
        label: 'Heavy Atoms',
        valA: molA.heavyAtomCount,
        valB: molB.heavyAtomCount,
        ...formatDiff(molA.heavyAtomCount, molB.heavyAtomCount),
      },
    ];
  }, [molA, molB]);

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <GitCompare className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
              Molecular Comparison & Similarity
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Side-by-side structural comparison, ECFP-4 Morgan fingerprint Tanimoto similarity, and
            differential descriptor matrix.
          </p>
        </div>

        <button
          onClick={handleSwap}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-medium bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all self-start sm:self-auto"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
          <span>Swap Compounds (A ⇄ B)</span>
        </button>
      </div>

      {/* Input Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Molecule A Inputs */}
        <div className="glass-panel p-5 rounded-2xl border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
              Molecule A (Reference)
            </span>
            <select
              onChange={handleSelectPresetA}
              className="bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 rounded px-2 py-1"
            >
              <option value="">Preset Compound...</option>
              {CURATED_LIBRARY.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={nameA}
              onChange={(e) => setNameA(e.target.value)}
              placeholder="Compound Name A"
              className="w-full bg-[#070b1e] text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-cyan-400 font-sans"
            />
            <input
              type="text"
              value={smilesA}
              onChange={(e) => setSmilesA(e.target.value)}
              placeholder="SMILES String A"
              className="w-full bg-[#070b1e] text-cyan-300 text-xs px-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          {errorA && (
            <p className="text-[11px] font-mono text-rose-400 bg-rose-950/60 p-2 rounded border border-rose-500/30">
              {errorA}
            </p>
          )}
        </div>

        {/* Molecule B Inputs */}
        <div className="glass-panel p-5 rounded-2xl border-violet-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-violet-300 uppercase tracking-wider">
              Molecule B (Candidate / Target)
            </span>
            <select
              onChange={handleSelectPresetB}
              className="bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 rounded px-2 py-1"
            >
              <option value="">Preset Compound...</option>
              {CURATED_LIBRARY.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={nameB}
              onChange={(e) => setNameB(e.target.value)}
              placeholder="Compound Name B"
              className="w-full bg-[#070b1e] text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-violet-400 font-sans"
            />
            <input
              type="text"
              value={smilesB}
              onChange={(e) => setSmilesB(e.target.value)}
              placeholder="SMILES String B"
              className="w-full bg-[#070b1e] text-violet-300 text-xs px-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-violet-400 font-mono"
            />
          </div>

          {errorB && (
            <p className="text-[11px] font-mono text-rose-400 bg-rose-950/60 p-2 rounded border border-rose-500/30">
              {errorB}
            </p>
          )}
        </div>
      </div>

      {/* Similarity Score Banner */}
      {tanimotoScore !== null && molA && molB && (
        <div className="glass-panel p-6 rounded-2xl border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-violet-950/40 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block">
                Tanimoto Similarity Index (ECFP-4 / Morgan Fingerprint)
              </span>
              <div className="flex items-baseline space-x-3 mt-1">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-cyan-300">
                  {(tanimotoScore * 100).toFixed(1)}%
                </span>
                <span className="text-sm font-mono text-slate-400">
                  (Coefficient: {tanimotoScore})
                </span>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                  tanimotoScore >= 0.85
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                    : tanimotoScore >= 0.5
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {tanimotoScore >= 0.85
                  ? 'High Structural Similarity (Isosteres)'
                  : tanimotoScore >= 0.5
                  ? 'Moderate Similarity (Shared Substructure)'
                  : 'Distinct Chemical Scaffolds'}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-950/80 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-violet-500 shadow-md transition-all duration-500"
              style={{ width: `${Math.max(5, tanimotoScore * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Side-by-Side 2D Structures */}
      {molA && molB && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-5 rounded-2xl border-cyan-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono">{molA.name}</h3>
              <span className="text-xs font-mono text-cyan-300">{molA.formula}</span>
            </div>
            <div className="h-64 rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800">
              <Molecular2DViewer smiles={molA.smiles} name={molA.name} className="h-full" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border-violet-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono">{molB.name}</h3>
              <span className="text-xs font-mono text-violet-300">{molB.formula}</span>
            </div>
            <div className="h-64 rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800">
              <Molecular2DViewer smiles={molB.smiles} name={molB.name} className="h-full" />
            </div>
          </div>
        </div>
      )}

      {/* Comparative Descriptor Matrix Table */}
      {molA && molB && (
        <div className="glass-panel rounded-2xl border-cyan-500/20 overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Differential Physicochemical Analysis
            </h3>
            <span className="text-xs font-mono text-slate-400">Δ = Molecule B − Molecule A</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-6 font-semibold">Descriptor Property</th>
                  <th className="py-3 px-6 font-semibold text-cyan-300">{molA.name}</th>
                  <th className="py-3 px-6 font-semibold text-violet-300">{molB.name}</th>
                  <th className="py-3 px-6 font-semibold text-right">Differential (Δ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {descriptorComparisons.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-6 font-medium text-slate-300">{row.label}</td>
                    <td className="py-3 px-6 text-slate-200">{row.valA}</td>
                    <td className="py-3 px-6 text-slate-200">{row.valB}</td>
                    <td className="py-3 px-6 text-right">
                      {row.diff !== null && row.diff !== undefined ? (
                        <span
                          className={`font-bold ${
                            row.diff > 0
                              ? 'text-cyan-400'
                              : row.diff < 0
                              ? 'text-violet-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {row.diff > 0 ? `+${row.diff}` : row.diff}
                          {row.pct !== undefined && row.pct !== null && row.pct !== 0 && (
                            <span className="text-[10px] text-slate-400 ml-1">
                              ({row.pct > 0 ? `+${row.pct}` : row.pct}%)
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
