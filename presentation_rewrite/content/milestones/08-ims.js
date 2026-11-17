DB.addMilestone({
  id: '08',
  slug: 'ims',
  title: 'IMS (Hierarchical)',
  short: 'IMS',
  year: '1966',
  pos: 1966,
  category: 'model',
  verdict: 'Legacy',
  concept: 'TREE',
  today: 'WITH RECURSIVE parts AS (…)',
  problem: 'NASA\'s Apollo program tracked millions of parts nested in assemblies, which flat files could not express.',
  solution: 'IBM stored data as trees: parent records with child records beside them, walked from the root.',
  relevance: 'The first commercial data model: parent-child trees, which SQL now rebuilds with recursive WITH queries.',
  takeaway: 'Fast along one path, stuck everywhere else.'
});
