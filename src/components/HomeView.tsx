import React from 'react';
import {
  FlaskConical,
  Sparkles,
  GitCompare,
  Layers,
  FileText,
  Bookmark,
  ShieldCheck,
  Activity,
  ArrowRight,
  Database,
  Calendar,
  Box,
  Compass,
} from 'lucide-react';
import { MoleculeData } from '../types/chemistry';
import { LibraryCompound, getMoleculeOfTheDay } from '../utils/chemicalLibrary';
import { Molecular2DViewer } from './Molecular2DViewer';
import { NavigationTab } from './Navbar';

interface HomeViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onAnalyzeSmiles: (smiles: string, name?: string) => void;
  onRandomMolecule: () => void;
  recentMolecules: MoleculeData[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onAnalyzeSmiles,
  onRandomMolecule,
  recentMolecules,
}) => {
  const moleculeOfTheDay: LibraryCompound = getMoleculeOfTheDay();

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 pt-4 pb-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Professional Computational Chemistry Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
          <span className="block text-slate-100">EXPLORE THE</span>
          <span className="block bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
            MOLECULAR UNIVERSE
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
          Discover, visualize and analyze chemical compounds through an interactive
          cheminformatics laboratory.
        </p>

        {/* Hero Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onNavigate('analyzer')}
            className="flex items-center space-x-2.5 px-6 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 via-cyan-400 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all duration-300 active:scale-95 group"
          >
            <FlaskConical className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Launch Molecular Analyzer</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onRandomMolecule}
            className="flex items-center space-x-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-cyan-500/40 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-300 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Generate Random Molecule</span>
          </button>
        </div>

        {/* Key Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
          <div className="glass-panel p-4 rounded-xl text-center border-cyan-500/20">
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">100%</div>
            <div className="text-xs text-slate-400 mt-0.5">Scientific Calculation</div>
          </div>
          <div className="glass-panel p-4 rounded-xl text-center border-cyan-500/20">
            <div className="text-2xl sm:text-3xl font-extrabold text-violet-400 font-mono">14+</div>
            <div className="text-xs text-slate-400 mt-0.5">Topological Descriptors</div>
          </div>
          <div className="glass-panel p-4 rounded-xl text-center border-cyan-500/20">
            <div className="text-2xl sm:text-3xl font-extrabold text-sky-400 font-mono">3Dmol.js</div>
            <div className="text-xs text-slate-400 mt-0.5">WebGL Conformer Viewer</div>
          </div>
          <div className="glass-panel p-4 rounded-xl text-center border-cyan-500/20">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">Lipinski</div>
            <div className="text-xs text-slate-400 mt-0.5">Rule of 5 & ADMET QSAR</div>
          </div>
        </div>
      </div>

      {/* Molecule of the Day Card */}
      <div className="relative rounded-2xl overflow-hidden glass-panel border border-cyan-500/30 p-6 sm:p-8 bg-gradient-to-br from-[#0c1330]/90 via-[#070b1e]/90 to-[#120f2e]/90 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-violet-950/80 text-violet-300 border border-violet-500/40">
                <Calendar className="w-3.5 h-3.5" />
                <span>MOLECULE OF THE DAY</span>
              </span>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {moleculeOfTheDay.category}
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {moleculeOfTheDay.name}
              </h2>
              {moleculeOfTheDay.iupacName && (
                <p className="text-xs font-mono text-cyan-400 mt-1 line-clamp-1">
                  IUPAC: {moleculeOfTheDay.iupacName}
                </p>
              )}
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {moleculeOfTheDay.description}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-mono text-slate-400">SMILES:</span>
              <code className="text-xs font-mono bg-slate-900/90 text-cyan-300 px-2.5 py-1 rounded border border-cyan-500/20 max-w-full overflow-x-auto">
                {moleculeOfTheDay.smiles}
              </code>
            </div>

            <div className="pt-2 flex items-center space-x-3">
              <button
                onClick={() => onAnalyzeSmiles(moleculeOfTheDay.smiles, moleculeOfTheDay.name)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
              >
                <FlaskConical className="w-4 h-4" />
                <span>Inspect in Analyzer</span>
              </button>
            </div>
          </div>

          {/* 2D Preview Box */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="relative rounded-xl border border-cyan-500/30 overflow-hidden bg-slate-950/80 shadow-inner">
              <Molecular2DViewer
                smiles={moleculeOfTheDay.smiles}
                name={moleculeOfTheDay.name}
                showControls={false}
                className="h-64"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono text-cyan-400 border border-slate-800">
                CID: {moleculeOfTheDay.cid || 'NCBI Verified'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Analyzed Molecules */}
      {recentMolecules.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-slate-100">Recently Analyzed Molecules</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {recentMolecules.length} compound{recentMolecules.length > 1 ? 's' : ''} in session
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentMolecules.slice(0, 4).map((mol) => (
              <div
                key={mol.id}
                onClick={() => onAnalyzeSmiles(mol.smiles, mol.name)}
                className="glass-panel glass-card-interactive p-4 rounded-xl border-cyan-500/20 cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-300 truncate max-w-[140px]">
                    {mol.name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {mol.formula}
                  </span>
                </div>

                <div className="h-28 rounded-lg overflow-hidden bg-slate-950/60 border border-slate-800/80">
                  <Molecular2DViewer smiles={mol.smiles} name={mol.name} showControls={false} />
                </div>

                <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                  <div>
                    <span className="text-slate-500 block">MW</span>
                    <span className="text-slate-200">{mol.molecularWeight}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">LogP</span>
                    <span className="text-slate-200">{mol.logP}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Ro5</span>
                    <span
                      className={
                        mol.drugLikeness.lipinskiPassed ? 'text-emerald-400' : 'text-amber-400'
                      }
                    >
                      {mol.drugLikeness.lipinskiPassed ? 'Pass' : 'Violates'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Overview Grid */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Cheminformatics Capabilities
          </h3>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Comprehensive suite of scientific tools built for computational chemists, medicinal
            chemists, and researchers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div
            onClick={() => onNavigate('analyzer')}
            className="glass-panel glass-card-interactive p-6 rounded-2xl border-cyan-500/20 cursor-pointer space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Molecular Analyzer</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Parse SMILES notation, compute IUPAC formulas, molecular weight, H-donors, acceptors,
                TPSA, and 2D topology with error feedback.
              </p>
            </div>
            <div className="text-xs font-mono text-cyan-400 flex items-center space-x-1 pt-2">
              <span>Open Analyzer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 2 */}
          <div
            onClick={() => onNavigate('analyzer')}
            className="glass-panel glass-card-interactive p-6 rounded-2xl border-cyan-500/20 cursor-pointer space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">3D Conformer Studio</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Inspect 3D coordinates in Ball & Stick, Stick, Space-Filling VDW, and Wireframe with
                real-time rotation, zoom, and atom coordinate probing.
              </p>
            </div>
            <div className="text-xs font-mono text-violet-400 flex items-center space-x-1 pt-2">
              <span>Explore 3D Viewer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 3 */}
          <div
            onClick={() => onNavigate('compare')}
            className="glass-panel glass-card-interactive p-6 rounded-2xl border-cyan-500/20 cursor-pointer space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <GitCompare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Molecular Comparison</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Compare two compounds side-by-side. Calculate ECFP-4 Morgan fingerprint Tanimoto
                similarity and examine descriptor differential tables.
              </p>
            </div>
            <div className="text-xs font-mono text-sky-400 flex items-center space-x-1 pt-2">
              <span>Start Comparison</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 4 */}
          <div
            onClick={() => onNavigate('batch')}
            className="glass-panel glass-card-interactive p-6 rounded-2xl border-cyan-500/20 cursor-pointer space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Batch Screening</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Screen chemical libraries via multi-SMILES paste or CSV upload. Filter compounds by
                molecular weight, LogP, and export CSV reports.
              </p>
            </div>
            <div className="text-xs font-mono text-emerald-400 flex items-center space-x-1 pt-2">
              <span>Screen Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 5 */}
          <div
            onClick={() => onNavigate('analyzer')}
            className="glass-panel glass-card-interactive p-6 rounded-2xl border-cyan-500/20 cursor-pointer space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Drug-Likeness & ADMET</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Lipinski Rule of Five, Veber filter, Ghose filter, Blood-Brain Barrier (logBB) and
                bioavailability scoring with validated scientific models.
              </p>
            </div>
            <div className="text-xs font-mono text-amber-400 flex items-center space-x-1 pt-2">
              <span>Check Bioavailability</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 6 */}
          <div
            onClick={() => onNavigate('vault')}
            className="glass-panel glass-card-interactive p-6 rounded-2xl border-cyan-500/20 cursor-pointer space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.2)]">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Chemical Vault</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Save candidate molecules into personal persistent storage with custom notes, tags,
                quick search, and JSON export/import.
              </p>
            </div>
            <div className="text-xs font-mono text-fuchsia-400 flex items-center space-x-1 pt-2">
              <span>View Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
