# 07 · RAMAC disk (1956)

[← 06 Hollerith punch cards](06-hollerith-punch-cards.md) · [Index](../README.md) · [Next → 08 IMS](08-ims-hierarchical.md)

| | |
|---|---|
| **Era** | Early computing |
| **Verdict** | Ancestor: random access storage; enables everything from IMS to SQL |
| **Category** | **Primitives**: *random access* (addresses, seeks, pointers) |
| **Key artifact** | IBM 350 disk storage unit in the IBM 305 RAMAC (announced 1956) |
| **In the app** | Timeline → "RAMAC disk", demo: tape (wind) vs. disk (jump) |

## Summary
Records live on spinning magnetic platters, and a head can **seek directly** to any of them. Direct access, not just sequential scans.

## Category
A pure primitive. Random-access storage says nothing about meaning or language, but it creates the **physical layer** (pages, addresses, pointers) that the next two models expose to programmers and that the relational model will deliberately hide.

## Context
- Before RAMAC (Random Access Method of Accounting and Control), bulk storage was cards and magnetic tape (e.g. UNIVAC, 1951): sequential only.
- The IBM 350 unit used a stack of 50 large platters (about 24 inches) and stored roughly 5 million characters, i.e. a few megabytes. Average access was a fraction of a second, leased for thousands of dollars a month.
- It made "online" applications (inventory, reservations, accounts) conceivable.

## The problem
Tape and cards force you to read in order. Updating one customer's balance means rewriting a reel. Real-time questions about one record are impractical.

## The idea
Put data on a disk; address each record by a location (disk address). A single seek retrieves it. Combine with an index (see [Pinakes](04-pinakes.md)) to find the address from a key.

```
read(record 9000)
  tape: wind past 8,999 records
  disk: 1 seek
```

## How to explain it
- **Analogy:** a cassette tape vs. a vinyl record: you can drop the needle anywhere.
- **Demo:** the app's seek race.
- **Important framing:** disks make *navigation* possible. Once you can jump to any record by address, a database can store **pointers**. The next three stops (IMS, CODASYL, and the relational reaction) are three answers to "what do we do with pointers?"
- **Recurring theme:** hardware shifts reshape database design. We return to this with SSDs, fast networks and object storage in the 2010s.

## Relational lens
Disks supply the *physical* layer that Codd later wants to hide: pages, addresses, seeks. Data independence is the promise that programs need not know about any of this.

## Coming from… [06 Hollerith punch cards](06-hollerith-punch-cards.md)
Cards digitized *records*; tape digitized *bulk storage*; disks digitized **access**. The enemy changes from "reading by hand" to "reading in order".

## Leading to… [08 IMS](08-ims-hierarchical.md)
**What random access made possible, and what it did not solve:** you can reach any record fast *if you know its address*. The disk says nothing about how records relate to each other, or how a program should find the right address. In the 1960s the most urgent case was industrial: NASA's Apollo program had to track millions of parts in nested assemblies (rocket → stage → engine → valve), with constant updates. The obvious use of disk addresses was to store **pointers from parent records to child records** and walk them. IBM started building exactly that in 1966: IMS, the hierarchical model, and with it the first commercial answer to the *model* question.

## Sources
- [Wikipedia: IBM 305 RAMAC](https://en.wikipedia.org/wiki/IBM_305_RAMAC), [Hard disk drive](https://en.wikipedia.org/wiki/Hard_disk_drive), [Magnetic-tape data storage](https://en.wikipedia.org/wiki/Magnetic-tape_data_storage).
- Image: IBM 350 RAMAC disk mechanism; ArnoldReinhold, CC BY-SA 3.0, Wikimedia Commons.
- Confidence: capacity ("about 5 million characters") and "50 platters" are standard figures. Access time and lease price vary by source **(verify)**.
