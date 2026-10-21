# 14 · ER and semantic models (1976 – 1980s)

[← 13 SQL & System R](13-sql-system-r.md) · [Index](../README.md) · [Next → 15 Database machines](15-database-machines.md)

| | |
|---|---|
| **Era** | Late 1970s – 1980s |
| **Verdict** | Absorbed: ER became the standard design tool; "semantic" models were re-badged later |
| **Key people** | Peter Chen (ER model, 1976); E. F. Codd's RM/T (1979); semantic data models (e.g. Hammer & McLeod, early 1980s) |
| **In the app** | Timeline → "ER & semantic models" |

## Summary
Design your data as **entities and relationships**, draw it as a diagram, and translate that into relational tables.

## Context
- Chen's *The Entity-Relationship Model: Toward a Unified View of Data* (1976) proposed entities (things), attributes (properties), and relationships (associations) with cardinalities (1:1, 1:N, N:M).
- The paper's 2005 predecessor groups three related waves: **entity-relationship** (1970s), **semantic** (late 1970s–1980s), and **extended relational** (1980s).
- Today's database design tools still show ER diagrams.

## The problem
Given a business domain, what tables do I need? Relational theory offered normalization rules but not a friendly way to *discover* structure with stakeholders.

## The idea
Model first in a conceptual diagram, then **map to tables**: entities become tables; one-to-many relationships become foreign keys; many-to-many relationships become link tables.

```
Customer 1──places──∞ Order ∞──contains──∞ Product
=> tables: customer, order, product, order_item(order_id, product_id)
```

## How to explain it
- **Analogy:** an architect's floor plan before pouring concrete.
- **Translation drill:** pick any app the audience knows (e.g. online shop) and sketch the ER diagram on a slide. Then convert it to tables live.
- **Semantic models in one line:** richer meaning (types, generalization, "is-a"). The paper notes that the recent "graph-relational" proposal is essentially the old semantic data model: another example of rebranding.
- **Paper's observation:** an ER diagram **is a graph**. This is why graph databases keep reappearing as a natural fit, and also why graphs map back onto relational tables easily.

## Relational lens
ER *feeds* the relational model rather than competing with it: it became the standard front-end for relational design.

## Coming from… [13 SQL & System R](13-sql-system-r.md)
SQL fixed the *query* problem; ER fixed the *design* problem. Together they made relational projects manageable by ordinary teams. By the early 1980s relational products were commercially successful, but they ran on hardware that made large workloads slow and expensive. That is the moment the next story begins.

## Leading to… [15 Database machines](15-database-machines.md)
**What the relational model still lacked: speed on 1980s hardware.** Joins and scans were expensive on general-purpose CPUs and slow disks. Some vendors reasoned: "if relational is the right model, build hardware designed for it." The result was the **database machine**: custom or accelerated hardware that offloaded query processing. It was the first in a long series of "hardware will fix it" bets.

## Sources
- [Chen76] P. Chen, ACM TODS 1(1), 1976. [SH05] on ER, semantic, extended relational models.
- [SP24] §2.8 (ER diagrams as graphs) and §2.9 (graph-relational ≈ semantic model, ref. 158 and 202 in the paper).
- [Wikipedia: Entity–relationship model](https://en.wikipedia.org/wiki/Entity–relationship_model).
- Image: entity-relationship diagram (Wooptoo), public domain, Wikimedia Commons.
- Confidence: Chen 1976 certain; Hammer–McLeod and RM/T mentions are from memory **(verify citations before presenting)**.
