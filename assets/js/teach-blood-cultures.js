/* Teaching page: blood cultures (uses teachpage.js). */
(function () {
  var STAGES = [
    [0, 'Taken', 'Two sets (four bottles), 8–10 mL per bottle, before antibiotics.', 'Label with the time; send straight away.'],
    [2, 'Loaded on the analyser', 'Bottles are incubated and monitored for bacterial growth (CO₂ production) every few minutes.', 'Delays in getting bottles to the lab delay results: aim for under 4 hours.'],
    [12, 'Flags positive', 'Most true pathogens flag within 12–24 hours; skin contaminants tend to take longer.', 'Time to positivity is a clue: note it.'],
    [14, 'Gram stain phoned', 'The lab phones the Gram stain: for example Gram-positive cocci in clusters or Gram-negative rods.', 'Act now: adjust empirical treatment (add staphylococcal cover, check Gram-negative cover).'],
    [20, 'Organism identified', 'Rapid identification (MALDI-TOF or PCR) often names the organism within hours of the flag.', 'S. aureus or Candida: start the full bundle (repeat cultures, echo, remove lines).'],
    [40, 'Susceptibilities', 'Full susceptibility results usually take another 18–24 hours.', 'Narrow to the best agent; consider IV to oral switch.'],
    [120, 'No growth at 5 days', 'Bottles are reported negative after 5 days of incubation.', 'Negative cultures do not exclude infection, especially after antibiotics.']];
  function tlVis(S, T) {
    var h = S.bch, cur = 0; STAGES.forEach(function (s, i) { if (h >= s[0]) cur = i; });
    var lab = function (t) { return t === 0 ? '0 h' : t < 48 ? t + ' h' : (t / 24) + ' days'; };
    var svg = '<div class="tb-bar"><i style="width:' + (Math.sqrt(h) / Math.sqrt(120) * 100).toFixed(1) + '%"></i></div><ol class="tb-steps">' + STAGES.map(function (s, i) { return '<li class="' + (i < cur ? 'done' : i === cur ? 'now' : '') + '"><span>' + lab(s[0]) + '</span><b>' + T.esc(s[1]) + '</b></li>'; }).join('') + '</ol>';
    var st = STAGES[cur];
    return { svg: svg, out: h < 48 ? h + ' hours' : (h / 24).toFixed(1) + ' days', card: '<h3>' + T.esc(st[1]) + '</h3><dl class="pk-dl"><dt>What happens</dt><dd>' + T.esc(st[2]) + '</dd><dt>What you do</dt><dd>' + T.esc(st[3]) + '</dd></dl>' };
  }
  function timeline(S, T) {
    var v = tlVis(S, T);
    return '<div class="tb-vis">' + v.svg + '</div><div class="pk-range tb-range"><input type="range" min="0" max="120" step="1" value="' + S.bch + '" data-xin="bch" aria-label="Hours since the culture was taken"><output class="tb-out">' + v.out + '</output></div>' +
      '<div class="tp-orgcard tb-card">' + v.card + '</div>' +
      T.ask('The lab phones at 2am with “Gram-positive cocci in clusters, both sets, flagged at 11 hours”. What do you do?', 'Treat as possible S. aureus until identified: review the patient, check lines, add anti-staphylococcal cover (flucloxacillin, or vancomycin if MRSA risk), and repeat cultures.');
  }
  var ORGS = [['sa', 'Staphylococcus aureus', 'always'], ['ec', 'E. coli or other Gram-negative rod', 'always'], ['sp', 'Streptococcus pneumoniae', 'always'], ['ca', 'Candida', 'always'], ['vs', 'Viridans streptococci', 'depends'], ['cons', 'Coagulase-negative staphylococci', 'skin'], ['dip', 'Diphtheroids (Corynebacterium)', 'skin'], ['bac', 'Bacillus species', 'skin'], ['cut', 'Cutibacterium', 'skin']];
  function judge(S, T) {
    var o = ORGS.filter(function (x) { return x[0] === S.bo; })[0], v;
    if (!o) v = null;
    else if (o[2] === 'always') v = ['red', 'Treat as real', 'This organism is never a contaminant in blood. Review the patient, find the source, and start the organism-specific bundle.'];
    else if (o[2] === 'depends') v = S.bs === '2' || S.bd === '1' ? ['red', 'Likely real', 'Viridans streptococci in more than one set, or with a prosthetic valve, suggest endocarditis: three sets of cultures and an echo.'] : ['amber', 'Interpret clinically', 'One set may be a contaminant, but think of endocarditis and neutropenic mucositis; repeat cultures.'];
    else if (S.bs === '2' || S.bd === '1') v = ['amber', 'Possibly real', 'Skin organisms in both sets, or with a line or prosthetic material, may be true infection: repeat paired cultures, look at the line, and treat if the patient is unwell.'];
    else v = ['green', 'Probable contaminant', 'A skin organism in one set, without a device, is usually contamination: no antibiotics, but review the patient and the sampling technique.'];
    return '<div class="tq-uti"><div><div class="ab-sec"><h4>Organism</h4>' + T.opts('bo', ORGS.map(function (x) { return [x[0], x[1]]; }), S.bo, 'wide tq-g') + '</div>' +
      '<div class="tq-row"><div class="ab-sec"><h4>Sets positive</h4>' + T.chips('bs', [['1', '1 of 2'], ['2', '2 of 2']], S.bs) + '</div><div class="ab-sec"><h4>Line, valve or prosthesis</h4>' + T.chips('bd', [['0', 'No'], ['1', 'Yes']], S.bd) + '</div></div></div>' +
      '<div class="tq-verdict ' + (v ? v[0] : 'none') + '" aria-live="polite">' + (v ? '<b>' + T.esc(v[1]) + '</b><p>' + T.esc(v[2]) + '</p>' : '<p class="ab-note">Pick an organism.</p>') + '</div></div>';
  }
  TeachPage({
    host: 'tpb',
    state: { bch: 14, bo: null, bs: '1', bd: '0' },
    objectives: ['Take blood cultures well: when, how many, how much, and in what order.', 'Follow a culture from the bottle to the susceptibility result and act at each step.', 'Decide whether a positive culture is real or a contaminant.', 'Know which organisms are never contaminants.', "Explain how rapid diagnostics and trial evidence on treatment length change the management of bacteraemia."],
    plans: { 5: { how: 2, judge: 2, pearls: 1 }, 10: { how: 3, timeline: 3, judge: 3, pearls: 1 }, 20: { how: 3, timeline: 3, judge: 4, case: 6, quiz: 4 } },
    sections: [
      { id: 'how', t: 'Taking them well', k: 'Checklist', type: 'check', intro: 'Ask the group to talk through taking blood cultures. Tick each step as it is named.', done: 'Good technique keeps contamination under 3%: each contaminant means extra tests, antibiotics and days in hospital.', items: [
        ['Take them before antibiotics', 'But do not delay antibiotics in a high-risk septic patient.'],
        ['Two sets from separate venepunctures', 'Each set is one aerobic and one anaerobic bottle.'],
        ['Fill each bottle with 8–10 mL', 'Volume is the biggest factor in detecting bacteraemia.'],
        ['Clean the skin with 2% chlorhexidine in 70% alcohol and let it dry', 'At least 30 seconds; do not touch the site again.'],
        ['Clean the bottle tops', 'Remove the caps and wipe the tops before inoculating.'],
        ['With a butterfly, fill the aerobic bottle first', 'The air in the tubing goes into the aerobic bottle.'],
        ['Label, time and send straight away', 'Do not refrigerate.']] },
      { id: 'timeline', t: 'From bottle to result', k: 'Interactive timeline', type: 'html', html: timeline },
      { id: 'judge', t: 'Real or contaminant?', k: 'Interactive', type: 'html', html: judge },
      { id: 'deep', t: 'Going deeper', k: 'For final-year students', type: 'deep', items: [["How the machine knows", "Bottles contain growth media and a sensor; growing bacteria produce CO₂, which changes the sensor, and the analyser flags the bottle. Anaerobic bottles help with anaerobes and some streptococci; aerobic bottles with Pseudomonas and yeasts."], ["Rapid diagnostics", "MALDI-TOF identifies most organisms within hours of a positive bottle. Multiplex PCR panels detect resistance genes (mecA for MRSA, CTX-M for ESBL, carbapenemases). Rapid susceptibility testing gives results the same day. They only help if someone acts on the result."], ["Contamination", "Aim for under 3%. Each contaminant adds days in hospital, more tests and unnecessary vancomycin. Skin antisepsis, not taking cultures through existing lines, and initial-specimen diversion devices all reduce it."], ["Line infection", "Paired cultures from the line and a vein: if the line set flags 2 or more hours earlier (differential time to positivity), the line is likely the source. S. aureus, Pseudomonas and Candida line infections need the line out."], ["Persistent bacteraemia", "Positive cultures beyond 48–72 hours of effective treatment suggest an endovascular focus (endocarditis, infected thrombus), an undrained collection or retained device. Repeat cultures are routine for S. aureus and Candida."], ["How long to treat", "For most Gram-negative and many other uncomplicated bacteraemias with the source controlled, 7 days is enough (Yahav 2019, BALANCE). The exceptions: S. aureus (at least 14 days), Candida, endocarditis, bone and joint infection, and undrained collections."]] },
      { id: 'trial', t: 'Key trial: BALANCE', k: 'Evidence', type: 'trial', trial: {"name": "BALANCE", "cite": "BALANCE Investigators. N Engl J Med 2025", "q": "Is 7 days of antibiotics as good as 14 days for bloodstream infection?", "who": "3608 hospitalised patients (including intensive care) with bacteraemia; S. aureus and fungi excluded", "outcome": "Death at 90 days", "newArm": "the 7-day course", "arms": [["7 days", 14.5], ["14 days", 16.1]], "ans": 1, "result": "Death at 90 days was 14.5% with 7 days and 16.1% with 14 days: 7 days was non-inferior.", "meaning": "Seven days is enough for most bacteraemia once the source is controlled, cutting side effects, C. difficile and resistance. Not for S. aureus, Candida or endovascular infection."} },
      { id: 'pearls', t: 'Clinical pearls', k: 'Remember', type: 'pearls', items: [
        ['S. aureus is never a contaminant', 'Repeat cultures, echo, remove lines, infection specialist review.'],
        ['Candida in blood is never a contaminant', 'Remove lines, eye examination, echinocandin.'],
        ['Volume beats timing', 'Under-filled bottles miss bacteraemia; you do not need to wait for a fever spike.'],
        ['Do not take cultures through an old line', 'Unless you are looking for line infection, with a paired peripheral set.'],
        ['Time to positivity matters', 'Fast-flagging bottles (under 24 hours) are more likely to be real.'],
        ['One contaminant costs', 'Extra days in hospital and unnecessary vancomycin.']] },
      { id: 'case', t: 'Unfolding case', k: 'Work through together', type: 'case', end: 'Case complete. Discuss: what made the first result a contaminant and the second real?', steps: [
        { t: 'Day 2', s: 'Mr E, 66, admitted with pneumonia and improving on amoxicillin. One of two blood culture sets flags at 34 hours: Gram-positive cocci in clusters, later coagulase-negative staphylococcus. No lines.', q: 'What do you do?', o: [['Probable contaminant: no change, review the patient', 1, 'Yes: one set, slow to flag, skin organism, no device.'], ['Start vancomycin', 0, 'Not without evidence of real infection.'], ['Request an echo', 0, 'Not for a likely contaminant in a well patient.']] },
        { t: 'Day 6', s: 'He now has a PICC for IV antibiotics. He spikes a fever with rigors. Paired cultures from the PICC and a vein both grow S. aureus; the PICC set flagged 3 hours earlier.', q: 'What does this suggest?', o: [['PICC-related S. aureus bacteraemia', 1, 'Yes: both sets positive, and the line flagged 2 or more hours earlier.'], ['Contamination from the line', 0, 'S. aureus in blood is never a contaminant.'], ['Pneumonia relapse', 0, 'Possible but the cultures point to the line.']] },
        { t: 'Management', s: 'He is stable.', q: 'Which bundle?', o: [['Remove the PICC, repeat cultures, echo, IV flucloxacillin for at least 14 days, ID review', 1, 'Yes: the S. aureus bacteraemia bundle.'], ['Flush the line and give 5 days of antibiotics', 0, 'Too short and the source stays in.'], ['Oral flucloxacillin and discharge', 0, 'Not for S. aureus bacteraemia at this stage.']] }] },
      { id: 'quiz', t: 'Quick quiz', k: 'Check understanding', type: 'quiz', items: [
        ['How much blood should go in each adult bottle?', ['1–2 mL', '8–10 mL', '20–30 mL', 'As much as possible'], 1, '8–10 mL per bottle.'],
        ['Which is never a contaminant?', ['Coagulase-negative staphylococci', 'Staphylococcus aureus', 'Diphtheroids', 'Bacillus'], 1, 'S. aureus.'],
        ['With a butterfly, which bottle first?', ['Anaerobic', 'Aerobic', 'Either', 'Neither: use a syringe'], 1, 'Aerobic, so the air in the tubing goes there.'],
        ['What suggests a line is the source?', ['Peripheral set flags first', 'Line set flags 2 or more hours before the peripheral set', 'Both negative', 'Fever'], 1, 'Differential time to positivity of 2 hours or more.'],
        ['When are negative cultures finally reported?', ['24 hours', '48 hours', '5 days', '14 days'], 2, 'Usually after 5 days of incubation.']] }
    ],
    take: 'Two sets, well filled, before antibiotics; act on the Gram stain; S. aureus and Candida are never contaminants.',
    see: [['Blood culture triage', '/blood-culture-triage/'], ['S. aureus bacteraemia', '/sab/'], ['Teaching hub', '/teaching/']],
    on: {
      bch: function (el, S, redraw, T) { S.bch = +el.value; var bd = el.closest('.tp-body'), v = tlVis(S, T); bd.querySelector('.tb-vis').innerHTML = v.svg; bd.querySelector('.tb-out').textContent = v.out; bd.querySelector('.tb-card').innerHTML = v.card; },
      bo: function (b, S, redraw) { S.bo = b.getAttribute('data-v'); redraw('judge'); },
      bs: function (b, S, redraw) { S.bs = b.getAttribute('data-v'); redraw('judge'); },
      bd: function (b, S, redraw) { S.bd = b.getAttribute('data-v'); redraw('judge'); }
    }
  });
})();
