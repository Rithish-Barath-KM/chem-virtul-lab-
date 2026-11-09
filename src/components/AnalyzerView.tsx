import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Sparkles,
  Trash2,
  Bookmark,
  FileText,
  GitCompare,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Info,
  Maximize2,
  Box,
  Layers,
  ChevronDown,
  Check,
} from 'lucide-react';
import { MoleculeData, SavedMolecule } from '../types/chemistry';
import { validateSmiles, analyzeSmiles } from '../utils/cheminformatics';
import { fetchPubChemProperties, fetchPubChem3DConformer, parseSdfToConformer } from '../utils/pubchem';
import { CURATED_LIBRARY, getRandomCompound } from '../utils/chemicalLibrary';
import { Molecular2DViewer } from './Molecular2DViewer';
import { Molecular3DViewer } from './Molecular3DViewer';
import { NavigationTab } from './Navbar';

interface AnalyzerViewProps {
  currentMolecule: MoleculeData | null;
  onSetCurrentMolecule: (mol: MoleculeData) => void;
  onSaveToVault: (mol: MoleculeData, tags: string[], notes: string) => void;
  onNavigate: (tab: NavigationTab) => void;
  onCompareWith: (mol: MoleculeData) => void;
}

export const AnalyzerView: React.FC<AnalyzerViewProps> = ({
  currentMolecule,
  onSetCurrentMolecule,
  onSaveToVault,
  onNavigate,
  onCompareWith,
}) => {
  const [smilesInput, setSmilesInput] = useState(currentMolecule?.smiles || 'CC(=O)Oc1ccccc1C(=O)O');
  const [compoundName, setCompoundName] = useState(currentMolecule?.name || 'Aspirin');
  const [activeTab, setActiveTab] = useState<'2d' | '3d'>('2d');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveTags, setSaveTags] = useState('Lead, Analgesic');
  const [saveNotes, setSaveNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (currentMolecule) {
      setSmilesInput(currentMolecule.smiles);
      setCompoundName(currentMolecule.name);
    }
  }, [currentMolecule]);

  const handleAnalyze = async (overrideSmiles?: string, overrideName?: string) => {
    const input = (overrideSmiles || smilesInput).trim();
    if (!input) {
      setErrorMsg('Please enter a valid SMILES string.');
      return;
    }

    const validation = validateSmiles(input);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Invalid SMILES notation');
      return;
    }

    setErrorMsg(null);
    setIsAnalyzing(true);

    try {
      // Analyze with client-side cheminformatics engine
      const molData = analyzeSmiles(input, overrideName || compoundName);

      // Fetch live PubChem properties asynchronously for IUPAC, CID, and high-precision MMFF94 3D conformer
      fetchPubChemProperties(input).then((pubData) => {
        if (pubData) {
          molData.cid = pubData.cid;
          if (pubData.iupacName) molData.iupacName = pubData.iupacName;
          if (pubData.inchi) molData.inchi = pubData.inchi;
          if (pubData.inchiKey) molData.inchiKey = pubData.inchiKey;
          onSetCurrentMolecule({ ...molData });
        }
      });

      // Try fetching verified 3D conformer SDF
      fetchPubChem3DConformer(input).then((sdf) => {
        if (sdf) {
          const parsedConformer = parseSdfToConformer(sdf);
          if (parsedConformer) {
            molData.conformer3D = parsedConformer;
            onSetCurrentMolecule({ ...molData });
          }
        }
      });

      onSetCurrentMolecule(molData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Cheminformatics analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setSmilesInput('');
    setCompoundName('');
    setErrorMsg(null);
  };

  const handleRandom = () => {
    const random = getRandomCompound();
    setSmilesInput(random.smiles);
    setCompoundName(random.name);
    handleAnalyze(random.smiles, random.name);
  };

  const handleSelectExample = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const compound = CURATED_LIBRARY.find((c) => c.id === e.target.value);
    if (compound) {
      setSmilesInput(compound.smiles);
      setCompoundName(compound.name);
      handleAnalyze(compound.smiles, compound.name);
    }
  };

  const handleConfirmSave = () => {
    if (!currentMolecule) return;
    const tagsArray = saveTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    onSaveToVault(currentMolecule, tagsArray, saveNotes);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setSaveModalOpen(false);
    }, 1500);
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
              Molecular Analyzer
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time chemical topology parsing, descriptor computation, and 3D conformer generation.
          </p>
        </div>

        {/* Quick Example Dropdown */}
        <div className="flex items-center space-x-2">
          <label htmlFor="example-selector" className="text-xs font-mono text-slate-400 whitespace-nowrap">
            Presets:
          </label>
          <div className="relative">
            <select
              id="example-selector"
              onChange={handleSelectExample}
              defaultValue="aspirin"
              className="bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-200 text-xs rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-cyan-400 cursor-pointer appearance-none"
            >
              {CURATED_LIBRARY.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.category})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Input Panel Card */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border-cyan-500/30 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 space-y-1.5">
            <label htmlFor="smiles-input" className="block text-xs font-mono font-medium text-cyan-300">
              SMILES Notation (Simplified Molecular Input Line Entry System)
            </label>
            <div className="relative">
              <input
                id="smiles-input"
                type="text"
                value={smilesInput}
                onChange={(e) => {
                  setSmilesInput(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="e.g. CC(=O)Oc1ccccc1C(=O)O or [NH4+]"
                className="w-full bg-[#070b1e]/90 text-cyan-200 font-mono text-sm px-4 py-2.5 rounded-xl border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="name-input" className="block text-xs font-mono font-medium text-slate-300">
              Compound Alias / Name
            </label>
            <input
              id="name-input"
              type="text"
              value={compoundName}
              onChange={(e) => setCompoundName(e.target.value)}
              placeholder="e.g. Aspirin"
              className="w-full bg-[#070b1e]/90 text-slate-200 font-sans text-sm px-4 py-2.5 rounded-xl border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Validation Error:</span> {errorMsg}
            </div>
          </div>
        )}

        {/* Input Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleAnalyze()}
              disabled={isAnalyzing}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all active:scale-95 disabled:opacity-50"
            >
              <FlaskConical className="w-4 h-4" />
              <span>{isAnalyzing ? 'Analyzing Compound...' : 'Analyze Molecule'}</span>
            </button>

            <button
              onClick={handleClear}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            <button
              onClick={handleRandom}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Random Molecule</span>
            </button>
          </div>

          {currentMolecule && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSaveModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 transition-all"
                title="Save compound into persistent Chemical Vault"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save to Vault</span>
              </button>

              <button
                onClick={() => onCompareWith(currentMolecule)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900 border border-violet-500/30 hover:border-violet-400 text-violet-300 transition-all"
                title="Compare with another molecule"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Compare</span>
              </button>

              <button
                onClick={() => onNavigate('reports')}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 transition-all"
                title="Generate scientific lab report"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Report</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results Display */}
      {currentMolecule && (
        <div className="space-y-8 animate-fadeIn">
          {/* Header Summary Card */}
          <div className="glass-panel p-5 rounded-2xl border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {currentMolecule.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  {currentMolecule.formula}
                </span>
                {currentMolecule.cid && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                    CID: {currentMolecule.cid}
                  </span>
                )}
              </div>
              {currentMolecule.iupacName && (
                <p className="text-xs font-mono text-cyan-400 mt-1">
                  IUPAC: {currentMolecule.iupacName}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <div
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-mono ${
                  currentMolecule.drugLikeness.lipinskiPassed
                    ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-950/70 border-amber-500/40 text-amber-300'
                }`}
              >
                {currentMolecule.drugLikeness.lipinskiPassed ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                )}
                <span>
                  Lipinski: {currentMolecule.drugLikeness.lipinskiPassed ? 'Passed' : 'Violates'}{' '}
                  ({currentMolecule.drugLikeness.ruleOfFiveViolations} violations)
                </span>
              </div>
            </div>
          </div>

          {/* Visualization Row: 2D vs 3D */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visualizer Container */}
            <div className="lg:col-span-7 glass-panel rounded-2xl border-cyan-500/25 p-4 flex flex-col space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setActiveTab('2d')}
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      activeTab === '2d'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>2D Structure</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('3d')}
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      activeTab === '3d'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>3D Conformer</span>
                  </button>
                </div>

                <span className="text-[11px] font-mono text-slate-400">
                  {activeTab === '2d' ? '2D Vector Layout' : 'Interactive 3D Coordinates'}
                </span>
              </div>

              <div className="flex-1 min-h-[360px]">
                {activeTab === '2d' ? (
                  <Molecular2DViewer
                    smiles={currentMolecule.smiles}
                    name={currentMolecule.name}
                    className="h-full min-h-[360px]"
                  />
                ) : (
                  <Molecular3DViewer
                    conformer={currentMolecule.conformer3D}
                    moleculeName={currentMolecule.name}
                    height="360px"
                  />
                )}
              </div>
            </div>

            {/* Core Topological Descriptors Dashboard */}
            <div className="lg:col-span-5 glass-panel rounded-2xl border-cyan-500/25 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Calculated Molecular Descriptors
                </h3>
                <span className="text-[10px] font-mono text-cyan-400">RDKit Standard</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Molecular Weight</span>
                  <span className="text-lg font-bold text-cyan-300">
                    {currentMolecule.molecularWeight}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-1">g/mol</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Formula</span>
                  <span className="text-lg font-bold text-white">
                    {currentMolecule.formula}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Partition Coeff (LogP)</span>
                  <span className="text-lg font-bold text-violet-300">
                    {currentMolecule.logP}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-1">Crippen</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Polar Surface (TPSA)</span>
                  <span className="text-lg font-bold text-sky-300">
                    {currentMolecule.tpsa}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-1">Å²</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">H-Bond Donors (HBD)</span>
                  <span className="text-lg font-bold text-emerald-300">
                    {currentMolecule.hBondDonors}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-1">Lipinski</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">H-Bond Acceptors (HBA)</span>
                  <span className="text-lg font-bold text-rose-300">
                    {currentMolecule.hBondAcceptors}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-1">Lipinski</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Rotatable Bonds</span>
                  <span className="text-lg font-bold text-amber-300">
                    {currentMolecule.rotatableBonds}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-1">Veber</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Ring Count</span>
                  <span className="text-lg font-bold text-teal-300">
                    {currentMolecule.ringCount}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-1">
                    ({currentMolecule.aromaticRingCount} aromatic)
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Total Atoms</span>
                  <span className="text-lg font-bold text-slate-200">
                    {currentMolecule.totalAtomCount}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-1">
                    ({currentMolecule.heavyAtomCount} heavy)
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Total Bonds</span>
                  <span className="text-lg font-bold text-slate-200">
                    {currentMolecule.bondCount}
                  </span>
                </div>
              </div>

              {/* Atom Breakdown */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 block mb-2">
                  Elemental Composition:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(currentMolecule.atomCounts).map(([elem, count]) => (
                    <span
                      key={elem}
                      className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-cyan-300 border border-slate-700"
                    >
                      {elem}: <strong className="text-white">{count}</strong>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Lipinski Rule of 5 & ADMET Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lipinski Rule of 5 Details */}
            <div className="glass-panel p-5 rounded-2xl border-cyan-500/20 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase">
                    Lipinski's Rule of Five
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-400">Oral Bioavailability</span>
              </div>

              <div className="space-y-3">
                {Object.values(currentMolecule.drugLikeness.rules).map((rule) => (
                  <div
                    key={rule.name}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-slate-200">{rule.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          (Target {rule.threshold})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{rule.explanation}</p>
                    </div>

                    <div className="flex items-center space-x-2 pl-3">
                      <span className="text-xs font-mono font-bold text-slate-200">
                        {rule.value}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          rule.passed
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {rule.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Veber Filter Summary */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Veber's Rule (RotB ≤ 10, TPSA ≤ 140):</span>
                <span
                  className={
                    currentMolecule.drugLikeness.veber.passed
                      ? 'text-emerald-400 font-bold'
                      : 'text-amber-400 font-bold'
                  }
                >
                  {currentMolecule.drugLikeness.veber.passed ? 'Passed (0 Violations)' : 'Violated'}
                </span>
              </div>
            </div>

            {/* In Silico ADMET Predictions */}
            <div className="glass-panel p-5 rounded-2xl border-cyan-500/20 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-violet-400" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase">
                    ADMET Predictive QSAR Models
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950/70 text-violet-300 border border-violet-500/30">
                  In Silico Prediction
                </span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-300 font-bold block">
                      Blood-Brain Barrier (logBB)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {currentMolecule.admet.bbbPermeation.description}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-cyan-300 px-2.5 py-1 rounded bg-slate-800">
                    {currentMolecule.admet.bbbPermeation.category} ({currentMolecule.admet.bbbPermeation.logBB})
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-300 font-bold block">
                      Human Intestinal Absorption (HIA)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Estimated passive gastrointestinal absorption
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-300 px-2.5 py-1 rounded bg-slate-800">
                    {currentMolecule.admet.humanIntestinalAbsorption.percentage}% ({currentMolecule.admet.humanIntestinalAbsorption.category})
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-300 font-bold block">P-gp Efflux Risk</span>
                    <span className="text-[11px] text-slate-400">
                      {currentMolecule.admet.pGpSubstrateRisk.description}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-300 px-2.5 py-1 rounded bg-slate-800">
                    {currentMolecule.admet.pGpSubstrateRisk.risk}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-300 font-bold block">
                      Synthetic Accessibility (SAScore)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Ease of organic synthesis (1 = trivial, 10 = extreme)
                    </span>
                  </div>
                  <span className="text-xs font-bold text-violet-300 px-2.5 py-1 rounded bg-slate-800">
                    {currentMolecule.admet.syntheticAccessibilityScore.score} / 10 ({currentMolecule.admet.syntheticAccessibilityScore.category})
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 italic pt-1">
                Note: Predictions are computational QSAR approximations based on validated algorithms
                (Clark 1999, Zhao 2001, Ertl 2000) and must be verified experimentally in vitro.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Save to Chemical Vault Modal */}
      {saveModalOpen && currentMolecule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel p-6 rounded-2xl border-cyan-500/40 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Bookmark className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Save to Chemical Vault</h3>
              </div>
              <button
                onClick={() => setSaveModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Compound Name</label>
                <input
                  type="text"
                  value={currentMolecule.name}
                  disabled
                  className="w-full bg-slate-900/90 text-slate-300 text-xs px-3 py-2 rounded-lg border border-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={saveTags}
                  onChange={(e) => setSaveTags(e.target.value)}
                  placeholder="e.g. Lead, Analgesic, Synthesis Candidate"
                  className="w-full bg-slate-900 text-slate-100 text-xs px-3 py-2 rounded-lg border border-slate-700 focus:border-cyan-400 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  Laboratory Notes
                </label>
                <textarea
                  value={saveNotes}
                  onChange={(e) => setSaveNotes(e.target.value)}
                  placeholder="e.g. Synthesized via acetylation of salicylic acid; targets COX-1..."
                  rows={3}
                  className="w-full bg-slate-900 text-slate-100 text-xs p-3 rounded-lg border border-slate-700 focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            {saveSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Compound successfully saved to Chemical Vault!</span>
              </div>
            ) : (
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setSaveModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSave}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md transition-all"
                >
                  Confirm & Save
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
