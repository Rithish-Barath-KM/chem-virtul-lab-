export interface MoleculeData {
  id: string;
  name: string;
  smiles: string;
  formula: string;
  molecularWeight: number; // g/mol
  exactMass?: number;
  heavyAtomCount: number;
  totalAtomCount: number;
  bondCount: number;
  hBondDonors: number; // HBD
  hBondAcceptors: number; // HBA
  rotatableBonds: number; // RotB
  tpsa: number; // Topological Polar Surface Area in Å²
  logP: number; // Partition coefficient (consensus/Crippen)
  ringCount: number;
  aromaticRingCount: number;
  aromaticAtomCount: number;
  formalCharge: number;
  complexity?: number;
  iupacName?: string;
  inchi?: string;
  inchiKey?: string;
  cid?: number;
  atomCounts: Record<string, number>;
  drugLikeness: DrugLikenessResult;
  admet: ADMETPrediction;
  conformer3D?: Conformer3D;
  analyzedAt: string;
}

export interface Conformer3D {
  atoms: Array<{
    elem: string;
    x: number;
    y: number;
    z: number;
    charge?: number;
  }>;
  bonds: Array<{
    atom1: number;
    atom2: number;
    order: number;
  }>;
  sdfData?: string;
}

export interface DrugLikenessRule {
  name: string;
  threshold: string;
  value: number | string;
  passed: boolean;
  explanation: string;
}

export interface DrugLikenessResult {
  ruleOfFiveViolations: number;
  lipinskiPassed: boolean; // <= 1 violation is considered acceptable, 0 is ideal
  rules: {
    molecularWeight: DrugLikenessRule;
    logP: DrugLikenessRule;
    hBondDonors: DrugLikenessRule;
    hBondAcceptors: DrugLikenessRule;
  };
  veber: {
    passed: boolean;
    violations: number;
    rotatableBonds: DrugLikenessRule;
    tpsa: DrugLikenessRule;
  };
  ghoseFilter: {
    passed: boolean;
    violations: number;
  };
  bioavailabilityScore: number; // 0 to 1 scale (e.g. 0.55 or 0.85)
}

export interface ADMETPrediction {
  isComputational: true;
  citation: string;
  bbbPermeation: {
    category: 'High' | 'Moderate' | 'Low';
    logBB: number;
    description: string;
  };
  humanIntestinalAbsorption: {
    percentage: number;
    category: 'High (>80%)' | 'Moderate (30-80%)' | 'Poor (<30%)';
  };
  pGpSubstrateRisk: {
    risk: 'Low' | 'Medium' | 'High';
    probability: number;
    description: string;
  };
  cyp3a4Inhibition: {
    inhibitorLikelihood: 'Non-inhibitor' | 'Weak Inhibitor' | 'Potential Inhibitor';
    riskScore: number;
  };
  syntheticAccessibilityScore: {
    score: number; // 1 (easy) to 10 (very difficult)
    category: 'Easy' | 'Moderate' | 'Difficult';
  };
}

export interface SavedMolecule extends MoleculeData {
  tags: string[];
  notes: string;
  savedAt: string;
}

export interface ComparisonResult {
  moleculeA: MoleculeData;
  moleculeB: MoleculeData;
  tanimotoSimilarity: number; // 0.0 to 1.0
  descriptorDiffs: Array<{
    property: string;
    name: string;
    unit?: string;
    valA: number | string;
    valB: number | string;
    delta: number | null;
    percentDiff: number | null;
  }>;
}

export interface BatchItem {
  id: string;
  input: string;
  name?: string;
  status: 'pending' | 'success' | 'error';
  errorMessage?: string;
  data?: MoleculeData;
}
