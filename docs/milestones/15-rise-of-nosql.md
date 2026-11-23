# 15 · The rise of NoSQL (2005–2009)

[← 14 MapReduce / Hadoop](14-mapreduce-hadoop.md) · [Index](../README.md) · [Next → 17 Key-value stores](17-key-value-stores.md)

| | |
|---|---|
| **Verdict** | Enduring trade-off |
| **Category** | **Primitives:** partition by key and limit transaction scope. **Language:** offer keyed reads and writes instead of general SQL. |
| **Historical anchor** | Amazon published Dynamo in 2007. The 2009 NoSQL meetup gave a wider movement a name, not a common specification. |
| **In the app** | Timeline → “The Rise of NoSQL”; spread cart writes across shards, then try a search and a reservation. |

## Summary
A storefront might serve millions of different carts, yet almost every request is the same: read or update *this* cart. Early NoSQL teams designed for the requests they could predict. Partitioning by cart ID let new servers take a share of the traffic; keeping each operation within one partition kept an unrelated slow shard out of its response time.

## The problem
Traffic and data had outgrown one machine. Adding servers could spread the load, but it also meant more networks and machines that could be slow or unavailable. Two distinct parts of a general-purpose database became important design choices:

- **Planning a query.** SQL lets the user say *what* to return. A distributed SQL compiler and optimizer must decide *how*: which server has the data, where to join it and how much data to move. A request like `get(cart_id)` already names the access path. A store built for that request need not implement a general query planner. SQL can also execute a keyed lookup efficiently; the saving was in what the engine had to support.
- **Committing a transaction.** If a change must debit one account and credit another on a different shard, both must commit or neither may commit. That takes coordination even when the access paths are known. Limiting transactions to one record avoids the cross-shard commit; it does not mean that record is updated only halfway or that durability disappears.

## Why low latency mattered
Amazon measured service latency at the **99.9th percentile**: the slowest one in a thousand requests mattered, even if the average looked fine. Its Dynamo paper describes carts and sessions that needed primary-key access, not arbitrary queries or multi-item transactions. Direct routing avoided an extra network hop; limiting updates to one key avoided cross-key commit. Replicas of *that one key* could still exchange messages. One shard does not mean one physical copy.

## How to explain it
1. **Save 12 carts.** One shard can serve one write per round. Give four shards three different carts each and the last request finishes in three rounds instead of twelve. These are illustrative service rounds, not a benchmark. More shards shorten the queue for independent keys; they do not speed up a single hot key.
2. **Find carts with tea.** “Which carts contain tea?” is a different question from “What's in cart 02?” There is no SQL `WHERE` or optimizer in this store. The app must fetch each known cart or maintain an index for that new question.
3. **Reserve the last tea.** The cart write succeeds; the stock write fails. Neither write is torn, but two puts are not a transaction. If stock and cart must change together, the app needs a coordination protocol, a different data layout, or a store that guarantees a cross-key commit.

## Relational lens
The bargain was not “SQL cannot scale.” It was “we know the operations we need, so why build and operate a general distributed database for them?” The application then owns the missing joins, access paths or conflict rules. When those guarantees *are* worth their cost, a different design makes sense. Google's F1 combined a distributed SQL engine with strong transactions on Spanner for its advertising business; its authors explicitly discuss the extra commit latency. See [SQL vs. NoSQL vs. NewSQL](../sql-nosql-newsql.md) for the wider comparison.

## Coming from… [14 MapReduce / Hadoop](14-mapreduce-hadoop.md)
A batch job can rebuild the web index overnight. A live service needs to update one page or fetch one cart now. Specific keyed operations made it practical to spread that online traffic across a cluster.

## Leading to… [17 Key-value stores](17-key-value-stores.md)
Sharding routes a cart request to one machine. What does that machine need to support? For a cart fetched by ID, a get/put interface is enough.

## Sources
- DeCandia et al., [Dynamo: Amazon's Highly Available Key-value Store](https://www.allthingsdistributed.com/2007/10/amazons_dynamo.html) (SOSP 2007), §§2.1–2.2, 3.3, 4.1–4.2 and 6.4: the query and transaction limits, tail-latency targets, partitioning, and the measured effect of skipping a routing hop.
- Martin Fowler, [Nosql Definition](https://martinfowler.com/bliki/NosqlDefinition.html) (2012): the June 2009 meetup gave an existing wave of systems a name, not a single technical specification.
- Shute et al., [F1: A Distributed SQL Database That Scales](https://research.google/pubs/f1-a-distributed-sql-database-that-scales/) (VLDB 2013): distributed SQL, consistency and the cost of synchronous commits.