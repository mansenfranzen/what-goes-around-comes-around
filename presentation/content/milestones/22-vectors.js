DB.addMilestone({
  id: '22',
  slug: 'vectors',
  title: 'Vectors',
  short: 'Vectors',
  year: '2019',
  pos: 2019,
  category: 'model',
  verdict: 'Absorbed',
  concept: 'VECTOR TYPE',
  today: 'embedding VECTOR(3)',
  problem: 'Keyword search matches words, not meaning, yet AI apps must find similar passages and images.',
  solution: 'Store each item as an embedding vector; an approximate nearest-neighbour index finds the closest ones fast.',
  relevance: 'A VECTOR column holds the embedding alongside the item. SQL can rank rows by distance, with or without an index.',
  takeaway: 'The vector type captures the model; an index makes the search faster.'
});
