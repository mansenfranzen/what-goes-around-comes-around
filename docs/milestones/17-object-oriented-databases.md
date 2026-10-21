# 17 · Object-oriented databases (late 1980s)

[← 16 Array databases](16-array-databases.md) · [Index](../README.md) · [Next → 18 XML databases](18-xml-databases.md)

| | |
|---|---|
| **Era** | Late 1980s – 1990s |
| **Verdict** | Absorbed (as object-relational) |
| **Key systems** | GemStone, ObjectStore, Versant, O2; POSTGRES (object-relational, 1986 →) |
| **In the app** | Timeline → "Object-oriented DBs", demo: save() splits an object into rows |

## Summary
Store application **objects** (with identity, nesting, even methods) directly in the database to avoid the object-relational **impedance mismatch**.

## Context
- Object-oriented programming (Smalltalk, C++, later Java) became mainstream in the 1980s. Developers built applications from graphs of objects.
- A series of OODBMS products appeared: GemStone (Smalltalk-based), ObjectStore, Versant, and others. Manifestos defined what an "object-oriented database" should be (Atkinson et al., 1989), and the ODMG standard followed in the 1990s.
- The response from the relational camp was the **object-relational** system: POSTGRES (Stonebraker and Rowe, from 1986), later SQL:1999's user-defined types.

## The problem
An application holds `Customer { name, orders:[Order{items:[…]}] }`. A relational database holds three tables. Programmers write code to split objects on save and join them on load. That code is tedious, error-prone and slow.

## The idea
Make the database store the object graph as is: persistent objects, object identity, pointers between objects, class hierarchies. Navigate in the programming language itself.

```
Customer { name:"Ada", orders:[ Order{ id:1, items:[pen, lamp] } ] }
// persisted as is: no mapping layer
```
vs. relational:
```
customer(1,"Ada"); orders(1,customer_id=1); items(1,order=1,"pen"); items(2,order=1,"lamp")
```

## How to explain it
- **Analogy:** instead of unpacking furniture into flat-packed boxes and reassembling it each time, keep the furniture assembled.
- **Demo:** the app's "save()": one object becomes four rows. Then ask: "Who writes that code?" (An ORM: Hibernate and friends.)
- **Why it lost:** (paper's 2005 conclusion) the relational model with an extensible type system "has dominated all comers". Reasons: schema/query-language power, tooling, ecosystem, and the OODB pointer-navigation style resembled CODASYL (see [stop 11](11-codasyl-network.md)): programs coupled to structure.
- **Paper's discussion (§2.3):** document DBMSs are "essentially the same as object-oriented DBMSs from the 1980s and XML DBMSs from the late 1990s". Same pitch, same problems.

## Relational lens
Absorbed: user-defined types, nested data and methods came into relational systems via object-relational extensions. ORMs became the everyday impedance-mismatch fix; the paper notes that ORMs hide the model, but developers eventually need raw SQL to override poor generated queries.

## Coming from… [16 Array databases](16-array-databases.md)
Arrays attacked a niche (science). The OODB movement attacked the **largest user base**: application programmers. Both share the structural complaint that "rows and columns don't fit my data", but only one of them can threaten the mainstream.

## Leading to… [18 XML databases](18-xml-databases.md)
**What OODBs could not do:** they were tied to specific programming languages and runtime object layouts, and they were weak at interchange. The web of the late 1990s needed a *language-neutral*, *self-describing* tree format for documents and data exchange. XML (1998) became that format, and "XML databases" made the same promise as OODBs: store the shape your applications and partners use, no flattening.

## Sources
- [SH05] chapters on object-oriented and object-relational models; [SP24] §1 and §2.3.
- M. Atkinson et al., "The Object-Oriented Database System Manifesto", 1989 **(verify)**; M. Stonebraker, L. Rowe, "The Design of POSTGRES", SIGMOD 1986 **(verify)**.
- [Wikipedia: Object database](https://en.wikipedia.org/wiki/Object_database), [Object–relational impedance mismatch](https://en.wikipedia.org/wiki/Object–relational_impedance_mismatch), [Object-relational mapping](https://en.wikipedia.org/wiki/Object-relational_mapping).
- Image: UML class diagram example; Trashtoy, public domain, Wikimedia Commons (stand-in for an object model).
- Confidence: high on arc; product and manifesto dates from memory.
