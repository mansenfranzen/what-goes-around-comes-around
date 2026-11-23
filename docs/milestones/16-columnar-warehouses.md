# 16 · Columnar warehouses (2013 →)

[← 21 Cloud databases](21-cloud-lakehouse.md) · [Index](../README.md) · [Next → 20 Open table formats](20-open-table-formats.md)

| | |
|---|---|
| **Era** | Data-warehouse era (mid-1990s onward); column stores from the mid-2000s |
| **Verdict** | **Winner** (a revolution *inside* the relational model) |
| **Category** | **Primitives**: physical layout (column-wise storage, compression, vectorized execution) |
| **Key systems** | Sybase IQ, MonetDB, C-Store → Vertica, Amazon Redshift, Google BigQuery, Snowflake |
| **In the app** | Timeline → "Columnar warehouses", demo: row store vs. column store reads for `SUM(price)` |

## Summary
Store each **column** contiguously instead of each row. Analytical queries read only the columns they need, compress well, and run in tight vectorized loops.

## Category
A pure primitives story: same tables, same SQL, completely different physical layout. It is the best proof of Codd's decoupling. Because queries never mention storage, vendors could replace row stores with column stores without users rewriting a single query.

## Context (paper §3.1)
- From the mid-1990s enterprises (Walmart is the paper's example) started collecting sales data in **data warehouses**; the investment reportedly paid itself off within months through better stock decisions.
- Warehouse workloads: historical, loaded periodically then read-only; retain everything (terabytes to petabytes); queries touch few attributes and are ad hoc.
- Ralph Kimball popularized the **star schema**: a large fact table surrounded by dimension tables (customer, product, store, time).
- Over two decades, "all vendors active in the data warehouse market" converted from row stores to column stores; new entrants arrived (Redshift, BigQuery, Snowflake).

## The problem
A typical analytical query such as `SELECT SUM(price) FROM sales` touches one column of dozens. A row store drags every other column from disk too (and each row has a header of around 20 bytes for nulls and versioning).

## The idea
```
row store    : id1 name1 city1 price1 qty1 | id2 name2 city2 price2 qty2 | …
column store : price1 price2 price3 …      (read only this list)
               city1  city2  city3  …
```
Benefits (paper): (1) better **compression**, since a block holds one type and many repeats; (2) **vectorized** execution with an inner loop over a whole column instead of one operator call per row; (3) minimal per-record overhead.

## How to explain it
- **Analogy:** an index card file where you keep all names in one drawer and all prices in another. If you only need prices you open one drawer.
- **Demo:** toggle row/column store in the app and watch "values read" fall from 30 to 6.
- **Key framing:** this is **not a new data model**. It is a new *implementation* of relational + SQL, with specialized optimizers, executors and storage formats. A genuine architectural breakthrough that did not need SQL replaced.

## Relational lens
It *is* relational. This is the poster child for the paper's second theme: "the major advancements have been in the RM systems, primarily driven by changing hardware characteristics."

## Coming from… [21 Cloud databases](21-cloud-lakehouse.md)
Cloud workers share storage. A Parquet reader can fetch just the columns its query needs. The 2013 stop marks Parquet, not the invention of column stores.

## Leading to… [20 Open table formats](20-open-table-formats.md)
Parquet describes one file. Checking individual footers for a matching sale becomes expensive as the file count grows, and no footer says whether a replacement file was committed. Table metadata lets engines prune whole groups of files and read a consistent version across a multi-file update.

## Sources
- [SP24] §3.1 (refs 87 compression, 106/147 vectorized engines, 148/149 Kimball, 94 Redshift, 162 BigQuery, 121 Snowflake).
- [Stone05] C-Store (VLDB 2005). [Snow16] Snowflake (SIGMOD 2016).
- [Wikipedia: Column-oriented DBMS](https://en.wikipedia.org/wiki/Column-oriented_DBMS), [Data warehouse](https://en.wikipedia.org/wiki/Data_warehouse), [Apache Parquet](https://en.wikipedia.org/wiki/Apache_Parquet).
- Image: Apache Parquet logo; Apache Software Foundation (public domain per Commons), Wikimedia Commons: stand-in for the columnar file format.
- Confidence: high (paper-based).
