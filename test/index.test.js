const test = require('node:test');
const assert = require('node:assert/strict');
const calc = require('../src/index.js');

// The formula used on klow-peptide.com calculator pages and embed widgets.
function site(p, w, d) {
  const conc = p / w, vol = (d / 1000) / conc;
  return { conc, vol, units: Math.round(vol * 100), doses: Math.floor((p * 1000) / d) };
}

test('worked example: 5 mg + 2 mL, 250 mcg', () => {
  const r = calc.reconstitute({ vialMg: 5, waterMl: 2, amountMcg: 250 });
  assert.equal(r.concentrationMgPerMl, 2.5);
  assert.ok(Math.abs(r.volumeMl - 0.1) < 1e-12);
  assert.equal(r.units, 10);
  assert.equal(r.drawsPerVial, 20);
});

test('same results as the website for a grid of inputs', () => {
  for (const p of [1, 2, 5, 10, 15, 30, 60, 80]) {
    for (const w of [0.5, 1, 1.5, 2, 2.5, 3, 5]) {
      for (const d of [50, 100, 250, 500, 1000, 2500, 4000]) {
        const s = site(p, w, d);
        const r = calc.reconstitute({ vialMg: p, waterMl: w, amountMcg: d });
        assert.equal(r.concentrationMgPerMl, s.conc);
        assert.equal(r.volumeMl, s.vol);
        assert.equal(r.units, s.units);
        assert.equal(r.drawsPerVial, s.doses);
      }
    }
  }
});

test('U-40 syringe scale', () => {
  const r = calc.reconstitute({ vialMg: 5, waterMl: 2, amountMcg: 250, syringe: 'U-40' });
  assert.ok(Math.abs(r.unitsExact - 4) < 1e-12);
  assert.equal(calc.unitsToMl(40, 'U-40'), 1);
  assert.equal(calc.unitsToMl(10), 0.1);
});

test('suggestWater targets about 20 whole units', () => {
  assert.deepEqual(calc.suggestWater({ vialMg: 5, amountMcg: 250 }), { waterMl: 2, units: 10 });
  assert.equal(calc.suggestWater({ vialMg: 100, amountMcg: 10 }), null);
});

test('rejects bad input', () => {
  assert.throws(() => calc.reconstitute({ vialMg: 0, waterMl: 2, amountMcg: 250 }), RangeError);
  assert.throws(() => calc.reconstitute({ vialMg: 5, waterMl: -1, amountMcg: 250 }), RangeError);
  assert.throws(() => calc.reconstitute({ vialMg: 5, waterMl: 2, amountMcg: NaN }), RangeError);
  assert.throws(() => calc.reconstitute({ vialMg: 5, waterMl: 2, amountMcg: 250, syringe: 'U-500' }), RangeError);
});
