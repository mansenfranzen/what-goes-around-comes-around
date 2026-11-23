DB.addMilestone({
  id: '20', slug: 'open-table-formats', title: 'Open Table Formats', short: 'Table formats',
  year: '2018', pos: 2018, category: 'primitives', verdict: 'Adopted',
  concept: 'FILE PRUNING', today: 'Iceberg · Delta Lake · Hudi',
  problem: 'Parquet can skip columns inside a file. Across a million files, which ones should an engine open, and which belong to the same committed version?',
  solution: 'Iceberg manifests index file ranges in a snapshot. Engines skip irrelevant files; writers publish all changes to a table in one atomic commit.',
  relevance: 'Table-level ACID transactions keep readers on a consistent snapshot during writes. Manifest summaries let many engines plan scans without listing every file.',
  takeaway: 'Parquet skips columns. Table metadata skips files and says which versions count.'
});
