# Glossary

[← Index](README.md)

| Term | Plain-language meaning |
|------|------------------------|
| **ACID** | Atomic, Consistent, Isolated, Durable: a transaction either fully happens or not at all, and survives crashes. |
| **ANN** | Approximate nearest neighbor: find *roughly* the closest vectors quickly instead of scanning all. |
| **BASE** | "Basically Available, Soft state, Eventually consistent": the NoSQL-era counter-slogan to ACID. |
| **Bill of materials (BOM)** | The tree of parts that make up a product (rocket → stage → engine → valve). |
| **B-tree** | The classic sorted index structure behind most relational indexes. |
| **CAP theorem** | During a network partition a replicated system must choose between consistency (refuse some requests) and availability (answer, maybe with stale data). |
| **Category: Language** | One of the talk's three lenses: how you express questions and transformations (navigational commands, SQL, MapReduce, graph patterns). |
| **Category: Model** | One of the talk's three lenses: how data and its relationships are shaped, independently of storage. Key-value pairs and vectors are models represented in rows by map and vector types. |
| **Category: Primitives** | One of the talk's three lenses: the storage and access building blocks (count, type, record, index, random access, column layout, ANN index). |
| **Columnar storage** | Store all values of one column together on disk instead of one row after another. |
| **Consensus (Paxos, Raft)** | Protocols that let replicas agree on the order of updates even if some fail; the basis of NewSQL replication. |
| **Data independence** | Programs do not depend on how data is physically stored (or on small schema changes). |
| **Declarative** | You state the result you want (`SELECT …`), the system chooses the method. |
| **Denormalization** | Copying data into nested or pre-joined shapes to avoid joins; risks duplicates and stale copies. |
| **Embedding** | A list of numbers (a vector) produced by a model that captures the "meaning" of text, an image etc. |
| **ETL** | Extract, transform, load: moving data between systems, usually into a warehouse. |
| **Eventual consistency** | Replicas may disagree for a while but converge if writes stop. |
| **Identity map** | ORM pattern ensuring each database row is loaded into at most one object per session. |
| **Impedance mismatch** | The friction between objects in application code and rows in tables: identity, nesting, inheritance, navigation, types, lifecycle (see [13](milestones/13-object-oriented-databases.md)). |
| **Inverted index** | Map from each word to the list of documents containing it. |
| **Join** | Combine rows from two tables by matching values (e.g. `order.customer_id = customer.id`). |
| **Lakehouse** | Data-lake files on object storage plus warehouse-like management (transactions, schema) on top. |
| **N+1 query problem** | Loading N objects with one query, then issuing one more query per object to follow a reference: N+1 round trips instead of one join. |
| **NewSQL** | 2010s distributed relational DBMSs that scale out like NoSQL but keep SQL and ACID (Spanner, CockroachDB, TiDB, VoltDB); today often called *distributed SQL*. |
| **NoSQL** | Umbrella for 2000s systems that dropped SQL and/or ACID; later read as "Not only SQL". |
| **OLAP** | Analytics workload: scan lots of data, few columns, read-mostly. |
| **OLTP** | Online transactions workload: many small reads and writes (orders, payments). |
| **Optimizer** | The DBMS component that picks the execution plan for a query; the hardest part to build. |
| **ORM** | Object-relational mapper: a library that converts between application objects and table rows (Hibernate, SQLAlchemy, ActiveRecord). |
| **PACELC** | Extension of CAP: if Partition, choose Availability or Consistency; Else, choose Latency or Consistency. |
| **Polystore** | Several specialized databases hidden behind one interface. |
| **RDBMS / RM** | Relational DBMS / relational model. |
| **Schema-on-read / schema-on-write** | Decide structure when you read the data / when you store it. |
| **Sharding** | Splitting one table's rows across machines by key (hash or range). |
| **Shared-disk** | Nodes share storage (today usually an object store such as S3); compute is separate. |
| **Shared-nothing** | Each node owns its disk and part of the data; nodes talk over the network. |
| **Tuple / relation** | A row / a table, in the relational model's vocabulary. |
| **Two-phase commit (2PC)** | Protocol that makes a transaction spanning several nodes commit everywhere or nowhere. |
| **Vectorized execution** | Process a batch (vector) of values per operator call instead of one row at a time. |
