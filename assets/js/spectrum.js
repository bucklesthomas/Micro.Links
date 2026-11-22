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
  var GSHORT = { 'Gram-positive': 'Gram-positive', 'Gram-negative': 'Gram-negative', 'Anaerobes': 'Anaerobes', 'Atypicals': 'Atypicals' };
  var LAB = ['Not reliable', 'Variable: check susceptibility', 'Reliable activity'];
  var CLASSES = [];
  A.drugs.forEach(function (d) { if (CLASSES.indexOf(d.cls) < 0) CLASSES.push(d.cls); });
  var st = { cls: {}, grp: {}, q: '', open: false };
  CLASSES.forEach(function (c) { st.cls[c] = true; });
  A.groups.forEach(function (g) { st.grp[g] = true; });

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function dl(id) { return hashMode ? '#drug-' + id : abxHref + '#drug-' + id; }

  function controls() {
    var nOff = CLASSES.filter(function (c) { return !st.cls[c]; }).length;
    var h = '<div class="sp-bar"><input id="sp-q" type="search" placeholder="Find an antibiotic…" autocomplete="off" value="' + esc(st.q) + '" aria-label="Find an antibiotic">' +
      '<div class="sp-seg" role="group" aria-label="Organism groups">' + A.groups.map(function (g) {
        var sh = { 'Gram-positive': 'Gram +ve', 'Gram-negative': 'Gram −ve' }[g];
        return '<button type="button" class="' + (st.grp[g] ? 'on' : '') + '" aria-pressed="' + !!st.grp[g] + '" data-g="' + esc(g) + '">' + (sh ? '<span class="sp-long">' + esc(g) + '</span><span class="sp-short">' + esc(sh) + '</span>' : esc(g)) + '</button>';
      }).join('') + '</div></div>';
    h += '<details class="sp-filter"' + (st.open ? ' open' : '') + '><summary>Antibiotic classes' + (nOff ? ' <small>(' + (CLASSES.length - nOff) + ' of ' + CLASSES.length + ' shown)</small>' : '') + '</summary>' +
      '<div class="opts wide sp-cls">' + CLASSES.map(function (c) {
        return '<button type="button" class="opt' + (st.cls[c] ? ' on' : '') + '" aria-pressed="' + !!st.cls[c] + '" data-c="' + esc(c) + '"><span class="opt-text">' + esc(c) + '</span></button>';
      }).join('') + '</div><div class="sp-quick"><button type="button" class="reset" data-all>Show all</button><button type="button" class="reset" data-none>Clear classes</button></div></details>';
    h += '<div class="sp-key" aria-hidden="true"><span><i class="c2"></i>Reliable activity</span><span><i class="c1"></i>Variable: check susceptibility</span><span><i class="c0"></i>Not reliable or intrinsically resistant</span></div>';
    return h;
  }

  function table() {
    var cols = [];
    A.orgs.forEach(function (o, i) { if (st.grp[o[2]]) cols.push(i); });
    var q = st.q.toLowerCase().trim();
    var drugs = A.drugs.filter(function (d) { return st.cls[d.cls] && (!q || (d.name + ' ' + (d.brands || '')).toLowerCase().indexOf(q) >= 0); });
    if (!cols.length || !drugs.length) return '<p class="ab-note">Nothing selected. Choose at least one organism group and antibiotic class.</p>';
    // Group header row
    var h = '<div class="sp-scroll spec-scroll"><table class="spec"><thead><tr class="spec-grp"><th class="spec-corner"></th>';
    var runs = [];
    cols.forEach(function (i) { var g = A.orgs[i][2]; if (runs.length && runs[runs.length - 1][0] === g) runs[runs.length - 1][1]++; else runs.push([g, 1]); });
    runs.forEach(function (r) { h += '<th colspan="' + r[1] + '" class="g-' + r[0].replace(/[^a-z]/gi, '').toLowerCase() + '">' + esc(GSHORT[r[0]]) + '</th>'; });
    h += '</tr><tr class="spec-org"><th class="spec-corner">Antibiotic</th>';
    var prevG = null;
    cols.forEach(function (i) { var o = A.orgs[i]; h += '<th scope="col" data-col="' + i + '" class="' + (o[2] !== prevG && prevG ? 'gs' : '') + '" title="' + esc(o[1]) + '"><span>' + esc(SHORT[o[0]] || o[1]) + '</span></th>'; prevG = o[2]; });
    h += '</tr></thead><tbody>';
    var prevC = null;
    drugs.forEach(function (d) {
      if (d.cls !== prevC) { h += '<tr class="spec-cls"><th colspan="' + (cols.length + 1) + '">' + esc(d.cls) + '</th></tr>'; prevC = d.cls; }
      h += '<tr><th scope="row"><a href="' + esc(dl(d.id)) + '">' + esc(d.name) + '</a>' + (d.site ? '<small>' + esc(d.site) + '</small>' : '') + '</th>';
      var pg = null;
      cols.forEach(function (i) {
        var v = +d.cov.charAt(i), o = A.orgs[i];
        h += '<td class="c' + v + (o[2] !== pg && pg ? ' gs' : '') + '" data-col="' + i + '" title="' + esc(d.name + ' – ' + o[1] + ': ' + LAB[v]) + '"><span class="sr">' + LAB[v] + '</span></td>';
        pg = o[2];
      });
      h += '</tr>';
    });
    h += '</tbody></table></div>';
    return h;
  }

  function draw() {
    var y = window.scrollY;
    host.innerHTML = controls() + '<div id="spec-t">' + table() + '</div>';
    window.scrollTo(0, y);
  }
  function redrawTable() { host.querySelector('#spec-t').innerHTML = table(); }

  host.addEventListener('click', function (e) {
    var g = e.target.closest('[data-g]'), c = e.target.closest('[data-c]');
    if (g) { var k = g.getAttribute('data-g'); st.grp[k] = !st.grp[k]; draw(); return; }
    if (c) { var n = c.getAttribute('data-c'); st.cls[n] = !st.cls[n]; draw(); return; }
    if (e.target.closest('[data-all]')) { CLASSES.forEach(function (x) { st.cls[x] = true; }); A.groups.forEach(function (x) { st.grp[x] = true; }); st.q = ''; draw(); return; }
    if (e.target.closest('[data-none]')) { CLASSES.forEach(function (x) { st.cls[x] = false; }); draw(); return; }
  });
  host.addEventListener('toggle', function (e) { if (e.target.classList && e.target.classList.contains('sp-filter')) st.open = e.target.open; }, true);
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
