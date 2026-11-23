# 20 · Open table formats (2018 →)

[← 21 Cloud databases](21-cloud-lakehouse.md) · [Index](../README.md) · [Next → 22 Vector databases](22-vector-databases.md)

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
Ask the audience to count Tuesday's sales before and after the commit. The corrected file can already exist in storage without belonging to the current snapshot. Different engines that support the format can agree on the same answer without sharing an execution engine.

## Coming from… [21 Cloud databases](21-cloud-lakehouse.md)
Separating compute from storage lets many engines reach the same files. Table metadata lets them agree on which files to read together.

## Leading to… [22 Vector databases](22-vector-databases.md)
A snapshot answers “which records exist?” It does not answer “which records are closest in meaning?” That workload calls for embeddings and a different index.

## Sources
- [Apache Iceberg: table specification](https://iceberg.apache.org/spec/) — snapshots, manifests and atomic commits.
- [Netflix: Iceberg, a fast table format for S3 (2018)](https://netflixtechblog.com/iceberg-fast-tables-for-s3-26cc32a429e2).
