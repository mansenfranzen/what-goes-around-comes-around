# 18 · XML databases (late 1990s)

[← 17 Object-oriented DBs](17-object-oriented-databases.md) · [Index](../README.md) · [Next → 19 MapReduce / Hadoop](19-mapreduce-hadoop.md)

| | |
|---|---|
| **Era** | Late 1990s – 2000s |
| **Verdict** | Absorbed into SQL (SQL/XML, 2003); JSON overtook XML |
| **Key technologies** | SGML → XML 1.0 (W3C, 1998); XPath, XQuery; native XML DBMSs; SQL/XML |
| **In the app** | Timeline → "XML databases" |

## Summary
Tree-shaped, self-describing **documents** (XML) stored and queried natively, with XPath/XQuery instead of SQL.

## Context
- The paper traces the document model back through **SGML** and **XML**. XML 1.0 became a W3C recommendation in 1998 and dominated enterprise data exchange (web services, configuration, publishing).
- "Semi-structured" data (nested, optional fields) was a research theme; startups and incumbents built native XML databases.
- Predicted fate (2005 paper): they would not supplant RDBMSs. The 2024 paper says that prediction was correct.

## The problem
Business documents and partner messages are nested, with optional parts and mixed content. Flattening them into tables loses the structure and complicates schema evolution.

## The idea
Store XML trees directly. Query with **XPath/XQuery**. Validate with schemas (XSD).

```xml
<customer>
  <name>Ada</name>
  <orders><order id="1"><item>pen</item></order></orders>
</customer>
```
```
XPath: /customer/orders/order[@id="1"]/item
```

## How to explain it
- **Analogy:** a Word document vs. a spreadsheet. A document is hierarchical and irregular; a table is regular.
- **Key point:** this is round three of the same argument (after hierarchical/IMS and OODB): "store data in the shape the application sees".
- **Why it faded:** verbose syntax; relational vendors added XML types and **SQL/XML** (SQL:2003); and web developers moved to JSON (simpler, native to JavaScript).
- **Paper's summary:** the 1990s XML buzz is one in a lineage of document-ish models, all absorbed by SQL.

## Relational lens
SQL:2003 added XML data type and publishing/querying functions. The same pattern will repeat for JSON in SQL:2016. The RDBMS strategy: add a type + operators + indexes, keep the relational core.

## Coming from… [17 Object-oriented DBs](17-object-oriented-databases.md)
OODBs promised "store what the app has" but were language-bound. XML broadened it: a language-neutral, standardized way to describe nested data. It is the **same idea with a better portability story**, and it still lost because relational systems could simply absorb it.

## Leading to… [19 MapReduce / Hadoop](19-mapreduce-hadoop.md)
**What XML did not address:** *volume*. By the early 2000s the issue was no longer how to describe a document but how to **process the entire web** (billions of pages) on commodity machines that fail every day. Google faced this with its web crawl and built a purpose-made framework, MapReduce, ignoring data modelling and database practice entirely. The conversation moves from *semantics* to *scale*.

## Sources
- [SP24] §2.3 (refs 117 SGML, 118 XML, 188 the 2005 paper) and §1.
- [SH05] on semi-structured data.
- [Wikipedia: XML](https://en.wikipedia.org/wiki/XML), [JSON](https://en.wikipedia.org/wiki/JSON).
- Image: JSON vs. XML; Diego Mariano, CC BY-SA 4.0, Wikimedia Commons.
- Confidence: high on arc; XQuery/XSD details are general knowledge.
