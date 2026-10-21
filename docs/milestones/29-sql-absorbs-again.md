# 29 · SQL absorbs again (2023 →)

[← 28 Vector databases](28-vector-databases.md) · [Index](../README.md) · [Back to start → 01 Tally bone](01-tally-bone.md)

| | |
|---|---|
| **Era** | Now |
| **Verdict** | **Winner**: the extendable relational model |
| **Key standard steps** | SQL:1999 (arrays, user-defined types); SQL:2003 (XML, nested arrays); SQL:2016 (JSON); SQL:2023 (property graph queries SQL/PGQ, multi-dimensional arrays SQL/MDA) |
| **In the app** | Timeline → "SQL absorbs again", demo: stack the absorbed ideas |

## Summary
Each wave of "replace the relational model" has ended with SQL absorbing the *good idea* as a type, an index, a language extension, or an engine change.

## The absorption ledger (from the paper)

| Challenger | What SQL / RDBMSs took from it |
|-----------|-------------------------------|
| Object-oriented DBs | User-defined types, object-relational features (SQL:1999) |
| XML DBs | SQL/XML (SQL:2003) |
| MapReduce | Distribution and fault-tolerance ideas; SQL-on-Hadoop → Presto, Impala, Spark SQL |
| Key-value | Emulated trivially; embedded KV stores became storage engines inside DBMSs |
| Document DBs | JSON type and operators (SQL:2016); NoSQL systems adopt SQL-like languages and ACID |
| Column family | Largely retreated; Spanner and SQL layers replaced Bigtable internally |
| Text search | Full-text indexes in all leading RDBMSs (still clunky) |
| Arrays | SQL:1999 arrays; SQL:2003 nested arrays; SQL:2023 SQL/MDA |
| Graph | SQL/PGQ in SQL:2023; graph extensions and translation layers |
| Vector | Vector types/indexes in many RDBMSs by 2023 |
| Columnar, cloud, lakehouse | Not absorbed: these *are* relational architecture changes |
| Hardware accelerators, blockchain | Not adopted outside niches |

## The paper's parting advice (§4), useful as a closing slide
1. **Never underestimate the value of good marketing for bad products.** (Oracle 1980s, MySQL 2000s, MongoDB 2010s.)
2. **Beware of DBMSs from large non-DBMS vendors**; internally-built systems that get open-sourced are often immature at first.
3. **Do not ignore the out-of-box experience.** SQL systems make you define tables before loading data; DuckDB's popularity is partly its ability to query local and cloud files in place. Also needed: help with physical design, knob tuning, schema design and query tuning (the "self-driving DBMS").
4. **Developers need to query their database directly.** ORMs are useful for prototyping, but hide the DBMS's power; fall back to SQL when needed.
5. **The impact of AI/ML will be significant.** Natural-language-to-SQL by LLMs is impressive, but NL interfaces date back to the 1970s with historically poor outcomes; "we caution those who think NL will replace SQL."

## How to explain it
- **The one-slide message:** "Nothing replaced SQL, but everything changed *inside* it."
- **Pattern language for the audience:** whenever someone announces a new database category, ask: (1) Is it a new *data model* or a new *index/type*? (2) Can a relational system add it with an extension? (3) Does it come with transactions and a query language?
- **Be fair:** this is the authors' reading. Counter-arguments exist: array and graph analytics have real engine-level needs; document stores serve schema-light apps; vector DBs add features like managed ANN indexing. The paper itself says scientific array applications will likely continue to ignore RDBMSs.
- **Discussion questions:**
  - What would count as evidence *against* the "SQL absorbs everything" thesis?
  - Which of today's hyped categories will be a *feature* in five years?
  - If JSON took years and vectors took months, what does that say about how quickly the next one will be absorbed?

## Coming from… [28 Vector databases](28-vector-databases.md)
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
