import React from 'react';
import {
  BookOpen,
  Atom,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { CURATED_LIBRARY } from '../utils/chemicalLibrary';

interface DocumentationViewProps {
  onAnalyzeExample: (smiles: string, name?: string) => void;
}

export const DocumentationView: React.FC<DocumentationViewProps> = ({
  onAnalyzeExample,
}) => {
  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Title */}
      <div className="border-b border-cyan-500/20 pb-6">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
            Cheminformatics Reference & Documentation
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Theoretical foundations, SMILES syntax specifications, topological descriptor equations,
          and ADMET predictive methodologies implemented in Molecular X.
        </p>
      </div>

      {/* SMILES Notation Guide */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl border-cyan-500/20 space-y-6">
        <div className="flex items-center space-x-2 text-cyan-300">
          <Code2 className="w-5 h-5" />
          <h2 className="text-lg sm:text-xl font-bold font-mono uppercase tracking-wide">
            1. SMILES Grammar & Syntax Guide
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The <strong>Simplified Molecular Input Line Entry System (SMILES)</strong> represents chemical
          structures using linear ASCII strings based on depth-first traversal of molecular graphs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold block">Atoms & Hydrogens</span>
            <p className="text-slate-300">
              Organic subset elements (<code className="text-cyan-200">B, C, N, O, P, S, F, Cl, Br, I</code>) are written without brackets; their valences are filled with implicit hydrogens. All other atoms or charged species use brackets (<code className="text-cyan-200">[NH4+], [Fe+2]</code>).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-violet-400 font-bold block">Bonds & Connectivity</span>
            <p className="text-slate-300">
              Single bonds (<code className="text-violet-200">-</code>) are implicit between adjacent atoms. Double bonds use <code className="text-violet-200">=</code>, triple bonds use <code className="text-violet-200">#</code>, aromatic bonds use <code className="text-violet-200">:</code>, and disconnected components use <code className="text-violet-200">.</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-sky-400 font-bold block">Branching via Parentheses</span>
            <p className="text-slate-300">
              Substituents and branches are enclosed in parentheses: <code className="text-sky-200">CC(=O)O</code> represents acetic acid with a carbonyl branch off the alpha carbon.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold block">Ring Closures & Aromaticity</span>
            <p className="text-slate-300">
              Ring closures are marked by digits: <code className="text-emerald-200">c1ccccc1</code> for benzene. Lowercase atomic symbols (<code className="text-emerald-200">c, n, o, s</code>) indicate (4n+2) aromatic pi systems.
            </p>
          </div>
        </div>
      </section>

      {/* Physicochemical Descriptors */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl border-cyan-500/20 space-y-6">
        <div className="flex items-center space-x-2 text-violet-300">
          <Atom className="w-5 h-5" />
          <h2 className="text-lg sm:text-xl font-bold font-mono uppercase tracking-wide">
            2. Topological & Physicochemical Descriptors
          </h2>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white font-mono text-sm">
              Molecular Weight (MW) & Hill Formula
            </h3>
            <p className="text-slate-400 mt-1">
              Sum of IUPAC standard atomic weights (g/mol). Formulas follow the Hill convention:
              Carbon atoms first, Hydrogen second, followed by all remaining elements in alphabetical
              order.
            </p>
          </div>

          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white font-mono text-sm">
              Partition Coefficient (LogP - Crippen Fragment Method)
            </h3>
            <p className="text-slate-400 mt-1">
              Logarithm of the octanol/water partition coefficient, calculated via Wildman & Crippen
              atomic fragment contributions (J. Chem. Inf. Comput. Sci. 1999). Determines lipophilicity
              and passive bilayer permeability.
            </p>
          </div>

          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white font-mono text-sm">
              Topological Polar Surface Area (TPSA - Ertl Method)
            </h3>
            <p className="text-slate-400 mt-1">
              Sum of polar atom surface contributions (oxygen, nitrogen, and attached hydrogens) as
              defined by Peter Ertl et al. (J. Med. Chem. 2000). Highly predictive of cell membrane
              permeability and blood-brain barrier transport.
            </p>
          </div>

          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white font-mono text-sm">
              Hydrogen Bond Donors (HBD) & Acceptors (HBA)
            </h3>
            <p className="text-slate-400 mt-1">
              HBD corresponds to the count of heteroatoms with exchangeable polar hydrogens (-OH, -NH-).
              HBA corresponds to the total count of N and O atoms.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white font-mono text-sm">
              ECFP-4 Fingerprints & Tanimoto Similarity
            </h3>
            <p className="text-slate-400 mt-1">
              Extended Connectivity Fingerprints (ECFP) model circular atom environments up to radius 2.
              Pairwise structural similarity is quantified using the Tanimoto coefficient:
              <br />
              <code className="text-cyan-300 font-mono text-xs">T(A, B) = |A ∩ B| / |A ∪ B|</code>
            </p>
          </div>
        </div>
      </section>

      {/* Drug-Likeness & ADMET */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl border-cyan-500/20 space-y-6">
        <div className="flex items-center space-x-2 text-emerald-300">
          <ShieldCheck className="w-5 h-5" />
          <h2 className="text-lg sm:text-xl font-bold font-mono uppercase tracking-wide">
            3. Drug-Likeness & In Silico ADMET Models
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-emerald-400 font-bold block">Lipinski's Rule of Five</span>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>Molecular Weight ≤ 500 Da</li>
              <li>Calculated LogP ≤ 5.0</li>
              <li>Hydrogen Bond Donors ≤ 5</li>
              <li>Hydrogen Bond Acceptors ≤ 10</li>
            </ul>
            <p className="text-[11px] text-slate-400 pt-1">
              Compounds with ≤ 1 violation generally exhibit favorable oral bioavailability.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-amber-400 font-bold block">Veber's Bioavailability Filter</span>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>Rotatable Bonds ≤ 10</li>
              <li>Polar Surface Area (TPSA) ≤ 140 Å²</li>
            </ul>
            <p className="text-[11px] text-slate-400 pt-1">
              Restricts molecular flexibility and polar solvation barriers for intestinal transport.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="font-bold text-slate-200">Scientific Integrity & Verification:</div>
          <p>
            In accordance with computational chemistry best practices, all property calculations
            in Molecular X are calculated directly via verified topological graph algorithms and
            substructure traversal. Computational QSAR predictions (such as Blood-Brain Barrier
            logBB and HIA percentages) are explicitly designated as <em>in silico estimates</em> and
            should be experimentally verified in pharmacological assays.
          </p>
        </div>
      </section>

      {/* Quick Interactive Benchmark Library */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
          Quick-Launch Benchmark Molecules
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CURATED_LIBRARY.slice(0, 8).map((mol) => (
            <button
              key={mol.id}
              onClick={() => onAnalyzeExample(mol.smiles, mol.name)}
              className="glass-panel p-3 rounded-xl border-cyan-500/20 hover:border-cyan-400 text-left transition-all group"
            >
              <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 block truncate">
                {mol.name}
              </span>
              <span className="text-[10px] font-mono text-slate-400">{mol.category}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
