DB.addMilestone({
  id: '19',
  slug: 'documents',
  title: 'Documents / JSON',
  short: 'Documents',
  year: '2009',
  pos: 2009,
  category: 'model',
  verdict: 'Converging',
  concept: 'JSON',
  today: 'CREATE TABLE t (doc JSONB)',
  problem: 'Web developers wanted to store their app\'s JSON as is, evolve fields freely and scale out.',
  solution: 'Keep each record as one nested JSON document: one read fetches the whole customer, no joins.',
  relevance: 'JSON became a column type (SQL:2016, PostgreSQL JSONB), and NoSQL stores adopted SQL-like languages.',
  takeaway: 'Embed what you read together. Reference shared facts so you can update them once.'
});
