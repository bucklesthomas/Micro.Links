/* Teaching page: penicillin allergy (uses teachpage.js). */
(function () {
  var PF = [['f', 'Five years or less since the reaction', 2], ['a', 'Anaphylaxis or angioedema, or a severe skin reaction (SJS, TEN, DRESS)', 2], ['t', 'Treatment was needed for the reaction', 1]];
  function penfast(S, T) {
    var n = PF.reduce(function (a, p) { return a + (S.pf[p[0]] ? p[2] : 0); }, 0);
    var band = n === 0 ? ['Very low risk', 'Under 1% chance of a positive allergy test.', 0] : n <= 2 ? ['Low risk', 'Under 5% chance of a positive allergy test: suitable for a direct oral challenge pathway.', 1] : n === 3 ? ['Moderate risk', 'Around 20%: refer for allergy assessment before rechallenge.', 2] : ['High risk', 'Around 50%: avoid; specialist allergy assessment.', 3];
    return '<div class="tq-curb"><div class="tp-check tq-list">' + PF.map(function (p) { var on = !!S.pf[p[0]]; return '<button type="button" class="tp-ck' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-x="pf" data-v="' + p[0] + '"><i aria-hidden="true"></i><span><b>' + T.esc(p[1]) + '</b><em>' + p[2] + ' point' + (p[2] > 1 ? 's' : '') + '</em></span></button>'; }).join('') + '</div>' +
      '<div class="tp-nres"><p class="tp-score"><b class="b' + (band[2] < 2 ? 0 : band[2] === 2 ? 2 : 3) + '">' + n + '</b><span>PEN-FAST</span></p><p class="tq-band b' + (band[2] < 2 ? 0 : band[2] === 2 ? 1 : 2) + '">' + band[0] + '</p><p class="tp-nresp b' + (band[2] < 2 ? 0 : band[2] === 2 ? 2 : 3) + '">' + T.esc(band[1]) + '</p></div></div>' +
      T.p('PEN-FAST (Trubiano 2020): a score under 3 identifies low-risk patients. Only use it with a clear history, and follow your local de-labelling pathway.') +
      T.ask('Take an allergy history from a patient on the ward with a penicillin label. What four things do you ask?', 'What happened, how long after the dose, how long ago, and what treatment was needed (plus: have they had a penicillin since?).');
  }
  var TYPES = [
    ['imm', 'Immediate (IgE-mediated)', 'Within about an hour: urticaria, angioedema, wheeze, anaphylaxis', 'True allergy risk: avoid until assessed; can test and challenge in an allergy service'],
    ['del', 'Delayed, mild', 'Days into a course: itchy maculopapular rash, no mucosal or organ involvement', 'Often low risk: many can be de-labelled after oral challenge'],
    ['scar', 'Severe delayed (SCAR)', 'Blistering, mucosal ulcers, peeling (SJS/TEN), fever, eosinophilia and organ involvement (DRESS)', 'Never rechallenge: lifelong avoidance of the drug'],
    ['int', 'Intolerance or side effect', 'Nausea, diarrhoea, thrush, headache', 'Not allergy: record as intolerance; penicillins can be used'],
    ['viral', 'Rash with a viral illness', 'Childhood rash with amoxicillin during an infection (for example EBV)', 'Usually the infection, not allergy: often de-labelled']];
  function types(S, T) {
    var sel = S.ty, t = TYPES.filter(function (x) { return x[0] === sel; })[0];
    var svg = '<svg viewBox="0 0 600 70" class="tp-svg" role="img" aria-label="When reactions happen after a dose"><line class="tb-axis" x1="20" x2="580" y1="34" y2="34"/>' +
      [[20, 'Dose'], [120, '1 hour'], [300, '1–3 days'], [460, '1–8 weeks']].map(function (p) { return '<g class="tb-st done"><circle cx="' + p[0] + '" cy="34" r="5"/><text x="' + p[0] + '" y="60" text-anchor="' + (p[0] === 20 ? 'start' : 'middle') + '">' + p[1] + '</text></g>'; }).join('') +
      '<rect class="tp-imm" x="24" y="14" width="96" height="10" rx="5"/><text class="tp-tl" x="72" y="10" text-anchor="middle">Immediate</text>' +
      '<rect class="tp-del" x="200" y="14" width="200" height="10" rx="5"/><text class="tp-tl" x="300" y="10" text-anchor="middle">Delayed rash</text>' +
      '<rect class="tp-scar" x="380" y="14" width="190" height="10" rx="5"/><text class="tp-tl" x="475" y="10" text-anchor="middle">SJS/TEN, DRESS</text></svg>';
    return svg + T.opts('ty', TYPES.map(function (x) { return [x[0], x[1]]; }), sel) +
      '<div class="tp-orgcard">' + (t ? '<dl class="pk-dl"><dt>Looks like</dt><dd>' + T.esc(t[2]) + '</dd><dt>What it means</dt><dd>' + T.esc(t[3]) + '</dd></dl>' : '<p class="ab-note">Tap a reaction type.</p>') + '</div>';
  }
  var XR = [['ceph', 'Cephalosporins', 'About 1–2% cross-reactivity, mostly between drugs with similar side chains (for example amoxicillin and cefalexin). Most patients with a non-severe penicillin allergy can have ceftriaxone or cefuroxime.'], ['carb', 'Carbapenems', 'Under 1%: can usually be given, even after immediate reactions, with appropriate monitoring.'], ['az', 'Aztreonam', 'Negligible, except with ceftazidime (shared side chain).']];
  function cross(S, T) {
    var x = XR.filter(function (r) { return r[0] === S.xr; })[0];
    return T.p('If a patient is genuinely penicillin allergic, which other β-lactams can they have?') + T.chips('xr', XR.map(function (r) { return [r[0], r[1]]; }), S.xr) + '<div class="tp-orgcard">' + (x ? '<p class="tp-p">' + T.esc(x[2]) + '</p>' : '') + '</div>' +
      '<p class="tp-p">Never give any β-lactam after a severe delayed reaction (SJS, TEN or DRESS) without specialist advice.</p>';
  }
  TeachPage({
    host: 'tpp',
    state: { pf: {}, ty: null, xr: 'ceph' },
    objectives: ['Explain why a false penicillin allergy label causes harm.', 'Take a structured allergy history and score it with PEN-FAST.', 'Tell immediate, delayed, severe and non-allergic reactions apart.', 'Know which β-lactams can be used in genuine penicillin allergy.', "Explain the immunology of drug allergy and the evidence for direct oral challenge."],
    plans: { 5: { penfast: 3, pearls: 2 }, 10: { penfast: 3, types: 4, pearls: 3 }, 20: { penfast: 3, types: 4, cross: 2, case: 7, quiz: 4 } },
    sections: [
      { id: 'penfast', t: 'Score it: PEN-FAST', k: 'Interactive', type: 'html', html: penfast },
      { id: 'types', t: 'What kind of reaction?', k: 'Diagram', type: 'html', html: types },
      { id: 'cross', t: 'Cross-reactivity', k: 'Interactive', type: 'html', html: cross },
      { id: 'deep', t: 'Going deeper', k: 'For final-year students', type: 'deep', items: [["Types of hypersensitivity", "Gell and Coombs type I (IgE): urticaria, angioedema, anaphylaxis within an hour. Type II: haemolytic anaemia. Type III: serum sickness. Type IV (T cell): delayed rashes, and the severe cutaneous reactions SJS/TEN, DRESS and AGEP."], ["Why cross-reactivity happens", "Most cross-reactions are driven by the R1 side chain, not the shared β-lactam ring. Amoxicillin shares side chains with cefalexin and cefadroxil; ceftazidime shares one with aztreonam. Choosing a drug with a different side chain lowers the risk."], ["The harm of the label", "In a UK cohort (Blumenthal, BMJ 2018), a penicillin allergy label was linked to a 69% higher risk of MRSA and a 26% higher risk of C. difficile, from greater use of broad-spectrum alternatives."], ["Testing", "Skin prick and intradermal testing detect IgE-mediated allergy but are resource-heavy. Specific IgE blood tests have limited sensitivity. An oral challenge under observation is the reference standard."], ["Severe delayed reactions", "SJS and TEN (mucosal ulceration, skin detachment) and DRESS (rash, fever, eosinophilia, organ involvement, weeks after starting) need lifelong avoidance of the culprit and usually related drugs. Never challenge."], ["Who to de-label first", "People who will need penicillin: pregnancy (group B strep prophylaxis), recurrent infections, before surgery or chemotherapy, and anyone with endocarditis or syphilis risk."]] },
      { id: 'trial', t: 'Key trial: PALACE', k: 'Evidence', type: 'trial', trial: {"name": "PALACE", "cite": "Copaescu AM et al. JAMA Intern Med 2023;183:944–52", "q": "For low-risk patients, is a direct oral challenge as safe as skin testing first?", "who": "382 adults with a low-risk penicillin allergy history (PEN-FAST under 3)", "outcome": "Positive immediate reaction to the oral challenge", "newArm": "going straight to oral challenge", "arms": [["Direct oral challenge", 0.5], ["Skin test, then challenge", 0.5]], "ans": 1, "result": "Immediate reactions occurred in 0.5% in both groups, with no serious reactions: direct oral challenge was non-inferior.", "meaning": "Low-risk patients can be de-labelled with an oral challenge without skin testing, which makes de-labelling possible on general wards and in clinics."} },
      { id: 'pearls', t: 'Clinical pearls', k: 'Remember', type: 'pearls', items: [
        ['About 1 in 10 have the label', 'But over 90% of them are not truly allergic.'],
        ['The label causes harm', 'Broader, less effective antibiotics, more C. difficile and MRSA, longer stays.'],
        ['Write down what happened', '“Penicillin allergy” alone is useless; record the reaction, timing and treatment.'],
        ['Side effects are not allergy', 'Nausea and diarrhoea are intolerance.'],
        ['Previous tolerance counts', 'Check the records: many “allergic” patients have had amoxicillin since.'],
        ['Severe delayed reactions are different', 'SJS, TEN and DRESS mean lifelong avoidance.']] },
      { id: 'case', t: 'Unfolding case', k: 'Work through together', type: 'case', end: 'Case complete. Discuss: how does your hospital de-label penicillin allergy?', steps: [
        { t: 'Admission', s: 'Mr G, 55, has cellulitis. His record says “penicillin allergy”. He remembers a rash as a child when given amoxicillin for an ear infection. No swelling or breathing problems; no treatment needed.', q: 'What is his PEN-FAST score?', o: [['0: over 5 years ago, not severe, no treatment', 1, 'Yes: very low risk.'], ['3: because it was a rash', 0, 'A mild rash does not score.'], ['5: any reaction is high risk', 0, 'PEN-FAST separates low from high risk.']] },
        { t: 'Treatment', s: 'Your local pathway allows a direct oral challenge for low-risk patients.', q: 'What do you do?', o: [['Offer an oral amoxicillin challenge, then use flucloxacillin if negative', 1, 'Yes: de-labelling gives him the best antibiotic now and for life.'], ['Give clarithromycin and leave the label', 0, 'A worse antibiotic and the label persists.'], ['Give IV vancomycin', 0, 'Unnecessary and less effective for streptococci.']] },
        { t: 'After the challenge', s: 'He tolerates amoxicillin with no reaction after observation.', q: 'What else must happen?', o: [['Remove the label from all records and tell him and his GP', 1, 'Yes: otherwise the label returns at the next admission.'], ['Nothing more', 0, 'Labels persist unless removed everywhere.'], ['Keep the label just in case', 0, 'He has proven tolerance.']] }] },
      { id: 'quiz', t: 'Quick quiz', k: 'Check understanding', type: 'quiz', items: [
        ['What proportion of penicillin allergy labels are wrong?', ['About 10%', 'About 50%', 'Over 90%', 'None'], 2, 'Over 90%.'],
        ['Which reaction means lifelong avoidance?', ['Nausea', 'Childhood rash', 'Stevens–Johnson syndrome', 'Diarrhoea'], 2, 'Severe cutaneous reactions.'],
        ['A PEN-FAST score of 1 means…', ['High risk', 'Low risk', 'Moderate risk', 'Not applicable'], 1, 'Under 3 is low risk.'],
        ['Which β-lactam has the lowest cross-reactivity with penicillin?', ['Cefalexin', 'Aztreonam', 'Amoxicillin', 'Co-amoxiclav'], 1, 'Aztreonam (except with ceftazidime).'],
        ['Which is an intolerance, not an allergy?', ['Urticaria', 'Angioedema', 'Diarrhoea', 'Anaphylaxis'], 2, 'Gastrointestinal side effects.']] }
    ],
    take: 'Ask what actually happened: most penicillin allergy labels are wrong, and removing them helps the patient for life.',
    see: [['Penicillin allergy guide', '/penicillin-allergy/'], ['PEN-FAST', '/scores/'], ['Teaching hub', '/teaching/']],
    on: {
      pf: function (b, S, redraw) { var v = b.getAttribute('data-v'); S.pf[v] = !S.pf[v]; redraw('penfast'); },
      ty: function (b, S, redraw) { var v = b.getAttribute('data-v'); S.ty = S.ty === v ? null : v; redraw('types'); },
      xr: function (b, S, redraw) { S.xr = b.getAttribute('data-v'); redraw('cross'); }
    }
  });
})();
