# 09 · CODASYL: the network model (1969–71)

[← 08 IMS](08-ims-hierarchical.md) · [Index](../README.md) · [Next → 10 Relational model](10-relational-model.md)

| | |
|---|---|
| **Era** | Late 1960s – 1970s |
| **Verdict** | Legacy |
| **Category** | **Model**: networks of owner/member sets linked by pointers · secondary: **Language** (navigational, record-at-a-time) |
| **Key people / systems** | Charles Bachman (IDS at General Electric, early 1960s; Turing Award 1973); CODASYL Data Base Task Group (DBTG) reports 1969 and 1971; IDMS and others |
| **In the app** | Timeline → "CODASYL", demo: step through `FIND NEXT … WITHIN set` |

## Summary
Records are linked by **sets** (owner → many members) using pointers; a record can be a member of several sets. The programmer navigates by hopping along pointers.

## Category
CODASYL widens the model (a record can have several owners, so many-to-many works) but keeps relationships as **pointers** and keeps the language **navigational**. It is the clearest "before" picture for both relational ideas: links by *value*, and *declarative* queries.

## Context
- Bachman's Integrated Data Store (IDS) from the early 1960s was the ancestor. The CODASYL committee (the COBOL standards body) standardized a network model in DBTG reports around 1969–71.
- Bachman's Turing lecture, *The Programmer as Navigator* (1973), gave the model its slogan: the programmer navigates a graph of records like a ship's navigator.

## The problem
Trees (IMS) cannot cleanly express many-to-many data: a part in many assemblies, a supplier of many parts and a part from many suppliers.

## The idea
Let any record be linked into any number of **sets**. Each set has one owner record and an ordered list of member records. Use **currency indicators** (where you "are" in each set) and commands to move.

```
FIND Acme
FIND NEXT part WITHIN supplies
FIND NEXT part WITHIN supplies
FIND OWNER WITHIN used-in           // from pump to Tank
```

## How to explain it
- **Analogy:** a subway map where you give turn-by-turn directions. Fast if the route is known; awful if the map changes.
- **Demo:** ask the IMS question again: which assembly uses Acme's pump? Follow the supplies chain to the pump and switch to its used-in owner, Tank. Unlike the tree, both paths touch the same pump record. Re-sort the chain and replay the program to see the cost of depending on pointer order.
- **Key sentence:** "The programmer is the query planner."
- **Why it hurt:** schema changes require program rewrites; code is verbose and low-level; the user must understand pointer structure.

## Relational lens
Network = explicit **pointers** where relational uses **values** (foreign keys). Codd's argument: let the system derive links by matching values, not by pointer traversal. The paper notes the graph database Neo4j also uses pointers "as in CODASYL" for edges, and says its commercial success depends on whether enough "long chain" traversals exist to justify leaving an RDBMS.

## Coming from… [08 IMS](08-ims-hierarchical.md)
IMS gave fast tree traversal and left many-to-many awkward. CODASYL **fixes the model** (arbitrary links) but **keeps the style** (navigation). It solves the data shape problem while inheriting the programming problem.

## Leading to… [10 Relational model](10-relational-model.md)
**What navigational systems could not do:** they bind application code to storage structure. Reorganizing data, adding an access path or asking an unplanned question means writing new programs. Edgar Codd at IBM's San Jose research lab argued this was the wrong abstraction. His proposal: forget pointers and paths; represent everything as **tables of values** and let a high-level language and the system find the paths. The industry argued about it openly for years (the famous Codd–Bachman "great debate" at SIGMOD 1974).

## Sources
- [Bach73] C. Bachman, "The Programmer as Navigator", CACM 1973.
- [SH05] on network model; [SP24] §2.8 on graph DBMSs and Neo4j's CODASYL-like pointers.
- [Wikipedia: CODASYL](https://en.wikipedia.org/wiki/CODASYL), [Network model](https://en.wikipedia.org/wiki/Network_model), [Charles Bachman](https://en.wikipedia.org/wiki/Charles_Bachman).
- Image: original supplier–part–assembly network diagram, DB Time Machine.
- Confidence: high; exact report years vary by source (1969 draft, 1971 DBTG report).
