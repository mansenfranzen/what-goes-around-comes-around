# 08 · IMS: the hierarchical model (1966)

[← 07 RAMAC disk](07-ramac-disk.md) · [Index](../README.md) · [Next → 09 CODASYL](09-codasyl-network.md)

| | |
|---|---|
| **Era** | Mainframe, Apollo program |
| **Verdict** | Legacy: still running, nobody starts new apps on it |
| **Category** | **Model**: the first commercial data model (hierarchy wired into storage) · secondary: **Language** (navigational DL/I calls) |
| **Key systems** | IBM Information Management System (IMS), first built for NASA's Apollo/Saturn V parts lists, released 1968 |
| **In the app** | Timeline → "IMS", demo: find "Fuel valve of Engine J-2" by walking a tree |

## Summary
Data stored as **trees**: parent record → child records. You enter at the root and walk down.

## Category
IMS is the first answer to the model question *"how are records related?"*: as parent and child, wired into storage. Logical and physical layers are fused, which makes IMS the counter-example that gives the relational model's decoupling its meaning. Its language (get unique, get next) is navigation, one record at a time.

## Context
- IBM, with partners (notably North American Rockwell and Caterpillar), started building the system in 1966 to keep the **bill of materials** for the Saturn V rocket: a rocket has stages, stages have engines, engines have valves.
- Records are called *segments*. Programs navigate using DL/I calls (get unique, get next, get next within parent).
- IMS is still in production at many large banks and insurers.

## The problem
Millions of parts, nested assemblies, strict reliability. Questions like "which parts make up this stage?" must be answered quickly on 1960s hardware. Files of flat records do not capture nesting.

## The idea
Model the real-world hierarchy directly. Store children close to their parent on disk so that walking down the tree is fast.

```
Rocket
 ├ Stage 1
 │   ├ Engine F-1
 │   │   ├ Fuel valve
 │   │   └ Pump
 │   └ Tank
 └ Stage 2
     └ Engine J-2
         ├ Fuel valve   ← the same part type, stored again (copy)
         └ Pump
```

## How to explain it
- **Analogy:** a file system of folders. To find anything you must know the path.
- **Demo:** the app asks you to find the J-2 fuel valve; you can only start at the root, and you notice "Fuel valve" and "Pump" are stored twice.
- **What it was good at:** the one access path that was designed. **What hurt:** (1) many-to-many relationships need copies or special "logical relationships"; (2) applications know the physical structure, so reorganizing data **breaks programs**.
- **Paper's point on stickiness:** IMS persists because migrating data is expensive and risky, *not* because it is better. "No start-up would willingly choose to build a new application on IMS."

## Relational lens
Hierarchical data is a one-to-many relationship hard-wired into storage. Relational systems store the same fact as a foreign key and rebuild trees with joins; modern SQL even has recursive queries and JSON for tree-shaped data.

## Coming from… [07 RAMAC disk](07-ramac-disk.md)
RAMAC gave direct access to any record by address. IMS is the first large system to build a **data model** on top of that primitive: store parent and child records close together and connect them with physical pointers, so the access path *is* the tree. It is a huge step up from tape, and it starts a pattern worth naming: the first data model simply mirrors the storage layout.

## Leading to… [09 CODASYL](09-codasyl-network.md)
**What trees could not do cleanly:** real data is not always a tree. A part used in two assemblies, a supplier who supplies many parts and a part with many suppliers: these are **many-to-many** relationships. In IMS you either duplicate the data (waste, inconsistency) or use awkward cross-tree pointers. In the same years Charles Bachman's work at GE, and then the CODASYL committee, generalized trees to **networks**: records linked by pointer sets so that a record can belong to multiple owners.

## Sources
- [SP24] introduction and §1 on IMS; [SH05] chapters on hierarchical and network models.
- [Wikipedia: Information Management System](https://en.wikipedia.org/wiki/Information_Management_System), [Hierarchical database model](https://en.wikipedia.org/wiki/Hierarchical_database_model), [Apollo program](https://en.wikipedia.org/wiki/Apollo_program).
- Image: Apollo 11 launch on a Saturn V, NASA, public domain, Wikimedia Commons.
- Confidence: start year 1966 and Apollo origin are well documented; the 1968 release name (IMS/360) **(verify)**.
