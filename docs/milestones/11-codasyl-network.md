# 11 · CODASYL: the network model (1969–71)

[← 10 IMS](10-ims-hierarchical.md) · [Index](../README.md) · [Next → 12 Relational model](12-relational-model.md)

| | |
|---|---|
| **Era** | Late 1960s – 1970s |
| **Verdict** | Legacy |
| **Key people / systems** | Charles Bachman (IDS at General Electric, early 1960s; Turing Award 1973); CODASYL Data Base Task Group (DBTG) reports 1969 and 1971; IDMS and others |
| **In the app** | Timeline → "CODASYL", demo: step through `FIND NEXT … WITHIN set` |

## Summary
Records are linked by **sets** (owner → many members) using pointers; a record can be a member of several sets. The programmer navigates by hopping along pointers.

## Context
- Bachman's Integrated Data Store (IDS) from the early 1960s was the ancestor. The CODASYL committee (the COBOL standards body) standardized a network model in DBTG reports around 1969–71.
- Bachman's Turing lecture, *The Programmer as Navigator* (1973), gave the model its slogan: the programmer navigates a graph of records like a ship's navigator.

## The problem
Trees (IMS) cannot cleanly express many-to-many data: a part in many assemblies, a supplier of many parts and a part from many suppliers.

## The idea
Let any record be linked into any number of **sets**. Each set has one owner record and an ordered list of member records. Use **currency indicators** (where you "are" in each set) and commands to move.

```
FIND FIRST supplier
FIND NEXT part WITHIN supplies
FIND NEXT part WITHIN supplies
FIND OWNER WITHIN supplies          // jump to another owner (the shared part)
```

## How to explain it
- **Analogy:** a subway map where you give turn-by-turn directions. Fast if the route is known; awful if the map changes.
- **Demo:** the app steps a cursor through a supplier/part network. A part shared by two suppliers is stored once.
- **Key sentence:** "The programmer is the query planner."
- **Why it hurt:** schema changes require program rewrites; code is verbose and low-level; the user must understand pointer structure.

## Relational lens
Network = explicit **pointers** where relational uses **values** (foreign keys). Codd's argument: let the system derive links by matching values, not by pointer traversal. The paper notes the graph database Neo4j also uses pointers "as in CODASYL" for edges, and says its commercial success depends on whether enough "long chain" traversals exist to justify leaving an RDBMS.

## Coming from… [10 IMS](10-ims-hierarchical.md)
IMS gave fast tree traversal and left many-to-many awkward. CODASYL **fixes the model** (arbitrary links) but **keeps the style** (navigation). It solves the data shape problem while inheriting the programming problem.

## Leading to… [12 Relational model](12-relational-model.md)
**What navigational systems could not do:** they bind application code to storage structure. Reorganizing data, adding an access path or asking an unplanned question means writing new programs. Edgar Codd at IBM's San Jose research lab argued this was the wrong abstraction. His proposal: forget pointers and paths; represent everything as **tables of values** and let a high-level language and the system find the paths. The industry argued about it openly for years (the famous Codd–Bachman "great debate" at SIGMOD 1974).

## Sources
- [Bach73] C. Bachman, "The Programmer as Navigator", CACM 1973.
- [SH05] on network model; [SP24] §2.8 on graph DBMSs and Neo4j's CODASYL-like pointers.
- [Wikipedia: CODASYL](https://en.wikipedia.org/wiki/CODASYL), [Network model](https://en.wikipedia.org/wiki/Network_model), [Charles Bachman](https://en.wikipedia.org/wiki/Charles_Bachman).
- Image: Charles Bachman (2006), Gary.Cherlet, CC BY-SA 3.0, Wikimedia Commons.
- Confidence: high; exact report years vary by source (1969 draft, 1971 DBTG report).
