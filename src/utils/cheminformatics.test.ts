import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateSmiles,
  parseSmiles,
  analyzeSmiles,
  calculateFormula,
  calculateMolecularWeight,
  generateFingerprint,
  calculateTanimoto,
  evaluateDrugLikeness,
} from './cheminformatics';

test('SMILES validator correctly detects syntax errors', () => {
  // Valid
  assert.equal(validateSmiles('c1ccccc1').valid, true);
  assert.equal(validateSmiles('CC(=O)O').valid, true);
  assert.equal(validateSmiles('[NH4+]').valid, true);

  // Invalid: empty
  assert.equal(validateSmiles('').valid, false);

  // Invalid: unbalanced parens
  assert.equal(validateSmiles('CC(=O').valid, false);
  assert.equal(validateSmiles('CC(=O))O').valid, false);

  // Invalid: unbalanced brackets
  assert.equal(validateSmiles('[NH4').valid, false);

  // Invalid: unclosed ring
  assert.equal(validateSmiles('c1ccccc').valid, false);
});

test('Benzene (c1ccccc1) chemical descriptors are accurate', () => {
  const result = analyzeSmiles('c1ccccc1', 'Benzene');
  assert.equal(result.formula, 'C6H6');
  assert.equal(Math.round(result.molecularWeight), 78);
  assert.equal(result.ringCount, 1);
  assert.equal(result.aromaticRingCount, 1);
  assert.equal(result.aromaticAtomCount, 6);
  assert.equal(result.hBondDonors, 0);
  assert.equal(result.hBondAcceptors, 0);
  assert.equal(result.drugLikeness.lipinskiPassed, true);
  assert.equal(result.drugLikeness.ruleOfFiveViolations, 0);
});

test('Ethanol (CCO) formula and functional groups', () => {
  const result = analyzeSmiles('CCO', 'Ethanol');
  assert.equal(result.formula, 'C2H6O');
  assert.equal(Math.round(result.molecularWeight), 46);
  assert.equal(result.hBondDonors, 1); // OH
  assert.equal(result.hBondAcceptors, 1); // O
  assert.equal(result.ringCount, 0);
});

test('Aspirin (CC(=O)Oc1ccccc1C(=O)O) analysis', () => {
  const result = analyzeSmiles('CC(=O)Oc1ccccc1C(=O)O', 'Aspirin');
  assert.equal(result.formula, 'C9H8O4');
  assert.equal(Math.round(result.molecularWeight), 180);
  assert.equal(result.hBondDonors, 1); // -COOH donor
  assert.equal(result.hBondAcceptors, 4); // 4 oxygens
  assert.equal(result.ringCount, 1);
  assert.equal(result.drugLikeness.lipinskiPassed, true);
  assert.equal(result.drugLikeness.ruleOfFiveViolations, 0);
  assert.ok(result.conformer3D);
  assert.ok(result.conformer3D.atoms.length > 0);
});

test('Tanimoto similarity logic', () => {
  const mol1 = parseSmiles('CC(=O)Oc1ccccc1C(=O)O'); // Aspirin
  const mol2 = parseSmiles('CC(=O)Nc1ccc(O)cc1'); // Paracetamol
  const mol3 = parseSmiles('c1ccccc1'); // Benzene

  const fp1 = generateFingerprint(mol1.atoms);
  const fp2 = generateFingerprint(mol2.atoms);
  const fp3 = generateFingerprint(mol3.atoms);

  // Self similarity is 1.0
  assert.equal(calculateTanimoto(fp1, fp1), 1.0);

  // Similar molecules have positive similarity
  const sim12 = calculateTanimoto(fp1, fp2);
  const sim13 = calculateTanimoto(fp1, fp3);

  assert.ok(sim12 > 0 && sim12 <= 1.0);
  assert.ok(sim13 > 0 && sim13 <= 1.0);
});

test('Caffeine (CN1C=NC2=C1C(=O)N(C(=O)N2C)C) descriptors', () => {
  const result = analyzeSmiles('CN1C=NC2=C1C(=O)N(C(=O)N2C)C', 'Caffeine');
  assert.equal(result.formula, 'C8H10N4O2');
  assert.equal(Math.round(result.molecularWeight), 194);
  assert.equal(result.hBondDonors, 0);
  assert.equal(result.hBondAcceptors, 6);
  assert.equal(result.drugLikeness.lipinskiPassed, true);
});

test('Paracetamol (CC(=O)Nc1ccc(O)cc1) descriptors', () => {
  const result = analyzeSmiles('CC(=O)Nc1ccc(O)cc1', 'Paracetamol');
  assert.equal(result.formula, 'C8H9NO2');
  assert.equal(Math.round(result.molecularWeight), 151);
  assert.equal(result.hBondDonors, 2); // -OH and -NH-
  assert.equal(result.hBondAcceptors, 3); // O, O, N
  assert.equal(result.ringCount, 1);
  assert.equal(result.drugLikeness.lipinskiPassed, true);
});

