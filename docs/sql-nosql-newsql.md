# SQL vs. NoSQL vs. NewSQL

[← Index](README.md) · Companion to [15 The rise of NoSQL](milestones/15-rise-of-nosql.md) and [19 Document databases](milestones/19-document-databases.md).

A deep dive for the Q&A and for an optional 5-minute segment at stop 19. It replaces the former stand-alone NewSQL milestone: NewSQL is told here as the *resolution* of the NoSQL story rather than as its own stop.

## The one-sentence version
**Early NoSQL stores made known requests easier to scale by narrowing the query interface or the guarantees that needed coordination. Distributed SQL kept a general query engine and cross-shard transactions for workloads that needed them.**

In the talk's three categories:

| | Primitives (storage & access) | Language (declarative querying) | Model (relations, keys, logical/physical split) |
|---|---|---|---|
| **Classic SQL** (1970s →) | Single node, B-trees, write-ahead log, locking | SQL | Relational |
| **Early NoSQL** | Partitioning and replication tailored to the workload | Keyed APIs or model-specific queries, often without general SQL | Key-value, wide-column, document, graph |
| **NewSQL** (2011 →) | **Rebuilt:** auto-sharding, consensus replication, distributed transactions | **Kept:** SQL | **Kept:** relational |

The two choices were independent. A keyed API removed the need to build a compiler and optimizer for arbitrary SQL; a one-key write contract removed the need to coordinate a commit across shards. Dynamo made both choices for services such as shopping carts. A distributed SQL engine can also route a keyed lookup to one shard, but it must support the other queries and guarantees it advertises.

## Timeline and naming

| Year | Event |
|------|-------|
| 1970s–2000s | Relational DBMSs dominate OLTP and OLAP; scale = bigger machine, read replicas, or manual sharding of MySQL/PostgreSQL in application code |
| 1998 | Carlo Strozzi names his lightweight relational database without an SQL interface "NoSQL" (unrelated to the later movement) |
| 2000 / 2002 | Eric Brewer's **CAP** conjecture (PODC keynote); proved by Gilbert & Lynch (2002) |
| 2005–2007 | Google Bigtable (in production April 2005, paper 2006) and Amazon Dynamo (paper 2007): two influential designs that predated the movement's name |
| 2008–2009 | Cassandra (open-sourced by Facebook/Meta), HBase, MongoDB (2009), CouchDB, Redis |
| 2009 | Johan Oskarsson reuses "NoSQL" as the name of a meetup on open-source distributed, non-relational databases; the label sticks |
| 2011 | Matthew Aslett (451 Group) coins **"NewSQL"** |
| 2012 | Google's **Spanner** paper (OSDI): globally distributed, externally consistent transactions; Google "discarded eventual consistency in favor of real transactions" (paper) |
| 2013 | Google F1 (VLDB): AdWords moves from sharded MySQL to a SQL system on Spanner |
| 2014–2016 | PostgreSQL `JSONB` (2014); SQL:2016 adds JSON; CockroachDB, TiDB, YugabyteDB appear; Pavlo & Aslett's "What's Really New with NewSQL?" (2016) |
| 2017–2021 | Spanner becomes a full SQL system (SIGMOD 2017); MongoDB 4.0 multi-document ACID (2018); DynamoDB transactions (2018); MongoDB SQL interface for Atlas (2021) |
| 2020s | "NoSQL" reread as "Not only SQL"; NewSQL usually marketed as **distributed SQL** |

Dates of products are first public releases or papers; see the confidence note at the end.

## Why NoSQL happened (the real requirements)
It is easy to mock NoSQL in hindsight. Present the *environmental requirements* fairly, because this is the same pattern as the tally bone and the card catalog: a real pain led to an invention.

1. **Write scale beyond one machine.** Web companies had OLTP workloads (sessions, carts, feeds, messages) that outgrew the largest affordable server. Read replicas do not help with writes. Manually sharding MySQL worked but moved routing, rebalancing and cross-shard queries into application code.
2. **Always-on across data centers.** For Amazon, a cart that cannot accept "add item" during a network partition loses money. Dynamo was explicitly designed to stay writable and resolve conflicts later.
3. **Predictable latency for familiar requests.** With `get(cart_id)`, the key tells the store where to look. There is no need to compile a general declarative query or optimize joins that could move data between machines. Separately, avoiding transactions across shards saves the cost of coordinating a commit. An application needing either feature must now do more work itself.
4. **Schema agility.** Weekly releases with changing fields; `ALTER TABLE` on a large table was slow and locked tables on many 2000s systems.
5. **Developer experience.** JSON in JavaScript apps mapped directly onto JSON documents (the impedance mismatch again, see [13](milestones/13-object-oriented-databases.md)).
6. **Cost and licensing.** Commercial RDBMS licences priced per core; open-source RDBMSs of the time did not scale out natively.

The paper's reading (§2.3): "The inability of OLTP RDBMSs to scale out in the 2000s ushered in dozens of document DBMSs", marketed with two messages: SQL and joins are slow, and ACID is unnecessary.

## The four NoSQL families (and where they are in the talk)

| Family | Model | Typical systems | Stop |
|--------|-------|-----------------|------|
| Key-value | key → opaque value | Memcached, Redis, Dynamo/DynamoDB, Riak | [17](milestones/17-key-value-stores.md) |
| Wide-column (column family) | row key → sparse column families | Bigtable, HBase, Cassandra | Not a separate stop |
| Document | key → nested JSON | MongoDB, CouchDB, Couchbase | [19](milestones/19-document-databases.md) |
| Graph | nodes and edges with properties | Neo4j, JanusGraph, Neptune | [18](milestones/18-graph-databases.md) |

Fowler and Sadalage (*NoSQL Distilled*, 2012) call the first three **aggregate-oriented**: you store and fetch a whole aggregate (a cart, a user profile) by key, and design the schema around your access patterns rather than around the data's structure. That is the opposite of normalization, where you design around the data and let queries assemble what they need.

## The trade-offs, one dimension at a time

### Transactions: ACID vs. BASE
- **ACID** (atomic, consistent, isolated, durable): a group of changes happens entirely or not at all, and concurrent transactions behave as if run one by one (at the strongest isolation level).
- **BASE** (basically available, soft state, eventually consistent): stay available, let replicas disagree temporarily, converge later. The acronym was chosen as a chemistry pun on ACID.
- Early NoSQL systems typically offered **atomicity for a single record or document only**. Anything spanning two records (move money, reserve a seat and charge a card) became application code: retries, compensations, sagas, idempotency keys.

### Consistency: what a read can return
From strongest to weakest (simplified for a talk):

| Level | Meaning in one line | Typical home |
|-------|--------------------|--------------|
| Strict serializable / external consistency | Transactions appear in one order that also respects real time | Spanner, FoundationDB, CockroachDB (close to it) |
| Serializable | Some one-at-a-time order exists | PostgreSQL `SERIALIZABLE`, CockroachDB default |
| Snapshot isolation | Each transaction sees a consistent snapshot; some anomalies (write skew) possible | Oracle "serializable", PostgreSQL `REPEATABLE READ`, TiDB |
| Read committed | No dirty reads, nothing more | Default in PostgreSQL, Oracle, SQL Server |
| Causal / read-your-writes | You see your own writes and their causes | Some MongoDB sessions, many tunable systems |
| Eventual | If writes stop, replicas eventually agree | Dynamo-style systems, Cassandra at low consistency levels |

Dynamo-style systems make this **tunable** with quorums: with `N` replicas, a write waits for `W` acknowledgements and a read asks `R` replicas. If `R + W > N`, every read overlaps the latest write (stronger); smaller `R` and `W` are faster and more available (weaker).

### CAP and PACELC (the theory the audience will bring up)
- **CAP:** when a network **P**artition happens, a replicated system must choose between **C**onsistency (refuse some requests) and **A**vailability (answer, possibly with stale or conflicting data). It is *not* "pick two of three at all times": without a partition you can have both.
- **PACELC** (Daniel Abadi): if **P**artition, choose **A** or **C**; **E**lse, choose **L**atency or **C**onsistency. This is the more useful version, because partitions are rare but the latency cost of coordination is paid on every request.
  - Dynamo, Cassandra (default): PA/EL: available and fast, consistency later.
  - Spanner, CockroachDB, classic RDBMS with synchronous replication: PC/EC: consistent, paying latency for it.
- Brewer's own later view ("CAP Twelve Years Later", 2012): the "2 of 3" framing was misleading; designers should manage partitions explicitly rather than give up consistency wholesale. Spanner is technically CP but, thanks to Google's private network, available enough that users rarely notice.

### Data model and schema
- **SQL:** schema-on-write. Normalized tables, constraints, foreign keys; flexible queries; joins assemble aggregates on demand.
- **NoSQL:** schema-on-read ("schemaless", more honestly "schema in the application"). Aggregates stored pre-joined; fast for the access pattern you designed for, painful for the next one. Duplicated data must be kept in sync by the application (the price-of-"Pen" demo at stop 19).
- **NewSQL:** schema-on-write like SQL, plus (today) JSON columns for the flexible parts.

### Query language
- **SQL:** declarative, optimizer chooses plans, joins and aggregates built in.
- **NoSQL:** at first get/put/scan APIs and per-product query DSLs (MongoDB's JSON query syntax, Cassandra's Thrift API). Then nearly all of them added SQL-like languages: CQL, PartiQL, SQL++, AQL, MongoDB SQL. The paper: "higher level languages are almost universally preferred to record-at-a-time notations".
- **NewSQL:** SQL, often wire-compatible with an existing database (TiDB speaks MySQL; CockroachDB and YugabyteDB speak PostgreSQL) to make migration cheap.

### Scaling and architecture
- **Classic SQL:** scale up; read replicas; failover; sharding by hand or via middleware.
- **NoSQL:** partition data by key (hash or range), replicate each partition, rebalance automatically as nodes join or leave. Coordination avoided wherever possible.
- **NewSQL:** partition by key range like NoSQL, but each partition is replicated with a **consensus protocol** (Paxos, Raft), and transactions that touch several partitions run a **two-phase commit over those consensus groups**. Concurrency via MVCC. Ordering via clocks: Spanner's **TrueTime** (GPS and atomic clocks with a bounded uncertainty, plus "commit wait"), CockroachDB's **hybrid logical clocks**, TiDB's central timestamp oracle.

## NewSQL in more detail
NewSQL is the answer to "either scale or have transactions is a false choice" for banks, retail, booking and ad systems. Pavlo & Aslett (2016) sort NewSQL into three groups:

| Group | Idea | Examples |
|-------|------|----------|
| **New architectures** | Built from scratch as distributed, shared-nothing, transactional SQL engines | H-Store → VoltDB (in-memory, partitioned, stored procedures), Spanner, CockroachDB, TiDB, YugabyteDB, NuoDB, Clustrix, MemSQL/SingleStore |
| **Transparent sharding middleware** | Keep MySQL/PostgreSQL nodes, add a routing layer that shards, routes and (partly) coordinates | Vitess (from YouTube; basis of PlanetScale), Citus for PostgreSQL |
| **Database-as-a-service with new architecture** | A cloud provider re-engineers storage under a familiar SQL engine | Amazon Aurora (the log is replicated to a distributed storage tier), later Google AlloyDB |

The paper also counts in-memory engines (Microsoft Hekaton, HyPer) in the wave.

**The money-transfer example** (the demo from the old NewSQL stop, still a good slide):

```sql
BEGIN;
  UPDATE acct SET bal = bal - 50 WHERE id = 1;   -- row lives on node A
  UPDATE acct SET bal = bal + 50 WHERE id = 2;   -- row lives on node B
COMMIT;                                          -- atomic across nodes
```

| System | What happens if node B crashes after the debit |
|--------|-----------------------------------------------|
| Single-node RDBMS | Not applicable: both rows on one machine; the log rolls the debit back |
| Early NoSQL (two independent puts) | The debit survives, the credit is lost: $50 vanishes unless the application detects and compensates |
| NoSQL today | Possible with explicit transaction APIs (DynamoDB `TransactWriteItems`, MongoDB multi-document transactions), with limits on size and performance |
| NewSQL | Two-phase commit over replicated partitions: the debit is rolled back, or the transaction completes once B's replicas take over |

**Why NewSQL adoption stayed modest** (paper §3.4): existing DBMSs were "good enough" for most; companies are risk-averse about OLTP (failure = lost revenue); early NewSQL products supported only SQL subsets or had poor multi-node transaction performance; Hekaton was only an extension of a legacy DBMS; and vendors overestimated in-memory demand because flash became cheap and persistent memory (Intel Optane) was discontinued. **What remained:** a solid crop of distributed SQL systems (Spanner, CockroachDB, TiDB, YugabyteDB, PlanetScale) and the end of the argument that SQL cannot scale. The paper counts NewSQL as a winner *as an idea*.

## Side-by-side summary

| Dimension | Classic SQL | NoSQL | NewSQL / distributed SQL |
|-----------|-------------|-------|--------------------------|
| Typical era | 1970s → | 2007–2015 peak | 2011 → |
| Data model | Relational, normalized | KV, wide-column, document, graph; aggregate-oriented | Relational (+ JSON) |
| Schema | On write | On read / in the app | On write (+ flexible JSON) |
| Query | SQL, optimizer | APIs → SQL-like dialects | SQL, often MySQL/PostgreSQL compatible |
| Joins | Yes | Usually no (denormalize instead) | Yes, distributed |
| Transactions | ACID, single node | Single-record atomicity; multi-record added later | ACID, distributed |
| Default consistency | Strong | Eventual or tunable | Strong (serializable / external) |
| Scale-out writes | Hard (manual sharding) | Native | Native |
| CAP/PACELC leaning | (single node: n/a) | PA/EL | PC/EC |
| Main cost | Scaling ceiling, ops of sharding | Consistency and joins move into application code | Coordination latency, operational complexity, cost |
| Sweet spot | Most applications, up to very large single nodes | Very high-volume, simple access patterns, availability over consistency | Large OLTP that needs both scale and correctness, multi-region |

## How they converged (the "what goes around" part)
- **NoSQL → SQL:** SQL-like languages (CQL, PartiQL, SQL++, AQL, MongoDB SQL), multi-record ACID transactions, schema validation (MongoDB JSON Schema). Marketing slogan changes from "no SQL" to "not only SQL".
- **SQL → NoSQL features:** JSON types and indexes (PostgreSQL `JSONB`, MySQL `JSON`, SQL:2016), online schema changes, managed replication and failover, scale-out storage in the cloud.
- **NewSQL → mainstream:** "distributed SQL" becomes a product category of its own; cloud providers ship it as a service (Spanner, Aurora, AlloyDB).
- The paper's prediction for document databases and RDBMSs: they "will soon be effectively identical".

## Common misconceptions to defuse on stage
1. **"SQL doesn't scale."** SQL is a language; scaling is a property of the engine (primitives). Spanner, CockroachDB and TiDB run SQL across hundreds of nodes. Category error.
2. **"NoSQL means no schema."** The schema exists; it lives in application code and in every document. It is just not enforced in one place.
3. **"NoSQL means no SQL."** Most NoSQL databases today offer an SQL dialect.
4. **"NewSQL beats CAP."** No system beats CAP. Spanner is CP; it is *available enough* because partitions on Google's network are rare and handled carefully.
5. **"Joins are slow."** Joins on indexed keys are cheap; what is slow is unplanned access patterns, which denormalized stores handle worse.
6. **"Eventual consistency is fine for us."** Often true for likes and view counters; rarely for money, inventory or anything with an invariant. Independent tests (e.g. the Jepsen analyses) repeatedly found systems violating even the guarantees they did advertise.

## Decision guide (for "which one should I use?")
1. Start with a **single-node relational database** (PostgreSQL, MySQL, SQL Server, or embedded SQLite/DuckDB). It scales further than most teams will ever need, and JSON columns cover flexible fields.
2. Need **more writes or multi-region availability with correctness**? A managed **distributed SQL** service (Spanner, CockroachDB, TiDB, YugabyteDB, Aurora/AlloyDB for some cases) or sharding middleware (Vitess, Citus).
3. One **very high-volume, simple, key-based access pattern** where availability beats consistency (caches, sessions, telemetry, feeds)? A **key-value or wide-column** store (Redis, DynamoDB, Cassandra, Bigtable).
4. Truly **document-shaped, schema-volatile** data, accessed whole, with a team that knows the trade-offs? A **document store** is reasonable, and today it comes with transactions.
5. Whatever you pick, check: Is it a new *model* or a new *index*? Does it have transactions and a declarative query language? What happens to your data in ten years?

## Sources
- [SP24] §2.2 (key-value), §2.3 (document, NoSQL, BASE, convergence), §2.4 (column family), §3.4 (NewSQL, adoption), §4 (marketing).
- [PA16] A. Pavlo, M. Aslett, "What's Really New with NewSQL?", SIGMOD Record 45(2), 2016 (three NewSQL groups).
- [Corb12] Spanner, OSDI 2012; D. Bacon et al., "Spanner: Becoming a SQL System", SIGMOD 2017; J. Shute et al., "F1: A Distributed SQL Database That Scales", VLDB 2013.
- [DeCandia et al., Dynamo](https://www.amazon.science/publications/dynamo-amazons-highly-available-key-value-store), SOSP 2007; [Chang et al., Bigtable](https://www.usenix.org/legacy/event/osdi06/tech/chang/chang_html/), OSDI 2006; [Shute et al., F1](https://research.google/pubs/f1-a-distributed-sql-database-that-scales/), VLDB 2013.
- [Martin Fowler, Nosql Definition](https://martinfowler.com/bliki/NosqlDefinition.html), 2012 (the 2009 meetup and the breadth of the term).
- E. Brewer, "Towards Robust Distributed Systems", PODC 2000 keynote; S. Gilbert, N. Lynch, "Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services", SIGACT News 2002; E. Brewer, "CAP Twelve Years Later", IEEE Computer 2012.
- D. Abadi, "Consistency Tradeoffs in Modern Distributed Database System Design" (PACELC), IEEE Computer 2012.
- D. Pritchett, "BASE: An Acid Alternative", ACM Queue 2008.
- P. Sadalage, M. Fowler, *NoSQL Distilled*, Addison-Wesley, 2012 (aggregate orientation).
- [Wikipedia: NoSQL](https://en.wikipedia.org/wiki/NoSQL), [NewSQL](https://en.wikipedia.org/wiki/NewSQL), [CAP theorem](https://en.wikipedia.org/wiki/CAP_theorem), [PACELC theorem](https://en.wikipedia.org/wiki/PACELC_theorem), [Eventual consistency](https://en.wikipedia.org/wiki/Eventual_consistency), [Spanner (database)](https://en.wikipedia.org/wiki/Spanner_(database)), [CockroachDB](https://en.wikipedia.org/wiki/CockroachDB), [Jepsen](https://jepsen.io/analyses).
- Confidence: the Bigtable production date, Dynamo's availability goal, F1's trade-off and the 2009 meetup are sourced above. Other product dates and the origin of the NewSQL name are worth verifying before quoting. Isolation-level mappings are simplified; defaults change across versions.
