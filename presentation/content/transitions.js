DB.transitions.push(
  {
    from: '01',
    question: '12… of what?',
    exhibit: '| | | | | | | | | | | |',
    stuck: 'A tally holds only a number: no "what", no "whose", no "when".',
    trigger: 'Farms, herds, debts: what if every count came in its own little shape?'
  },
  {
    from: '02',
    question: 'How do you audit a sealed envelope?',
    exhibit: 'envelope = [ ?, ?, ?, ?, ? ]  sealed\naudit = break it open',
    stuck: 'Tokens hide inside the sealed clay, so checking them means destroying them.',
    trigger: 'The marks pressed on the outside already say it all. The tokens are redundant.'
  },
  {
    from: '03',
    question: 'Which tablet holds that barley debt?',
    exhibit: 'room 1: ####################\nroom 2: ####################\nroom 3: ... which one?',
    stuck: 'Tablets are written, not findable: each one is an island in a huge archive.',
    trigger: 'A second list, kept apart from the tablets, could tell you where to look.'
  },
  {
    from: '04',
    question: 'A new scroll arrives. Where does it go?',
    exhibit: 'catalog: A B C D E …  (fixed order)\nnew scroll → squeeze into margin\nby subject? → copy the whole book',
    stuck: 'A bound catalog freezes one order; new entries mean recopying the book.',
    trigger: 'Break the book apart: what if every entry were its own loose piece?'
  },
  {
    from: '05',
    question: 'Count 63 million people by hand?',
    exhibit: '1880 census: ~7–8 years, by hand\n1890 census: 10+ years … obsolete',
    stuck: 'Cards still need human readers; at census scale, counting could outlast the decade.',
    trigger: 'Keep the card, but punch the facts as holes a machine can read.'
  },
  {
    from: '06',
    question: 'Is seat 14C free — right now?',
    exhibit: 'flight 702 · seat 14C → free?\ndeck: feed every card, in order\nanswer: after the whole run',
    stuck: 'Cards and tape are sequential: one answer means running the whole deck through.',
    trigger: 'What if a head could jump straight to any record on a spinning platter?'
  },
  {
    from: '07',
    question: 'Which valve belongs to which engine?',
    exhibit: 'record 7731: fuel valve\nrecord 9020: pump\nrecord 4410: engine J-2  ← parent?',
    stuck: 'A disk reaches any address, but says nothing about how records relate.',
    trigger: 'Apollo\'s parts nest like a tree. What if parents pointed to their children?'
  },
  {
    from: '08',
    question: 'A part with two parents?',
    exhibit: 'Stage 1 > Engine > Fuel valve\nStage 2 > Engine > Fuel valve (copy)\none valve, two parents: not a tree',
    stuck: 'A tree gives every record exactly one parent, so shared parts get copied.',
    trigger: 'Let any record have many owners, and the tree becomes a web.'
  },
  {
    from: '09',
    question: 'Change the layout. Rewrite every program?',
    exhibit: 'FIND NEXT part WITHIN supplies\nFIND OWNER WITHIN supplies\n-- layout changed: program broken',
    stuck: 'Navigation hard-wires programs to storage structure: new layout or question, new code.',
    trigger: 'Forget pointers. Keep plain tables of values and let the system find the path.'
  },
  {
    from: '10',
    question: 'Who will actually type relational algebra?',
    exhibit: 'π name ( σ total>100 ( C ⋈ O ) )\nin plain English, please?',
    stuck: 'The relational model is a theory; business users need a language they can type.',
    trigger: 'Make it read like English: say what you want, not how.'
  },
  {
    from: '11',
    question: 'A satellite image as table rows?',
    exhibit: '(lat, lon, time, value)\n(40, 8, t0, 17.2)\n(40, 9, t0, 17.4)  … per cell',
    stuck: 'Tables suit business records; for grids, every cell repeats coordinates and neighbours vanish.',
    trigger: 'What if the position in a grid simply was the key?'
  },
  {
    from: '12',
    question: 'Why does save() turn one object into four rows?',
    exhibit: 'Customer{ name:"Ada", orders:[…] }\n   ↓ save()\n4 rows: customer, orders, item, item',
    stuck: 'Arrays serve a niche; most developers hold objects, and tables are not objects.',
    trigger: 'Skip the mapping: store the object itself, identity and nesting intact.'
  },
  {
    from: '13',
    question: 'The whole web, on machines that fail?',
    exhibit: 'pages: billions\nmachines: thousands, cheap\nfailures: every day',
    stuck: 'OODBs were about data shape, not volume; a web crawl was never their job.',
    trigger: 'Forget data modelling. Just write two functions and let the cluster do the rest.'
  },
  {
    from: '14',
    question: 'Update one crawled page — right now?',
    exhibit: 'MapReduce = batch job, start to end\npage changed → wait for next run\nwanted: update one row, now',
    stuck: 'MapReduce only runs batch jobs; it cannot update one record in place.',
    trigger: 'A giant sorted table, spread over many machines, that you can update live.'
  },
  {
    from: '15',
    question: 'Column family… or column store?',
    exhibit: 'SELECT SUM(price) FROM sales;\n-- wants 1 column, drags in dozens',
    stuck: '"Column family" is not columnar: rows stay rows, and real analytics needs real columns.',
    trigger: 'Keep the tables and SQL, but store one column at a time.'
  },
  {
    from: '16',
    question: 'Millions of carts, answered instantly?',
    exhibit: 'GET cart:8812   → ?\nSET session:41  → ?\n× millions, all at once',
    stuck: 'Warehouses are loaded in batches and read-only; carts need millions of tiny live writes.',
    trigger: 'Strip the database down to almost nothing: just a key and a value.'
  },
  {
    from: '17',
    question: 'Who are Alice\'s friends\' friends?',
    exhibit: 'get(alice) → friends: [bob, carol]\nget(bob)   → friends: [dave]\nget(carol) → … one more round trip',
    stuck: 'A key-value store sees only opaque blobs: relationships need many trips and client-side joins.',
    trigger: 'Make the links themselves first-class: nodes, edges, and a way to walk them.'
  },
  {
    from: '18',
    question: 'One customer, one record, zero joins?',
    exhibit: '{ name: "Ada", orders: [ … ] }\n← the JSON my app already has',
    stuck: 'Graphs add edges between items, but most apps just want each record, nested, joinless.',
    trigger: 'Add nesting instead of edges: keep the JSON the app already has.'
  },
  {
    from: '19',
    question: 'Whose database do you trust?',
    exhibit: 'NoSQL (2009): rethink the model\nBlockchain (2009): rethink trust',
    stuck: 'Documents say nothing about trust; this link is thematic, not causal: same 2009 mood.',
    trigger: 'Another 2009 rethink: a shared record that no single owner controls.'
  },
  {
    from: '20',
    question: 'Add a node, move all the data?',
    exhibit: 'nodes: always on, always paid for\nresize = reshuffle the data\nnetworks now outpace disks',
    stuck: 'Blockchain is about trust, not operations: shared-nothing clusters stay costly and rigid to run.',
    trigger: 'Networks now beat disks, and storage is cheap. Why keep compute and data together?'
  },
  {
    from: '21',
    question: 'Which text means the same as this?',
    exhibit: 'word = \'cat\'     → finds "cat"\nmeaning ≈ \'cat\'  → dog? truck?',
    stuck: 'Lakehouses serve SQL and DataFrames, but indexes and predicates match values, not meaning.',
    trigger: 'ML turns text and images into long lists of numbers. Nearby numbers, nearby meaning.'
  },
  {
    from: '22',
    question: 'Do vectors really need their own database?',
    exhibit: 'vector = just another column type\nANN    = just another index type\nso… a new database?',
    stuck: 'Vector databases lack what apps still need: metadata filters, transactions, joins, governance.',
    trigger: 'Relational systems just add a type and an index, and the loop repeats.'
  },
  {
    from: '23',
    question: '23 ideas. How do they fit together?',
    exhibit: 'primitives: store & find\nlanguage: ask\nmodel: shape',
    stuck: 'No single milestone explains the whole story; each is only one piece or layer.',
    trigger: 'Sort every piece into its layer, and one database mascot can be assembled.'
  }
);
