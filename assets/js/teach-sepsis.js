/* Sepsis teaching page: a ward teaching page to work through with medical students. Sections can be fitted to
   5, 10 or 20 minutes; diagrams and interactive parts (organ map, NEWS2 calculator, first-hour checklist, source
   cards, unfolding case, quiz). This file is the template for the other topic pages. */
(function () {
  var host = document.getElementById('tps');
  if (!host) return;
  var base = host.getAttribute('data-base') || '';
  var hashMode = host.hasAttribute('data-hash');
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function url(u) { if (/^https?:/.test(u)) return u; if (hashMode) { var m = /^\/([^/]+)\/(#.*)?$/.exec(u); return m ? (m[2] || '#' + m[1]) : u; } return base + u; }

  // ── Session plans: which sections to cover in 5, 10 or 20 minutes ──
  var SECTIONS = [['what', 'What sepsis is'], ['organs', 'Organ map'], ['spot', 'Spot it: NEWS2'], ['hour', 'The first hour'], ['source', 'Find the source'], ['deep', 'Going deeper'], ['trial', 'Key trial: ProMISe'], ['pearls', 'Clinical pearls'], ['case', 'Unfolding case'], ['quiz', 'Quick quiz']];
  var PLANS = { 5: { spot: 2, hour: 2, pearls: 1 }, 10: { what: 2, spot: 3, hour: 3, pearls: 2 }, 20: { what: 2, organs: 3, spot: 3, hour: 3, source: 3, case: 4, quiz: 2 } };
  var ADV = {"obj": "Apply the evidence on resuscitation, vasopressors, fluids and steroids in septic shock.", "deep": [["SOFA and organ dysfunction", "Sepsis-3 defines organ dysfunction as a rise in the SOFA score of 2 or more (respiration, coagulation, liver, cardiovascular, brain and kidneys). qSOFA (respiratory rate 22 or more, altered mentation, systolic BP 100 or less) is a quick prompt but too insensitive to rule sepsis out."], ["Vasopressors", "Noradrenaline is first line, targeting a mean arterial pressure of 65 mmHg. It can be started through a good peripheral cannula while central access is arranged. Vasopressin is added if more support is needed."], ["Fluids", "Give crystalloid boluses and reassess after each one. Balanced crystalloids (Hartmann’s, Plasma-Lyte) are preferred to large volumes of saline; starches harm the kidneys. In CLOVERS (2023), a restrictive and a liberal fluid strategy had similar mortality."], ["Steroids", "Hydrocortisone (200 mg a day) is used in septic shock that needs ongoing vasopressors. ADRENAL (2018) showed faster shock reversal without a mortality difference; APROCCHSS (2018), with fludrocortisone added, showed lower mortality."], ["Lactate", "Raised lactate usually reflects poor tissue perfusion (type A), but also impaired clearance in liver failure, and adrenaline or salbutamol (type B). The trend after treatment matters more than a single value."], ["Antibiotic timing", "Observational studies (Kumar 2006; Seymour 2017) link each hour of delay in septic shock with higher mortality. For less sick patients, a short time to assess and test before antibiotics is reasonable, which is why NICE times antibiotics by risk."]], "trial": {"name": "ProMISe", "cite": "Mouncey PR et al. N Engl J Med 2015;372:1301–11", "q": "Does protocolised early goal-directed therapy improve survival in septic shock?", "who": "1260 adults with early septic shock in 56 English hospitals", "outcome": "Death at 90 days", "newArm": "early goal-directed therapy", "arms": [["Early goal-directed therapy", 29.5], ["Usual care", 29.2]], "ans": 1, "result": "Death at 90 days was 29.5% with early goal-directed therapy and 29.2% with usual care; EGDT cost more. ARISE and ProCESS found the same.", "meaning": "A rigid protocol with central lines and venous oxygen targets adds nothing to good usual care: what matters is early recognition, antibiotics, fluids, vasopressors and source control."}};
  var st = { trialGuess: null, time: 10, organ: null, news: { rr: 18, sat: 96, o2: 0, sbp: 120, hr: 80, cons: 0, temp: 37.0 }, six: {}, src: {}, caseStep: 0, caseAns: {}, quiz: {} };

  function sec(id, title, kicker, body) {
    var adv = id === 'deep' || id === 'trial';
    return '<section class="card af-card tp-sec' + (adv ? ' tp-adv' : '') + '" id="tp-' + id + '" data-sec="' + id + '"><div class="tp-sh"><p class="tp-kick">' + esc(kicker) + '</p><h2>' + esc(title) + '</h2></div><div class="tp-body">' + body + '</div></section>';
  }

  // ── 1. What sepsis is: cascade diagram ──
  function cascade() {
    var h = '<svg viewBox="0 0 760 250" class="tp-svg" role="img" aria-label="How an infection leads to organ failure in sepsis">';
    function box(x, y, w, hh, cls, t1, t2) { return '<g class="tp-b ' + cls + '"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" rx="10"/><text x="' + (x + w / 2) + '" y="' + (y + (t2 ? hh / 2 - 3 : hh / 2 + 5)) + '" text-anchor="middle" class="t1">' + t1 + '</text>' + (t2 ? '<text x="' + (x + w / 2) + '" y="' + (y + hh / 2 + 15) + '" text-anchor="middle" class="t2">' + t2 + '</text>' : '') + '</g>'; }
    function arr(x1, y1, x2, y2) { return '<path class="tp-arr" d="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + '" marker-end="url(#tpA)"/>'; }
    h += '<defs><marker id="tpA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" class="tp-arrh"/></marker></defs>';
    h += box(10, 95, 120, 60, 'inf', 'Infection', 'any organism');
    h += box(170, 95, 150, 60, 'host', 'Host response', 'out of proportion');
    h += box(360, 20, 160, 50, 'mech', 'Vasodilation', 'low blood pressure');
    h += box(360, 100, 160, 50, 'mech', 'Capillary leak', 'oedema, low volume');
    h += box(360, 180, 160, 50, 'mech', 'Clotting', 'microthrombi, DIC');
    h += box(560, 70, 190, 110, 'org', 'Organ dysfunction', 'poor perfusion and cell injury');
    h += arr(130, 125, 168, 125) + arr(320, 115, 358, 50) + arr(320, 125, 358, 125) + arr(320, 135, 358, 200) + arr(520, 45, 558, 95) + arr(520, 125, 558, 125) + arr(520, 205, 558, 158);
    return h + '</svg>';
  }
  function what() {
    return cascade() +
      '<div class="tp-def"><div><span>Sepsis</span><p>Life-threatening organ dysfunction caused by a dysregulated host response to infection (Sepsis-3, 2016).</p></div>' +
      '<div><span>Septic shock</span><p>Sepsis needing vasopressors to keep mean arterial pressure at 65 mmHg or more, with lactate over 2 mmol/L, despite adequate fluids. In the Sepsis-3 data, hospital mortality was over 40%.</p></div></div>' +
      '<p class="tp-p">The problem is not just the organism: it is the body’s response to it. That is why patients can be dying of sepsis with a sterile blood culture, and why the treatment is antibiotics <b>and</b> support for the failing organs.</p>' +
      ask('Why is “SIRS” (fever, tachycardia, raised white cells) no longer enough to define sepsis?', 'SIRS criteria are met by many people with uncomplicated infection (and by non-infective conditions). Sepsis-3 focuses on organ dysfunction, which is what predicts death.');
  }

  // ── 2. Organ map ──
  var ORGANS = [
    ['brain', 'Brain', 118, 40, 'Confusion, agitation or drowsiness', 'New confusion on AMTS or 4AT; ACVPU or GCS', 'Often the first sign in older people.'],
    ['lungs', 'Lungs', 92, 112, 'Raised respiratory rate, hypoxia, ARDS', 'Count the respiratory rate for 30 seconds; SpO₂; blood gas', 'A respiratory rate of 22 or more is a qSOFA criterion; 25 or more is a NICE red flag.'],
    ['heart', 'Heart and circulation', 136, 122, 'Tachycardia, low blood pressure, shock', 'Pulse, blood pressure, capillary refill, lactate', 'Blood pressure can stay normal until late, especially in the young.'],
    ['liver', 'Liver', 104, 166, 'Jaundice, raised bilirubin', 'LFTs, bilirubin', 'Cholestasis of sepsis can look like biliary obstruction.'],
    ['kidney', 'Kidneys', 138, 178, 'Low urine output, rising creatinine', 'Urine output over the last hours; U&E', 'In a catheterised patient, under 0.5 mL/kg/hour is a NICE red flag.'],
    ['blood', 'Blood and clotting', 64, 205, 'Low platelets, bleeding, DIC', 'FBC, clotting, fibrinogen', 'A falling platelet count is an early warning.'],
    ['skin', 'Skin', 176, 230, 'Mottling, cold peripheries, non-blanching rash', 'Look at the knees and fingers; capillary refill over 3 seconds', 'A non-blanching rash suggests meningococcal sepsis.']
  ];
  function organs() {
    var h = '<div class="tp-org"><div class="tp-fig"><svg viewBox="0 0 240 320" class="tp-svg tp-body" role="group" aria-label="Organs affected in sepsis">';
    h += '<g class="tp-sil"><circle cx="120" cy="42" r="28"/><rect x="78" y="76" width="84" height="124" rx="30"/><path d="M80 90 L44 196 M160 90 L196 196 M98 196 L88 306 M142 196 L152 306"/></g>';
    ORGANS.forEach(function (o, i) {
      var on = st.organ === o[0];
      h += '<g class="tp-pin' + (on ? ' on' : '') + '" data-organ="' + o[0] + '" tabindex="0" role="button" aria-pressed="' + on + '" aria-label="' + esc(o[1]) + '"><circle cx="' + o[2] + '" cy="' + o[3] + '" r="12"/><text x="' + o[2] + '" y="' + (o[3] + 4.5) + '" text-anchor="middle">' + (i + 1) + '</text></g>';
    });
    h += '</svg></div><div class="tp-orglist">';
    h += '<div class="opts wide tp-orgbtns">' + ORGANS.map(function (o, i) { var on = st.organ === o[0]; return '<button type="button" class="opt' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-organ="' + o[0] + '"><span class="opt-text"><span class="mech-n">' + (i + 1) + '</span>' + esc(o[1]) + '</span></button>'; }).join('') + '</div>';
    var o = ORGANS.filter(function (x) { return x[0] === st.organ; })[0];
    h += '<div class="tp-orgcard" aria-live="polite">' + (o ? '<h3>' + esc(o[1]) + '</h3><dl class="pk-dl"><dt>What fails</dt><dd>' + esc(o[4]) + '</dd><dt>At the bedside</dt><dd>' + esc(o[5]) + '</dd></dl><p class="tp-pearl-s">' + esc(o[6]) + '</p>' : '<p class="ab-note">Tap an organ to see what fails and how you would pick it up at the bedside.</p>') + '</div>';
    return h + '</div></div>' + ask('Ask the group: which of these could you check at the bedside in the next two minutes, without any tests?', 'Conscious level, respiratory rate, oxygen saturation, pulse, blood pressure, capillary refill, skin mottling, and the urine output on the fluid chart.');
  }

  // ── 3. NEWS2 calculator ──
  function newsParts() {
    var n = st.news, p = {};
    p.rr = n.rr <= 8 ? 3 : n.rr <= 11 ? 1 : n.rr <= 20 ? 0 : n.rr <= 24 ? 2 : 3;
    p.sat = n.sat <= 91 ? 3 : n.sat <= 93 ? 2 : n.sat <= 95 ? 1 : 0;
    p.o2 = n.o2 ? 2 : 0;
    p.sbp = n.sbp <= 90 ? 3 : n.sbp <= 100 ? 2 : n.sbp <= 110 ? 1 : n.sbp <= 219 ? 0 : 3;
    p.hr = n.hr <= 40 ? 3 : n.hr <= 50 ? 1 : n.hr <= 90 ? 0 : n.hr <= 110 ? 1 : n.hr <= 130 ? 2 : 3;
    p.cons = n.cons ? 3 : 0;
    p.temp = n.temp <= 35 ? 3 : n.temp <= 36 ? 1 : n.temp <= 38 ? 0 : n.temp <= 39 ? 1 : 2;
    return p;
  }
  var NS = [['rr', 'Respiratory rate', 4, 40, 1, '/min'], ['sat', 'Oxygen saturation (scale 1)', 80, 100, 1, '%'], ['sbp', 'Systolic blood pressure', 60, 230, 1, 'mmHg'], ['hr', 'Pulse', 30, 170, 1, '/min'], ['temp', 'Temperature', 34, 41, 0.1, '°C']];
  function newsCtl() {
    return '<div class="tp-news"><div class="tp-nsl">' + NS.map(function (s) {
      return '<div class="ab-sec"><h4>' + esc(s[1]) + ' <b class="tp-ns" data-ns="' + s[0] + '"></b></h4><div class="pk-range"><input type="range" data-news="' + s[0] + '" min="' + s[2] + '" max="' + s[3] + '" step="' + s[4] + '" value="' + st.news[s[0]] + '" aria-label="' + esc(s[1]) + '"><output data-nout="' + s[0] + '"></output></div></div>';
    }).join('') +
      '<div class="tp-tog"><div class="ab-sec"><h4>Oxygen <b class="tp-ns" data-ns="o2"></b></h4><div class="ab-aw"><button type="button" class="sp-chip" data-nt="o2" data-v="0">Air</button><button type="button" class="sp-chip" data-nt="o2" data-v="1">On oxygen</button></div></div>' +
      '<div class="ab-sec"><h4>Consciousness <b class="tp-ns" data-ns="cons"></b></h4><div class="ab-aw"><button type="button" class="sp-chip" data-nt="cons" data-v="0">Alert</button><button type="button" class="sp-chip" data-nt="cons" data-v="1">New confusion, V, P or U</button></div></div></div>' +
      '<div class="ab-aw tp-pre"><span class="tp-prel">Try:</span><button type="button" class="sp-chip" data-np="well">Well patient</button><button type="button" class="sp-chip" data-np="early">Early sepsis</button><button type="button" class="sp-chip" data-np="shock">Septic shock</button><button type="button" class="sp-chip" data-np="young">Fit 25-year-old</button></div></div>' +
      '<div class="tp-nres" aria-live="polite"><div class="tp-gauge"><i></i></div><div class="tp-scale"><span class="g0">0</span><span class="g1">1–4</span><span class="g2">5–6</span><span class="g3">7+</span></div><p class="tp-score"><b id="tp-nscore">0</b><span>NEWS2</span></p><p class="tp-nresp" id="tp-nresp"></p></div></div>' +
      '<p class="tp-p">NICE (NG51, updated 2024) uses NEWS2 to decide how fast antibiotics are needed when infection is suspected in hospital: a score of 7 or more means antibiotics within 1 hour; 5 or 6 means within 3 hours; lower scores need clinical assessment to guide timing. A score of 3 in any single parameter needs urgent review too.</p>' +
      ask('Try the “Fit 25-year-old” example. What does it teach?', 'Young, fit patients compensate: blood pressure holds up until very late, and a high pulse and respiratory rate may be the only clues. A normal blood pressure does not exclude sepsis.');
  }
  var NPRE = { well: { rr: 14, sat: 98, o2: 0, sbp: 128, hr: 72, cons: 0, temp: 36.8 }, early: { rr: 22, sat: 95, o2: 0, sbp: 108, hr: 104, cons: 0, temp: 38.6 }, shock: { rr: 28, sat: 91, o2: 1, sbp: 84, hr: 128, cons: 1, temp: 39.4 }, young: { rr: 24, sat: 97, o2: 0, sbp: 118, hr: 124, cons: 0, temp: 39.0 } };
  function newsUpdate() {
    var p = newsParts(), tot = 0, three = false;
    Object.keys(p).forEach(function (k) { tot += p[k]; if (p[k] === 3) three = true; var b = host.querySelector('[data-ns="' + k + '"]'); if (b) { b.textContent = '+' + p[k]; b.className = 'tp-ns s' + p[k]; } });
    NS.forEach(function (s) { var o = host.querySelector('[data-nout="' + s[0] + '"]'); if (o) o.textContent = (s[0] === 'temp' ? (+st.news.temp).toFixed(1) : st.news[s[0]]) + ' ' + s[5]; });
    host.querySelectorAll('[data-nt]').forEach(function (b) { var on = String(st.news[b.getAttribute('data-nt')]) === b.getAttribute('data-v'); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    var band = tot >= 7 ? 3 : tot >= 5 ? 2 : tot >= 1 ? 1 : 0;
    var resp = ['Routine monitoring (at least every 12 hours).', 'Low risk: ward-based response, observations at least every 4–6 hours.' + (three ? ' But a 3 in one parameter: urgent review by a clinician.' : ''), 'Medium risk: urgent review by a clinician competent in acute illness; observations at least hourly. If infection is suspected: antibiotics within 3 hours.', 'High risk: emergency response, including critical care outreach; continuous monitoring. If infection is suspected: antibiotics within 1 hour.'];
    var g = host.querySelector('.tp-gauge i'); if (g) { g.style.width = Math.min(100, tot / 20 * 100) + '%'; g.className = 'b' + band; }
    var sc = host.querySelector('#tp-nscore'); if (sc) { sc.textContent = tot; sc.className = 'b' + band; }
    var r = host.querySelector('#tp-nresp'); if (r) { r.textContent = resp[band]; r.className = 'tp-nresp b' + band; }
  }

  // ── 4. The first hour: Sepsis Six ──
  var SIX = [
    ['o2', 'Give oxygen if needed', 'Target saturations 94–98% (88–92% if at risk of hypercapnic respiratory failure).'],
    ['bc', 'Take blood cultures', 'At least two sets, well filled, before antibiotics; do not delay antibiotics in high-risk patients to get them.'],
    ['abx', 'Give IV antibiotics', 'Follow local policy for the likely source; check allergies and kidney function.'],
    ['fluid', 'Give IV fluids', 'A crystalloid bolus (for example 500 mL over 15 minutes) if hypotensive or lactate over 2, then reassess.'],
    ['lac', 'Measure lactate (and FBC)', 'Over 2 mmol/L means higher risk; over 4 mmol/L is critical. Repeat after fluids.'],
    ['uo', 'Measure urine output', 'Start a fluid balance chart; consider a catheter if critically unwell.']];
  function six() {
    var n = SIX.filter(function (x) { return st.six[x[0]]; }).length;
    return '<div class="tp-six"><div class="tp-ring" aria-hidden="true"><svg viewBox="0 0 120 120"><circle class="bg" cx="60" cy="60" r="50"/><circle class="fg" cx="60" cy="60" r="50" stroke-dasharray="' + (314.16 * n / 6).toFixed(1) + ' 314.16" transform="rotate(-90 60 60)"/></svg><b>' + n + '/6</b><span>done</span></div>' +
      '<ul class="tp-check">' + SIX.map(function (x) { var on = !!st.six[x[0]]; return '<li><button type="button" class="tp-ck' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-six="' + x[0] + '"><i aria-hidden="true"></i><span><b>' + esc(x[1]) + '</b>' + (on ? '<em>' + esc(x[2]) + '</em>' : '') + '</span></button></li>'; }).join('') + '</ul></div>' +
      (n === 6 ? '<p class="tp-done">All six done. Now: escalate early (senior review and critical care if not responding), find and control the source, and set a time to review.</p>' : '<p class="ab-note">Tap each step as the group names it. Then ask: what comes after the Sepsis Six?</p>');
  }

  // ── 5. Find the source ──
  var SRC = [['Chest', 'Cough, sputum, breathlessness, crackles', 'Chest X-ray, sputum culture, urinary antigens, viral PCR'], ['Urine', 'Dysuria, loin pain, catheter, rigors', 'Urine culture (from a new catheter), renal ultrasound if obstruction suspected'], ['Abdomen', 'Pain, jaundice, peritonism, recent surgery', 'LFTs, lipase, ultrasound or CT; surgical review for source control'], ['Skin and soft tissue', 'Redness, swelling, pain out of proportion', 'Look everywhere, including the back and perineum; surgical review if necrotising infection possible'], ['Lines and devices', 'Central line, PICC, cannula, pacemaker', 'Look at the exit site; paired cultures from line and vein; remove infected lines'], ['Heart', 'New murmur, embolic signs, injecting drug use', 'Three sets of blood cultures, echo'], ['Brain and meninges', 'Headache, neck stiffness, rash, confusion', 'Blood cultures, then lumbar puncture if safe; do not delay antibiotics'], ['Bones and joints', 'Hot swollen joint, back pain', 'Joint aspiration before antibiotics if stable; MRI spine']];
  function source() {
    return '<p class="tp-p">Ask the group to name the source and the test before you flip each card.</p><div class="tp-cards">' + SRC.map(function (s, i) {
      var on = !!st.src[i];
      return '<button type="button" class="tp-card' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-src="' + i + '"><b>' + esc(s[0]) + '</b>' + (on ? '<span class="tp-c1"><em>Clues</em>' + esc(s[1]) + '</span><span class="tp-c2"><em>Send or do</em>' + esc(s[2]) + '</span>' : '<span class="tp-flip">Tap to reveal</span>') + '</button>';
    }).join('') + '</div><p class="tp-p">No source after a full search? Think endocarditis, deep abscess, spine, prostate, and non-infective mimics (pancreatitis, PE, adrenal crisis, drug reactions).</p>';
  }

  // ── 6. Clinical pearls ──
  var PEARLS = [
    ['Count the respiratory rate', 'It is the most predictive observation and the one most often estimated. Count for 30 seconds.'],
    ['Older people may not have a fever', 'Confusion, falls or “off legs” can be the only signs; a low temperature is worse than a high one.'],
    ['Normal blood pressure is not reassuring', 'Young patients and those on beta-blockers compensate until late; look at the pulse, breathing and lactate.'],
    ['Lactate is not just for shock', 'A raised lactate with normal blood pressure (“cryptic shock”) still carries a high risk of death.'],
    ['Source control beats broader antibiotics', 'Draining pus, removing a line or relieving an obstructed kidney matters more than the choice of antibiotic.'],
    ['Review at 48–72 hours', 'Narrow, switch to oral or stop based on cultures and progress (“Start Smart then Focus”).']];
  function pearls() { return '<div class="tp-pearls">' + PEARLS.map(function (p) { return '<div class="tp-pearl"><b>' + esc(p[0]) + '</b><p>' + esc(p[1]) + '</p></div>'; }).join('') + '</div>'; }

  // ── 7. Unfolding case ──
  var CASE = [
    { t: 'Ward, 02:00', s: 'You are called to Mrs A, 79, admitted yesterday with a fall. The nurse says she is “not herself”: more confused, and she has a temperature of 38.4°C.', q: 'What do you want to know first?', o: [['Her full set of observations and NEWS2', 1, 'Yes: the observations tell you how sick she is and how fast to act.'], ['A urine dipstick result', 0, 'Dipsticks are unreliable over 65 and do not tell you how unwell she is.'], ['Whether she had a CT head on admission', 0, 'Worth knowing, but her observations come first.']] },
    { t: 'Observations', s: 'Respiratory rate 26, SpO₂ 93% on air, blood pressure 96/58, pulse 118, new confusion, temperature 38.4°C. NEWS2 is 13.', q: 'What do you do?', o: [['Start the Sepsis Six now and call your senior', 1, 'Yes: NEWS2 of 7 or more with suspected infection means high risk: antibiotics within 1 hour and an emergency response.'], ['Repeat the observations in an hour', 0, 'Waiting risks deterioration: this is high risk now.'], ['Send bloods and wait for the white cell count', 0, 'Bloods help, but antibiotics should not wait for results in a high-risk patient.']] },
    { t: 'The first hour', s: 'Lactate is 3.8 mmol/L. She has crackles at the right base. You take blood cultures and give IV antibiotics for hospital-acquired pneumonia, oxygen and a 500 mL fluid bolus.', q: 'After the bolus her blood pressure is 88/52 and lactate 4.4. Next?', o: [['Critical care review and further fluid while they come', 1, 'Yes: persistent hypotension and rising lactate after fluid suggest septic shock; she may need vasopressors. Agree a treatment escalation plan early.'], ['Change to a broader antibiotic', 0, 'The antibiotic is not the problem yet: she needs circulatory support and senior input.'], ['Give furosemide for the crackles', 0, 'She is under-filled and hypotensive: diuretics would make things worse.']] },
    { t: 'Day 3', s: 'She improved on critical care outreach support. Blood cultures grew Streptococcus pneumoniae, fully susceptible to penicillin. She is eating and drinking.', q: 'What happens to her antibiotics?', o: [['Narrow to amoxicillin, switch to oral, plan 5 days in total', 1, 'Yes: narrow to the organism, switch when well enough, and keep the course short.'], ['Continue the broad IV antibiotic for 14 days', 0, 'Unnecessary breadth and length: more side effects, C. difficile and resistance.'], ['Stop all antibiotics now', 0, 'Too early for bacteraemic pneumonia: complete a short course.']] }];
  function kase() {
    var h = '<ol class="tp-case">';
    for (var i = 0; i <= st.caseStep && i < CASE.length; i++) {
      var c = CASE[i], a = st.caseAns[i];
      h += '<li class="tp-step"><p class="tp-st">' + esc(c.t) + '</p><p class="tp-ss">' + esc(c.s) + '</p><p class="tp-sq">' + esc(c.q) + '</p><div class="opts wide">' + c.o.map(function (o, j) {
        var cls = a == null ? '' : (o[1] ? ' right' : (a === j ? ' wrong' : ' faded'));
        return '<button type="button" class="opt tp-co' + cls + '" data-case="' + i + '" data-o="' + j + '"' + (a != null ? ' disabled' : '') + '><span class="opt-text">' + esc(o[0]) + '</span>' + (a != null && (o[1] || a === j) ? '<span class="opt-pts">' + esc(o[2]) + '</span>' : '') + '</button>';
      }).join('') + '</div></li>';
    }
    h += '</ol>';
    if (st.caseAns[st.caseStep] != null && st.caseStep < CASE.length - 1) h += '<button type="button" class="reset tp-next" data-act="next">Next: ' + esc(CASE[st.caseStep + 1].t) + '</button>';
    else if (st.caseStep === CASE.length - 1 && st.caseAns[st.caseStep] != null) h += '<p class="tp-done">Case complete. Discuss: what would have happened if the observations had been repeated in an hour?</p><button type="button" class="reset" data-act="recase">Start again</button>';
    return h;
  }

  // ── 8. Quiz ──
  var QZ = [
    ['Which NEWS2 score means antibiotics within 1 hour if infection is suspected (NICE)?', ['3 or more', '5 or more', '7 or more', '9 or more'], 2, 'A score of 7 or more is high risk; 5–6 means within 3 hours.'],
    ['Which observation is most often missed and among the most predictive?', ['Temperature', 'Respiratory rate', 'Blood pressure', 'Pulse'], 1, 'Respiratory rate: count it for 30 seconds.'],
    ['Septic shock is defined by vasopressors to keep MAP at 65 mmHg or more and…', ['Temperature over 39°C', 'Lactate over 2 mmol/L despite fluids', 'White cell count over 15', 'Positive blood cultures'], 1, 'Sepsis-3: vasopressor need plus lactate over 2 mmol/L despite adequate fluids.'],
    ['Which is NOT part of the Sepsis Six?', ['Measure urine output', 'Measure lactate', 'Give IV fluids', 'Request a CT scan'], 3, 'Imaging may help find a source, but it is not one of the six.'],
    ['What matters most for a septic patient with an infected obstructed kidney?', ['Switching to meropenem', 'Urgent decompression (nephrostomy or stent)', 'Adding gentamicin', 'Waiting for cultures'], 1, 'Source control: relieve the obstruction.']];
  function quiz() {
    var score = 0, done = 0;
    var h = '<ol class="tp-qz">' + QZ.map(function (q, i) {
      var a = st.quiz[i]; if (a != null) { done++; if (a === q[2]) score++; }
      return '<li><p class="tp-sq">' + esc(q[0]) + '</p><div class="opts wide">' + q[1].map(function (o, j) {
        var cls = a == null ? '' : (j === q[2] ? ' right' : (a === j ? ' wrong' : ' faded'));
        return '<button type="button" class="opt tp-co' + cls + '" data-qz="' + i + '" data-o="' + j + '"' + (a != null ? ' disabled' : '') + '><span class="opt-text">' + esc(o) + '</span></button>';
      }).join('') + '</div>' + (a != null ? '<p class="tp-why">' + esc(q[3]) + '</p>' : '') + '</li>';
    }).join('') + '</ol>';
    return h + '<p class="tp-qscore">' + (done ? 'Score: ' + score + ' of ' + done + (done === QZ.length ? ' <button type="button" class="reset" data-act="requiz">Try again</button>' : '') : 'Answer to see the explanation.') + '</p>';
  }

  function ask(q, a) { return '<div class="tp-ask"><p><b>Ask:</b> ' + esc(q) + '</p><button type="button" class="tw-reveal" data-act="ans">Show answer</button><p class="tp-ans" hidden>' + esc(a) + '</p></div>'; }

  function planBar() {
    var p = PLANS[st.time], tot = 0;
    var segs = SECTIONS.filter(function (s) { return p[s[0]]; }).map(function (s, i) { tot += p[s[0]]; return '<a class="tw-seg s' + (i % 5) + '" href="#tp-' + s[0] + '" style="flex:' + p[s[0]] + '"><b>' + esc(s[1]) + '</b><span>' + p[s[0]] + ' min</span></a>'; }).join('');
    return '<div class="tp-planhd"><div class="ab-sec"><h4>Time you have</h4><div class="opts tw-times">' + [5, 10, 20].map(function (t) { var on = st.time === t; return '<button type="button" class="opt' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-time="' + t + '"><span class="opt-text">' + t + ' minutes</span></button>'; }).join('') + '</div></div>' +
      '<p class="ab-note">Sections in the plan are open; the rest are folded but still there if the discussion goes that way.</p></div><div class="tw-plan">' + segs + '</div><p class="tw-tot">' + tot + ' minutes in total · then the take-home message</p>';
  }
  function applyPlan() {
    var p = PLANS[st.time];
    host.querySelectorAll('.tp-sec').forEach(function (s) {
      var id = s.getAttribute('data-sec'), m = p[id];
      s.classList.toggle('out', !m); s.classList.remove('force');
      s.querySelector('[data-min]').textContent = m ? m + ' min' : 'Not in this plan';
    });
    host.querySelector('#tp-plan').innerHTML = planBar();
  }
  function rerender(id, fn) { var b = host.querySelector('#tp-' + id + ' .tp-body'); if (b) b.innerHTML = fn(); }

  host.innerHTML = '<nav class="tp-toc" aria-label="Sections">' + SECTIONS.map(function (x) { return '<a class="tw-seg-l' + (x[0] === 'deep' || x[0] === 'trial' ? ' adv' : '') + '" href="#tp-' + x[0] + '">' + esc(x[1]) + '</a>'; }).join('') + '</nav>' +
    '<section class="card af-card tp-obj"><h2>By the end, students can</h2><ol><li>Define sepsis and septic shock, and explain why organ dysfunction is the key.</li><li>Recognise a deteriorating patient using NEWS2 and the bedside signs.</li><li>List the Sepsis Six and the first-hour priorities.</li><li>Search systematically for a source, and know when source control matters most.</li><li>' + esc(ADV.obj) + '</li></ol></section>' +
    sec('what', 'What sepsis is', 'The idea', what()) + sec('organs', 'Organ map', 'Diagram', organs()) + sec('spot', 'Spot it: NEWS2', 'Interactive', newsCtl()) + sec('hour', 'The first hour', 'Sepsis Six', six()) +
    sec('source', 'Find the source', 'Flip cards', source()) + sec('deep', 'Going deeper', 'For final-year students', window.TeachBlocks.deep(ADV.deep)) + sec('trial', 'Key trial: ProMISe', 'Evidence', window.TeachBlocks.trial('trial', ADV.trial, null)) + sec('pearls', 'Clinical pearls', 'Remember', pearls()) + sec('case', 'Unfolding case', 'Work through together', kase()) + sec('quiz', 'Quick quiz', 'Check understanding', quiz()) +
    '<div class="tw-take"><span>Take-home message</span><p>Sepsis is organ dysfunction from infection: count the breathing, score NEWS2, give the Sepsis Six within the hour, find the source, and review at 48–72 hours.</p></div>';
  newsUpdate();

  host.addEventListener('click', function (e) {
    var b = e.target.closest('button, a.tw-seg-l, g[data-organ]'); if (!b) return;
    if (b.classList.contains('tw-seg-l')) { var tt = host.querySelector(b.getAttribute('href')); if (tt) { e.preventDefault(); tt.scrollIntoView({ behavior: 'smooth', block: 'start' }); } return; }
    if (b.hasAttribute('data-trial')) { st.trialGuess = +b.getAttribute('data-o'); rerender('trial', function () { return window.TeachBlocks.trial('trial', ADV.trial, st.trialGuess); }); return; }
    var act = b.getAttribute('data-act');
    if (act === 'open') { b.closest('.tp-sec').classList.add('force'); return; }
    if (b.classList.contains('tw-seg')) { var t = host.querySelector(b.getAttribute('href')); if (t) { e.preventDefault(); t.classList.add('force'); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); } return; }
    if (act === 'dpall') { var ds = b.closest('.tp-body').querySelectorAll('details'), anyc = Array.prototype.some.call(ds, function (d) { return !d.open; }); ds.forEach(function (d) { d.open = anyc; }); b.textContent = anyc ? 'Close all' : 'Open all'; return; }
    if (act === 'ans') { var a = b.nextElementSibling, open = a.hidden; a.hidden = !open; b.textContent = open ? 'Hide answer' : 'Show answer'; return; }
    if (b.hasAttribute('data-organ')) { var o = b.getAttribute('data-organ'); st.organ = st.organ === o ? null : o; rerender('organs', organs); return; }
    if (b.hasAttribute('data-nt')) { st.news[b.getAttribute('data-nt')] = +b.getAttribute('data-v'); newsUpdate(); return; }
    if (b.hasAttribute('data-np')) { var pr = NPRE[b.getAttribute('data-np')]; Object.keys(pr).forEach(function (k) { st.news[k] = pr[k]; var r = host.querySelector('[data-news="' + k + '"]'); if (r) r.value = pr[k]; }); newsUpdate(); return; }
    if (b.hasAttribute('data-six')) { var k = b.getAttribute('data-six'); st.six[k] = !st.six[k]; rerender('hour', six); return; }
    if (b.hasAttribute('data-src')) { var i = +b.getAttribute('data-src'); st.src[i] = !st.src[i]; rerender('source', source); return; }
    if (b.hasAttribute('data-case')) { st.caseAns[+b.getAttribute('data-case')] = +b.getAttribute('data-o'); rerender('case', kase); return; }
    if (act === 'next') { st.caseStep++; rerender('case', kase); var steps = host.querySelectorAll('.tp-step'); steps[steps.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return; }
    if (act === 'recase') { st.caseStep = 0; st.caseAns = {}; rerender('case', kase); return; }
    if (b.hasAttribute('data-qz')) { st.quiz[+b.getAttribute('data-qz')] = +b.getAttribute('data-o'); rerender('quiz', quiz); return; }
    if (act === 'requiz') { st.quiz = {}; rerender('quiz', quiz); }
  });
  host.addEventListener('keydown', function (e) { var g = e.target.closest('g[data-organ]'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); g.dispatchEvent(new MouseEvent('click', { bubbles: true })); } });
  host.addEventListener('input', function (e) { var k = e.target.getAttribute('data-news'); if (k) { st.news[k] = +e.target.value; newsUpdate(); } });
})();
