/* Big Picture content: where each milestone symbol sits on the mascot "Rowie" (SVG viewBox 0 0 1000 1020),
   a one-line role per piece, and the query-run animation. Edit here to move pieces or change wording;
   the silhouette itself (head, torso, arms, base) is drawn in js/views/bigpicture.js. */
DB.bigpicture = {
  // x, y = centre in viewBox units, r = badge radius, role = what the piece does inside a modern database
  pieces: {
    '01': { x: 150, y: 590, r: 44, role: 'COUNT: the first aggregate' },
    '02': { x: 207, y: 462, r: 44, role: 'Typed values: what is counted' },
    '03': { x: 850, y: 590, r: 44, role: 'Tables with rows and a schema' },
    '04': { x: 500, y: 692, r: 44, role: 'The catalog: data about the data' },
    '05': { x: 380, y: 692, r: 44, role: 'Indexes and INSERT, kept sorted' },
    '06': { x: 420, y: 188, r: 44, role: 'WHERE: filter by column' },
    '07': { x: 500, y: 846, r: 44, role: 'Random access to storage' },
    '08': { x: 292, y: 232, r: 38, role: 'Tree-shaped data, parent to child' },
    '09': { x: 708, y: 232, r: 38, role: 'Links between records, i.e. joins' },
    '10': { x: 500, y: 446, r: 62, role: 'The model: relations, keys, algebra' },
    '11': { x: 500, y: 272, r: 38, role: 'Ask WHAT you want, not HOW' },
    '12': { x: 380, y: 574, r: 44, role: 'ARRAY columns inside tables' },
    '13': { x: 380, y: 446, r: 44, role: 'User-defined types and objects' },
    '14': { x: 793, y: 462, r: 44, role: 'GROUP BY across many machines' },
    '15': { x: 500, y: 574, r: 44, role: 'Partition by key to spread the load' },
    '16': { x: 620, y: 574, r: 44, role: 'Read only the columns you need' },
    '17': { x: 620, y: 692, r: 44, role: 'Blazing-fast get/put by key' },
    '18': { x: 500, y: 60, r: 44, role: 'Paths over relations (SQL/PGQ)' },
    '19': { x: 620, y: 446, r: 44, role: 'JSON columns for flexible shapes' },
    '21': { x: 500, y: 958, r: 50, role: 'Elastic, serverless storage and compute' },
    '22': { x: 580, y: 188, r: 44, role: 'Nearest-neighbour vector index' },
    '23': { x: 905, y: 112, r: 52, role: 'Swap the guts, keep the SQL interface' }
  },

  // Query run (last step): each stage lights up the piece that does that job.
  query: {
    sql: ['SELECT region, SUM(amt)', 'FROM sales', 'WHERE year = 2024', 'GROUP BY region;'],
    stages: [
      { id: '11', label: 'Declarative question' },
      { id: '10', label: 'Plan over relations' },
      { id: '04', label: 'Look up the catalog' },
      { id: '05', label: 'Use the index' },
      { id: '16', label: 'Read only 2 columns' },
      { id: '06', label: 'Filter: WHERE' },
      { id: '14', label: 'Group in parallel' },
      { id: '01', label: 'Count and sum' },
      { id: '21', label: 'Elastic compute' },
      { id: '07', label: 'Random-access disk' }
    ],
    result: [['EU', '4.2 M'], ['US', '6.8 M'], ['APAC', '3.1 M']]
  },

  layers: [
    { cat: 'primitives', text: 'store & find' },
    { cat: 'language', text: 'ask' },
    { cat: 'model', text: 'shape' }
  ],
  closing: [
    { cat: 'primitives', text: 'Primitives get swapped underneath' },
    { cat: 'language', text: 'Languages get rebuilt as SQL' },
    { cat: 'model', text: 'Models get absorbed as types' }
  ]
};
