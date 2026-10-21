# 28 · Vector databases (2019 →)

[← 27 Cloud & lakehouse](27-cloud-lakehouse.md) · [Index](../README.md) · [Next → 29 SQL absorbs again](29-sql-absorbs-again.md)

| | |
|---|---|
| **Era** | LLM era; takes off after ChatGPT (late 2022) |
| **Verdict** | Converging with SQL (fast) |
| **Key systems** | Pinecone, Milvus, Weaviate; search engines adding vectors (Elasticsearch, Solr, Vespa); RDBMS vector indexes (pgvector, Oracle, SingleStore, Rockset, ClickHouse); libraries FAISS and DiskANN |
| **In the app** | Timeline → "Vector databases", demo: move the pointer, see nearest neighbours |

## Summary
Store **embeddings** (high-dimensional vectors) produced by ML models and answer **similarity queries**: "which records are closest to this vector?"

## Context (paper §2.7)
- The paper treats the vector model as a reduction of the array model to one dimension, as column-family is to document. It gets separate discussion because it "is attracting the most attention right now from developers and investors (similar to the NoSQL fad)".
- Embeddings range from hundreds of dimensions (simple transformers) to thousands (high-end models), from learned transformations such as BERT. Example record: `(title, date, author, [embedding-vector])`.
- Query pattern: similarity search by distance, plus predicates on metadata. The DBMS chooses between **pre-filter** and **post-filter** relative to the vector search. Exact scans are avoided with **approximate nearest neighbor (ANN)** indexes.
- Better AI-tool integration is a selling point: converting data to embeddings on insert and queries to embeddings at search time.

## The problem
Keyword search (inverted index) matches words, not meaning. LLM applications need to find semantically similar passages, images or products, and to feed them to a model as context.

## The idea
```
(title, date, [0.12, -0.80, 0.33, …])
ORDER BY distance(embedding, :query_embedding) LIMIT 5
```
Index vectors with ANN structures (graph-based, quantization, partitioning) so the search is sub-linear.

## How to explain it
- **Analogy:** a map where similar things sit near each other. "Cat" lands near "dog", far from "truck". Searching means dropping a pin and looking around.
- **Demo:** in the app, move the pointer over the 2-D scatter; the three nearest words highlight. Real embeddings have hundreds to thousands of dimensions.
- **Paper's argument:** vector DBMSs are "essentially document-oriented DBMSs with specialized ANN indexes". "Such indexes are a feature, not the foundation of a new system architecture."
- **Speed of absorption:** after ChatGPT went mainstream in late 2022 it took less than one year for several RDBMSs to add vector indexes (2023: Oracle, SingleStore, Rockset, ClickHouse). Contrast JSON, which took RDBMSs years. Two explanations: the use case is so compelling vendors rushed; and a new index type is small engineering, especially by integrating open-source libraries (pgvector, DiskANN, FAISS).
- **Prediction:** vector DBMSs will follow the document-DB path: gain SQL, transactions and extensibility, while relational incumbents "moved on to the next emerging trend".

## Relational lens
The extendable type system of relational databases absorbs vectors via a new type and index. The paper predicts this "should soon provide native support" and render specialized databases unnecessary.

## Coming from… [27 Cloud & lakehouse](27-cloud-lakehouse.md)
Cloud and lakehouse gave organizations a shared pool of data with ML-friendly access (DataFrames, Python). That pool plus modern ML turned text, images and records into vectors at scale. Also: the **bag-of-words vectors** of [SMART](09-smart-text-search.md) (1960s) have now become **learned embeddings**. The circle closes.

## Leading to… [29 SQL absorbs again](29-sql-absorbs-again.md)
**What vector databases leave open:** exactly the things the paper has been saying all along: metadata filtering, transactions, joins, governance, existing data. Those are core RDBMS strengths, so every established DBMS responds by adding a vector type and index. This pattern (new model → "feature" in SQL) is the story's final lesson.

## Sources
- [SP24] §2.7 (refs 58 Pinecone, 40 Milvus, 84 Weaviate, 23/70/79 Elasticsearch/Solr/Vespa, 34 kdb+, 16/36 ChatGPT/LangChain, 7/137/8/157 Oracle/SingleStore/Rockset/ClickHouse, 145 pgvector, 19 DiskANN, 24 FAISS) and §4 on AI/ML.
- [Wikipedia: Vector database](https://en.wikipedia.org/wiki/Vector_database), [Word embedding](https://en.wikipedia.org/wiki/Word_embedding).
- Image: word embedding illustration; Fschwarzentruber, CC BY-SA 4.0, Wikimedia Commons.
- Confidence: high (paper-based). Company founding years (e.g. Pinecone/Weaviate/Milvus around 2019) are from memory **(verify)**.
