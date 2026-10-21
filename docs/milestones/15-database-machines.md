# 15 · Database machines (1981 →)

[← 14 ER & semantic models](14-er-and-semantic-models.md) · [Index](../README.md) · [Next → 16 Array databases](16-array-databases.md)

| | |
|---|---|
| **Era** | 1980s, with later FPGA and GPU echoes |
| **Verdict** | Dead end (for most companies) |
| **Key systems** | Britton-Lee IDM/500 (1981, first commercial accelerator); Teradata (Y-net, later software-only); Netezza (FPGA); GPU DBMSs (Kinetica, HeavyDB…) |
| **In the app** | Timeline → "Database machines" |

## Summary
Custom hardware built to run relational queries faster than general CPUs. It repeatedly failed on cost-effectiveness.

## Context (from the paper, §3.5)
- Britton-Lee's IDM/500 (1981) paired a conventional CPU with an accelerator for a small part of the execution path. It was "not cost-effective".
- Teradata built network hardware to sort tuples in flight (Y-net), later dropped for a software-only approach. The paper says all other custom hardware in the 1980s failed.
- Since then: FPGAs (Netezza in the late 1990s; Swarm64 for PostgreSQL later switched to software-only) and GPUs (Kinetica, SQream, Brytlyt, HeavyDB). GPU systems bottleneck on moving data into device memory.
- Cloud giants can justify $50–100M custom hardware (the paper cites Amazon's AQUA accelerators for Redshift and Google's custom in-memory shuffle components for BigQuery).

## The problem
Early relational systems were CPU- and I/O-hungry. If joins and sorts dominate cost, specialized silicon seems like an obvious cure.

## The idea
Offload part of query execution (scan, filter, sort) to a specialized processor or network element, hoping for large speed-ups.

```
query -> [CPU + accelerator]
          ↳ accelerator handles scans/filters/sorts; CPU does the rest
```

## How to explain it
- **Analogy:** building a custom engine for one type of race car, while commodity engines get faster every year.
- **Why it failed (paper):** (1) the accelerator covers only a small slice of execution; (2) commodity CPUs improve fast and cheaply (Moore's law era); (3) integrating the accelerator into a DBMS is hard; if optional, adoption is low; if critical, no vendor outsources a core component; (4) cloud CPU time is "incredibly cheap" at scale.
- **What to say about the future:** the paper predicts "many attempts in this space over the next two decades", with success likely only inside large cloud vendors.
- **Takeaway:** this stop has **no data-model implications**; it is purely an implementation story.

## Relational lens
Machines never challenged the relational model; they tried to run it faster. Their lesson is the exception to the usual story: not every database failure is about the model. Many are about **economics**.

## Coming from… [14 ER & semantic models](14-er-and-semantic-models.md)
Relational + SQL + ER = commercial success by the early 1980s. Success raised performance expectations. Machines are the "hardware path" response. (Include this as a deliberate detour: the *model* was not blamed, the *speed* was.)

## Leading to… [16 Array databases](16-array-databases.md)
**What hardware could not change:** the shape of the data. In the same decade, another group of challengers went after the model itself. Scientists and image analysts had data that is naturally **grids**: pixels, sensor readings by (latitude, longitude, time). Forcing them into rows and columns wastes structure and speed. Array data models, first implemented in 1980s research systems like PICDMS, attacked that mismatch. So the narrative moves from "faster relational" back to "different model".

## Sources
- [SP24] §3.5 "Hardware Accelerators" (refs 1, 2, 85, 91, 102, 107, 169, 192 etc. therein).
- [Wikipedia: Database machine](https://en.wikipedia.org/wiki/Database_machine), [Teradata](https://en.wikipedia.org/wiki/Teradata).
- D. Boral, D. DeWitt, "Database Machines: An Idea Whose Time Has Passed?", 1983 (a classic critique) **(verify exact venue)**.
- Image: NCR Teradata WorldMark storage; Patrick Finnegan, CC BY 2.0, Wikimedia Commons. It is later Teradata hardware, used as a visual stand-in.
- Confidence: high on paper claims; the Boral–DeWitt citation from memory.
