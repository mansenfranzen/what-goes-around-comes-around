# 19 · Document databases and NoSQL (2009 →)

[← 18 Graph databases](18-graph-databases.md) · [Index](../README.md) · [Next → 20 Blockchain databases](20-blockchain-databases.md)

| | |
|---|---|
| **Era** | 2009–2020s ("NoSQL") |
| **Verdict** | Converging with SQL |
| **Category** | **Model**: nested, denormalized JSON aggregates, schema later · secondary: **Language** (record-at-a-time APIs instead of SQL, then SQL-like languages again) |
| **Key systems** | MongoDB (most popular); CouchDB; Couchbase; DynamoDB; later SQL-ish languages: PartiQL, SQL++, CQL, AQL; MongoDB SQL interface for Atlas (2021) |
| **In the app** | Timeline → "Document DBs / NoSQL", demo: embedded vs. normalized price update |

## Summary
Store each record as a **JSON document** with nested fields and arrays; schema later; record-at-a-time API; weak(er) transactions.

## Category
Document databases challenge the model (nested aggregates instead of normalized tables, schema decided later) and initially the language (a record-at-a-time API instead of SQL). The NoSQL story is the clearest case of SQL absorbing a challenger on both fronts.

## Context (paper §2.3)
- Document models descend from SGML and XML. JSON overtook XML as the web exchange format; JavaScript's popularity drove JSON-native stores in the 2000s.
- The inability of OLTP RDBMSs to scale out in the 2000s "ushered in dozens of document DBMSs", marketed as **NoSQL**, with two messages: (1) SQL and joins are slow, so use a faster lower-level API; (2) ACID is unnecessary, so offer weaker **BASE**.
- There are dozens of such systems; MongoDB is the most popular.

## The problem
Developers want to persist the JSON their app already has, evolve fields freely, and scale writes across many machines.

## The idea
```json
{ "name": "First Last",
  "orders": [ { "id": 123, "items": [ … ] },
              { "id": 456, "items": [ … ] } ] }
```
One document = one read for the whole customer. No joins: related data is **nested** (denormalized).

## SQL vs. NoSQL vs. NewSQL, in brief
This is the stop where the audience will ask "so which one should I use?". The short version (the full comparison, with consistency models, CAP/PACELC and a decision guide, is in [SQL vs. NoSQL vs. NewSQL](../sql-nosql-newsql.md)):

| | Classic SQL (RDBMS) | NoSQL (2009 →) | NewSQL / distributed SQL (2011 →) |
|---|---|---|---|
| **Bet** | Model + language first; scale up one machine | Scale out first; give up model and language | Scale out **and** keep model + language |
| **Data model** | Normalized tables, joins | Key-value, wide-column, document, graph | Normalized tables, joins |
| **Language** | SQL | Record-at-a-time APIs (later SQL-like) | SQL |
| **Transactions** | ACID | Often BASE / eventual (single-record atomicity) | ACID, distributed |
| **Scaling** | Vertical; read replicas; manual sharding | Horizontal, automatic partitioning | Horizontal, automatic partitioning + consensus |

In terms of the three categories: **NoSQL sacrificed the model and the language to fix the primitives (scale); NewSQL showed the primitives could be fixed without sacrificing either.** That sentence is the whole debate.

## How to explain it
- **Analogy:** a folder per customer with everything inside, vs. a filing cabinet with one drawer per topic.
- **Demo:** the app changes the price of "Pen" which appears in three orders: the embedded version needs three writes (and stale copies if one is missed); the normalized version needs one. Then discuss the flip side: embedded reads need no join.
- **Paper's critique:** same arguments as OO and XML. Pre-joining/denormalization is a 1970s topic: (1) if the join isn't one-to-many there is duplicated data; (2) pre-joins are not necessarily faster than joins; (3) **no data independence**. The "N+1 problem" often cited in ORMs is the claimed motivation.
- **The turnaround:** by the end of the 2010s almost every NoSQL DBMS added a SQL(-like) interface (DynamoDB PartiQL, Cassandra CQL, Aerospike AQL, Couchbase SQL++; MongoDB the last holdout, adding SQL for Atlas in 2021). Many added ACID transactions. The message morphed from "do not use SQL: it's too slow" to "Not only SQL".
- **What remains different (paper):** JSON support and "schema later". But the **SQL standard added a JSON type and operations in 2016**, and RDBMSs keep improving the "first five minutes" experience, so the two kinds "will soon be effectively identical".

## Relational lens
Absorbed or converging: JSON columns (PostgreSQL JSONB, MySQL JSON), SQL:2016 JSON, SQL-like NoSQL languages. The paper adds a business remark: marketing matters. "Never underestimate the value of good marketing for bad products": Oracle in the 1980s, MySQL in the 2000s, MongoDB in the 2010s bought time with early traction to fix engineering debt.

## Coming from… [18 Graph databases](18-graph-databases.md)
Both graphs and documents start from the KV store's missing structure. Graphs add **edges between** items; documents add **nesting inside** an item. In practice document stores won far more developer mindshare, because JSON mapped directly onto application code.

## Leading to… [20 Blockchain databases](20-blockchain-databases.md)
**What NoSQL left open:** dropping ACID and SQL pushed consistency checks, joins and query planning into application code. The industry's answer came from two sides: NewSQL systems and Google's Spanner (2012) delivered scale-out *with* SQL and ACID, and NoSQL vendors added transactions and SQL-like languages. Tell that in two sentences here and point to the [deep dive](../sql-nosql-newsql.md) for questions.
**Timeline note, said honestly:** the next stop is not a causal successor. Blockchain appears in 2009, the same year NoSQL branding took off, as another example of "rethink the database from scratch". We include it as a **cautionary tale** about a hyped idea.
If you need a bridge sentence: *"NoSQL reconsidered the data model; blockchain reconsiders who you trust."*

## Sources
- [SP24] §2.3 (refs 110 NoSQL, 179 BASE, 41 MongoDB, 116 denormalization 1970s, 56 PartiQL, 15 CQL, 9 AQL, 72 SQL++, 42 MongoDB SQL, 165/178 SQL JSON, 153 MongoDB vs Amazon) and §4 (marketing).
- [Wikipedia: Document-oriented database](https://en.wikipedia.org/wiki/Document-oriented_database), [MongoDB](https://en.wikipedia.org/wiki/MongoDB), [JSON](https://en.wikipedia.org/wiki/JSON).
- Image: a JSON document; Diego Mariano, CC BY 4.0, Wikimedia Commons.
- Confidence: high (paper-based).
