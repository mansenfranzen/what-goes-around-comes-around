# 01 · Tally bone (≈ 20,000 BCE)

[Index](../README.md) · [Next → 02 Clay tokens](02-clay-tokens.md)

| | |
|---|---|
| **Era** | Upper Palaeolithic |
| **Verdict** | Ancestor (a one-column "table") |
| **Key artifacts** | Ishango bone (Congo), Lebombo bone (southern Africa), Věstonice wolf bone (Czechia) |
| **In the app** | Timeline → "Tally bone", demo: cut notches on a bone |

## Summary
Humans started storing information **outside the brain** by carving notches. A tally stores exactly one thing: a number.

## Context
- Hunter-gatherer groups needed to track days, moons, game, perhaps trade. Memory alone does not scale beyond small numbers.
- The Ishango bone was found in 1950 by Jean de Heinzelin near Lake Edward (Democratic Republic of the Congo); it is held in Brussels. It is usually dated around 20,000 years old.
- Older candidates exist: the Lebombo bone (~43,000 years, 29 notches) and a wolf bone from Věstonice (~30,000 years, 55 notches in groups of five).

## The problem
"How many?" over time: kills, days in a lunar cycle, members of a group. Without a record, the answer lives only in someone's head and dies with them.

## The idea
One mark per counted item, cut into durable material. Groups of notches (fives, tens) make counts readable at a glance.

```
bone = ||||| ||| ||||      // count = 12
```
Notice what is **missing**: what was counted, who counted, when. It is a table with one column and no header.

## How to explain it
- **Analogy:** a score-keeping tally on a whiteboard. Everyone understands it, nobody can tell what the game was.
- **Demo:** let the audience cut notches in the app, then ask "12 of what?". That question motivates the next stop.
- **Likely questions:** "Was it a calendar?" Honest answer: possibly; interpretations of Ishango (lunar calendar, arithmetic, even prime numbers) are speculative. Safe claim: a structured tally, roughly 20,000 years old.

## Relational lens
A tally is a relation with arity 1 and one tuple repeated: pure cardinality. Later models add **attributes** (types, names, dates) to those marks.

## Coming from…
Nothing: this is the starting point. Use it to define the premise of the talk: *every database exists because someone needed to remember more than they could hold.*

## Leading to… [02 Clay tokens](02-clay-tokens.md)
**What the tally could not do:** it records quantity but not *kind*. Once people farmed, stored grain, kept herds and traded, "12" is useless unless you also know 12 of what, and for whom. **What changed:** settled agriculture (Near East, roughly 9000–8000 BCE) produced different goods in different amounts, owed between different people. The next step adds **types** to counts: distinct token shapes for distinct goods.

## Sources
- J. de Heinzelin, "Ishango", *Scientific American*, 1962. [Wikipedia: Ishango bone](https://en.wikipedia.org/wiki/Ishango_bone)
- [Wikipedia: Lebombo bone](https://en.wikipedia.org/wiki/Lebombo_bone), [Tally stick](https://en.wikipedia.org/wiki/Tally_stick)
- Image: Ishango bone (cropped), Joeykentin, CC BY-SA 4.0, Wikimedia Commons.
- Confidence: dates approximate; the "meaning" of the notches is **contested**.
