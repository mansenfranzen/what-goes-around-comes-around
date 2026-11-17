DB.addMilestone({
  id: '10',
  slug: 'relational',
  title: 'Relational Model',
  short: 'Relational',
  year: '1970',
  pos: 1970,
  category: 'model',
  verdict: 'Winner',
  concept: 'JOIN',
  today: 'orders.customer_id = customer.id',
  problem: 'Change where the data lived and every program broke; every new question meant a new program.',
  solution: 'Codd: keep data in tables linked by matching values, and ask in a high-level language.',
  relevance: 'Tables, keys and JOIN, plus data independence: indexes can change without touching a single query.',
  takeaway: 'Programs should never break when storage changes.'
});
