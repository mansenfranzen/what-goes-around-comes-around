# 20 · Open table formats (2018 →)

[← 16 Columnar storage](16-columnar-warehouses.md) · [Index](../README.md) · [Next → 22 Vector databases](22-vector-databases.md)

| | |
|---|---|
| **Era** | Late 2010s; 2018 marks the public release of Iceberg |
| **Category** | Primitives: transactional table metadata over files |
| **Key systems** | Apache Iceberg, Delta Lake, Apache Hudi |
| **Verdict** | Adopted inside lakehouses |

## The problem
Two engines share a sales folder. A writer replaces yesterday's file with a corrected one. A reader listing the folder halfway through could count yesterday twice. Parquet tells it how to read each file, not which files belong to the table.

## The idea
An open **table format** specifies how engines identify a committed table version. In Iceberg, a writer prepares data and metadata, then atomically switches the table's metadata pointer. Readers that started on the old snapshot can finish there; new readers see the correction.

```
snapshot 1: sales-mon.parquet + sales-tue.parquet
snapshot 2: sales-mon.parquet + sales-tue-fixed.parquet
```

## How to explain it
**Demo:** two engines race to find sale 742 in the same 24 Parquet files. Engine A has only the folder: it lists it and opens every footer to learn each file's ID range (26 requests, 24 files opened). Engine B follows the Iceberg metadata as an index: `metadata.json` → manifest list (ranges per manifest rule out three of four manifests) → one manifest (ranges per file rule out five of six files) → one data file (4 requests, 1 file opened). Bounds rule files out, not individual rows in: the one remaining file still has to be read.

## Coming from… [16 Columnar storage](16-columnar-warehouses.md)
- **Performance:** Parquet projects columns and skips row groups *within* a file. A manifest stores file-level statistics separately, so planning can skip irrelevant files without opening their footers.
- **Scalability:** the metadata is logically central, not one giant index on one machine. In Iceberg a snapshot points to a manifest list; its partition summaries can eliminate whole manifests before workers inspect the remaining entries.
- **ACID:** skipping files is an optimization, not a transaction guarantee. Writers validate conflicts and atomically publish a durable table version. Each reader stays on its chosen snapshot, so a multi-file replacement is visible all at once or not at all. This is a table-level guarantee, not a general multi-table transaction.

## Leading to… [22 Vector databases](22-vector-databases.md)
A snapshot answers “which records exist?” It does not answer “which records are closest in meaning?” That workload calls for embeddings and a different index.

## Sources
- [Apache Iceberg: table specification](https://iceberg.apache.org/spec/) — snapshots, manifests and atomic commits.
- [Netflix: Iceberg, a fast table format for S3 (2018)](https://netflixtechblog.com/iceberg-fast-tables-for-s3-26cc32a429e2).
