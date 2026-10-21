# 04 · Pinakes of Alexandria (≈ 245 BCE)

[← 03 Clay tablets](03-clay-tablets.md) · [Index](../README.md) · [Next → 05 Domesday Book](05-domesday-book.md)

| | |
|---|---|
| **Era** | Hellenistic Egypt, reign of Ptolemy II |
| **Verdict** | Ancestor: the catalog (index) as a separate structure |
| **Key people** | Callimachus of Cyrene (c. 310–240 BCE); Zenodotus (alphabetical arrangement) |
| **In the app** | Timeline → "Pinakes", demo: scan the shelves vs. use the catalog |

## Summary
A catalog **about** the collection, stored separately from it, with authors, titles, subjects and locations. It turns "look through everything" into "look it up".

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

## Leading to… [05 Domesday Book](05-domesday-book.md)
**What a catalog could not do:** it organizes records that already exist. It does not *produce* uniform records. A ruler who wants to know what the kingdom holds must collect new information, systematically, in a fixed format. The jump is from **organizing** to **collecting**: the first large, questionnaire-driven data-gathering exercise in the Western tradition, in 1086.

## Sources
- [Wikipedia: Pinakes](https://en.wikipedia.org/wiki/Pinakes), [Callimachus](https://en.wikipedia.org/wiki/Callimachus), [Library of Alexandria](https://en.wikipedia.org/wiki/Library_of_Alexandria).
- Image: *The Burning of the Library at Alexandria in 391 AD* (illustration), Ambrose Dudley, public domain, Wikimedia Commons. It is a later artist's imagination, not a contemporary picture.
- Confidence: Callimachus' role is well attested; the "120 books" figure comes from the Byzantine *Suda* lexicon; scroll counts are uncertain.
