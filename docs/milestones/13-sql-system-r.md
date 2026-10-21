# 13 · SQL and System R (1974–79)

[← 12 Relational model](12-relational-model.md) · [Index](../README.md) · [Next → 14 ER & semantic models](14-er-and-semantic-models.md)

| | |
|---|---|
| **Era** | 1970s–1980s |
| **Verdict** | **Winner** |
| **Key people / systems** | Donald Chamberlin & Raymond Boyce (SEQUEL, 1974); IBM System R; Oracle (first commercial SQL RDBMS, 1979); IBM SQL/DS (1981), DB2 (1983); ANSI/ISO SQL standards from 1986–87 |
| **In the app** | Timeline → "SQL & System R", demo: change a city and toggle an index; compare plans |

## Summary
SQL gave the relational model a **readable, declarative language**. You say *what* you want; the optimizer decides *how*.

## Context
- SEQUEL ("Structured English Query Language") was published in 1974 and later shortened to SQL (reportedly for trademark reasons).
- System R (IBM San Jose, 1970s) implemented SQL with transactions, locking, logging and a cost-based optimizer, much of it foundational for later systems.
- Oracle's first commercial SQL product appeared in 1979; IBM followed with SQL/DS and DB2. A competing language, QUEL from Ingres, lost the language war. Standardization (ANSI 1986, ISO 1987) made SQL the default.

## The problem
Relational algebra is powerful but not friendly. Business users and programmers need something closer to ordinary English that still has a precise meaning.

## The idea
A declarative query language over relations:

```sql
SELECT name
FROM customer c JOIN orders o ON o.customer_id = c.id
WHERE o.total > 100;
```
The optimizer chooses between table scans, index lookups, join orders and algorithms, using statistics.

## How to explain it
- **Analogy:** ordering at a restaurant. You say *what*; the kitchen decides *how*.
- **Demo:** the app shows the same query with and without an index: sequential scan of a million rows vs. an index scan touching a handful.
- **Paper's argument:** the optimizer "remains the hardest part of building a DBMS". It improved for fifty years. We suspect this engineering burden is one reason early NoSQL systems skipped SQL; later many reintroduced it. "Higher level languages are almost universally preferred to record-at-a-time notations."
- **Common question:** "Is SQL perfect?" No. Several proposed replacements (PRQL, Malloy) fix warts but "are not compelling enough to overcome its entrenched userbase and ecosystem" (paper).

## Relational lens
SQL is the relational model's **interface**. Its longevity comes from the ability to evolve: each wave of new data models has been answered by new SQL features.

## Coming from… [12 Relational model](12-relational-model.md)
Codd defined the model; SQL made it **usable**; System R made it **fast and safe** enough for real businesses. This is the pattern for any successful technology: an idea (model), an interface (language), and an engine (optimizer, transactions).

## Leading to… [14 ER & semantic models](14-er-and-semantic-models.md)
**What SQL did not answer:** it assumes you already have a good table design. How should you decide which tables and columns exist? Business stakeholders think in *things and relationships* ("a customer places orders containing products"). Peter Chen's entity-relationship model (1976) gave a diagram language for this, and the late 1970s and 1980s produced "semantic" and "extended relational" models that tried to capture meaning more richly than flat tables.

## Sources
- [CB74] Chamberlin & Boyce. [Astr76] System R. [Sel79] optimizer.
- [SP24] §2.3 and §4 (optimizer, SQL longevity, PRQL/Malloy).
- [Wikipedia: SQL](https://en.wikipedia.org/wiki/SQL), [Donald D. Chamberlin](https://en.wikipedia.org/wiki/Donald_D._Chamberlin), [Oracle Database](https://en.wikipedia.org/wiki/Oracle_Database), [IBM System R](https://en.wikipedia.org/wiki/IBM_System_R).
- Image: Don Chamberlin, Dicklyon, CC BY-SA 4.0, Wikimedia Commons.
- Confidence: high on 1974 paper and 1979 Oracle; standard years (1986/87) as commonly cited; trademark reason for the name change **(verify)**.
