/* Teaching page: community-acquired pneumonia (uses teachpage.js). */
(function () {
  var C = [['c', 'Confusion', 'New disorientation in person, place or time'], ['u', 'Urea over 7 mmol/L', 'Hospital only (CRB-65 in the community)'], ['r', 'Respiratory rate 30 or more', ''], ['b', 'Blood pressure low', 'Systolic under 90 or diastolic 60 or less'], ['a', 'Age 65 or over', '']];
  function curb(S, T) {
    var n = C.filter(function (c) { return S.curb[c[0]]; }).length;
    var band = n <= 1 ? 0 : n === 2 ? 1 : 2;
    var res = [
      ['Low severity', 'Under 3% mortality in the original studies. Usually home treatment.', 'Amoxicillin 500 mg TDS for 5 days (doxycycline or clarithromycin if penicillin allergic).'],
      ['Moderate severity', 'Around 9% mortality. Consider hospital treatment.', 'Amoxicillin; add clarithromycin if atypical infection is suspected. 5 days.'],
      ['High severity', 'About 15% mortality at 3, rising to over 40% at 4 or 5. Hospital, and consider critical care if 4 or 5.', 'Co-amoxiclav plus clarithromycin (levofloxacin if penicillin allergic). Consider steroids. Review at 5 days.']][band];
    return '<div class="tq-curb"><div class="tp-check tq-list">' + C.map(function (c) { var on = !!S.curb[c[0]]; return '<button type="button" class="tp-ck' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-x="curb" data-v="' + c[0] + '"><i aria-hidden="true"></i><span><b>' + T.esc(c[1]) + '</b>' + (c[2] ? '<em>' + T.esc(c[2]) + '</em>' : '') + '</span></button>'; }).join('') + '</div>' +
      '<div class="tp-nres"><p class="tp-score"><b class="b' + (band === 0 ? 0 : band === 1 ? 2 : 3) + '">' + n + '</b><span>CURB-65</span></p><p class="tq-band b' + band + '">' + res[0] + '</p><p class="tp-nresp b' + (band === 0 ? 0 : band === 1 ? 2 : 3) + '">' + T.esc(res[1]) + '<br><b>Treat:</b> ' + T.esc(res[2]) + '</p></div></div>' +
      T.p('CURB-65 supports clinical judgement; it does not replace it. Low oxygen saturation, multilobar changes, frailty and social factors also matter. Antibiotic choices follow NICE (NG250); check your local policy.') +
      T.ask('Why does CURB-65 underestimate severity in young people?', 'Age contributes a point, and young patients maintain their blood pressure and urea until late. Look at oxygen requirement and the respiratory rate.');
  }
  var LOBES = [
    ['rul', 'Right upper lobe', 'Right upper zone shadowing, may sit against the horizontal fissure', 'Aspiration when lying, Klebsiella, TB (apical)'],
    ['rml', 'Right middle lobe', 'Loss of the right heart border (silhouette sign)', 'The right heart border touches the middle lobe'],
    ['rll', 'Right lower lobe', 'Loss of the right hemidiaphragm; right heart border still seen', 'Common site of aspiration when upright'],
    ['lul', 'Left upper lobe and lingula', 'Lingula: loss of the left heart border', 'The lingula touches the left heart border'],
    ['lll', 'Left lower lobe', 'Loss of the left hemidiaphragm; shadow behind the heart', 'Easy to miss: look through the heart']];
  function lungs(S, T) {
    var sel = S.lobe, h = '<div class="tq-lungs"><svg viewBox="0 0 300 230" class="tp-svg" role="group" aria-label="Lung lobes">';
    function mir(d) { return d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, function (m, x, y) { return (300 - +x) + ' ' + y; }); }
    var P = {
      rul: 'M112 28 C80 30 52 66 47 100 L124 100 L124 40 Z',
      rml: 'M47 100 L124 100 L124 150 L44 150 C44 132 45 115 47 100 Z',
      rll: 'M44 150 L124 150 L124 202 L48 202 C42 186 42 166 44 150 Z' };
    P.lul = mir('M112 28 C80 30 52 66 47 100 C45 118 44 136 44 150 L124 150 L124 40 Z');
    P.lll = mir('M44 150 L124 150 L124 202 L48 202 C42 186 42 166 44 150 Z');
    h += '<path class="tq-trachea" d="M150 6 V58 M150 58 L126 78 M150 58 L174 78"/>';
    LOBES.forEach(function (l) { var on = sel === l[0]; h += '<path class="tq-lobe' + (on ? ' on' : '') + '" d="' + P[l[0]] + '" data-x="lobe" data-v="' + l[0] + '" tabindex="0" role="button" aria-pressed="' + on + '" aria-label="' + T.esc(l[1]) + '"/>'; });
    h += '<path class="tq-heart" d="M134 112 C118 138 116 182 132 196 C152 210 196 204 204 180 C210 158 196 128 176 116 C162 108 146 106 134 112 Z"/><path class="tq-dia" d="M40 206 C70 194 104 196 128 204 M172 204 C196 198 230 198 262 210"/>';
    h += '<text class="tq-side" x="40" y="222">Right</text><text class="tq-side" x="236" y="222">Left</text></svg>';
    var l = LOBES.filter(function (x) { return x[0] === sel; })[0];
    h += '<div class="tp-orgcard" aria-live="polite">' + T.opts('lobe', LOBES.map(function (x) { return [x[0], x[1]]; }), sel) + (l ? '<dl class="pk-dl"><dt>On the X-ray</dt><dd>' + T.esc(l[2]) + '</dd><dt>Why</dt><dd>' + T.esc(l[3]) + '</dd></dl>' : '<p class="ab-note">Tap a lobe (as if facing the patient’s X-ray) to see which border it hides.</p>') + '</div></div>';
    return h + T.ask('Show a chest X-ray on the ward computer. Which borders can you see clearly?', 'Teach the silhouette sign: consolidation next to a structure of the same density hides its edge, which tells you which lobe is involved.');
  }
  TeachPage({
    host: 'tpn',
    state: { curb: {}, lobe: null },
    objectives: ['Score severity with CURB-65 and choose treatment by severity.', 'Name the common causes, including the atypicals.', 'Localise consolidation on a chest X-ray with the silhouette sign.', 'Know when to stop antibiotics and when to repeat the X-ray.', "Use the evidence on steroids, atypical cover and course length in pneumonia."],
    plans: { 5: { curb: 3, pearls: 2 }, 10: { curb: 3, causes: 3, lungs: 2, pearls: 2 }, 20: { curb: 3, causes: 4, lungs: 3, case: 6, quiz: 4 } },
    sections: [
      { id: 'curb', t: 'How sick? CURB-65', k: 'Interactive', type: 'html', html: curb },
      { id: 'causes', t: 'Which organism?', k: 'Flip cards', type: 'cards', l1: 'Clues', l2: 'Treatment point', intro: 'Ask the group for the clues to each before you flip.', cards: [
        ['Streptococcus pneumoniae', 'Commonest cause: sudden fever, rigors, pleuritic pain, rusty sputum, lobar consolidation', 'Amoxicillin works; urinary antigen helps'],
        ['Haemophilus influenzae', 'COPD and smokers', 'Amoxicillin often works; co-amoxiclav if β-lactamase producer'],
        ['Mycoplasma pneumoniae', 'Younger adults, outbreaks, dry cough, headache, rash, haemolysis', 'No cell wall: β-lactams do not work; use clarithromycin or doxycycline'],
        ['Legionella pneumophila', 'Travel, hot tubs, cooling towers; confusion, diarrhoea, low sodium, raised CK', 'Urinary antigen; clarithromycin or levofloxacin; notifiable'],
        ['Staphylococcus aureus', 'After influenza; cavitation; PVL strains cause necrotising pneumonia', 'Severe: needs specific cover and senior input'],
        ['Respiratory viruses', 'Influenza, RSV, COVID-19; seasonal', 'Viral PCR; antivirals for flu or COVID where indicated']] },
      { id: 'lungs', t: 'Where is it? The silhouette sign', k: 'Diagram', type: 'html', html: lungs },
      { id: 'deep', t: 'Going deeper', k: 'For final-year students', type: 'deep', items: [["Beyond CURB-65", "CURB-65 predicts death, not the need for intensive care. Low oxygen saturation, multilobar changes, a high respiratory rate and frailty matter too. SMART-COP and the Pneumonia Severity Index are alternatives; clinical judgement decides."], ["Do we need atypical cover?", "In CAP-START (NEJM 2015), β-lactam monotherapy was non-inferior to adding a macrolide or using a quinolone for patients on general wards. Atypical cover matters most in severe pneumonia, where macrolides may also help by dampening inflammation."], ["Aspiration", "Most aspiration pneumonia is caused by the usual respiratory organisms. Routine extra anaerobic cover is not needed unless there is a lung abscess or empyema (ATS/IDSA 2019). Chemical pneumonitis needs no antibiotics."], ["Course length", "In the PTC trial (Lancet 2021), stopping antibiotics after 3 days in patients who were stable was non-inferior to 8 days. Five days is the UK standard for most; longer for Legionella, S. aureus, empyema or abscess."], ["Pleural infection", "A parapneumonic effusion with pH under 7.2, pus, or organisms on Gram stain needs a chest drain. Intrapleural tPA with DNase helps if drainage fails (MIST-2)."], ["Hospital-acquired pneumonia", "Pneumonia starting 48 hours or more after admission. The organisms shift towards Gram-negatives (including Pseudomonas) and S. aureus, so treatment depends on severity, time in hospital and previous cultures."]] },
      { id: 'trial', t: 'Key trial: CAPE COD', k: 'Evidence', type: 'trial', trial: {"name": "CAPE COD", "cite": "Dequin PF et al. N Engl J Med 2023;388:1931–41", "q": "Does hydrocortisone reduce deaths in severe community-acquired pneumonia?", "who": "800 adults with severe CAP in intensive care (influenza and septic shock excluded)", "outcome": "Death at 28 days", "newArm": "hydrocortisone", "arms": [["Hydrocortisone", 6.2], ["Placebo", 11.9]], "ans": 0, "result": "Death at 28 days fell from 11.9% to 6.2%, and fewer patients needed intubation or vasopressors.", "meaning": "NICE (NG250) now suggests considering a corticosteroid for high-severity pneumonia in hospital. The trial excluded influenza and septic shock, so apply it to the right patients."} },
      { id: 'pearls', t: 'Clinical pearls', k: 'Remember', type: 'pearls', items: [
        ['Count the respiratory rate', 'Raised respiratory rate is the most sensitive sign of pneumonia.'],
        ['Five days is enough', 'Most patients who are improving can stop at 5 days.'],
        ['The X-ray lags behind', 'Changes can take 6 weeks or more to clear: only repeat if symptoms persist or cancer risk.'],
        ['Think atypical', 'β-lactams miss Mycoplasma and Legionella.'],
        ['Test for HIV', 'Pneumonia is an HIV indicator condition, especially if recurrent.'],
        ['Steroids for severe pneumonia', 'NICE now suggests a corticosteroid for high-severity pneumonia in hospital.']] },
      { id: 'case', t: 'Unfolding case', k: 'Work through together', type: 'case', end: 'Case complete. Discuss: what would make you think of Legionella in this patient?', steps: [
        { t: 'Emergency department', s: 'Mr C, 72, has 3 days of cough, fever and right-sided chest pain. He is confused. Respiratory rate 24, blood pressure 108/66, urea 9.2 mmol/L.', q: 'What is his CURB-65 score?', o: [['3: confusion, urea and age', 1, 'Yes: high severity.'], ['2: urea and age', 0, 'New confusion counts too.'], ['4: including respiratory rate', 0, 'The respiratory rate needs to be 30 or more.']] },
        { t: 'Investigations', s: 'Chest X-ray shows right lower zone consolidation with loss of the right hemidiaphragm.', q: 'What tests and treatment?', o: [['Blood and sputum cultures, urinary antigens, IV co-amoxiclav and clarithromycin', 1, 'Yes: high severity needs atypical cover and full tests.'], ['Oral amoxicillin and home', 0, 'Too mild for a CURB-65 of 3 with confusion.'], ['Wait for cultures before antibiotics', 0, 'Do not delay antibiotics in severe pneumonia.']] },
        { t: 'Day 3', s: 'He is better, eating and drinking. The pneumococcal urinary antigen is positive; Legionella is negative.', q: 'What next?', o: [['Stop clarithromycin, switch to oral amoxicillin, 5 days in total', 1, 'Yes: narrow to the organism and keep it short.'], ['Continue IV for 14 days', 0, 'Not needed for uncomplicated pneumococcal pneumonia.'], ['Add a quinolone', 0, 'No indication.']] }] },
      { id: 'quiz', t: 'Quick quiz', k: 'Check understanding', type: 'quiz', items: [
        ['What does the U in CURB-65 stand for?', ['Urine output', 'Urea over 7 mmol/L', 'Urate', 'Urgent'], 1, 'Urea over 7 mmol/L.'],
        ['Which organism is not covered by amoxicillin?', ['S. pneumoniae', 'Mycoplasma pneumoniae', 'Group A strep', 'Most H. influenzae'], 1, 'Mycoplasma has no cell wall.'],
        ['Loss of the right heart border suggests which lobe?', ['Right upper', 'Right middle', 'Right lower', 'Left lower'], 1, 'The silhouette sign: the middle lobe touches the right heart border.'],
        ['How long should most patients with CAP be treated?', ['3 days', '5 days', '10 days', '14 days'], 1, 'Five days, then stop if clinically stable.'],
        ['Which clue suggests Legionella?', ['Rusty sputum', 'Low sodium and diarrhoea', 'Young age', 'Wheeze'], 1, 'Hyponatraemia, diarrhoea, confusion and raised CK.']] }
    ],
    take: 'Score it with CURB-65, cover atypicals when severe, find the lobe with the silhouette sign, and stop at 5 days if better.',
    see: [['CURB-65', '/scores/'], ['Pneumonia (disease lookup)', '/diseases/#dz-cap'], ['Teaching hub', '/teaching/']],
    on: {
      curb: function (b, S, redraw) { var v = b.getAttribute('data-v'); S.curb[v] = !S.curb[v]; redraw('curb'); },
      lobe: function (b, S, redraw) { var v = b.getAttribute('data-v'); S.lobe = S.lobe === v ? null : v; redraw('lungs'); }
    }
  });
})();
