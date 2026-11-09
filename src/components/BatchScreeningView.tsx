import React, { useState, useMemo } from 'react';
import {
  Layers,
  Upload,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';
import { MoleculeData, BatchItem } from '../types/chemistry';
import { validateSmiles, analyzeSmiles } from '../utils/cheminformatics';
import { CURATED_LIBRARY } from '../utils/chemicalLibrary';

interface BatchScreeningViewProps {
  onInspectMolecule: (mol: MoleculeData) => void;
}

export const BatchScreeningView: React.FC<BatchScreeningViewProps> = ({
  onInspectMolecule,
}) => {
  const [inputText, setInputText] = useState<string>(
    CURATED_LIBRARY.slice(0, 8)
      .map((c) => `${c.name}, ${c.smiles}`)
      .join('\n')
  );
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [mwMax, setMwMax] = useState<number>(600);
  const [logPMax, setLogPMax] = useState<number>(5.5);
  const [tpsaMax, setTpsaMax] = useState<number>(150);
  const [lipinskiFilter, setLipinskiFilter] = useState<'all' | 'pass' | 'fail'>('all');

  // Sorting
  const [sortField, setSortField] = useState<keyof MoleculeData>('molecularWeight');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleStartScreening = async () => {
    const lines = inputText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    const batchList: BatchItem[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let name: string | undefined;
      let smiles = line;

      // Check if comma or tab separated (e.g. "Aspirin, CC(=O)Oc1ccccc1C(=O)O")
      if (line.includes(',')) {
        const parts = line.split(',');
        name = parts[0].trim();
        smiles = parts.slice(1).join(',').trim();
      } else if (line.includes('\t')) {
        const parts = line.split('\t');
        name = parts[0].trim();
        smiles = parts[1].trim();
      }

      const id = `batch-${i + 1}`;
      const validation = validateSmiles(smiles);

      if (!validation.valid) {
        batchList.push({
          id,
          input: smiles,
          name: name || `Compound #${i + 1}`,
          status: 'error',
          errorMessage: validation.error || 'Invalid SMILES',
        });
      } else {
        try {
          const mol = analyzeSmiles(smiles, name);
          batchList.push({
            id,
            input: smiles,
            name: mol.name,
            status: 'success',
            data: mol,
          });
        } catch (err: any) {
          batchList.push({
            id,
            input: smiles,
            name: name || `Compound #${i + 1}`,
            status: 'error',
            errorMessage: err.message,
          });
        }
      }

      setProgress(Math.round(((i + 1) / lines.length) * 100));
    }

    setItems(batchList);
    setIsProcessing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setInputText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSampleLibrary = () => {
    const sample = CURATED_LIBRARY.map((c) => `${c.name}, ${c.smiles}`).join('\n');
    setInputText(sample);
  };

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (item.status === 'error') {
          return searchQuery === '' || item.name?.toLowerCase().includes(searchQuery.toLowerCase());
        }

        const mol = item.data;
        if (!mol) return false;

        // Search text
        if (
          searchQuery &&
          !mol.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !mol.formula.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !mol.smiles.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        // Numeric threshold filters
        if (mol.molecularWeight > mwMax) return false;
        if (mol.logP > logPMax) return false;
        if (mol.tpsa > tpsaMax) return false;

        // Lipinski filter
        if (lipinskiFilter === 'pass' && !mol.drugLikeness.lipinskiPassed) return false;
        if (lipinskiFilter === 'fail' && mol.drugLikeness.lipinskiPassed) return false;

        return true;
      })
      .sort((a, b) => {
        if (!a.data || !b.data) return 0;
        const valA = a.data[sortField];
        const valB = b.data[sortField];

        if (valA === undefined || valB === undefined) return 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [items, searchQuery, mwMax, logPMax, tpsaMax, lipinskiFilter, sortField, sortAsc]);

  const handleSort = (field: keyof MoleculeData) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleExportCsv = () => {
    if (items.length === 0) return;

    const headers = [
      'Name',
      'SMILES',
      'Status',
      'Formula',
      'MolecularWeight',
      'LogP',
      'TPSA',
      'HBondDonors',
      'HBondAcceptors',
      'RotatableBonds',
      'RingCount',
      'LipinskiPassed',
      'RuleOfFiveViolations',
      'ErrorMessage',
    ];

    const rows = items.map((item) => {
      if (item.status === 'success' && item.data) {
        const d = item.data;
        return [
          `"${d.name.replace(/"/g, '""')}"`,
          `"${d.smiles.replace(/"/g, '""')}"`,
          'Success',
          d.formula,
          d.molecularWeight,
          d.logP,
          d.tpsa,
          d.hBondDonors,
          d.hBondAcceptors,
          d.rotatableBonds,
          d.ringCount,
          d.drugLikeness.lipinskiPassed ? 'TRUE' : 'FALSE',
          d.drugLikeness.ruleOfFiveViolations,
          '',
        ].join(',');
      } else {
        return [
          `"${(item.name || '').replace(/"/g, '""')}"`,
          `"${item.input.replace(/"/g, '""')}"`,
          'Error',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          `"${(item.errorMessage || '').replace(/"/g, '""')}"`,
        ].join(',');
      }
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `molecular_x_screening_results_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Counts
  const totalCount = items.length;
  const validCount = items.filter((i) => i.status === 'success').length;
  const invalidCount = items.filter((i) => i.status === 'error').length;
  const lipinskiPassCount = items.filter(
    (i) => i.status === 'success' && i.data?.drugLikeness.lipinskiPassed
  ).length;

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
              High-Throughput Batch Screening
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Analyze, filter, and screen compound libraries in parallel with real-time property
            matrices.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCsv}
            disabled={items.length === 0}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-medium bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Input & Upload Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="batch-smiles-input" className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
              Paste SMILES Strings (One per line, optional "Name, SMILES")
            </label>
            <button
              onClick={handleLoadSampleLibrary}
              className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Load 20 Drug Library</span>
            </button>
          </div>

          <textarea
            id="batch-smiles-input"
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Aspirin, CC(=O)Oc1ccccc1C(=O)O&#10;Caffeine, CN1C=NC2=C1C(=O)N(C(=O)N2C)C"
            className="w-full bg-[#070b1e] text-cyan-200 text-xs font-mono p-3 rounded-xl border border-slate-700 focus:border-cyan-400 outline-none resize-y"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition-all">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload CSV / TXT</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setInputText('')}
                className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            </div>

            <button
              onClick={handleStartScreening}
              disabled={isProcessing}
              className="flex items-center space-x-2 px-6 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all active:scale-95 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isProcessing ? `Processing (${progress}%)` : 'Run Batch Screening'}</span>
            </button>
          </div>
        </div>

        {/* Screening Metrics / Summary Box */}
        <div className="glass-panel p-5 rounded-2xl border-cyan-500/20 flex flex-col justify-between space-y-4">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
            Screening Pipeline Summary
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Total Inputs</span>
              <span className="text-xl font-bold text-white">{totalCount}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Valid Structures</span>
              <span className="text-xl font-bold text-emerald-400">{validCount}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Syntax Errors</span>
              <span className="text-xl font-bold text-rose-400">{invalidCount}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Lipinski Passed</span>
              <span className="text-xl font-bold text-cyan-400">{lipinskiPassCount}</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 font-mono">
            All screening runs calculate Hill molecular formula, Crippen LogP, Ertl TPSA, and
            Lipinski Rule of 5 descriptors.
          </p>
        </div>
      </div>

      {/* Filter and Query Bar */}
      {items.length > 0 && (
        <div className="glass-panel p-4 rounded-2xl border-cyan-500/20 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, formula..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 text-xs text-slate-200 pl-8 pr-3 py-2 rounded-lg border border-slate-800 focus:border-cyan-400 outline-none"
              />
            </div>

            {/* MW Filter */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>MW Max:</span>
                <span className="text-cyan-300 font-bold">{mwMax} Da</span>
              </div>
              <input
                type="range"
                min="100"
                max="900"
                step="25"
                value={mwMax}
                onChange={(e) => setMwMax(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* LogP Filter */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>LogP Max:</span>
                <span className="text-violet-300 font-bold">{logPMax}</span>
              </div>
              <input
                type="range"
                min="-2"
                max="8"
                step="0.5"
                value={logPMax}
                onChange={(e) => setLogPMax(Number(e.target.value))}
                className="w-full accent-violet-400"
              />
            </div>

            {/* TPSA Filter */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>TPSA Max:</span>
                <span className="text-sky-300 font-bold">{tpsaMax} Å²</span>
              </div>
              <input
                type="range"
                min="20"
                max="250"
                step="10"
                value={tpsaMax}
                onChange={(e) => setTpsaMax(Number(e.target.value))}
                className="w-full accent-sky-400"
              />
            </div>

            {/* Lipinski Filter */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
              <button
                onClick={() => setLipinskiFilter('all')}
                className={`flex-1 py-1 rounded text-center transition-all ${
                  lipinskiFilter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setLipinskiFilter('pass')}
                className={`flex-1 py-1 rounded text-center transition-all ${
                  lipinskiFilter === 'pass'
                    ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pass
              </button>
              <button
                onClick={() => setLipinskiFilter('fail')}
                className={`flex-1 py-1 rounded text-center transition-all ${
                  lipinskiFilter === 'fail'
                    ? 'bg-rose-950 text-rose-300 font-bold border border-rose-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Violate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screened Compounds Table */}
      {items.length > 0 && (
        <div className="glass-panel rounded-2xl border-cyan-500/20 overflow-hidden shadow-xl">
          <div className="px-6 py-3.5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Screening Results Matrix ({filteredItems.length} of {items.length} Compounds)
            </span>
            <span className="text-[11px] font-mono text-slate-400">Click column headers to sort</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Compound</th>
                  <th className="py-3 px-4 font-semibold">Formula</th>
                  <th
                    onClick={() => handleSort('molecularWeight')}
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-cyan-300"
                  >
                    <div className="flex items-center space-x-1">
                      <span>MW</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('logP')}
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-cyan-300"
                  >
                    <div className="flex items-center space-x-1">
                      <span>LogP</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('tpsa')}
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-cyan-300"
                  >
                    <div className="flex items-center space-x-1">
                      <span>TPSA</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold">HBD / HBA</th>
                  <th className="py-3 px-4 font-semibold">RotB</th>
                  <th className="py-3 px-4 font-semibold">Rings</th>
                  <th className="py-3 px-4 font-semibold">Lipinski Ro5</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredItems.map((item) => {
                  if (item.status === 'error') {
                    return (
                      <tr key={item.id} className="bg-rose-950/20 hover:bg-rose-950/30">
                        <td className="py-3 px-4 text-rose-300 font-bold">{item.name}</td>
                        <td colSpan={8} className="py-3 px-4 text-rose-400 text-[11px]">
                          Error: {item.errorMessage} (SMILES: {item.input})
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-500/40">
                            Invalid
                          </span>
                        </td>
                      </tr>
                    );
                  }

                  const mol = item.data!;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-200">{mol.name}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[160px]">
                          {mol.smiles}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-cyan-300">{mol.formula}</td>
                      <td className="py-3 px-4 text-slate-200">{mol.molecularWeight}</td>
                      <td className="py-3 px-4 text-violet-300">{mol.logP}</td>
                      <td className="py-3 px-4 text-sky-300">{mol.tpsa}</td>
                      <td className="py-3 px-4 text-slate-300">
                        {mol.hBondDonors} / {mol.hBondAcceptors}
                      </td>
                      <td className="py-3 px-4 text-amber-300">{mol.rotatableBonds}</td>
                      <td className="py-3 px-4 text-slate-300">
                        {mol.ringCount} ({mol.aromaticRingCount} Ar)
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            mol.drugLikeness.lipinskiPassed
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {mol.drugLikeness.lipinskiPassed
                            ? 'PASS'
                            : `FAIL (${mol.drugLikeness.ruleOfFiveViolations})`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onInspectMolecule(mol)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono inline-flex items-center space-x-1"
                        >
                          <span>Inspect</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
