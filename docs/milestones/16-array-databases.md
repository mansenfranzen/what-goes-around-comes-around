# 16 · Array databases (1980s →)

[← 15 Database machines](15-database-machines.md) · [Index](../README.md) · [Next → 17 Object-oriented DBs](17-object-oriented-databases.md)

| | |
|---|---|
| **Era** | 1960s languages (APL) → 1980s first DBMS → today |
| **Verdict** | Niche survivor (strong in science) |
| **Key systems** | APL (1960s); PICDMS (first array DBMS); Rasdaman; kdb+; SciDB; TileDB; formats HDF5 and NetCDF |
| **In the app** | Timeline → "Array databases", demo: heat-map grid, slide through time, click cells |

## Summary
Data is a **multi-dimensional array** addressed by integer coordinates, such as `A[lat, lon, time]`. Position carries meaning.

## Context (paper §2.6)
- "Array" covers vectors (1-D), matrices (2-D) and tensors (3-D+). Examples: geographic surveys, genomic sequencing, computational fluid dynamics, and most ML datasets.
- Array **languages** go back to APL in the 1960s. The first array **DBMS** work began in the 1980s with PICDMS. The two oldest still developed are Rasdaman and kdb+; newer ones include SciDB and TileDB.
- HDF5 and NetCDF are widely used array file formats for scientific data.

## The problem
In a relational table every cell of a regular grid needs its coordinates repeated as columns: `(lat, lon, time, value)` for each cell. That wastes space, loses neighbour structure, and makes **slicing** ("temperature across all longitudes at lat 40") slow.

## The idea
Store a dense array and **index by position**. Choose tiling (chunking) so that a slice reads few chunks. Provide array operations (slice, subarray, aggregate along dimensions).

```
A[lat, lon, time] = [temp, humidity, pressure]
slice: A[40, *, t0]       // all longitudes at one latitude and time
```

## How to explain it
- **Analogy:** a spreadsheet vs. a photo. You do not store pixel (x, y) as separate rows; the position in the grid *is* the key.
- **Demo:** the app's 8×8 grid with a time slider; click a cell to see `A[lat, lon, t]`.
- **Technical challenge (paper):** disks are linear, arrays are multi-dimensional: you must map dimensions to storage with chunks, tiles, space-filling curves. Real data often is *not* a regular grid (e.g. geospatial in irregular shapes), so metadata maps coordinates to grid indexes, and apps usually keep array and non-array data together.
- **Market reality (paper):** a niche. Considerable traction in genomics and for satellite imagery (HDF5). "No major cloud provider offers a hosted array DBMS service."

## Relational lens (how SQL answered)
Array support crept into SQL: SQL:1999 added limited single-dimension fixed-length arrays; SQL:2003 nested arrays; **SQL:2023 SQL/MDA** adds true multi-dimensional arrays, heavily inspired by Rasdaman's query language. Data cubes (special arrays) were eclipsed by **columnar RDBMSs** for OLAP. The paper still expects scientific users to continue favoring bespoke array systems because RDBMSs cannot efficiently store and analyze arrays despite SQL/MDA.

## Coming from… [15 Database machines](15-database-machines.md)
Machines tried to speed up the relational model without changing it. Arrays challenged **the model itself** for a data class where rows and columns are a bad fit. Different attack on the same incumbent: a different data shape rather than different hardware.

## Leading to… [17 Object-oriented DBs](17-object-oriented-databases.md)
**What arrays could not do:** they address scientific and numeric data. Most software teams in the 1980s were not storing sensor grids. They were building applications in new object-oriented languages (Smalltalk, C++) where the main pain was **converting objects to rows and back**. The next challenger therefore targeted the mainstream: store application objects directly, no mapping layer.

## Sources
- [SP24] §2.6 (refs 114 PICDMS, 66/103 Rasdaman, 34 kdb+, 54/191 SciDB, 76 TileDB, 29 HDF5, 46 NetCDF, 155 raster extension proposal, 166 SQL/MDA) and §2.7.
- K. Iverson, *A Programming Language* (APL), 1962.
- [Wikipedia: Array DBMS](https://en.wikipedia.org/wiki/Array_DBMS), [Rasdaman](https://en.wikipedia.org/wiki/Rasdaman), [HDF5](https://en.wikipedia.org/wiki/HDF5), [NetCDF](https://en.wikipedia.org/wiki/NetCDF), [APL](https://en.wikipedia.org/wiki/APL_(programming_language)).
- Image: array tiling in rasdaman; Pebau.grandauer, CC BY-SA 3.0, Wikimedia Commons.
- Confidence: high on paper statements.
