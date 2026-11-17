DB.addMilestone({
  id: '16',
  slug: 'columnar',
  title: 'Columnar Storage',
  short: 'Columnar',
  year: '2005',
  pos: 2005,
  category: 'primitives',
  verdict: 'Winner',
  concept: 'COLUMN STORE',
  today: 'SELECT SUM(price) FROM sales',
  problem: 'Analysts summing one column of dozens still made row stores read every column from disk.',
  solution: 'Store each column contiguously: read only what you need, compress well, and process in tight loops.',
  relevance: 'Same tables, same SQL, new engine: today\'s warehouses (Redshift, BigQuery, Snowflake) all use column storage.',
  takeaway: 'Swap the storage, keep the SQL.'
});
