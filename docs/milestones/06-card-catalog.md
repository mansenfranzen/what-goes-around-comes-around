# 06 · Card catalog (1791)

[← 05 Domesday Book](05-domesday-book.md) · [Index](../README.md) · [Next → 07 Hollerith punch cards](07-hollerith-punch-cards.md)

| | |
|---|---|
| **Era** | French Revolution → 19th-century libraries |
| **Verdict** | Ancestor: row = card; first easily *updatable* database |
| **Key names** | French Revolutionary inventory (1791); Linnaeus's slips (18th c.); Melvil Dewey (1876); Library of Congress printed cards (1901) |
| **In the app** | Timeline → "Card catalog" |

## Summary
One record per card. Cards can be inserted, removed and re-sorted, and several catalogs (by author, title, subject) can coexist.

## Context
- In 1791 the French revolutionary government ordered an inventory of the libraries seized from the Church and nobility. Instructions called for one entry per **playing card**, using the blank backs, because they were uniform in size and plentiful. This is a widely told origin story for the library card catalog.
- Carl Linnaeus had earlier used slips of paper for species notes, a similar idea in natural history.
- In the 19th century libraries adopted card catalogs broadly. Dewey's decimal classification (1876) provided a classification index; in 1901 the Library of Congress began distributing printed catalog cards, an early form of **shared data exchange**.

## The problem
A bound catalog (like the Pinakes in book form or Domesday) is **one fixed order**. Adding a new acquisition means rewriting pages. Looking up by author *and* by subject requires multiple books.

## The idea
Make each record a separate, uniform physical object. Keep cards in sorted drawers. To add: insert a card. To re-organize: re-sort or duplicate cards. Maintain several drawers with different sort keys.

```
card { subject, author, title, shelf }
drawers: by_author, by_title, by_subject   // multiple indexes on one data set
```

## How to explain it
- **Analogy:** a deck of contact cards. Sorting, filtering, adding are trivial.
- **Database translation:** row-per-object storage; secondary indexes as extra drawers; **insert/update/delete** become cheap.
- **Trade-off to point out:** the drawers must all be kept consistent when a card changes. Index maintenance cost again.
- **Fun check:** ask who in the audience has ever used one. It is a nice moment to ask "what replaced it?" (OPACs and the MARC record format of the 1960s onward, i.e. computerized catalogs.)

## Relational lens
A card is a tuple; a drawer is an index; the whole catalog is a table with indexes. The model is essentially there, but everything is **human-operated** (a human is the query engine).

## Coming from… [05 Domesday Book](05-domesday-book.md)
Domesday gave the *content discipline* (fixed fields); cards give the *physical flexibility* (separate, movable records). Together they are most of what a record-oriented database is: uniform records that can be updated and viewed in more than one order.

## Leading to… [07 Hollerith punch cards](07-hollerith-punch-cards.md)
**What cards could not do:** humans must read them. At population scale (millions of people, dozens of facts each) the bottleneck is not the format but the **human reading and counting**. The key idea that follows is to keep the card, but make the *content* machine-readable by encoding facts as **holes**, so a machine can sort and count at speed. The trigger was the US census, where tabulation by hand took close to a decade.

## Sources
- [Wikipedia: Library catalog](https://en.wikipedia.org/wiki/Library_catalog), [Dewey Decimal Classification](https://en.wikipedia.org/wiki/Dewey_Decimal_Classification), [Playing card](https://en.wikipedia.org/wiki/Playing_card).
- Image: card catalog, Indiana State Library; TBurmeister (WMF), CC BY-SA 4.0, Wikimedia Commons.
- Confidence: the 1791 playing-card instruction is well known; details of how widely it was followed are less certain. Linnaeus slip usage **(verify)** before citing precisely.
