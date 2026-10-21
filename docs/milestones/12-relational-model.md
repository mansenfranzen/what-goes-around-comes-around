# 12 · The relational model (1970)

[← 11 CODASYL](11-codasyl-network.md) · [Index](../README.md) · [Next → 13 SQL & System R](13-sql-system-r.md)

| | |
|---|---|
| **Era** | 1970s |
| **Verdict** | **Winner**: the reference point for everything that follows |
| **Key people / systems** | E. F. Codd (IBM); prototypes System R (IBM) and Ingres (UC Berkeley) |
| **In the app** | Timeline → "Relational model", demo: click a customer, see the join |

## Summary
Data is a collection of **relations** (tables of tuples). The logical model is independent of physical storage. You query with a high-level language.

## Context
- Codd's 1970 CACM paper *A Relational Model of Data for Large Shared Data Banks* introduced relations, keys, **data independence**, and relational algebra/calculus. Normalization followed (first, second, third normal forms) to reduce redundancy.
- IBM already had a major commercial product in IMS, so internal support was lukewarm. Research prototypes (System R at IBM San Jose; Ingres at Berkeley by Stonebraker, Wong and others) proved feasibility.
- Early objections: it will be too slow. The **query optimizer** work (e.g. Selinger et al., 1979) answered it: the system can choose good plans automatically.

## The problem
Navigational systems tied programs to storage layouts and demanded procedural code for every question. Change the data layout and programs break; ask a new question and you write a new program.

## The idea
1. Store data as **relations** (sets of tuples with named attributes).
2. Link tables by **values** (foreign keys), not pointers.
3. Provide **declarative** operations (select, project, join, union, difference).
4. Separate **logical** from **physical**: indexes and layout can change without altering queries (data independence).

```
Customer(id, name)
Order(id, customer_id, item, total)
-- link by matching customer_id = id; no pointers
```

## How to explain it
- **Analogy:** spreadsheets with a rule: shared columns let you connect sheets, and you ask questions rather than programming the lookup.
- **Demo:** click a customer in the app to highlight matching orders and see the join result.
- **Three words to teach:** *table, key, join.* Then the big idea: **data independence**.
- **Why the audience should care:** every later challenger, including NoSQL, graph and vector, is judged by whether it beats "just use tables + SQL".
- **Paper's thesis:** the relational model has remained dominant; alternatives either vanished, stayed niche, or were absorbed.

## Relational lens
This *is* the lens. Note what Codd did **not** require: that data be flat forever. Later SQL standards added arrays, JSON, graphs etc. while keeping the relation as the core abstraction.

## Coming from… [11 CODASYL](11-codasyl-network.md)
Network programming proved two things: (1) real data is graph-shaped, and (2) navigating by hand is painful. Codd kept the first insight (links between records exist) but replaced the representation (values instead of pointers) and the interface (declarative instead of navigational). It is a **reversal of abstraction level**, not just another model.

## Leading to… [13 SQL & System R](13-sql-system-r.md)
**What the model left unsolved:** mathematicians loved relational algebra; programmers did not. For adoption, you need a language people can type. IBM's System R team (Chamberlin, Boyce and others) designed an English-like language: first called SEQUEL, later SQL. It also needed concurrency control, recovery and a good optimizer: the engineering that turned a model into a product.

## Sources
- [Codd70] E. F. Codd, CACM 13(6), 1970.
- [Sel79] Selinger et al., SIGMOD 1979. [Astr76] System R overview.
- [SH05] and [SP24] (overall narrative and thesis).
- [Wikipedia: Relational model](https://en.wikipedia.org/wiki/Relational_model), [Edgar F. Codd](https://en.wikipedia.org/wiki/Edgar_F._Codd), [IBM System R](https://en.wikipedia.org/wiki/IBM_System_R), [Ingres](https://en.wikipedia.org/wiki/Ingres_(database)).
- Image: relational model diagram, U.S. Department of Transportation, public domain, Wikimedia Commons.
- Confidence: high.
