# Sources and confidence

[← Index](README.md)

## How the notes were built

- **Backbone:** the 2024 paper (read in full): Stonebraker & Pavlo, SIGMOD Record 53(2), 2024. All "paper says" statements, the verdict labels, and the SQL-absorption claims (JSON in SQL:2016, SQL/PGQ and SQL/MDA in SQL:2023, vector indexes in 2023) come from it.
- **Everything else** (pre-1960 history, original papers, product dates) comes from my background knowledge of the literature, cross-checked only by citing the original publications listed below. I did **not** re-read those originals while writing, so treat precise dates and numbers as "very likely right, worth a quick check before quoting on stage". Items I am less sure of are marked **(verify)** in the milestone pages.
- Image credits are in the `IMG` table inside [index-photos.html](../index-photos.html) (Wikimedia Commons).
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

**[Chen76]** P. Chen. *The Entity-Relationship Model: Toward a Unified View of Data.* ACM TODS 1(1), 1976.

**[SB92]** D. Schmandt-Besserat. *Before Writing* (2 vols), University of Texas Press, 1992.

**[NDE93]** H. Nissen, P. Damerow, R. Englund. *Archaic Bookkeeping.* University of Chicago Press, 1993.

**[Dean04]** J. Dean, S. Ghemawat. *MapReduce: Simplified Data Processing on Large Clusters.* OSDI 2004.

**[Chang06]** F. Chang et al. *Bigtable: A Distributed Storage System for Structured Data.* OSDI 2006.

**[DeC07]** G. DeCandia et al. *Dynamo: Amazon's Highly Available Key-value Store.* SOSP 2007.

**[Corb12]** J. Corbett et al. *Spanner: Google's Globally-Distributed Database.* OSDI 2012.

**[Pavlo09]** A. Pavlo et al. *A Comparison of Approaches to Large-Scale Data Analysis.* SIGMOD 2009.

**[Stone05]** M. Stonebraker et al. *C-Store: A Column-oriented DBMS.* VLDB 2005.

**[Snow16]** B. Dageville et al. *The Snowflake Elastic Data Warehouse.* SIGMOD 2016.

**[Lake21]** M. Armbrust et al. *Lakehouse: A New Generation of Open Platforms that Unify Data Warehousing and Advanced Analytics.* CIDR 2021.

**[PA16]** A. Pavlo, M. Aslett. *What's Really New with NewSQL?* SIGMOD Record 45(2), 2016.

## Wikipedia entry points (all checked to exist)

Ishango bone, Lebombo bone, Tally stick, Cuneiform, Proto-cuneiform, Uruk, Pinakes, Callimachus, Library of Alexandria, Domesday Book, Library catalog, Dewey Decimal Classification, Punched card, Herman Hollerith, 1880 and 1890 United States census, IBM 305 RAMAC, Hard disk drive, Magnetic-tape data storage, Gerard Salton, Inverted index, TF-IDF, Vector space model, Information retrieval, Apache Lucene, Elasticsearch, Information Management System, Hierarchical database model, Apollo program, CODASYL, Network model, Charles Bachman, Relational model, Edgar F. Codd, SQL, Donald D. Chamberlin, IBM System R, Ingres, Oracle Database, Entity–relationship model, Database machine, Teradata, Array DBMS, Rasdaman, HDF5, NetCDF, APL, Object database, Object–relational impedance mismatch, Object-relational mapping, XML, JSON, MapReduce, Apache Hadoop, Bigtable, Apache Cassandra, Apache HBase, Column-oriented DBMS, Data warehouse, Key–value database, Dynamo (storage system), Redis, Memcached, Graph database, Neo4j, Document-oriented database, MongoDB, Blockchain, Bitcoin, NewSQL, H-Store, VoltDB, Spanner (database), CockroachDB, Amazon Aurora, Data lake, Data lakehouse, Apache Parquet, Delta Lake, Apache Iceberg, Vector database, Word embedding, SQLite, DuckDB, PostgreSQL, Michael Stonebraker.

URL pattern: `https://en.wikipedia.org/wiki/<Title_with_underscores>`.

## Known weak spots

- **Pre-writing and early-writing claims** (tokens as the origin of writing) are an influential but *contested* theory ([SB92]). Present them as "a leading hypothesis".
- **Ishango bone** meaning (calendar? arithmetic? primes?) is disputed. Safe claim: grouped notches, ~20,000 years old, some kind of tally.
- **Library of Alexandria** scroll counts are ancient estimates of dubious reliability.
- **The "relational gravity" meter** in the app is a subjective reading of the paper, not data.
- **Vendor dates** (first release vs. announcement vs. GA) differ; pages use "around" when it matters.
- **The 2024 paper is a position paper** by two relational-database proponents. Dissent exists (graph, vector, array and document vendors argue their cases).
