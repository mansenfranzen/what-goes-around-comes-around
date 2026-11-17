DB.addMilestone({
  id: '22',
  slug: 'vectors',
  title: 'Vectors',
  short: 'Vectors',
  year: '2019',
  pos: 2019,
  category: 'primitives',
  verdict: 'Converging',
  concept: 'VECTOR INDEX',
  today: 'ORDER BY distance(v, :q) LIMIT 5',
  problem: 'Keyword search matches words, not meaning, yet AI apps must find similar passages and images.',
  solution: 'Store each item as an embedding vector; an approximate nearest-neighbour index finds the closest ones fast.',
  relevance: 'A vector type plus an ANN index: SQL databases added both within a year of ChatGPT.',
  takeaway: 'New kind of search: a feature, not a foundation.'
});
