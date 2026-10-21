# 23 · Graph databases (2007 →)

[← 22 Key-value stores](22-key-value-stores.md) · [Index](../README.md) · [Next → 24 Document DBs / NoSQL](24-document-databases.md)

| | |
|---|---|
| **Era** | 2000s–2020s |
| **Verdict** | Converging with SQL |
| **Key systems** | Neo4j (Cypher); TigerGraph (GSQL); JanusGraph; Amazon Neptune; Oracle PGQL; Apache AGE (OpenCypher on PostgreSQL); standards SQL/PGQ (SQL:2023) and GQL |
| **In the app** | Timeline → "Graph databases", demo: pick a person, extend hops, see equivalent joins |

## Summary
Store **nodes and edges with properties**; query by following relationships. Strong fit for social networks and knowledge graphs.

## Context (paper §2.8)
- Two common representations: **RDF** (triples: labeled directed edges only) and **property graphs** (directed multigraph with key/value labels on nodes and edges). The paper discusses property graphs because they are more common and a superset of RDF.
- **OLTP-style use:** update one friend link transactionally. Neo4j is the best-known. It stores edges with pointers "as in CODASYL" but does not cluster nodes with parent or offspring records.
- **Analytics-style use:** shortest paths, cut sets, cliques, and "which user has the most friends under 30"; systems such as TigerGraph and JanusGraph, plus compute fabrics like Giraph and Turi.
- A relational ER diagram is already a graph.

## The problem
Multi-hop traversals ("friends of friends of friends") require chains of joins. In vanilla SQL that is verbose and was often slow.

## The idea
```
Node(id, data)               (:Person {name:'Ada'})
Edge(src, dst, data)         (Ada)-[:FRIEND]->(Bob)
MATCH (a {name:'Ada'})-[:FRIEND*1..3]->(b) RETURN b
```
Pointer-chase from node to neighbours instead of joining tables.

## How to explain it
- **Analogy:** a map of subway lines vs. a list of connections. When the question is "how do I get from A to B", the map wins.
- **Demo:** the app's friend network: change the hops slider and see "k hops = k self-joins" in SQL, and the equivalent pattern query in SQL/PGQ.
- **The honest picture (paper):** (1) a graph can always be simulated by two tables; (2) pointer chasing wins for **long chains**, but the market depends on whether enough long-chain scenarios exist; (3) for analytics, distributed algorithms rarely beat a single node because of communication costs; compress the graph into an in-memory structure and run there; (4) performance studies often show graph simulation on RDBMSs beating graph DBMSs; a recent result shows **SQL/PGQ in DuckDB beating a leading graph DBMS by up to 10×**, thanks to techniques like **worst-case optimal joins** and **factorized execution**.

## Relational lens
RDBMS options: vendor graph extensions (SQL Server, Oracle), translation layers (Neptune over Aurora MySQL; Apache AGE for OpenCypher on PostgreSQL), and finally **SQL/PGQ** in **SQL:2023**, which standardizes graph pattern matching in SQL. This "further narrows the functionality difference between RDBMSs and native graph DBMSs".

## Coming from… [22 Key-value stores](22-key-value-stores.md)
KV stores treat items as unrelated blobs. Graph databases are the answer to "but my data is all about *connections*". It is the first path that adds structure back to KV **by adding edges**.

## Leading to… [24 Document DBs / NoSQL](24-document-databases.md)
**What graphs did not address:** most application developers still wanted to store a *record per object* (user, product, order), already nested, without joins at all. Rather than adding edges, the document camp **adds nesting** to the value: JSON instead of a blob. This became the center of the NoSQL boom (and it matched the developer's mental model of JSON in JavaScript web apps).

## Sources
- [SP24] §2.8 (refs 44 Neo4j, 74 TigerGraph, 32 JanusGraph, 26 Giraph, 78 Turi, 45 Neptune, 10 AGE, 3 and 50 SQL Server/Oracle graph, 196 SQL/PGQ in DuckDB, 126 GQL, 160 distributed vs single node, 132/168 worst-case optimal joins, 100 factorized execution).
- [Wikipedia: Graph database](https://en.wikipedia.org/wiki/Graph_database), [Neo4j](https://en.wikipedia.org/wiki/Neo4j).
- Image: social network visualization; Martin Grandjean, CC BY-SA 4.0, Wikimedia Commons.
- Confidence: high (paper-based); Neo4j's company founding year (2007) and 1.0 release (2010) from memory **(verify)**.
