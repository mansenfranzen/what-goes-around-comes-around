# 25 · Blockchain databases (2009 →)

[← 24 Document DBs / NoSQL](24-document-databases.md) · [Index](../README.md) · [Next → 26 NewSQL & Spanner](26-newsql-spanner.md)

| | |
|---|---|
| **Era** | 2009 → |
| **Verdict** | Dead end ("an inefficient technology looking for an application") |
| **Key systems** | Bitcoin (2009); BigchainDB, Fluree, ResilientDB; Amazon QLDB (2018), a centralized immutable ledger |
| **In the app** | Timeline → "Blockchain databases" |

## Summary
A decentralized, append-only log of transactions, chained by hashes so tampering is detectable. Built for settings where nobody trusts a central authority.

## Context (paper §3.6)
- Blockchains are decentralized, log-structured databases (ledgers) that keep incremental checksums with a variation of **Merkle trees**; applications use them to verify that earlier updates have not been altered.
- Without a central authority to order updates, they use a **Byzantine fault tolerant (BFT)** commit protocol.
- Ideal use: peer-to-peer apps where "one cannot trust anybody". Per the paper, today's only real use case is cryptocurrency.
- Attempts at general DBMSs on blockchains: Fluree, BigChainDB, ResilientDB.

## The problem
How do you maintain a shared, tamper-evident record among parties with no trusted intermediary?

## The idea
```
block[n] = { transactions, hash(block[n-1]) }
```
Any change to an old block changes its hash and breaks every later link. Consensus decides which block comes next.

## How to explain it
- **Analogy:** a notebook where each page contains a fingerprint of the previous page, and thousands of strangers keep identical copies.
- **Why the paper is skeptical:**
  - Trust exists anyway: house sales rely on title companies; legitimate businesses accept a trusted party.
  - Performance: about **five orders of magnitude** slower, a price legitimate businesses will not pay.
  - If organizations trust each other, a shared distributed DBMS is far more efficient.
  - "Resiliency via replication among random Internet participants" is not a sensible backup strategy for mission-critical data.
  - All the major cryptocurrency exchanges reportedly run on traditional RDBMSs.
- **The small exception:** private ledger databases. Amazon's QLDB (released 2018) offered immutable, verifiable history without decentralization, built after Amazon found no compelling use case for a fully decentralized blockchain DBMS. **(Verify current status; AWS has announced end-of-support for QLDB.)**
- **Moral:** "an inefficient technology looking for an application. History has shown this is the wrong way to approach systems development."

## Relational lens
The legitimate pieces (immutability, auditability, verifiable history) are available inside relational systems via append-only tables, audit logs and ledger tables. No new data model was introduced.

## Coming from… [24 Document DBs / NoSQL](24-document-databases.md)
Thematic rather than causal: both appear in 2009 as radical rethinks that promised to replace the conventional database. Use it as a pattern-recognition exercise for the audience: *what problem is really being solved, and could a boring database do it?*

## Leading to… [26 NewSQL & Spanner](26-newsql-spanner.md)
**Back to the main line.** Whatever the hype, mainstream organizations still needed **scalable OLTP with real transactions and SQL**. NoSQL systems had scaled out by dropping ACID; blockchains by dropping trust assumptions and speed. NewSQL (and Google's Spanner) took the opposite approach: keep the relational model and ACID, and solve distribution.

## Sources
- [SP24] §3.6 (refs 25 Fluree, 12 BigChainDB, 136 ResilientDB, 65 QLDB, 108 Amazon's assessment) and §3.7.
- [Wikipedia: Blockchain](https://en.wikipedia.org/wiki/Blockchain), [Bitcoin](https://en.wikipedia.org/wiki/Bitcoin).
- S. Nakamoto, "Bitcoin: A Peer-to-Peer Electronic Cash System", 2008.
- Image: Bitcoin blockchain illustration; Satheesh Sankaran, CC BY-SA 4.0, Wikimedia Commons.
- Confidence: paper claims are quoted as the paper's opinion; this topic has strong dissent among blockchain practitioners. Present it as a position.
