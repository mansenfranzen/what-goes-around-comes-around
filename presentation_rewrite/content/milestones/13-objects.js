DB.addMilestone({
  id: '13',
  slug: 'objects',
  title: 'Objects / OODBMS',
  short: 'Objects',
  year: 'late 1980s',
  pos: 1988,
  category: 'model',
  verdict: 'Absorbed',
  concept: 'UDT',
  today: 'CREATE TYPE address AS (…)',
  problem: 'Programmers kept splitting objects into rows on save and gluing them back on load.',
  solution: 'Store the object graph as is: identity, nesting and references, navigated from the programming language.',
  relevance: 'Relational systems absorbed it as user-defined types (UDT) and object-relational features; ORMs handle the rest.',
  takeaway: 'Tables learned objects; objects didn\'t replace tables.'
});
