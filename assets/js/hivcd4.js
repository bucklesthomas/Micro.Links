/* HIV: drag the CD4 count to see which opportunistic infections become possible, with prophylaxis and screening by CD4 (BHIVA). */
(function () {
  var host = document.getElementById('cd4');
  if (!host) return;
  var st = { cd4: '150', pct: '', toxo: 'unknown', vl: 'no', area: 'none', oi: null };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function chips(name, opts) {
    return '<div class="cov-chips">' + opts.map(function (o) { return '<button type="button" class="sp-chip' + (st[name] === o[0] ? ' on' : '') + '" data-f="' + name + '" data-v="' + o[0] + '" aria-pressed="' + (st[name] === o[0]) + '">' + esc(o[1]) + '</button>'; }).join('') + '</div>';
  }
  function advice() {
    var c = parseFloat(st.cd4), p = parseFloat(st.pct);
    if (isNaN(c)) return '<p class="ir-empty">Enter the CD4 count.</p>';
    var out = [];
    var low = c < 200 || (!isNaN(p) && p < 14);
    if (low) out.push(['red', 'PCP prophylaxis', 'Co-trimoxazole 480 mg or 960 mg once daily (or 960 mg three times a week). Alternatives if intolerant: dapsone, atovaquone, or nebulised pentamidine.' + (st.toxo === 'pos' ? ' This also covers toxoplasmosis.' : '')]);
    else if (c < 250) out.push(['amber', 'PCP prophylaxis: consider', 'CD4 200–250: give co-trimoxazole if ART is being delayed or 3-monthly CD4 monitoring is not possible.']);
    if (c < 200 && st.toxo === 'pos') out.push(['red', 'Toxoplasma prophylaxis', 'Toxoplasma IgG positive with CD4 < 200: co-trimoxazole 480–960 mg daily (nebulised pentamidine alone does not protect).']);
    if (c < 200 && st.toxo === 'unknown') out.push(['amber', 'Check Toxoplasma IgG', 'Needed to decide on toxoplasmosis prophylaxis.']);
    if (c < 200) out.push([c < 100 ? 'red' : 'amber', 'Cryptococcal antigen', c < 100 ? 'Screen serum CrAg (WHO). If positive, do an LP; if no CNS disease, pre-emptive fluconazole.' : 'Check serum CrAg if any symptoms (headache, fever, confusion); WHO suggests screening up to CD4 < 200.']);
    if (c < 50) out.push(['red', 'CMV retinitis', 'Dilated fundoscopy by ophthalmology. Ask about floaters and visual loss.']);
    if (c < 50) out.push(['green', 'MAC', 'Primary prophylaxis is not needed if ART is started promptly. Send mycobacterial blood cultures if febrile.']);
    if (c < 100 && st.area !== 'none') out.push(['amber', 'Endemic fungi', st.area === 'asia' ? 'Lived in or travelled to South-East Asia: consider Talaromyces marneffei (blood cultures, antigen where available) if unwell.' : 'Lived in or travelled to the Americas or Africa: consider histoplasmosis (urine and serum antigen) if unwell.']);
    out.push(['green', 'TB', 'Screen everyone for active TB symptoms; test for latent TB according to BHIVA risk criteria (country of origin, CD4, TB contact).']);
    out.push(['green', 'ART', 'Start as soon as possible (same day to within 2 weeks), including after most opportunistic infections. Exceptions: cryptococcal meningitis (4–6 weeks) and TB meningitis (delayed).']);
    if (low && st.vl === 'yes') out.push(['green', 'Stopping prophylaxis', 'Stop PCP prophylaxis when CD4 > 200 for 3 months on ART, or CD4 100–200 with an undetectable viral load for 3–6 months.']);
    return '<div class="cd4-list">' + out.map(function (o) { return '<div class="cd4-item ' + o[0] + '"><b>' + esc(o[1]) + '</b><span>' + esc(o[2]) + '</span></div>'; }).join('') + '</div>';
  }
  // Opportunistic infections and the CD4 count below which they usually occur (1000 = any CD4)
  var dz = (host.getAttribute('data-dz') || ''), base = (host.getAttribute('data-base') || '');
  var hashMode = host.hasAttribute('data-hash');
  function url(u) { if (u.charAt(0) !== '/') return u; if (hashMode) { var m = /^\/([^/]+)\/(#.*)?$/.exec(u); return m ? (m[2] || '#' + m[1]) : u; } return base + u; }
  var OI = [
    ['Bacterial pneumonia', 1000, '', 'Mainly pneumococcal. Risk rises as CD4 falls; two episodes in a year is AIDS-defining.', 'Chest X-ray, blood cultures, pneumococcal urinary antigen.', 'As community-acquired pneumonia.', ['Pneumonia', '/diseases/#dz-cap']],
    ['Tuberculosis', 1000, '', 'At any CD4. At low counts it is more often extrapulmonary or disseminated, with an atypical chest X-ray and negative smears.', 'Sputum ×3 for smear, culture and rapid molecular test; urine LAM if CD4 is low; HIV team and TB team together.', 'Standard 4-drug treatment; check rifamycin interactions with ART.', ['TB guide', '/tb/']],
    ['Herpes zoster', 1000, '', 'More common at any CD4; recurrent, multidermatomal or disseminated when the count is low.', 'Clinical; VZV PCR from a vesicle swab.', 'Aciclovir or valaciclovir; IV aciclovir if disseminated.', ['Shingles', '/diseases/#dz-shingles']],
    ['Kaposi sarcoma', 1000, '', 'HHV-8. Purple skin, mouth, gut or lung lesions; more frequent and aggressive at low CD4.', 'Biopsy.', 'ART, with chemotherapy for advanced disease (oncology).', null],
    ['Oral candidiasis', 300, '', 'White plaques that scrape off; usually below about 300.', 'Clinical.', 'Fluconazole or topical treatment.', null],
    ['Pneumocystis pneumonia (PCP)', 200, '', 'Subacute dry cough and breathlessness, desaturation on exertion, often a near-normal chest X-ray early.', 'Induced sputum or bronchoalveolar lavage for Pneumocystis PCR; serum β-D-glucan.', 'High-dose co-trimoxazole for 21 days, with steroids if pO₂ under 9.3 kPa.', ['PCP', '/diseases/#dz-pjp']],
    ['Progressive multifocal leukoencephalopathy', 200, '', 'JC virus. Progressive focal deficits over weeks; white-matter lesions without mass effect. Mostly below 100.', 'MRI; CSF JC virus PCR.', 'No specific treatment: start or optimise ART.', null],
    ['Histoplasmosis (disseminated)', 150, 'travel', 'After living in or visiting the Americas or Africa. Fever, weight loss, pancytopenia, hepatosplenomegaly.', 'Urine and serum Histoplasma antigen; blood cultures; biopsy.', 'Liposomal amphotericin B then itraconazole (specialist).', null],
    ['Oesophageal candidiasis', 100, '', 'Pain on swallowing, usually with oral thrush. AIDS-defining.', 'Clinical; endoscopy if no response.', 'Fluconazole 200–400 mg daily for 14–21 days.', null],
    ['Cryptococcal meningitis', 100, '', 'Headache and fever over days to weeks; neck stiffness often absent; raised intracranial pressure.', 'Serum and CSF cryptococcal antigen; opening pressure at LP.', 'Induction with amphotericin B and flucytosine; delay ART by 4–6 weeks.', ['Cryptococcus guide', '/cryptococcus/']],
    ['Toxoplasma encephalitis', 100, 'toxo', 'Headache, confusion, fever, focal signs or seizures; multiple ring-enhancing lesions. Needs a positive Toxoplasma IgG.', 'MRI; Toxoplasma IgG. A response to treatment in 10–14 days supports the diagnosis.', 'Pyrimethamine, sulfadiazine and folinic acid for at least 6 weeks.', ['Treatment guide below', '#oi-treatment']],
    ['Cryptosporidiosis (chronic)', 100, '', 'Chronic watery diarrhoea and weight loss.', 'Stool PCR.', 'ART restores immunity; supportive care.', null],
    ['Talaromycosis', 100, 'travel', 'After living in or visiting South-East Asia. Fever, weight loss and umbilicated skin papules.', 'Blood cultures; skin or marrow samples; antigen where available.', 'Amphotericin B then itraconazole (specialist).', null],
    ['Chronic or severe herpes simplex', 100, '', 'Non-healing anogenital or oral ulcers lasting over a month.', 'HSV PCR from the ulcer.', 'Aciclovir or valaciclovir; test for resistance if not healing.', null],
    ['CMV retinitis and colitis', 50, '', 'Floaters or visual loss; colitis or oesophagitis.', 'Dilated fundoscopy by ophthalmology; CMV PCR; biopsy for gut disease.', 'Valganciclovir (or IV ganciclovir); ophthalmology.', null],
    ['Disseminated MAC', 50, '', 'Fever, sweats, weight loss, anaemia, raised ALP, lymphadenopathy.', 'Mycobacterial blood cultures.', 'Clarithromycin (or azithromycin) with ethambutol, with or without rifabutin.', null],
    ['Primary CNS lymphoma', 50, '', 'Focal neurology or confusion; often a single enhancing lesion.', 'MRI; CSF EBV PCR; brain biopsy.', 'ART and oncology.', null]
  ];
  function pos(c) { return Math.sqrt(Math.max(0, Math.min(1000, c)) / 1000) * 100; }
  function fromPos(p) { var c = Math.pow(p / 1000, 2) * 1000; return c < 50 ? Math.round(c) : Math.round(c / 5) * 5; }
  function toPos(c) { return Math.round(pos(c) * 10); }
  var TICKS = [0, 50, 100, 200, 350, 500, 750, 1000];
  var LINES = [[50, 'CMV and MAC'], [100, 'CrAg screen'], [200, 'PCP prophylaxis']];

  function chart() {
    var h = '<div class="cd4x-grid">';
    h += '<div class="cd4x-lab cd4x-head">Drag the CD4 count</div><div class="cd4x-track cd4x-slider"><input type="range" id="cd4-r" min="0" max="1000" step="1" value="' + toPos(+st.cd4 || 0) + '" aria-label="CD4 count" aria-valuetext=""></div>';
    OI.forEach(function (o, i) {
      var any = o[1] >= 1000;
      h += '<button type="button" class="cd4x-row' + (st.oi === i ? ' sel' : '') + '" data-oi="' + i + '"><span class="cd4x-lab">' + esc(o[0]) + (o[2] === 'travel' ? '<small>after travel</small>' : o[2] === 'toxo' ? '<small>if Toxoplasma IgG positive</small>' : '') + '</span>' +
        '<span class="cd4x-track">' + lines() + '<i class="cd4x-bar' + (any ? ' any' : '') + '" style="width:' + pos(o[1]).toFixed(2) + '%"></i>' + (any ? '<em>any CD4</em>' : '<em style="left:' + pos(o[1]).toFixed(2) + '%">&lt;' + o[1] + '</em>') + '</span></button>';
    });
    h += '<div class="cd4x-lab"></div><div class="cd4x-track cd4x-axis">' + '<i class="cd4x-now"></i>' + TICKS.map(function (t) { return '<span' + (t === 50 || t === 100 || t === 200 ? ' class="k"' : t === 350 || t === 750 ? ' class="m"' : t === 1000 ? ' class="e"' : '') + ' style="left:' + pos(t).toFixed(2) + '%">' + t + '</span>'; }).join('') + '</div>';
    h += '</div><p class="ab-note cd4x-key">Dashed lines: <b>50</b> (CMV eye screening; MAC) · <b>100</b> (cryptococcal antigen screening) · <b>200</b> (start or stop PCP prophylaxis). Striped bars need a positive Toxoplasma IgG or travel.</p>';
    return h;
  }
  function lines() { return LINES.map(function (l) { return '<i class="cd4x-thr" style="left:' + pos(l[0]).toFixed(2) + '%"></i>'; }).join('') + '<i class="cd4x-now"></i>'; }
  function thrLabels() { return '<div class="cd4x-lab"></div><div class="cd4x-track cd4x-thrlab">' + LINES.map(function (l) { return '<span style="left:' + pos(l[0]).toFixed(2) + '%">' + esc(l[1]) + '</span>'; }).join('') + '</div>'; }
  function oiDetail() {
    if (st.oi == null) return '<p class="ab-note">Tap an infection for how it presents, how to test and how to treat it.</p>';
    var o = OI[st.oi];
    return '<div class="cd4x-card"><p class="ir-eyebrow">' + (o[1] >= 1000 ? 'At any CD4' : 'Usually CD4 below ' + o[1]) + '</p><h3>' + esc(o[0]) + '</h3><p>' + esc(o[3]) + '</p>' +
      '<dl class="pk-dl"><dt>Tests</dt><dd>' + esc(o[4]) + '</dd><dt>Treat</dt><dd>' + esc(o[5]) + '</dd></dl>' +
      (o[6] ? '<p class="cov-chips"><a class="sp-chip" href="' + esc(o[6][1].charAt(0) === '#' ? o[6][1] : url(o[6][1])) + '">' + esc(o[6][0]) + '</a></p>' : '') + '</div>';
  }
  function update() {
    var c = parseFloat(st.cd4); if (isNaN(c)) c = 0;
    var p = pos(c);
    var g = host.querySelector('.cd4x-grid'); if (g) g.style.setProperty('--now', p + '%');
    var n = 0;
    host.querySelectorAll('.cd4x-row').forEach(function (r) {
      var o = OI[+r.getAttribute('data-oi')];
      var on = c < o[1] || o[1] >= 1000;
      var hide = (o[2] === 'toxo' && st.toxo === 'neg') || (o[2] === 'travel' && st.area === 'none');
      r.classList.toggle('on', on && !hide); r.classList.toggle('cond', on && hide);
      if (on && !hide) n++;
    });
    var out = host.querySelector('#cd4-out'); if (out) out.textContent = isNaN(parseFloat(st.cd4)) ? '–' : String(c);
    var cnt = host.querySelector('#cd4-cnt'); if (cnt) cnt.textContent = n + ' of ' + OI.length + ' infections possible at this count';
    var r = host.querySelector('#cd4-r'); if (r) r.setAttribute('aria-valuetext', c + ' cells per cubic millimetre');
    host.querySelector('#cd4-adv').innerHTML = advice();
  }
  function draw() {
    host.innerHTML = '<section class="card af-card cd4x"><div class="cd4x-top"><div><p class="cd4x-big"><output id="cd4-out"></output><span>cells/mm³</span></p><p class="ab-note" id="cd4-cnt"></p></div>' +
      '<label class="cd4x-num">Type a count<input id="cd4-n" inputmode="numeric" value="' + esc(st.cd4) + '"></label></div>' +
      '<div class="cd4x-wrap">' + chart() + '</div><div id="cd4-oi">' + oiDetail() + '</div></section>' +
      '<div class="cov-layout"><section class="card af-card"><h2>More about the patient</h2>' +
      '<div class="bp-inputs"><label>CD4 % (optional)<input id="cd4-p" inputmode="decimal" value="' + esc(st.pct) + '" placeholder="e.g. 9"></label></div>' +
      '<p class="ir-grp">Toxoplasma IgG</p><div data-chips="toxo">' + chips('toxo', [['pos', 'Positive'], ['neg', 'Negative'], ['unknown', 'Not known']]) + '</div>' +
      '<p class="ir-grp">On ART with undetectable viral load</p><div data-chips="vl">' + chips('vl', [['yes', 'Yes'], ['no', 'No']]) + '</div>' +
      '<p class="ir-grp">Lived in or travelled to</p><div data-chips="area">' + chips('area', [['none', 'Neither'], ['asia', 'South-East Asia'], ['amer', 'The Americas or Africa']]) + '</div>' +
      '</section><section class="card af-card" aria-live="polite"><h2>Prophylaxis and screening</h2><div id="cd4-adv"></div></section></div>';
    update();
  }
  var raf = 0;
  host.addEventListener('input', function (e) {
    var id = e.target.id;
    if (id === 'cd4-r') { st.cd4 = String(fromPos(+e.target.value)); host.querySelector('#cd4-n').value = st.cd4; if (!raf) raf = requestAnimationFrame(function () { raf = 0; update(); }); }
    else if (id === 'cd4-n') { st.cd4 = e.target.value; var c = parseFloat(st.cd4); if (!isNaN(c)) host.querySelector('#cd4-r').value = toPos(c); update(); }
    else if (id === 'cd4-p') { st.pct = e.target.value; update(); }
  });
  host.addEventListener('click', function (e) {
    var b = e.target.closest('[data-f]');
    if (b) { st[b.getAttribute('data-f')] = b.getAttribute('data-v'); var w = b.closest('[data-chips]'); w.innerHTML = chips(w.getAttribute('data-chips'), w.getAttribute('data-chips') === 'toxo' ? [['pos', 'Positive'], ['neg', 'Negative'], ['unknown', 'Not known']] : w.getAttribute('data-chips') === 'vl' ? [['yes', 'Yes'], ['no', 'No']] : [['none', 'Neither'], ['asia', 'South-East Asia'], ['amer', 'The Americas or Africa']]); update(); return; }
    var r = e.target.closest('[data-oi]');
    if (r) { var i = +r.getAttribute('data-oi'); st.oi = st.oi === i ? null : i; host.querySelectorAll('.cd4x-row').forEach(function (x) { x.classList.toggle('sel', +x.getAttribute('data-oi') === st.oi); }); host.querySelector('#cd4-oi').innerHTML = oiDetail(); }
  });
  draw();
})();
