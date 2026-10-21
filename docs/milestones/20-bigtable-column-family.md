# 20 · Bigtable and the column-family model (2004)

[← 19 MapReduce / Hadoop](19-mapreduce-hadoop.md) · [Index](../README.md) · [Next → 21 Columnar warehouses](21-columnar-warehouses.md)

| | |
|---|---|
| **Era** | 2000s NoSQL wave |
| **Verdict** | Niche survivor ("Without Google, this paper would not be talking about this category") |
| **Key systems** | Google Bigtable (2004); Apache HBase; Apache Cassandra; later Megastore and Spanner replaced Bigtable underneath Google's SQL |
| **In the app** | Timeline → "Bigtable (column family)", demo: toggle NULL view |

## Summary
Rows identified by a key, each with a flexible set of columns grouped into **families**; cells can hold multiple values. No joins, no secondary indexes.

## Context (paper §2.4)
- Google built Bigtable in 2004; the paper that describes it appeared at OSDI 2006.
- Other systems copied the data model: Cassandra (Meta) and HBase (from PowerSet), including Bigtable's limitations: **no joins and no secondary indexes**.
- **Not a columnar model.** The paper stresses that "column-family" is a reduction of the document model: it supports only one level of nesting; each record can have optional attributes and cells can contain arrays.

## The problem
Google must store and update web-scale data (crawl, indexes, maps) with low latency, and MR is batch-only.

## The idea
```
User1000 -> { name:"Alice", accounts:[123,456], email:"xxx@xxx.edu" }
User1001 -> { name:"Bob",   email:["yyy@yyy.org","zzz@zzz.com"] }
```
Rows are sorted by key and split into ranges (tablets) across machines; values are versioned by timestamp. Procedural client API instead of SQL.

## How to explain it
- **Analogy:** a giant sorted address book where each entry may have different fields.
- **Demo:** toggle the app's "relational view" to see how many NULLs the same data would produce in a table. That's the "sparse rows" benefit.
- **Name warning for the audience:** *column-family* ≠ *column-store*. Say it twice.
- **What happened next (paper):** In the early 2010s Google built RDBMS layers *on top of* Bigtable (Megastore; first version of Spanner). Spanner was later rewritten to remove Bigtable remnants and is now the primary DB for many internal applications. Cassandra replaced its Thrift API with SQL-like **CQL**; HBase now recommends the **Phoenix** SQL front-end. Google still sells Bigtable as a cloud service, but the model "is a singular outlier with the same disadvantages as NoSQL DBMSs".

## Relational lens
Everything in the paper's document-model discussion applies: denormalization has costs (duplication, no data independence). A "table with optional columns and arrays" is within reach of modern SQL with JSON or array types.

## Coming from… [19 MapReduce / Hadoop](19-mapreduce-hadoop.md)
MR was batch; Bigtable is **online**. Together they were Google's one-two punch in the mid-2000s: MR for bulk processing, Bigtable for interactive storage. The paper notes Google moved crawl processing from MR to BigTable. Open-source mimics (Hadoop+HBase) reproduced both.

## Leading to… [21 Columnar warehouses](21-columnar-warehouses.md)
**A naming and a reality gap:** Bigtable's "column families" invite confusion with genuine **column stores**, which appeared at about the same time and took a completely different path: stay relational, store each column contiguously, and win the analytics market. After seeing a NoSQL model that rejected SQL, we look at a *real* architectural revolution that kept SQL: the columnar data warehouse. (It is also a good moment to explain the OLTP vs. OLAP split, since Bigtable-type systems target neither well.)

## Sources
- [SP24] §2.4 (refs 111 BigTable, 14 Cassandra, 28 HBase, 99 Megastore, 98 Spanner rewrite, 15 CQL, 57 Phoenix).
- [Chang06] Bigtable, OSDI 2006.
- [Wikipedia: Bigtable](https://en.wikipedia.org/wiki/Bigtable), [Apache Cassandra](https://en.wikipedia.org/wiki/Apache_Cassandra), [Apache HBase](https://en.wikipedia.org/wiki/Apache_HBase).
- Image: Google data center, Council Bluffs, Iowa; Chad Davis, CC BY 2.0, Wikimedia Commons (illustrative; not a Bigtable-specific photo).
- Confidence: high (paper-based).
