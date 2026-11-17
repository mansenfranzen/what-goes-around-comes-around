DB.addMilestone({
  id: '12',
  slug: 'arrays',
  title: 'Arrays',
  short: 'Arrays',
  year: '1980s',
  pos: 1982,
  category: 'model',
  verdict: 'Niche survivor',
  concept: 'ARRAY',
  today: 'A[lat, lon, time]',
  problem: 'Scientists\' pixel and sensor grids waste space in tables: every cell repeats coordinates, neighbours get lost.',
  solution: 'Store a dense array indexed by position, chunked into tiles so a slice reads few chunks.',
  relevance: 'Position as the key: SQL later added ARRAY types and, in SQL:2023, multi-dimensional arrays (SQL/MDA).',
  takeaway: 'Sometimes the position is the key.'
});
