DB.addMilestone({
  id: '20',
  slug: 'blockchain',
  title: 'Blockchain',
  short: 'Blockchain',
  year: '2009',
  pos: 2009.5,
  category: 'primitives',
  verdict: 'Dead end',
  concept: 'LEDGER',
  today: 'append-only ledger table',
  problem: 'Strangers who trust no central authority still wanted a shared record nobody could quietly rewrite.',
  solution: 'Chain blocks by hashes so any edit breaks later links, and let strangers agree by consensus.',
  relevance: 'Only the tamper-evident, append-only history survived, as ledger tables and audit logs inside ordinary databases.',
  takeaway: 'Ask: could a boring database do this?'
});
