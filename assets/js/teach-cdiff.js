/* Teaching page: Clostridioides difficile (uses teachpage.js). */
(function () {
  function test(S, T) {
    var g = S.gdh, t = S.tox, v;
    if (g == null || t == null) v = null;
    else if (g === 'n') v = ['green', 'C. difficile unlikely', 'A negative GDH screen effectively rules out C. difficile. Look for other causes of diarrhoea.'];
    else if (t === 'p') v = ['red', 'C. difficile infection likely', 'Organism present and producing toxin: isolate, treat with oral vancomycin, review antibiotics and PPIs, and assess severity.'];
    else v = ['amber', 'Possible carrier (colonisation)', 'C. difficile is present but no toxin was detected. Isolate (they can spread it); treat only if the clinical picture strongly suggests infection, after discussion with microbiology.'];
    return T.p('UK testing is two-step: a sensitive screen (GDH, which shows the organism is there), then a toxin test (which shows it is active). Only send unformed stool (Bristol 5–7) without another clear cause.') +
      '<div class="tq-uti"><div><div class="ab-sec"><h4>Step 1: GDH (organism present?)</h4>' + T.chips('gdh', [['p', 'Positive'], ['n', 'Negative']], S.gdh) + '</div>' +
      '<div class="ab-sec"><h4>Step 2: Toxin (actively causing disease?)</h4>' + T.chips('tox', [['p', 'Positive'], ['n', 'Negative']], S.tox) + '</div></div>' +
      '<div class="tq-verdict ' + (v ? v[0] : 'none') + '" aria-live="polite">' + (v ? '<b>' + T.esc(v[1]) + '</b><p>' + T.esc(v[2]) + '</p>' : '<p class="ab-note">Choose both results.</p>') + '</div></div>';
  }
  var SEV = [['wcc', 'White cell count over 15', 's'], ['cr', 'Creatinine raised (over 50% above baseline)', 's'], ['temp', 'Temperature over 38.5°C', 's'], ['col', 'Severe colitis on examination or imaging', 's'], ['bp', 'Hypotension or shock', 'l'], ['ileus', 'Ileus or toxic megacolon', 'l']];
  function sev(S, T) {
    var life = SEV.some(function (x) { return x[2] === 'l' && S.sv[x[0]]; }), severe = SEV.some(function (x) { return x[2] === 's' && S.sv[x[0]]; });
    var r = life ? ['red', 'Life-threatening', 'Oral vancomycin 500 mg QDS (plus IV metronidazole), urgent surgical and critical care review.'] : severe ? ['amber', 'Severe', 'Oral vancomycin 125 mg QDS for 10 days (fidaxomicin second line); close monitoring for deterioration.'] : ['green', 'Not severe', 'Oral vancomycin 125 mg QDS for 10 days; stop unnecessary antibiotics and PPIs.'];
    return '<div class="tq-uti"><div class="tp-check">' + SEV.map(function (x) { var on = !!S.sv[x[0]]; return '<button type="button" class="tp-ck' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-x="sv" data-v="' + x[0] + '"><i aria-hidden="true"></i><span><b>' + T.esc(x[1]) + '</b><em>' + (x[2] === 'l' ? 'Life-threatening marker' : 'Severity marker') + '</em></span></button>'; }).join('') + '</div>' +
      '<div class="tq-verdict ' + r[0] + '"><b>' + r[1] + '</b><p>' + T.esc(r[2]) + '</p></div></div>' +
      T.p('Treatment follows NICE NG199: oral vancomycin first line; fidaxomicin second line or for recurrence; specialist advice for further recurrences (faecal microbiota transplant).');
  }
  TeachPage({
    host: 'tpd',
    state: { gdh: null, tox: null, sv: {} },
    objectives: ['Explain why C. difficile follows antibiotics and which ones carry the highest risk.', 'Interpret the two-step test.', 'Assess severity and choose treatment.', 'Apply the infection control steps, including soap and water.'],
    plans: { 5: { test: 2, ipc: 2, pearls: 1 }, 10: { test: 3, sev: 3, ipc: 2, pearls: 2 }, 20: { test: 3, sev: 3, ipc: 3, case: 7, quiz: 4 } },
    sections: [
      { id: 'test', t: 'Reading the test', k: 'Interactive', type: 'html', html: test },
      { id: 'sev', t: 'How severe?', k: 'Interactive', type: 'html', html: sev },
      { id: 'ipc', t: 'Stopping the spread', k: 'Checklist', type: 'check', intro: 'Ask the group what needs to happen on the ward. Tick each as it is named.', done: 'Spores survive for months on surfaces: cleaning and handwashing matter as much as the antibiotic.', items: [
        ['Isolate in a side room with its own toilet', 'Until 48 hours without diarrhoea and formed stool.'],
        ['Gloves and aprons for contact', 'Patient and environment.'],
        ['Wash hands with soap and water', 'Alcohol gel does not kill spores.'],
        ['Clean with a chlorine-based product', 'Daily and at discharge.'],
        ['Keep a stool chart', 'Bristol stool type and frequency.'],
        ['Review antibiotics and PPIs', 'Stop what is not needed.']] },
      { id: 'pearls', t: 'Clinical pearls', k: 'Remember', type: 'pearls', items: [
        ['The 4 Cs', 'Clindamycin, cephalosporins, co-amoxiclav and ciprofloxacin carry the highest risk.'],
        ['Do not test formed stool', 'And do not test for cure.'],
        ['Soap and water', 'Alcohol gel does not kill spores.'],
        ['Oral vancomycin only works by mouth', 'IV vancomycin does not reach the gut.'],
        ['Watch for ileus', 'Diarrhoea can stop as the patient gets worse.'],
        ['Recurrence is common', 'About 1 in 5: fidaxomicin reduces it.']] },
      { id: 'case', t: 'Unfolding case', k: 'Work through together', type: 'case', end: 'Case complete. Discuss: how could this episode have been prevented?', steps: [
        { t: 'Day 5', s: 'Mr H, 81, on co-amoxiclav for 5 days for a chest infection, develops six watery stools a day. He is also on omeprazole.', q: 'What first?', o: [['Isolate, send stool, review co-amoxiclav and omeprazole', 1, 'Yes: isolate on suspicion, then test.'], ['Give loperamide', 0, 'Avoid antimotility drugs until C. difficile is excluded.'], ['Wait 48 hours', 0, 'Isolate and test now.']] },
        { t: 'Results', s: 'GDH positive, toxin positive. WCC 18, creatinine 140 (baseline 85), temperature 38.2°C.', q: 'How severe and how do you treat?', o: [['Severe: oral vancomycin 125 mg QDS for 10 days', 1, 'Yes: raised WCC and creatinine make it severe.'], ['Not severe: no treatment', 0, 'Toxin-positive with severity markers needs treatment.'], ['IV vancomycin', 0, 'IV vancomycin does not reach the colon.']] },
        { t: 'Day 3 of treatment', s: 'His diarrhoea has stopped, but his abdomen is distended and tender, and his blood pressure is 88/50.', q: 'What is happening?', o: [['Possible ileus or toxic megacolon: life-threatening; urgent surgical and critical care review', 1, 'Yes: stopping diarrhoea with a worsening patient is a red flag.'], ['He is getting better', 0, 'Not with distension and hypotension.'], ['Stop the vancomycin', 0, 'He needs escalation, not less treatment.']] }] },
      { id: 'quiz', t: 'Quick quiz', k: 'Check understanding', type: 'quiz', items: [
        ['What kills C. difficile spores on hands?', ['Alcohol gel', 'Soap and water (washing them off)', 'Gloves alone', 'Nothing'], 1, 'Soap and water physically removes spores.'],
        ['GDH positive, toxin negative means…', ['Active infection', 'Possible colonisation', 'No C. difficile', 'Test error'], 1, 'Organism present without toxin.'],
        ['First-line treatment for a first episode (NICE)?', ['IV metronidazole', 'Oral vancomycin', 'IV vancomycin', 'Ciprofloxacin'], 1, 'Oral vancomycin 125 mg QDS for 10 days.'],
        ['Which is a severity marker?', ['WCC over 15', 'Two stools a day', 'Age over 65', 'Taking a PPI'], 0, 'Also rising creatinine, fever and colitis.'],
        ['Which antibiotic is among the highest risk?', ['Doxycycline', 'Clindamycin', 'Nitrofurantoin', 'Gentamicin'], 1, 'Clindamycin is one of the 4 Cs.']] }
    ],
    take: 'Unformed stool, two-step test, side room, soap and water, oral vancomycin, and stop the antibiotic that caused it.',
    see: [['C. difficile guide', '/cdiff/'], ['Isolation', '/isolation/'], ['Teaching hub', '/teaching/']],
    on: {
      gdh: function (b, S, redraw) { S.gdh = b.getAttribute('data-v'); redraw('test'); },
      tox: function (b, S, redraw) { S.tox = b.getAttribute('data-v'); redraw('test'); },
      sv: function (b, S, redraw) { var v = b.getAttribute('data-v'); S.sv[v] = !S.sv[v]; redraw('sev'); }
    }
  });
})();
