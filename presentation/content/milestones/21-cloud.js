DB.addMilestone({
  id: '21',
  slug: 'cloud',
  title: 'Cloud Databases',
  short: 'Cloud',
  year: '2013',
  pos: 2013,
  category: 'primitives',
  verdict: 'Winner',
  concept: 'SERVERLESS',
  today: 'FROM \'s3://lake/*.parquet\'',
  problem: 'Provisioned clusters were costly to run, always on, and reshuffled all data whenever you resized.',
  solution: 'Keep data in cheap object storage in open formats; rent elastic compute only while queries run.',
  relevance: 'Serverless SQL: elastic compute over open Parquet files on object storage, the lakehouse pattern.',
  takeaway: 'Split compute from storage; SQL stays on top.'
});
