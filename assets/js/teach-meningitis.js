/* Teaching page: meningitis (uses teachpage.js). */
(function () {
  var PRE = { normal: [2, 0, 0.35, 0.65], bact: [1800, 90, 2.6, 0.15], viral: [180, 15, 0.7, 0.62], tb: [220, 20, 2.8, 0.25] };
  function wccOf(p) { return Math.round(Math.pow(10, p / 100 * Math.log10(5000))); }
  function posOf(w) { return Math.round(Math.log10(Math.max(1, w)) / Math.log10(5000) * 100); }
  function scores(c) {
    var w = c[0], n = c[1], pr = c[2], g = c[3];
    if (w <= 5 && pr <= 0.45 && g >= 0.6) return { normal: 1 };
    var b = (w > 100 ? 1 : 0) + (n >= 60 ? 1.5 : 0) + (pr > 1 ? 1 : 0) + (g < 0.36 ? 1.5 : 0);
    var v = (w > 5 && w < 1000 ? 1 : 0) + (n < 50 ? 1.5 : 0) + (pr <= 1 ? 1 : 0) + (g >= 0.5 ? 1.5 : 0);
    var t = (w > 5 && w < 500 ? 1 : 0) + (n < 50 ? 1 : 0) + (pr > 1 ? 1.5 : 0) + (g < 0.5 ? 1.5 : 0);
    return { bact: b / 5, viral: v / 5, tb: t / 5 };
  }
  function out(S, T) {
    var s = scores(S.csf);
    if (s.normal) return '<div class="tq-verdict green"><b>Normal CSF</b><p>White cells 5 or fewer, normal protein and glucose ratio.</p></div>';
    var L = [['bact', 'Bacterial', 'high'], ['viral', 'Viral', 'low'], ['tb', 'TB or fungal', 'mid']];
    return '<div class="tm-bars">' + L.map(function (l) { var p = Math.round(s[l[0]] * 100); return '<div class="tm-b"><span>' + l[1] + '</span><span class="tm-tr"><i class="' + l[2] + '" style="width:' + p + '%"></i></span><b>' + (p >= 70 ? 'Typical' : p >= 40 ? 'Possible' : 'Less likely') + '</b></div>'; }).join('') + '</div>';
  }
  var SL = [['w', 'White cells (cells/mm³)'], ['n', 'Neutrophils (%)'], ['p', 'Protein (g/L)'], ['g', 'CSF to blood glucose ratio']];
  function fmt(i, c) { return i === 0 ? c[0] : i === 1 ? c[1] + '%' : i === 2 ? c[2].toFixed(1) : c[3].toFixed(2); }
  function csf(S, T) {
    var c = S.csf;
    var vals = [posOf(c[0]), c[1], Math.round(c[2] * 10), Math.round(c[3] * 100)], mm = [[0, 100], [0, 100], [1, 50], [5, 90]];
    return '<div class="tq-uti"><div>' + SL.map(function (s, i) { return '<div class="ab-sec"><h4>' + s[1] + '</h4><div class="pk-range"><input type="range" min="' + mm[i][0] + '" max="' + mm[i][1] + '" value="' + vals[i] + '" data-xin="csf" data-i="' + i + '" aria-label="' + s[1] + '"><output class="tm-o' + i + '">' + fmt(i, c) + '</output></div></div>'; }).join('') +
      '<div class="ab-aw tp-pre"><span class="tp-prel">Try:</span>' + [['normal', 'Normal'], ['bact', 'Bacterial'], ['viral', 'Viral'], ['tb', 'TB']].map(function (p) { return '<button type="button" class="sp-chip" data-x="cpre" data-v="' + p[0] + '">' + p[1] + '</button>'; }).join('') + '</div></div>' +
      '<div class="tm-out" aria-live="polite">' + out(S, T) + '</div></div>' +
      T.p('Patterns overlap, especially early or after antibiotics: a partly treated bacterial meningitis can look viral. Gram stain, culture and PCR make the diagnosis. Always send a paired blood glucose.') +
      T.ask('Why might the first CSF in bacterial meningitis show mostly lymphocytes?', 'Very early disease and Listeria can give a lymphocytic picture; prior antibiotics can also change the pattern.');
  }
  TeachPage({
    host: 'tpm',
    state: { csf: PRE.bact.slice() },
    objectives: ['Recognise meningitis, including when the classic signs are absent.', 'Give antibiotics and dexamethasone within the hour without waiting for tests.', 'Interpret CSF results.', 'Know who needs prophylaxis and public health input.', "Explain the pathophysiology behind dexamethasone, and the wider differential of meningitis and encephalitis."],
    plans: { 5: { hour: 3, pearls: 2 }, 10: { hour: 3, csf: 4, pearls: 3 }, 20: { hour: 3, csf: 4, ct: 3, case: 6, quiz: 4 } },
    sections: [
      { id: 'hour', t: 'The first hour', k: 'Checklist', type: 'check', intro: 'A patient has fever, headache and neck stiffness. Ask the group what happens in the first hour.', done: 'Antibiotics within the hour; the lumbar puncture can follow if it is safe.', items: [
        ['Blood cultures and meningococcal PCR', 'Take them first, but do not delay treatment.'],
        ['IV ceftriaxone 2 g', 'Every 12 hours for bacterial meningitis.'],
        ['Dexamethasone with or before the first antibiotic dose', 'Reduces deafness and death in pneumococcal meningitis.'],
        ['Add amoxicillin if Listeria risk', 'Over 60, immunocompromised, pregnant.'],
        ['Add aciclovir if encephalitis possible', 'Confusion, seizures, focal signs.'],
        ['Lumbar puncture if safe', 'CT first only if there are specific concerns.'],
        ['Tell public health if meningococcal disease suspected', 'Contacts need prophylaxis.']] },
      { id: 'csf', t: 'Read the CSF', k: 'Interactive', type: 'html', html: csf },
      { id: 'ct', t: 'CT before the LP?', k: 'Flip cards', type: 'cards', l1: 'Why', l2: 'Do', intro: 'Most patients do not need a CT first. Ask the group which features mean they do.', cards: [
        ['Focal neurological signs', 'Possible mass lesion or abscess', 'CT first; give antibiotics before the scan'],
        ['Papilloedema', 'Raised intracranial pressure', 'CT first'],
        ['New seizures', 'Possible structural cause', 'CT first'],
        ['Reduced consciousness (GCS under 12) or falling', 'Risk of herniation', 'CT first, often critical care'],
        ['Severe immunocompromise', 'Abscess or toxoplasmosis', 'CT first'],
        ['None of these', 'LP is safe', 'LP without CT, ideally within an hour']] },
      { id: 'deep', t: 'Going deeper', k: 'For final-year students', type: 'deep', items: [["How bacteria reach the meninges", "Pneumococci and meningococci colonise the nasopharynx, invade the blood, and cross the blood–brain barrier. The inflammatory response in the subarachnoid space causes cerebral oedema, raised pressure and vasculitis: that inflammation, not just the bacteria, causes much of the damage, which is why steroids help."], ["Organisms by patient", "Adults: Streptococcus pneumoniae and Neisseria meningitidis. Over 60, immunocompromised, pregnant or alcohol dependent: add Listeria (amoxicillin). After neurosurgery or with a shunt: staphylococci and Gram-negatives. HIV with low CD4: cryptococcus and TB."], ["More from the CSF", "CSF lactate over 3.5 mmol/L favours bacterial infection. Multiplex PCR detects bacteria and viruses even after antibiotics. Measure opening pressure (very high in cryptococcal meningitis). For a traumatic tap, allow roughly 1 white cell per 700–1000 red cells."], ["Encephalitis", "Fever with altered behaviour, seizures or focal signs suggests encephalitis: start IV aciclovir for HSV, do MRI (temporal lobe changes) and send CSF HSV and VZV PCR. If infection is not found, think autoimmune encephalitis (for example anti-NMDA receptor)."], ["Prevention", "Vaccines have changed meningitis: Hib, pneumococcal conjugate, MenC, MenACWY and MenB. Close contacts of meningococcal disease in the 7 days before onset receive single-dose ciprofloxacin, and vaccine if the group is vaccine-preventable."], ["Complications and follow-up", "Hearing loss (refer all survivors of bacterial meningitis for audiology), seizures, hydrocephalus, hyponatraemia, and cognitive problems. Meningococcal septicaemia can cause limb loss."]] },
      { id: 'trial', t: 'Key trial: European dexamethasone study', k: 'Evidence', type: 'trial', trial: {"name": "European dexamethasone study", "cite": "de Gans J, van de Beek D. N Engl J Med 2002;347:1549–56", "q": "Does dexamethasone given with antibiotics improve outcome in adult bacterial meningitis?", "who": "301 adults with suspected bacterial meningitis", "outcome": "Unfavourable outcome (death or disability) at 8 weeks", "newArm": "dexamethasone", "arms": [["Dexamethasone", 15], ["Placebo", 25]], "ans": 0, "result": "Unfavourable outcome fell from 25% to 15%, and death from 15% to 7%; the benefit was greatest in pneumococcal meningitis.", "meaning": "Give dexamethasone 10 mg every 6 hours with or just before the first antibiotic dose in suspected bacterial meningitis; stop it if another cause is found."} },
      { id: 'pearls', t: 'Clinical pearls', k: 'Remember', type: 'pearls', items: [
        ['Do not wait for the LP', 'Antibiotics first: CSF culture may be negative but PCR still works.'],
        ['The triad is often incomplete', 'Fever, neck stiffness and confusion all together in under half.'],
        ['Rash can be late', 'Meningococcal septicaemia may start without a rash.'],
        ['Glass test', 'A non-blanching rash with fever is meningococcal until proven otherwise.'],
        ['Steroids with the first dose', 'Dexamethasone does little if started later.'],
        ['Hearing test afterwards', 'Deafness is a common complication.']] },
      { id: 'case', t: 'Unfolding case', k: 'Work through together', type: 'case', end: 'Case complete. Discuss: who needs prophylaxis, and who arranges it?', steps: [
        { t: 'Emergency department', s: 'Ms L, 19, a student, has 12 hours of headache, fever and vomiting. She has a few non-blanching spots on her legs. Blood pressure 92/55, pulse 124.', q: 'What first?', o: [['Blood cultures and IV ceftriaxone immediately; senior and critical care review', 1, 'Yes: suspected meningococcal sepsis is an emergency.'], ['CT head, then lumbar puncture', 0, 'Delays treatment: antibiotics first.'], ['Wait for the full blood count', 0, 'Do not wait.']] },
        { t: 'One hour later', s: 'She has had ceftriaxone, dexamethasone and fluid boluses. Blood pressure is now 100/60.', q: 'Who else needs to know?', o: [['UKHSA health protection team, for contact prophylaxis', 1, 'Yes: notify on suspicion; close contacts get ciprofloxacin.'], ['Nobody until the PCR is back', 0, 'Notify on clinical suspicion.'], ['Only her parents', 0, 'Public health must be informed.']] },
        { t: 'Results', s: 'Blood PCR confirms Neisseria meningitidis group B.', q: 'How long should she be treated?', o: [['Ceftriaxone for 5 days in total', 1, 'Yes: 5 days for uncomplicated meningococcal disease.'], ['14 days', 0, 'That is for pneumococcal disease.'], ['A single dose', 0, 'Not for treatment.']] }] },
      { id: 'quiz', t: 'Quick quiz', k: 'Check understanding', type: 'quiz', items: [
        ['When is dexamethasone given?', ['After the CT', 'With or before the first antibiotic dose', 'Only if pneumococcal', 'On day 2'], 1, 'With or before the first dose.'],
        ['Which CSF pattern suggests bacterial meningitis?', ['Lymphocytes, normal glucose', 'Neutrophils, high protein, low glucose', 'Normal cells', 'High glucose'], 1, 'Neutrophils, high protein, glucose ratio under about 0.36.'],
        ['Why add amoxicillin in older patients?', ['Pneumococcus', 'Listeria', 'Meningococcus', 'Haemophilus'], 1, 'Cephalosporins do not cover Listeria.'],
        ['Which feature means CT before LP?', ['Neck stiffness', 'Papilloedema', 'Fever', 'Headache'], 1, 'Signs of raised pressure or a mass.'],
        ['What do close contacts of meningococcal disease receive?', ['Nothing', 'Ciprofloxacin', 'Ceftriaxone for 7 days', 'Vaccine only'], 1, 'Single-dose ciprofloxacin (and vaccine if a vaccine-preventable group).']] }
    ],
    take: 'Suspect it, treat within the hour with ceftriaxone and dexamethasone, then investigate; tell public health early.',
    see: [['Meningitis and encephalitis', '/meningitis-encephalitis/'], ['Contact prophylaxis', '/contact-prophylaxis/'], ['Teaching hub', '/teaching/']],
    on: {
      csf: function (el, S) {
        var i = +el.getAttribute('data-i'), v = +el.value, c = S.csf;
        if (i === 0) c[0] = wccOf(v); else if (i === 1) c[1] = v; else if (i === 2) c[2] = v / 10; else c[3] = v / 100;
        var bd = el.closest('.tp-body'); bd.querySelector('.tm-o' + i).textContent = fmt(i, c); bd.querySelector('.tm-out').innerHTML = out(S);
      },
      cpre: function (b, S, redraw) { S.csf = PRE[b.getAttribute('data-v')].slice(); redraw('csf'); }
    }
  });
})();
