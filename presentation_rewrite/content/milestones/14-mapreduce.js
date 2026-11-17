DB.addMilestone({
  id: '14',
  slug: 'mapreduce',
  title: 'MapReduce',
  short: 'MapReduce',
  year: '2003',
  pos: 2003,
  category: 'language',
  verdict: 'Dead end',
  concept: 'GROUP BY',
  today: 'GROUP BY word',
  problem: 'Google had to process the entire web crawl on thousands of cheap, failing machines.',
  solution: 'Programmers write just map and reduce; the framework spreads the work and survives machine failures.',
  relevance: 'Scale-out, fault-tolerant execution lives on inside SQL engines; the job itself is a GROUP BY.',
  takeaway: 'Scale was real; the hand-written interface lost to SQL.'
});
