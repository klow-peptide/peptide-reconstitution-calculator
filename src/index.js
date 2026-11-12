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

  // Largest common insulin syringe (1 mL). A larger volume needs more than one syringe.
  const MAX_SYRINGE_ML = 1;
  // Removes binary floating-point noise before rounding or flooring:
  // 1 mg, 1 mL, 145 mcg gives 14.499999999999998 units in IEEE 754, which must round to 15, not 14.
  const clean = x => Number(x.toPrecision(12));

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
   * warnings may include amount_exceeds_vial, volume_above_1_ml,
   * below_1_unit, or rounding_error_above_5_percent.
   */
  function reconstitute(o) {
    const opts = o || {};
    const conc = concentration(opts.vialMg, opts.waterMl);
    const amountMcg = positive('amountMcg', opts.amountMcg);
    const perMl = unitsPerMl(opts.syringe || 'U-100');
    const volumeMl = (amountMcg / 1000) / conc;
    const unitsExact = clean(volumeMl * perMl);
    const units = Math.round(unitsExact);
    const drawsPerVial = Math.floor(clean((opts.vialMg * 1000) / amountMcg));
    const warnings = [];
    if (drawsPerVial < 1) warnings.push('amount_exceeds_vial');
    if (volumeMl > MAX_SYRINGE_ML) warnings.push('volume_above_1_ml');
    if (unitsExact < 1) warnings.push('below_1_unit');
    else if (Math.abs(units - unitsExact) / unitsExact > 0.05) warnings.push('rounding_error_above_5_percent');
    return {
      concentrationMgPerMl: conc,
      volumeMl: volumeMl,
      units: units,
      unitsExact: unitsExact,
      drawsPerVial: drawsPerVial,
      syringe: opts.syringe || 'U-100',
      warnings: warnings
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
      const u = clean((amountMcg * w) / (vialMg * 10));
      if (u < 2 || u > 100) continue;
      const score = Math.abs(u - 20) + (u === Math.round(u) ? 0 : 5);
      if (!best || score < best.score) best = { waterMl: w, units: u, score: score };
    }
    return best && { waterMl: best.waterMl, units: best.units };
  }

  const mgToMcg = mg => mg * 1000;
  const mcgToMg = mcg => mcg / 1000;

  return { reconstitute, concentration, unitsToMl, suggestWater, mgToMcg, mcgToMg, SYRINGES, MAX_SYRINGE_ML };
});
