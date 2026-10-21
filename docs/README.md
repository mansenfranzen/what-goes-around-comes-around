# DB Time Machine: Speaker Notes

Companion notes for the interactive presentation ([index-photos.html](../index-photos.html), with a picture-free variant in [index.html](../index.html)). One page per milestone, 29 in total, written for someone who has to **explain the milestone to an audience** and, above all, **explain why the story moves on to the next one**.

Backbone of the whole story: Stonebraker & Pavlo, *"What Goes Around Comes Around… And Around"*, SIGMOD Record 53(2), June 2024 ([PDF](https://db.cs.cmu.edu/papers/2024/whatgoesaround-sigmodrec2024.pdf)), the sequel to the 2005 chapter of the same name. Its thesis: the relational model (RM) plus SQL keeps winning; challengers either die, stay niche, or get absorbed into SQL. Everything before 1960 is context I added; see [sources.md](sources.md) for what comes from where and how sure I am.

## How to use these notes

1. Pick your arc (below) or walk the full timeline.
2. For each stop, each page gives: **Summary**, **Context**, **The problem**, **The idea** (with a minimal data-structure example), **How to explain it** (analogy, demo, likely questions), **Relational lens**, **Coming from…** (how the previous milestone led here), **Leading to…** (what this one left unsolved, and what happened next), and **Sources**.
3. The "Coming from / Leading to" sections are deliberately the longest parts. A talk is easier to follow when each stop is introduced as "the previous thing broke here".

## The milestones

| # | Milestone | Year | Verdict |
|---|-----------|------|---------|
| 01 | [Tally bone](milestones/01-tally-bone.md) | ≈ 20,000 BCE | Ancestor |
| 02 | [Clay tokens](milestones/02-clay-tokens.md) | ≈ 8000 BCE | Ancestor |
| 03 | [Clay tablet ledger](milestones/03-clay-tablets.md) | ≈ 3300 BCE | Ancestor |
| 04 | [Pinakes of Alexandria](milestones/04-pinakes.md) | ≈ 245 BCE | Ancestor |
| 05 | [Domesday Book](milestones/05-domesday-book.md) | 1086 | Ancestor |
| 06 | [Card catalog](milestones/06-card-catalog.md) | 1791 | Ancestor |
| 07 | [Hollerith punch cards](milestones/07-hollerith-punch-cards.md) | 1890 | Ancestor |
| 08 | [RAMAC disk](milestones/08-ramac-disk.md) | 1956 | Ancestor |
| 09 | [SMART text search](milestones/09-smart-text-search.md) | 1960s | Niche survivor |
| 10 | [IMS (hierarchical)](milestones/10-ims-hierarchical.md) | 1966 | Legacy |
| 11 | [CODASYL (network)](milestones/11-codasyl-network.md) | 1969–71 | Legacy |
| 12 | [Relational model](milestones/12-relational-model.md) | 1970 | Winner |
| 13 | [SQL & System R](milestones/13-sql-system-r.md) | 1974–79 | Winner |
| 14 | [ER & semantic models](milestones/14-er-and-semantic-models.md) | 1976–80s | Absorbed |
| 15 | [Database machines](milestones/15-database-machines.md) | 1981 | Dead end |
| 16 | [Array databases](milestones/16-array-databases.md) | 1980s | Niche survivor |
| 17 | [Object-oriented DBs](milestones/17-object-oriented-databases.md) | late 1980s | Absorbed |
| 18 | [XML databases](milestones/18-xml-databases.md) | late 1990s | Absorbed |
| 19 | [MapReduce / Hadoop](milestones/19-mapreduce-hadoop.md) | 2003–2014 | Dead end |
| 20 | [Bigtable (column family)](milestones/20-bigtable-column-family.md) | 2004 | Niche survivor |
| 21 | [Columnar warehouses](milestones/21-columnar-warehouses.md) | 2005 → | Winner (inside RM) |
| 22 | [Key-value stores](milestones/22-key-value-stores.md) | 2003–07 | Niche survivor |
| 23 | [Graph databases](milestones/23-graph-databases.md) | 2007 → | Converging |
| 24 | [Document DBs / NoSQL](milestones/24-document-databases.md) | 2009 → | Converging |
| 25 | [Blockchain databases](milestones/25-blockchain-databases.md) | 2009 → | Dead end |
| 26 | [NewSQL & Spanner](milestones/26-newsql-spanner.md) | 2011–12 | Winner |
| 27 | [Cloud & lakehouse](milestones/27-cloud-lakehouse.md) | 2013 → | Winner |
| 28 | [Vector databases](milestones/28-vector-databases.md) | 2019 → | Converging |
| 29 | [SQL absorbs again](milestones/29-sql-absorbs-again.md) | 2023 → | Winner |

Other pages: [Glossary](glossary.md) · [Sources and confidence](sources.md)

## The transitions at a glance

The timeline is chronological; the *causal* story has a few threads. This table is the cheat sheet for "why are we on this slide now?"

| From → To | What the first one could not do | What changed so the second appeared |
|-----------|--------------------------------|--------------------------------------|
| 01 → 02 | A count has no "what" | Farming and trade: many goods to track |
| 02 → 03 | Tokens in sealed envelopes cannot be checked without breaking them | Press the marks on the outside; then drop the tokens |
| 03 → 04 | Tablets pile up in archives | Large collections need finding aids |
| 04 → 05 | Catalogs organize existing texts; none collects *new* facts | A state wants a uniform census |
| 05 → 06 | One bound book cannot be updated or re-sorted | Records on separate cards |
| 06 → 07 | Cards are read by humans; populations grow | Hole patterns that machines can read |
| 07 → 08 | Card decks and tape are sequential | Spinning disk gives random access |
| 08 → 09 | Random access exists; how to search text? | Inverted index on disk |
| 09 → 10 | Text is unstructured; businesses need structured records at scale | Apollo parts lists: trees of segments |
| 10 → 11 | Trees cannot express many-to-many | Pointer sets: networks |
| 11 → 12 | Programmers must navigate by hand, and programs break when data layout changes | Codd: tables, data independence |
| 12 → 13 | Relational algebra is hard to use | SEQUEL/SQL |
| 13 → 14 | SQL does not tell you how to design tables | ER diagrams, semantic models |
| 14 → 15 | Relational was popular but slow on 1980s hardware | Try custom hardware |
| 15 → 16 | Hardware did not beat software; but some data is not rows | Array models for science and images |
| 16 → 17 | Arrays serve a niche; mainstream developers have objects | Object databases |
| 17 → 18 | OODBs failed commercially; the web needs document exchange | XML |
| 18 → 19 | XML is about structure; the web now has a *volume* problem | Google's MapReduce |
| 19 → 20 | MapReduce is batch-only | Bigtable for interactive updates |
| 20 → 21 | "Column family" is not columnar; real analytics needed real columns | Column stores for warehouses |
| 21 → 22 | Warehouses solve analytics; online apps need speed and uptime | Simple key-value stores |
| 22 → 23 | A blob per key hides relationships | Graph databases add edges |
| 23 → 24 | Two ways to add structure back to KV: edges or nesting | Document databases |
| 24 → 25 | The same 2009 "rethink the DB" mood, in the trust dimension | Blockchain (thematic, not causal) |
| 25 → 26 | Real businesses still want scale **and** ACID | NewSQL / Spanner |
| 26 → 27 | Scale-out shared-nothing is costly to run; networks get faster than disks | Cloud, object stores, lakehouse |
| 27 → 28 | Lakehouses serve SQL and ML; ML brings embeddings | Vector databases |
| 28 → 29 | New data type, new "model" | A new SQL index and type: the loop repeats |

## Three suggested story arcs

- **Pre-history in a hurry** (01–08): "Every database idea is a response to a record-keeping pain." Stop at the RAMAC disk.
- **The model wars** (10–14, then 17, 18): navigation vs declarative, and why relational won.
- **Big data and the NoSQL detour** (19–29): the fashion cycle, and how SQL absorbed each wave.

## Recurring themes to name out loud

1. **Data independence.** The relational model's real innovation: programs should not break when storage changes.
2. **Declarative beats navigational.** Say *what*, let the optimizer pick *how*.
3. **Denormalization is a loan.** Embedding or pre-joining is fast now and costly later (duplication, no data independence).
4. **Feature, not architecture.** Many "new databases" turn out to be one new index or type (vector, graph, JSON, full-text).
5. **Hardware drives architecture.** Disk (1956), SSD, fast networks and object stores (2010s) changed *implementations*, not the model.
6. **Stickiness.** Old systems (IMS) survive because migrating data is risky, not because they are best.
7. **Caveat for the speaker.** The 2024 paper is opinionated, written by two relational-database people. Present its conclusions as a well-argued position, and invite the audience to push back.
