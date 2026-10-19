/**
 * Peptide reconstitution math: vial amount + diluent volume -> concentration,
 * draw volume and insulin-syringe units.
 *
 * Same formulas as the calculators on https://klow-peptide.com/en/pages/peptide-calculator/
 * This library converts units. It does not recommend any amount.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PeptideReconstitution = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Units per mL for common insulin syringe scales.
  const SYRINGES = { 'U-100': 100, 'U-40': 40 };

  // Water volumes tried by suggestWater(), in mL.
  const WATER_CANDIDATES = [1, 1.5, 2, 2.5];

  function positive(name, value) {
    if (typeof value !== 'number' || !isFinite(value) || value <= 0) {
      throw new RangeError(name + ' must be a positive number, got ' + value);
    }
    return value;
  }

  function unitsPerMl(syringe) {
    const u = SYRINGES[syringe];
    if (!u) throw new RangeError('Unknown syringe "' + syringe + '". Use one of: ' + Object.keys(SYRINGES).join(', '));
    return u;
  }

  /** Concentration in mg/mL after adding waterMl of diluent to a vial of vialMg. */
  function concentration(vialMg, waterMl) {
    return positive('vialMg', vialMg) / positive('waterMl', waterMl);
  }

  /**
   * Full reconstitution result.
   * @param {object} o
   * @param {number} o.vialMg     peptide in the vial (mg)
   * @param {number} o.waterMl    diluent added (mL)
   * @param {number} o.amountMcg  amount to draw (mcg)
   * @param {string} [o.syringe]  'U-100' (default) or 'U-40'
   */
  function reconstitute(o) {
    const opts = o || {};
    const conc = concentration(opts.vialMg, opts.waterMl);
    const amountMcg = positive('amountMcg', opts.amountMcg);
    const perMl = unitsPerMl(opts.syringe || 'U-100');
    const volumeMl = (amountMcg / 1000) / conc;
    const unitsExact = volumeMl * perMl;
    return {
      concentrationMgPerMl: conc,
      volumeMl: volumeMl,
      units: Math.round(unitsExact),
      unitsExact: unitsExact,
      drawsPerVial: Math.floor((opts.vialMg * 1000) / amountMcg),
      syringe: opts.syringe || 'U-100'
    };
  }

  /** mL for a number of syringe units. */
  function unitsToMl(units, syringe) {
    return positive('units', units) / unitsPerMl(syringe || 'U-100');
  }

  /**
   * Pick a water volume that gives an easy-to-read draw on a U-100 syringe:
   * between 2 and 100 units, close to 20 units, whole units preferred.
   * Returns null when no candidate fits.
   */
  function suggestWater(o) {
    const opts = o || {};
    const vialMg = positive('vialMg', opts.vialMg);
    const amountMcg = positive('amountMcg', opts.amountMcg);
    const candidates = opts.candidates || WATER_CANDIDATES;
    let best = null;
    for (const w of candidates) {
      const u = (amountMcg * w) / (vialMg * 10);
      if (u < 2 || u > 100) continue;
      const score = Math.abs(u - 20) + (u === Math.round(u) ? 0 : 5);
      if (!best || score < best.score) best = { waterMl: w, units: u, score: score };
    }
    return best && { waterMl: best.waterMl, units: best.units };
  }

  const mgToMcg = mg => mg * 1000;
  const mcgToMg = mcg => mcg / 1000;

  return { reconstitute, concentration, unitsToMl, suggestWater, mgToMcg, mcgToMg, SYRINGES };
});
