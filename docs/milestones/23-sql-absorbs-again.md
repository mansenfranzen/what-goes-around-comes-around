# 23 · SQL absorbs again (2023 →)

[← 22 Vector databases](22-vector-databases.md) · [Index](../README.md) · [Back to start → 01 Tally bone](01-tally-bone.md)

| | |
|---|---|
| **Era** | Now |
| **Verdict** | **Winner**: the extendable relational model |
| **Category** | All three: **Primitives**, **Language** and **Model** (the synthesis) |
| **Key standard steps** | SQL:1999 (arrays, user-defined types); SQL:2003 (XML, nested arrays); SQL:2016 (JSON); SQL:2023 (property graph queries SQL/PGQ, multi-dimensional arrays SQL/MDA) |
| **In the app** | Timeline → "SQL absorbs again", demo: stack the absorbed ideas |

## Summary
Each wave of "replace the relational model" has ended with SQL absorbing the *good idea* as a type, an index, a language extension, or an engine change.

## Category
The closing stop sums up how each category was absorbed. See the table *Absorption by category* below.

## The absorption ledger (from the paper)

| Challenger | What SQL / RDBMSs took from it |
|-----------|-------------------------------|
| Object-oriented DBs | User-defined types, object-relational features (SQL:1999) |
| XML DBs *(not a separate stop)* | SQL/XML (SQL:2003) |
| MapReduce | Distribution and fault-tolerance ideas; SQL-on-Hadoop → Presto, Impala, Spark SQL |
| Key-value | Emulated trivially; embedded KV stores became storage engines inside DBMSs |
| Document DBs | JSON type and operators (SQL:2016); NoSQL systems adopt SQL-like languages and ACID |
| [Early NoSQL](15-rise-of-nosql.md) | Distributed SQL also routes data by key, while retaining a query planner and paying for coordination when a transaction spans partitions ([deep dive](../sql-nosql-newsql.md)) |
| Text search *(not a separate stop)* | Full-text indexes in all leading RDBMSs (still clunky) |
| Arrays | SQL:1999 arrays; SQL:2003 nested arrays; SQL:2023 SQL/MDA |
| Graph | SQL/PGQ in SQL:2023; graph extensions and translation layers |
| Vector | Vector types/indexes in many RDBMSs by 2023 |
| Columnar, cloud, lakehouse | Not absorbed: these *are* relational architecture changes |
| Hardware accelerators *(not a separate stop)* | Not adopted outside niches |

## Absorption by category
The three categories used on every page explain *why* the absorption works, and why it works differently for each kind of challenger.

| Category | Challengers in this talk | How the relational camp absorbed them | Why it worked |
|----------|--------------------------|---------------------------------------|---------------|
| **Primitives** (storage & access) | Key-based partitioning (15), column stores (16), key-value engines (17), cloud object storage (21), ANN indexes (22) | As **implementation changes underneath SQL**: new storage engines, layouts, index types, architectures | **Data independence.** Queries never name the physical layer, so it can be replaced without users noticing. Challengers here become *upgrades*, not rivals. |
| **Language** (declarative querying) | Navigational DML (08, 09), MapReduce (14), NoSQL keyed APIs (15), Cypher (18) | By **re-adding SQL on top** (Hive, Spark SQL, PartiQL, CQL, SQL++) or **extending SQL** (SQL/PGQ) | "Higher level languages are almost universally preferred to record-at-a-time notations" (paper). Every procedural interface eventually grew a declarative layer. |
| **Model** (relations, keys, logical/physical split) | Hierarchy (08), network (09), arrays (12), objects (13), documents (19), graphs (18), vectors (22) | As **new column types and operators** while the relation remains the outer container: UDTs, `ARRAY`, XML, `JSON`, SQL/MDA, property graph views, `VECTOR` | **Extensible type system.** A table can hold a column of almost anything, so most "new models" end up as a type inside a row. |

The one-line version for the slide: *primitives get swapped underneath, languages get rebuilt as SQL, models get absorbed as types.* The relational model is the stable middle layer that makes the other two replaceable.

## The paper's parting advice (§4), useful as a closing slide
1. **Never underestimate the value of good marketing for bad products.** (Oracle 1980s, MySQL 2000s, MongoDB 2010s.)
2. **Beware of DBMSs from large non-DBMS vendors**; internally-built systems that get open-sourced are often immature at first.
3. **Do not ignore the out-of-box experience.** SQL systems make you define tables before loading data; DuckDB's popularity is partly its ability to query local and cloud files in place. Also needed: help with physical design, knob tuning, schema design and query tuning (the "self-driving DBMS").
4. **Developers need to query their database directly.** ORMs are useful for prototyping, but hide the DBMS's power; fall back to SQL when needed.
5. **The impact of AI/ML will be significant.** Natural-language-to-SQL by LLMs is impressive, but NL interfaces date back to the 1970s with historically poor outcomes; "we caution those who think NL will replace SQL."

## How to explain it
- **The one-slide message:** "Nothing replaced SQL, but everything changed *inside* it."
- **Pattern language for the audience:** whenever someone announces a new database category, ask: (1) Which category does it attack: *primitives*, *language* or *model*? (2) Is it a new *data model* or a new *index/type*? (3) Can a relational system add it with an extension? (4) Does it come with transactions and a query language?
- **Be fair:** this is the authors' reading. Counter-arguments exist: array and graph analytics have real engine-level needs; document stores serve schema-light apps; vector DBs add features like managed ANN indexing. The paper itself says scientific array applications will likely continue to ignore RDBMSs.
- **Discussion questions:**
  - What would count as evidence *against* the "SQL absorbs everything" thesis?
  - Which of today's hyped categories will be a *feature* in five years?
  - If JSON took years and vectors took months, what does that say about how quickly the next one will be absorbed?

## Coming from… [22 Vector databases](22-vector-databases.md)
Vectors added the final data point: absorption speed itself has sped up. Compare JSON (years) to vectors (about a year after ChatGPT): both led to a new SQL-resident feature.

## Leading to… the beginning
There is no next milestone. Suggest a callback to [01](01-tally-bone.md): a notch on a bone, a row on a clay tablet, a vector in an index: every generation re-invents *how to remember more than we can hold*, and each time the surviving structure is the one that is **simple, declarative and extendable**.

## Sources
- [SP24] abstract, §2.9 "Summary", §3.7 and §4 "Parting Comments".
- [SH05] original 2005 conclusion (object-relational "dominated all comers").
- SQL standard history (ISO/IEC 9075 parts) as summarized in [SP24] §§2.3, 2.6, 2.8.
- [Wikipedia: SQL](https://en.wikipedia.org/wiki/SQL), [PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL), [DuckDB](https://en.wikipedia.org/wiki/DuckDB).
- Image: PostgreSQL elephant; Daniel Lundin, BSD license, Wikimedia Commons.
- Confidence: high for paper-based content; the closing advice is quoted/paraphrased from the paper and is the authors' opinion.
