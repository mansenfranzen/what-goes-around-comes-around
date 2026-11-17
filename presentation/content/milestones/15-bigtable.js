DB.addMilestone({
  id: '15',
  slug: 'bigtable',
  title: 'BigTable (Wide Column)',
  short: 'BigTable',
  year: '2004',
  pos: 2004,
  category: 'model',
  verdict: 'Niche survivor',
  concept: 'LSM TREE',
  today: 'memtable → SSTables',
  problem: 'Google needed to update its crawl database interactively, but MapReduce could only run batches.',
  solution: 'A distributed, sorted table store: rows by key, flexible column families, split into ranges across machines.',
  relevance: 'Its lasting gift: LSM-tree storage (memtable plus SSTables), now inside RocksDB and several SQL systems.',
  takeaway: 'The model faded; the storage trick stayed.'
});
