/* Antibiotic spectrum chart: every antibiotic on the site against key organisms, colour coded.
   Same data as the coverage checker and antibiotics page (window.ABX_DATA: cov string per drug, 2 reliable,
   1 variable, 0 not reliable). */
(function () {
  var host = document.getElementById('spec');
  var A = window.ABX_DATA;
  if (!host || !A) return;
  var abxHref = host.getAttribute('data-abx') || '';
  var hashMode = !!document.getElementById('view-links');
  var SHORT = { mssa: 'MSSA', mrsa: 'MRSA', cons: 'CoNS', bhs: 'β-haemolytic strep', pnc: 'S. pneumoniae', vgs: 'Viridans strep', efs: 'E. faecalis', efm: 'E. faecium', vre: 'VRE', lis: 'Listeria',
    ecoli: 'E. coli, Klebsiella', esbl: 'ESBL', ampc: 'AmpC', cpe: 'CPE', psa: 'Pseudomonas', acb: 'Acinetobacter', steno: 'Stenotrophomonas', hflu: 'H. influenzae', mcat: 'Moraxella', nmen: 'N. meningitidis', ngon: 'N. gonorrhoeae',
    bfrag: 'B. fragilis', oralan: 'Oral anaerobes', cperf: 'Clostridia', cdiff: 'C. difficile', myco: 'Mycoplasma', chlam: 'Chlamydia', legio: 'Legionella' };
  var LAB = ['Not reliable', 'Variable: check susceptibility', 'Reliable activity'];
  var CLASSES = [];
  A.drugs.forEach(function (d) { if (CLASSES.indexOf(d.cls) < 0) CLASSES.push(d.cls); });
  var st = { grp: 'All', cls: [], q: '' };  // cls: the classes picked to compare (empty = all)

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function dl(id) { return hashMode ? '#drug-' + id : abxHref + '#drug-' + id; }

  function controls() {
    var h = '<div class="ab-bar"><input id="sp-q" type="search" placeholder="Filter antibiotics…" value="' + esc(st.q) + '" aria-label="Filter antibiotics" autocomplete="off"><div class="ab-aw" role="group" aria-label="Organism groups">';
    ['All'].concat(A.groups).forEach(function (g) { h += '<button type="button" class="sp-chip' + (st.grp === g ? ' on' : '') + '" aria-pressed="' + (st.grp === g) + '" data-g="' + esc(g) + '">' + esc(g === 'All' ? 'All organisms' : g) + '</button>'; });
    h += '</div></div><div class="ab-aw sp-cls" role="group" aria-label="Antibiotic classes">';
    ['All'].concat(CLASSES).forEach(function (c) { var on = c === 'All' ? !st.cls.length : st.cls.indexOf(c) >= 0; h += '<button type="button" class="sp-chip' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-c="' + esc(c) + '">' + esc(c === 'All' ? 'All classes' : c) + '</button>'; });
    h += '</div><div class="sp-key" aria-hidden="true"><span><i class="c2"></i>Reliable activity</span><span><i class="c1"></i>Variable: check susceptibility</span><span><i class="c0"></i>Not reliable or intrinsically resistant</span></div>';
    return h;
  }

  function table() {
    var cols = [];
    A.orgs.forEach(function (o, i) { if (st.grp === 'All' || o[2] === st.grp) cols.push(i); });
    var q = st.q.toLowerCase().trim();
    var drugs = A.drugs.filter(function (d) { return (!st.cls.length || st.cls.indexOf(d.cls) >= 0) && (!q || (d.name + ' ' + (d.brands || '') + ' ' + d.cls).toLowerCase().indexOf(q) >= 0); });
    if (!drugs.length) return '<p class="ab-note">No antibiotics match.</p>';
    // Columns with a narrow spacer between organism groups
    var seq = [], prev = null;
    cols.forEach(function (i) { var g = A.orgs[i][2]; if (prev && g !== prev) seq.push(-1); seq.push(i); prev = g; });
    var h = '<div class="spec-scroll"><table class="spec"><thead><tr class="spec-grp"><th class="spec-corner"></th>';
    var run = null, span = 0;
    function flush() { if (run) h += '<th colspan="' + span + '">' + esc(run) + '</th>'; }
    seq.forEach(function (i) {
      if (i < 0) { flush(); run = null; span = 0; h += '<th class="gap"></th>'; return; }
      var g = A.orgs[i][2]; if (g !== run) { flush(); run = g; span = 0; } span++;
    });
    flush();
    h += '</tr><tr class="spec-org"><th class="spec-corner"></th>';
    seq.forEach(function (i) { h += i < 0 ? '<th class="gap"></th>' : '<th scope="col" data-col="' + i + '" title="' + esc(A.orgs[i][1]) + '"><span>' + esc(SHORT[A.orgs[i][0]] || A.orgs[i][1]) + '</span></th>'; });
    h += '</tr></thead><tbody>';
    var prevC = null, n = seq.length + 1;
    drugs.forEach(function (d) {
      if (d.cls !== prevC) { h += '<tr class="spec-cls"><th colspan="' + n + '"><span>' + esc(d.cls) + '</span></th></tr>'; prevC = d.cls; }
      h += '<tr><th scope="row"><a href="' + esc(dl(d.id)) + '">' + esc(d.name) + '</a>' + (d.site ? '<small>' + esc(d.site) + '</small>' : '') + '</th>';
      seq.forEach(function (i) {
        if (i < 0) { h += '<td class="gap"></td>'; return; }
        var v = +d.cov.charAt(i);
        h += '<td data-col="' + i + '" title="' + esc(d.name + ' – ' + A.orgs[i][1] + ': ' + LAB[v]) + '"><i class="c' + v + '"></i><span class="sr">' + LAB[v] + '</span></td>';
      });
      h += '</tr>';
    });
    return h + '</tbody></table></div>';
  }

  function draw() {
    var y = window.scrollY, rows = Array.prototype.map.call(host.querySelectorAll('.ab-aw'), function (r) { return r.scrollLeft; });
    host.innerHTML = controls() + '<div id="spec-t">' + table() + '</div>';
    Array.prototype.forEach.call(host.querySelectorAll('.ab-aw'), function (r, i) { if (rows[i]) r.scrollLeft = rows[i]; });
    window.scrollTo(0, y);
  }
  function redrawTable() { host.querySelector('#spec-t').innerHTML = table(); }

  host.addEventListener('click', function (e) {
    var g = e.target.closest('[data-g]'), c = e.target.closest('[data-c]');
    if (g) { st.grp = g.getAttribute('data-g'); draw(); }
    else if (c) {
      var v = c.getAttribute('data-c'), i = st.cls.indexOf(v);
      if (v === 'All') st.cls = []; else if (i >= 0) st.cls.splice(i, 1); else st.cls.push(v);
      if (st.cls.length === CLASSES.length) st.cls = [];
      draw();
    }
  });
  host.addEventListener('input', function (e) { if (e.target.id === 'sp-q') { st.q = e.target.value; redrawTable(); } });
  // Crosshair highlight of the organism column (row highlight is CSS)
  host.addEventListener('mouseover', function (e) {
    var cell = e.target.closest('[data-col]'), t = host.querySelector('table.spec');
    if (!t) return;
    var prev = t.getAttribute('data-hl'), col = cell ? cell.getAttribute('data-col') : null;
    if (prev === col) return;
    if (prev != null) Array.prototype.forEach.call(t.querySelectorAll('[data-col="' + prev + '"]'), function (x) { x.classList.remove('hl'); });
    if (col != null) { Array.prototype.forEach.call(t.querySelectorAll('[data-col="' + col + '"]'), function (x) { x.classList.add('hl'); }); t.setAttribute('data-hl', col); } else t.removeAttribute('data-hl');
  });
  draw();
})();
