/* ID referral call: structured history-taking for telephone referrals, built into a plain-text note for Epic.
   No identifiers are asked for. Entries are kept only in this browser tab (sessionStorage) until cleared or the tab is closed. */
(function () {
  var host = document.getElementById('referral');
  if (!host) return;
  var KEY = 'mc-referral';

  var LABS = [
    ['wcc', 'WCC', 4, 11], ['neut', 'Neut', 2, 7.5], ['lymph', 'Lymph', 1, 4], ['hb', 'Hb', 115, 170], ['plt', 'Plt', 150, 400],
    ['crp', 'CRP', 0, 5], ['pct', 'PCT', 0, 0.5], ['na', 'Na', 133, 146], ['k', 'K', 3.5, 5.3], ['urea', 'Urea', 2.5, 7.8],
    ['creat', 'Creat', 45, 110], ['egfr', 'eGFR', 60, 999], ['bili', 'Bili', 0, 21], ['alt', 'ALT', 0, 40], ['alp', 'ALP', 30, 130],
    ['alb', 'Alb', 35, 50], ['lact', 'Lactate', 0, 2], ['inr', 'INR', 0.8, 1.2]
  ];
  var OBS = [['temp', 'Temp', '°C', 36, 38], ['hr', 'HR', '/min', 50, 100], ['bp', 'BP', 'mmHg'], ['rr', 'RR', '/min', 12, 20], ['sats', 'SpO2', 'e.g. 94% on 2 L'], ['gcs', 'GCS', '', 15, 15], ['news', 'NEWS2', '', 0, 4]];

  var S = [
    { id: 'ref', t: 'Referral', ask: ['Who is calling: grade, team and hospital', 'What exactly is the question?', 'Advice only, or a request for review or transfer?'], f: [
      { id: 'from', k: 'text', l: 'Referrer (role, team, hospital)', ph: 'e.g. Medical registrar, AMU, district general hospital' },
      { id: 'reason', k: 'chips', l: 'Reason', o: ['Antimicrobial advice', 'Positive culture', 'Fever, source unclear', 'Returned traveller', 'Possible HCID', 'Endocarditis', 'Bone or joint infection', 'CNS infection', 'HIV-related', 'TB query', 'Exposure or PEP', 'Review or transfer request', 'OPAT'] },
      { id: 'question', k: 'area', l: 'Specific question' }] },
    { id: 'pt', t: 'Patient', ask: ['Age, sex and weight (no name, date of birth or hospital number)', 'Allergies, and what actually happened'], f: [
      { id: 'age', k: 'num', l: 'Age', u: 'years' }, { id: 'sex', k: 'one', l: 'Sex', o: ['Male', 'Female'] }, { id: 'wt', k: 'num', l: 'Weight', u: 'kg' },
      { id: 'allergy', k: 'chips', l: 'Allergies', o: ['No known drug allergies', 'Penicillin: rash', 'Penicillin: anaphylaxis', 'Other drug allergy'] },
      { id: 'allergyd', k: 'text', l: 'Allergy details' }] },
    { id: 'hpc', t: 'Presenting illness', ask: ['When and how it started', 'Fever pattern and rigors', 'Localising symptoms', 'What has happened since admission'], f: [
      { id: 'onset', k: 'text', l: 'Onset', ph: 'e.g. 5 days, gradual' },
      { id: 'sx', k: 'chips', l: 'Symptoms', o: ['Fever', 'Rigors', 'Night sweats', 'Weight loss', 'Headache', 'Confusion', 'Neck stiffness', 'Seizure', 'Cough', 'Breathlessness', 'Chest pain', 'Abdominal pain', 'Diarrhoea', 'Vomiting', 'Jaundice', 'Urinary symptoms', 'Back pain', 'Joint pain or swelling', 'Rash', 'Skin or wound infection', 'Line site problem', 'New murmur'] },
      { id: 'hpcd', k: 'area', l: 'History of presenting illness' }] },
    { id: 'bg', t: 'Background', ask: ['Immune status and immunosuppressive drugs', 'Implants, devices and lines', 'Admissions, surgery and antibiotics in the last 3 months', 'Known resistant organisms'], f: [
      { id: 'immuno', k: 'chips', l: 'Risk factors', none: 'None', o: ['None', 'HIV', 'Solid organ transplant', 'Stem cell transplant', 'Chemotherapy', 'Neutropenic', 'Steroids', 'Biologics or DMARDs', 'Asplenia', 'Diabetes', 'CKD', 'Dialysis', 'Cirrhosis', 'Pregnant', 'Injecting drug use', 'Alcohol excess'] },
      { id: 'devices', k: 'chips', l: 'Devices and implants', none: 'None', o: ['None', 'Prosthetic valve', 'Pacemaker or ICD', 'Prosthetic joint', 'Vascular graft or stent', 'Central line or PICC', 'Port', 'Urinary catheter', 'CSF shunt or drain', 'Recent surgery'] },
      { id: 'mdro', k: 'chips', l: 'Known resistant organisms', none: 'None known', o: ['None known', 'MRSA', 'ESBL', 'CPE', 'VRE', 'Pseudomonas', 'C. difficile', 'Candida auris'] },
      { id: 'recent', k: 'text', l: 'Recent admissions or antibiotics' },
      { id: 'pmh', k: 'area', l: 'Other relevant history and medicines' }] },
    { id: 'trav', t: 'Travel and exposures', ask: ['Where, when, for how long, rural or urban', 'Malaria prophylaxis and pre-travel vaccines', 'Animals, water, insects, food, sex, sick contacts, work'], f: [
      { id: 'travel', k: 'text', l: 'Travel (where, when returned, how long)', ph: 'e.g. Ghana, returned 9 days ago, 3 weeks visiting family' },
      { id: 'prev', k: 'chips', l: 'Prevention', o: ['No travel', 'Malaria prophylaxis taken', 'No malaria prophylaxis', 'Pre-travel vaccines', 'No pre-travel advice'] },
      { id: 'expo', k: 'chips', l: 'Exposures', o: ['Mosquito bites', 'Tick bites', 'Freshwater', 'Animal bite or scratch', 'Farm animals', 'Unpasteurised dairy', 'Street food or untreated water', 'Sexual contact', 'Sick contacts', 'Healthcare abroad', 'Caves or bats', 'Occupational'] },
      { id: 'expod', k: 'area', l: 'Exposure details' }] },
    { id: 'obs', t: 'Observations', ask: ['Latest set, and the trend', 'Oxygen requirement', 'Conscious level'], f: [{ id: 'obs', k: 'obs' }, { id: 'obsd', k: 'text', l: 'Trend or other' }] },
    { id: 'bloods', t: 'Bloods', ask: ['Latest values, and the date', 'Trend since admission'], f: [{ id: 'labs', k: 'labs' }, { id: 'labsd', k: 'text', l: 'Date, trend or other results', ph: 'e.g. today; CRP 320 → 250 over 48 h' }] },
    { id: 'micro', t: 'Microbiology', ask: ['Blood cultures: sets, result, time to positivity', 'Other samples and results', 'Serology, PCR, malaria tests'], f: [
      { id: 'bc', k: 'text', l: 'Blood cultures', ph: 'e.g. 2/2 sets S. aureus at 14 h; sensitivities pending' },
      { id: 'samples', k: 'area', l: 'Other samples (urine, sputum, CSF, swabs, tissue)' },
      { id: 'viro', k: 'area', l: 'Serology, PCR, malaria tests' }] },
    { id: 'img', t: 'Imaging', ask: ['What was done and when', 'Formal report or provisional'], f: [
      { id: 'imgdone', k: 'chips', l: 'Done (tap to add a line for its findings)', ins: 'imgd', o: ['Chest X-ray', 'CT', 'Ultrasound', 'MRI', 'Echo (TTE)', 'TOE', 'PET-CT'] },
      { id: 'imgd', k: 'area', l: 'Findings', rows: 5 }] },
    { id: 'mx', t: 'Current management', ask: ['Antimicrobials: drug, dose, route, and when started', 'Source control done or planned', 'Response so far'], f: [
      { id: 'abx', k: 'abx' }, { id: 'source', k: 'text', l: 'Source control' }, { id: 'resp', k: 'text', l: 'Response so far' }] },
    { id: 'adv', t: 'Impression and advice', ask: ['Your impression', 'Antimicrobial advice', 'Further tests', 'Follow-up: who calls whom, and when'], f: [
      { id: 'imp', k: 'area', l: 'Impression' }, { id: 'advice', k: 'area', l: 'Advice given' }, { id: 'inv', k: 'area', l: 'Investigations suggested' }, { id: 'fu', k: 'text', l: 'Follow-up' }] }
  ];
  var ABX = ['Amoxicillin', 'Benzylpenicillin', 'Flucloxacillin', 'Co-amoxiclav', 'Piperacillin–tazobactam', 'Temocillin', 'Cefalexin', 'Cefazolin', 'Cefuroxime', 'Ceftriaxone', 'Ceftazidime', 'Ceftazidime–avibactam', 'Meropenem', 'Ertapenem', 'Gentamicin', 'Amikacin', 'Vancomycin', 'Teicoplanin', 'Daptomycin', 'Linezolid', 'Clarithromycin', 'Azithromycin', 'Doxycycline', 'Clindamycin', 'Ciprofloxacin', 'Levofloxacin', 'Co-trimoxazole', 'Metronidazole', 'Nitrofurantoin', 'Rifampicin', 'Aciclovir', 'Fluconazole', 'Micafungin', 'Liposomal amphotericin', 'Artesunate'];

  var st = { v: {}, abx: [] };
  try { var sv = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (sv && sv.v) st = sv; } catch (e) {}
  if (!st.abx) st.abx = [];
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function val(id) { var x = st.v[id]; return x == null ? '' : x; }
  function arr(id) { return Array.isArray(st.v[id]) ? st.v[id] : []; }

  function field(f) {
    var h = '';
    if (f.k === 'text') h = '<label class="rf-f rf-wide"><span>' + esc(f.l) + '</span><input data-v="' + f.id + '" value="' + esc(val(f.id)) + '" placeholder="' + esc(f.ph || '') + '" autocomplete="off"></label>';
    else if (f.k === 'area') h = '<label class="rf-f rf-wide"><span>' + esc(f.l) + '</span><textarea data-v="' + f.id + '" rows="' + (f.rows || 3) + '" placeholder="' + esc(f.ph || '') + '">' + esc(val(f.id)) + '</textarea></label>';
    else if (f.k === 'num') h = '<label class="rf-f rf-num"><span>' + esc(f.l) + '</span><span class="rf-u"><input data-v="' + f.id + '" inputmode="decimal" value="' + esc(val(f.id)) + '" autocomplete="off"><em>' + esc(f.u) + '</em></span></label>';
    else if (f.k === 'chips' || f.k === 'one') {
      var sel = f.k === 'one' ? [val(f.id)] : arr(f.id);
      h = '<div class="rf-f rf-wide"><span>' + esc(f.l) + '</span><div class="ab-aw">' + f.o.map(function (o) {
        var on = sel.indexOf(o) !== -1;
        return '<button type="button" class="sp-chip' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-' + f.k + '="' + f.id + '" data-o="' + esc(o) + '">' + esc(o) + '</button>';
      }).join('') + '</div></div>';
    } else if (f.k === 'obs') {
      h = '<div class="rf-grid">' + OBS.map(function (o) {
        return '<label class="rf-f rf-lab"><span>' + o[1] + '</span><input data-v="o_' + o[0] + '" data-lo="' + (o[3] != null ? o[3] : '') + '" data-hi="' + (o[4] != null ? o[4] : '') + '" ' + (o[0] === 'bp' || o[0] === 'sats' ? '' : 'inputmode="decimal" ') + 'value="' + esc(val('o_' + o[0])) + '" placeholder="' + esc(o[2]) + '" autocomplete="off"></label>';
      }).join('') + '</div>';
    } else if (f.k === 'labs') {
      h = '<div class="rf-grid">' + LABS.map(function (o) {
        return '<label class="rf-f rf-lab"><span>' + o[1] + '</span><input data-v="l_' + o[0] + '" data-lo="' + o[2] + '" data-hi="' + o[3] + '" inputmode="decimal" value="' + esc(val('l_' + o[0])) + '" autocomplete="off"></label>';
      }).join('') + '</div>';
    } else if (f.k === 'abx') {
      h = '<div class="rf-wide rf-abx"><span class="rf-lbl">Antimicrobials</span>' + st.abx.map(function (a, i) {
        return '<div class="rf-abxrow"><input data-abx="' + i + '" data-k="d" list="rf-abxlist" value="' + esc(a.d) + '" placeholder="Drug" autocomplete="off">' +
          '<input data-abx="' + i + '" data-k="dose" value="' + esc(a.dose) + '" placeholder="Dose, route, frequency" autocomplete="off">' +
          '<input data-abx="' + i + '" data-k="start" value="' + esc(a.start) + '" placeholder="Started (e.g. day 3)" autocomplete="off">' +
          '<button type="button" class="reset" data-delabx="' + i + '" aria-label="Remove">Remove</button></div>';
      }).join('') + '<button type="button" class="reset" data-addabx>Add antimicrobial</button>' +
        '<datalist id="rf-abxlist">' + ABX.map(function (a) { return '<option value="' + esc(a) + '">'; }).join('') + '</datalist></div>';
    }
    return h;
  }

  function filled(s) {
    return s.f.some(function (f) {
      if (f.k === 'obs') return OBS.some(function (o) { return val('o_' + o[0]) !== ''; });
      if (f.k === 'labs') return LABS.some(function (o) { return val('l_' + o[0]) !== ''; });
      if (f.k === 'abx') return st.abx.some(function (a) { return a.d; });
      if (f.k === 'chips') return arr(f.id).length > 0;
      return val(f.id) !== '';
    });
  }

  function draw() {
    var h = '<nav class="rf-nav" aria-label="Sections">' + S.map(function (s, i) {
      return '<a href="#rf-' + s.id + '" class="sp-chip' + (filled(s) ? ' done' : '') + '" data-sec="' + s.id + '">' + (i + 1) + '. ' + esc(s.t) + '</a>';
    }).join('') + '</nav>';
    h += '<div class="rf-layout"><div class="rf-form">';
    S.forEach(function (s, i) {
      h += '<section class="card rf-sec" id="rf-' + s.id + '"><h2><span class="rf-n">' + (i + 1) + '</span>' + esc(s.t) + '</h2>' +
        '<p class="rf-ask"><b>Ask about:</b> ' + s.ask.map(esc).join(' · ') + '</p><div class="rf-fields">' + s.f.map(field).join('') + '</div></section>';
    });
    h += '</div><aside class="rf-side"><div class="card rf-prev"><div class="rf-prevhead"><h2>Note preview</h2><span class="rf-count"></span></div>' +
      '<pre class="rf-note" aria-live="off"></pre><p class="rf-warn" hidden></p><div class="ie-actions"><button type="button" class="reset rf-copy" data-copy>Copy for Epic</button>' +
      '<button type="button" class="reset" data-clear>Clear form</button></div>' +
      '<p class="rf-priv">No names, dates of birth or hospital numbers. Entries stay in this browser tab only, and are removed when you clear the form or close the tab.</p></div></aside></div>' +
      '<div class="rf-bar"><a href="#rf-prev" class="reset" data-goprev>Preview</a><button type="button" class="reset rf-copy" data-copy>Copy for Epic</button></div>';
    host.innerHTML = h;
    host.querySelector('.rf-prev').id = 'rf-prev';
    flagAll(); note();
  }

  function flag(inp) {
    var lo = parseFloat(inp.getAttribute('data-lo')), hi = parseFloat(inp.getAttribute('data-hi')), x = parseFloat(String(inp.value).replace(',', '.'));
    inp.classList.remove('lo', 'hi');
    if (isFinite(x) && inp.value.trim() !== '') { if (isFinite(lo) && x < lo) inp.classList.add('lo'); else if (isFinite(hi) && x > hi) inp.classList.add('hi'); }
  }
  function flagAll() { Array.prototype.forEach.call(host.querySelectorAll('[data-lo]'), flag); }

  function stamp() {
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  function build() {
    var L = [], add = function (head, lines) { lines = lines.filter(Boolean); if (lines.length) { L.push(''); L.push(head); lines.forEach(function (x) { L.push(x); }); } };
    var list = function (id) { return arr(id).join(', '); };
    L.push('TELEPHONE INFECTION REFERRAL');
    L.push('Date and time: ' + stamp());
    add('REFERRAL', [val('from') && 'From: ' + val('from'), list('reason') && 'Reason: ' + list('reason'), val('question') && 'Question: ' + val('question')]);
    var pt = [val('age') && val('age') + ' years', val('sex'), val('wt') && val('wt') + ' kg'].filter(Boolean).join(', ');
    var al = [list('allergy'), val('allergyd')].filter(Boolean).join('; ');
    add('PATIENT', [pt, al && 'Allergies: ' + al]);
    add('PRESENTING ILLNESS', [val('onset') && 'Onset: ' + val('onset'), list('sx') && 'Symptoms: ' + list('sx'), val('hpcd')]);
    add('BACKGROUND', [list('immuno') && 'Risk factors: ' + list('immuno'), list('devices') && 'Devices and implants: ' + list('devices'),
      list('mdro') && 'Known resistant organisms: ' + list('mdro'), val('recent') && 'Recent admissions or antibiotics: ' + val('recent'), val('pmh')]);
    add('TRAVEL AND EXPOSURES', [val('travel') && 'Travel: ' + val('travel'), list('prev') && 'Prevention: ' + list('prev'), list('expo') && 'Exposures: ' + list('expo'), val('expod')]);
    var ob = OBS.map(function (o) { var x = val('o_' + o[0]); return x !== '' ? o[1] + ' ' + x + (o[0] === 'temp' ? '°C' : '') : ''; }).filter(Boolean).join(', ');
    add('OBSERVATIONS', [ob, val('obsd')]);
    var lb = LABS.map(function (o) { var x = val('l_' + o[0]); return x !== '' ? o[1] + ' ' + x : ''; }).filter(Boolean).join(', ');
    add('BLOODS', [lb, val('labsd')]);
    add('MICROBIOLOGY', [val('bc') && 'Blood cultures: ' + val('bc'), val('samples'), val('viro')]);
    var notIn = arr('imgdone').filter(function (x) { return String(val('imgd')).indexOf(x) === -1; });
    add('IMAGING', [notIn.length && 'Done: ' + notIn.join(', '), val('imgd')]);
    add('CURRENT MANAGEMENT', st.abx.filter(function (a) { return a.d; }).map(function (a) { return '- ' + [a.d, a.dose, a.start && 'started ' + a.start].filter(Boolean).join(', '); })
      .concat([val('source') && 'Source control: ' + val('source'), val('resp') && 'Response: ' + val('resp')]));
    add('IMPRESSION', [val('imp')]);
    add('ADVICE GIVEN', [val('advice')]);
    add('INVESTIGATIONS SUGGESTED', [val('inv')]);
    add('FOLLOW-UP', [val('fu')]);
    return L.join('\n');
  }
  var ID_RE = /\b\d{3}[ -]?\d{3}[ -]?\d{4}\b|\b(nhs ?(no|number)|mrn|dob|d\.o\.b|date of birth|hospital (no|number)|hosp no)\b/i;
  var armed = false;
  function note() {
    var t = build(), pre = host.querySelector('.rf-note');
    if (pre) pre.textContent = t;
    var n = S.filter(filled).length, c = host.querySelector('.rf-count');
    if (c) c.textContent = n + ' of ' + S.length + ' sections';
    Array.prototype.forEach.call(host.querySelectorAll('.rf-nav [data-sec]'), function (a) {
      var s = S.filter(function (x) { return x.id === a.getAttribute('data-sec'); })[0]; a.classList.toggle('done', filled(s));
    });
    var w = host.querySelector('.rf-warn'), bad = ID_RE.test(t);
    if (w) { w.hidden = !bad; w.textContent = bad ? 'This looks like it may contain an identifier (an NHS or hospital number, or a date of birth). Remove it before copying.' : ''; }
    armed = false;
    Array.prototype.forEach.call(host.querySelectorAll('.rf-copy'), function (b) { b.textContent = 'Copy for Epic'; });
  }

  function copy(btn) {
    var text = build();
    if (ID_RE.test(text) && !armed) { armed = true; btn.textContent = 'Possible identifier: tap again to copy'; return; }
    function done(ok) { btn.textContent = ok ? 'Copied' : 'Select the text in the preview'; setTimeout(function () { btn.textContent = 'Copy for Epic'; }, 1800); armed = false; }
    function fallback() { var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); done(ok); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback); else fallback();
  }

  host.addEventListener('input', function (e) {
    var el = e.target;
    if (el.hasAttribute('data-v')) { st.v[el.getAttribute('data-v')] = el.value; if (el.hasAttribute('data-lo')) flag(el); }
    else if (el.hasAttribute('data-abx')) { st.abx[+el.getAttribute('data-abx')][el.getAttribute('data-k')] = el.value; }
    else return;
    save(); note();
  });
  var clearArmed = false;
  host.addEventListener('click', function (e) {
    var b = e.target.closest('button, a'); if (!b) return;
    if (b.hasAttribute('data-chips')) {
      var id = b.getAttribute('data-chips'), o = b.getAttribute('data-o'), a = arr(id).slice(), i = a.indexOf(o), fd = fieldDef(id);
      if (i === -1) {
        // 'None' is exclusive: it clears the other options, and picking another option clears it
        if (fd.none) a = o === fd.none ? [] : a.filter(function (x) { return x !== fd.none; });
        a.push(o);
      } else a.splice(i, 1);
      st.v[id] = a;
      Array.prototype.forEach.call(host.querySelectorAll('[data-chips="' + id + '"]'), function (x) { var on = a.indexOf(x.getAttribute('data-o')) !== -1; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); });
      if (fd.ins) insertLine(fd.ins, o, i === -1);
      save(); note();
    } else if (b.hasAttribute('data-one')) {
      var id1 = b.getAttribute('data-one'), o1 = b.getAttribute('data-o');
      st.v[id1] = st.v[id1] === o1 ? '' : o1;
      Array.prototype.forEach.call(host.querySelectorAll('[data-one="' + id1 + '"]'), function (x) { var on = st.v[id1] === x.getAttribute('data-o'); x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); });
      save(); note();
    } else if (b.hasAttribute('data-addabx')) { st.abx.push({ d: '', dose: '', start: '' }); save(); redraw('rf-mx'); var ins = host.querySelectorAll('[data-k="d"]'); if (ins.length) ins[ins.length - 1].focus(); }
    else if (b.hasAttribute('data-delabx')) { st.abx.splice(+b.getAttribute('data-delabx'), 1); save(); redraw('rf-mx'); }
    else if (b.hasAttribute('data-copy')) copy(b);
    else if (b.hasAttribute('data-clear')) {
      if (!clearArmed) { clearArmed = true; b.textContent = 'Tap again to clear everything'; setTimeout(function () { clearArmed = false; b.textContent = 'Clear form'; }, 3000); return; }
      clearArmed = false; st = { v: {}, abx: [] }; try { sessionStorage.removeItem(KEY); } catch (err) {} draw(); window.scrollTo(0, host.getBoundingClientRect().top + window.scrollY - 80);
    } else if (b.hasAttribute('data-sec') || b.hasAttribute('data-goprev')) {
      e.preventDefault();
      var tgt = document.getElementById(b.hasAttribute('data-goprev') ? 'rf-prev' : 'rf-' + b.getAttribute('data-sec'));
      if (tgt) window.scrollTo({ top: tgt.getBoundingClientRect().top + window.scrollY - 76, behavior: 'smooth' });
    }
  });
  function fieldDef(id) { for (var i = 0; i < S.length; i++) for (var j = 0; j < S[i].f.length; j++) if (S[i].f[j].id === id) return S[i].f[j]; return {}; }
  // Imaging: tapping a test adds "Test: " as its own line in the findings box, ready for a comment; untapping removes it if still empty
  function insertLine(target, label, adding) {
    var ta = host.querySelector('[data-v="' + target + '"]'); if (!ta) return;
    var lines = String(ta.value).split('\n'), prefix = label + ':';
    var idx = lines.map(function (l) { return l.trim(); }).findIndex(function (l) { return l.indexOf(prefix) === 0; });
    if (adding) {
      if (idx === -1) { while (lines.length && lines[lines.length - 1].trim() === '') lines.pop(); lines.push(prefix + ' '); idx = lines.length - 1; }
      ta.value = lines.join('\n');
      var pos = lines.slice(0, idx + 1).join('\n').length;
      ta.focus(); ta.setSelectionRange(pos, pos);
    } else if (idx !== -1 && lines[idx].trim() === prefix) { lines.splice(idx, 1); ta.value = lines.join('\n'); }
    st.v[target] = ta.value;
  }
  function redraw(secId) { var y = window.scrollY; draw(); window.scrollTo(0, y); }
  draw();
})();
