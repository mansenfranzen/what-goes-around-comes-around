# 02 · Clay tokens (≈ 8000 BCE)

[← 01 Tally bone](01-tally-bone.md) · [Index](../README.md) · [Next → 03 Clay tablets](03-clay-tablets.md)

| | |
|---|---|
| **Era** | Neolithic Near East, ~8000–3000 BCE |
| **Verdict** | Ancestor (first schema: type + quantity) |
| **Key artifacts** | Plain and complex clay tokens; hollow clay envelopes (*bullae*), e.g. from Susa (Louvre) |
| **In the app** | Timeline → "Clay tokens", demo: add tokens and seal an envelope |

## Summary
Small clay shapes stood for specific goods. One token = one unit of one kind of thing. Counting gained a **type system**.

## Context
- Denise Schmandt-Besserat catalogued thousands of tokens from Near Eastern sites and proposed that they were an accounting system that preceded and led to writing.
- Plain tokens (cones, spheres, disks, cylinders, tetrahedra) appear from about 8000 BCE. More elaborate "complex" tokens with incised marks (oil, textiles, particular animals, manufactured goods) appear around 3500 BCE.
- Around the same time, tokens began to be sealed inside hollow clay balls (*bullae*, sometimes called envelopes).

## The problem
A tally records "how many" but not "of what". Farming created storage, tax, loans and trade: *Who owes whom how much barley and how many sheep?*

## The idea
Choose a token shape per commodity (commonly interpreted: cone = a small measure of grain, sphere = a larger measure, cylinder = an animal). To record a debt, hand over the matching tokens. Seal them in a clay envelope so nobody can tamper, and press the tokens into the outer surface before sealing, so the contents are visible from outside.

```
envelope = [ cone, cone, cone, sphere, cylinder ]
outside  = impressions: cone×3, sphere×1, cylinder×1
// = 3 small grain measures, 1 large, 1 animal
```

## How to explain it
- **Analogy:** poker chips of different colours: each colour is a currency; a bag of chips is a balance.
- **Database translation:** the shape is a *type*, the count is a *value*, the envelope is a *record*, and the impressions on the outside are the first **index/metadata** about what is inside.
- **Demo:** in the app, add tokens, then "seal": the inside is hidden, only the outside index remains. Ask: "How would an auditor check the inside?" (They break it open: a destructive read.)
- **Caveat to state out loud:** the token-to-writing story is a leading but contested hypothesis.

## Relational lens
Typed counts: (item_type, quantity). Still no names or dates, and no way to scan a pile of envelopes quickly. It is a *schema without a table*.

## Coming from… [01 Tally bone](01-tally-bone.md)
The tally gave us **quantity**. Tokens add the missing dimension, **kind**. This is the first appearance of a pattern we will see again and again: a simple structure gets a second attribute because real use cases demand it.

## Leading to… [03 Clay tablets](03-clay-tablets.md)
**What tokens could not do:** checking an envelope's contents means breaking it. The impressions on the outside were already a copy of the contents, so the tokens inside were redundant. People noticed, and the logical next step was to drop the envelope and the tokens and keep only the **marks**, on a flat piece of clay that can be read at any time. Signs for numbers separate from signs for goods; lists of such marks become the first written records and, eventually, tables.

## Sources
- D. Schmandt-Besserat, *Before Writing*, Univ. of Texas Press, 1992 [SB92].
- [Wikipedia: Cuneiform](https://en.wikipedia.org/wiki/Cuneiform), [Proto-cuneiform](https://en.wikipedia.org/wiki/Proto-cuneiform) (context).
- Image: Clay accounting tokens, Susa, Louvre; Marie-Lan Nguyen, public domain, Wikimedia Commons.
- Confidence: dates approximate; **theory contested** (critics question direct continuity from tokens to script).
