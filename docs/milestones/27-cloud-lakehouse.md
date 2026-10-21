# 27 · Cloud databases and lakehouses (2013 →)

[← 26 NewSQL & Spanner](26-newsql-spanner.md) · [Index](../README.md) · [Next → 28 Vector databases](28-vector-databases.md)

| | |
|---|---|
| **Era** | 2010s–2020s |
| **Verdict** | **Winner**: "the OLAP DBMS archetype for the next ten years" (paper) |
| **Key systems** | Snowflake; Amazon Redshift, Aurora; Google BigQuery; Databricks; Dremio; Presto/Trino; formats Parquet, ORC, Arrow; table layers Delta Lake, Iceberg, Hudi |
| **In the app** | Timeline → "Cloud & lakehouse", demo: slide compute nodes, storage unchanged |

## Summary
Separate **compute** from **storage**: data lives in cheap **object storage** in **open formats**; elastic compute nodes query it. SQL stays on top.

## Context (paper §§3.2–3.3)
- Early cloud DBMS offerings simply repackaged on-prem systems into managed VMs with direct-attached storage.
- Over 20 years networking bandwidth rose much faster than disk bandwidth, making **network-attached storage** attractive. Cloud vendors offer **object stores** (e.g. Amazon S3).
- Advantages: per-query **elasticity** (add compute without reshuffling), reassigning idle compute, and **pushing computation to storage**. The first two ideas, called *serverless*, were introduced for cloud-native DBMSs by Snowflake. A multi-tenant execution scheme is needed.
- The **data lake**: applications drop files directly into an object store, bypassing the DBMS gatekeeper. A **lakehouse** engine queries the files. Parquet (Twitter/Cloudera) and ORC (Meta) are the popular formats; Arrow is for in-memory exchange. Delta Lake, Iceberg and Hudi add transactional metadata that "make lakehouses look more like a traditional data warehouse".
- Data scientists mostly use Python **DataFrames** (pandas), spawning Dask, Polars, Modin, Bodo.

## The problem
Provisioned clusters are expensive and rigid; proprietary warehouse storage locks data in; data scientists do not want to load everything into one system before using it.

## The idea
```
s3://lake/sales/part-0001.parquet           ← data, in an open format
SELECT region, SUM(amt) FROM sales GROUP BY region;   ← run on any engine
```
Scale compute up or down per query. Multiple engines (SQL, DataFrame, ML) read the same files.

## How to explain it
- **Analogy:** a shared library with a reading room you can rent by the hour, versus buying a private library and a reading room together.
- **Demo:** slide the compute-node count; query time shrinks, data movement stays at 0.
- **"What goes around":** shared-disk multi-node DBMSs "historically tended not to work out well" but are back in vogue because of faster networks. Time-sharing was popular in the 1970s; cloud platforms are "big time-sharing services".
- **Challenges (paper):** governance without control ("a recipe for integrity, discovery, and versioning problems"), missing statistics on newly ingested files leading to poor plans, hence **adaptive query processing**.
- **Business angle:** open-source vendors risk being monetized by the cloud providers (paper cites the public spats around MongoDB and Elasticsearch).
- **Paper's forecast:** "Except for embedded DBMSs, any product not starting with a cloud offering will likely fail."

## Relational lens
The model is unchanged; the **architecture** was rebuilt. Note again: the big changes were inside relational systems.

## Coming from… [26 NewSQL & Spanner](26-newsql-spanner.md)
NewSQL scaled out OLTP with shared-nothing nodes. Cloud/lakehouse scaled **OLAP** by decoupling storage and compute, with big shifts in economics. Also, Hadoop's legacy shows here: HDFS-style shared-disk with disaggregated storage was revived by MR, and later moved to object stores ([MapReduce](19-mapreduce-hadoop.md)).

## Leading to… [28 Vector databases](28-vector-databases.md)
**What changed in the workload:** data lakes now serve not only SQL analysts but **data scientists and ML engineers**, increasingly building models that convert text, images and records into **embeddings**. A new query type emerges (find the *nearest* items to this vector), which neither traditional indexes nor SQL predicates handle well. By 2022 the arrival of ChatGPT made this a mainstream developer need.

## Sources
- [SP24] §3.2 and §3.3 (refs 121 Snowflake, 167 data lakes, 93 lakehouse, 55 Parquet, 53/140 ORC, 11 Arrow, 92/6/5 Delta/Iceberg/Hudi, 159 pandas, 181/61/177/198 Dask/Polars/Modin/Bodo, 154 statistics problem, 97/105/163 adaptive processing, 153/101 cloud vendor disputes).
- [Snow16] Snowflake; [Lake21] CIDR 2021.
- [Wikipedia: Data lake](https://en.wikipedia.org/wiki/Data_lake), [Data lakehouse](https://en.wikipedia.org/wiki/Data_lakehouse), [Apache Parquet](https://en.wikipedia.org/wiki/Apache_Parquet), [Delta Lake](https://en.wikipedia.org/wiki/Delta_Lake), [Apache Iceberg](https://en.wikipedia.org/wiki/Apache_Iceberg), [Amazon Aurora](https://en.wikipedia.org/wiki/Amazon_Aurora).
- Image: a data center; BalticServers.com, CC BY-SA 3.0, Wikimedia Commons.
- Confidence: high (paper-based).
