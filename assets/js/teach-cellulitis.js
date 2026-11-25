/* Teaching page: cellulitis (uses teachpage.js). */
(function () {
  var LAYERS = [
    ['epi', 'Epidermis', 18, 'Impetigo', 'Superficial: honey-crusted lesions, often around the mouth and nose. S. aureus or group A strep.', 'Hydrogen peroxide cream or fusidic acid if localised; flucloxacillin if widespread.'],
    ['upper', 'Upper dermis', 22, 'Erysipelas', 'Raised, sharply demarcated, bright red edge; often the face or leg. Usually streptococcal.', 'Treated like cellulitis (flucloxacillin, or phenoxymethylpenicillin if clearly streptococcal).'],
    ['deep', 'Deep dermis and fat', 46, 'Cellulitis', 'Spreading redness with a poorly defined edge, warmth, swelling and tenderness. Streptococci or S. aureus.', 'Flucloxacillin; mark the edge and review at 48 hours.'],
    ['fascia', 'Fascia', 14, 'Necrotising fasciitis', 'Infection tracks along the fascia: pain out of proportion, rapid spread, then skin necrosis, bullae and crepitus. A surgical emergency.', 'Immediate surgical debridement plus broad IV antibiotics with clindamycin.'],
    ['muscle', 'Muscle', 40, 'Pyomyositis and myonecrosis', 'Deep muscle infection or gas gangrene (Clostridium perfringens): severe pain, swelling and systemic toxicity.', 'Imaging, surgery and IV antibiotics.']];
  function layers(S, T) {
    var y = 30, h = '<div class="tc-skin"><svg viewBox="0 0 590 200" class="tp-svg" role="group" aria-label="Skin layers and the infections at each depth">';
    h += '<text class="tc-lbl hd" x="10" y="18">Layer</text><text class="tc-lbl hd" x="330" y="18">Infection at this depth</text>';
    LAYERS.forEach(function (l, i) {
      var on = S.layer === l[0];
      h += '<g class="tc-l l' + i + (on ? ' on' : '') + '" data-x="layer" data-v="' + l[0] + '" tabindex="0" role="button" aria-pressed="' + on + '" aria-label="' + T.esc(l[1] + ': ' + l[3]) + '"><rect x="10" y="' + y + '" width="300" height="' + l[2] + '"/>' +
        '<text class="tc-lbl" x="20" y="' + (y + l[2] / 2 + 4) + '">' + T.esc(l[1]) + '</text><path class="tc-lead" d="M310 ' + (y + l[2] / 2) + ' H326"/><text class="tc-inf" x="330" y="' + (y + l[2] / 2 + 4) + '">' + T.esc(l[3]) + '</text></g>';
      y += l[2];
    });
    // hair and vessel details
    h += '<path class="tc-hair" d="M70 30 L66 6 M150 30 L156 8"/><path class="tc-vessel" d="M40 80 C120 70, 200 95, 300 82"/>';
    h += '</svg></div>';
    var l = LAYERS.filter(function (x) { return x[0] === S.layer; })[0];
    h += '<div class="tp-orgcard" aria-live="polite">' + (l ? '<h3>' + T.esc(l[3]) + ' <small>(' + T.esc(l[1].toLowerCase()) + ')</small></h3><dl class="pk-dl"><dt>Looks like</dt><dd>' + T.esc(l[4]) + '</dd><dt>Treat</dt><dd>' + T.esc(l[5]) + '</dd></dl>' : '<p class="ab-note">Tap a layer to see the infection at that depth. The deeper it goes, the sicker the patient and the more likely they need a surgeon.</p>') + '</div>';
    return h + T.ask('Why does erysipelas have a sharp, raised edge but cellulitis does not?', 'Erysipelas involves the upper dermis and superficial lymphatics, so the swelling stops at a clear edge; cellulitis is deeper in the dermis and fat, so the edge fades gradually.');
  }
  TeachPage({
    host: 'tpc',
    state: { layer: null },
    objectives: ['Describe cellulitis and how it differs from erysipelas, impetigo and necrotising fasciitis.', 'Tell cellulitis from the common “red leg” mimics.', 'Know first-line treatment and what to do at 48 hours.', 'Recognise the red flags of necrotising fasciitis.'],
    plans: { 5: { layers: 2, mimics: 2, pearls: 1 }, 10: { layers: 3, mimics: 3, flags: 2, pearls: 2 }, 20: { layers: 3, mimics: 4, flags: 3, case: 6, quiz: 4 } },
    sections: [
      { id: 'layers', t: 'How deep is it?', k: 'Diagram', type: 'html', html: layers },
      { id: 'mimics', t: 'Is it really cellulitis?', k: 'Flip cards', type: 'cards', l1: 'Clues', l2: 'How to tell', intro: 'Up to a third of people admitted with “cellulitis” have something else. Ask the group what each mimic looks like before you flip.', cards: [
        ['Venous eczema (stasis dermatitis)', 'Both legs, itchy, scaly, brown discolouration, varicose veins', 'Bilateral and not very tender; responds to emollients and topical steroid, not antibiotics'],
        ['Deep vein thrombosis', 'Calf swelling and pain, recent immobility or cancer', 'Wells score and ultrasound; little skin redness or warmth'],
        ['Lipodermatosclerosis', 'Hard, woody, tender lower legs with an “inverted champagne bottle” shape', 'Chronic and bilateral; no fever or rising CRP'],
        ['Gout', 'Very painful hot joint, often the big toe, previous attacks', 'Centred on a joint; aspirate for crystals'],
        ['Contact dermatitis', 'Itch, vesicles, clear edge matching a dressing or cream', 'Itchy rather than painful; stop the trigger'],
        ['Dependent rubor', 'Red feet when dangling that pale on elevation, poor pulses', 'Peripheral arterial disease: colour changes with position']] },
      { id: 'flags', t: 'Red flags for necrotising fasciitis', k: 'Checklist', type: 'check', intro: 'Ask the group which features would make them worried. Tick each as it is named.', done: 'Any of these: call the surgeons now. Do not wait for imaging, and give broad IV antibiotics with clindamycin.', items: [
        ['Pain out of proportion to the signs', 'Often the earliest clue, before the skin looks bad.'],
        ['Rapid spread over hours', 'Mark the edge and check again within the hour.'],
        ['Skin changes: dusky, purple, blistering or necrotic', 'These are late signs of deep tissue death.'],
        ['Crepitus', 'Gas in the tissues: anaerobes or Clostridium.'],
        ['Numbness over the area', 'Nerve damage from deep infection.'],
        ['Systemic toxicity or septic shock', 'Fever, tachycardia, hypotension and confusion out of keeping with the skin.']] },
      { id: 'pearls', t: 'Clinical pearls', k: 'Remember', type: 'pearls', items: [
        ['Two red legs are rarely cellulitis', 'Bilateral cellulitis is very uncommon: think venous eczema or oedema.'],
        ['Look between the toes', 'Tinea pedis is the commonest way in; treat it to prevent recurrence.'],
        ['Mark the edge', 'Redness can spread for 24–48 hours even when treatment is working.'],
        ['Elevate the leg', 'It speeds recovery as much as the antibiotic.'],
        ['Do not swab intact skin', 'Swabs only help if there is an open wound or pus.'],
        ['Think of the face', 'Cellulitis near the eye can spread to the orbit: check eye movements and vision.']] },
      { id: 'case', t: 'Unfolding case', k: 'Work through together', type: 'case', end: 'Case complete. Discuss: how would you reduce her chance of another episode?', steps: [
        { t: 'Admission', s: 'Mrs B, 64, has a red, hot, tender right lower leg for 2 days. Temperature 38.1°C, pulse 96, blood pressure 132/80. Her left leg is normal. There is cracked, macerated skin between her toes.', q: 'What is the most likely diagnosis?', o: [['Cellulitis with tinea pedis as the way in', 1, 'Yes: one-sided, hot, tender and spreading, with a portal of entry.'], ['Venous eczema', 0, 'Usually bilateral, itchy and not very tender.'], ['Necrotising fasciitis', 0, 'No red flags yet: pain matches the signs and she is not toxic.']] },
        { t: 'Treatment', s: 'She is not septic and can take tablets. She has no allergies.', q: 'How would you treat her?', o: [['Oral flucloxacillin, mark the edge, elevate, treat the tinea', 1, 'Yes: NICE first line, with supportive measures.'], ['IV meropenem', 0, 'Far too broad: cellulitis is streptococcal or staphylococcal.'], ['Swab the skin and wait for the result', 0, 'Intact skin swabs do not help and treatment should not wait.']] },
        { t: '48 hours later', s: 'The redness has spread 2 cm beyond the line, but she feels better, her temperature has settled and the leg is less painful.', q: 'What do you do?', o: [['Continue: early spread is common if she is improving', 1, 'Yes: judge the whole picture, not the line alone.'], ['Switch to IV vancomycin', 0, 'No sign of treatment failure or MRSA.'], ['Call the surgeons urgently', 0, 'Not without red flags.']] }] },
      { id: 'quiz', t: 'Quick quiz', k: 'Check understanding', type: 'quiz', items: [
        ['Which organisms usually cause cellulitis?', ['E. coli and Klebsiella', 'Streptococci and S. aureus', 'Pseudomonas', 'Anaerobes'], 1, 'β-haemolytic streptococci and S. aureus.'],
        ['What is the first-line antibiotic for cellulitis in the UK?', ['Amoxicillin', 'Flucloxacillin', 'Ciprofloxacin', 'Co-trimoxazole'], 1, 'Flucloxacillin (clarithromycin or doxycycline if penicillin allergic).'],
        ['Which is the most useful early clue to necrotising fasciitis?', ['Fever', 'Pain out of proportion to the signs', 'Raised CRP', 'Redness'], 1, 'Pain out of proportion often comes before skin changes.'],
        ['A patient has red, scaly, itchy shins on both legs. Most likely?', ['Bilateral cellulitis', 'Venous eczema', 'Necrotising fasciitis', 'Erysipelas'], 1, 'Bilateral, itchy and scaly suggests venous eczema.'],
        ['Which layer does erysipelas involve?', ['Epidermis only', 'Upper dermis and lymphatics', 'Fascia', 'Muscle'], 1, 'Hence the sharp, raised edge.']] }
    ],
    take: 'One hot, tender, spreading leg with a way in is cellulitis: flucloxacillin, mark, elevate, and watch for pain out of proportion.',
    see: [['Cellulitis (disease lookup)', '/diseases/#dz-cellulitis'], ['LRINEC score', '/scores/'], ['Teaching hub', '/teaching/']],
    on: { layer: function (b, S, redraw) { var v = b.getAttribute('data-v'); S.layer = S.layer === v ? null : v; redraw('layers'); } }
  });
})();
