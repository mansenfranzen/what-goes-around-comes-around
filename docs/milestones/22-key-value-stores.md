# 22 · Key-value stores (2003–07)

[← 21 Columnar warehouses](21-columnar-warehouses.md) · [Index](../README.md) · [Next → 23 Graph databases](23-graph-databases.md)

| | |
|---|---|
| **Era** | 2000s web scale |
| **Verdict** | Niche survivor (many matured into richer systems; others became embedded storage engines) |
| **Key systems** | Memcached (2003); Amazon Dynamo (2007) → DynamoDB; Redis; embedded: BerkeleyDB, LevelDB, RocksDB, WiredTiger |
| **In the app** | Timeline → "Key-value stores", demo: put/get on hash buckets; "find by value" scan |

## Summary
The simplest possible data model: a binary relation `(key, value)`, with the value an opaque blob. Operations: get, set, delete.

## Context (paper §2.2)
- In the 2000s several internet companies built **distributed shared-nothing** KV stores for narrow uses (caching, sessions). Memcached is the well-known cache; Redis markets itself as a Memcached replacement with richer API and checkpointing.
- For persistent data, Amazon created **Dynamo** (2007), trading functionality for higher and more predictable performance.
- A second category are **embedded** storage managers in the application's address space: BerkeleyDB (early 1990s), Google's LevelDB and Meta's RocksDB fork.

## The problem
An RDBMS is overkill (and was hard to scale out) for "store this session blob under this id, fast, always". Operators wanted predictable latency and availability, with minimal setup.

## The idea
```
put("user:1", "{…blob…}")
get("user:1")
// no "find users where city = Paris"
```
Hash the key to choose a node or bucket. The DBMS does not look inside the value; the application owns the schema and parsing.

## How to explain it
- **Analogy:** a coat check. Hand over the ticket (key), get the coat (value). It cannot find "all red coats".
- **Demo:** the app's hash-bucket view: `get` takes one step; "find city=Paris" requires scanning every blob because there is no secondary index.
- **Paper's caution:** "it is dangerous to use a KV store in a complex application." Joins, multi-get and secondary indexes must be written by the application.
- **The evolution pattern:** several KV systems morphed into record stores with semi-structured values (DynamoDB and Aerospike), but "it is not trivial to re-engineer a KV store to make it support a complex data model, whereas RDBMSs easily emulate KV stores without any changes."
- **Embedded engines became building blocks:** MySQL exposed a storage-engine API; Meta used it to build RocksDB-based storage for its MySQL fleet; MongoDB replaced its ill-fated MMAP engine by WiredTiger's KV store in 2014. Building a new DBMS on an embedded KV store saves years.

## Relational lens
A KV store is a two-column table. If the application grows, the relational option offers a path forward, and embedded RDBMSs (SQLite, DuckDB) are full-featured alternatives. So a relational system can be "better even for simple applications".

## Coming from… [21 Columnar warehouses](21-columnar-warehouses.md)
Columnar showed that specialization works when workload is understood. KV stores are the **opposite extreme**: strip functionality to the bone to maximize speed and availability for a narrow OLTP workload.

## Leading to… [23 Graph databases](23-graph-databases.md)
**What KV could not do:** capture *relationships* between things. Opaque blobs hide structure, so "who are Alice's friends' friends?" means many round trips and client-side joins. Two directions add structure back to KV: **edges** (the graph model, next) and **nested fields** (the document model, after that). Chronologically both arrive around 2007–2009; conceptually each starts with "a key-value store isn't enough".

## Sources
- [SP24] §2.2 (refs 131 Memcached, 67 Redis, 125 Dynamo, 170 BerkeleyDB, 37 LevelDB, 68 RocksDB, 129 DynamoDB, 9 Aerospike, 71 SQLite, 180 DuckDB, 120/138 WiredTiger).
- [DeC07] Dynamo, SOSP 2007.
- [Wikipedia: Key–value database](https://en.wikipedia.org/wiki/Key–value_database), [Dynamo (storage system)](https://en.wikipedia.org/wiki/Dynamo_(storage_system)), [Redis](https://en.wikipedia.org/wiki/Redis), [Memcached](https://en.wikipedia.org/wiki/Memcached), [SQLite](https://en.wikipedia.org/wiki/SQLite), [DuckDB](https://en.wikipedia.org/wiki/DuckDB).
- Image: hash table diagram; Jorge Stolfi, CC BY-SA 3.0, Wikimedia Commons.
- Confidence: high (paper-based).
