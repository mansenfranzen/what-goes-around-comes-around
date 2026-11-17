DB.addMilestone({
  id: '18',
  slug: 'graph',
  title: 'Graph',
  short: 'Graph',
  year: '2007',
  pos: 2007.5,
  category: 'model',
  verdict: 'Converging',
  concept: 'SQL/PGQ',
  today: 'MATCH (a)-[:FRIEND*1..3]->(b)',
  problem: 'Social networks ask about friends of friends of friends, which meant verbose, slow chains of joins.',
  solution: 'Store nodes and edges with properties, and answer by following relationships from node to node.',
  relevance: 'Graph pattern matching is now part of SQL: SQL/PGQ in SQL:2023 queries tables as graphs.',
  takeaway: 'Relationships are data too. Store the edges.'
});
