import { button as b, table, feedback as f, painter } from './ui.js';

export const earlyGames = {
  tally(root) {
    let count = 0;
    const paint = painter(root);
    function render() {
      paint(`<div class="bone-demo" aria-label="${count} notches">${Array.from({ length: count }, () => '<i></i>').join('')}</div>
        <div class="metric"><strong>${count}</strong><span>marks remembered</span></div>
        <div class="game-actions">${b('carve', '+ Carve a notch', count >= 12 ? 'disabled' : '')}${b('undo', 'Undo', count ? '' : 'disabled')}</div>
        ${f(count === 7 ? 'Seven days, saved outside your brain. But seven of what?' : count > 7 ? 'You counted too far. Undo a notch to record seven days.' : 'Make seven marks. No mental arithmetic required.', count === 7)}`);
    }
    root.onclick = e => {
      const action = e.target.closest('button')?.dataset.action;
      if (action === 'carve') count = Math.min(12, count + 1);
      else if (action === 'undo') count = Math.max(0, count - 1);
      else return;
      render();
    };
    render();
  },
  tokens(root) {
    let grain = 0, sheep = 0, sealed = false, opened = false;
    const paint = painter(root);
    function render() {
      paint(`<div class="token-envelope ${sealed ? 'sealed' : ''}">
        ${sealed ? '<span class="seal">SEALED</span>' : `<span class="token-grain">${'▲ '.repeat(grain)}</span><span class="token-sheep">${'● '.repeat(sheep)}</span>${grain + sheep === 0 ? '<span class="muted">An empty clay envelope</span>' : ''}`}
        </div><div class="token-legend">▲ grain: ${grain} &nbsp; ● sheep: ${sheep} <small>${sealed ? 'Outside impressions' : 'Contents'}</small></div>
        <div class="game-actions">${b('grain', '+ Grain ▲', sealed || grain >= 6 ? 'disabled' : '')}${b('sheep', '+ Sheep ●', sealed || sheep >= 6 ? 'disabled' : '')}${b('seal', 'Seal envelope', sealed || grain + sheep === 0 ? 'disabled' : '')}${sealed ? b('break', 'Break to inspect') : ''}</div>
        ${f(opened ? 'The read destroyed the seal. Could the outside marks be enough?' : sealed ? grain === 3 && sheep === 2 ? 'A typed count: 3 grain + 2 sheep. The outside describes the inside.' : 'The envelope is sealed, but the debt is wrong. Break it or reset to try again.' : 'Different shapes preserve what the number means.', sealed && grain === 3 && sheep === 2)}`);
    }
    root.onclick = e => {
      const action = e.target.closest('button')?.dataset.action;
      if (action === 'grain' && !sealed) grain = Math.min(6, grain + 1);
      else if (action === 'sheep' && !sealed) sheep = Math.min(6, sheep + 1);
      else if (action === 'seal') sealed = true;
      else if (action === 'break') { sealed = false; opened = true; }
      else return;
      render();
    };
    render();
  },
  ledger(root) {
    let filter = 'all';
    const rows = [['Ur-Nin', 'grain', 30], ['Lu-Gal', 'sheep', 12], ['Ama', 'grain', 20], ['En-Ki', 'sheep', 4]];
    const paint = painter(root);
    function render() {
      const selected = rows.filter(r => filter === 'all' || r[1] === filter);
      paint(`<div class="game-actions" aria-label="Filter commodity">${['all', 'grain', 'sheep'].map(item => b(item, item === 'all' ? 'All records' : item, `aria-pressed="${filter === item}"`)).join('')}</div>
        ${table(['Who', 'What', 'Quantity'], selected)}
        <div class="metric"><strong>${filter === 'all' ? '—' : selected.reduce((sum, r) => sum + r[2], 0)}</strong><span>${filter === 'all' ? 'Do not add different units' : filter === 'grain' ? 'grain measures' : 'sheep'}</span></div>
        ${f(filter === 'grain' ? '50 measures of grain. A filter and an aggregate, in clay.' : 'A row records an event. A column gives it structure.', filter === 'grain')}`);
    }
    root.onclick = e => {
      const action = e.target.closest('button')?.dataset.action;
      if (!['all', 'grain', 'sheep'].includes(action)) return;
      filter = action; render();
    };
    render();
  },
  catalog(root) {
    let scanned = 0, indexed = false;
    const titles = ['Odes', 'Histories', 'Elements', 'Republic', 'Poetics', 'Odyssey', 'Iliad', 'Ethics'];
    const paint = painter(root);
    function render() {
      paint(`<div class="shelf">${titles.map((title, i) => `<div class="scroll-spine ${i < scanned || indexed && i === 6 ? 'revealed' : ''}"><span>${i < scanned || indexed && i === 6 ? title : '?'}</span><small>B-${i + 1}</small></div>`).join('')}</div>
        <div class="game-actions">${b('scan', 'Inspect next scroll', scanned >= 7 ? 'disabled' : '')}${b('index', 'Look up in catalog')}</div>
        ${indexed ? '<div class="code-line">Iliad → shelf B-7</div>' : ''}
        <div class="comparison"><span><strong>${scanned}</strong> scrolls opened</span><span><strong>${indexed ? '1' : '0'}</strong> catalog entry consulted</span></div>
        ${f(indexed ? 'A separate entry points to the work. Building and maintaining the catalog is extra work.' : scanned >= 7 ? 'Found it after opening seven scrolls. Try the catalog.' : 'The scroll you need is somewhere on this shelf.', indexed)}`);
    }
    root.onclick = e => {
      const action = e.target.closest('button')?.dataset.action;
      if (action === 'scan') scanned = Math.min(7, scanned + 1);
      else if (action === 'index') indexed = true;
      else return;
      render();
    };
    render();
  },
  cards(root) {
    let added = false, sort = 'author';
    const paint = painter(root);
    function render() {
      const records = [{ author: 'Homer', title: 'Iliad', shelf: 'B-7' }, { author: 'Plato', title: 'Republic', shelf: 'B-4' }, ...(added ? [{ author: 'Euclid', title: 'Elements', shelf: 'C-2' }] : [])];
      records.sort((a, c) => a[sort].localeCompare(c[sort]));
      paint(`<div class="game-actions">${b('insert', '+ Insert Euclid', added ? 'disabled' : '')}${b('author', 'By author', `aria-pressed="${sort === 'author'}"`)}${b('title', 'By title', `aria-pressed="${sort === 'title'}"`)}</div>
        <div class="index-cards">${records.map(r => `<div class="index-card"><small>${r.author}</small><strong>${r.title}</strong><span>Shelf ${r.shelf}</span></div>`).join('')}</div>
        ${f(added ? 'Euclid slots into the order. Re-sort the cards; none of the books move.' : 'The catalog can grow one entry at a time.', added)}`);
    }
    root.onclick = e => {
      const action = e.target.closest('button')?.dataset.action;
      if (action === 'insert') added = true;
      else if (action === 'author' || action === 'title') sort = action;
      else return;
      render();
    };
    render();
  },
  punch(root) {
    const digits = [null, null, null];
    const paint = painter(root);
    function render() {
      const won = digits.join('') === '427';
      paint(`<div class="punch-demo">${digits.map((digit, col) => `<div class="punch-column"><small>COL ${col + 1}</small>${Array.from({ length: 10 }, (_, n) => b(`${col}-${n}`, `${n}`, `aria-label="Column ${col + 1}, digit ${n}" aria-pressed="${digit === n}" class="punch-hole"`)).join('')}</div>`).join('')}</div>
        <div class="code-line">Machine reads: <strong>${digits.map(d => d ?? '_').join(' · ')}</strong></div>
        ${f(won ? '4–2–7. The hole position is the value; the column is the field.' : 'Click one position in each column. The reader sees positions, not ink.', won)}`);
    }
    root.onclick = e => {
      const action = e.target.closest('button')?.dataset.action;
      if (!action) return;
      const [col, digit] = action.split('-').map(Number);
      digits[col] = digit; render();
    };
    render();
  },
  disk(root) {
    let tape = 0, seek = false;
    const paint = painter(root);
    function render() {
      paint(`<p class="mini-label">TAPE · SEQUENTIAL</p><div class="record-strip">${Array.from({ length: 10 }, (_, i) => `<span class="${i < tape ? 'read' : ''} ${i === 8 ? 'target-record' : ''}">${i + 1}</span>`).join('')}</div>
        <p class="mini-label">DISK · DIRECT</p><div class="disk-demo ${seek ? 'found' : ''}"><span>9</span><i></i></div>
        <div class="game-actions">${b('tape', 'Read next on tape', tape >= 9 ? 'disabled' : '')}${b('seek', 'Seek record 9')}</div>
        <div class="comparison"><span><strong>${tape}</strong> tape visits</span><span><strong>${seek ? 1 : 0}</strong> disk seek</span></div>
        ${f(seek ? 'Direct access needs an address. An index can translate a key into that address.' : 'Tape has to pass every earlier record.', seek)}`);
    }
    root.onclick = e => {
      const action = e.target.closest('button')?.dataset.action;
      if (action === 'tape') tape = Math.min(9, tape + 1);
      else if (action === 'seek') seek = true;
      else return;
      render();
    };
    render();
  },
  tree(root) {
    const children = { Rocket: ['Stage 1', 'Stage 2'], 'Stage 1': ['F-1', 'Tank'], 'Stage 2': ['J-2'], 'F-1': ['Fuel valve (F-1)', 'Pump'], 'J-2': ['Fuel valve', 'Pump'], Tank: [], Pump: [], 'Fuel valve': [], 'Fuel valve (F-1)': [] };
    let path = ['Rocket'];
    const paint = painter(root);
    function render() {
      const current = path.at(-1), won = current === 'Fuel valve';
      paint(`<div class="path-trail">${path.map(p => `<span>${p}</span>`).join('<i>↓</i>')}</div>
        <div class="game-actions">${children[current].map(name => b(name, `↓ ${name}`)).join('')}${path.length > 1 ? b('back', '↑ Parent') : ''}</div>
        ${f(won ? 'Found it by a known path. Another engine needs another branch.' : !children[current].length ? 'A different leaf. Go back to its parent.' : 'You can only follow links from the current record.', won)}`);
    }
    root.onclick = e => {
      const action = e.target.closest('button')?.dataset.action;
      if (action === 'back') path.pop();
      else if (children[path.at(-1)].includes(action)) path.push(action);
      else return;
      render();
    };
    render();
  },
  network(root) {
    let current = 'Supplier A', visited = ['Supplier A'];
    const links = { 'Supplier A': ['Valve', 'Pump'], Valve: ['Supplier A', 'Supplier B'], Pump: ['Supplier A'], 'Supplier B': ['Valve'] };
    const paint = painter(root);
    function render() {
      const won = current === 'Supplier B';
      paint(`<div class="network-demo"><span class="${current === 'Supplier A' ? 'active' : ''}">Supplier A</span><span>↘ &nbsp; ↙</span><span class="${current === 'Supplier B' ? 'active' : ''}">Supplier B</span><span class="${current === 'Valve' ? 'active' : ''}">Valve · shared</span><span>↔</span><span class="${current === 'Pump' ? 'active' : ''}">Pump</span></div>
        <p class="mini-label">CURRENT RECORD: ${current}</p><div class="game-actions">${links[current].map(name => b(name, `Follow → ${name}`)).join('')}</div>
        <div class="code-line">FIND ${visited.join(' → ')}</div>
        ${f(won ? 'One valve, two suppliers. You wrote the route yourself.' : 'Networks share records. Navigation is still the program’s job.', won)}`);
    }
    root.onclick = e => {
      const action = e.target.closest('button')?.dataset.action;
      if (!links[current].includes(action)) return;
      current = action; visited.push(action); render();
    };
    render();
  },
  join(root) {
    let customer = 1, reversed = false;
    const paint = painter(root);
    function render() {
      let orders = [[101, 1, 'Pen'], [102, 2, 'Lamp'], [103, 1, 'Book']];
      if (reversed) orders = orders.toReversed();
      const found = orders.filter(r => r[1] === customer).sort((a, c) => a[0] - c[0]);
      paint(`<div class="game-actions">${b('ada', '1 · Ada', `aria-pressed="${customer === 1}"`)}${b('bob', '2 · Bob', `aria-pressed="${customer === 2}"`)}${b('reorder', '⇄ Rearrange storage')}</div>
        ${table(['Order id', 'Customer key', 'Item'], orders.map(r => r.map((v, i) => r[1] === customer ? `<mark>${v}</mark>` : v)))}
        <div class="code-line">JOIN ON customer.id = orders.customer_id</div>
        <div class="result-chips">${found.map(r => `<span>${customer === 1 ? 'Ada' : 'Bob'} → ${r[2]}</span>`).join('')}</div>
        ${f(reversed ? 'The physical order changed. The keys — and the answer — did not.' : 'Matching values connects the tables. No memory address required.', reversed)}`);
    }
    root.onclick = e => {
      const action = e.target.closest('button')?.dataset.action;
      if (action === 'ada') customer = 1;
      else if (action === 'bob') customer = 2;
      else if (action === 'reorder') reversed = !reversed;
      else return;
      render();
    };
    render();
  },
  sql(root) {
    let city = 'Paris', indexed = false;
    const rows = [['Ada', 'Paris'], ['Bob', 'Rome'], ['Cy', 'Paris'], ['Dee', 'Oslo'], ['Eli', 'Rome'], ['Flo', 'Oslo']];
    const paint = painter(root);
    function render() {
      const matches = rows.filter(r => r[1] === city);
      paint(`<div class="game-actions">${['Paris', 'Rome', 'Oslo'].map(c => b(c, c, `aria-pressed="${city === c}"`)).join('')}${b('index', indexed ? '− Remove index' : '+ Add city index', `aria-pressed="${indexed}"`)}</div>
        <pre class="query-code">SELECT name FROM customer\nWHERE city = '${city}';</pre>
        <div class="plan"><small>CHOSEN PLAN</small><strong>${indexed ? 'Index lookup → matching rows' : 'Sequential scan → filter'}</strong><span>${indexed ? matches.length : rows.length} row visits ${indexed ? '+ index lookup work' : ''}</span></div>
        <div class="result-chips">${matches.map(r => `<span>${r[0]}</span>`).join('')}</div>
        ${f(indexed ? 'Same SQL. Same result. The engine found a different way.' : 'The query never names an access path. Add an index to change the plan.', indexed)}`);
    }
    root.onclick = e => {
      const action = e.target.closest('button')?.dataset.action;
      if (action === 'index') indexed = !indexed;
      else if (['Paris', 'Rome', 'Oslo'].includes(action)) city = action;
      else return;
      render();
    };
    render();
  },
  array(root) {
    let time = 0, selected = -1;
    const value = (i, t) => (i * 13 + t * 17) % 37 + 10;
    const paint = painter(root);
    function render() {
      const values = Array.from({ length: 36 }, (_, i) => value(i, time));
      const won = selected >= 0 && values[selected] === Math.max(...values);
      paint(`<label class="range-label" for="array-time">Time slice <output>t = ${time}</output></label><input id="array-time" type="range" min="0" max="2" value="${time}">
        <div class="heatmap">${values.map((v, i) => b(`cell-${i}`, v, `style="--heat:${(v - 10) / 36}" aria-label="Cell ${Math.floor(i / 6)}, ${i % 6}: ${v} degrees" aria-pressed="${selected === i}"`)).join('')}</div>
        <div class="code-line">${selected < 0 ? 'A[row, column, time] → temperature' : `A[${Math.floor(selected / 6)}, ${selected % 6}, ${time}] = ${values[selected]} °C`}</div>
        ${f(won ? 'Hot spot found. Position identifies the value — no repeated coordinates needed.' : selected < 0 ? 'Click the hottest cell, then try another time slice.' : 'A valid cell, but a hotter one is hiding in this slice.', won)}`);
    }
    root.oninput = e => { if (e.target.id === 'array-time') { time = Number(e.target.value); selected = -1; render(); } };
    root.onclick = e => {
      const action = e.target.closest('button')?.dataset.action;
      if (!action?.startsWith('cell-')) return;
      selected = Number(action.slice(5)); render();
    };
    render();
  },
  objects(root) {
    let saved = false;
    const paint = painter(root);
    function render() {
      paint(`<pre class="query-code">${saved ? 'customer(1, "Ada")\norders(101, customer_id=1)\nitems(101, "Pen")\nitems(101, "Lamp")' : 'Customer {\n  id: 1, name: "Ada",\n  orders: [{ id: 101,\n    items: ["Pen", "Lamp"] }]\n}'}</pre>
        <div class="game-actions">${b('toggle', saved ? 'load() → rebuild object' : 'save() → map to rows')}</div>
        <div class="comparison"><span><strong>1</strong> object graph</span><span>⇄</span><span><strong>4</strong> relational rows</span></div>
        ${f(saved ? 'The mapping layer unpacks identity and nesting. An ORM can do this work, but the mismatch remains.' : 'Keeping the object intact is attractive. Different apps may need different shapes.', saved)}`);
    }
    root.onclick = e => { if (e.target.closest('button')?.dataset.action === 'toggle') { saved = !saved; render(); } };
    render();
  },
};
