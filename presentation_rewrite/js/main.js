/* Entry point: runs after every other file has loaded (see boot.js). */
(function (DB) {
  function start() {
    // keep the manifest order even though files finished loading in order anyway
    var order = DB.manifest.milestones.map(function (s) { return s.slice(0, 2); });
    DB.milestones.sort(function (a, b) { return order.indexOf(a.id) - order.indexOf(b.id); });
    DB.milestones.forEach(function (m) { m.image = (DB.images || {})[m.id] || null; });
    DB.director.init();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})(window.DB);
