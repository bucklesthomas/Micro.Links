/* Streptococcal species → risk of infective endocarditis (IE) in streptococcal bacteraemia.
   D25: Deas G, Lee TC, Colston J, Albur M, Vasant J, Nobbs AH, Williams P, Hamilton F. Streptococcal endocarditis: a meta-analysis
        of species dependant risk. eClinicalMedicine 2025;87:103425 (4 studies, 14,183 isolates, 1,028 IE cases; pooled IE risk per species).
   CH20: Chamat-Hedemand S et al. Prevalence of infective endocarditis in streptococcal bloodstream infections is dependent on
        streptococcal species. Circulation 2020;142:720–30 (Capital Region of Denmark, 2008–2017).
   CH21: Chamat-Hedemand S et al. Proposal for the use of echocardiography in bloodstream infections due to different streptococcal
        species. BMC Infect Dis 2021;21:689 (risk groups and echocardiography flowchart; 6,393 patients, 451 with IE). */
(function () {
  var host = document.getElementById('strepie');
  if (!host) return;

  var SRC = {
    D25: 'Deas et al. meta-analysis (eClinicalMedicine 2025)',
    CH20: 'Chamat-Hedemand et al. (Circulation 2020), Danish registry',
    CH21: 'Chamat-Hedemand et al. (BMC Infect Dis 2021), risk group only'
  };
  // Risk groups (CH21): crude IE prevalence low <3%, moderate 3–10%, high 10–30%, very high >30%. Group-pooled prevalence from CH21 table 2.
  var GROUP = {
    low: { name: 'Low risk', range: 'under 3%', pooled: '1.3% (95% CI 0.9–1.7)', tone: 'green' },
    mod: { name: 'Moderate risk', range: '3–10%', pooled: '6.5% (95% CI 5.4–7.6)', tone: 'amber' },
    high: { name: 'High risk', range: '10–30%', pooled: '17.1% (95% CI 14.0–20.5)', tone: 'red' },
    vhigh: { name: 'Very high risk', range: 'over 30%', pooled: '35.7% (95% CI 31.5–40.1)', tone: 'red' }
  };
  var SP = [
    { id: 'mutans', n: 'S. mutans', p: 47, lo: 38, hi: 56, g: 'vhigh', src: 'D25', al: 'mutans group', note: 'One of the "small five" (S. mutans, S. cristatus, S. gordonii, S. sanguinis, S. gallolyticus): together about 8% of streptococcal bacteraemias but nearly 40% of streptococcal IE.' },
    { id: 'cristatus', n: 'S. cristatus', p: 41, lo: 21, hi: 62, g: 'vhigh', src: 'D25', al: 'cristatus', note: 'Wide confidence interval: few bacteraemias in the pooled studies.' },
    { id: 'gordonii', n: 'S. gordonii', p: 37, lo: 30, hi: 44, g: 'vhigh', src: 'D25', al: 'gordonii' },
    { id: 'sanguinis', n: 'S. sanguinis', p: 33, lo: 28, hi: 39, g: 'vhigh', src: 'D25', al: 'sanguis sanguinis' },
    { id: 'gallolyticus', n: 'S. gallolyticus (S. bovis group)', p: 31, lo: 27, hi: 36, g: 'vhigh', src: 'D25', al: 'bovis gallolyticus sbg pasteurianus infantarius lutetiensis', note: 'Marked heterogeneity between studies (I² 90%). The pooled figure does not separate subspecies: report the subspecies if the lab gives one. Also look for colorectal neoplasia (colonoscopy).' },
    { id: 'mitis', n: 'S. mitis / S. oralis (mitis group)', p: 12, lo: 11, hi: 13, g: 'high', src: 'D25', al: 'mitis oralis mitis group mitis/oralis infantis', note: 'The commonest single cause of streptococcal IE (about a quarter of cases) because it is common in blood cultures. Marked heterogeneity between studies (I² 87%): risk may differ by species or subspecies.' },
    { id: 'parasanguinis', n: 'S. parasanguinis', g: 'high', src: 'CH21', al: 'parasanguis parasanguinis' },
    { id: 'granulicatella', n: 'Granulicatella adiacens', g: 'high', src: 'CH21', al: 'granulicatella adiacens nutritionally variant streptococci nvs abiotrophia', note: 'Nutritionally variant streptococcus. Abiotrophia is not covered by these sources.' },
    { id: 'agalactiae', n: 'S. agalactiae (group B)', p: 9.1, lo: 6.6, hi: 12.1, g: 'mod', src: 'CH20', al: 'agalactiae group b gbs' },
    { id: 'salivarius', n: 'S. salivarius', p: 5.8, lo: 2.9, hi: 10.1, g: 'mod', src: 'CH20', al: 'salivarius vestibularis salivarius group' },
    { id: 'anginosus', n: 'S. anginosus', p: 4.8, lo: 3.0, hi: 7.3, g: 'mod', src: 'CH20', al: 'anginosus milleri anginosus group sag', note: 'Anginosus group bacteraemia more often comes from an abscess: image for a source.' },
    { id: 'constellatus', n: 'S. constellatus', g: 'mod', src: 'CH21', al: 'constellatus milleri anginosus group sag' },
    { id: 'dysgalactiae', n: 'S. dysgalactiae (groups C and G)', g: 'mod', src: 'CH21', al: 'dysgalactiae equisimilis group c group g sdse gcs ggs' },
    { id: 'thermophilus', n: 'S. thermophilus', g: 'mod', src: 'CH21', al: 'thermophilus' },
    { id: 'intermedius', n: 'S. intermedius', g: 'low', src: 'CH21', al: 'intermedius milleri anginosus group sag', note: 'Anginosus group bacteraemia more often comes from an abscess (brain, liver, lung): image for a source.' },
    { id: 'pyogenes', n: 'S. pyogenes (group A)', p: 1.9, lo: 0.9, hi: 3.3, g: 'low', src: 'CH20', al: 'pyogenes group a gas igas' },
    { id: 'pneumoniae', n: 'S. pneumoniae', p: 1.2, lo: 0.8, hi: 1.6, g: 'low', src: 'CH20', al: 'pneumoniae pneumococcus pneumococcal pneumo' },
    { id: 'nos', n: 'Streptococcus, species not identified', p: 7.25, g: 'mod', src: 'D25', al: 'viridans vgs streptococcus nos unknown unidentified not identified all', note: 'Average across all streptococcal bacteraemias in the meta-analysis (1,028 IE in 14,183 isolates). Ask the lab for a species identification (MALDI-TOF): the risk ranges from about 1% to about 50%.' }
  ];
  var st = { sp: null, q: '', bottles: null, rf: null };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function norm(s) { return String(s).toLowerCase().replace(/streptococc(us|i|al)|\bstrep\b|\bs\.\s*|\bspp?\b\.?/g, ' ').replace(/[^a-z\/ ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  function pct(sp) { return sp.p != null ? (String(sp.p).replace(/\.0$/, '') + '%') : GROUP[sp.g].range; }
  function ci(sp) { return sp.lo != null ? '95% CI ' + sp.lo + '–' + sp.hi + '%' : ''; }
  function find(q) {
    var n = norm(q);
    if (!n) return SP;
    var words = n.split(' ');
    var hit = SP.filter(function (sp) {
      var hay = norm(sp.n) + ' ' + sp.al;
      return words.every(function (w) { return hay.split(/[ \/]/).some(function (t) { return t.indexOf(w) === 0; }); });
    });
    // Exact alias phrase (e.g. "group b") first
    var exact = hit.filter(function (sp) { return (' ' + sp.al + ' ').indexOf(' ' + n + ' ') >= 0; });
    return exact.concat(hit.filter(function (sp) { return exact.indexOf(sp) < 0; }));
  }

  // Echocardiography flowchart (CH21). rf = native valve disease, prosthetic valve, previous IE or cardiac device.
  function echo(g, b3, rf) {
    if (g === 'vhigh') return { what: 'TTE and TOE', why: 'Very high-risk species: echocardiography whatever the number of bottles or risk factors (IE in 35.7% of this group).' };
    if (b3 == null || rf == null) return null;
    if (g === 'high') {
      if (b3) return { what: 'TTE and TOE', why: 'High-risk species with 3 or more positive bottles (IE in 48.4%).' };
      if (rf) return { what: 'TTE and TOE', why: 'High-risk species, fewer than 3 positive bottles, with a cardiac risk factor (IE in 14.0%).' };
      return { what: 'TTE', why: 'High-risk species, fewer than 3 positive bottles, no cardiac risk factor (IE in 3.6%).' };
    }
    if (g === 'mod') {
      if (b3 && rf) return { what: 'TTE and TOE', why: 'Moderate-risk species with 3 or more positive bottles and a cardiac risk factor (IE in 31.1%).' };
      if (b3) return { what: 'TTE', why: 'Moderate-risk species with 3 or more positive bottles, no cardiac risk factor (IE in 9.6%).' };
      if (rf) return { what: 'TTE', why: 'Moderate-risk species, fewer than 3 positive bottles, with a cardiac risk factor (IE in 8.7%).' };
      return { what: 'Wait and see', why: 'Moderate-risk species, fewer than 3 positive bottles, no cardiac risk factor (IE in 1.5%).' };
    }
    if (b3 && rf) return { what: 'TTE', why: 'Low-risk species, but 3 or more positive bottles and a cardiac risk factor.' };
    return { what: 'Wait and see', why: 'Low-risk species without both 3 or more positive bottles and a cardiac risk factor.' };
  }

  function yn(key, label, help) {
    var v = st[key];
    return '<div class="ab-sec"><h4>' + esc(label) + '</h4>' + (help ? '<p class="ab-note">' + esc(help) + '</p>' : '') +
      '<div class="ab-aw"><button type="button" class="sp-chip' + (v === true ? ' on' : '') + '" data-yn="' + key + '" data-v="1">Yes</button>' +
      '<button type="button" class="sp-chip' + (v === false ? ' on' : '') + '" data-yn="' + key + '" data-v="0">No</button></div></div>';
  }

  function chips() {
    var list = find(st.q);
    if (!list.length) return '<p class="ab-note">No match. Try the species name without "Streptococcus", e.g. "mitis" or "bovis". If it is not listed, these papers have no figure for it.</p>';
    return list.map(function (sp) {
      return '<button type="button" class="sp-chip si-chip' + (st.sp === sp.id ? ' on' : '') + '" data-sp="' + sp.id + '"><span>' + esc(sp.n) + '</span><small class="si-pill t-' + GROUP[sp.g].tone + '">' + esc(pct(sp)) + '</small></button>';
    }).join('');
  }

  function result() {
    var sp = null;
    SP.forEach(function (x) { if (x.id === st.sp) sp = x; });
    if (!sp) return '<p class="ab-note">Type or pick a species to see the risk of endocarditis.</p>';
    var G = GROUP[sp.g], h = '', text = [];
    h += '<div class="vc-big ' + G.tone + '"><span>Risk of IE</span><b>' + esc(pct(sp)) + '</b><small>' + (sp.p != null ? esc(ci(sp)) + (ci(sp) ? ' · ' : '') : 'no species figure · ') + esc(G.name) + ' (' + esc(G.range) + ')</small></div>';
    h += '<table class="ab-tbl vc-tbl"><tr><th>Species</th><td>' + esc(sp.n) + '</td></tr>' +
      '<tr><th>Estimated risk of IE in bacteraemia</th><td>' + (sp.p != null ? esc(pct(sp)) + (ci(sp) ? ' (' + esc(ci(sp)) + ')' : '') : 'Not given for this species. Risk group pooled: ' + esc(G.pooled)) + '</td></tr>' +
      '<tr><th>Risk group</th><td>' + esc(G.name) + ', ' + esc(G.range) + '</td></tr>' +
      '<tr><th>Source</th><td>' + esc(SRC[sp.src]) + '</td></tr></table>';
    if (sp.note) h += '<p class="ab-note si-note">' + esc(sp.note) + '</p>';
    h += '<h4 class="vc-h">Echocardiography</h4>';
    if (sp.g !== 'vhigh') {
      h += yn('bottles', '3 or more positive blood culture bottles?') +
        yn('rf', 'Cardiac risk factor?', 'Native valve disease, prosthetic valve, previous endocarditis or a cardiac device.');
    }
    var e = echo(sp.g, st.bottles, st.rf);
    if (e) h += '<div class="si-echo"><b>' + esc(e.what) + '</b><span>' + esc(e.why) + '</span></div>';
    else h += '<p class="ab-note">Answer both questions for the suggested echocardiography.</p>';
    h += '<p class="ab-note">Echocardiogram regardless of this result if the bacteraemia persists or recurs, there are signs of metastatic infection or emboli, or acute heart failure. The flowchart supplements clinical assessment and Duke-ISCVID criteria, and has not been validated prospectively.</p>';

    text.push(sp.n + ' bacteraemia.');
    text.push('Estimated risk of infective endocarditis: ' + (sp.p != null ? pct(sp) + (ci(sp) ? ' (' + ci(sp) + ')' : '') : 'no species-specific figure; ' + G.name.toLowerCase() + ' group, pooled ' + G.pooled) + '. ' + G.name + ' (' + G.range + '). Source: ' + SRC[sp.src] + '.');
    if (e) text.push('Echocardiography (Chamat-Hedemand 2021 flowchart' + (sp.g !== 'vhigh' ? '; 3 or more positive bottles: ' + (st.bottles ? 'yes' : 'no') + '; cardiac risk factor: ' + (st.rf ? 'yes' : 'no') : '') + '): ' + e.what + '.');
    text.push('Echo regardless if persistent bacteraemia, metastatic infection or heart failure.');
    h += '<div class="ie-actions"><button type="button" class="reset" data-copy>Copy for Epic</button></div>';
    return { html: h, text: text.join('\n') };
  }

  function table() {
    var rows = SP.filter(function (s) { return s.id !== 'nos'; }).map(function (sp) {
      var G = GROUP[sp.g], w = sp.p != null ? sp.p : null;
      return '<tr><th>' + esc(sp.n) + '</th><td><span class="si-bar"><i class="t-' + G.tone + '" style="width:' + (w != null ? Math.max(2, w * 2) : 0) + '%"></i></span>' +
        '<b>' + esc(pct(sp)) + '</b>' + (sp.lo != null ? ' <small>' + sp.lo + '–' + sp.hi + '</small>' : '') + '</td><td>' + esc(G.name.replace(' risk', '')) + '</td><td class="cov-why">' + esc(sp.src === 'D25' ? 'Deas 2025' : sp.src === 'CH20' ? 'Chamat-Hedemand 2020' : 'Chamat-Hedemand 2021 (group)') + '</td></tr>';
    }).join('');
    return '<div class="sp-scroll"><table class="cov-tbl si-tbl"><thead><tr><th>Species</th><th>Risk of IE (95% CI)</th><th>Group</th><th>Source</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function draw(keepFocus) {
    var r = result();
    var out = host.querySelector('#si-out'), list = host.querySelector('#si-list');
    list.innerHTML = chips();
    out.innerHTML = typeof r === 'string' ? r : r.html;
    out.setAttribute('data-text', typeof r === 'string' ? '' : r.text);
  }

  function copy(btn) {
    var text = host.querySelector('#si-out').getAttribute('data-text') || '';
    function done(ok) { var o = btn.textContent; btn.textContent = ok ? 'Copied' : 'Select and copy below'; setTimeout(function () { btn.textContent = o; }, 1800); }
    function fallback() { var ta = document.createElement('textarea'); ta.value = text; ta.className = 'mc-copy-box'; btn.parentNode.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} if (ok) ta.parentNode.removeChild(ta); done(ok); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback); else fallback();
  }

  host.innerHTML = '<label class="si-q-lab" for="si-q">Streptococcal species</label>' +
    '<input id="si-q" type="search" placeholder="e.g. mitis, bovis, gordonii, group B" autocomplete="off" spellcheck="false">' +
    '<div id="si-list" class="cov-chips si-list"></div><div id="si-out" class="bp-result" aria-live="polite"></div>' +
    '<details class="si-all"><summary>All species, ranked</summary>' + table() + '</details>';

  host.addEventListener('input', function (e) {
    if (e.target.id !== 'si-q') return;
    st.q = e.target.value;
    var m = find(st.q);
    if (st.q && m.length === 1 && st.sp !== m[0].id) { st.sp = m[0].id; st.bottles = st.rf = null; }
    draw();
  });
  host.addEventListener('keydown', function (e) {
    if (e.target.id === 'si-q' && e.key === 'Enter') { var m = find(st.q); if (m.length) { st.sp = m[0].id; st.bottles = st.rf = null; draw(); } e.preventDefault(); }
  });
  host.addEventListener('click', function (e) {
    var s = e.target.closest('[data-sp]');
    if (s) { var id = s.getAttribute('data-sp'); if (id !== st.sp) { st.sp = id; st.bottles = st.rf = null; } draw(); return; }
    var y = e.target.closest('[data-yn]');
    if (y) { st[y.getAttribute('data-yn')] = y.getAttribute('data-v') === '1'; draw(); return; }
    var c = e.target.closest('[data-copy]');
    if (c) copy(c);
  });
  draw();
  window.STREP_IE = { SP: SP, find: find, echo: echo };
})();
