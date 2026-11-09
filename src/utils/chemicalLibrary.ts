export interface LibraryCompound {
  id: string;
  name: string;
  smiles: string;
  category: 'Analgesic' | 'Antibiotic' | 'Neurotransmitter' | 'Antineoplastic' | 'Cardiovascular' | 'Alkaloid' | 'Antiviral' | 'Natural Product';
  description: string;
  cid?: number;
  iupacName?: string;
  yearDiscovered?: number;
}

export const CURATED_LIBRARY: LibraryCompound[] = [
  {
    id: 'aspirin',
    name: 'Aspirin (Acetylsalicylic Acid)',
    smiles: 'CC(=O)Oc1ccccc1C(=O)O',
    category: 'Analgesic',
    description: 'Prototypical non-steroidal anti-inflammatory drug (NSAID) that irreversibly inhibits cyclooxygenase (COX-1/COX-2).',
    cid: 2244,
    iupacName: '2-acetyloxybenzoic acid',
    yearDiscovered: 1897,
  },
  {
    id: 'caffeine',
    name: 'Caffeine',
    smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
    category: 'Alkaloid',
    description: 'Central nervous system stimulant and non-selective adenosine receptor antagonist (A1 and A2A).',
    cid: 2519,
    iupacName: '1,3,7-trimethylpurine-2,6-dione',
    yearDiscovered: 1819,
  },
  {
    id: 'paracetamol',
    name: 'Paracetamol (Acetaminophen)',
    smiles: 'CC(=O)Nc1ccc(O)cc1',
    category: 'Analgesic',
    description: 'Widely used antipyretic and mild analgesic acting centrally on cannabinoid/vanilloid receptors and COX inhibition.',
    cid: 1983,
    iupacName: 'N-(4-hydroxyphenyl)acetamide',
    yearDiscovered: 1877,
  },
  {
    id: 'ibuprofen',
    name: 'Ibuprofen',
    smiles: 'CC(C)Cc1ccc(cc1)C(C)C(=O)O',
    category: 'Analgesic',
    description: 'Propionic acid derivative NSAID inhibiting prostaglandin synthesis via non-selective COX inhibition.',
    cid: 3672,
    iupacName: '2-[4-(2-methylpropyl)phenyl]propanoic acid',
    yearDiscovered: 1961,
  },
  {
    id: 'penicillin_g',
    name: 'Penicillin G (Benzylpenicillin)',
    smiles: 'CC1(C(N2C(S1)C(C2=O)NC(=O)Cc3ccccc3)C(=O)O)C',
    category: 'Antibiotic',
    description: 'Beta-lactam antibiotic that inhibits bacterial cell wall peptidoglycan synthesis via penicillin-binding proteins.',
    cid: 5904,
    iupacName: '(2S,5R,6R)-3,3-dimethyl-7-oxo-6-[(2-phenylacetyl)amino]-4-thia-1-azabicyclo[3.2.0]heptane-2-carboxylic acid',
    yearDiscovered: 1928,
  },
  {
    id: 'dopamine',
    name: 'Dopamine',
    smiles: 'c1cc(c(cc1CCN)O)O',
    category: 'Neurotransmitter',
    description: 'Endogenous catecholamine neurotransmitter modulating reward, motivation, motor control, and neuroendocrine pathways.',
    cid: 681,
    iupacName: '4-(2-aminoethyl)benzene-1,2-diol',
    yearDiscovered: 1910,
  },
  {
    id: 'serotonin',
    name: 'Serotonin (5-HT)',
    smiles: 'c1cc2c(cc1O)c(c[nH]2)CCN',
    category: 'Neurotransmitter',
    description: 'Monoamine neurotransmitter modulating mood, cognition, reward, learning, and physiological sleep-wake cycles.',
    cid: 5202,
    iupacName: '3-(2-aminoethyl)-1H-indol-5-ol',
    yearDiscovered: 1948,
  },
  {
    id: 'nicotine',
    name: 'Nicotine',
    smiles: 'CN1CCCC1c2cccnc2',
    category: 'Alkaloid',
    description: 'Potent parasympathomimetic alkaloid and selective agonist of neuronal nicotinic acetylcholine receptors (nAChRs).',
    cid: 89594,
    iupacName: '3-[(2S)-1-methylpyrrolidin-2-yl]pyridine',
    yearDiscovered: 1828,
  },
  {
    id: 'morphine',
    name: 'Morphine',
    smiles: 'CN1CCC23C4C1CC5=C2C(=C(C=C5)O)OC3C(C=C4)O',
    category: 'Analgesic',
    description: 'Archetypal opiate analgesic that acts directly on the central nervous system via mu-opioid receptor agonism.',
    cid: 5288826,
    iupacName: '(4R,4aR,7S,7aR,12bS)-3-methyl-2,4,4a,7,7a,13-hexahydro-1H-4,12-methano[1]benzofuro[3,2-e]isoquinoline-7,9-diol',
    yearDiscovered: 1804,
  },
  {
    id: 'metformin',
    name: 'Metformin',
    smiles: 'CN(C)C(=N)NC(=N)N',
    category: 'Cardiovascular',
    description: 'First-line biguanide antihyperglycemic medication for type 2 diabetes activating AMP-activated protein kinase (AMPK).',
    cid: 4091,
    iupacName: '3-(diaminomethylidene)-1,1-dimethylguanidine',
    yearDiscovered: 1922,
  },
  {
    id: 'atorvastatin',
    name: 'Atorvastatin',
    smiles: 'CC(C)c1c(c(c(n1CCC(CC(CC(=O)O)O)O)c2ccc(cc2)F)c3ccccc3)C(=O)Nc4ccccc4',
    category: 'Cardiovascular',
    description: 'Statin lipid-lowering medication that competitively inhibits HMG-CoA reductase, the rate-limiting enzyme in cholesterol synthesis.',
    cid: 60823,
    iupacName: '(3R,5R)-7-[2-(4-fluorophenyl)-3-phenyl-4-(phenylcarbamoyl)-5-propan-2-ylpyrrol-1-yl]-3,5-dihydroxyheptanoic acid',
    yearDiscovered: 1985,
  },
  {
    id: 'imatinib',
    name: 'Imatinib (Gleevec)',
    smiles: 'Cc1ccc(cc1Nc2nccc(n2)c3cccnc3)NC(=O)c4ccc(cc4)CN5CCN(CC5)C',
    category: 'Antineoplastic',
    description: 'Revolutionary targeted BCR-ABL tyrosine kinase inhibitor used in the treatment of chronic myelogenous leukemia (CML).',
    cid: 5291,
    iupacName: '4-[(4-methylpiperazin-1-yl)methyl]-N-[4-methyl-3-[(4-pyridin-3-ylpyrimidin-2-yl)amino]phenyl]benzamide',
    yearDiscovered: 1996,
  },
  {
    id: 'artemisinin',
    name: 'Artemisinin',
    smiles: 'CC1CCC2C(C(=O)OC3(C24C1CCC(O3)(OO4)C)C)C',
    category: 'Natural Product',
    description: 'Sesquiterpene lactone bearing an endoperoxide bridge, serving as the gold-standard frontline antimalarial medication.',
    cid: 68827,
    iupacName: '(1R,4S,5R,8S,9R,12S,13R)-1,5,9-trimethyl-11,14,15,16-tetraoxatetracyclo[10.3.1.0^{4,13}.0^{8,13}]hexadecan-10-one',
    yearDiscovered: 1972,
  },
  {
    id: 'resveratrol',
    name: 'Resveratrol',
    smiles: 'c1cc(cc(c1)/C=C/c2ccc(cc2)O)O',
    category: 'Natural Product',
    description: 'Natural polyphenol and stilbenoid produced by plants in response to injury or fungal pathogens, with antioxidant properties.',
    cid: 445154,
    iupacName: '5-[(E)-2-(4-hydroxyphenyl)ethenyl]benzene-1,3-diol',
    yearDiscovered: 1939,
  },
  {
    id: 'cannabidiol',
    name: 'Cannabidiol (CBD)',
    smiles: 'CCCCCC1=CC(=C(C(=C1)O)C2C=C(CCC2C(=C)C)C)O',
    category: 'Natural Product',
    description: 'Non-intoxicating phytocannabinoid with anticonvulsant, anxiolytic, and anti-inflammatory neuroprotective properties.',
    cid: 644019,
    iupacName: '2-[(1R,6R)-6-isopropenyl-3-methylcyclohex-2-en-1-yl]-5-pentylbenzene-1,3-diol',
    yearDiscovered: 1940,
  },
  {
    id: 'sildenafil',
    name: 'Sildenafil',
    smiles: 'CCCC1=NN(C2=C1N=C(NC2=O)C3=C(C=CC(=C3)S(=O)(=O)N4CCN(CC4)C)OCC)C',
    category: 'Cardiovascular',
    description: 'Potent and selective inhibitor of cGMP-specific phosphodiesterase type 5 (PDE5) promoting vascular smooth muscle relaxation.',
    cid: 135398744,
    iupacName: '5-[2-ethoxy-5-(4-methylpiperazin-1-yl)sulfonylphenyl]-1-methyl-3-propyl-4H-pyrazolo[4,3-d]pyrimidin-7-one',
    yearDiscovered: 1989,
  },
  {
    id: 'remdesivir',
    name: 'Remdesivir',
    smiles: 'CCC(CC)COC(=O)C(C)NP(=O)(OCC1C(C(C(O1)(C#N)c2ccc3n2ncnc3N)O)O)Oc4ccccc4',
    category: 'Antiviral',
    description: 'Broad-spectrum monophosphoramidate prodrug acting as an adenosine analog that inhibits viral RNA-dependent RNA polymerase.',
    cid: 121304016,
    iupacName: '2-ethylbutyl (2S)-2-[[[(2R,3S,4R,5R)-5-(4-aminopyrrolo[2,1-f][1,2,4]triazin-7-yl)-5-cyano-3,4-dihydroxyoxolan-2-yl]methoxy-phenoxyphosphoryl]amino]propanoate',
    yearDiscovered: 2009,
  },
  {
    id: 'diazepam',
    name: 'Diazepam (Valium)',
    smiles: 'CN1C(=O)CN=C(c2ccccc2)c3cc(Cl)ccc13',
    category: 'Neurotransmitter',
    description: 'Classical benzodiazepine that enhances the inhibitory effect of gamma-aminobutyric acid (GABA) at the GABAA receptor.',
    cid: 3016,
    iupacName: '7-chloro-1-methyl-5-phenyl-3H-1,4-benzodiazepin-2-one',
    yearDiscovered: 1959,
  },
  {
    id: 'epinephrine',
    name: 'Epinephrine (Adrenaline)',
    smiles: 'CNC[C@H](c1ccc(c(c1)O)O)O',
    category: 'Neurotransmitter',
    description: 'Primary hormone and neurotransmitter driving sympathetic fight-or-flight response via alpha and beta adrenergic receptors.',
    cid: 5816,
    iupacName: '4-[(1R)-1-hydroxy-2-(methylamino)ethyl]benzene-1,2-diol',
    yearDiscovered: 1895,
  },
  {
    id: 'melatonin',
    name: 'Melatonin',
    smiles: 'CC(=O)NCCC1=CNc2c1cc(OC)cc2',
    category: 'Neurotransmitter',
    description: 'Pineal hormone coordinating circadian rhythms and sleep-wake cycles through high-affinity MT1 and MT2 receptors.',
    cid: 896,
    iupacName: 'N-[2-(5-methoxy-1H-indol-3-yl)ethyl]acetamide',
    yearDiscovered: 1958,
  },
];

/**
 * Returns Molecule of the Day deterministically based on date
 */
export function getMoleculeOfTheDay(): LibraryCompound {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );
  const index = Math.abs(dayOfYear) % CURATED_LIBRARY.length;
  return CURATED_LIBRARY[index];
}

/**
 * Returns a random compound from the curated library
 */
export function getRandomCompound(): LibraryCompound {
  const index = Math.floor(Math.random() * CURATED_LIBRARY.length);
  return CURATED_LIBRARY[index];
}
