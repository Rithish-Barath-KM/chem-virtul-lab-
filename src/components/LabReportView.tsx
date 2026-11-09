import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  User,
  ShieldCheck,
  ShieldAlert,
  Check,
  Share2,
} from 'lucide-react';
import { MoleculeData } from '../types/chemistry';
import { Molecular2DViewer } from './Molecular2DViewer';
import { CURATED_LIBRARY } from '../utils/chemicalLibrary';
import { analyzeSmiles } from '../utils/cheminformatics';

interface LabReportViewProps {
  molecule: MoleculeData | null;
  onSelectMolecule: (mol: MoleculeData) => void;
}

export const LabReportView: React.FC<LabReportViewProps> = ({
  molecule,
  onSelectMolecule,
}) => {
  const current = molecule || analyzeSmiles('CC(=O)Oc1ccccc1C(=O)O', 'Aspirin');

  const [analystName, setAnalystName] = useState('Computational Chemist');
  const [labNotes, setLabNotes] = useState(
    'Compound evaluated for drug-like properties according to Lipinski Rule of Five and Veber criteria. Topological polar surface area and partition coefficient indicate favorable oral bioavailability.'
  );

  const reportId = `MX-LAB-${new Date().getFullYear()}-${Math.floor(Math.random() * 89999 + 10000)}`;
  const analysisDate = new Date(current.analyzedAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const headers = ['Property', 'Value', 'Unit/Method'];
    const rows = [
      ['Report ID', reportId, ''],
      ['Compound Name', current.name, ''],
      ['SMILES', current.smiles, ''],
      ['Formula', current.formula, 'Hill System'],
      ['Molecular Weight', current.molecularWeight, 'g/mol'],
      ['LogP', current.logP, 'Crippen Model'],
      ['TPSA', current.tpsa, 'Å² (Ertl Method)'],
      ['H-Bond Donors', current.hBondDonors, 'Lipinski'],
      ['H-Bond Acceptors', current.hBondAcceptors, 'Lipinski'],
      ['Rotatable Bonds', current.rotatableBonds, 'Veber'],
      ['Ring Count', current.ringCount, ''],
      ['Aromatic Rings', current.aromaticRingCount, ''],
      ['Lipinski Violations', current.drugLikeness.ruleOfFiveViolations, ''],
      ['Lipinski Status', current.drugLikeness.lipinskiPassed ? 'PASSED' : 'VIOLATES', ''],
      ['Analyst', analystName, ''],
      ['Date', analysisDate, ''],
    ];

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${current.name.toLowerCase().replace(/\s+/g, '_')}_lab_report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(
      {
        reportId,
        date: analysisDate,
        analyst: analystName,
        compound: current,
        remarks: labNotes,
      },
      null,
      2
    );
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${current.name.toLowerCase().replace(/\s+/g, '_')}_report.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Action Toolbar (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
              Scientific Lab Report Generator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Export certified computational chemistry lab reports in printable PDF, CSV, and JSON
            formats.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={current.name}
            onChange={(e) => {
              const found = CURATED_LIBRARY.find((c) => c.name === e.target.value);
              if (found) {
                onSelectMolecule(analyzeSmiles(found.smiles, found.name));
              }
            }}
            className="bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 rounded-lg px-2.5 py-2"
          >
            {CURATED_LIBRARY.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleDownloadCsv}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-mono bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 transition-all"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-mono bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 transition-all"
            title="Download JSON"
          >
            <Download className="w-3.5 h-3.5 text-violet-400" />
            <span>JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div
        id="printable-lab-report"
        className="glass-panel rounded-3xl border border-cyan-500/30 p-8 sm:p-12 bg-[#090e24]/95 text-slate-100 shadow-2xl space-y-8 print:bg-white print:text-black print:border-none print:shadow-none print:p-0"
      >
        {/* Document Header */}
        <div className="border-b-2 border-cyan-500/30 print:border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent print:text-slate-900 print:bg-none">
                MOLECULAR X LABORATORIES
              </span>
            </div>
            <p className="text-[11px] font-mono text-cyan-400 print:text-slate-600 uppercase tracking-widest mt-0.5">
              Cheminformatics & In Silico Molecular Characterization
            </p>
          </div>

          <div className="text-right font-mono text-xs text-slate-400 print:text-slate-700 space-y-0.5">
            <div>
              Reference ID: <strong className="text-cyan-300 print:text-black">{reportId}</strong>
            </div>
            <div>
              Date Issued: <span className="text-slate-200 print:text-black">{analysisDate}</span>
            </div>
          </div>
        </div>

        {/* Compound Identification */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            <div>
              <span className="text-xs font-mono text-cyan-400 print:text-slate-600 uppercase tracking-wider block">
                Target Compound Identification
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white print:text-black mt-1">
                {current.name}
              </h2>
              {current.iupacName && (
                <p className="text-xs font-mono text-slate-400 print:text-slate-700 mt-1">
                  IUPAC: {current.iupacName}
                </p>
              )}
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="text-xs font-mono text-slate-400 print:text-slate-600">
                SMILES Canonical Representation:
              </div>
              <code className="text-xs font-mono bg-slate-950/80 print:bg-slate-100 print:text-black text-cyan-300 px-3 py-1.5 rounded-lg border border-cyan-500/20 print:border-slate-300 block overflow-x-auto">
                {current.smiles}
              </code>
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-mono pt-2">
              <div>
                <span className="text-slate-400 print:text-slate-600 block">Molecular Formula</span>
                <span className="text-base font-bold text-white print:text-black">
                  {current.formula}
                </span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600 block">Molecular Weight</span>
                <span className="text-base font-bold text-cyan-300 print:text-black">
                  {current.molecularWeight} g/mol
                </span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600 block">Lipinski Status</span>
                <span
                  className={`text-base font-bold ${
                    current.drugLikeness.lipinskiPassed
                      ? 'text-emerald-400 print:text-green-700'
                      : 'text-amber-400 print:text-amber-700'
                  }`}
                >
                  {current.drugLikeness.lipinskiPassed ? 'Compliant' : 'Non-Compliant'}
                </span>
              </div>
            </div>
          </div>

          {/* 2D Structure Rendering Box */}
          <div className="rounded-2xl border border-cyan-500/20 print:border-slate-300 overflow-hidden bg-slate-950/80 print:bg-white h-56 flex items-center justify-center p-2">
            <Molecular2DViewer
              smiles={current.smiles}
              name={current.name}
              showControls={false}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Descriptors Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold text-cyan-400 print:text-slate-800 uppercase tracking-wider">
            Computed Physicochemical Descriptors
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border border-slate-800 print:border-slate-300">
              <thead className="bg-slate-950 print:bg-slate-100 text-slate-300 print:text-slate-800">
                <tr>
                  <th className="py-2.5 px-4 border-b border-slate-800 print:border-slate-300">
                    Descriptor
                  </th>
                  <th className="py-2.5 px-4 border-b border-slate-800 print:border-slate-300">
                    Value
                  </th>
                  <th className="py-2.5 px-4 border-b border-slate-800 print:border-slate-300">
                    Lipinski / Standard Target
                  </th>
                  <th className="py-2.5 px-4 border-b border-slate-800 print:border-slate-300 text-right">
                    Evaluation
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                <tr>
                  <td className="py-2.5 px-4">Molecular Weight (MW)</td>
                  <td className="py-2.5 px-4 font-bold">{current.molecularWeight} g/mol</td>
                  <td className="py-2.5 px-4 text-slate-400 print:text-slate-600">≤ 500 Da</td>
                  <td className="py-2.5 px-4 text-right">
                    {current.molecularWeight <= 500 ? 'Passed' : 'Violates'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4">Octanol-Water Partition (LogP)</td>
                  <td className="py-2.5 px-4 font-bold">{current.logP}</td>
                  <td className="py-2.5 px-4 text-slate-400 print:text-slate-600">≤ 5.0</td>
                  <td className="py-2.5 px-4 text-right">
                    {current.logP <= 5.0 ? 'Passed' : 'Violates'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4">Topological Polar Surface Area (TPSA)</td>
                  <td className="py-2.5 px-4 font-bold">{current.tpsa} Å²</td>
                  <td className="py-2.5 px-4 text-slate-400 print:text-slate-600">≤ 140 Å² (Veber)</td>
                  <td className="py-2.5 px-4 text-right">
                    {current.tpsa <= 140 ? 'Passed' : 'Violates'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4">Hydrogen Bond Donors (HBD)</td>
                  <td className="py-2.5 px-4 font-bold">{current.hBondDonors}</td>
                  <td className="py-2.5 px-4 text-slate-400 print:text-slate-600">≤ 5</td>
                  <td className="py-2.5 px-4 text-right">
                    {current.hBondDonors <= 5 ? 'Passed' : 'Violates'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4">Hydrogen Bond Acceptors (HBA)</td>
                  <td className="py-2.5 px-4 font-bold">{current.hBondAcceptors}</td>
                  <td className="py-2.5 px-4 text-slate-400 print:text-slate-600">≤ 10</td>
                  <td className="py-2.5 px-4 text-right">
                    {current.hBondAcceptors <= 10 ? 'Passed' : 'Violates'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4">Rotatable Bonds</td>
                  <td className="py-2.5 px-4 font-bold">{current.rotatableBonds}</td>
                  <td className="py-2.5 px-4 text-slate-400 print:text-slate-600">≤ 10 (Veber)</td>
                  <td className="py-2.5 px-4 text-right">
                    {current.rotatableBonds <= 10 ? 'Passed' : 'Violates'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4">Total Ring Systems</td>
                  <td className="py-2.5 px-4 font-bold">
                    {current.ringCount} ({current.aromaticRingCount} Aromatic)
                  </td>
                  <td className="py-2.5 px-4 text-slate-400 print:text-slate-600">—</td>
                  <td className="py-2.5 px-4 text-right">Valid</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* In Silico ADMET Predictions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-violet-400 print:text-slate-800 uppercase tracking-wider">
              In Silico ADMET Profiling
            </h3>
            <span className="text-[10px] font-mono text-slate-500 italic">
              Computational QSAR Models
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-900/60 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <span className="text-slate-400 print:text-slate-600 block text-[10px]">
                BBB Permeation
              </span>
              <span className="text-sm font-bold text-white print:text-black">
                {current.admet.bbbPermeation.category}
              </span>
              <span className="text-[10px] text-slate-500 block">
                logBB: {current.admet.bbbPermeation.logBB}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <span className="text-slate-400 print:text-slate-600 block text-[10px]">
                Intestinal Absorption
              </span>
              <span className="text-sm font-bold text-emerald-400 print:text-black">
                {current.admet.humanIntestinalAbsorption.percentage}%
              </span>
              <span className="text-[10px] text-slate-500 block">
                {current.admet.humanIntestinalAbsorption.category}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <span className="text-slate-400 print:text-slate-600 block text-[10px]">
                P-gp Efflux Risk
              </span>
              <span className="text-sm font-bold text-amber-400 print:text-black">
                {current.admet.pGpSubstrateRisk.risk}
              </span>
              <span className="text-[10px] text-slate-500 block">Substrate likelihood</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <span className="text-slate-400 print:text-slate-600 block text-[10px]">
                Synthetic Accessibility
              </span>
              <span className="text-sm font-bold text-cyan-300 print:text-black">
                {current.admet.syntheticAccessibilityScore.score} / 10
              </span>
              <span className="text-[10px] text-slate-500 block">
                {current.admet.syntheticAccessibilityScore.category}
              </span>
            </div>
          </div>
        </div>

        {/* Analyst Remarks and Sign-off */}
        <div className="space-y-4 pt-4 border-t border-slate-800 print:border-slate-300">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-cyan-400 print:text-slate-800 uppercase tracking-wider block">
              Analyst Remarks & Scientific Summary
            </label>
            <textarea
              rows={3}
              value={labNotes}
              onChange={(e) => setLabNotes(e.target.value)}
              className="w-full bg-slate-950/80 print:bg-transparent print:border-none print:p-0 text-slate-300 print:text-black text-xs p-3 rounded-xl border border-slate-800 outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800/60 print:border-slate-300 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-slate-400 print:text-black" />
              <span className="text-slate-400 print:text-slate-700">Analyst:</span>
              <input
                type="text"
                value={analystName}
                onChange={(e) => setAnalystName(e.target.value)}
                className="bg-slate-900 print:bg-transparent text-slate-200 print:text-black px-2 py-1 rounded border border-slate-700 print:border-none font-bold outline-none"
              />
            </div>

            <div className="text-right text-slate-500 print:text-slate-600 text-[11px]">
              Certified Digital Lab Report • Molecular X Cheminformatics v2.4
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
