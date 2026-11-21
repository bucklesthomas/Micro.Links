/* Case of the day: one short case per day, rotating; each links to the page on this site that covers it. */
(function () {
  var host = document.getElementById('cotd');
  if (!host) return;
  var CASES = window.CASES_DATA || [];
  if (!CASES.length) return;
  // Shuffle option order per case (stable for a given case) so the answer is not always in the same place
  function order(i) {
    var n = CASES[i][2].length, o = [], t = (i + 1) * 0x9E3779B1 >>> 0;
    function rnd() { t = (t + 0x6D2B79F5) >>> 0; var r = Math.imul(t ^ (t >>> 15), 1 | t); r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }
    for (var k = 0; k < n; k++) o.push(k);
    for (var j = n - 1; j > 0; j--) { var x = Math.floor(rnd() * (j + 1)), y = o[j]; o[j] = o[x]; o[x] = y; }
    return o;
  }
  var DAYMS = 864e5;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function base() { return ((document.querySelector('script[data-base]') || { getAttribute: function () { return ''; } }).getAttribute('data-base') || '').replace(/\/$/, ''); }
  function href(u) { return document.getElementById('view-links') ? '#' + u.replace(/^\/|\/$/g, '') : base() + u; }
  var d = new Date(), dayNo = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAYMS);
  var idx = ((dayNo * 7) % CASES.length + CASES.length) % CASES.length, today = idx, picked = null, open = false;

  function draw() {
    var c = CASES[idx];
    if (!open) {
      host.innerHTML = '<button type="button" class="cotd-closed" data-open><span class="cotd-kicker">Case of the day</span><span class="cotd-line">' + esc(c[0]) + '</span><span class="cotd-go">Try it</span></button>';
      return;
    }
    var h = '<div class="cotd-head"><p class="cotd-kicker">' + (idx === today ? 'Case of the day' : 'Another case') + '</p>' +
      '<button type="button" class="cotd-next" data-next>' + (idx === today ? 'Another case' : 'Next case') + '</button></div>' +
      '<p class="cotd-stem">' + esc(c[0]) + '</p><p class="cotd-q">' + esc(c[1]) + '</p><div class="cotd-opts">' +
      order(idx).map(function (i) {
        var o = c[2][i], cls = picked == null ? '' : i === c[3] ? ' ok' : i === picked ? ' bad' : ' dim';
        return '<button type="button" class="cotd-opt' + cls + '" data-o="' + i + '"' + (picked != null ? ' disabled' : '') + '>' + esc(o) + '</button>';
      }).join('') + '</div>';
    if (picked != null) h += '<div class="cotd-ans ' + (picked === c[3] ? 'ok' : 'bad') + '"><b>' + (picked === c[3] ? 'Correct.' : 'Not quite.') + '</b> ' + esc(c[4]) + ' <a href="' + esc(href(c[5][1])) + '">' + esc(c[5][0]) + ' →</a></div>';
    host.innerHTML = h;
  }
  host.addEventListener('click', function (e) {
    var o = e.target.closest('[data-o]');
    if (e.target.closest('[data-open]')) { open = true; draw(); return; }
    if (o && picked == null) { picked = +o.getAttribute('data-o'); draw(); return; }
    if (e.target.closest('[data-next]')) { var n; do { n = Math.floor(Math.random() * CASES.length); } while (n === idx && CASES.length > 1); idx = n; picked = null; draw(); }
  });
  draw();
})();
