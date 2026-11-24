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
    exhibit: 'Suppliers > Acme > pump\nAssemblies > Tank > pump (copy)\none part, two paths',
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
    question: 'One page changed. Run the whole batch?',
    exhibit: 'batch: rebuild the web index\nonline: update the entry for one URL',
    stuck: 'A batch job can rebuild an index, but a live service needs to read or change one record now.',
    trigger: 'Give each record a key. Spread the keys across machines so a lookup can go straight to its data.'
  },
  {
    from: '17',
    question: 'Which carts contain a pen?',
    exhibit: 'get(cart:8812) → { items: […] }\nfind all carts where items include "pen" → ?',
    stuck: 'A key finds one cart, but the store cannot see fields inside an opaque value.',
    trigger: 'Keep the nested record and let the database query its fields.'
  },
  {
    from: '19',
    question: 'Who are Alice\'s friends\' friends?',
    exhibit: 'Alice: { friends: [Bob, Carol] }\nBob: { friends: [Dave] }\nWho is two hops away?',
    stuck: 'Nesting keeps one profile together. A friendship path crosses many profiles.',
    trigger: 'Make the links themselves first-class: nodes, edges, and a way to walk them.'
  },
  {
    from: '18',
    question: 'The graph query is over. Why keep the machines running?',
    exhibit: 'nightly analysis: 2 hours\nstored relationships: needed all year',
    stuck: 'Choosing a graph model does not solve the cost of idle compute.',
    trigger: 'Keep data in shared storage and rent compute when there is work to do.'
  },
  {
    from: '21',
    question: 'Why fetch addresses to add up prices?',
    exhibit: 'SELECT SUM(price) FROM sales;\nneeded: price · not needed: name, address, …',
    stuck: 'Renting more workers does not reduce the bytes each worker has to fetch.',
    trigger: 'Group values by column inside each Parquet file so a worker can read just prices.'
  },
  {
    from: '16',
    question: 'Which of a million files holds sale 742?',
    exhibit: 'WHERE sale_id = 742\n→ open 1,000,000 footers?',
    stuck: 'Each Parquet footer only describes its own file.',
    trigger: 'Table metadata lists every file\'s ranges: one index for all files.'
  },
  {
    from: '20',
    question: 'Which text means the same as this?',
    exhibit: 'word = \'cat\'     → finds "cat"\nmeaning ≈ \'cat\'  → dog? truck?',
    stuck: 'A snapshot identifies the right records, not the ones closest in meaning.',
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
    question: DB.manifest.milestones.length + ' ideas. How do they fit together?',
    exhibit: 'legs & arms: storage and access\nbody: models around a relational heart\nvoice: SQL',
    stuck: 'No single milestone explains the whole story; each is only one piece or layer.',
    trigger: 'Build the legs and arms first. Then give the models a body and SQL a voice.'
  }
);
