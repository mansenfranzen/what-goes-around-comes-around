# 03 · Clay tablet ledger (≈ 3300 BCE)

[← 02 Clay tokens](02-clay-tokens.md) · [Index](../README.md) · [Next → 04 Pinakes](04-pinakes.md)

| | |
|---|---|
| **Era** | Late Uruk period (Sumer, southern Mesopotamia) |
| **Verdict** | Ancestor: literally a table |
| **Key artifacts** | Proto-cuneiform administrative tablets from Uruk; later cuneiform ration and livestock accounts |
| **In the app** | Timeline → "Clay tablet ledger", demo: filter the ledger |

## Summary
Records are pressed flat into clay as lines of signs: **who, what, how much**. Writing itself was largely invented for bookkeeping.

## Context
- The earliest proto-cuneiform tablets from Uruk (about 3300–3000 BCE) are overwhelmingly administrative: rations, livestock, grain, textiles, labourers. Estimates put administrative texts at around 85–90 % of the earliest corpus ([NDE93]).
- Temple and palace institutions managed large flows of goods and workers and needed records that outlive the clerk.
- A tablet often has a layout: numerals, an item sign, a person or office, and totals (sometimes on the reverse).

## The problem
Sealed envelopes of tokens are awkward: opening one destroys it, comparing two is slow, and storage is bulky. Institutions need records that can be **read, compared, summed and filed**.

## The idea
Impress signs into a flat tablet of wet clay. Separate numerals from commodity signs. Lay lines out in rows (one transaction per line) and columns (parties, goods, quantities). Add totals.

```
| who    | what   | qty |
| Ur-Nin | barley |  30 |
| Lu-Gal | sheep  |  12 |
| total  |        |  42 | ← first aggregate (only if units agree!)
```

## How to explain it
- **Analogy:** a spreadsheet, but waterproof and 5,000 years old.
- **Key point:** nobody planned "the relational model"; the row/column layout is just the obvious way to keep records of repeated events. When the audience later sees Codd's tables, link back: *it was always a table*.
- **Demo:** in the app, filter the ledger by "barley". Filtering is a `WHERE`; summing a column is a `GROUP BY`.
- **Photo note:** the museum tablet shown is an administrative account of the same genre (barley and emmer distribution); it is not itself from Uruk's earliest period.

## Relational lens
Rows = entities or events, columns = attributes, totals = aggregates. No keys, no joins: each tablet is its own island.

## Coming from… [02 Clay tokens](02-clay-tokens.md)
Tokens' outside impressions made the inside redundant. Tablets are the "outside only" version: the index *became* the record. Types (token shapes) turn into signs, quantities into numerals. The big shift: from **physical objects standing for goods** to **abstract marks**, which can be copied, stored in bulk and read by anyone literate.

## Leading to… [04 Pinakes](04-pinakes.md)
**What tablets could not do:** once institutions wrote everything down, archives grew into rooms and then libraries of tablets. A record you cannot find might as well not exist. The next problem is not *writing* data but **finding** it. (Honest note: Mesopotamian scribes already kept lists and tablet catalogs, so the Alexandrian catalog is the best-known early example, not the first.)

## Sources
- H. Nissen, P. Damerow, R. Englund, *Archaic Bookkeeping*, Univ. of Chicago Press, 1993 [NDE93].
- [Wikipedia: Uruk](https://en.wikipedia.org/wiki/Uruk), [Proto-cuneiform](https://en.wikipedia.org/wiki/Proto-cuneiform), [Cuneiform](https://en.wikipedia.org/wiki/Cuneiform).
- Image: cuneiform administrative account of barley and emmer, Metropolitan Museum of Art, CC0, Wikimedia Commons.
- Confidence: high on "mostly administrative"; percentages are scholarly estimates.
