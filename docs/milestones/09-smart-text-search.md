# 09 · SMART text search (1960s)

[← 08 RAMAC disk](08-ramac-disk.md) · [Index](../README.md) · [Next → 10 IMS](10-ims-hierarchical.md)

| | |
|---|---|
| **Era** | 1960s information retrieval |
| **Verdict** | Niche survivor: still the heart of search engines, still usually a *separate* system |
| **Key people / systems** | Gerard Salton (Harvard, then Cornell); SMART; later Lucene (1999), Solr, Elasticsearch (2010) |
| **In the app** | Timeline → "SMART text search", demo: inverted index lookup |

## Summary
Break documents into words, build an **inverted index** (word → documents), and rank results by similarity. The foundation of search.

## Context
- SMART (System for the Mechanical Analysis and Retrieval of Text) was developed by Gerard Salton's group in the 1960s. The paper highlights it as the seminal text-search system.
- It pioneered the **vector space model**: each document is a vector of term weights; a query is a vector too; similarity is a distance or cosine. (The model is described in Salton's later papers; TF-IDF weighting builds on Karen Spärck Jones's idf idea of 1972.)
- Modern descendants: Apache Lucene (1999), Solr, Elasticsearch, Vespa.

## The problem
"Find documents about X" in a pile of text, without reading each document. There is no schema to index.

## The idea
1. Tokenize each document.
2. Drop **stop words** ("the", "a"), normalize (case, stemming), perhaps expand synonyms.
3. Build an **inverted index**: for each term, the list of documents containing it (a *postings list*).
4. For queries, intersect or union postings, then rank.

```
docs:  1 "the cat sat on the mat"   2 "the dog chased the cat"
index: cat -> [1, 2]    mat -> [1]    dog -> [2]
query: cat AND mat -> [1]           // no scan of the documents
```

## How to explain it
- **Analogy:** the index at the back of a textbook, but for the entire library, automatically produced.
- **Demo:** type words in the app; see which rows of the index light up and the intersection.
- **Paper's view:** text is inherently unstructured, so "there is no data model"; the DBMS tries to extract structure (metadata, indexes) to avoid needle-in-haystack scans. Search engines offer little or no transactional safety, so recovery can mean **rebuilding the index**. All leading RDBMSs offer full-text indexes now, but the SQL integration is "often clunky and differs between DBMSs".
- **Three ways to run text search** (paper): (1) separate search engine + RDBMS with ETL plumbing, (2) RDBMS with built-in text search and vendor-specific SQL, (3) a polystore hiding both.

## Relational lens
A full-text index is just another index type. The paper hopes RDBMSs will have a better search story so a separate product is not needed. Exact-match inverted-index search is also **being supplanted by similarity search with ML embeddings** (see [Vector databases](28-vector-databases.md)): the bag-of-words vector of SMART becomes a learned embedding.

## Coming from… [08 RAMAC disk](08-ramac-disk.md)
Disks made it affordable to keep large index structures online and jump through postings lists. Search is a "structure extraction" problem that only becomes practical with direct access storage.

## Leading to… [10 IMS](10-ims-hierarchical.md)
**What text search could not do:** it handles unstructured content and returns ranked documents, but businesses and engineering programs in the 1960s needed **exact, structured, transactional records**: parts, accounts, orders, thousands of updates a day. The most urgent case was NASA's Apollo program: millions of parts in nested assemblies. IBM's answer is IMS, a database for structured data based on trees. (Text search remains a parallel track that later reconnects through Elasticsearch, full-text SQL, and finally vectors.)

## Sources
- [SP24] §2.5 "Text Search Engines".
- [Wikipedia: Gerard Salton](https://en.wikipedia.org/wiki/Gerard_Salton), [Inverted index](https://en.wikipedia.org/wiki/Inverted_index), [Vector space model](https://en.wikipedia.org/wiki/Vector_space_model), [TF-IDF](https://en.wikipedia.org/wiki/TF-IDF), [Apache Lucene](https://en.wikipedia.org/wiki/Apache_Lucene), [Elasticsearch](https://en.wikipedia.org/wiki/Elasticsearch).
- G. Salton, A. Wong, C. S. Yang, "A Vector Space Model for Automatic Indexing", CACM 1975.
- Image: inverted index example, RI2AI, CC BY-SA 4.0, Wikimedia Commons.
- Confidence: high.
