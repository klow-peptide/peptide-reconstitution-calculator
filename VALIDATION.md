# Validation

The checks below test the arithmetic in `src/index.js`. These numbers check arithmetic only, not dosing guidance. Nothing here is a dose, a preparation instruction, or medical advice.

## The website parity test is not independent

`test/index.test.js` has a function named `site()` that repeats this library's divisions, then applies `Math.round` and `Math.floor` to the raw IEEE 754 results. The test asserts that `reconstitute()` matches `site()` on a grid of inputs.

That is a parity check against a second copy of the same formulas. When both copies share a rounding bug, the test still passes. It did: the two bugs in the last section are outside that grid, and a copy of the old formula would have agreed with the old code on both of them. Agreement with `site()` does not show that a result matches a published figure or an exact fraction.

The checks in `test/validation.test.js` are separate from `site()`.

## References

| Id | Source | What is checked |
|---|---|---|
| R1 | [Dose Calculation Desired Over Have Formula Method, StatPearls (NBK493162)](https://www.ncbi.nlm.nih.gov/books/NBK493162/) | 4 mg at 2 mg/mL is 2 mL |
| R2 | [PHAR 4330, Reconstitution of Powders](https://uhphar-4330.herokuapp.com/module/calculations_for_intravenous_fluids/topics/reconstitution_of_powders) | 250 mg with 5 mL is 50 mg/mL |
| R3 | [Bivalirudin for injection, DailyMed setid ce56f806-7845-429d-a1ce-c2dbf79b22eb](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=ce56f806-7845-429d-a1ce-c2dbf79b22eb) | 250 mg in 50 mL is 5 mg/mL |
| R4 | [Egrifta SV, DailyMed setid 3d783378-b02d-4f19-99dd-0fc91a042224](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=3d783378-b02d-4f19-99dd-0fc91a042224) | 2 mg/0.5 mL is 4 mg/mL; 1.4 mg is 0.35 mL, which is 35 U-100 units |
| R5 | [Humulin R U-100, DailyMed setid b519bd83-038c-4ec5-a231-a51ec5cc291f](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=b519bd83-038c-4ec5-a231-a51ec5cc291f) | 100 units per mL, so 0.35 mL is 35 units on a U-100 syringe |
| R6 | [ProZinc U-40, DailyMed setid 8dbc0e47-8df9-4484-903b-70fdd26f7998](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=8dbc0e47-8df9-4484-903b-70fdd26f7998) | 40 units per mL, so 0.35 mL is 14 units on a U-40 syringe |
| R7 | [Nursing Skills, Chapter 5, NCBI Bookshelf (NBK593207)](https://www.ncbi.nlm.nih.gov/books/NBK593207/) | a 500 mg vial labeled 225 mg/mL has final volume 500/225 mL |

## Hand-worked cases

| Id | Published figure | Arithmetic | Library |
|---|---|---|---|
| R1 | Ordered 4 mg, supply stated as 2 mg/mL, volume to measure is 2 mL | 4 ÷ 2 = 2 | `reconstitute({ vialMg: 2, waterMl: 1, amountMcg: 4000 }).volumeMl === 2`. The 4 mg amount is larger than 2 mg, and 2 mL is above 1 mL, so `warnings` contains `amount_exceeds_vial` and `volume_above_1_ml` |
| R2 | 250 mg vial, 5 mL diluent, 50 mg/mL. The course treats that powder's volume as negligible | 250 ÷ 5 = 50 | `concentration(250, 5) === 50` |
| R3 | One 250 mg vial added to a 50 mL bag, final concentration 5 mg/mL. The label's 5 mL of sterile water dissolves the powder; 50 mL is the final volume | 250 ÷ 50 = 5 | `concentration(250, 50) === 5` |
| R4 | 2 mg mixed with 0.5 mL is stated as 2 mg/0.5 mL. The label states 1.4 mg as 0.35 mL of that solution | 2 ÷ 0.5 = 4 mg/mL; 1.4 ÷ 4 = 0.35 mL; 0.35 × 100 = 35 | `concentration(2, 0.5) === 4`, and `reconstitute({ vialMg: 2, waterMl: 0.5, amountMcg: 1400 })` returns `volumeMl === 0.35` and `units === 35` |
| R5 | Humulin R contains 100 units in each milliliter and is used with a U-100 syringe | 0.35 × 100 = 35 | `unitsToMl(35) === 0.35` |
| R6 | ProZinc contains 40 units in each milliliter and is used with a U-40 syringe | 0.35 × 40 = 14 | `reconstitute({ vialMg: 2, waterMl: 0.5, amountMcg: 1400, syringe: 'U-40' }).units === 14` and `unitsToMl(14, 'U-40') === 0.35` |
| R7 | Cefazolin 500 mg. The chapter's label says the reconstituted concentration is 225 mg/mL (about 2.2 mL after 2 mL of diluent). The extra volume is powder displacement | final volume = 500 ÷ 225 = 500/225 mL; 500 ÷ (500/225) = 225 | `concentration(500, 500 / 225) === 225` when that final volume is passed in. Passing the 2 mL of diluent instead would return 250, which is not the labeled concentration |

R3 and R4 also state a salt weight next to the labeled amount (bivalirudin trifluoroacetate, tesamorelin acetate). The checks use the labeled amounts. The library does not correct for salt form, purity, overfill, or syringe dead space. See [Units, ranges and limits](README.md#units-ranges-and-limits).

## Exact integer check

`reconstitute()` computes units in IEEE 754, then keeps 12 significant digits before rounding. The cross-check never asks that floating-point path for the expected value.

Vial and water are integer tenths: `p10` tenths of a milligram and `w10` tenths of a milliliter. The dose `d` is an integer number of micrograms. On a U-100 syringe the exact unit count is the rational number

```
num = d * w10 * 100
den = p10 * 1000
units = num / den
```

Integer division gives quotient `q = floor(num / den)` and remainder `rem = num - q * den`. Half rounds up:

```
unitsRounded = q + 1    when 2 * rem >= den
unitsRounded = q        otherwise
```

Draws use the same integers:

```
draws = floor(p10 * 100 / d)
```

which is `floor(vialMg * 1000 / amountMcg)` with `vialMg = p10 / 10`.

The test loops `p10` from 1 through 500 in steps of 5 (100 values, 0.1 mg through 49.6 mg), `w10` from 1 through 50 (0.1 mL through 5.0 mL), and 12 doses. That is 60,000 combinations, and the test requires the count to be greater than 50,000. For each row, `units` and `drawsPerVial` must equal `unitsRounded` and `draws`.

## Bugs found (fixed in 1.1.0)

Version 1.0.0 rounded and floored the raw IEEE 754 values.

- **14.5 units returned 14.** For 1 mg, 1 mL, and 145 mcg the exact draw is 14.5 units. The binary product was 14.499999999999998, and `Math.round` returned 14. Version 1.1.0 returns 15.
- **323 draws returned 322.** A 32.3 mg vial holds 323 draws of 100 mcg. The binary quotient was 322.99999999999994, and `Math.floor` returned 322. Version 1.1.0 returns 323.

`clean()` keeps 12 significant digits (`Number(x.toPrecision(12))`) before `Math.round` and `Math.floor`. The same cleaning is applied to the unit count inside `suggestWater()`.

These numbers check arithmetic only, not dosing guidance.
