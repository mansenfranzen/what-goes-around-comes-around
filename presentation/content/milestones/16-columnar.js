DB.addMilestone({
  id: '16',
  slug: 'columnar',
  title: 'Columnar Storage',
  short: 'Columnar',
  year: '2013',
  pos: 2013,
  category: 'primitives',
  verdict: 'Winner',
  concept: 'COLUMN STORE',
  today: 'SELECT SUM(price) FROM sales',
  problem: 'Analysts summing one column of dozens still made row stores read every column from disk.',
  solution: 'A Parquet file groups values by column. Read price without reading names or addresses; use row-group statistics to skip more data.',
  relevance: 'Same tables, same SQL, new engine: today\'s warehouses (Redshift, BigQuery, Snowflake) all use column storage.',
  takeaway: 'Swap the storage, keep the SQL.'
});
