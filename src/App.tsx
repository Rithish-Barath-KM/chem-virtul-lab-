import React, { useState, useEffect } from 'react';
import { Navbar, NavigationTab } from './components/Navbar';
import { MolecularBackground } from './components/MolecularBackground';
import { HomeView } from './components/HomeView';
import { AnalyzerView } from './components/AnalyzerView';
import { CompareView } from './components/CompareView';
import { BatchScreeningView } from './components/BatchScreeningView';
import { LabReportView } from './components/LabReportView';
import { ChemicalVaultView } from './components/ChemicalVaultView';
import { DocumentationView } from './components/DocumentationView';
import { MoleculeData, SavedMolecule } from './types/chemistry';
import { analyzeSmiles } from './utils/cheminformatics';
import { CURATED_LIBRARY, getRandomCompound } from './utils/chemicalLibrary';

const VAULT_STORAGE_KEY = 'molecular_x_vault_v1';
const HISTORY_STORAGE_KEY = 'molecular_x_history_v1';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [currentMolecule, setCurrentMolecule] = useState<MoleculeData | null>(null);
  const [compareTargetA, setCompareTargetA] = useState<MoleculeData | null>(null);
  const [compareTargetB, setCompareTargetB] = useState<MoleculeData | null>(null);
  const [recentMolecules, setRecentMolecules] = useState<MoleculeData[]>([]);
  const [vault, setVault] = useState<SavedMolecule[]>([]);

  // Initialize vault and default molecule
  useEffect(() => {
    // Initial default molecule: Aspirin
    const aspirin = analyzeSmiles('CC(=O)Oc1ccccc1C(=O)O', 'Aspirin (Acetylsalicylic Acid)');
    setCurrentMolecule(aspirin);

    // Load recent history
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setRecentMolecules(JSON.parse(storedHistory));
      } else {
        // Pre-populate with Aspirin and Paracetamol
        const paracetamol = analyzeSmiles('CC(=O)Nc1ccc(O)cc1', 'Paracetamol');
        setRecentMolecules([aspirin, paracetamol]);
      }
    } catch {
      // Fallback
    }

    // Load vault
    try {
      const storedVault = localStorage.getItem(VAULT_STORAGE_KEY);
      if (storedVault) {
        setVault(JSON.parse(storedVault));
      } else {
        // Initial seed vault
        const initialSeed: SavedMolecule[] = [
          {
            ...aspirin,
            tags: ['Analgesic', 'NSAID', 'Lead'],
            notes: 'Prototypical anti-inflammatory; inhibits COX-1 & COX-2 irreversibly.',
            savedAt: new Date().toISOString(),
          },
          {
            ...analyzeSmiles('CN1C=NC2=C1C(=O)N(C(=O)N2C)C', 'Caffeine'),
            tags: ['Alkaloid', 'CNS Stimulant'],
            notes: 'Adenosine receptor antagonist (A1 and A2A).',
            savedAt: new Date().toISOString(),
          },
          {
            ...analyzeSmiles('CC(=O)Nc1ccc(O)cc1', 'Paracetamol'),
            tags: ['Analgesic', 'Antipyretic'],
            notes: 'Central pain relief without significant peripheral COX inhibition.',
            savedAt: new Date().toISOString(),
          },
        ];
        setVault(initialSeed);
        localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(initialSeed));
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  // Save vault to localStorage whenever it changes
  const saveVaultState = (newVault: SavedMolecule[]) => {
    setVault(newVault);
    try {
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(newVault));
    } catch (err) {
      console.warn('Failed to persist vault to localStorage:', err);
    }
  };

  const handleSetCurrentMolecule = (mol: MoleculeData) => {
    setCurrentMolecule(mol);

    // Update recent history
    setRecentMolecules((prev) => {
      const filtered = prev.filter((m) => m.smiles !== mol.smiles);
      const updated = [mol, ...filtered].slice(0, 8);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleAnalyzeSmiles = (smiles: string, name?: string) => {
    try {
      const mol = analyzeSmiles(smiles, name);
      handleSetCurrentMolecule(mol);
      setCurrentTab('analyzer');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRandomMolecule = () => {
    const random = getRandomCompound();
    handleAnalyzeSmiles(random.smiles, random.name);
  };

  const handleSaveToVault = (mol: MoleculeData, tags: string[], notes: string) => {
    const saved: SavedMolecule = {
      ...mol,
      tags: tags.length > 0 ? tags : ['General'],
      notes: notes || '',
      savedAt: new Date().toISOString(),
    };

    const existingIdx = vault.findIndex((v) => v.smiles === mol.smiles);
    let updated: SavedMolecule[];
    if (existingIdx >= 0) {
      updated = [...vault];
      updated[existingIdx] = saved;
    } else {
      updated = [saved, ...vault];
    }

    saveVaultState(updated);
  };

  const handleDeleteFromVault = (id: string) => {
    const updated = vault.filter((v) => v.id !== id);
    saveVaultState(updated);
  };

  const handleImportVault = (items: SavedMolecule[]) => {
    saveVaultState(items);
  };

  const handleCompareWith = (mol: MoleculeData) => {
    setCompareTargetA(mol);
    // Set a complementary preset for B
    const other = CURATED_LIBRARY.find((c) => c.smiles !== mol.smiles) || CURATED_LIBRARY[1];
    setCompareTargetB(analyzeSmiles(other.smiles, other.name));
    setCurrentTab('compare');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#050814] text-slate-100 flex flex-col font-sans">
      {/* Animated Scientific Molecular Lattice Background */}
      <MolecularBackground />

      {/* Main Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onRandomMolecule={handleRandomMolecule}
        vaultCount={vault.length}
      />

      {/* Main Content Area based on Tab */}
      <main className="flex-1 w-full pb-16">
        {currentTab === 'home' && (
          <HomeView
            onNavigate={setCurrentTab}
            onAnalyzeSmiles={handleAnalyzeSmiles}
            onRandomMolecule={handleRandomMolecule}
            recentMolecules={recentMolecules}
          />
        )}

        {currentTab === 'analyzer' && (
          <AnalyzerView
            currentMolecule={currentMolecule}
            onSetCurrentMolecule={handleSetCurrentMolecule}
            onSaveToVault={handleSaveToVault}
            onNavigate={setCurrentTab}
            onCompareWith={handleCompareWith}
          />
        )}

        {currentTab === 'compare' && (
          <CompareView
            initialMoleculeA={compareTargetA || currentMolecule}
            initialMoleculeB={compareTargetB}
          />
        )}

        {currentTab === 'batch' && (
          <BatchScreeningView
            onInspectMolecule={(mol) => {
              handleSetCurrentMolecule(mol);
              setCurrentTab('analyzer');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'reports' && (
          <LabReportView
            molecule={currentMolecule}
            onSelectMolecule={handleSetCurrentMolecule}
          />
        )}

        {currentTab === 'vault' && (
          <ChemicalVaultView
            vault={vault}
            onDeleteMolecule={handleDeleteFromVault}
            onInspectMolecule={(mol) => {
              handleSetCurrentMolecule(mol);
              setCurrentTab('analyzer');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onCompareMolecule={handleCompareWith}
            onReportMolecule={(mol) => {
              handleSetCurrentMolecule(mol);
              setCurrentTab('reports');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onImportVault={handleImportVault}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'docs' && (
          <DocumentationView onAnalyzeExample={handleAnalyzeSmiles} />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cyan-500/15 bg-[#060919]/90 py-6 text-center text-xs font-mono text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-slate-400">
            <span className="text-cyan-400 font-bold">MOLECULAR X</span>
            <span>•</span>
            <span>Interactive Cheminformatics Laboratory</span>
          </div>
          <div>
            Built with Real Topological RDKit / PubChem Graph Algorithms & 3Dmol.js
          </div>
        </div>
      </footer>
    </div>
  );
}
