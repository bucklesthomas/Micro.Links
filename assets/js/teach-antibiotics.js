/* Teaching page: antibiotic classes (uses teachpage.js). */
(function () {
  var TARGETS = [
    ['wall', 'Cell wall', 'Penicillins (amoxicillin, flucloxacillin), cephalosporins (ceftriaxone), carbapenems (meropenem), glycopeptides (vancomycin)', 'Bactericidal. β-lactams bind penicillin-binding proteins; vancomycin binds the wall building blocks (Gram-positives only).'],
    ['ribo', 'Ribosome (protein synthesis)', 'Aminoglycosides (gentamicin), macrolides (clarithromycin), tetracyclines (doxycycline), clindamycin, linezolid', 'Mostly bacteriostatic, except aminoglycosides. Clindamycin and linezolid also switch off toxins.'],
    ['dna', 'DNA', 'Quinolones (ciprofloxacin), metronidazole, rifampicin (RNA polymerase)', 'Quinolones block DNA gyrase; metronidazole damages DNA in anaerobes only.'],
    ['fol', 'Folate synthesis', 'Trimethoprim, sulfamethoxazole (together: co-trimoxazole)', 'Two steps of the same pathway: together they are synergistic.'],
    ['mem', 'Cell membrane', 'Daptomycin (Gram-positives), colistin (Gram-negatives)', 'Disrupt the membrane; reserved for resistant organisms.']];
  function cell(S, T) {
    var sel = S.tg, h = '<div class="tq-lungs ta-cell"><svg viewBox="0 0 280 200" class="tp-svg" role="group" aria-label="Antibiotic targets in a bacterial cell">';
    h += '<g class="ta-z' + (sel === 'wall' ? ' on' : '') + '" data-x="tg" data-v="wall" tabindex="0" role="button" aria-label="Cell wall"><rect class="ta-wall" x="10" y="10" width="260" height="180" rx="80"/></g>';
    h += '<g class="ta-z' + (sel === 'mem' ? ' on' : '') + '" data-x="tg" data-v="mem" tabindex="0" role="button" aria-label="Cell membrane"><rect class="ta-mem" x="24" y="24" width="232" height="152" rx="70"/></g>';
    h += '<rect class="ta-cyto" x="30" y="30" width="220" height="140" rx="66"/>';
    h += '<g class="ta-z' + (sel === 'dna' ? ' on' : '') + '" data-x="tg" data-v="dna" tabindex="0" role="button" aria-label="DNA"><path class="ta-dna" d="M70 100 C90 70 110 130 130 100 C150 70 170 130 190 100"/><text x="130" y="140" text-anchor="middle">DNA</text></g>';
    h += '<g class="ta-z' + (sel === 'ribo' ? ' on' : '') + '" data-x="tg" data-v="ribo" tabindex="0" role="button" aria-label="Ribosome"><ellipse class="ta-rib" cx="208" cy="76" rx="18" ry="12"/><ellipse class="ta-rib" cx="208" cy="94" rx="14" ry="8"/><text x="208" y="122" text-anchor="middle">Ribosome</text></g>';
    h += '<g class="ta-z' + (sel === 'fol' ? ' on' : '') + '" data-x="tg" data-v="fol" tabindex="0" role="button" aria-label="Folate synthesis"><rect class="ta-fol" x="60" y="50" width="58" height="22" rx="6"/><text x="89" y="65" text-anchor="middle">Folate</text></g>';
    h += '</svg>';
    var t = TARGETS.filter(function (x) { return x[0] === sel; })[0];
    h += '<div class="tp-orgcard">' + T.opts('tg', TARGETS.map(function (x) { return [x[0], x[1]]; }), sel) + (t ? '<dl class="pk-dl"><dt>Classes</dt><dd>' + T.esc(t[2]) + '</dd><dt>Key point</dt><dd>' + T.esc(t[3]) + '</dd></dl>' : '<p class="ab-note">Tap a part of the cell to see which antibiotics act there.</p>') + '</div></div>';
    return h + '<p class="tp-p">Full detail is on the <a href="' + T.esc(T.url('/mechanisms/')) + '">mechanisms diagram</a>.</p>';
  }
  var DRUGS = [['Amoxicillin', 'Penicillin'], ['Ceftriaxone', 'Cephalosporin'], ['Meropenem', 'Carbapenem'], ['Gentamicin', 'Aminoglycoside'], ['Clarithromycin', 'Macrolide'], ['Doxycycline', 'Tetracycline'], ['Ciprofloxacin', 'Quinolone'], ['Vancomycin', 'Glycopeptide'], ['Trimethoprim', 'Folate antagonist'], ['Metronidazole', 'Nitroimidazole'], ['Linezolid', 'Oxazolidinone'], ['Flucloxacillin', 'Penicillin'], ['Co-amoxiclav', 'Penicillin with β-lactamase inhibitor'], ['Teicoplanin', 'Glycopeptide']];
  var CLASSES = ['Penicillin', 'Cephalosporin', 'Carbapenem', 'Aminoglycoside', 'Macrolide', 'Tetracycline', 'Quinolone', 'Glycopeptide', 'Folate antagonist', 'Nitroimidazole', 'Oxazolidinone', 'Penicillin with β-lactamase inhibitor'];
  function options(i) {
    var right = DRUGS[i][1], others = CLASSES.filter(function (c) { return c !== right; });
    var pick = [right, others[(i * 3) % others.length], others[(i * 5 + 2) % others.length], others[(i * 7 + 4) % others.length]].filter(function (x, k, a) { return a.indexOf(x) === k; });
    return pick.sort(function (a, b) { return ((a.length * 7 + i) % 5) - ((b.length * 7 + i) % 5); });
  }
  function match(S, T) {
    var i = S.mi % DRUGS.length, d = DRUGS[i], a = S.ma, opts = options(i);
    return '<div class="ta-match"><p class="ta-score">Score: <b>' + S.ms + '</b> of ' + S.mt + '</p><p class="ta-drug">' + T.esc(d[0]) + '</p><p class="ab-note">Which class?</p><div class="opts wide">' + opts.map(function (o) {
      var cls = a == null ? '' : (o === d[1] ? ' right' : (a === o ? ' wrong' : ' faded'));
      return '<button type="button" class="opt tp-co' + cls + '" data-x="mpick" data-v="' + T.esc(o) + '"' + (a != null ? ' disabled' : '') + '><span class="opt-text">' + T.esc(o) + '</span></button>';
    }).join('') + '</div>' + (a != null ? '<button type="button" class="reset tp-next" data-x="mnext">Next drug</button>' : '') + '</div>';
  }
  TeachPage({
    host: 'tpa',
    state: { tg: null, mi: 0, ma: null, ms: 0, mt: 0 },
    objectives: ['Name the main antibiotic classes with an example of each.', 'Explain where each class acts on the bacterial cell.', 'Know which classes cover Gram-positives, Gram-negatives, anaerobes and atypicals.', 'Read a drug chart and say what each antimicrobial is for.'],
    plans: { 5: { match: 3, pearls: 2 }, 10: { cell: 3, match: 3, cover: 3, pearls: 1 }, 20: { cell: 3, match: 4, cover: 4, case: 5, quiz: 4 } },
    sections: [
      { id: 'cell', t: 'Where antibiotics act', k: 'Diagram', type: 'html', html: cell },
      { id: 'match', t: 'Match the drug to its class', k: 'Game', type: 'html', html: match },
      { id: 'cover', t: 'What covers what?', k: 'Flip cards', type: 'cards', l1: 'Good choices', l2: 'Watch out', intro: 'Ask the group for an antibiotic for each before flipping.', cards: [
        ['Streptococci', 'Benzylpenicillin, amoxicillin', 'Rising macrolide and tetracycline resistance'],
        ['Staphylococcus aureus (MSSA)', 'Flucloxacillin, cefazolin', 'Amoxicillin alone does not work (penicillinase)'],
        ['MRSA', 'Vancomycin, teicoplanin, linezolid, doxycycline (by susceptibility)', 'No β-lactam except ceftaroline works'],
        ['E. coli and coliforms', 'Co-amoxiclav, cephalosporins, gentamicin, ciprofloxacin (by susceptibility)', 'ESBL producers need a carbapenem for serious infection'],
        ['Anaerobes', 'Metronidazole, co-amoxiclav, piperacillin–tazobactam, carbapenems', 'Gentamicin and quinolones do not cover them'],
        ['Atypicals (Mycoplasma, Legionella)', 'Clarithromycin, doxycycline, levofloxacin', 'β-lactams do not work'],
        ['Pseudomonas', 'Piperacillin–tazobactam, ceftazidime, meropenem, ciprofloxacin, gentamicin', 'Co-amoxiclav and ceftriaxone do not cover it'],
        ['Enterococci', 'Amoxicillin (E. faecalis), vancomycin, linezolid', 'Cephalosporins never work']] },
      { id: 'pearls', t: 'Clinical pearls', k: 'Remember', type: 'pearls', items: [
        ['Know what each drug is for', 'Every antibiotic on the chart should have an indication and a stop or review date.'],
        ['Cephalosporins miss enterococci', 'And are a major C. difficile risk.'],
        ['Gentamicin: levels and kidneys', 'Monitor levels and creatinine; avoid long courses.'],
        ['Clarithromycin interacts', 'With statins, anticoagulants and many others; check the QT.'],
        ['Quinolones carry warnings', 'Tendons, aorta, nerves and mental health: use only when needed.'],
        ['Oral can be as good as IV', 'Many drugs (doxycycline, linezolid, metronidazole, ciprofloxacin) are well absorbed.']] },
      { id: 'case', t: 'Drug chart round', k: 'Work through together', type: 'case', end: 'Case complete. Discuss: what is the plan for each antibiotic on a chart you see today?', steps: [
        { t: 'Day 3', s: 'Mrs F, 70, admitted with pyelonephritis. Chart: IV piperacillin–tazobactam, IV gentamicin and oral clarithromycin. Urine grew E. coli susceptible to co-amoxiclav, cefalexin and ciprofloxacin. She is better.', q: 'Which antibiotic has no clear reason to be there?', o: [['Clarithromycin', 1, 'Yes: it covers atypicals, which are not relevant to pyelonephritis.'], ['Piperacillin–tazobactam', 0, 'It was reasonable empirically, but can now be narrowed.'], ['None of them', 0, 'Clarithromycin has no indication here.']] },
        { t: 'Narrowing', s: 'She is eating and drinking, temperature normal for 48 hours.', q: 'What next?', o: [['Stop gentamicin and clarithromycin; switch to oral cefalexin or ciprofloxacin to complete 7–10 days', 1, 'Yes: narrow, oral, defined duration.'], ['Continue all three for 14 days', 0, 'Unnecessary breadth, toxicity and C. difficile risk.'], ['Switch to IV meropenem', 0, 'Broader, not narrower.']] }] },
      { id: 'quiz', t: 'Quick quiz', k: 'Check understanding', type: 'quiz', items: [
        ['Which class is ceftriaxone?', ['Penicillin', 'Cephalosporin', 'Carbapenem', 'Macrolide'], 1, 'Third-generation cephalosporin.'],
        ['Which drug covers anaerobes?', ['Gentamicin', 'Metronidazole', 'Ciprofloxacin', 'Vancomycin (IV)'], 1, 'Metronidazole.'],
        ['Which drug does NOT cover MRSA?', ['Vancomycin', 'Linezolid', 'Flucloxacillin', 'Teicoplanin'], 2, 'MRSA is resistant to flucloxacillin.'],
        ['Which class acts on the ribosome?', ['Penicillins', 'Aminoglycosides', 'Quinolones', 'Glycopeptides'], 1, 'Aminoglycosides bind the 30S subunit.'],
        ['Which is never active against enterococci?', ['Amoxicillin', 'Vancomycin', 'Cephalosporins', 'Linezolid'], 2, 'Enterococci are intrinsically resistant to cephalosporins.']] }
    ],
    take: 'Know each antibiotic’s class, target and what it covers, and give every prescription a reason and a review date.',
    see: [['Mechanisms diagram', '/mechanisms/'], ['Spectrum chart', '/spectrum/'], ['Teaching hub', '/teaching/']],
    on: {
      tg: function (b, S, redraw) { var v = b.getAttribute('data-v'); S.tg = S.tg === v ? null : v; redraw('cell'); },
      mpick: function (b, S, redraw) { if (S.ma != null) return; S.ma = b.getAttribute('data-v'); S.mt++; if (S.ma === DRUGS[S.mi % DRUGS.length][1]) S.ms++; redraw('match'); },
      mnext: function (b, S, redraw) { S.mi++; S.ma = null; redraw('match'); }
    }
  });
})();
