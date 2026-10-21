# 26 · NewSQL and Spanner (2011–12)

[← 25 Blockchain databases](25-blockchain-databases.md) · [Index](../README.md) · [Next → 27 Cloud & lakehouse](27-cloud-lakehouse.md)

| | |
|---|---|
| **Era** | Early 2010s → today |
| **Verdict** | **Winner** (as an idea; direct adoption was modest) |
| **Key systems** | In-memory: H-Store → VoltDB, SingleStore, Microsoft Hekaton, HyPer. Disk-based: NuoDB, Clustrix. Successors: Google Spanner, CockroachDB, TiDB, YugabyteDB, PlanetScale (on Vitess) |
| **In the app** | Timeline → "NewSQL & Spanner", demo: transfer money with a crash, with and without ACID |

## Summary
Distributed **relational** databases that scale out like NoSQL but keep **SQL and ACID transactions**.

## Context (paper §3.4)
- In the late 2000s many distributed NoSQL DBMSs could scale horizontally for large OLTP workloads, but many organizations could not give up strong transactions. Existing RDBMSs, especially open-source, could not natively scale across machines.
- NewSQL arrived in the early 2010s to give "the same scalability of NoSQL DBMSs from the 2000s but still keep the RM and ACID transactions of the legacy DBMSs from the 1990s".
- Two groups: in-memory DBMSs and disk-oriented distributed DBMSs.
- NoSQL vendors then added transactions too (MongoDB, Cassandra, DynamoDB). Google, in 2012, "discarded eventual consistency in favor of real transactions with Spanner".

## The problem
"Either scale or have transactions" is a false choice for banks, retail, bookings. Single-node RDBMSs hit limits; NoSQL systems pushed consistency work onto application developers.

## The idea
```
BEGIN;
  UPDATE acct SET bal = bal - 50 WHERE id = 1;   -- on node A
  UPDATE acct SET bal = bal + 50 WHERE id = 2;   -- on node B
COMMIT;                                          -- atomic across nodes
```
Techniques: sharding with distributed transactions, consensus replication, in-memory execution, and in Spanner's case globally synchronized clocks (TrueTime) for ordering.

## How to explain it
- **Analogy:** a bank with branches in many cities that still balances at the end of the day: no money lost during a transfer even if one branch's connection drops.
- **Demo:** the app transfers $50 and crashes node B mid-way. Without a transaction, $50 vanishes; with one, the debit is rolled back.
- **Why it didn't explode in adoption (paper):** existing DBMSs were "good enough"; companies are risk-averse with OLTP (failure = lost revenue); NewSQL products supported only SQL subsets or had poor multi-node transaction performance; Hekaton was only an extension of a legacy DBMS; vendors overestimated in-memory adoption because flash got cheap and persistent memory (Intel Optane) collapsed.
- **What remained:** a crop of distributed transactional SQL RDBMSs (TiDB, CockroachDB, PlanetScale, YugabyteDB).

## Relational lens
Direct validation of the thesis: NoSQL's detour led back to SQL + ACID, now **distributed**.

## Coming from… [25 Blockchain databases](25-blockchain-databases.md)
Blockchain was a tangent. The *causal* parent of NewSQL is the NoSQL boom ([24](24-document-databases.md), [22](22-key-value-stores.md), [20](20-bigtable-column-family.md)): it exposed that dropping SQL and ACID created more pain than it saved.

## Leading to… [27 Cloud & lakehouse](27-cloud-lakehouse.md)
**What shared-nothing NewSQL did not address:** operating clusters is costly and rigid: nodes must always be online and data must be reshuffled to resize. Meanwhile network bandwidth grew faster than disk bandwidth, and cloud object stores (S3 etc.) became cheap and durable. The next architecture splits **compute from storage**: elastic, serverless, multi-tenant, with open file formats on object storage. That is where analytics moved first.

## Sources
- [SP24] §3.4 (refs 95/171 NewSQL, 144/189/83 H-Store/VoltDB, 69 SingleStore, 128 Hekaton, 146 HyPer, 47 NuoDB, 17 Clustrix, 96 adoption, 141 TiDB, 195 CockroachDB, 60 PlanetScale, 80 Vitess, 86 YugabyteDB, 119 Spanner).
- [PA16] Pavlo & Aslett, SIGMOD Record 2016. [Corb12] Spanner, OSDI 2012.
- [Wikipedia: NewSQL](https://en.wikipedia.org/wiki/NewSQL), [Spanner (database)](https://en.wikipedia.org/wiki/Spanner_(database)), [H-Store](https://en.wikipedia.org/wiki/H-Store), [VoltDB](https://en.wikipedia.org/wiki/VoltDB), [CockroachDB](https://en.wikipedia.org/wiki/CockroachDB).
- Image: NIST-F2 cesium atomic clock; NIST, public domain, Wikimedia Commons: symbolic of Spanner's TrueTime, not a photo of Google hardware.
- Confidence: high (paper-based); Spanner-TrueTime link from the Spanner paper.
