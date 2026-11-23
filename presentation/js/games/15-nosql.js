(function (DB) {
  var h = DB.h;

  DB.addGame('15', {
    hint: 'Spread the writes over more shards. Then try a search and a reservation.',
    mount: function (root, api) {
      var operation = 'save', count = 1, seen = new Set();
      var operations = { save: 'Save 12 carts', search: 'Find carts with tea', reserve: 'Reserve the last tea' };
      var choices = h('div', { class: 'requests', role: 'group', 'aria-label': 'Workload' });
      var buttons = Object.keys(operations).map(function (key) {
        var button = h('button', { class: 'g-btn', on: { click: function () { operation = key; render(); } } }, operations[key]);
        choices.append(button);
        return button;
      });
      var shardCount = h('select', { 'aria-label': 'Number of shards', on: { change: function () { count = Number(shardCount.value); render(); } } });
      [1, 2, 3, 4].forEach(function (size) { shardCount.append(h('option', { value: size }, String(size))); });
      var request = h('code', { class: 'request' }), lanes = h('div', { class: 'lanes' });
      var message = h('div', { class: 'g-msg', role: 'status' });
      root.append(choices, h('div', { class: 'g-row g-wrap' }, h('label', { class: 'g-row' }, 'Shards', shardCount), request), lanes, message);

      function render() {
        buttons.forEach(function (button) {
          var selected = button.textContent === operations[operation];
          button.className = 'g-btn ' + (selected ? 'on' : 'alt');
          button.setAttribute('aria-pressed', String(selected));
        });
        lanes.replaceChildren();
        var queues = Array.from({ length: count }, function (_, index) {
          var queue = h('div', { class: 'queue' });
          lanes.append(h('div', { class: 'lane' }, h('b', {}, 'Shard ' + (index + 1)), queue));
          return queue;
        });
        if (operation === 'reserve') {
          request.textContent = 'put(cart:01, ...); put(stock:tea, 0)';
          queues[0].append(h('span', { class: 'saved' }, 'Cart saved'));
          queues[1 % count].append(h('span', { class: 'failed' }, 'Stock write failed'));
          message.textContent = 'The stock write failed. The saved cart still claims the last tea: two independent puts are not one all-or-nothing transaction.';
          seen.add('reserve');
        } else {
          var search = operation === 'search';
          request.textContent = search ? 'get(id) for each known cart' : 'put(id, cart)';
          for (var index = 0; index < 12; index++) {
            var hasTea = search && [1, 4, 10].includes(index);
            queues[index % count].append(h('span', { class: hasTea ? 'match' : '', title: 'Cart ' + (index + 1) + (hasTea ? ': tea' : '') }, String(index + 1).padStart(2, '0')));
          }
          if (search) {
            message.textContent = 'Three carts contain tea. With no WHERE clause or SQL optimizer, the app had to fetch all 12 known carts or build its own index.';
            seen.add('search');
          } else {
            message.textContent = 'One write per shard per round. All 12 carts saved in ' + Math.ceil(12 / count) + ' rounds; no cart waits for another shard to commit.';
            if (count > 1) seen.add('scale');
          }
        }
        if (seen.size === 3) api.done(true);
      }
      render();
      return { destroy: function () {} };
    }
  });
})(window.DB);