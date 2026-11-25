/* Teaching page: urinary tract infection (uses teachpage.js). */
(function () {
  var GROUPS = [['w', 'Woman under 65'], ['m', 'Man'], ['o', 'Aged 65 or over'], ['c', 'Has a catheter'], ['p', 'Pregnant']];
  var SX = [['dys', 'Dysuria'], ['freq', 'New frequency or urgency'], ['supra', 'Suprapubic pain'], ['loin', 'Loin pain, fever or rigors'], ['conf', 'New confusion only'], ['none', 'No urinary symptoms']];
  function verdict(S) {
    var g = S.ug, s = S.us, lower = ['dys', 'freq', 'supra'].filter(function (k) { return s[k]; }).length;
    if (!g) return null;
    if (g === 'p') return ['amber', 'Send a urine culture', 'In pregnancy, treat bacteriuria even without symptoms (it can lead to pyelonephritis and preterm birth). Choose an antibiotic safe in pregnancy; 7 days.'];
    if (s.loin) return ['red', 'Possible pyelonephritis or urosepsis', 'Send urine (and blood) cultures; treat with an antibiotic that reaches the kidney (not nitrofurantoin). Look for sepsis.'];
    if (g === 'c') {
      if (lower || s.conf) return ['amber', 'Catheter: do not dipstick', 'Look for systemic signs (fever, rigors, loin pain). If present, change the catheter, send urine from the new one and treat. Bacteria in catheter urine are expected and alone do not need treating.'];
      return ['green', 'Do not test or treat', 'Bacteria in urine from a long-term catheter are almost universal.'];
    }
    if (s.none) return ['green', 'Asymptomatic: do not test or treat', 'Asymptomatic bacteriuria is common, especially in older people, and treating it causes harm without benefit (except in pregnancy and before urological surgery).'];
    if (g === 'o') {
      if (lower >= 2) return ['amber', 'UTI likely', 'Do not dipstick over 65. Send a urine culture and treat (for example nitrofurantoin for lower UTI if kidney function allows).'];
      if (s.conf && !lower) return ['green', 'Look for other causes first', 'Confusion alone is not enough for a UTI diagnosis: think dehydration, constipation, pain, medicines, hypoxia and other infections. Review if urinary symptoms develop.'];
      return ['amber', 'Possible UTI', 'Not dipstick-guided over 65: assess clinically, send a culture, and consider other causes or a back-up prescription.'];
    }
    if (g === 'm') return ['amber', 'Send a urine culture', 'UTI in men is never “simple”: culture, treat for 7 days, and consider prostatitis (perineal pain, tender prostate) or obstruction.'];
    if (lower >= 2) return ['amber', 'UTI likely', 'In women under 65, two or more key symptoms make UTI likely: treat (nitrofurantoin for 3 days) without needing a dipstick.'];
    if (s.conf) return ['green', 'Look for other causes', 'Confusion alone does not point to a UTI.'];
    return ['amber', 'UTI less certain', 'With one symptom, a dipstick can help (nitrite or leucocytes with red cells); consider other causes, including sexually transmitted infection.'];
  }
  function tool(S, T) {
    var v = verdict(S);
    return '<div class="tq-uti"><div><div class="ab-sec"><h4>Patient</h4>' + T.opts('ug', GROUPS, S.ug, 'wide tq-g') + '</div>' +
      '<div class="ab-sec"><h4>Symptoms (tap all that apply)</h4><div class="ab-aw">' + SX.map(function (x) { var on = !!S.us[x[0]]; return '<button type="button" class="sp-chip' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-x="us" data-v="' + x[0] + '">' + T.esc(x[1]) + '</button>'; }).join('') + '</div></div></div>' +
      '<div class="tq-verdict ' + (v ? v[0] : 'none') + '" aria-live="polite">' + (v ? '<b>' + T.esc(v[1]) + '</b><p>' + T.esc(v[2]) + '</p>' : '<p class="ab-note">Choose a patient group and symptoms.</p>') + '</div></div>' +
      T.p('Based on the UKHSA diagnostic flowcharts and NICE NG109 and NG111. Treat symptoms, not urine.') +
      T.ask('Try “Aged 65 or over” with “New confusion only”. Why is this a common trap?', 'Older people often have bacteria in their urine without infection; a positive dipstick plus confusion leads to unnecessary antibiotics and missed real causes of delirium.');
  }
  var PARTS = [['kid', 'Kidney', 'Pyelonephritis', 'Loin pain, fever, rigors, vomiting', 'Antibiotic that reaches the kidney (cefalexin, co-amoxiclav or ciprofloxacin by culture); 7–10 days'], ['ure', 'Ureter', 'Obstructed infected kidney', 'Pyelonephritis with a stone: severe pain, sepsis', 'Emergency: urology to decompress (nephrostomy or stent)'], ['bla', 'Bladder', 'Cystitis', 'Dysuria, frequency, urgency, suprapubic pain', 'Nitrofurantoin 3 days (women), 7 days (men)'], ['pro', 'Prostate', 'Prostatitis', 'Fever, perineal pain, tender prostate, retention', 'Quinolone (or trimethoprim) for 14 days, then review'], ['cath', 'Catheter', 'Catheter-associated UTI', 'Fever, rigors, loin pain, new confusion with signs', 'Change the catheter, culture from the new one, treat 7 days']];
  function tract(S, T) {
    var sel = S.part, h = '<div class="tq-lungs"><svg viewBox="0 0 260 260" class="tp-svg" role="group" aria-label="Urinary tract">';
    var D = { kid: '<ellipse cx="70" cy="60" rx="28" ry="40"/><ellipse cx="190" cy="60" rx="28" ry="40"/>', ure: '<path d="M80 96 C90 140 110 160 118 180 M180 96 C170 140 150 160 142 180" class="tq-tube"/>', bla: '<path d="M96 176 C96 160 164 160 164 176 C170 210 150 224 130 224 C110 224 90 210 96 176 Z"/>', pro: '<ellipse cx="130" cy="232" rx="16" ry="9"/>', cath: '<path d="M130 240 V258" class="tq-tube cath"/><circle cx="130" cy="200" r="6" class="tq-bal"/>' };
    PARTS.forEach(function (p) { var on = sel === p[0]; h += '<g class="tq-part' + (on ? ' on' : '') + '" data-x="part" data-v="' + p[0] + '" tabindex="0" role="button" aria-pressed="' + on + '" aria-label="' + T.esc(p[1]) + '">' + D[p[0]] + '</g>'; });
    h += '</svg>';
    var p = PARTS.filter(function (x) { return x[0] === sel; })[0];
    h += '<div class="tp-orgcard">' + T.opts('part', PARTS.map(function (x) { return [x[0], x[1]]; }), sel) + (p ? '<h3>' + T.esc(p[2]) + '</h3><dl class="pk-dl"><dt>Looks like</dt><dd>' + T.esc(p[3]) + '</dd><dt>Treat</dt><dd>' + T.esc(p[4]) + '</dd></dl>' : '<p class="ab-note">Tap a part of the urinary tract.</p>') + '</div></div>';
    return h;
  }
  TeachPage({
    host: 'tpu',
    state: { ug: null, us: {}, part: null },
    objectives: ['Decide when to test and treat, and when not to (asymptomatic bacteriuria).', 'Use symptoms rather than dipsticks in older and catheterised patients.', 'Match the antibiotic to the site: bladder, kidney or prostate.', 'Recognise the obstructed infected kidney as an emergency.', "Use the evidence for first-line UTI treatment and the options for recurrent infection."],
    plans: { 5: { tool: 3, pearls: 2 }, 10: { tool: 4, tract: 3, pearls: 3 }, 20: { tool: 4, tract: 3, pearls: 2, case: 7, quiz: 4 } },
    sections: [
      { id: 'tool', t: 'Treat or not?', k: 'Interactive', type: 'html', html: tool },
      { id: 'tract', t: 'Where is the infection?', k: 'Diagram', type: 'html', html: tract },
      { id: 'deep', t: 'Going deeper', k: 'For final-year students', type: 'deep', items: [["How UTIs happen", "Most are ascending infections with gut E. coli. Uropathogenic strains carry fimbriae: type 1 fimbriae attach to the bladder, P fimbriae to the kidney (linked to pyelonephritis). Obstruction, stones, catheters and incomplete emptying all raise the risk."], ["Why not treat asymptomatic bacteriuria", "In older people and those with catheters, treating bacteriuria does not reduce symptomatic infection or death, and it increases resistance, C. difficile and side effects. The exceptions are pregnancy and before urological procedures that breach the mucosa."], ["Resistance and choices", "Trimethoprim resistance in E. coli is high, so check previous cultures. Nitrofurantoin is avoided if eGFR is under 45 (a short course may be used at 30–44 for resistant organisms). For ESBL-producing E. coli cystitis: nitrofurantoin, fosfomycin or pivmecillinam."], ["Recurrent UTI in women", "Two or more in 6 months, or three or more in a year. Options: self-care advice, vaginal oestrogen after the menopause, methenamine hippurate (non-inferior to antibiotic prophylaxis in the ALTAR trial), and antibiotic prophylaxis."], ["Men", "All UTIs in men are treated as complicated: culture, 7 days, and look for prostatitis (14 days) and outflow obstruction. Recurrent UTI in men needs urological assessment."], ["Catheters", "Bacteria form biofilms on catheters within days. Remove catheters as early as possible; for infection, change the catheter before starting treatment and send urine from the new one."]] },
      { id: 'trial', t: 'Key trial: Nitrofurantoin versus fosfomycin', k: 'Evidence', type: 'trial', trial: {"name": "Nitrofurantoin versus fosfomycin", "cite": "Huttner A et al. JAMA 2018;319:1781–9", "q": "Is single-dose fosfomycin as good as 5 days of nitrofurantoin for cystitis?", "who": "513 non-pregnant women with uncomplicated lower UTI", "outcome": "Clinical resolution at 28 days", "newArm": "single-dose fosfomycin", "arms": [["Nitrofurantoin for 5 days", 70], ["Fosfomycin 3 g single dose", 58]], "ans": 2, "result": "Clinical resolution was 70% with nitrofurantoin and 58% with fosfomycin; microbiological cure was also better with nitrofurantoin.", "meaning": "Nitrofurantoin stays first line for cystitis when kidney function allows; fosfomycin is a useful second-line option, especially for resistant organisms."} },
      { id: 'pearls', t: 'Clinical pearls', k: 'Remember', type: 'pearls', items: [
        ['No dipsticks over 65 or with catheters', 'They are positive in most people without infection.'],
        ['Smelly or cloudy urine is not a UTI', 'Without symptoms it usually means dehydration.'],
        ['Nitrofurantoin stays in the bladder', 'Do not use it for pyelonephritis or urosepsis.'],
        ['Men get 7 days', 'And a culture; think about the prostate.'],
        ['An infected obstructed kidney needs draining', 'Antibiotics alone fail: call urology.'],
        ['Check the previous cultures', 'Resistant E. coli (ESBL) is common: past results guide your choice.']] },
      { id: 'case', t: 'Unfolding case', k: 'Work through together', type: 'case', end: 'Case complete. Discuss: why did the first antibiotic choice need to change?', steps: [
        { t: 'Care home call', s: 'Mrs D, 84, is more confused today. The carer reports a positive dipstick (leucocytes and nitrites). She has no fever, dysuria or other urinary symptoms; she has been drinking less.', q: 'What do you advise?', o: [['Do not treat yet: look for other causes and encourage fluids', 1, 'Yes: dipsticks are unreliable over 65 and confusion alone is not a UTI.'], ['Start trimethoprim', 0, 'This treats a dipstick, not a patient.'], ['Send her to hospital', 0, 'Not on these findings alone.']] },
        { t: 'Two days later', s: 'She now has a temperature of 38.6°C, rigors and right loin tenderness. Pulse 108, blood pressure 104/62.', q: 'What now?', o: [['Urine and blood cultures, IV antibiotics for pyelonephritis, sepsis assessment', 1, 'Yes: this is upper tract infection with possible sepsis.'], ['Nitrofurantoin', 0, 'It does not reach the kidney.'], ['Wait for the culture', 0, 'She is unwell: treat now.']] },
        { t: 'Results', s: 'Ultrasound shows a dilated right kidney with a stone at the pelviureteric junction. She remains hypotensive despite fluids.', q: 'What is the key next step?', o: [['Urgent urology review for decompression', 1, 'Yes: an infected obstructed kidney is a urological emergency.'], ['Switch to meropenem and wait', 0, 'Source control matters more than antibiotic breadth.'], ['Repeat the ultrasound tomorrow', 0, 'Too late: she needs drainage now.']] }] },
      { id: 'quiz', t: 'Quick quiz', k: 'Check understanding', type: 'quiz', items: [
        ['When should asymptomatic bacteriuria be treated?', ['In all older people', 'In pregnancy', 'With a catheter', 'Never'], 1, 'Pregnancy (and before urological procedures).'],
        ['Why not use nitrofurantoin for pyelonephritis?', ['Too toxic', 'It does not reach the kidney', 'Resistance is universal', 'It is too expensive'], 1, 'It concentrates in the bladder only.'],
        ['How long do men with cystitis need treatment?', ['3 days', '7 days', '14 days', '28 days'], 1, 'Seven days.'],
        ['Where should urine come from in a long-term catheter?', ['The bag', 'The sampling port of a new catheter', 'A dipstick in the bag', 'A clean catch'], 1, 'Change the catheter first.'],
        ['Most UTIs are caused by…', ['Pseudomonas', 'E. coli', 'Staph aureus', 'Candida'], 1, 'E. coli.']] }
    ],
    take: 'Treat symptoms, not urine: no dipsticks over 65 or with catheters, match the drug to the site, and drain an obstructed kidney.',
    see: [['Lower UTI', '/diseases/#dz-cystitis'], ['Pyelonephritis', '/diseases/#dz-pyelo'], ['Teaching hub', '/teaching/']],
    on: {
      ug: function (b, S, redraw) { S.ug = b.getAttribute('data-v'); redraw('tool'); },
      us: function (b, S, redraw) { var v = b.getAttribute('data-v'); if (v === 'none') S.us = { none: !S.us.none }; else { S.us[v] = !S.us[v]; S.us.none = false; } redraw('tool'); },
      part: function (b, S, redraw) { var v = b.getAttribute('data-v'); S.part = S.part === v ? null : v; redraw('tract'); }
    }
  });
})();
