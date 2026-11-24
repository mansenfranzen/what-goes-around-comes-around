# 14 · MapReduce and Hadoop (2003–2014)

[← 13 Object-oriented DBs](13-object-oriented-databases.md) · [Index](../README.md) · [Next → 17 Key-value stores](17-key-value-stores.md)

| | |
|---|---|
| **Era** | 2003–2014 ("Big Data" era) |
| **Verdict** | **Dead end**: died as a general platform; ideas live on |
| **Category** | **Language**: how to express large-scale transformations (hand-written `map`/`reduce` vs. declarative SQL) · secondary: **Primitives** (partitioning, fault tolerance) |
| **Key systems** | Google MapReduce and GFS; Yahoo's Hadoop with HDFS (2005); Hive (Meta); Impala (Cloudera); Drill (MapR); Presto (Meta); Spark; Flink |
| **In the app** | Timeline → "MapReduce / Hadoop", demo: word-count animation; "Java vs SQL" overlay (Hadoop SecondarySort vs. a short SQL query) |

## Summary
Programmers write `map()` and `reduce()`; the framework distributes work over thousands of cheap machines and recovers from failures. In database terms: **a UDF plus GROUP BY**, executed as a batch.

## Category
MapReduce is primarily a language claim: express transformations as two procedural functions. It has no data model at all. The DBMS community's answer was that the same job is `SELECT … GROUP BY` and that an optimizer should plan it; the market agreed (Hive, Presto, Spark SQL). Its durable contribution sits in primitives: partitioned, fault-tolerant execution on commodity clusters.

## Context (paper §2.1)
- Google built MapReduce in 2003 as a "point solution" for its periodic crawl of the internet. At that time Google "had little expertise in DBMS technology".
- To a first approximation MR runs a single query: `SELECT map() FROM crawl_table GROUP BY reduce()`.
- Yahoo! created the open-source clone **Hadoop** in 2005, on the HDFS file system (a clone of Google's GFS). Several vendors (Cloudera, Hortonworks, MapR) sold it.
- A 2009 study (Pavlo et al.) showed that data-warehouse DBMSs outperformed Hadoop; dueling articles by Google and the DBMS community followed.

## The problem
Process a huge dataset (the whole crawl) on a cluster of unreliable machines, without the programmer having to write distributed systems code.

## The idea
```
map("to be")        -> (to,1) (be,1)
shuffle             -> to:[1,1]  be:[1]
reduce(to,[1,1])    -> (to,2)
```
No schema, no data model: your code parses files and defines what a record means.

## How to explain it
- **Analogy:** a post office sorting room: many workers sort letters by region (map), mail is shuffled to regional hubs, and hubs count and bundle (reduce).
- **Demo:** word count in the app. Step through map → shuffle → reduce.
- **Java vs SQL (button in the Relevance box):** Hadoop's `SecondarySort` example needs a composite key (`IntPair`), a custom partitioner, a grouping comparator, custom sort order and serialization only to "sort each user's values". The full example file has 6 classes and ~140 lines of code (no comments or blank lines). In SQL it is `ORDER BY user_id, score`, or `ARRAY_AGG(score ORDER BY score) … GROUP BY user_id`. The slide shows a simplified excerpt: the real `FirstGroupingComparator` implements `RawComparator` and also compares serialized bytes.
- **Photo:** a close detail of Google’s first production server at the Computer History Museum. The 1999 rack predates MapReduce. Point to the exposed computers: software coordinating many machines needs a way to finish even when one fails.
- **Two sides of the 2009–10 debate:** Google: MR beats DBMSs with care and doesn't need a schema before running queries (good for text processing, ETL). DBMS community: MR re-introduces problems that parallel DBMSs had already solved (indexing, parsing, push vs. pull, recovery); higher-level languages over partitioned tables are a better programming model.
- **How it ended (paper):** (1) the Hadoop services market "cratered" in the 2010s: developers struggled to shoehorn applications into MR. SQL layers like Hive appeared. (2) Google announced it was moving crawl processing from MR to BigTable (needed real-time updates; MR is batch), and in 2014 announced MR had no place in its stack.
- **Vendor irony:** Cloudera built the RDBMS Impala on HDFS *without* Hadoop; MapR built Drill directly on HDFS; Meta replaced Hive with Presto.

## Relational lens
Hadoop and MR lost as interface, but left real legacies: **scale-out and fault tolerance** ideas now inside distributed RDBMSs; **shared-disk with disaggregated storage** (see [Cloud & lakehouse](21-cloud-lakehouse.md)); open file formats; and successor engines (Spark, Flink) that started with procedural APIs and have since added SQL.

## Coming from… [13 Object-oriented DBs](13-object-oriented-databases.md)
The OODB debate was about *how richly* data should be modelled. MapReduce deliberately ignored modelling: no schema, no types, no query language, just code over files. This is a swing of the pendulum from "describe data richly" to "just give me raw throughput". Notice how each wave rejects the previous wave's *priority*, and that this one attacks the **language** category directly: transformations as hand-written functions instead of declarative queries.

## Leading to… [17 Key-value stores](17-key-value-stores.md)
A batch can rebuild an index, but a shopper wants to update one cart while the page is open. If the request already contains the cart ID, the service can use that key to fetch or replace just that cart.

## Sources
- [SP24] §2.1 (refs 122 MR, 134 GFS, 172 comparison study, 123/190 dueling CACM articles, 30/197 Hive, 150 Impala, 22 Drill, 185 Presto, 164 move to BigTable, 194 Google kills MR, 201 Spark, 109 Flink).
- [Dean04] OSDI 2004. [Pavlo09] SIGMOD 2009.
- [Wikipedia: MapReduce](https://en.wikipedia.org/wiki/MapReduce), [Apache Hadoop](https://en.wikipedia.org/wiki/Apache_Hadoop).
- Java vs SQL: [`SecondarySort.java`](https://github.com/apache/hadoop/blob/trunk/hadoop-mapreduce-project/hadoop-mapreduce-examples/src/main/java/org/apache/hadoop/examples/SecondarySort.java) in the Apache Hadoop examples (Apache License 2.0).
- Photo: [*Google’s First Production Server (1999), detail at the Computer History Museum*](https://commons.wikimedia.org/wiki/File:Google%27s_First_Production_Server_%281999%29_detail_-_Computer_History_Museum_%282007-11-10_23.05.45_by_Carlo_Nardone%29.jpg), Carlo Nardone, [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/).
- Confidence: high (paper-based).
