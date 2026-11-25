/* Teaching page: tuberculosis (uses teachpage.js). */
(function () {
  var DRUGS = [['R', 'Rifampicin', 0, 6, 'Orange urine and tears; hepatitis; many drug interactions (contraceptive pill, warfarin, antiretrovirals)'], ['H', 'Isoniazid', 0, 6, 'Peripheral neuropathy (give pyridoxine); hepatitis'], ['Z', 'Pyrazinamide', 0, 2, 'Hepatitis; gout and joint pain; rash'], ['E', 'Ethambutol', 0, 2, 'Optic neuritis: check visual acuity and colour vision before and during']];
  var MON = [[0, 'Start', 'Baseline LFTs, U&E, FBC, HIV, hepatitis B and C; visual acuity and colour vision; weight for dosing; notify; contact tracing begins.'], [0.5, '2 weeks', 'Infectiousness falls: most patients with drug-susceptible pulmonary TB are no longer infectious after 2 weeks of effective treatment.'], [1, '1 month', 'Review adherence, side effects and LFTs if symptoms or risk factors; consider directly observed therapy if adherence is a worry.'], [2, '2 months', 'End of the intensive phase: stop pyrazinamide and ethambutol if susceptibilities confirmed; sputum culture to check response.'], [4, '4 months', 'Continuation phase: rifampicin and isoniazid; check weight gain and symptoms.'], [6, '6 months', 'End of treatment for drug-susceptible pulmonary TB (longer for CNS TB: 12 months).']];
  function draw(S, T) {
    var m = S.month, x = function (v) { return v / 6 * 100; }, cur = 0;
    MON.forEach(function (r, i) { if (m >= r[0]) cur = i; });
    var bars = DRUGS.map(function (d) { var on = m >= d[2] && m < d[3] + (d[3] === 6 ? 0.01 : 0); return '<div class="tt-row' + (on ? ' fit' : ' late') + '"><span class="tt-name"><b>' + d[0] + '</b> ' + d[1] + '</span><span class="tt-track"><i class="tt-bar" style="left:' + x(d[2]) + '%;width:' + (x(d[3]) - x(d[2])) + '%"></i><i class="tt-now" style="left:' + x(m) + '%"></i></span></div>'; }).join('');
    var r = MON[cur];
    return { bars: bars, card: '<h3>' + T.esc(r[1]) + '</h3><p class="tp-p">' + T.esc(r[2]) + '</p>', out: (m < 1 ? Math.round(m * 4) + ' weeks' : m.toFixed(1).replace('.0', '') + ' months') };
  }
  function timeline(S, T) {
    var v = draw(S, T);
    return T.p('Standard treatment for drug-susceptible TB: RHZE for 2 months (intensive phase), then RH for 4 months (continuation phase). Drag through the 6 months.') +
      '<div class="pk-range"><input type="range" min="0" max="6" step="0.25" value="' + S.month + '" data-xin="month" aria-label="Months of treatment"><output class="tb6-out">' + v.out + '</output></div>' +
      '<div class="tt-rows tb6-bars">' + v.bars + '</div><div class="tt-axis"><span style="left:0">0</span><span style="left:33.3%">2 months</span><span style="left:66.6%">4 months</span><span style="left:100%">6</span></div>' +
      '<div class="tp-orgcard tb6-card">' + v.card + '</div>';
  }
  TeachPage({
    host: 'tpx',
    state: { month: 0 },
    objectives: ['Recognise who might have TB and how to test for it.', 'Describe the 6-month treatment and why four drugs are used.', 'Know the main side effects and how to monitor for them.', 'Explain isolation, notification and contact tracing.', "Explain the pathogenesis, diagnostics, drug resistance and HIV co-infection issues in TB, and the move to shorter regimens."],
    plans: { 5: { timeline: 3, pearls: 2 }, 10: { timeline: 4, se: 3, pearls: 3 }, 20: { timeline: 4, se: 3, ph: 3, case: 6, quiz: 4 } },
    sections: [
      { id: 'timeline', t: 'Six months of treatment', k: 'Interactive timeline', type: 'html', html: timeline },
      { id: 'se', t: 'Side effects by drug', k: 'Flip cards', type: 'cards', l1: 'Watch for', l2: 'Check', intro: 'Ask the group what to warn the patient about for each drug.', cards: [
        ['Rifampicin', 'Orange urine and tears (stains contact lenses); hepatitis; interactions', 'LFTs; check every other medicine, including contraception'],
        ['Isoniazid', 'Tingling in hands and feet; hepatitis', 'Pyridoxine for at-risk patients; LFTs'],
        ['Pyrazinamide', 'Hepatitis, joint pain, gout', 'LFTs; urate if joint symptoms'],
        ['Ethambutol', 'Blurred vision, red-green colour loss', 'Visual acuity and colour vision before and during; dose by weight and kidney function']] },
      { id: 'ph', t: 'Protecting others', k: 'Checklist', type: 'check', intro: 'Ask the group what needs to happen beyond the patient.', done: 'TB care is a team effort: TB nurses, public health and the GP.', items: [
        ['Side room for suspected infectious pulmonary TB', 'Negative pressure if MDR-TB is possible or the patient is near immunocompromised people.'],
        ['FFP3 masks for staff in some situations', 'Follow local policy; surgical mask for the patient when moving.'],
        ['Notify UKHSA', 'TB is notifiable.'],
        ['Contact tracing', 'Household and close contacts screened by the TB service.'],
        ['Test for HIV, hepatitis B and C', 'Co-infection changes management.'],
        ['Support adherence', 'Directly observed therapy, social support, free prescriptions for TB.']] },
      { id: 'deep', t: 'Going deeper', k: 'For final-year students', type: 'deep', items: [["Latent and active TB", "Inhaled droplet nuclei are contained in granulomas. Most infected people have latent infection (no symptoms, not infectious). Reactivation risk rises with HIV, anti-TNF and other biologics, diabetes, chronic kidney disease, silicosis and older age."], ["Diagnosis", "Smear microscopy is quick but insensitive. Culture (liquid media, 2–6 weeks) remains the reference. Molecular tests (Xpert MTB/RIF Ultra) detect TB and rifampicin resistance within hours. In England, whole-genome sequencing gives full resistance profiles. IGRA tests detect infection, not active disease."], ["Drug resistance", "MDR-TB is resistant to rifampicin and isoniazid; pre-XDR and XDR add resistance to quinolones and bedaquiline or linezolid. WHO now recommends a 6-month all-oral regimen (BPaLM: bedaquiline, pretomanid, linezolid, moxifloxacin) for most MDR-TB."], ["TB and HIV", "Start antiretrovirals within 2 weeks of TB treatment if CD4 is under 50 (later for TB meningitis). Watch for IRIS (paradoxical worsening). Rifampicin interacts with many antiretrovirals; rifabutin is an alternative."], ["Extrapulmonary TB", "TB meningitis: 12 months of treatment with dexamethasone. Pericarditis, spinal TB (Pott’s disease) and lymph node TB are common. Extrapulmonary TB is not usually infectious unless there is also lung disease."], ["Treating latent infection", "For close contacts and people starting immunosuppression: 3 months of rifampicin and isoniazid, or 6 months of isoniazid (with pyridoxine), after excluding active disease."]] },
      { id: 'trial', t: 'Key trial: Study 31 / A5349', k: 'Evidence', type: 'trial', trial: {"name": "Study 31 / A5349", "cite": "Dorman SE et al. N Engl J Med 2021;384:1705–18", "q": "Can a 4-month rifapentine and moxifloxacin regimen replace the standard 6 months?", "who": "2516 people aged 12 or over with drug-susceptible pulmonary TB", "outcome": "Unfavourable outcome (failure, relapse or death)", "newArm": "the 4-month regimen", "arms": [["4 months rifapentine–moxifloxacin", 15.5], ["Standard 6 months", 14.6]], "ans": 1, "result": "Unfavourable outcomes were 15.5% with the 4-month regimen and 14.6% with standard treatment: the 4-month regimen was non-inferior.", "meaning": "Shorter TB treatment is possible, and WHO recommends this 4-month regimen. In the UK the 6-month regimen remains standard; shorter regimens are a specialist decision."} },
      { id: 'pearls', t: 'Clinical pearls', k: 'Remember', type: 'pearls', items: [
        ['Think TB', 'Cough over 3 weeks, weight loss, night sweats, haemoptysis.'],
        ['Three sputum samples', 'Including a rapid molecular test for rifampicin resistance.'],
        ['Four drugs prevent resistance', 'Monotherapy breeds resistance quickly.'],
        ['Rifampicin interacts with almost everything', 'Check before starting.'],
        ['Extrapulmonary TB is common', 'Lymph nodes, spine, pleura, meninges, abdomen.'],
        ['Latent TB matters', 'Screen before biologics and other immunosuppression.']] },
      { id: 'case', t: 'Unfolding case', k: 'Work through together', type: 'case', end: 'Case complete. Discuss: how would you support him to finish 6 months of treatment?', steps: [
        { t: 'Admission', s: 'Mr M, 28, moved from Pakistan 2 years ago. He has a 6-week cough, night sweats and 6 kg weight loss. Chest X-ray: right upper lobe cavitation.', q: 'What first?', o: [['Side room, three sputum samples, HIV test, refer to the TB team', 1, 'Yes: isolate and investigate.'], ['Start co-amoxiclav for pneumonia', 0, 'The history and X-ray point to TB.'], ['Bronchoscopy straight away', 0, 'Sputum first.']] },
        { t: 'Results', s: 'Sputum smear positive for acid-fast bacilli; rapid molecular test detects M. tuberculosis without rifampicin resistance.', q: 'What treatment?', o: [['RHZE for 2 months, then RH for 4 months, with pyridoxine', 1, 'Yes: standard 6-month treatment.'], ['Rifampicin alone', 0, 'Monotherapy causes resistance.'], ['Wait for culture (6 weeks)', 0, 'Treat now: the rapid test confirms TB.']] },
        { t: 'Week 3', s: 'He feels better but his ALT has risen to 6 times the upper limit, and he has nausea.', q: 'What do you do?', o: [['Stop the hepatotoxic drugs and discuss with the TB team for a reintroduction plan', 1, 'Yes: drug-induced hepatitis needs a structured restart.'], ['Carry on: it will settle', 0, 'Over 5 times the limit (or 3 times with symptoms) means stopping.'], ['Stop all treatment for good', 0, 'He still needs treatment: drugs are reintroduced in a planned way.']] }] },
      { id: 'quiz', t: 'Quick quiz', k: 'Check understanding', type: 'quiz', items: [
        ['How long is standard treatment for pulmonary TB?', ['2 months', '6 months', '12 months', '2 years'], 1, '6 months.'],
        ['Which drug causes orange urine?', ['Isoniazid', 'Rifampicin', 'Pyrazinamide', 'Ethambutol'], 1, 'Rifampicin.'],
        ['Which drug needs eye checks?', ['Rifampicin', 'Isoniazid', 'Pyrazinamide', 'Ethambutol'], 3, 'Ethambutol: optic neuritis.'],
        ['Why give pyridoxine?', ['To prevent isoniazid neuropathy', 'To prevent hepatitis', 'To boost rifampicin', 'For nausea'], 0, 'Isoniazid neuropathy.'],
        ['How long for TB meningitis?', ['6 months', '9 months', '12 months', '24 months'], 2, '12 months, with steroids.']] }
    ],
    take: 'Long cough and weight loss: isolate, three sputums, HIV test; four drugs for 2 months then two for 4, with monitoring and support.',
    see: [['TB guide', '/tb/'], ['TB drug monographs', 'https://www.tbdrugmonographs.co.uk/'], ['Teaching hub', '/teaching/']],
    on: { month: function (el, S, redraw, T) { S.month = +el.value; var bd = el.closest('.tp-body'), v = draw(S, T); bd.querySelector('.tb6-bars').innerHTML = v.bars; bd.querySelector('.tb6-card').innerHTML = v.card; bd.querySelector('.tb6-out').textContent = v.out; } }
  });
})();
