# 13 · Object-oriented databases (late 1980s)

[← 12 Array databases](12-array-databases.md) · [Index](../README.md) · [Next → 14 MapReduce / Hadoop](14-mapreduce-hadoop.md)

| | |
|---|---|
| **Era** | Late 1980s – 1990s |
| **Verdict** | Absorbed (as object-relational) |
| **Category** | **Model**: objects with identity, inheritance and references vs. relations · secondary: **Language** (host-language navigation vs. declarative SQL) |
| **Key systems** | GemStone, ObjectStore, Versant, O2; POSTGRES (object-relational, 1986 →) |
| **In the app** | Timeline → "Object-oriented DBs", demo: save() splits an object into rows |

## Summary
Store application **objects** (with identity, nesting, even methods) directly in the database to avoid the object-relational **impedance mismatch**.

## Category
OODBs attack the model from the programmer's side: the application's object model should *be* the data model. The **impedance mismatch** (detailed below) is precisely the gap between two models (object graphs vs. relations) and two languages (an imperative host language vs. declarative SQL).

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

## The object-relational impedance mismatch in detail
**Where the term comes from.** In electrical engineering, when a source and a load have different impedances, part of the signal is reflected and lost at the junction. In software, the "junction" is the boundary between application objects and relational tables: effort, performance and correctness leak away every time data crosses it. (The term appears in the database literature from the mid-1980s, e.g. in work on persistent Smalltalk; **(verify first use)** before quoting.)

**One running example**, so the audience sees every problem on the same data:

```java
class Customer {                     // identity = the object reference
  String name;
  Address address;                   // value object, nested inside
  List<Order> orders;                // collection, navigable one way only
}
class PremiumCustomer extends Customer { int discount; }   // inheritance
class Order { long id; Customer customer; List<LineItem> items; }
```
```sql
CREATE TABLE customer (
  id BIGINT PRIMARY KEY,             -- identity = a value
  name TEXT, street TEXT, city TEXT, -- Address flattened into columns
  kind TEXT, discount INT            -- inheritance: discriminator + nullable column
);
CREATE TABLE orders    (id BIGINT PRIMARY KEY, customer_id BIGINT REFERENCES customer(id));
CREATE TABLE line_item (order_id BIGINT REFERENCES orders(id), product_id BIGINT, qty INT);
```

**The nine dimensions of the mismatch:**

| Dimension | Objects (application) | Relations (database) | What hurts in practice |
|-----------|----------------------|----------------------|------------------------|
| **Identity** | Reference identity (`a == b`), hidden memory address | Value identity: the primary key | Load the same row twice and you get two objects that disagree. ORMs need an *identity map*; someone must decide who generates IDs. |
| **Structure / granularity** | Nested objects, collections, small value objects (`Address`, `Money`) | Flat tuples in first normal form; one table per entity | One object ↔ many rows in many tables. Is `Address` its own table or a set of columns? Every choice is a trade-off. |
| **Relationships & navigation** | Directed references: `customer.orders.get(0).items` | Foreign keys, symmetric, resolved by joins; many-to-many needs a link table | Navigation turns into one query per hop: the **N+1 query problem**. Every association needs a lazy-vs-eager loading decision. |
| **Inheritance & polymorphism** | Class hierarchies, `instanceof`, overriding | No inheritance in the relational model | Pick one: *single table* (nullable columns + discriminator), *table per class* (joins on every load), *table per concrete class* (unions for polymorphic queries). None is clean. |
| **Encapsulation & behaviour** | Private state, methods, invariants enforced in code | All data visible to any query; constraints declared in the schema | Business rules live in two places (class invariants vs. `CHECK`/foreign keys) and drift apart; other apps bypass the class entirely. |
| **Types & NULL** | `String`, `float`, enums, language-specific dates and time zones, `null` | `VARCHAR(n)`, `DECIMAL`, SQL dates, `NULL` with three-valued logic | Truncation, rounding (`float` money!), time-zone bugs; `null == null` is true in Java, `NULL = NULL` is unknown in SQL. |
| **Access style (language)** | Imperative traversal, one object at a time | Declarative, set-at-a-time | Queries end up as strings inside code (no compile-time checks), or an ORM generates SQL you did not intend. |
| **Lifecycle & transactions** | Objects live in memory as long as the program wants | A row is the truth only inside a transaction | Stale objects, dirty checking, *unit of work*, optimistic locking with version columns, "detached" objects. |
| **Schema evolution** | Refactor a class in the IDE | `ALTER TABLE` plus data migration, often shared with other applications | Migrations become separate artifacts (Flyway, Liquibase, Alembic, Rails migrations) that must stay in sync with the code. |

**The N+1 problem in two snippets** (the most common symptom, worth showing on a slide):

```python
for c in session.query(Customer).all():   # 1 query
    print(c.name, len(c.orders))          # +1 query per customer (lazy load) → N+1 round trips
```
```sql
SELECT c.name, COUNT(o.id)                -- the same answer in 1 set-oriented query
FROM customer c LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name;
```

**Forty years of responses**, each moving the mismatch somewhere else:

| Strategy | How it handles the mismatch | Examples | Outcome |
|----------|-----------------------------|----------|---------|
| Make the database speak objects | Removes it inside the DBMS | GemStone, ObjectStore, O2; ODMG standard and OQL | Lost: tied to one language, weak ad hoc queries, CODASYL-style navigation |
| Extend the relational model | Brings objects into SQL | POSTGRES; SQL:1999 structured types, typed tables, `REF`; PostgreSQL table inheritance; Oracle object types | Survived, but rarely used for whole app objects; composite, array and JSON types are the parts people use |
| Map in a library (ORM) | Hides it in a mapping layer in the app | TopLink (1990s), Hibernate (2001), Rails ActiveRecord (2004), JPA (2006), SQLAlchemy (2006), Entity Framework (2008), Django ORM | Dominant everyday fix. Fowler's *Patterns of Enterprise Application Architecture* (2002) named the moving parts: Data Mapper, Active Record, Identity Map, Unit of Work, Lazy Load, Single/Class/Concrete Table Inheritance |
| Put queries into the language | Makes queries typed and composable | LINQ (2007), jOOQ, typed query builders | Reduces the *language* half of the mismatch; the *model* half remains |
| Store the app's shape again | Saves the aggregate as one JSON document | Document databases, 2009 → ([19](19-document-databases.md)) | The mismatch moves *between* documents (references, duplication) |
| Absorb the shape into SQL | Nested results from relational data | SQL:2016 JSON, PostgreSQL `JSONB`, `json_agg` to return a whole object tree in one query | Today's common middle ground |

**Why relational still won, despite paying this tax.** An object graph is *one application's* view of the data. The database usually outlives that application and is shared by many others: reporting, other services, analytics, the next rewrite. Relations with data independence serve all of them; the mismatch is a toll paid at each application boundary. Most teams decided that paying the toll in a mapping layer is cheaper than locking the data into one program's object model. Two quotable positions for the Q&A: Ted Neward called ORM "the Vietnam of computer science" (2006): easy to enter, no clear exit. Martin Fowler's reply, "OrmHate" (2012): the mismatch is inherent, ORMs solve a genuinely hard problem, and you should still drop to SQL where they fall short.

## How to explain it
- **Analogy:** instead of unpacking furniture into flat-packed boxes and reassembling it each time, keep the furniture assembled.
- **Demo:** the app's "save()": one object becomes four rows. Then ask: "Who writes that code?" (An ORM: Hibernate and friends.)
- **Why it lost:** (paper's 2005 conclusion) the relational model with an extensible type system "has dominated all comers". Reasons: schema/query-language power, tooling, ecosystem, and the OODB pointer-navigation style resembled CODASYL (see [stop 09](09-codasyl-network.md)): programs coupled to structure.
- **Mismatch walk-through (2 minutes):** show the running example above, then ask the audience which of the nine rows has bitten them. Identity, N+1 and inheritance are almost always the answers.
- **Paper's discussion (§2.3):** document DBMSs are "essentially the same as object-oriented DBMSs from the 1980s and XML DBMSs from the late 1990s". Same pitch, same problems.

## Relational lens
Absorbed: user-defined types, nested data and methods came into relational systems via object-relational extensions. The remaining mismatch moved into application code: ORMs became the everyday fix, and the paper notes that ORMs hide the model, but developers eventually need raw SQL to override poor generated queries.

## Coming from… [12 Array databases](12-array-databases.md)
Arrays attacked a niche (science). The OODB movement attacked the **largest user base**: application programmers. Both share the structural complaint that "rows and columns don't fit my data", but only one of them can threaten the mainstream.

## Leading to… [14 MapReduce / Hadoop](14-mapreduce-hadoop.md)
**What OODBs could not do:** they were tied to one programming language and its runtime object layout, weak at ad hoc queries, and they brought back CODASYL-style navigation. Relational vendors absorbed the useful parts (user-defined types, object-relational features), and the rest of the mismatch moved into ORMs. The model debate then quietened for a decade; the late-1990s wave of XML databases repeated the "store the shape the application uses" pitch and was absorbed too (SQL/XML in SQL:2003), so we skip it.
The next disruption came from a different direction: not *shape* but **volume**. By the early 2000s Google had to process the entire web crawl (billions of pages) on thousands of cheap machines that fail every day. It built a purpose-made framework, MapReduce, ignoring data modelling and database practice entirely. The conversation moves from *semantics* to *scale*.

## Sources
- [SH05] chapters on object-oriented and object-relational models; [SP24] §1 and §2.3.
- M. Atkinson et al., "The Object-Oriented Database System Manifesto", 1989 **(verify)**; M. Stonebraker, L. Rowe, "The Design of POSTGRES", SIGMOD 1986 **(verify)**.
- M. Fowler, *Patterns of Enterprise Application Architecture*, Addison-Wesley, 2002 (mapping patterns); M. Fowler, "OrmHate", martinfowler.com, 2012; T. Neward, "The Vietnam of Computer Science", blog essay, 2006.
- ORM release years (Hibernate 2001, ActiveRecord 2004, JPA 2006, SQLAlchemy 2006, Entity Framework 2008, LINQ 2007) are first-release years from memory **(verify)**.
- [Wikipedia: Object database](https://en.wikipedia.org/wiki/Object_database), [Object–relational impedance mismatch](https://en.wikipedia.org/wiki/Object–relational_impedance_mismatch), [Object-relational mapping](https://en.wikipedia.org/wiki/Object-relational_mapping).
- Image: UML class diagram example; Trashtoy, public domain, Wikimedia Commons (stand-in for an object model).
- Confidence: high on arc; product and manifesto dates from memory.
