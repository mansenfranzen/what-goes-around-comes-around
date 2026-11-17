# DB Time Machine: Speaker Notes

Companion notes for the interactive presentation ([index-photos.html](../legacy/index-photos.html), with a picture-free variant in [index.html](../legacy/index.html)). One page per milestone, 23 in total, written for someone who has to **explain the milestone to an audience** and, above all, **explain why the story moves on to the next one**.

Backbone of the whole story: Stonebraker & Pavlo, *"What Goes Around Comes Around… And Around"*, SIGMOD Record 53(2), June 2024 ([PDF](https://db.cs.cmu.edu/papers/2024/whatgoesaround-sigmodrec2024.pdf)), the sequel to the 2005 chapter of the same name. Its thesis: the relational model (RM) plus SQL keeps winning; challengers either die, stay niche, or get absorbed into SQL. Everything before 1960 is context I added; see [sources.md](sources.md) for what comes from where and how sure I am.

## The two core ideas of the talk

1. **Environment → invention.** Every milestone is a response to a concrete record-keeping pain: a count that must outlive memory (tally bone), a catalog that must absorb new books (card catalog), a census that must finish within ten years (punch cards), a web crawl that must run on failing machines (MapReduce).
2. **What goes around comes around.** Since 1970, every challenger to the relational model either died, stayed niche, or had its good idea absorbed into SQL ([stop 23](milestones/23-sql-absorbs-again.md)).

## The three categories

Every milestone page names the category it **mainly** addresses (and, where useful, a secondary one). The categories are the bridge between the two core ideas: inventions accumulate in each category, and the relational model wins because it keeps the three apart.

| Category | Short form | Question it answers | Typical inventions |
|----------|-----------|---------------------|--------------------|
| **Primitives** | Storage & access primitives: the building blocks | *How is data recorded, stored and found?* | count, type, record layout, index, sortable/updatable index, random access, column layout, log-structured storage, ANN index |
| **Language** | Declarative query language | *How do I say what I want, and express transformations?* | machine counting, navigational commands, SQL, MapReduce, graph patterns |
| **Model** | The relational model (and its rivals) | *What shape do data and relationships have, and is the logical view decoupled from physical storage?* | hierarchy, network, relations + foreign keys, objects, arrays, documents, graphs |

How to say it on stage: **"Primitives are how we store, language is how we ask, the model is how we shape."** The relational model is the stable middle layer: because queries never mention storage (data independence), primitives can be swapped underneath and languages rebuilt on top. Pre-history (01–07) is almost entirely about primitives; the model wars start at 08; from 14 onwards each challenger attacks one category, and the closing stop shows how each was absorbed.

## How to use these notes

1. Pick your arc (below) or walk the full timeline.
2. For each stop, each page gives: **Summary**, **Category** (which of the three it mainly addresses, and why), **Context**, **The problem**, **The idea** (with a minimal data-structure example), **How to explain it** (analogy, demo, likely questions), **Relational lens**, **Coming from…** (how the previous milestone led here), **Leading to…** (what this one left unsolved, and what happened next), and **Sources**.
3. The "Coming from / Leading to" sections are deliberately the longest parts. A talk is easier to follow when each stop is introduced as "the previous thing broke here".

## The milestones

| # | Milestone | Year | Category (main · secondary) | Verdict |
|---|-----------|------|-----------------------------|---------|
| 01 | [Tally bone](milestones/01-tally-bone.md) | ≈ 20,000 BCE | Primitives | Ancestor |
| 02 | [Clay tokens](milestones/02-clay-tokens.md) | ≈ 8000 BCE | Primitives | Ancestor |
| 03 | [Clay tablet ledger](milestones/03-clay-tablets.md) | ≈ 3300 BCE | Primitives · (Model foreshadowed) | Ancestor |
| 04 | [Pinakes of Alexandria](milestones/04-pinakes.md) | ≈ 245 BCE | Primitives | Ancestor |
| 05 | [Card catalog](milestones/05-card-catalog.md) | 1791 | Primitives | Ancestor |
| 06 | [Hollerith punch cards](milestones/06-hollerith-punch-cards.md) | 1890 | Primitives · Language | Ancestor |
| 07 | [RAMAC disk](milestones/07-ramac-disk.md) | 1956 | Primitives | Ancestor |
| 08 | [IMS (hierarchical)](milestones/08-ims-hierarchical.md) | 1966 | Model · Language | Legacy |
| 09 | [CODASYL (network)](milestones/09-codasyl-network.md) | 1969–71 | Model · Language | Legacy |
| 10 | [Relational model](milestones/10-relational-model.md) | 1970 | Model | Winner |
| 11 | [SQL & System R](milestones/11-sql-system-r.md) | 1974–79 | Language · Primitives | Winner |
| 12 | [Array databases](milestones/12-array-databases.md) | 1980s | Model · Primitives, Language | Niche survivor |
| 13 | [Object-oriented DBs](milestones/13-object-oriented-databases.md) | late 1980s | Model · Language | Absorbed |
| 14 | [MapReduce / Hadoop](milestones/14-mapreduce-hadoop.md) | 2003–2014 | Language · Primitives | Dead end |
| 15 | [Bigtable (column family)](milestones/15-bigtable-column-family.md) | 2004 | Model · Primitives | Niche survivor |
| 16 | [Columnar warehouses](milestones/16-columnar-warehouses.md) | 2005 → | Primitives | Winner (inside RM) |
| 17 | [Key-value stores](milestones/17-key-value-stores.md) | 2003–07 | Primitives · Model | Niche survivor |
| 18 | [Graph databases](milestones/18-graph-databases.md) | 2007 → | Model · Language | Converging |
| 19 | [Document DBs / NoSQL](milestones/19-document-databases.md) | 2009 → | Model · Language | Converging |
| 20 | [Blockchain databases](milestones/20-blockchain-databases.md) | 2009 → | Primitives | Dead end |
| 21 | [Cloud & lakehouse](milestones/21-cloud-lakehouse.md) | 2013 → | Primitives · Language | Winner |
| 22 | [Vector databases](milestones/22-vector-databases.md) | 2019 → | Primitives · Model | Converging |
| 23 | [SQL absorbs again](milestones/23-sql-absorbs-again.md) | 2023 → | All three (synthesis) | Winner |

Other pages: [SQL vs. NoSQL vs. NewSQL](sql-nosql-newsql.md) (deep dive for stop 19 and the Q&A) · [Glossary](glossary.md) · [Sources and confidence](sources.md)

## The transitions at a glance

The timeline is chronological; the *causal* story has a few threads. This table is the cheat sheet for "why are we on this slide now?"

| From → To | What the first one could not do | What changed so the second appeared |
|-----------|--------------------------------|--------------------------------------|
| 01 → 02 | A count has no "what" | Farming and trade: many goods to track |
| 02 → 03 | Tokens in sealed envelopes cannot be checked without breaking them | Press the marks on the outside; then drop the tokens |
| 03 → 04 | Tablets pile up in archives | Large collections need finding aids |
| 04 → 05 | A catalog written as a book has one fixed order and cannot absorb new entries | One entry per card: insert, remove, re-sort, several drawers |
| 05 → 06 | Cards are read by humans; populations grow | Hole patterns that machines can read |
| 06 → 07 | Card decks and tape are sequential | Spinning disk gives random access |
| 07 → 08 | Random access reaches an address, but says nothing about how records relate | Apollo parts lists: parent → child pointers, trees of segments |
| 08 → 09 | Trees cannot express many-to-many | Pointer sets: networks |
| 09 → 10 | Programmers must navigate by hand, and programs break when data layout changes | Codd: tables, data independence |
| 10 → 11 | Relational algebra is hard to use | SEQUEL/SQL |
| 11 → 12 | Business records fit tables; scientific grids do not | Array models for science and images |
| 12 → 13 | Arrays serve a niche; mainstream developers have objects | Object databases |
| 13 → 14 | OODBs lose; absorbed as object-relational + ORMs. The next pain is volume, not shape | Google's MapReduce |
| 14 → 15 | MapReduce is batch-only | Bigtable for interactive updates |
| 15 → 16 | "Column family" is not columnar; real analytics needed real columns | Column stores for warehouses |
| 16 → 17 | Warehouses solve analytics; online apps need speed and uptime | Simple key-value stores |
| 17 → 18 | A blob per key hides relationships | Graph databases add edges |
| 18 → 19 | Two ways to add structure back to KV: edges or nesting | Document databases (and the NoSQL/NewSQL debate) |
| 19 → 20 | The same 2009 "rethink the DB" mood, in the trust dimension | Blockchain (thematic, not causal) |
| 20 → 21 | Blockchain removes the trusted operator; the market chose the opposite. Shared-nothing clusters (warehouses, NewSQL) are costly to run; networks beat disks | Cloud, object stores, lakehouse |
| 21 → 22 | Lakehouses serve SQL and ML; ML brings embeddings | Vector databases |
| 22 → 23 | New data type, new "model" | A new SQL index and type: the loop repeats |

## Three suggested story arcs

- **Pre-history in a hurry** (01–07): "Every database idea is a response to a record-keeping pain." All primitives. Stop at the RAMAC disk.
- **The model wars** (08–13): navigation vs. declarative, and why relational won. Model and language.
- **Big data and the NoSQL detour** (14–23): the fashion cycle, the [SQL vs. NoSQL vs. NewSQL](sql-nosql-newsql.md) debate, and how SQL absorbed each wave, category by category.

## Recurring themes to name out loud

1. **Data independence** *(Model)*. The relational model's real innovation: programs should not break when storage changes.
2. **Declarative beats navigational** *(Language)*. Say *what*, let the optimizer pick *how*.
3. **Denormalization is a loan** *(Model)*. Embedding or pre-joining is fast now and costly later (duplication, no data independence).
4. **Feature, not architecture** *(Primitives)*. Many "new databases" turn out to be one new index or type (vector, graph, JSON, full-text).
5. **Hardware drives architecture** *(Primitives)*. Disk (1956), SSD, fast networks and object stores (2010s) changed *implementations*, not the model.
6. **Stickiness.** Old systems (IMS) survive because migrating data is risky, not because they are best.
7. **Caveat for the speaker.** The 2024 paper is opinionated, written by two relational-database people. Present its conclusions as a well-argued position, and invite the audience to push back.
