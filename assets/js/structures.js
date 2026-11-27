/* Antibiotic structures: pre-drawn 2D structures (structures-data.js) with switchable highlights */
(function () {
  function init() {
    var host = document.getElementById('st');
    if (!host || host.getAttribute('data-ready')) return;
    var D = window.STRUCT_DATA;
    if (!D) { setTimeout(init, 50); return; }
    host.setAttribute('data-ready', '1');
    var root = host.closest('.st-wrap') || document;
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    if (!document.getElementById('st-css')) { var css = document.createElement('style'); css.id = 'st-css'; css.textContent = D.css; document.head.appendChild(css); }
    var st = { g: 'all', hl: 'core' };
    var GN = {}; D.groups.forEach(function (g) { GN[g[0]] = g[1]; });

    root.querySelector('#st-scaf').innerHTML = D.scaf.map(function (s) {
      return '<figure class="card st-sc"><div class="st-svg show-core">' + s.svg + '</div><figcaption><b>' + esc(s.n) + '</b><span>' + esc(s.sub) + '</span></figcaption></figure>';
    }).join('');
    root.querySelector('#st-pairs').innerHTML = '<table class="ab-tbl"><thead><tr><th>Drug</th><th>Shares R1 with</th><th>Relationship</th></tr></thead><tbody>' +
      D.pairs.map(function (p) { return '<tr><td>' + esc(p[0]) + '</td><td>' + esc(p[1]) + '</td><td>' + esc(p[2]) + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<p class="ab-note">Cephalosporins with a different R1 can usually be given in penicillin allergy that is not severe, after risk assessment. Carbapenems cross-react in under 1%.</p>';
    root.querySelector('#st-big').innerHTML = D.big.map(function (b) {
      return '<section class="card pk-card"><p class="pk-kicker">' + esc(b.cls) + ' · ' + esc(b.mw) + ' Da</p><h2>' + esc(b.n) + '</h2><ul class="st-notes">' + b.notes.map(function (n) { return '<li>' + n + '</li>'; }).join('') + '</ul></section>';
    }).join('');

    function card(d) {
      var kick = d.cls || GN[d.g];
      return '<article class="card st-card" id="st-' + d.id + '"><p class="pk-kicker">' + esc(kick) + '</p><h3>' + esc(d.n) + '</h3>' +
        '<div class="st-svg">' + d.svg + '</div>' +
        '<p class="st-f">' + esc(d.f).replace(/(\d+)/g, '<sub>$1</sub>') + ' · ' + d.mw + ' g/mol</p>' +
        '<ul class="st-notes">' + d.notes.map(function (n) { return '<li>' + n + '</li>'; }).join('') + '</ul>' +
        '<p class="st-link"><a href="https://pubchem.ncbi.nlm.nih.gov/compound/' + encodeURIComponent(d.n.replace(/ C1$/, '').toLowerCase()) + '" target="_blank" rel="noopener">PubChem record</a></p></article>';
    }
    function draw() {
      var groups = [['all', 'All']].concat(D.groups);
      var hls = [['core', 'Key feature'], ['r1', 'R1 side chain'], ['none', 'No highlight']];
      var h = '<div class="st-bar"><div><p class="st-lab">Show</p><div class="opts st-opts">' + groups.map(function (g) {
        return '<button type="button" class="opt' + (st.g === g[0] ? ' on' : '') + '" aria-pressed="' + (st.g === g[0]) + '" data-g="' + g[0] + '">' + esc(g[1]) + '</button>';
      }).join('') + '</div></div><div><p class="st-lab">Highlight</p><div class="opts st-opts">' + hls.map(function (x) {
        return '<button type="button" class="opt' + (st.hl === x[0] ? ' on' : '') + '" aria-pressed="' + (st.hl === x[0]) + '" data-hl="' + x[0] + '">' + esc(x[1]) + '</button>';
      }).join('') + '</div></div></div>';
      if (st.hl === 'r1') h += '<p class="st-hint">R1 is the side chain on the β-lactam ring; it applies to penicillins, cephalosporins and aztreonam. Compare amoxicillin with cefadroxil, or ceftazidime with aztreonam.</p>';
      var list = D.drugs.filter(function (d) { return st.g === 'all' || d.g === st.g; });
      h += '<div class="st-grid show-' + st.hl + '">' + list.map(card).join('') + '</div>';
      host.innerHTML = h;
    }
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-g],[data-hl]');
      if (!b) return;
      var y = b.getBoundingClientRect().top;
      if (b.hasAttribute('data-g')) st.g = b.getAttribute('data-g'); else st.hl = b.getAttribute('data-hl');
      draw();
      var nb = host.querySelector(b.hasAttribute('data-g') ? '[data-g="' + st.g + '"]' : '[data-hl="' + st.hl + '"]');
      if (nb) { window.scrollBy(0, nb.getBoundingClientRect().top - y); nb.focus(); }
    });
    draw();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.StructuresInit = init;
})();
