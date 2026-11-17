/* Loader. Reads content/manifest.js, then loads CSS + JS in a fixed order.
   Classic scripts only (no ES modules) so the page also works from file://.
   To add a milestone: add its slug to content/manifest.js and create the files listed in README.md. */
(function () {
  function script(url) {
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = url;
      s.async = false; // keeps execution order
      s.onload = resolve;
      s.onerror = function () { console.warn('[boot] missing', url); resolve(); };
      document.head.appendChild(s);
    });
  }
  function css(url) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = url;
    document.head.appendChild(l);
  }

  script('js/core/ns.js')
    .then(function () { return script('content/manifest.js'); })
    .then(function () {
      var slugs = DB.manifest.milestones;
      var views = DB.manifest.views;

      css('css/menus.css');
      css('css/game-shell.css');
      views.forEach(function (v) { css('css/views/' + v + '.css'); });
      slugs.forEach(function (s) { css('css/games/' + s + '.css'); });

      var files = [
        'content/images.js', 'content/markers.js', 'content/transitions.js', 'content/bigpicture.js'
      ];
      slugs.forEach(function (s) { files.push('content/milestones/' + s + '.js'); });
      files.push('js/core/director.js', 'js/core/menus.js', 'js/core/game-shell.js');
      views.forEach(function (v) { files.push('js/views/' + v + '.js'); });
      slugs.forEach(function (s) { files.push('js/games/' + s + '.js'); });
      files.push('js/main.js');

      // all appended at once; async=false guarantees in-order execution, main.js runs last
      return Promise.all(files.map(script));
    });
})();
