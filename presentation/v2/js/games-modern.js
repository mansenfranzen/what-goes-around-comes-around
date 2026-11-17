import { button as b, table, feedback as f, painter } from './ui.js';

export const modernGames = {
  mapreduce(root) {
    let stage = 0, failed = false;
    const paint = painter(root);
    function render() {
      const labels = ['Input', 'Map', 'Shuffle', 'Reduce'];
      const displays = [
        '<div class="word-tile">to be to</div>',
        '<div class="word-tile">(to, 1)</div><div class="word-tile">(be, 1)</div><div class="word-tile">(to, 1)</div>',
        '<div class="word-tile">to: [1, 1]</div><div class="word-tile">be: [1]</div>',
        '<div class="word-tile">to → <strong>2</strong></div><div class="word-tile">be → <strong>1</strong></div>',
      ];
      paint(`<div class="stepper">${labels.map((l, i) => `<span class="${i <= stage ? 'done' : ''}">${i + 1} ${l}</span>`).join('')}</div>
        <div class="word-tiles">${displays[stage]}</div>
        <div class="game-actions">${b('next', stage === 3 ? 'Count complete' : `Run ${labels[stage + 1].toLowerCase()} →`, stage === 3 ? 'disabled' : '')}${stage === 1 ? b('fail', 'Simulate worker failure', failed ? 'disabled' : '') : ''}</div>
        ${stage === 3 ? '<pre class="query-code">SELECT word, COUNT(*)\nFROM words GROUP BY word;</pre>' : ''}
        ${f(failed && stage === 1 ? 'One map task failed and was retried from its input. No output counted twice.' : stage === 3 ? 'The same transformation can be declared in SQL. Distribution stays in the engine.' : 'The framework partitions the work; your code defines the transformation.', stage === 3)}`);
    }
    root.onclick = e => {
      const action = e.target.closest('button')?.dataset.action;
      if (action === 'next') stage = Math.min(3, stage + 1);
      else if (action === 'fail') failed = true;
      else return;
      render();
    };
    render();
  },
  sparse(root) {
    let sparse = false;
    const paint = painter(root);
    function render() {
      paint(`<div class="game-actions">${b('toggle', sparse ? 'Show rectangular view' : 'Show sparse families')}</div>
        ${sparse ? '<div class="family-row"><strong>user:1</strong><code>profile:name = Ada</code><code>contact:email = ada@demo</code></div><div class="family-row"><strong>user:2</strong><code>profile:name = Bob</code><code>social:handle = @bob</code></div>' : table(['Key', 'Name', 'Email', 'Handle'], [['user:1', 'Ada', 'ada@demo', '<span class="null">NULL</span>'], ['user:2', 'Bob', '<span class="null">NULL</span>', '@bob']])}
        <div class="metric"><strong>${sparse ? '4' : '6'}</strong><span>${sparse ? 'present attributes, grouped by family' : 'attribute positions, including 2 absent values'}</span></div>
        ${f(sparse ? 'Each row can have different fields. This is sparse modeling, not a columnar scan engine.' : 'A rectangular view makes the missing fields visible.', sparse)}`);
    }
    root.onclick = e => { if (e.target.closest('button')?.dataset.action === 'toggle') { sparse = !sparse; render(); } };
    render();
  },
  columns(root) {
    let mode = 'row', ran = false;
    const records = [[1, 'Pen', 'Paris', 2, 4], [2, 'Book', 'Rome', 12, 1], [3, 'Lamp', 'Oslo', 30, 2], [4, 'Pen', 'Rome', 2, 3], [5, 'Book', 'Paris', 12, 1], [6, 'Lamp', 'Oslo', 30, 1]];
    const paint = painter(root);
    function render() {
      paint(`<div class="game-actions">${b('row', 'Row store', `aria-pressed="${mode === 'row'}"`)}${b('column', 'Column store', `aria-pressed="${mode === 'column'}"`)}</div>
        <div class="storage-grid ${mode}">${(mode === 'row' ? records.flat() : records[0].flatMap((_, col) => records.map(r => r[col]))).map((value, i) => `<span class="${ran && (mode === 'row' || i >= 18 && i < 24) ? 'touched' : ''}">${value}</span>`).join('')}</div>
        <div class="game-actions">${b('run', 'Run SUM(price)')}</div>
        <div class="comparison"><span><strong>${ran ? mode === 'row' ? 30 : 6 : '—'}</strong> values read</span><span><strong>${ran ? 88 : '—'}</strong> sum of prices</span></div>
        ${f(ran ? mode === 'column' ? '6 values instead of 30. The answer and SQL are unchanged.' : 'All 5 fields travel with each row. Switch layout and run again.' : 'Highlight the logical values read by the query.', ran && mode === 'column')}`);
    }
    root.onclick = e => {
      const action = e.target.closest('button')?.dataset.action;
      if (action === 'row' || action === 'column') { mode = action; ran = false; }
      else if (action === 'run') ran = true;
      else return;
      render();
    };
    render();
  },
  kv(root) {
    let operation = '';
    const coats = [['K1', 'blue'], ['K2', 'red'], ['K3', 'green'], ['K4', 'red']];
    const paint = painter(root);
    function render() {
      paint(`<div class="coat-check">${coats.map(([key, color]) => `<div class="${operation === 'scan' || operation === 'key' && key === 'K2' ? 'inspected' : ''}"><span class="coat ${color}" aria-hidden="true">♟</span><strong>${key}</strong><small>${operation === 'scan' || operation === 'key' && key === 'K2' ? color : 'opaque value'}</small></div>`).join('')}</div>
        <div class="game-actions">${b('key', 'get("K2")')}${b('scan', 'Find all red coats')}</div>
        <div class="metric"><strong>${operation === 'key' ? 1 : operation === 'scan' ? 4 : '—'}</strong><span>values fetched</span></div>
        ${f(operation === 'scan' ? 'K2 and K4 are red. The application fetched and examined every blob.' : operation === 'key' ? 'The ticket finds one coat directly. Its contents are the application’s concern.' : 'Keys are visible. Values are opaque to this toy store.', operation !== '')}`);
    }
    root.onclick = e => {
      const action = e.target.closest('button')?.dataset.action;
      if (!['key', 'scan'].includes(action)) return;
      operation = action; render();
    };
    render();
  },
  graph(root) {
    let hops = 1;
    const paint = painter(root);
    function render() {
      paint(`<div class="friend-chain">${['Ada', 'Bob', 'Cy', 'Dee'].map((name, i) => `<span class="${i <= hops ? 'reached' : ''}">${name}<small>${i === 0 ? 'start' : i + ' hop' + (i > 1 ? 's' : '')}</small></span>${i < 3 ? '<i>→</i>' : ''}`).join('')}</div>
        <label class="range-label" for="graph-hops">Traversal depth <output>${hops} hop${hops > 1 ? 's' : ''}</output></label><input id="graph-hops" type="range" min="1" max="3" value="${hops}">
        <pre class="query-code">MATCH (Ada)-[:FRIEND*1..${hops}]-&gt;(person)</pre>
        <div class="code-line">${hops} edge-table join${hops > 1 ? 's' : ''} for a fixed ${hops}-edge path from a person table</div>
        ${f(hops === 3 ? 'Dee is three links away. A pattern describes the path; tables can represent the same edges.' : 'The data is a chain here. Real graphs branch, cycle and share nodes.', hops === 3)}`);
    }
    root.oninput = e => { if (e.target.id === 'graph-hops') { hops = Number(e.target.value); render(); } };
    render();
  },
  documents(root) {
    let normalized = false, copies = [2, 2, 2], price = 2, writes = 0;
    const paint = painter(root);
    function render() {
      const values = normalized ? [price, price, price] : copies;
      const won = values.every(v => v === 3);
      paint(`<div class="game-actions">${b('embedded', 'Embedded copies', `aria-pressed="${!normalized}"`)}${b('normalized', 'Shared product row', `aria-pressed="${normalized}"`)}</div>
        <div class="wishlist-grid">${values.map((v, i) => `<div><small>${['Ada', 'Bob', 'Cy'][i]}’s list</small><strong>Pen · €${v}</strong>${normalized ? '<code>product_id: 1</code>' : b(`update-${i}`, v === 3 ? 'Updated' : 'Update copy', v === 3 ? 'disabled' : '')}</div>`).join('')}</div>
        ${normalized ? `<div class="shared-product">product(1, "Pen", €${price}) ${b('product', 'Update product', price === 3 ? 'disabled' : '')}</div>` : ''}
        <div class="metric"><strong>${writes}</strong><span>writes · ${values.filter(v => v === 2).length} old price${values.filter(v => v === 2).length === 1 ? '' : 's'} remaining</span></div>
        ${f(won ? normalized ? 'One source of truth. Three lists see the new catalog price via a join.' : 'Three copies took three writes. Miss one and the lists disagree.' : 'Update the current catalog price, not a historical purchase price.', won)}`);
    }
    root.onclick = e => {
      const action = e.target.closest('button')?.dataset.action;
      if (action === 'normalized' || action === 'embedded') { normalized = action === 'normalized'; copies = [2, 2, 2]; price = 2; writes = 0; }
      else if (action === 'product' && price !== 3) { price = 3; writes++; }
      else if (action?.startsWith('update-')) { const i = Number(action.slice(7)); if (copies[i] !== 3) { copies[i] = 3; writes++; } }
      else return;
      render();
    };
    render();
  },
  chain(root) {
    let changed = false;
    const paint = painter(root);
    function render() {
      paint(`<div class="block-chain"><div><small>BLOCK 1</small><strong>Ada → Bob: ${changed ? 90 : 10}</strong><code>fingerprint: ${changed ? 'B290' : 'A110'}</code></div><span class="${changed ? 'broken-link' : ''}">${changed ? '≠' : '='}</span><div class="${changed ? 'invalid-block' : ''}"><small>BLOCK 2</small><strong>Bob → Cy: 5</strong><code>previous: A110</code></div></div>
        <div class="game-actions">${b('tamper', changed ? 'Restore block 1' : 'Change 10 → 90 in block 1')}</div>
        ${f(changed ? 'The fingerprint no longer matches the next block. Tampering is detectable — agreement on the accepted chain still needs consensus.' : 'Each block remembers a fingerprint of its predecessor.', changed)}
        <p class="simulation-note">Illustrative fingerprints, not cryptographic hashes. No mining or consensus is simulated.</p>`);
    }
    root.onclick = e => { if (e.target.closest('button')?.dataset.action === 'tamper') { changed = !changed; render(); } };
    render();
  },
  cloud(root) {
    let workers = 1;
    const paint = painter(root);
    function render() {
      paint(`<div class="compute-workers">${Array.from({ length: workers }, (_, i) => `<span><i aria-hidden="true">▥</i>Worker ${i + 1}</span>`).join('')}</div>
        <div class="connector-lines" aria-hidden="true">↓ &nbsp; ↓ &nbsp; ↓</div><div class="object-store"><strong>SHARED OBJECT STORAGE</strong><span>sales.parquet · 120 GB · unchanged</span></div>
        <label class="range-label" for="cloud-workers">Compute workers <output>${workers}</output></label><input id="cloud-workers" type="range" min="1" max="6" value="${workers}">
        <div class="comparison"><span><strong>${(12 / workers).toFixed(1)} s</strong> idealized query time</span><span><strong>0 GB</strong> reshuffled on resize</span></div>
        ${f(workers > 1 ? 'More compute, same files. In reality, coordination and bandwidth limit speedup.' : 'Compute and storage can scale independently.', workers > 1)}`);
    }
    root.oninput = e => { if (e.target.id === 'cloud-workers') { workers = Number(e.target.value); render(); } };
    render();
  },
  vectors(root) {
    let x = 28, y = 33;
    const points = [{ name: 'cat', x: 20, y: 25 }, { name: 'dog', x: 36, y: 32 }, { name: 'kitten', x: 24, y: 45 }, { name: 'truck', x: 76, y: 70 }, { name: 'car', x: 87, y: 52 }, { name: 'bus', x: 67, y: 80 }];
    const paint = painter(root);
    function render() {
      const nearest = [...points].sort((a, c) => Math.hypot(a.x - x, a.y - y) - Math.hypot(c.x - x, c.y - y)).slice(0, 3);
      paint(`<div class="vector-map" aria-label="Invented two-dimensional embedding. Use the sliders below for keyboard control.">${points.map(p => `<span class="vector-point ${nearest.includes(p) ? 'near' : ''}" style="left:${p.x}%;top:${p.y}%">${p.name}</span>`).join('')}<span class="query-point" style="left:${x}%;top:${y}%">＋<small>query</small></span></div>
        <div class="vector-sliders"><label for="vector-x">X <input id="vector-x" type="range" min="0" max="100" value="${x}"></label><label for="vector-y">Y <input id="vector-y" type="range" min="0" max="100" value="${y}"></label></div>
        <div class="result-chips">${nearest.map(p => `<span>${p.name} <small>${Math.hypot(p.x - x, p.y - y).toFixed(1)}</small></span>`).join('')}</div>
        ${f('Three nearest by exact distance. A real ANN index avoids checking every vector; it may miss a neighbor.', true)}`);
    }
    root.oninput = e => {
      if (e.target.id === 'vector-x') x = Number(e.target.value);
      else if (e.target.id === 'vector-y') y = Number(e.target.value);
      else return;
      render();
    };
    root.onclick = e => {
      const map = e.target.closest('.vector-map');
      if (!map) return;
      const rect = map.getBoundingClientRect();
      x = Math.round(Math.max(0, Math.min(100, (e.clientX - rect.left) / rect.width * 100)));
      y = Math.round(Math.max(0, Math.min(100, (e.clientY - rect.top) / rect.height * 100)));
      render();
    };
    render();
  },
  absorption(root) {
    const ideas = [
      { name: 'JSON documents', layer: 'model', explanation: 'A JSON type and operators bring nested data into a relational system (SQL:2016).' },
      { name: 'Columnar layout', layer: 'primitives', explanation: 'Change physical layout underneath SQL. The relational model stays.' },
      { name: 'Graph patterns', layer: 'language', explanation: 'SQL/PGQ adds property-graph pattern queries (SQL:2023). Graphs also have a model dimension.' },
      { name: 'Vector index', layer: 'primitives', explanation: 'A specialized access structure can be added alongside other indexes. The vector type is a separate model extension.' },
    ];
    let selected = 0, placed = new Set(), message = 'Select an idea, then place it in a layer.', correct = false;
    const paint = painter(root);
    function render() {
      paint(`<div class="idea-tray">${ideas.map((idea, i) => b(`idea-${i}`, `${placed.has(i) ? '✓ ' : ''}${idea.name}`, `aria-pressed="${selected === i}" ${placed.has(i) ? 'disabled' : ''}`)).join('')}</div>
        <div class="layer-targets">${[['language', 'Language', 'How we ask'], ['model', 'Model', 'How we shape'], ['primitives', 'Primitives', 'How we store']].map(([key, name, desc]) => b(`layer-${key}`, `<strong>${name}</strong><small>${desc}</small>`, `class="layer-${key}" ${placed.size === ideas.length ? 'disabled' : ''}`)).join('')}</div>
        <div class="metric"><strong>${placed.size} / 4</strong><span>ideas integrated</span></div>${f(message, correct)}`);
    }
    root.onclick = e => {
      const action = e.target.closest('button')?.dataset.action;
      if (action?.startsWith('idea-')) { selected = Number(action.slice(5)); message = `Where would you integrate ${ideas[selected].name.toLowerCase()}?`; correct = false; }
      else if (action?.startsWith('layer-') && selected >= 0) {
        correct = action.slice(6) === ideas[selected].layer;
        if (correct) {
          placed.add(selected);
          message = placed.size === ideas.length ? 'All four integrated. Types, languages and engines can evolve around a stable relational core.' : ideas[selected].explanation;
          selected = ideas.findIndex((_, i) => !placed.has(i));
        } else message = 'Ideas can span layers. Place this particular feature by its main role: a type, query syntax, or physical access structure.';
      } else return;
      render();
    };
    render();
  },
};
