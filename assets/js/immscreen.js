/* Infection screen before immunosuppression.
   Sources: Green Book chapters 6 (live vaccines and immunosuppression), 7, 25 (PCV20, 2026) and 28a (Shingrix for severely
   immunosuppressed adults from 18, September 2025); EULAR 2022 recommendations for screening and prophylaxis of chronic and
   opportunistic infections in AIIRD (and supporting SLR, Fragoulis et al. RMD Open 2022); EASL 2017 hepatitis B guideline;
   MHRA Drug Safety Update (rituximab: screen all for HBV); UKHSA migrant health guide (Strongyloides); NICE NG33 (TB). */
(function () {
  var host = document.getElementById('imms');
  if (!host) return;
  var T = [
    ['ster', 'High-dose corticosteroids', 'Prednisolone 20 mg or more a day for over 2 weeks, or 40 mg or more for over a week'],
    ['csd', 'Conventional DMARDs or antimetabolites', 'Methotrexate, azathioprine, mycophenolate, ciclosporin, tacrolimus, leflunomide'],
    ['tnf', 'Anti-TNF', 'Infliximab, adalimumab, etanercept, golimumab, certolizumab'],
    ['bio', 'Other biologics', 'Tocilizumab, IL-17 or IL-23 inhibitors, ustekinumab, abatacept, vedolizumab'],
    ['cd20', 'Anti-CD20', 'Rituximab, ocrelizumab, ofatumumab, obinutuzumab'],
    ['jak', 'JAK inhibitor', 'Tofacitinib, baricitinib, upadacitinib, filgotinib'],
    ['cyc', 'Cyclophosphamide or chemotherapy', 'Including cancer chemotherapy'],
    ['alem', 'Alemtuzumab', ''],
    ['comp', 'Complement inhibitor', 'Eculizumab, ravulizumab, other C5 or proximal complement inhibitors'],
    ['s1p', 'S1P modulator or cladribine', 'Fingolimod, siponimod, ozanimod, ponesimod, cladribine'],
    ['nat', 'Natalizumab', ''],
    ['sot', 'Solid organ transplant', 'Before listing or transplant'],
    ['hsct', 'Stem cell transplant', 'Autologous or allogeneic']
  ];
  var P = [
    ['trop', 'Lived in or travelled to the tropics or subtropics', 'Any time, however long ago'],
    ['tbr', 'TB risk factor', 'Born or lived in a high-incidence country, previous TB or TB contact'],
    ['novzv', 'No reliable history of chickenpox or shingles', ''],
    ['nomeas', 'Not known to be measles immune', 'No 2 doses of MMR and no past measles']
  ];
  var st = { t: {}, p: {} };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function any(keys) { return keys.some(function (k) { return st.t[k]; }); }

  function box(group, k, label, sub) {
    var on = st[group][k];
    return '<label class="opt toggle"><input type="checkbox" data-g="' + group + '" data-k="' + k + '"' + (on ? ' checked' : '') + '><span class="tick" aria-hidden="true"></span><span class="opt-text">' + esc(label) + (sub ? '<small class="is-sub">' + esc(sub) + '</small>' : '') + '</span></label>';
  }
  function form() {
    host.innerHTML = '<div class="ab-sec"><h4>Planned treatment (tick all that apply)</h4><div class="is-grid">' + T.map(function (x) { return box('t', x[0], x[1], x[2]); }).join('') + '</div></div>' +
      '<div class="ab-sec"><h4>Patient</h4><div class="is-grid">' + P.map(function (x) { return box('p', x[0], x[1], x[2]); }).join('') + '</div></div>' +
      '<div id="is-out" class="bp-result" aria-live="polite"></div>';
    calc();
  }

  function calc() {
    var out = host.querySelector('#is-out');
    if (!Object.keys(st.t).some(function (k) { return st.t[k]; })) { out.innerHTML = '<p class="ab-note">Tick the planned treatment to build the screen.</p>'; out.removeAttribute('data-text'); return; }
    var tests = [], pre = [], vac = [], during = [];
    var tx = function (k) { return !!st.t[k]; }, pf = function (k) { return !!st.p[k]; };
    var transplant = tx('sot') || tx('hsct');

    // Tests
    tests.push('Hepatitis B: HBsAg, anti-HBc and anti-HBs' + (tx('cd20') ? ' (mandatory before anti-CD20: MHRA)' : ''));
    tests.push('Hepatitis C antibody, and HIV test');
    if (any(['tnf', 'bio', 'jak', 'alem', 'cd20']) || transplant || (tx('ster') && pf('tbr')) || pf('tbr')) tests.push('TB: IGRA (with chest X-ray and symptom review)' + (any(['tnf', 'bio', 'jak']) ? ': required before biologics and JAK inhibitors' : ''));
    if (pf('trop')) tests.push('Strongyloides serology (plus stool microscopy if from sub-Saharan Africa, with schistosoma serology)');
    if (pf('novzv') || any(['s1p', 'alem', 'jak']) || transplant) tests.push('VZV IgG');
    if (pf('nomeas') || transplant) tests.push('Measles IgG');
    if (tx('cd20')) tests.push('Immunoglobulins (IgG, IgA, IgM) as a baseline');
    if (tx('nat')) tests.push('JC virus antibody (index) to estimate PML risk');
    if (tx('alem')) tests.push('Cervical (HPV) screening up to date');
    if (transplant) tests.push('CMV IgG, EBV IgG, syphilis serology' + (tx('hsct') ? ', toxoplasma IgG' : '') + (tx('sot') ? ', toxoplasma IgG (heart transplant)' : ''));

    // Before starting
    pre.push('HBsAg positive: refer to hepatology and start entecavir or tenofovir before treatment.');
    if (tx('cd20') || tx('hsct') || tx('alem')) pre.push('HBsAg negative, anti-HBc positive: high reactivation risk with this treatment. Give antiviral prophylaxis (entecavir or tenofovir) and continue for at least 18 months after the last anti-CD20 dose (12 months for other treatments).');
    else pre.push('HBsAg negative, anti-HBc positive: monitor HBsAg, HBV DNA and ALT every 1–3 months (or prophylaxis if high risk, e.g. long courses of high-dose steroids with other agents). Discuss with hepatology.');
    pre.push('Positive IGRA or other evidence of TB infection: exclude active TB, then treat TB infection (e.g. 3 months rifampicin plus isoniazid) through the TB service, ideally before starting.');
    if (pf('trop')) pre.push('Strongyloides serology positive: treat with ivermectin before starting. If treatment is urgent and results will be late, consider empirical ivermectin.');
    if (tx('comp')) pre.push('Complement inhibitor: MenACWY and MenB at least 2 weeks before the first dose. If treatment cannot wait, give antibiotic prophylaxis until 2 weeks after vaccination; many UK services continue phenoxymethylpenicillin throughout treatment. Give a patient alert card.');

    // Vaccines
    vac.push('Give inactivated vaccines at least 2 weeks before starting where possible (responses are poor after anti-CD20, alemtuzumab and transplant).');
    vac.push('Influenza every autumn, and COVID-19 as per the current programme.');
    vac.push('Pneumococcal: PCV20, one dose; two doses at least 4 weeks apart if severely immunocompromised (e.g. transplant, chemotherapy, anti-CD20, alemtuzumab: Green Book chapter 25).');
    vac.push('Shingles: Shingrix, 2 doses, for severely immunosuppressed adults aged 18 and over (including those about to start), as defined in Green Book chapter 28a.');
    if (tx('comp')) vac.push('MenACWY and MenB (see above), plus PCV20.');
    vac.push('Hepatitis B vaccine if non-immune and at risk (including transplant candidates).');
    if (pf('novzv') || pf('nomeas')) vac.push('Non-immune to varicella or measles: give the live vaccine at least 4 weeks before starting if there is time (varicella vaccine at least 1 month before S1P modulators).');
    vac.push('Live vaccines (MMR, varicella, yellow fever, BCG, live influenza): not during treatment, nor for 3 months after high-dose steroids, 6 months after other immunosuppressants, or 12 months after biologics, unless a specialist advises otherwise.');

    // During treatment
    if (tx('ster') || tx('cyc') || tx('cd20') || transplant || tx('alem')) during.push('PJP prophylaxis: consider co-trimoxazole 480 mg daily or 960 mg three times a week with prednisolone 15–30 mg a day or more for over 2–4 weeks, especially with other immunosuppressants; usual after transplant and with alemtuzumab.');
    if (tx('jak')) during.push('JAK inhibitors carry a higher risk of shingles: Shingrix before starting if eligible.');
    if (tx('alem')) during.push('Alemtuzumab: aciclovir prophylaxis from the first day of each course for at least a month; Listeria dietary advice; yearly HPV screening.');
    if (tx('nat')) during.push('Natalizumab: recheck JC virus antibody every 6 months; any new neurological symptom needs urgent assessment for PML.');
    if (transplant) during.push('CMV prophylaxis or pre-emptive monitoring by donor and recipient serostatus, and antifungal prophylaxis, per the transplant protocol.');
    if (tx('cd20')) during.push('Recurrent infections with low IgG after anti-CD20: consider immunoglobulin replacement (immunology).');
    during.push('Varicella or measles exposure while immunosuppressed: urgent assessment for post-exposure prophylaxis.');

    function ul(a) { return '<ul class="is-list">' + a.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; }
    var chosen = T.filter(function (x) { return st.t[x[0]]; }).map(function (x) { return x[1]; });
    var h = '<h4 class="vc-h">Tests</h4>' + ul(tests) + '<h4 class="vc-h">Act on results before starting</h4>' + ul(pre) +
      '<h4 class="vc-h">Vaccines</h4>' + ul(vac) + (during.length ? '<h4 class="vc-h">During treatment</h4>' + ul(during) : '') +
      '<div class="ie-actions"><button type="button" class="reset" data-copy>Copy for Epic</button></div>';
    var t = ['Infection screen before: ' + chosen.join(', ') + '.', '', 'Tests:'].concat(tests.map(function (x) { return '- ' + x; }), ['', 'Before starting:'], pre.map(function (x) { return '- ' + x; }), ['', 'Vaccines:'], vac.map(function (x) { return '- ' + x; }));
    if (during.length) t = t.concat(['', 'During treatment:'], during.map(function (x) { return '- ' + x; }));
    t.push('', 'From Micro.Links infection screen before immunosuppression; check local protocols.');
    out.innerHTML = h;
    out.setAttribute('data-text', t.join('\n'));
  }

  function copy(btn) {
    var text = host.querySelector('#is-out').getAttribute('data-text') || '';
    function done(ok) { var o = btn.textContent; btn.textContent = ok ? 'Copied' : 'Select and copy below'; setTimeout(function () { btn.textContent = o; }, 1800); }
    function fallback() { var ta = document.createElement('textarea'); ta.value = text; ta.className = 'mc-copy-box'; btn.parentNode.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} if (ok) ta.parentNode.removeChild(ta); done(ok); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback); else fallback();
  }
  host.addEventListener('change', function (e) {
    var g = e.target.getAttribute('data-g');
    if (!g) return;
    st[g][e.target.getAttribute('data-k')] = e.target.checked;
    calc();
  });
  host.addEventListener('click', function (e) { var c = e.target.closest('[data-copy]'); if (c) copy(c); });
  form();
  window.IMM_SCREEN = { st: st, calc: calc };
})();
