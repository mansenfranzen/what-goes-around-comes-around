# 19 · MapReduce and Hadoop (2003–2014)

[← 18 XML databases](18-xml-databases.md) · [Index](../README.md) · [Next → 20 Bigtable](20-bigtable-column-family.md)

| | |
|---|---|
| **Era** | 2003–2014 ("Big Data" era) |
| **Verdict** | **Dead end**: died as a general platform; ideas live on |
| **Key systems** | Google MapReduce and GFS; Yahoo's Hadoop with HDFS (2005); Hive (Meta); Impala (Cloudera); Drill (MapR); Presto (Meta); Spark; Flink |
| **In the app** | Timeline → "MapReduce / Hadoop", demo: word-count animation |

## Summary
Programmers write `map()` and `reduce()`; the framework distributes work over thousands of cheap machines and recovers from failures. In database terms: **a UDF plus GROUP BY**, executed as a batch.

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
- **Two sides of the 2009–10 debate:** Google: MR beats DBMSs with care and doesn't need a schema before running queries (good for text processing, ETL). DBMS community: MR re-introduces problems that parallel DBMSs had already solved (indexing, parsing, push vs. pull, recovery); higher-level languages over partitioned tables are a better programming model.
- **How it ended (paper):** (1) the Hadoop services market "cratered" in the 2010s: developers struggled to shoehorn applications into MR. SQL layers like Hive appeared. (2) Google announced it was moving crawl processing from MR to BigTable (needed real-time updates; MR is batch), and in 2014 announced MR had no place in its stack.
- **Vendor irony:** Cloudera built the RDBMS Impala on HDFS *without* Hadoop; MapR built Drill directly on HDFS; Meta replaced Hive with Presto.

## Relational lens
Hadoop and MR lost as interface, but left real legacies: **scale-out and fault tolerance** ideas now inside distributed RDBMSs; **shared-disk with disaggregated storage** (see [Cloud & lakehouse](27-cloud-lakehouse.md)); open file formats; and successor engines (Spark, Flink) that started with procedural APIs and have since added SQL.

## Coming from… [18 XML databases](18-xml-databases.md)
XML worried about structure and semantics; MR deliberately ignored both. This is a swing of the pendulum: from "describe data richly" to "just give me raw throughput". Notice how each wave rejects the last wave's *priority*.

## Leading to… [20 Bigtable](20-bigtable-column-family.md)
**What MapReduce could not do:** it is a **batch** system. Google needed to update its crawl database **interactively, in real time**. Eight months after the 2010 CACM debate article, Google announced it was moving crawl processing to BigTable. Bigtable (built around 2004, in parallel to MR) is the online counterpart: a distributed, updatable table store.

## Sources
- [SP24] §2.1 (refs 122 MR, 134 GFS, 172 comparison study, 123/190 dueling CACM articles, 30/197 Hive, 150 Impala, 22 Drill, 185 Presto, 164 move to BigTable, 194 Google kills MR, 201 Spark, 109 Flink).
- [Dean04] OSDI 2004. [Pavlo09] SIGMOD 2009.
- [Wikipedia: MapReduce](https://en.wikipedia.org/wiki/MapReduce), [Apache Hadoop](https://en.wikipedia.org/wiki/Apache_Hadoop).
- Image: Apache Hadoop logo; Apache Software Foundation (Apache License 2.0), Wikimedia Commons.
- Confidence: high (paper-based).
