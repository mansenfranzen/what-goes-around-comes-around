# 05 · Domesday Book (1086)

[← 04 Pinakes](04-pinakes.md) · [Index](../README.md) · [Next → 06 Card catalog](06-card-catalog.md)

| | |
|---|---|
| **Era** | Norman England |
| **Verdict** | Ancestor: schema-on-write, collected at national scale |
| **Key people** | William I; royal commissioners; local juries |
| **In the app** | Timeline → "Domesday Book" (record layout example) |

## Summary
A national survey where every manor answered the **same questions**, producing uniform records for taxation and control.

## Context
- William the Conqueror ordered the survey in late 1085; much of the fieldwork and compilation was done by 1086.
- Commissioners travelled in circuits and took sworn testimony from local juries (the shire, the hundred, the village).
- It was recorded in two volumes: *Little Domesday* (Norfolk, Suffolk, Essex; more detail) and *Great Domesday* (most of the rest; abbreviated). It is now held at The National Archives, Kew.
- "Domesday" echoes "Doomsday": like the Last Judgement, its verdict was final.

## The problem
A new ruler needs to know what land, people and animals exist, who holds them, and what they are worth, to raise tax and settle disputes.

## The idea
Define a **fixed questionnaire** and apply it to every manor. Typical fields: the manor name, who held it in 1066 and now, hides (taxable land), ploughs, villagers, woods, meadows, mills, fisheries, and its value then and now.

```
{ manor:"Hinxton",
  holder:"Count Alan",          // illustrative values
  plough_teams:4,
  value:"£8" }
```

## How to explain it
- **Analogy:** a government form. Every household fills in the same boxes.
- **Database translation:** a **schema** imposed by the collector; **data quality** enforced by sworn witnesses. Data collection is the expensive part; the model is easy.
- **Fun fact:** it was organized mainly by county and landholder, not alphabetically by place, which makes "find this village" hard without a separate index (a callback to the Pinakes).
- **Question to pose:** "What would you do if one landholder's data changed next year?" (You cannot update a bound book. That is the next problem.)

## Relational lens
Fixed fields per record = a relation with a schema. But it is a **snapshot**: no update, no history beyond "then and now".

## Coming from… [04 Pinakes](04-pinakes.md)
The catalog showed how to *navigate* a collection. Domesday shows how to *fill* one: decide the questions first, then collect data in that format. It introduces the idea that **structure is decided before data is gathered** (what we now call schema-on-write).

## Leading to… [06 Card catalog](06-card-catalog.md)
**What a bound volume could not do:** it is one fixed ordering and cannot be updated. Land changes hands, books are acquired, the same facts need to be looked up by owner, place or value. A single sorted book cannot serve several access patterns or absorb inserts. The solution that spread in libraries was to make **each record a separate physical object**, which can be inserted, removed and re-sorted at will.

## Sources
- [Wikipedia: Domesday Book](https://en.wikipedia.org/wiki/Domesday_Book).
- The National Archives (UK), Domesday Book pages (background and the circuits/commissioners).
- Image: a page of Domesday Book (Cambridgeshire), public domain, Wikimedia Commons.
- Confidence: high on 1085–86 and the two-volume structure; field list is the commonly cited set of questions (the *Inquisitio Eliensis* preserves them), simplified here.
