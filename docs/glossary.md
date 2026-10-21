# Glossary

[← Index](README.md)

| Term | Plain-language meaning |
|------|------------------------|
| **ACID** | Atomic, Consistent, Isolated, Durable: a transaction either fully happens or not at all, and survives crashes. |
| **ANN** | Approximate nearest neighbor: find *roughly* the closest vectors quickly instead of scanning all. |
| **BASE** | "Basically Available, Soft state, Eventually consistent": the NoSQL-era counter-slogan to ACID. |
| **Bill of materials (BOM)** | The tree of parts that make up a product (rocket → stage → engine → valve). |
| **B-tree** | The classic sorted index structure behind most relational indexes. |
| **Columnar storage** | Store all values of one column together on disk instead of one row after another. |
| **Data independence** | Programs do not depend on how data is physically stored (or on small schema changes). |
| **Declarative** | You state the result you want (`SELECT …`), the system chooses the method. |
| **Denormalization** | Copying data into nested or pre-joined shapes to avoid joins; risks duplicates and stale copies. |
| **Embedding** | A list of numbers (a vector) produced by a model that captures the "meaning" of text, an image etc. |
| **ETL** | Extract, transform, load: moving data between systems, usually into a warehouse. |
| **Impedance mismatch** | The friction between objects in application code and rows in tables. |
| **Inverted index** | Map from each word to the list of documents containing it. |
| **Join** | Combine rows from two tables by matching values (e.g. `order.customer_id = customer.id`). |
| **Lakehouse** | Data-lake files on object storage plus warehouse-like management (transactions, schema) on top. |
| **NoSQL** | Umbrella for 2000s systems that dropped SQL and/or ACID; later read as "Not only SQL". |
| **OLAP** | Analytics workload: scan lots of data, few columns, read-mostly. |
| **OLTP** | Online transactions workload: many small reads and writes (orders, payments). |
| **Optimizer** | The DBMS component that picks the execution plan for a query; the hardest part to build. |
| **Polystore** | Several specialized databases hidden behind one interface. |
| **RDBMS / RM** | Relational DBMS / relational model. |
| **Shared-nothing** | Each node owns its disk and part of the data; nodes talk over the network. |
| **Shared-disk** | Nodes share storage (today usually an object store such as S3); compute is separate. |
| **Schema-on-read / schema-on-write** | Decide structure when you read the data / when you store it. |
| **Tuple / relation** | A row / a table, in the relational model's vocabulary. |
| **Vectorized execution** | Process a batch (vector) of values per operator call instead of one row at a time. |
