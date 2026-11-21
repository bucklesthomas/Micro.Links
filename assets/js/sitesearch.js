/* Site-wide search: links, scores and trials, from search.json (or window.MC_INDEX if a page provides it). */
(function () {
  var input = document.getElementById('ss');
  var box = document.getElementById('ss-results');
  if (!input || !box) return;

  var me = document.currentScript;
  var src = me && me.getAttribute('data-index');
  var base = ((me && me.getAttribute('data-base')) || '/').replace(/\/$/, '');
  var index = window.MC_INDEX || null;
  var loading = null;
  var results = [];
  var active = -1;
  var LABEL = { link: 'Link', score: 'Score', trial: 'Trial', bug: 'Organism', abx: 'Antibiotic', ir: 'Resistance' };

  function load() {
    if (index) return Promise.resolve();
    if (!loading) {
      loading = fetch(src).then(function (r) { return r.json(); })
        .then(function (d) { index = d; })
        .catch(function () { index = []; });
    }
    return loading;
  }

  function esc(s) {
    return String(s || '').replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function href(u) { return /^(https?:|#)/.test(u) ? u : base + u; }
  function mark(text, terms) {
    var out = esc(text);
    terms.forEach(function (t) {
      var re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      out = out.replace(re, '<mark>$1</mark>');
    });
    return out;
  }

  // Shorthand, abbreviations and brand names -> words that appear in the index
  var SYN = {
    staph: ['staphylococcus', 'staphylococci'], strep: ['streptococcus', 'streptococci'], pneumo: ['pneumococcal', 'pneumoniae', 'pneumococcus'],
    gas: ['pyogenes', 'group a'], gbs: ['agalactiae', 'group b'], gnb: ['gram-negative'], gpc: ['gram-positive'], cons: ['coagulase-negative'],
    sab: ['aureus'], mssa: ['aureus'], klebs: ['klebsiella'], pseudo: ['pseudomonas'], steno: ['stenotrophomonas'], acineto: ['acinetobacter'],
    vre: ['vancomycin-resistant', 'faecium'], cpe: ['carbapenemase'], kpc: ['carbapenemase'], oxa: ['carbapenemase', 'oxa-48'], ndm: ['carbapenemase'],
    cdiff: ['difficile'], cdi: ['difficile'], diff: ['difficile'], tb: ['tuberculosis'], ltbi: ['latent'], igra: ['igra', 'quantiferon'],
    pcp: ['pneumocystis'], pjp: ['pneumocystis'], crag: ['cryptococcal'], ipa: ['aspergillosis'], gm: ['galactomannan'], bdg: ['glucan'],
    uti: ['urinary'], pyelo: ['pyelonephritis'], cap: ['pneumonia', 'curb'], hap: ['pneumonia'], ie: ['endocarditis'], ssti: ['soft tissue', 'cellulitis'],
    nf: ['necrotising', 'lrinec'], pji: ['prosthetic joint'], sbp: ['peritonitis'], pep: ['post-exposure', 'needlestick'], hcid: ['high consequence'],
    vhf: ['haemorrhagic', 'vhf'], abx: ['antibiotic'], tdm: ['levels', 'tdm'], vanc: ['vancomycin'], gent: ['gentamicin'], teic: ['teicoplanin'],
    mero: ['meropenem'], tazocin: ['piperacillin'], piptaz: ['piperacillin'], tazo: ['piperacillin'], augmentin: ['co-amoxiclav'], coamox: ['co-amoxiclav'],
    cipro: ['ciprofloxacin'], levo: ['levofloxacin'], moxi: ['moxifloxacin'], septrin: ['co-trimoxazole'], cotrim: ['co-trimoxazole'], doxy: ['doxycycline'],
    clinda: ['clindamycin'], fluclox: ['flucloxacillin'], amox: ['amoxicillin'], metro: ['metronidazole'], flagyl: ['metronidazole'], ceftaz: ['ceftazidime'],
    avycaz: ['ceftazidime'], zerbaxa: ['ceftolozane'], fetcroja: ['cefiderocol'], ambisome: ['amphotericin'], ampho: ['amphotericin'], vori: ['voriconazole'],
    posa: ['posaconazole'], isavu: ['isavuconazole'], diflucan: ['fluconazole'], caspo: ['echinocandin', 'caspofungin'], mica: ['echinocandin', 'micafungin'],
    rifampin: ['rifampicin'], bp: ['breakpoint'], mic: ['breakpoint', 'mic'], ir: ['intrinsic'], auc: ['auc', 'vancomycin'], bc: ['blood culture'],
    bcs: ['blood culture'], typhoid: ['typhi', 'enteric'], enteric: ['typhi', 'enteric'], stec: ['stec', 'o157'], hus: ['stec', 'haemolytic'],
    riamet: ['artemether'], malarone: ['atovaquone'], eurartesim: ['artenimol'], bhiva: ['bhiva', 'hiv'], ukhsa: ['ukhsa', 'health security']
  };
  var PHRASE = [[/\bc\.?\s*diff\b/g, 'difficile'], [/\bpip\s*[-\/]?\s*taz\b/g, 'piperacillin'], [/\bco\s*-?\s*amox\b/g, 'co-amoxiclav'],
    [/\bco\s*-?\s*trim\b/g, 'co-trimoxazole'], [/\bs\.?\s*aureus\b/g, 'aureus'], [/\bblood\s*cultures?\b/g, 'blood culture']];

  // Optimal string alignment distance (typos: one wrong, missing, extra or swapped letter)
  function dist(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) { d[i] = [i]; }
    for (j = 0; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) {
      var rowMin = Infinity;
      for (j = 1; j <= b.length; j++) {
        var c = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
        if (i > 1 && j > 1 && a.charAt(i - 1) === b.charAt(j - 2) && a.charAt(i - 2) === b.charAt(j - 1)) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        if (d[i][j] < rowMin) rowMin = d[i][j];
      }
      if (rowMin > max) return max + 1;
    }
    return d[a.length][b.length];
  }
  function wordsOf(s) { return s.toLowerCase().split(/[^a-z0-9]+/).filter(function (w) { return w.length > 2; }); }
  function fuzzyIn(term, ws) {
    var max = term.length >= 8 ? 2 : 1;
    for (var i = 0; i < ws.length; i++) {
      var w = ws[i];
      if (dist(term, w, max) <= max) return true;                                                // whole word
      if (w.length > term.length + 1 && dist(term, w.slice(0, term.length), max) <= max) return true;  // still typing
    }
    return false;
  }
  function esc2(t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function rx(t) { return { start: new RegExp('(^|[^a-z0-9])' + esc2(t)), whole: new RegExp('(^|[^a-z0-9])' + esc2(t) + '($|[^a-z0-9])') }; }

  function search(q) {
    var raw = q.toLowerCase().trim();
    var shown = raw.split(/\s+/).filter(Boolean);
    PHRASE.forEach(function (p) { raw = raw.replace(p[0], p[1]); });
    var terms = raw.split(/\s+/).filter(Boolean);
    if (!terms.length || !index) return { terms: shown, list: [] };
    var R = terms.map(function (t) { return { o: rx(t), a: (SYN[t.replace(/[^a-z0-9-]/g, '')] || []).map(rx) }; });
    var list = [];
    index.forEach(function (it) {
      var title = it.title.toLowerCase(), sub = (it.sub || '').toLowerCase(), k = (it.k || '').toLowerCase();
      var score = 0;
      for (var i = 0; i < terms.length; i++) {
        var o = R[i].o, s = 0;
        if (o.whole.test(title)) s = 10; else if (o.start.test(title)) s = 5;
        if (s && title.indexOf(terms[i]) === 0) s += 1;
        if (!s) { if (o.whole.test(k)) s = 9; else if (o.start.test(k)) s = 3; else if (o.start.test(sub)) s = 1; }
        var altT = R[i].a.some(function (a) { return a.start.test(title); }), altK = R[i].a.some(function (a) { return a.start.test(k); });
        if (s) s += altT ? 3 : 0;
        else if (altT) s = 5; else if (altK) s = 3; else if (R[i].a.some(function (a) { return a.start.test(sub); })) s = 1;
        if (!s && terms[i].length >= 5) {
          if (!it._tw) { it._tw = wordsOf(it.title); it._kw = wordsOf(it.k || ''); }
          if (fuzzyIn(terms[i], it._tw)) s = 4; else if (fuzzyIn(terms[i], it._kw)) s = 2;
        }
        if (!s) return;
        score += s;
      }
      if (it.t === 'score' || it.t === 'bug') score += 1;
      list.push({ it: it, s: score });
    });
    list.sort(function (a, b) { return b.s - a.s || a.it.title.localeCompare(b.it.title); });
    return { terms: shown, list: list.slice(0, 12).map(function (x) { return x.it; }) };
  }

  // Recently opened results (this device only)
  var RKEY = 'mc-recent';
  function recent() { try { return JSON.parse(localStorage.getItem(RKEY) || '[]') || []; } catch (e) { return []; } }
  function remember(it) {
    if (!it) return;
    var r = recent().filter(function (x) { return x.url !== it.url; });
    r.unshift({ t: it.t, title: it.title, url: it.url, sub: it.sub || '', ext: !!it.ext });
    try { localStorage.setItem(RKEY, JSON.stringify(r.slice(0, 6))); } catch (e) {}
  }
  function item(it, i, terms) {
    return '<a class="ss-item" role="option" id="ss-opt-' + i + '" data-i="' + i + '" href="' + esc(href(it.url)) + '"' +
      (it.ext ? ' target="_blank" rel="noopener"' : '') + '>' +
      '<span class="ss-type ' + it.t + '">' + LABEL[it.t] + '</span>' +
      '<span class="ss-main"><b>' + mark(it.title, terms) + (it.ext ? ' <span class="ext" aria-hidden="true">↗</span>' : '') +
      '</b><small>' + esc(it.sub) + '</small></span></a>';
  }
  function showRecent() {
    var r = recent();
    if (!r.length) { close(); return; }
    results = r; active = -1;
    box.innerHTML = '<p class="ss-head">Recently opened <button type="button" class="ss-clear" data-clear-recent>Clear</button></p>' + r.map(function (it, i) { return item(it, i, []); }).join('');
    box.hidden = false; input.setAttribute('aria-expanded', 'true'); highlight();
  }

  function render() {
    var r = search(input.value);
    results = r.list;
    active = results.length ? 0 : -1;
    if (!input.value.trim()) { showRecent(); return; }
    if (!results.length) {
      box.innerHTML = '<p class="ss-none">No results for “' + esc(input.value.trim()) + '”. Try a shorter word or another name.</p>';
    } else {
      box.innerHTML = results.map(function (it, i) { return item(it, i, r.terms); }).join('');
    }
    box.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    highlight();
  }

  function highlight() {
    var items = box.querySelectorAll('.ss-item');
    items.forEach(function (el, i) { el.classList.toggle('active', i === active); });
    if (items[active]) {
      input.setAttribute('aria-activedescendant', items[active].id);
      items[active].scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }

  function close() {
    box.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  }

  input.addEventListener('focus', function () { load().then(function () { if (input.value.trim()) render(); else showRecent(); }); });
  input.addEventListener('input', function () { load().then(render); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' && results.length) { e.preventDefault(); active = (active + 1) % results.length; highlight(); }
    else if (e.key === 'ArrowUp' && results.length) { e.preventDefault(); active = (active - 1 + results.length) % results.length; highlight(); }
    else if (e.key === 'Enter') {
      var el = box.querySelectorAll('.ss-item')[active];
      if (el) { e.preventDefault(); el.click(); close(); input.blur(); }
    } else if (e.key === 'Escape') {
      if (input.value) { input.value = ''; close(); } else { input.blur(); }
    }
  });
  box.addEventListener('click', function (e) {
    if (e.target.closest('[data-clear-recent]')) { e.preventDefault(); try { localStorage.removeItem(RKEY); } catch (err) {} close(); input.focus(); return; }
    var a = e.target.closest('.ss-item');
    if (a) { remember(results[+a.getAttribute('data-i')]); close(); input.value = ''; }
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.site-search')) close();
  });

  // "/" jumps to the search box from anywhere
  document.addEventListener('keydown', function (e) {
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(tag)) { e.preventDefault(); input.focus(); }
  });
})();
