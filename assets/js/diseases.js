/* Disease lookup: type a disease and get a short, guideline-directed summary (diagnosis, first-line treatment,
   alternatives, duration, infection control) with links to the guideline and to this site's guides.
   Data: disease-data.js (_data/diseases.json); antibiotic names are linked using abx-data.js. */
(function () {
  var host = document.getElementById('dz');
  var D = window.DZ_DATA, A = window.ABX_DATA;
  if (!host || !D) return;
  var base = host.getAttribute('data-base') || '';
  var abxHref = host.getAttribute('data-abx') || '';
  var hashMode = host.hasAttribute('data-hash');
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function url(u) {
    if (u.charAt(0) !== '/') return u;
    if (hashMode) { var m = /^\/([^/]+)\/(#.*)?$/.exec(u); return m ? (m[2] || '#' + m[1]) : u; }
    return base + u;
  }
  function ext(u) { return /^https?:/.test(u); }
  var st = { pick: null, q: '' };

  // Link antibiotic names in treatment text to the antibiotics page (first mention of each)
  var NAMES = [];
  if (A) A.drugs.forEach(function (d) {
    var n = d.name.replace(/\s*\(.*\)$/, '');
    if (!NAMES.some(function (x) { return x[0].toLowerCase() === n.toLowerCase(); })) NAMES.push([n, d.id]);
  });
  NAMES.sort(function (a, b) { return b[0].length - a[0].length; });
  function linkDrugs(text) {
    var out = esc(text), used = {}, slots = [];
    NAMES.forEach(function (p) {
      var re = new RegExp('(^|[^A-Za-z\\-–])(' + p[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?![A-Za-z])', 'i');
      if (used[p[1]]) return;
      var m = re.exec(out);
      if (!m) return;
      used[p[1]] = 1;
      var tag = '\u0000' + slots.length + '\u0000';
      slots.push('<a class="dz-drug" href="' + esc(hashMode ? '#drug-' + p[1] : abxHref + '#drug-' + p[1]) + '">' + m[2] + '</a>');
      out = out.slice(0, m.index + m[1].length) + tag + out.slice(m.index + m[0].length);
    });
    return out.replace(/\u0000(\d+)\u0000/g, function (_, i) { return slots[+i]; });
  }

  function terms() { return st.q.toLowerCase().replace(/[’']/g, '').split(/\s+/).filter(Boolean); }
  function matches() {
    var t = terms();
    var hits = D.dz.filter(function (d) { var hay = (d.n + ' ' + d.syn).toLowerCase().replace(/[’']/g, ''); return t.every(function (w) { return hay.indexOf(w) !== -1; }); });
    if (t.length) hits.sort(function (a, b) { return rank(a) - rank(b); });
    return hits;
    function rank(d) {
      var n = d.n.toLowerCase().replace(/[’']/g, ''), q = t.join(' '), words = (n + ' ' + d.syn.toLowerCase()).split(/[\s(),]+/);
      if (n.indexOf(q) === 0) return 0;
      if ((' ' + d.syn.toLowerCase() + ' ').indexOf(' ' + q + ' ') !== -1 || words.indexOf(q) !== -1) return 1;
      if (words.some(function (w) { return w.indexOf(t[0]) === 0; })) return 2;
      return 3;
    }
  }
  function list() {
    var hits = matches(), h = '';
    if (!hits.length) return '<p class="ir-empty">No match. Try another name, or search the whole site at the top of the page.</p>';
    if (terms().length) return hits.map(item).join('');
    D.groups.forEach(function (g) {
      var ds = hits.filter(function (d) { return d.g === g; });
      if (!ds.length) return;
      h += '<p class="ir-grp">' + esc(g) + '</p>' + ds.map(item).join('');
    });
    return h;
  }
  function item(d) { return '<button type="button" class="ir-item' + (st.pick === d.id ? ' on' : '') + '" data-pick="' + d.id + '">' + esc(d.n) + '</button>'; }

  function detail() {
    var d = D.dz.filter(function (x) { return x.id === st.pick; })[0];
    if (!d) return '<div class="dz-empty"><p class="ir-eyebrow">Disease lookup</p><h3>Type a disease to start</h3><p>Pick from the list, or type a name or abbreviation (CAP, UTI, PID, SBP…). Each entry gives diagnosis, first-line treatment, alternatives, duration and infection control, with links to the guideline and to the full guides on this site.</p></div>';
    var h = '<p class="ir-eyebrow">' + esc(d.g) + '</p><h3>' + esc(d.n) + '</h3>';
    if (d.s) h += '<p class="dz-sum">' + esc(d.s) + '</p>';
    var bg = [];
    if (d.cause) bg.push(['Cause', d.cause]);
    if (d.clin) bg.push(['Clinical features', d.clin]);
    if (bg.length) h += '<dl class="dz-dl dz-bg">' + bg.map(function (f) { return '<dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd>'; }).join('') + '</dl>';
    if (d.dx.length) h += '<div class="ab-sec"><h4>Diagnosis and assessment</h4><ul>' + d.dx.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
    if (d.rx) h += '<div class="org-tx"><p class="org-lab">First-line treatment</p><p>' + linkDrugs(d.rx) + '</p>' + (d.alt ? '<p class="org-alt">' + linkDrugs(d.alt) + '</p>' : '') + '</div>';
    var facts = [];
    if (d.dur) facts.push(['Duration', d.dur]);
    if (d.ipc) facts.push(['Infection control and public health', d.ipc]);
    if (facts.length) h += '<dl class="dz-dl">' + facts.map(function (f) { return '<dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd>'; }).join('') + '</dl>';
    if (d.notes.length) h += '<ul class="vc-notes dz-notes">' + d.notes.map(function (n) { return '<li>' + linkDrugs(n) + '</li>'; }).join('') + '</ul>';
    if (d.pearl) h += '<div class="dz-pearl"><p class="org-lab">Clinical pearl</p><p>' + linkDrugs(d.pearl) + '</p></div>';
    if (d.trial) h += '<div class="dz-trial"><p class="org-lab">Key trial</p><p class="dz-trialn"><b>' + esc(d.trial[0]) + '</b> <span>' + esc(d.trial[1]) + '</span></p><p>' + esc(d.trial[2]) + '</p></div>';
    var links = d.site.map(function (l) { return '<a class="sp-chip" href="' + esc(url(l[1])) + '"' + (ext(l[1]) ? ' target="_blank" rel="noopener"' : '') + '>' + esc(l[0]) + '</a>'; });
    if (links.length) h += '<div class="ab-sec"><h4>On this site</h4><p class="cov-chips">' + links.join('') + '</p></div>';
    if (d.src.length) h += '<div class="ab-sec"><h4>Guidelines</h4><p class="cov-chips">' + d.src.map(function (l) { return '<a class="sp-chip dz-ext" href="' + esc(l[1]) + '" target="_blank" rel="noopener">' + esc(l[0]) + '</a>'; }).join('') + '</p></div>';
    h += '<div class="ie-actions"><button type="button" class="reset" data-copy>Copy for Epic</button></div>';
    return h;
  }
  function epicText(d) {
    var t = [d.n];
    if (d.s) t.push(d.s);
    if (d.dx.length) t.push('', 'Diagnosis and assessment:'), d.dx.forEach(function (x) { t.push('- ' + x); });
    if (d.rx) t.push('', 'First-line treatment: ' + d.rx);
    if (d.alt) t.push('Alternatives: ' + d.alt);
    if (d.dur) t.push('Duration: ' + d.dur);
    if (d.ipc) t.push('Infection control: ' + d.ipc);
    d.notes.forEach(function (n) { t.push('- ' + n); });
    t.push('', 'Summary from Micro.Links disease lookup (' + d.src.map(function (s) { return s[0]; }).join(', ') + '); check local guidelines and discuss with microbiology.');
    return t.join('\n');
  }
  function copy(btn) {
    var d = D.dz.filter(function (x) { return x.id === st.pick; })[0]; if (!d) return;
    var text = epicText(d);
    function done(ok) { var o = btn.textContent; btn.textContent = ok ? 'Copied' : 'Select and copy below'; setTimeout(function () { btn.textContent = o; }, 1800); }
    function fallback() { var ta = document.createElement('textarea'); ta.value = text; ta.className = 'mc-copy-box'; btn.parentNode.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} if (ok) ta.parentNode.removeChild(ta); done(ok); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback); else fallback();
  }

  function draw(keep) {
    host.innerHTML = '<div class="ir-layout dz-layout"><div class="ir-list"><input id="dz-q" type="search" placeholder="Type a disease…" value="' + esc(st.q) + '" aria-label="Search diseases" autocomplete="off" enterkeyhint="go"><div class="ir-items">' + list() + '</div></div><div class="ir-detail" aria-live="polite">' + detail() + '</div></div>';
    if (keep != null) { var i = host.querySelector('#dz-q'); i.focus(); i.setSelectionRange(keep, keep); }
  }
  function pick(id, scroll) {
    st.pick = id;
    host.querySelectorAll('.ir-item').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-pick') === id); });
    host.querySelector('.ir-detail').innerHTML = detail();
    try { history.replaceState(null, '', '#dz-' + id); } catch (err) {}
    if (scroll && window.innerWidth < 760) host.querySelector('.ir-detail').scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
  host.addEventListener('click', function (e) {
    var p = e.target.closest('[data-pick]'); if (p) { pick(p.getAttribute('data-pick'), true); return; }
    var c = e.target.closest('[data-copy]'); if (c) copy(c);
  });
  host.addEventListener('input', function (e) { if (e.target.id === 'dz-q') { st.q = e.target.value; host.querySelector('.ir-items').innerHTML = list(); } });
  host.addEventListener('keydown', function (e) {
    if (e.target.id === 'dz-q' && e.key === 'Enter') { e.preventDefault(); var m = matches(); if (m.length) { pick(m[0].id, true); e.target.blur(); } }
  });
  function fromHash() { var m = /^#dz-(.+)$/.exec(location.hash); if (m && D.dz.some(function (d) { return d.id === m[1]; })) { st.pick = m[1]; return true; } return false; }
  window.addEventListener('hashchange', function () { if (fromHash()) { draw(); host.scrollIntoView({ block: 'start' }); } });
  var deep = fromHash(); draw();
  if (deep) { var on = host.querySelector('.ir-item.on'); if (on) on.scrollIntoView({ block: 'nearest' }); host.scrollIntoView({ block: 'start' }); }
})();
