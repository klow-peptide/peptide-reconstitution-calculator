# Peptide Reconstitution Calculator

A small JavaScript library for peptide reconstitution math. It has no dependencies.
You give it the vial amount, the volume of bacteriostatic water and the amount to draw.
It returns the concentration, the draw volume and the units on an insulin syringe.

It uses the same formulas as the calculators on [klow-peptide.com](https://klow-peptide.com/en/pages/peptide-calculator/).
A test in this repo checks that both give identical results.

> **Educational tool only. Not medical advice.** This library converts units. It does not recommend any amount.

## The formulas

```
Concentration (mg/mL) = Vial (mg) ÷ Water (mL)
Volume (mL)           = [Amount (mcg) ÷ 1000] ÷ Concentration
Units (U-100)         = Volume (mL) × 100
Draws per vial        = floor(Vial (mg) × 1000 ÷ Amount (mcg))
```

Worked example: a 5 mg vial with 2 mL of water gives **2.5 mg/mL**. 250 mcg is 0.25 mg, so 0.25 ÷ 2.5 = **0.10 mL**,
which is **10 units** on a U-100 syringe.

## Install

```
npm install peptide-reconstitution-calculator
```

Or copy `src/index.js` into your project. It works in Node.js (CommonJS) and in the browser (global `PeptideReconstitution`).

## Use

```js
const { reconstitute, suggestWater, unitsToMl } = require('peptide-reconstitution-calculator');

reconstitute({ vialMg: 5, waterMl: 2, amountMcg: 250 });
// { concentrationMgPerMl: 2.5, volumeMl: 0.1, units: 10, unitsExact: 10,
//   drawsPerVial: 20, syringe: 'U-100' }

reconstitute({ vialMg: 5, waterMl: 2, amountMcg: 250, syringe: 'U-40' }).unitsExact; // 4

suggestWater({ vialMg: 5, amountMcg: 250 });
// { waterMl: 2, units: 10 }  (a water volume that gives an easy syringe reading)

unitsToMl(10); // 0.1
```

Browser: see `examples/browser.html`.

| Function | Returns |
|---|---|
| `reconstitute({ vialMg, waterMl, amountMcg, syringe })` | concentration, volume, rounded and exact units, draws per vial |
| `concentration(vialMg, waterMl)` | mg/mL |
| `unitsToMl(units, syringe)` | mL |
| `suggestWater({ vialMg, amountMcg })` | a water volume from 1 to 2.5 mL that gives 2 to 100 units, close to 20, or `null` |
| `mgToMcg`, `mcgToMg` | unit conversion |

`syringe` is `'U-100'` (default, 100 units per mL) or `'U-40'`. Invalid input throws a `RangeError`.

## Embed the calculator on your site

Free widget, no account. Copy this code into your page:

```html
<iframe src="https://klow-peptide.com/embed/reconstitution-calculator/" width="100%" height="700"
  style="border:0;max-width:520px;border-radius:16px" title="Peptide Reconstitution Calculator" loading="lazy"></iframe>
<p style="font:13px/1.5 sans-serif">Free <a href="https://klow-peptide.com/en/pages/peptide-calculator/">Peptide Reconstitution Calculator</a> by Klow Peptide</p>
```

Peptide-specific versions (replace the `src` of the iframe):

| Peptide | Full calculator | Embed URL |
|---|---|---|
| Any peptide | [Calculator](https://klow-peptide.com/en/pages/peptide-calculator/) | `https://klow-peptide.com/embed/reconstitution-calculator/` |
| BPC-157 | [Calculator](https://klow-peptide.com/en/pages/bpc-157-calculator/) | `https://klow-peptide.com/embed/reconstitution-calculator/bpc-157/` |
| TB-500 | [Calculator](https://klow-peptide.com/en/pages/tb-500-calculator/) | `https://klow-peptide.com/embed/reconstitution-calculator/tb-500/` |
| Semaglutide | [Calculator](https://klow-peptide.com/en/pages/semaglutide-calculator/) | `https://klow-peptide.com/embed/reconstitution-calculator/semaglutide/` |
| Tirzepatide | [Calculator](https://klow-peptide.com/en/pages/tirzepatide-calculator/) | `https://klow-peptide.com/embed/reconstitution-calculator/tirzepatide/` |
| Retatrutide | [Calculator](https://klow-peptide.com/en/pages/retatrutide-calculator/) | `https://klow-peptide.com/embed/reconstitution-calculator/retatrutide/` |
| Cagrilintide | [Calculator](https://klow-peptide.com/en/pages/cagrilintide-calculator/) | `https://klow-peptide.com/embed/reconstitution-calculator/cagrilintide/` |
| CJC-1295 | [Calculator](https://klow-peptide.com/en/pages/cjc-1295-calculator/) | `https://klow-peptide.com/embed/reconstitution-calculator/cjc-1295/` |
| GHK-Cu | [Calculator](https://klow-peptide.com/en/pages/ghk-cu-calculator/) | `https://klow-peptide.com/embed/reconstitution-calculator/ghk-cu/` |
| GHRP-2 | [Calculator](https://klow-peptide.com/en/pages/ghrp-2-calculator/) | `https://klow-peptide.com/embed/reconstitution-calculator/ghrp-2/` |
| GHRP-6 | [Calculator](https://klow-peptide.com/en/pages/ghrp-6-calculator/) | `https://klow-peptide.com/embed/reconstitution-calculator/ghrp-6/` |
| Hexarelin | [Calculator](https://klow-peptide.com/en/pages/hexarelin-calculator/) | `https://klow-peptide.com/embed/reconstitution-calculator/hexarelin/` |
| IGF-1 LR3 | [Calculator](https://klow-peptide.com/en/pages/igf-1-lr3-calculator/) | `https://klow-peptide.com/embed/reconstitution-calculator/igf-1-lr3/` |
| KPV | [Calculator](https://klow-peptide.com/en/pages/kpv-calculator/) | `https://klow-peptide.com/embed/reconstitution-calculator/kpv/` |
| MOTS-c | [Calculator](https://klow-peptide.com/en/pages/mots-c-calculator/) | `https://klow-peptide.com/embed/reconstitution-calculator/mots-c/` |
| SS-31 | [Calculator](https://klow-peptide.com/en/pages/ss-31-calculator/) | `https://klow-peptide.com/embed/reconstitution-calculator/ss-31/` |
| Tesamorelin | [Calculator](https://klow-peptide.com/en/pages/tesamorelin-calculator/) | `https://klow-peptide.com/embed/reconstitution-calculator/tesamorelin/` |
| Klow Blend | [Calculator](https://klow-peptide.com/en/pages/klow-calculator/) | `https://klow-peptide.com/embed/reconstitution-calculator/klow/` |
| Glow Blend | [Calculator](https://klow-peptide.com/en/pages/glow-calculator/) | `https://klow-peptide.com/embed/reconstitution-calculator/glow/` |

## Related

- [Peptide Pharmacokinetics Dataset](https://github.com/klow-peptide/peptide-pharmacokinetics-dataset): sourced half-life and Tmax values for 35 peptides.
- [Peptide Lab](https://klow-peptide.com/en/pages/peptide-lab/): log injections and see half-life curves.

## Tests

```
npm test
```

## License

MIT. Maintained by [Klow Peptide](https://klow-peptide.com).
