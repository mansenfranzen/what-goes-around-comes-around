# 17 · Key-value stores (2003–07)

[← 14 MapReduce / Hadoop](14-mapreduce-hadoop.md) · [Index](../README.md) · [Next → 19 Document databases](19-document-databases.md)

| | |
|---|---|
| **Era** | 2000s web scale |
| **Verdict** | Absorbed as a map type; dedicated stores still serve keyed workloads |
| **Category** | **Model**: each key names one value |
| **Key systems** | Memcached (2003); Amazon Dynamo (2007) → DynamoDB; Redis; embedded: BerkeleyDB, LevelDB, RocksDB, WiredTiger |
| **In the app** | Timeline → "Key-Value", demo: find the same cart by scanning boxes or hashing its key |

## Summary
The simplest possible data model: a binary relation `(key, value)`, with the value an opaque blob. Operations: get, set, delete.

## Category
The model is a mapping: each key names a value, whether the engine finds it by scanning, hashing or searching a tree. A relational system can hold that mapping in a column: for example, a DuckDB `MAP(VARCHAR, INTEGER)` can associate each item code in a cart with its quantity.

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
- **Demo:** find the requested cart in the unsorted boxes, then hash its key and open the indicated bucket. The access path changes, but the key and its value do not.
- **Paper's caution:** "it is dangerous to use a KV store in a complex application." Joins, multi-get and secondary indexes must be written by the application.
- **The evolution pattern:** several KV systems morphed into record stores with semi-structured values (DynamoDB and Aerospike), but "it is not trivial to re-engineer a KV store to make it support a complex data model, whereas RDBMSs easily emulate KV stores without any changes."
- **Embedded engines became building blocks:** MySQL exposed a storage-engine API; Meta used it to build RocksDB-based storage for its MySQL fleet; MongoDB replaced its ill-fated MMAP engine by WiredTiger's KV store in 2014. Building a new DBMS on an embedded KV store saves years.

## Relational lens
The mapping can be a two-column relation with a unique key, or a `MAP` value inside a larger row. With a map of items in each cart row, SQL can still join the cart to its customer.

## Coming from… [14 MapReduce / Hadoop](14-mapreduce-hadoop.md)
MapReduce processes a whole dataset. A cart service usually knows which record it needs: `get(cart_id)` reads that cart, and `put(cart_id, cart)` saves the change without launching a batch job.

## Leading to… [19 Document databases](19-document-databases.md)
A key names a whole cart, not a field inside it. A document store can index nested fields and find every cart that contains a particular item.

## Sources
- [SP24] §2.2 (refs 131 Memcached, 67 Redis, 125 Dynamo, 170 BerkeleyDB, 37 LevelDB, 68 RocksDB, 129 DynamoDB, 9 Aerospike, 71 SQLite, 180 DuckDB, 120/138 WiredTiger).
- [DeC07] Dynamo, SOSP 2007.
- [Wikipedia: Key–value database](https://en.wikipedia.org/wiki/Key–value_database), [Dynamo (storage system)](https://en.wikipedia.org/wiki/Dynamo_(storage_system)), [Redis](https://en.wikipedia.org/wiki/Redis), [Memcached](https://en.wikipedia.org/wiki/Memcached), [SQLite](https://en.wikipedia.org/wiki/SQLite), [DuckDB](https://en.wikipedia.org/wiki/DuckDB).
- Image: hash table diagram; Jorge Stolfi, CC BY-SA 3.0, Wikimedia Commons.
- Confidence: high (paper-based).
