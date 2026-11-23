# 04 · Pinakes of Alexandria (≈ 245 BCE)

[← 03 Clay tablets](03-clay-tablets.md) · [Index](../README.md) · [Next → 05 Card catalog](05-card-catalog.md)

| | |
|---|---|
| **Era** | Hellenistic Egypt, reign of Ptolemy II |
| **Verdict** | Ancestor: the catalog (index) as a separate structure |
| **Category** | **Primitives**: the *index* (a separate access structure) |
| **Key people** | Callimachus of Cyrene (c. 310–240 BCE); Zenodotus (alphabetical arrangement) |
| **In the app** | Timeline → "Pinakes", demo: scan the shelves vs. use the catalog |

## Summary
A catalog **about** the collection, stored separately from it, with authors, titles, subjects and locations. It turns "look through everything" into "look it up".

## Category
The catalog is the first **access-path** primitive: a second structure, ordered by a key, that points into the data. Every later index (B-tree, hash, inverted, vector) is a descendant. The relational twist comes much later: the model keeps indexes *out of* the query language, so you can add or drop one without changing a single question.

## Context
- The Library of Alexandria collected texts at large scale. Ancient sources give huge scroll counts; they are unreliable, so say "tens of thousands to hundreds of thousands, estimates vary".
- Callimachus compiled the *Pinakes* ("tablets"), reportedly in about 120 books, organized by genre and then alphabetically by author, with brief biographies and works lists, sometimes with line counts. Only fragments survive.

## The problem
Scrolls are hard to browse, titles are inconsistent, and authors are many. To find a text you would have to open scrolls one by one: an **O(n) scan** over a large n.

## The idea
Build a **second structure**, the catalog, whose entries point to the data. Order the catalog by a key (author, subject) so lookup is cheap.

```
{ author:"Homer", title:"Iliad", subject:"epic", shelf:"B-4" }
```

## How to explain it
- **Analogy:** the index at the back of a book, or a phone book for a library.
- **Demo:** the app races "walk the shelves" (step-by-step) vs. "look in the catalog" (one step). Use it to introduce the cost model that databases are obsessed with: **how many items do I touch?**
- **Key insight:** the catalog costs extra space and must be kept current. That trade-off is exactly the **index maintenance** trade-off in every DBMS.

## Relational lens
A secondary index. Relational systems formalize it: data lives in tables, indexes are separate B-trees or hash structures chosen by the DBA or the optimizer, and the **query language never mentions them**. That separation (the *what* from the *how*) is Codd's later insight.

## Coming from… [03 Clay tablets](03-clay-tablets.md)
Tablets made data durable and plentiful. Plentiful data created the need for **access paths**. Notice the pattern that repeats through the story: every capacity improvement in *storing* creates a retrieval problem.

## Leading to… [05 Card catalog](05-card-catalog.md)
**What the Pinakes could not do:** it was itself written down as a *book* (scrolls), so it froze **one fixed order** at the moment of writing. New acquisitions could only be squeezed into margins or added by recopying; looking something up by a second key (subject instead of author) needed a second book. Library catalogs stayed in this bound, handwritten or printed book form for nearly two thousand years. The fix that finally spread was physical: make **each catalog entry a separate, uniform object** that can be inserted, removed and re-sorted at will. That is the card catalog, from 1791. (Say the time jump out loud: the *idea* of the index is old; making it *updatable* is the next invention.)

## Sources
- [Wikipedia: Pinakes](https://en.wikipedia.org/wiki/Pinakes), [Callimachus](https://en.wikipedia.org/wiki/Callimachus), [Library of Alexandria](https://en.wikipedia.org/wiki/Library_of_Alexandria).
- Image: [Case of scrolls](https://commons.wikimedia.org/wiki/File:Invention_of_Printing_p043a.jpg), from T. L. De Vinne's *The Invention of Printing* (1876), p. 43, public domain. Ask which roll contains the work you need without opening them all. This is an illustration of the lookup problem, not a surviving case or catalog from Alexandria.
- Confidence: Callimachus' role is well attested; the "120 books" figure comes from the Byzantine *Suda* lexicon; scroll counts are uncertain.
