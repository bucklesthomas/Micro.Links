/* Teaching page: infective endocarditis (uses teachpage.js). */
(function () {
  var MAJ = [['mic', 'Typical organism in 2 or more blood culture sets (or persistent bacteraemia)', 'Viridans streptococci, S. gallolyticus, HACEK, S. aureus, Enterococcus faecalis'], ['img', 'Echo or imaging evidence of endocarditis', 'Vegetation, abscess, valve perforation, new prosthetic valve leak; or PET-CT uptake around a prosthetic valve']];
  var MIN = [['pre', 'Predisposition', 'Previous endocarditis, prosthetic valve, congenital heart disease, injecting drug use, intracardiac device'], ['fev', 'Fever of 38°C or more', ''], ['vas', 'Vascular phenomena', 'Emboli, septic pulmonary infarcts, mycotic aneurysm, intracranial haemorrhage, Janeway lesions, conjunctival haemorrhages'], ['imm', 'Immunological phenomena', 'Glomerulonephritis, Osler’s nodes, Roth spots, positive rheumatoid factor'], ['mib', 'Microbiological evidence not meeting a major criterion', 'For example one positive set of a typical organism']];
  function duke(S, T) {
    var M = MAJ.filter(function (x) { return S.dk[x[0]]; }).length, m = MIN.filter(function (x) { return S.dk[x[0]]; }).length;
    var r = (M >= 2 || (M === 1 && m >= 3) || m >= 5) ? ['red', 'Definite endocarditis'] : ((M === 1 && m >= 1) || m >= 3) ? ['amber', 'Possible endocarditis'] : ['green', 'Does not meet the criteria'];
    function row(x, kind) { var on = !!S.dk[x[0]]; return '<button type="button" class="tp-ck' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-x="dk" data-v="' + x[0] + '"><i aria-hidden="true"></i><span><b>' + T.esc(x[1]) + '</b>' + (x[2] ? '<em>' + T.esc(x[2]) + '</em>' : '') + '</span></button>'; }
    return '<div class="tq-uti"><div><h4 class="vc-h">Major</h4><div class="tp-check">' + MAJ.map(row).join('') + '</div><h4 class="vc-h">Minor</h4><div class="tp-check">' + MIN.map(row).join('') + '</div></div>' +
      '<div class="tq-verdict ' + r[0] + '" aria-live="polite"><b>' + r[1] + '</b><p>' + M + ' major, ' + m + ' minor. Definite: 2 major, or 1 major and 3 minor, or 5 minor. Possible: 1 major and 1 minor, or 3 minor.</p></div></div>' +
      T.p('Simplified from the 2023 Duke–ISCVID criteria for teaching; the full criteria include surgical and pathological findings and more detail on organisms and imaging.') +
      T.ask('Tick only “typical organism in 2 sets” and “fever”. What would you do next to make the diagnosis definite?', 'Echocardiography (TOE if TTE is negative or a prosthetic valve), and look for vascular and immunological signs.');
  }
  TeachPage({
    host: 'tpe',
    state: { dk: {} },
    objectives: ['Recognise when to suspect endocarditis.', 'Use the Duke criteria to make the diagnosis.', 'Know the first steps: three blood culture sets, echo and the endocarditis team.', 'Know the common organisms and when surgery is needed.', "Explain the pathogenesis, imaging and surgical indications for endocarditis, and the evidence for oral step-down."],
    plans: { 5: { duke: 3, pearls: 2 }, 10: { duke: 4, signs: 3, first: 3 }, 20: { duke: 4, signs: 3, first: 3, case: 6, quiz: 4 } },
    sections: [
      { id: 'duke', t: 'Make the diagnosis: Duke criteria', k: 'Interactive', type: 'html', html: duke },
      { id: 'signs', t: 'Peripheral signs', k: 'Flip cards', type: 'cards', l1: 'Where and what', l2: 'Why', intro: 'Look at the hands, eyes and nails of a patient together. Ask the group to describe each sign before flipping.', cards: [
        ['Splinter haemorrhages', 'Thin red-brown lines under the nails', 'Small emboli or vasculitis; also seen with trauma'],
        ['Janeway lesions', 'Painless flat red spots on the palms and soles', 'Septic microemboli (vascular phenomenon)'],
        ['Osler’s nodes', 'Painful raised nodules on finger and toe pads', 'Immune complex deposition (immunological)'],
        ['Roth spots', 'Retinal haemorrhages with pale centres', 'Immunological; look with the ophthalmoscope'],
        ['Conjunctival petechiae', 'Small haemorrhages on the conjunctiva', 'Vascular phenomenon'],
        ['Clubbing and splenomegaly', 'Late signs of subacute endocarditis', 'Long-standing infection']] },
      { id: 'first', t: 'The first steps', k: 'Checklist', type: 'check', intro: 'A patient has a fever and a new murmur. Ask the group what happens next.', done: 'The endocarditis team (cardiology, cardiac surgery, microbiology or ID) decides on treatment and surgery.', items: [
        ['Three sets of blood cultures before antibiotics', 'From separate venepunctures, if the patient is stable enough to wait.'],
        ['Echo: TTE first, TOE if negative or high suspicion', 'TOE sees vegetations, abscesses and prosthetic valves much better.'],
        ['Look for complications', 'Heart failure, stroke, emboli, kidney injury, conduction delay on the ECG.'],
        ['Refer to the endocarditis team', 'Early surgical opinion for heart failure, abscess or large vegetations.'],
        ['Find the source', 'Teeth, skin, lines, injecting, bowel (S. gallolyticus: colonoscopy).']] },
      { id: 'deep', t: 'Going deeper', k: 'For final-year students', type: 'deep', items: [["How vegetations form", "Damaged endothelium (from turbulent flow, valve disease or devices) attracts platelets and fibrin, forming a sterile thrombus. Bacteria in the blood, often from the mouth or skin, stick to it using adhesins and are protected inside the growing vegetation."], ["Organisms by setting", "Native valves: viridans streptococci and S. aureus. Early prosthetic valves (within a year): S. aureus, coagulase-negative staphylococci, Gram-negatives and fungi. People who inject drugs: S. aureus, often right-sided. Culture-negative: prior antibiotics, Coxiella, Bartonella, HACEK and Tropheryma whipplei."], ["Imaging", "TOE is far more sensitive than TTE, especially for prosthetic valves and abscesses. PET-CT is a major criterion for prosthetic valve and device infection in the 2023 Duke–ISCVID criteria. Cardiac CT shows abscesses and pseudoaneurysms."], ["When to operate", "Heart failure from valve destruction (the commonest reason), uncontrolled infection (abscess, fistula, persistent bacteraemia, fungal or resistant organisms), and preventing emboli (large vegetations, especially with embolic events; EASE trial). Decisions belong to the endocarditis team."], ["Antibiotic principles", "Bactericidal treatment for 4–6 weeks, guided by MIC. Gentamicin is no longer routine for native valve staphylococcal endocarditis because of kidney toxicity. Rifampicin is added for prosthetic valve staphylococcal infection. Many patients finish via OPAT."], ["Neurological complications", "Stroke from emboli or mycotic aneurysm affects up to a third. Image the brain if there are neurological symptoms; timing of cardiac surgery after stroke and the use of anticoagulants need specialist discussion."]] },
      { id: 'trial', t: 'Key trial: POET', k: 'Evidence', type: 'trial', trial: {"name": "POET", "cite": "Iversen K et al. N Engl J Med 2019;380:415–24", "q": "Can stable patients with left-sided endocarditis switch to oral antibiotics?", "who": "400 stable adults with left-sided endocarditis (streptococci, E. faecalis, S. aureus or coagulase-negative staphylococci) after at least 10 days of IV treatment", "outcome": "Death, unplanned surgery, embolic events or relapse at 6 months", "newArm": "switching to oral", "arms": [["Partial oral treatment", 9.0], ["Full IV treatment", 12.1]], "ans": 1, "result": "The combined outcome occurred in 9.0% with oral step-down and 12.1% with IV treatment: oral was non-inferior.", "meaning": "Carefully selected, stable patients can finish endocarditis treatment with oral antibiotics, as the ESC 2023 guideline now allows."} },
      { id: 'pearls', t: 'Clinical pearls', k: 'Remember', type: 'pearls', items: [
        ['Fever plus a murmur', 'Endocarditis until proven otherwise.'],
        ['S. aureus in blood: echo', 'Every patient with S. aureus bacteraemia needs one.'],
        ['Right-sided in people who inject', 'Tricuspid valve, with septic lung emboli.'],
        ['Streptococcus gallolyticus', 'Look for colorectal cancer.'],
        ['Culture-negative?', 'Prior antibiotics, Bartonella, Coxiella, HACEK, fungi: serology and PCR.'],
        ['Long treatment', 'Usually 4–6 weeks; some patients can switch to oral (POET trial).']] },
      { id: 'case', t: 'Unfolding case', k: 'Work through together', type: 'case', end: 'Case complete. Discuss: what are the indications for surgery?', steps: [
        { t: 'Presentation', s: 'Mr K, 68, has 6 weeks of fevers, sweats and weight loss. He had a dental extraction 2 months ago and has a known bicuspid aortic valve. There is a new early diastolic murmur.', q: 'First step?', o: [['Three sets of blood cultures before antibiotics', 1, 'Yes: he is stable, so get the organism first.'], ['Start IV antibiotics straight away', 0, 'Only if unstable: otherwise cultures first.'], ['CT abdomen for cancer', 0, 'Endocarditis must be excluded first.']] },
        { t: 'Results', s: 'All three sets grow Streptococcus mitis (a viridans streptococcus). TTE shows a 9 mm vegetation on the aortic valve with moderate regurgitation.', q: 'Duke criteria?', o: [['Definite: two major criteria', 1, 'Yes: typical organism in 2 or more sets, plus echo evidence.'], ['Possible', 0, 'He has two major criteria.'], ['Rejected', 0, 'No.']] },
        { t: 'Day 5', s: 'On IV benzylpenicillin he becomes breathless with pulmonary oedema; repeat echo shows severe aortic regurgitation.', q: 'What next?', o: [['Urgent cardiac surgical opinion', 1, 'Yes: heart failure from valve destruction is the commonest indication for surgery.'], ['Change the antibiotic', 0, 'The problem is the valve, not the antibiotic.'], ['Give diuretics and continue', 0, 'He needs surgery.']] }] },
      { id: 'quiz', t: 'Quick quiz', k: 'Check understanding', type: 'quiz', items: [
        ['How many blood culture sets before treatment in suspected endocarditis?', ['One', 'Two', 'Three', 'Six'], 2, 'Three sets from separate venepunctures.'],
        ['Painful nodules on the finger pads are…', ['Janeway lesions', 'Osler’s nodes', 'Splinters', 'Roth spots'], 1, 'Osler’s nodes are painful; Janeway lesions are painless.'],
        ['Which valve is usually affected in people who inject drugs?', ['Mitral', 'Aortic', 'Tricuspid', 'Pulmonary'], 2, 'Tricuspid.'],
        ['Which organism should prompt a colonoscopy?', ['S. aureus', 'S. gallolyticus', 'E. faecalis', 'S. mitis'], 1, 'Streptococcus gallolyticus.'],
        ['Commonest indication for surgery?', ['Fever', 'Heart failure', 'Murmur', 'Raised CRP'], 1, 'Heart failure from valve damage.']] }
    ],
    take: 'Fever plus a murmur: three cultures, then echo, then the Duke criteria and the endocarditis team.',
    see: [['Endocarditis guide', '/endocarditis/'], ['Duke criteria', '/scores/'], ['Strep species and IE risk', '/strep-ie-risk/'], ['Teaching hub', '/teaching/']],
    on: { dk: function (b, S, redraw) { var v = b.getAttribute('data-v'); S.dk[v] = !S.dk[v]; redraw('duke'); } }
  });
})();
