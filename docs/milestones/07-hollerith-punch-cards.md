# 07 · Hollerith punch cards (1890)

[← 06 Card catalog](06-card-catalog.md) · [Index](../README.md) · [Next → 08 RAMAC disk](08-ramac-disk.md)

| | |
|---|---|
| **Era** | Industrial age, US census of 1890 |
| **Verdict** | Ancestor: machine-readable records, first machine "queries" |
| **Key people / firms** | Herman Hollerith; Tabulating Machine Company → CTR (1911) → IBM (1924) |
| **In the app** | Timeline → "Hollerith punch cards", demo: punch a digit per column |

## Summary
Facts about a person are encoded as **holes in a card**. Machines read, sort and count cards, turning a decade of clerical work into months.

## Context
- The 1880 US census took roughly seven to eight years to tabulate by hand. With growing population, the 1890 census threatened to take longer than ten years, so it would be obsolete before completion.
- Hollerith, who had worked on the census, designed cards, a punch, a reader (pins through holes closing electrical circuits via mercury cups) and counters/sorters. The 1890 census used his system; preliminary population counts appeared within weeks and the full tabulation was far faster than 1880.
- His company evolved into IBM; the 80-column card standard (1928) dominated computing for decades.

## The problem
Counting and cross-tabulating millions of records ("how many foreign-born men in Ohio over 40?") by hand is too slow and error-prone.

## The idea
Encode each attribute as the **position of a hole** in a fixed column or area of the card. Machines detect holes electrically, so counters can increment and sorters can route cards by values.

```
col 1-2 : age band
col 3   : sex
col 4-5 : state
// "count cards where col 3 = 2 and col 4-5 = 'OH'"  ← first machine-style query
```

## How to explain it
- **Analogy:** a very physical bit-field. Each column is a field with limited domain (digits 0–9).
- **Database translation:** fixed-width record layout, **filter + count** (`WHERE … GROUP BY`). Data and format are tied to the machine: change the card layout and all machines must change (no data independence).
- **Demo:** the app lets you punch a digit per column and shows what the "machine" reads.
- **Bridge to modern talk:** this is also the root of **batch processing**: decks are fed through machines, sorted and merged in passes. You will hear echoes in MapReduce.

## Relational lens
A card is a fixed-width tuple. Sorting decks implements early **sort-merge** operations. The *schema is physical*: card layout.

## Coming from… [06 Card catalog](06-card-catalog.md)
The card catalog showed the power of one-record-per-card. Hollerith kept the card but changed who reads it: **a machine, not a human**. The conceptual step is from "records that people can sort" to "records that machines can process", which is the real beginning of data *processing*.

## Leading to… [08 RAMAC disk](08-ramac-disk.md)
**What punch cards (and later magnetic tape) could not do:** they are **sequential**. To answer one question you run the whole deck or reel through a machine. That is fine for batch census runs, but not for "Is seat 14C on flight 702 free?" asked right now. Business needed direct access to a single record. In 1956 IBM's RAMAC put records on a spinning disk where a head could jump to any of them.

## Sources
- [Wikipedia: Punched card](https://en.wikipedia.org/wiki/Punched_card), [Herman Hollerith](https://en.wikipedia.org/wiki/Herman_Hollerith), [1880 United States census](https://en.wikipedia.org/wiki/1880_United_States_census), [1890 United States census](https://en.wikipedia.org/wiki/1890_United_States_census).
- Image: Hollerith punched card, public domain, Wikimedia Commons.
- Confidence: general account solid; the exact tabulation times and "weeks" for preliminary counts are commonly quoted figures **(verify before quoting precisely)**.
