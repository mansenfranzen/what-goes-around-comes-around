/* Big Picture content: where each milestone symbol sits on the mascot "Rowie" (SVG viewBox 0 0 1000 1020),
   a one-line role per piece, and the query-run animation. Edit here to move pieces or change wording;
   the silhouette itself is drawn in js/views/bigpicture.js. */
DB.bigpicture = {
  // Assembly order, independent of the timeline: legs, arms, body, voice, then synthesis.
  pieces: [
    { id: '01', x: 360, y: 938, r: 44, role: 'COUNT: the first aggregate' },
    { id: '02', x: 640, y: 938, r: 44, role: 'Typed values: what is counted' },
    { id: '03', x: 388, y: 831, r: 44, role: 'Tables with rows and a schema' },
    { id: '04', x: 612, y: 831, r: 44, role: 'The catalog: data about the data' },
    { id: '05', x: 230, y: 436, r: 44, role: 'Indexes and INSERT, kept sorted' },
    { id: '06', x: 770, y: 436, r: 44, role: 'WHERE: filter by column' },
    { id: '07', x: 174, y: 524, r: 44, role: 'Random access to storage' },
    { id: '21', x: 826, y: 524, r: 44, role: 'Elastic, serverless storage and compute' },
    { id: '16', x: 144, y: 625, r: 44, role: 'Read only the columns you need' },
    { id: '20', x: 856, y: 625, r: 44, role: 'Snapshots: which files form one table version' },

    { id: '10', x: 500, y: 572, r: 64, role: 'At the heart: tables of values, joined by keys' },
    { id: '08', x: 360, y: 448, r: 44, role: 'Tree-shaped data, parent to child' },
    { id: '09', x: 500, y: 448, r: 44, role: 'Links between records, i.e. joins' },
    { id: '12', x: 640, y: 448, r: 44, role: 'ARRAY columns inside tables' },
    { id: '13', x: 360, y: 572, r: 44, role: 'User-defined types and objects' },
    { id: '17', x: 640, y: 572, r: 44, role: 'A MAP column holds key-value pairs in a row' },
    { id: '19', x: 360, y: 696, r: 44, role: 'JSON columns for flexible shapes' },
    { id: '18', x: 500, y: 696, r: 44, role: 'Paths over relations (SQL/PGQ)' },
    { id: '22', x: 640, y: 696, r: 44, role: 'A VECTOR column holds an embedding in a row' },

    { id: '11', x: 500, y: 249, r: 54, role: 'SQL is the language: say what you want, not how to find it' },
    { id: '23', x: 500, y: 57, r: 40, role: 'New types and storage, same SQL interface' }
  ],

  // Query run (last step): each stage lights up the piece that does that job.
  query: {
    sql: ['SELECT region, SUM(amt)', 'FROM sales', 'WHERE year = 2024', 'GROUP BY region;'],
    stages: [
      { id: '11', label: 'Declarative question' },
      { id: '10', label: 'Plan over relations' },
      { id: '04', label: 'Look up the catalog' },
      { id: '21', label: 'Allocate compute' },
      { id: '20', label: 'Skip files using snapshot metadata' },
      { id: '05', label: 'Use the index' },
      { id: '07', label: 'Seek to the data' },
      { id: '16', label: 'Read only the needed columns' },
      { id: '06', label: 'Filter: WHERE' },
      { id: '01', label: 'Sum by region' }
    ],
    result: [['EU', '4.2 M'], ['US', '6.8 M'], ['APAC', '3.1 M']]
  },

  layers: [
    { cat: 'primitives', text: 'legs & arms' },
    { cat: 'model', text: 'body' },
    { cat: 'language', text: 'voice' }
  ],
  closing: [
    { cat: 'primitives', text: 'Primitives get swapped underneath' },
    { cat: 'model', text: 'The relational heart absorbs models as types' },
    { cat: 'language', text: 'SQL is the language we use to ask' }
  ]
};
