# Sources and confidence

[← Index](README.md)

## How the notes were built

- **Backbone:** the 2024 paper (read in full): Stonebraker & Pavlo, SIGMOD Record 53(2), 2024. The talk draws on its historical analysis and SQL-absorption examples (JSON in SQL:2016, SQL/PGQ and SQL/MDA in SQL:2023, vector indexes in 2023). The milestone categories and verdicts summarize the talk’s interpretation.
- **Other background** (pre-1960 history, original papers, product dates) was not independently rechecked while writing the notes. Verify precise dates and numbers before quoting them on stage; uncertain details are marked **(verify)** in the milestone pages.
- Credits for the current presentation's images are in [Image credits](../presentation/assets/images/CREDITS.md).
- Wikipedia links below were checked to exist. They are convenient entry points, not primary evidence.

## Key references (short names used in the pages)

**[SP24]** M. Stonebraker, A. Pavlo. *What Goes Around Comes Around… And Around.* SIGMOD Record 53(2), June 2024. <https://db.cs.cmu.edu/papers/2024/whatgoesaround-sigmodrec2024.pdf>
Its own numbered references (e.g. "ref. 172") are cited by that number in the milestone pages.

**[SH05]** M. Stonebraker, J. Hellerstein. *What Goes Around Comes Around.* In *Readings in Database Systems*, 4th ed. (the "Red Book"), MIT Press, 2005. The 40-year survey: hierarchical, network, relational, ER, extended relational, semantic, object-oriented, object-relational, semi-structured.

**[Codd70]** E. F. Codd. *A Relational Model of Data for Large Shared Data Banks.* CACM 13(6), 1970.

**[CB74]** D. Chamberlin, R. Boyce. *SEQUEL: A Structured English Query Language.* ACM SIGFIDET workshop, 1974.

**[Astr76]** M. Astrahan et al. *System R: Relational Approach to Database Management.* ACM TODS 1(2), 1976.

**[Sel79]** P. Selinger et al. *Access Path Selection in a Relational Database Management System.* SIGMOD 1979.

**[Bach73]** C. Bachman. *The Programmer as Navigator.* CACM 16(11), 1973 (Turing Award lecture).

**[SB92]** D. Schmandt-Besserat. *Before Writing* (2 vols), University of Texas Press, 1992.

**[NDE93]** H. Nissen, P. Damerow, R. Englund. *Archaic Bookkeeping.* University of Chicago Press, 1993.

**[Dean04]** J. Dean, S. Ghemawat. *MapReduce: Simplified Data Processing on Large Clusters.* OSDI 2004.

**[Chang06]** F. Chang et al. [Bigtable: A Distributed Storage System for Structured Data](https://www.usenix.org/legacy/event/osdi06/tech/chang/chang_html/). OSDI 2006. Sections 3 and 9 explain why the original API stopped at single-row transactions; §10 discusses query optimization.

**[DeC07]** G. DeCandia et al. [Dynamo: Amazon's Highly Available Key-value Store](https://www.amazon.science/publications/dynamo-amazons-highly-available-key-value-store). SOSP 2007. Tail-latency targets, primary-key access and the decision not to support multi-item transactions.

**[Fowler12]** M. Fowler. [Nosql Definition](https://martinfowler.com/bliki/NosqlDefinition.html), 2012. The June 2009 meetup and the several systems gathered under the label.

**[Shute13]** J. Shute et al. [F1: A Distributed SQL Database That Scales](https://research.google/pubs/f1-a-distributed-sql-database-that-scales/). VLDB 2013. Distributed SQL over Spanner; the authors describe the latency cost of synchronous replication.

**[Corb12]** J. Corbett et al. *Spanner: Google's Globally-Distributed Database.* OSDI 2012.

**[Pavlo09]** A. Pavlo et al. *A Comparison of Approaches to Large-Scale Data Analysis.* SIGMOD 2009.

**[Stone05]** M. Stonebraker et al. *C-Store: A Column-oriented DBMS.* VLDB 2005.

**[Snow16]** B. Dageville et al. *The Snowflake Elastic Data Warehouse.* SIGMOD 2016.

**[Lake21]** M. Armbrust et al. *Lakehouse: A New Generation of Open Platforms that Unify Data Warehousing and Advanced Analytics.* CIDR 2021.

**[PA16]** A. Pavlo, M. Aslett. *What's Really New with NewSQL?* SIGMOD Record 45(2), 2016.

Further references for the impedance-mismatch section ([13](milestones/13-object-oriented-databases.md)) and the [SQL vs. NoSQL vs. NewSQL](sql-nosql-newsql.md) deep dive (CAP, PACELC, BASE, ORM patterns) are listed on those pages.

## Wikipedia entry points (all checked to exist)

Ishango bone, Lebombo bone, Tally stick, Cuneiform, Proto-cuneiform, Uruk, Pinakes, Callimachus, Library of Alexandria, Library catalog, Dewey Decimal Classification, Punched card, Herman Hollerith, 1880 and 1890 United States census, IBM 305 RAMAC, Hard disk drive, Magnetic-tape data storage, Information Management System, Hierarchical database model, Apollo program, CODASYL, Network model, Charles Bachman, Relational model, Edgar F. Codd, SQL, Donald D. Chamberlin, IBM System R, Ingres, Oracle Database, Array DBMS, Rasdaman, HDF5, NetCDF, APL, Object database, Object–relational impedance mismatch, Object-relational mapping, JSON, MapReduce, Apache Hadoop, Bigtable, Apache Cassandra, Apache HBase, Column-oriented DBMS, Data warehouse, Key–value database, Dynamo (storage system), Redis, Memcached, Graph database, Neo4j, Document-oriented database, MongoDB, NoSQL, NewSQL, CAP theorem, PACELC theorem, Eventual consistency, Spanner (database), CockroachDB, Amazon Aurora, Data lake, Data lakehouse, Apache Parquet, Delta Lake, Apache Iceberg, Vector database, Word embedding, SQLite, DuckDB, PostgreSQL, Michael Stonebraker.

URL pattern: `https://en.wikipedia.org/wiki/<Title_with_underscores>`.

## Bonus pitch slide

The `pitch` slide after the big picture (presentation only, not part of the history) argues for trying DuckDB on commodity compute. Chart values were read off the published charts and rounded; they are schematic.

- G. Fraser. [I benchmarked Databricks against my iPhone](https://www.fivetran.com/blog/i-benchmarked-databricks-against-my-iphone). Fivetran blog, Oct 2026. TPC-H geomeans (SF 25–200), Databricks cluster sizes and prices, EC2 price per normalized core-hour (≈ $0.083 for c3 in late 2013 to ≈ $0.007 for c9g in 2026), markup per core-hour (Snowflake ≈ 24×, Databricks ≈ 10.5×). Benchmark code: [github.com/fivetran/iphone_benchmark](https://github.com/fivetran/iphone_benchmark). The post says "10x over 10 years"; its chart shows ≈ 12× since late 2013, which is the figure the slide uses.
- Fivetran. [How do people use Snowflake and Redshift?](https://www.fivetran.com/blog/how-do-people-use-snowflake-and-redshift) 2024. Snowset + Redset analysis: for queries scanning ≥ 1 MB, median ≈ 100 MB, 99.9th percentile ≈ 300 GB; "99.9% of real world queries could run on a single large node".
- Amazon. [AWS to acquire DuckLabs](https://www.aboutamazon.com/news/company-news/aws-ducklabs), 26 Aug 2026; AWS Big Data Blog, [AWS and DuckLabs: building the future of analytics together](https://aws.amazon.com/blogs/big-data/aws-and-ducklabs-building-the-future-of-analytics-together/); DuckLabs, [DuckLabs to join AWS](https://ducklabs.com/news/2026/08/26/ducklabs-to-join-aws). Deal closed 31 Aug 2026. DuckDB stays MIT-licensed under the DuckDB Foundation. AWS plans deep integration (S3, Athena, Redshift, EMR, Glue, SageMaker); Amazon Quick's engine uses DuckDB (2.5 B+ queries, 30 % lower average latency). No managed "DuckDB service" has been announced, so the slide says "building block".
- Largest single EC2 instance by memory, from the AWS launch announcements: m1.small 1.7 GB (2006), m2.4xlarge 68.4 GB (Oct 2009), x1.32xlarge 1,952 GiB (May 2016), u7in-32tb.224xlarge 32 TiB (May 2024). C9g (Graviton5) GA June 2026.

## Known weak spots

- **Pre-writing and early-writing claims** (tokens as the origin of writing) are an influential but *contested* theory ([SB92]). Present them as "a leading hypothesis".
- **Ishango bone** meaning (calendar? arithmetic? primes?) is disputed. Safe claim: grouped notches, ~20,000 years old, some kind of tally.
- **Library of Alexandria** scroll counts are ancient estimates of dubious reliability.
- **The "relational gravity" meter** in the app is a subjective reading of the paper, not data.
- **Vendor dates** (first release vs. announcement vs. GA) differ; pages use "around" when it matters.
- **The 2024 paper is a position paper** by two relational-database proponents. Dissent exists (graph, vector, array and document vendors argue their cases).
