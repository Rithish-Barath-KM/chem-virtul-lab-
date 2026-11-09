import React, { useState, useMemo } from 'react';
import {
  Bookmark,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Download,
  Upload,
  FlaskConical,
  GitCompare,
  FileText,
  Tag,
  Plus,
} from 'lucide-react';
import { SavedMolecule, MoleculeData } from '../types/chemistry';
import { Molecular2DViewer } from './Molecular2DViewer';
import { NavigationTab } from './Navbar';

interface ChemicalVaultViewProps {
  vault: SavedMolecule[];
  onDeleteMolecule: (id: string) => void;
  onInspectMolecule: (mol: MoleculeData) => void;
  onCompareMolecule: (mol: MoleculeData) => void;
  onReportMolecule: (mol: MoleculeData) => void;
  onImportVault: (items: SavedMolecule[]) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const ChemicalVaultView: React.FC<ChemicalVaultViewProps> = ({
  vault,
  onDeleteMolecule,
  onInspectMolecule,
  onCompareMolecule,
  onReportMolecule,
  onImportVault,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortField, setSortField] = useState<'savedAt' | 'name' | 'molecularWeight' | 'logP'>('savedAt');
  const [sortAsc, setSortAsc] = useState(false);

  // Collect all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const item of vault) {
      for (const t of item.tags || []) {
        set.add(t);
      }
    }
    return Array.from(set);
  }, [vault]);

  // Filtered and sorted vault
  const filteredVault = useMemo(() => {
    return vault
      .filter((item) => {
        // Tag filter
        if (selectedTag !== 'all' && !item.tags?.includes(selectedTag)) {
          return false;
        }

        // Search text
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchSmiles = item.smiles.toLowerCase().includes(q);
          const matchFormula = item.formula.toLowerCase().includes(q);
          const matchNotes = item.notes?.toLowerCase().includes(q);
          const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));

          if (!matchName && !matchSmiles && !matchFormula && !matchNotes && !matchTags) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [vault, selectedTag, searchQuery, sortField, sortAsc]);

  const handleExportVault = () => {
    const dataStr = JSON.stringify(vault, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `molecular_x_vault_backup_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          onImportVault(json);
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Bookmark className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
              Chemical Vault
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personal persistent chemical repository for candidate leads, synthesis notes, and
            analyzed scaffolds.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-mono bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            onClick={handleExportVault}
            disabled={vault.length === 0}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-mono bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 disabled:opacity-40 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-violet-400" />
            <span>Export Backup</span>
          </button>

          <button
            onClick={() => onNavigate('analyzer')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Molecule</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border-cyan-500/20 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, SMILES, formula, note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 text-xs text-slate-200 pl-9 pr-3 py-2 rounded-xl border border-slate-700 focus:border-cyan-400 outline-none"
            />
          </div>

          {/* Sort Controls */}
          <div className="flex items-center space-x-2 self-start md:self-auto text-xs font-mono">
            <span className="text-slate-400">Sort by:</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-cyan-400 outline-none"
            >
              <option value="savedAt">Date Saved</option>
              <option value="name">Compound Name</option>
              <option value="molecularWeight">Molecular Weight</option>
              <option value="logP">LogP</option>
            </select>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
            >
              {sortAsc ? 'Asc ↑' : 'Desc ↓'}
            </button>
          </div>
        </div>

        {/* Tag Pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800">
            <span className="text-xs font-mono text-slate-400 mr-1 flex items-center space-x-1">
              <Tag className="w-3 h-3 text-cyan-400" />
              <span>Tags:</span>
            </span>
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono transition-all ${
                selectedTag === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All ({vault.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono transition-all ${
                  selectedTag === tag
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Vault Grid */}
      {filteredVault.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border-slate-800 text-center space-y-3">
          <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No molecules found in Vault</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Save candidates from the Molecular Analyzer to build your research library.
          </p>
          <button
            onClick={() => onNavigate('analyzer')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 mt-2"
          >
            Go to Molecular Analyzer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVault.map((mol) => (
            <div
              key={mol.id}
              className="glass-panel glass-card-interactive rounded-2xl border-cyan-500/20 p-5 flex flex-col justify-between space-y-4 shadow-lg group"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {mol.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        {mol.formula}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        • {mol.molecularWeight} g/mol
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      mol.drugLikeness.lipinskiPassed
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {mol.drugLikeness.lipinskiPassed ? 'Ro5 PASS' : 'Ro5 VIOLATES'}
                  </span>
                </div>

                {/* 2D Structure Preview */}
                <div className="h-44 rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800/80">
                  <Molecular2DViewer smiles={mol.smiles} name={mol.name} showControls={false} />
                </div>

                {/* SMILES code snippet */}
                <div className="text-[11px] font-mono text-slate-400 truncate bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800">
                  {mol.smiles}
                </div>

                {/* Notes and Tags */}
                {mol.notes && (
                  <p className="text-xs text-slate-300 italic line-clamp-2 bg-slate-900/40 p-2 rounded border border-slate-800/60">
                    "{mol.notes}"
                  </p>
                )}

                {mol.tags && mol.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {mol.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.2 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/20"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onInspectMolecule(mol)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
                    title="Inspect in Analyzer"
                    aria-label="Inspect in Analyzer"
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onCompareMolecule(mol)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-violet-300 transition-colors"
                    title="Compare Molecule"
                    aria-label="Compare Molecule"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onReportMolecule(mol)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Generate Lab Report"
                    aria-label="Generate Lab Report"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm(`Delete ${mol.name} from vault?`)) {
                      onDeleteMolecule(mol.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Delete from Vault"
                  aria-label="Delete from Vault"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
