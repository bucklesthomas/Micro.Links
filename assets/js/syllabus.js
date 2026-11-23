/* Exam syllabus tracker (CICE / FRCPath Part 1). Areas follow the Combined Infection Training (CIT) syllabus headings in the
   2021 infection curricula (JRCPTB / RCPath); the topics under each are this site's own study checklist, not official wording.
   Progress is stored only on this device (localStorage). */
(function () {
  var host = document.getElementById('syl');
  if (!host) return;
  var KEY = 'mc-syllabus';
  var A = [
    ['bio', 'Basic biology of bacteria, viruses, fungi and parasites', [
      ['Bacterial structure, Gram stain and classification', '/organisms/'], ['Bacterial genetics and resistance mechanisms (ESBL, AmpC, carbapenemases, MRSA, VRE)', '/intrinsic-resistance/'],
      ['Virus structure, replication and classification'], ['Viral latency and reactivation (herpesviruses, HBV)'], ['Yeasts and moulds: Candida, Aspergillus, Cryptococcus, Mucorales', '/antifungals/'],
      ['Protozoa: Plasmodium life cycle and species', '/malaria/'], ['Helminths: Strongyloides, Schistosoma, tapeworms'], ['Host defences and pathogenesis; toxins'], ['Prions']]],
    ['lab', 'Laboratory practice', [
      ['Specimen collection and transport', '/lab-tests/'], ['Blood culture processing and interpretation', '/blood-culture-triage/'], ['Microscopy, culture and identification (MALDI-TOF)'],
      ['Susceptibility testing and EUCAST breakpoints', '/breakpoints/'], ['Molecular diagnostics: PCR, multiplex panels, 16S, sequencing'], ['Serology and antigen tests (window periods, avidity)', '/syphilis/'],
      ['Fungal biomarkers: galactomannan, beta-D-glucan, CrAg', '/fungal-markers/'], ['Containment levels and laboratory safety (HG3/4, HCID samples)'], ['Quality assurance, accreditation (UKAS ISO 15189) and EQA']]],
    ['abx', 'Antimicrobial agents and stewardship', [
      ['Antibiotic classes, mechanisms and spectrum', '/mechanisms/'], ['Pharmacokinetics and pharmacodynamics; TDM', '/pkpd/'], ['Choosing empirical therapy and coverage', '/coverage/'],
      ['IV-to-oral switch and treatment duration', '/iv-oral-durations/'], ['Antifungals and antivirals', '/antifungals/'], ['Penicillin allergy assessment', '/penicillin-allergy/'],
      ['Prescribing in pregnancy and renal impairment', '/pregnancy/'], ['Stewardship programmes and Start Smart then Focus']]],
    ['ipc', 'Infection prevention and control', [
      ['Standard and transmission-based precautions', '/isolation/'], ['Healthcare-associated infections and surveillance'], ['MRSA, CPE and other multidrug-resistant organisms'],
      ['C. difficile: prevention and outbreaks', '/cdiff/'], ['Outbreak investigation and management'], ['Decontamination, sterilisation and the environment (water, Legionella, Pseudomonas)'],
      ['Occupational exposures and BBV', '/needlestick/'], ['Isolation for HCIDs']]],
    ['ph', 'Public health and vaccination', [
      ['Notifiable diseases and reporting'], ['Contact tracing and post-exposure prophylaxis', '/contact-prophylaxis/'], ['Infectious periods and exclusion', '/infectious-period/'],
      ['Principles of active and passive immunisation; UK schedule'], ['Vaccines in special groups (asplenia, immunosuppression)', '/asplenia/'], ['Food- and waterborne disease; enteric fever', '/exclusion/'],
      ['Travel and migrant health', '/countries/'], ['Epidemiology: rates, bias, study design, screening tests']]],
    ['syn', 'Clinical infection syndromes', [
      ['Sepsis and bloodstream infection', '/gram-negative-bacteraemia/'], ['S. aureus bacteraemia', '/sab/'], ['Infective endocarditis', '/endocarditis/'], ['Meningitis and encephalitis', '/meningitis-encephalitis/'],
      ['Respiratory infection and TB', '/tb/'], ['Urinary and gastrointestinal infection'], ['Hepatobiliary and intra-abdominal infection; SBP', '/sbp/'], ['Bone, joint and prosthetic infection'],
      ['Skin and soft tissue infection, necrotising fasciitis', '/scores/'], ['Sexually transmitted infections and syphilis', '/syphilis/'], ['Fever in the returning traveller', '/returned-traveller/'], ['Eye, ENT and dental infection']]],
    ['host', 'Infection in special hosts', [
      ['Neutropenic sepsis', '/neutropenic-sepsis/'], ['Invasive fungal infection', '/aspergillosis/'], ['HIV and opportunistic infections', '/hiv-oi/'], ['Transplant and biologic therapy', '/immunosuppression-screen/'],
      ['Pregnancy and the neonate', '/pregnancy/'], ['Asplenia', '/asplenia/'], ['Older people and care homes'], ['People who inject drugs']]],
    ['vir', 'Viral infections', [
      ['Hepatitis A, B, C and E'], ['HIV diagnosis and monitoring'], ['Herpesviruses: HSV, VZV, CMV, EBV'], ['Respiratory viruses: influenza, RSV, SARS-CoV-2'], ['Measles, mumps, rubella, parvovirus'],
      ['Viral haemorrhagic fevers and HCIDs', '/returned-traveller/'], ['Arboviruses: dengue, chikungunya, Zika'], ['Rabies', '/rabies/']]],
    ['prof', 'Professional practice', [
      ['Communicating results and giving telephone advice', '/blood-culture-report/'], ['Leading the infection team and MDTs'], ['Audit and quality improvement'], ['Research methods and critical appraisal', '/trials/'],
      ['Teaching'], ['Clinical governance and patient safety']]]
  ];
  var LV = ['Not started', 'Revising', 'Confident'];
  var S = { s: {}, exam: '' };
  try { var raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw && typeof raw === 'object') { S.s = raw.s || {}; S.exam = raw.exam || ''; } } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function base() { return ((document.querySelector('script[data-base]') || { getAttribute: function () { return ''; } }).getAttribute('data-base') || '').replace(/\/$/, ''); }
  function href(u) { return document.getElementById('view-links') ? '#' + u.replace(/^\/|\/$/g, '') : base() + u; }
  function id(a, i) { return a + '-' + i; }
  function stats(list) { var n = 0, c = 0, r = 0; list.forEach(function (x) { n++; var v = S.s[x] || 0; if (v === 2) c++; else if (v === 1) r++; }); return { n: n, c: c, r: r }; }

  function draw() {
    var all = [];
    A.forEach(function (a) { a[2].forEach(function (t, i) { all.push(id(a[0], i)); }); });
    var tot = stats(all), days = null;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(S.exam);
    if (m) { var d = new Date(), t0 = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()); days = Math.round((Date.UTC(+m[1], +m[2] - 1, +m[3]) - t0) / 864e5); }
    var h = '<div class="sy-top"><div class="sy-sum"><b>' + Math.round(100 * tot.c / tot.n) + '%</b><span>confident · ' + tot.c + ' of ' + tot.n + ' topics' + (tot.r ? ', ' + tot.r + ' revising' : '') + '</span>' +
      '<div class="sy-bar"><i class="c" style="width:' + (100 * tot.c / tot.n) + '%"></i><i class="r" style="width:' + (100 * tot.r / tot.n) + '%"></i></div></div>' +
      '<label class="sy-exam">Exam date<input type="date" id="sy-exam" value="' + esc(S.exam) + '">' + (days != null ? '<small>' + (days > 0 ? days + ' days to go' + (tot.n - tot.c > 0 ? ' · about ' + Math.max(1, Math.ceil((tot.n - tot.c) / Math.max(1, Math.ceil(days / 7)))) + ' topics a week' : '') : days === 0 ? 'Today: good luck' : 'Exam date passed') + '</small>' : '') + '</label></div>' +
      '<p class="ab-note">Tap a topic to move it from not started to revising to confident. Saved on this device only.</p>';
    A.forEach(function (a) {
      var ids = a[2].map(function (t, i) { return id(a[0], i); }), s = stats(ids);
      h += '<section class="sy-area"><header><h3>' + esc(a[1]) + '</h3><span class="sy-count">' + s.c + '/' + s.n + '</span></header><div class="sy-bar sm"><i class="c" style="width:' + (100 * s.c / s.n) + '%"></i><i class="r" style="width:' + (100 * s.r / s.n) + '%"></i></div><ul>';
      a[2].forEach(function (t, i) {
        var k = id(a[0], i), v = S.s[k] || 0;
        h += '<li class="sy-t lv' + v + '"><button type="button" data-k="' + k + '" aria-label="' + esc(t[0]) + ': ' + LV[v] + '"><span class="sy-dot" aria-hidden="true"></span><span class="sy-name">' + esc(t[0]) + '</span><span class="sy-lv">' + LV[v] + '</span></button>' +
          (t[1] ? '<a class="sy-go" href="' + esc(href(t[1])) + '" title="Open the page on this site">Page</a>' : '') + '</li>';
      });
      h += '</ul></section>';
    });
    h += '<div class="ie-actions"><button type="button" class="reset" data-reset>Clear my progress</button></div>';
    host.innerHTML = h;
  }
  host.addEventListener('click', function (e) {
    var b = e.target.closest('[data-k]');
    if (b) { var k = b.getAttribute('data-k'); S.s[k] = ((S.s[k] || 0) + 1) % 3; if (!S.s[k]) delete S.s[k]; save(); draw(); var nb = host.querySelector('[data-k="' + k + '"]'); if (nb) nb.focus(); return; }
    if (e.target.closest('[data-reset]')) { var r = e.target.closest('[data-reset]'); if (r.getAttribute('data-sure')) { S.s = {}; save(); draw(); } else { r.setAttribute('data-sure', '1'); r.textContent = 'Tap again to clear'; } }
  });
  host.addEventListener('change', function (e) { if (e.target.id === 'sy-exam') { S.exam = e.target.value; save(); draw(); } });
  draw();
})();
