DB.addMilestone({
  id: '17',
  slug: 'key-value',
  title: 'Key-Value',
  short: 'Key-value',
  year: '2007',
  pos: 2007,
  category: 'model',
  verdict: 'Absorbed',
  concept: 'MAP TYPE',
  today: 'items MAP(VARCHAR, INTEGER)',
  problem: 'Busy websites needed to save a session or cart by id, instantly and always.',
  solution: 'Give each cart a unique key and treat its contents as one value. Get or replace that value by key.',
  relevance: 'A MAP column brings the same shape into a row: in a cart, each item code maps to its quantity.',
  takeaway: 'Key-value is a model; a hash index is one way to find a key.'
});
