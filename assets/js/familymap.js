/* Bacterial family map: an interactive tree of the bacteria on this site, by phylum, family and genus.
   Tap a branch to fold or unfold it, search to highlight, and tap an organism for a summary and a link to its page.
   Names follow current nomenclature (LPSN); older phylum names are shown alongside. */
(function () {
  var host = document.getElementById('fam');
  if (!host) return;
  // The organism data may load after this script (single-file build): wait for it
  var tries = 0;
  (function boot() { if (window.ORG_DATA || tries++ > 100) init(); else setTimeout(boot, 30); })();
  function init() {
  var O = window.ORG_DATA;
  var base = host.getAttribute('data-base') || '';
  var hashMode = host.hasAttribute('data-hash');
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function url(u) { if (hashMode) { var m = /^\/([^/]+)\/(#.*)?$/.exec(u); return m ? (m[2] || '#' + m[1]) : u; } return base + u; }
  var ORG = {}; if (O) O.orgs.forEach(function (o) { ORG[o.id] = o; });

  // [phylum, older name, colour key, [[family, [[genus, [[organism id, gram]]]]]]]   gram: p positive, n negative, x no cell wall
  var TREE = [
    ['Bacillota', 'Firmicutes', 'b', [
      ['Staphylococcaceae', [['Staphylococcus', [['staphylococcus-aureus-mssa', 'p'], ['mrsa', 'p'], ['staphylococcus-lugdunensis', 'p'], ['coagulase-negative-staphylococci', 'p']]]]],
      ['Listeriaceae', [['Listeria', [['listeria-monocytogenes', 'p']]]]],
      ['Streptococcaceae', [['Streptococcus', [['streptococcus-pyogenes-group-a', 'p'], ['streptococcus-agalactiae-group-b', 'p'], ['streptococcus-pneumoniae', 'p'], ['streptococcus-anginosus-group', 'p'], ['viridans-group-streptococci', 'p']]]]],
      ['Enterococcaceae', [['Enterococcus', [['enterococcus-faecalis', 'p'], ['enterococcus-faecium-including-vre', 'p']]]]],
      ['Clostridiaceae', [['Clostridium', [['clostridium-perfringens-and-other-clostridia', 'p']]]]],
      ['Peptostreptococcaceae', [['Clostridioides', [['clostridioides-difficile', 'p']]]]]]],
    ['Pseudomonadota', 'Proteobacteria', 'r', [
      ['Enterobacteriaceae', [['Escherichia', [['escherichia-coli', 'n']]], ['Klebsiella', [['klebsiella-pneumoniae', 'n'], ['klebsiella-aerogenes', 'n']]], ['Enterobacter', [['enterobacter-cloacae-complex', 'n']]], ['Citrobacter', [['citrobacter-freundii', 'n']]], ['Salmonella', [['salmonella-non-typhoidal', 'n'], ['salmonella-typhi-and-paratyphi', 'n']]]]],
      ['Yersiniaceae', [['Serratia', [['serratia-marcescens', 'n']]]]],
      ['Morganellaceae', [['Proteus', [['proteus-mirabilis', 'n']]], ['Morganella, Providencia', [['morganella-and-providencia', 'n']]]]],
      ['Pseudomonadaceae', [['Pseudomonas', [['pseudomonas-aeruginosa', 'n']]]]],
      ['Moraxellaceae', [['Acinetobacter', [['acinetobacter-baumannii', 'n']]], ['Moraxella', [['moraxella-catarrhalis', 'n']]]]],
      ['Lysobacteraceae', [['Stenotrophomonas', [['stenotrophomonas-maltophilia', 'n']]]]],
      ['Pasteurellaceae', [['Haemophilus', [['haemophilus-influenzae', 'n']]]]],
      ['Legionellaceae', [['Legionella', [['legionella-pneumophila', 'n']]]]],
      ['Burkholderiaceae', [['Burkholderia', [['burkholderia-cepacia-complex', 'n']]]]],
      ['Neisseriaceae', [['Neisseria', [['neisseria-meningitidis', 'n'], ['neisseria-gonorrhoeae', 'n']]]]]]],
    ['Campylobacterota', 'Epsilonproteobacteria', 'a', [
      ['Campylobacteraceae', [['Campylobacter', [['campylobacter', 'n']]]]]]],
    ['Bacteroidota', 'Bacteroidetes', 'g', [
      ['Bacteroidaceae', [['Bacteroides', [['bacteroides-fragilis-group', 'n']]]]]]],
    ['Mycoplasmatota', 'Tenericutes', 'm', [
      ['Mycoplasmataceae', [['Mycoplasma', [['mycoplasma-pneumoniae', 'x']]]]]]]
  ];
  var GRAM = { p: 'Gram-positive', n: 'Gram-negative', x: 'No cell wall (does not Gram stain)' };
  var ENTERO = ['Enterobacteriaceae', 'Yersiniaceae', 'Morganellaceae'];

  // Build nodes
  var nodes = [], root = { id: 'root', kids: [] };
  TREE.forEach(function (p) {
    var pn = { id: 'p:' + p[0], name: p[0], sub: 'formerly ' + p[1], lvl: 0, c: p[2], kids: [] }; root.kids.push(pn);
    p[3].forEach(function (f) {
      var fn = { id: 'f:' + f[0], name: f[0], lvl: 1, c: p[2], kids: [], up: pn }; pn.kids.push(fn);
      f[1].forEach(function (g) {
        var gn = { id: 'g:' + g[0], name: g[0], lvl: 2, c: p[2], kids: [], up: fn, it: true }; fn.kids.push(gn);
        g[1].forEach(function (o) { var org = ORG[o[0]]; if (!org) return; gn.kids.push({ id: o[0], name: org.n, lvl: 3, c: p[2], gram: o[1], org: org, up: gn, leaf: true }); });
      });
    });
  });
  function all(n, f) { (n.kids || []).forEach(function (k) { f(k); all(k, f); }); }
  all(root, function (n) { nodes.push(n); });
  var leaves = nodes.filter(function (n) { return n.leaf; });

  var st = { closed: {}, q: '', sel: null };
  var X = [14, 180, 374, 560], ROW = 26, TOP = 34, W = 940;

  function layout() {
    var y = TOP;
    function place(n) {
      if (n.leaf || st.closed[n.id] || !n.kids.length) { n.y = y; y += ROW; return; }
      n.kids.forEach(place);
      n.y = (n.kids[0].y + n.kids[n.kids.length - 1].y) / 2;
    }
    root.kids.forEach(function (p) { place(p); y += 8; });
    return y + 10;
  }
  function visible(n) { for (var u = n.up; u; u = u.up) if (st.closed[u.id]) return false; return true; }
  function match(n) {
    if (!st.q) return true;
    var q = st.q.toLowerCase(), hay = (n.name + ' ' + (n.org ? n.org.syn || '' : '')).toLowerCase();
    if (hay.indexOf(q) !== -1) return true;
    for (var u = n.up; u; u = u.up) if (u.name.toLowerCase().indexOf(q) !== -1) return true;
    return false;
  }
  function hits() { return st.q ? leaves.filter(match) : []; }
  function onPath(n) { if (!st.q) return true; var h = hits(); if (n.leaf) return h.indexOf(n) !== -1; return h.some(function (l) { for (var u = l.up; u; u = u.up) if (u === n) return true; return false; }) || match(n); }

  function svg() {
    var H = layout(), h = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" class="fm-svg' + (st.q ? ' filt' : '') + '" role="tree" aria-label="Bacteria on this site by phylum, family and genus">';
    ['Phylum', 'Family', 'Genus', 'Organism on this site'].forEach(function (t, i) { h += '<text class="fm-col" x="' + X[i] + '" y="14">' + t + '</text>'; });
    // Enterobacterales bracket
    var ef = nodes.filter(function (n) { return ENTERO.indexOf(n.name) !== -1 && visible(n); });
    if (ef.length) {
      var y1 = Math.min.apply(null, ef.map(function (n) { return n.y; })) - 10, y2 = Math.max.apply(null, ef.map(function (n) { return n.y; })) + 10;
      h += '<path class="fm-brk" d="M' + (X[1] - 8) + ' ' + y1 + ' h-6 V' + y2 + ' h6"/><text class="fm-brkt" transform="translate(' + (X[1] - 20) + ',' + ((y1 + y2) / 2) + ') rotate(-90)" text-anchor="middle">Enterobacterales</text>';
    }
    nodes.forEach(function (n) {
      if (!visible(n) || !n.up) return;
      var a = n.up, x1 = X[a.lvl] + 6, x2 = X[n.lvl] - 6, mx = (x1 + x2) / 2;
      h += '<path class="fm-link c-' + n.c + (onPath(n) ? '' : ' dim') + '" d="M' + x1 + ' ' + a.y + ' C' + mx + ' ' + a.y + ' ' + mx + ' ' + n.y + ' ' + x2 + ' ' + n.y + '"/>';
    });
    nodes.forEach(function (n) {
      if (!visible(n)) return;
      var x = X[n.lvl], y = n.y, closed = st.closed[n.id], cls = 'fm-node c-' + n.c + (n.leaf ? ' leaf' : '') + (closed ? ' closed' : '') + (onPath(n) ? '' : ' dim') + (st.sel === n.id ? ' sel' : '') + (st.q && n.leaf && match(n) ? ' hit' : '');
      var label = esc(n.name), cnt = '';
      if (closed) { var c = 0; all(n, function (k) { if (k.leaf) c++; }); cnt = '<tspan class="fm-cnt"> (' + c + ')</tspan>'; }
      h += '<g class="' + cls + '" data-n="' + esc(n.id) + '" tabindex="0" role="treeitem" aria-label="' + label + (n.leaf ? ', ' + GRAM[n.gram] : (closed ? ', folded' : '')) + '"' + (n.leaf ? '' : ' aria-expanded="' + !closed + '"') + '>' +
        '<rect class="fm-hit" x="' + (x - 8) + '" y="' + (y - 11) + '" width="' + (n.leaf ? 340 : X[n.lvl + 1] - x - 4) + '" height="22" rx="6"/>' +
        (n.leaf ? '<circle class="fm-gram g-' + n.gram + '" cx="' + x + '" cy="' + y + '" r="5.5"/>' : '<circle class="fm-dot" cx="' + x + '" cy="' + y + '" r="' + (n.lvl === 0 ? 7 : 5.5) + '"/>') +
        '<text class="fm-t l' + n.lvl + (n.it || (n.leaf && /^[A-Z][a-z]+ [a-z]/.test(n.name)) ? ' it' : '') + '" x="' + (x + 11) + '" y="' + (y + 4.5) + '">' + label + cnt + '</text>' +
        (n.sub ? '<text class="fm-sub" x="' + (x + 11) + '" y="' + (y + 18) + '">' + esc(n.sub) + '</text>' : '') + '</g>';
    });
    return h + '</svg>';
  }
  function panel() {
    var n = nodes.filter(function (x) { return x.id === st.sel; })[0];
    if (!n) return '<p class="ab-note">Tap an organism for a summary, or tap a phylum, family or genus to fold it away.</p>' +
      '<div class="fm-key"><span><i class="g-p"></i>Gram-positive</span><span><i class="g-n"></i>Gram-negative</span><span><i class="g-x"></i>No cell wall</span></div>';
    var o = n.org, line = [], u;
    for (u = n.up; u; u = u.up) line.unshift(u.name);
    var fact = o.facts && o.facts[0] ? o.facts[0] : '';
    return '<p class="ir-eyebrow">' + esc(line.join(' › ')) + '</p><h3>' + esc(o.n) + '</h3>' +
      '<p class="fm-gl"><i class="g-' + n.gram + '"></i>' + esc(GRAM[n.gram]) + (ENTERO.indexOf(n.up.up.name) !== -1 ? ' · order Enterobacterales' : '') + '</p>' +
      (fact ? '<p class="fm-fact">' + esc(fact) + '</p>' : '') +
      (o.tx ? '<div class="org-tx"><p class="org-lab">First-line treatment</p><p>' + esc(o.tx) + '</p></div>' : '') +
      '<p class="cov-chips"><a class="sp-chip" href="' + esc(url('/organisms/#bug-' + o.id)) + '">Open organism page</a></p>';
  }
  function draw(keep) {
    host.querySelector('#fm-tree').innerHTML = svg();
    host.querySelector('#fm-panel').innerHTML = panel();
    var n = host.querySelector('#fm-n'); if (n) n.textContent = st.q ? hits().length + ' of ' + leaves.length + ' organisms match' : leaves.length + ' bacteria on this site';
    if (keep) { var g = host.querySelector('[data-n="' + keep + '"]'); if (g) g.focus(); }
  }
  host.innerHTML = '<div class="fm-bar"><div class="ab-bar fm-search"><input id="fm-q" type="search" placeholder="Highlight an organism, genus or family…" aria-label="Highlight organisms" autocomplete="off"></div>' +
    '<div class="fm-btns"><button type="button" class="sp-chip" data-act="open">Unfold all</button><button type="button" class="sp-chip" data-act="fold">Fold to families</button></div><p class="ab-note" id="fm-n"></p></div>' +
    '<div class="fm-layout"><div class="card af-card fm-card"><div class="fm-scroll" id="fm-tree"></div></div><aside class="card af-card fm-side" id="fm-panel" aria-live="polite"></aside></div>';
  function act(id) {
    var n = nodes.filter(function (x) { return x.id === id; })[0]; if (!n) return;
    if (n.leaf) { st.sel = st.sel === id ? null : id; draw(id); if (st.sel && window.innerWidth < 900) host.querySelector('#fm-panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    else { st.closed[id] = !st.closed[id]; draw(id); }
  }
  host.addEventListener('click', function (e) {
    var g = e.target.closest('[data-n]'); if (g) { act(g.getAttribute('data-n')); return; }
    var b = e.target.closest('[data-act]'); if (!b) return;
    if (b.getAttribute('data-act') === 'open') st.closed = {};
    else { st.closed = {}; nodes.forEach(function (n) { if (n.lvl === 1) st.closed[n.id] = true; }); }
    draw();
  });
  host.addEventListener('keydown', function (e) { var g = e.target.closest('[data-n]'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); act(g.getAttribute('data-n')); } });
  host.addEventListener('input', function (e) { if (e.target.id === 'fm-q') { st.q = e.target.value.trim(); if (st.q) st.closed = {}; draw(); } });
  draw();
  }
})();
