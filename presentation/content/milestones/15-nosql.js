DB.addMilestone({
  id: '15',
  slug: 'nosql',
  title: 'The Rise of NoSQL',
  short: 'NoSQL',
  year: '2005–2009',
  pos: 2005,
  category: 'primitives',
  verdict: 'Enduring trade-off',
  concept: 'PARTITION KEY',
  today: 'put(cart_id, cart)',
  problem: 'At peak traffic, one server cannot keep up. Millions of shoppers still expect the same narrow request, opening their own cart, to finish in milliseconds.',
  solution: 'Split carts across servers by ID. A get or put goes straight to one shard. With just those operations, the store needs no general SQL compiler or query optimizer.',
  relevance: 'They also gave up full ACID transactions across shards. A cart write could finish without waiting for inventory, but the store no longer guaranteed that both changed together.',
  takeaway: 'More servers can serve more carts without slowing each lookup. The price: the app must handle ad hoc searches and updates that must succeed together.'
});
