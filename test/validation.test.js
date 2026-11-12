const test = require('node:test');
const assert = require('node:assert/strict');
const calc = require('../src/index.js');

// Published figures. Each assertion is the arithmetic in the source, not a dose.
test('published references', () => {
  // R1 StatPearls NBK493162: 4 mg with 2 mg/mL is 2 mL.
  const r1 = calc.reconstitute({ vialMg: 2, waterMl: 1, amountMcg: 4000 });
  assert.equal(r1.volumeMl, 2);
  assert.ok(r1.warnings.includes('volume_above_1_ml'));
  assert.ok(r1.warnings.includes('amount_exceeds_vial'));

  // R2 PHAR 4330, reconstitution of powders: 250 mg in 5 mL is 50 mg/mL.
  assert.equal(calc.concentration(250, 5), 50);

  // R3 bivalirudin DailyMed setid ce56f806-7845-429d-a1ce-c2dbf79b22eb:
  // 250 mg in 50 mL is 5 mg/mL.
  assert.equal(calc.concentration(250, 50), 5);

  // R4 Egrifta SV DailyMed setid 3d783378-b02d-4f19-99dd-0fc91a042224:
  // 2 mg/0.5 mL is 4 mg/mL; 1.4 mg is 0.35 mL, which is 35 units on U-100.
  assert.equal(calc.concentration(2, 0.5), 4);
  const r4 = calc.reconstitute({ vialMg: 2, waterMl: 0.5, amountMcg: 1400 });
  assert.equal(r4.volumeMl, 0.35);
  assert.equal(r4.units, 35);

  // R5 Humulin R U-100 (setid b519bd83-038c-4ec5-a231-a51ec5cc291f) is 100 units/mL.
  // R6 ProZinc U-40 (setid 8dbc0e47-8df9-4484-903b-70fdd26f7998) is 40 units/mL.
  // 0.35 mL is 14 units on U-40.
  const r6 = calc.reconstitute({ vialMg: 2, waterMl: 0.5, amountMcg: 1400, syringe: 'U-40' });
  assert.equal(r6.volumeMl, 0.35);
  assert.equal(r6.units, 14);
  assert.equal(calc.unitsToMl(14, 'U-40'), 0.35);
  assert.equal(calc.unitsToMl(35), 0.35);

  // R7 Nursing Skills NBK593207: a 500 mg vial labeled 225 mg/mL has final volume 500/225 mL.
  assert.equal(calc.concentration(500, 500 / 225), 225);
});

// Integer tenths, so the expected units and draws do not pass through binary floats.
// p10 step 5 from 1 to 500 is 100 vials, w10 from 1 to 50 is 50 volumes, 12 doses: 60,000 rows.
test('exact integer cross-check', () => {
  const doses = [25, 50, 100, 150, 200, 250, 333, 500, 750, 1000, 1500, 2000];
  let checked = 0;
  for (let p10 = 1; p10 <= 500; p10 += 5) {
    for (let w10 = 1; w10 <= 50; w10++) {
      for (const d of doses) {
        const num = d * w10 * 100;
        const den = p10 * 1000;
        const q = Math.floor(num / den);
        const rem = num - q * den;
        const unitsRounded = 2 * rem >= den ? q + 1 : q;
        const draws = Math.floor((p10 * 100) / d);
        const r = calc.reconstitute({ vialMg: p10 / 10, waterMl: w10 / 10, amountMcg: d });
        const where = 'p10=' + p10 + ' w10=' + w10 + ' d=' + d;
        assert.equal(r.units, unitsRounded, where);
        assert.equal(r.drawsPerVial, draws, where);
        checked++;
      }
    }
  }
  assert.ok(checked > 50000, 'checked ' + checked);
});

test('half-unit draw rounds to 15, not 14', () => {
  assert.equal(calc.reconstitute({ vialMg: 1, waterMl: 1, amountMcg: 145 }).units, 15);
});

test('323 draws are not floored to 322', () => {
  assert.equal(calc.reconstitute({ vialMg: 32.3, waterMl: 1, amountMcg: 100 }).drawsPerVial, 323);
});

test('warnings', () => {
  assert.deepEqual(calc.reconstitute({ vialMg: 5, waterMl: 2, amountMcg: 250 }).warnings, []);
  assert.ok(calc.reconstitute({ vialMg: 10, waterMl: 1, amountMcg: 5 }).warnings.includes('below_1_unit'));
  assert.ok(calc.reconstitute({ vialMg: 10, waterMl: 1, amountMcg: 150 }).warnings.includes('rounding_error_above_5_percent'));
  assert.ok(calc.reconstitute({ vialMg: 1, waterMl: 2, amountMcg: 600 }).warnings.includes('volume_above_1_ml'));
  assert.ok(calc.reconstitute({ vialMg: 1, waterMl: 1, amountMcg: 2000 }).warnings.includes('amount_exceeds_vial'));
});
