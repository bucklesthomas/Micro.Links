/* Teaching page: fever in the returned traveller (uses teachpage.js). */
(function () {
  // [name, shortest, usual longest, tail (can be longer), note]
  var INC = [
    ['Dengue', 3, 14, 0, 'Fever within 2 weeks of return; low platelets'],
    ['Chikungunya', 2, 12, 0, 'Severe joint pain'],
    ['Viral haemorrhagic fever', 2, 21, 0, 'Lassa, Ebola, Marburg, CCHF: risk-assess first'],
    ['Rickettsia (spotted fever)', 5, 14, 0, 'Eschar, rash; safari or bush walking'],
    ['Leptospirosis', 2, 30, 0, 'Freshwater, rats; jaundice and kidney injury'],
    ['Falciparum malaria', 7, 30, 90, 'Most present within a month; rarely later'],
    ['Typhoid (enteric fever)', 6, 30, 0, 'South Asia; constipation, relative bradycardia'],
    ['Acute HIV', 10, 28, 0, 'Sexual exposure; rash, sore throat, lymph nodes'],
    ['Hepatitis A', 15, 50, 0, 'Jaundice; contaminated food or water'],
    ['Hepatitis E', 15, 60, 0, 'Jaundice; severe in pregnancy'],
    ['Schistosomiasis (Katayama fever)', 14, 90, 0, 'Freshwater in Africa; eosinophilia'],
    ['Vivax or ovale malaria', 12, 90, 365, 'Can relapse months or years later'],
    ['Tuberculosis', 30, 90, 365, 'Months to years']];
  var MAX = 90;
  function x(d) { return Math.min(100, d / MAX * 100); }
  function vis(S) {
    var d = S.day, fit = 0;
    var rows = INC.map(function (r) {
      var inWin = d >= r[1] && (d <= r[2] || (r[3] && d <= r[3])), early = d < r[1];
      if (inWin) fit++;
      return '<div class="tt-row' + (inWin ? ' fit' : early ? ' early' : ' late') + '"><span class="tt-name">' + r[0] + '</span><span class="tt-track"><i class="tt-bar" style="left:' + x(r[1]) + '%;width:' + (x(r[2]) - x(r[1])) + '%"></i>' + (r[3] ? '<i class="tt-tail" style="left:' + x(r[2]) + '%;width:' + (100 - x(r[2])) + '%"></i>' : '') + '<i class="tt-now" style="left:' + x(d) + '%"></i></span></div>';
    }).join('');
    return { rows: rows, fit: fit };
  }
  function timeline(S, T) {
    var v = vis(S);
    return T.p('How long after leaving the area did the fever start? Drag the slider: infections whose incubation period fits light up.') +
      '<div class="pk-range"><input type="range" min="0" max="90" step="1" value="' + S.day + '" data-xin="day" aria-label="Days from leaving the area to fever"><output class="tt-out">' + S.day + ' days' + '</output></div>' +
      '<p class="ab-note tt-fit">' + v.fit + ' of ' + INC.length + ' fit</p><div class="tt-rows">' + v.rows + '</div>' +
      '<div class="tt-axis"><span style="left:0">0</span><span style="left:' + x(7) + '%">1 week</span><span style="left:' + x(21) + '%">3 weeks</span><span style="left:' + x(42) + '%">6 weeks</span><span style="left:' + x(90) + '%">3 months+</span></div>' +
      T.ask('Set the slider to 4 days. Why can falciparum malaria be ruled out?', 'Its incubation period is at least 7 days from the first infective bite, so fever 4 days after leaving the area (with a shorter stay) cannot be malaria acquired on that trip. If the trip was long, think about exposure dates, not just return dates.');
  }
  TeachPage({
    host: 'tpt',
    state: { day: 10 },
    objectives: ['Take a structured travel history.', 'Use incubation periods to narrow the list.', 'Put malaria first and test for it correctly.', 'Recognise when to think of a viral haemorrhagic fever.', "Manage severe malaria and recognise the complications of treatment and the hidden relapsing species."],
    plans: { 5: { hx: 2, timeline: 3 }, 10: { hx: 2, timeline: 4, clues: 3, pearls: 1 }, 20: { hx: 3, timeline: 4, clues: 4, case: 6, quiz: 3 } },
    sections: [
      { id: 'hx', t: 'The travel history', k: 'Checklist', type: 'check', intro: 'Ask the group what they would want to know. Tick each as it is named.', done: 'Then: malaria tests now if they were in a malarious area, and a VHF risk assessment if relevant.', items: [
        ['Where exactly, and rural or urban?', 'Country and region decide the risks (use the country lookup).'],
        ['When did they leave, and how long were they there?', 'Exposure dates against incubation periods.'],
        ['Malaria prophylaxis taken properly?', 'It lowers but never removes the risk.'],
        ['Pre-travel vaccines?', 'Typhoid, hepatitis A, yellow fever and others.'],
        ['Activities: freshwater, safari, caves, animals, food and water', 'Each points to particular infections.'],
        ['Sexual contact, tattoos, injections or healthcare abroad', 'HIV, hepatitis B and C, resistant bacteria.'],
        ['Sick contacts and outbreaks', 'Check current outbreaks before testing.']] },
      { id: 'timeline', t: 'Which infections fit the timing?', k: 'Interactive timeline', type: 'html', html: timeline },
      { id: 'clues', t: 'Clue to cause', k: 'Flip cards', type: 'cards', l1: 'Think of', l2: 'Test', intro: 'Ask the group what each clue makes them think of.', cards: [
        ['Fever and low platelets after Africa', 'Malaria first; also dengue, VHF', 'Malaria films and rapid test ×3'],
        ['Black eschar with a rash', 'Rickettsia (African tick bite fever)', 'Treat with doxycycline; serology or PCR'],
        ['Constipation, headache, relative bradycardia, South Asia', 'Enteric fever', 'Blood cultures (several sets)'],
        ['Freshwater swimming in Africa, eosinophilia', 'Schistosomiasis', 'Serology at 6–12 weeks'],
        ['Jaundice and kidney injury after floods or rats', 'Leptospirosis', 'PCR and serology'],
        ['Bleeding, shock, return within 21 days from an outbreak area', 'Viral haemorrhagic fever', 'Isolate and risk-assess before any tests']] },
      { id: 'deep', t: 'Going deeper', k: 'For final-year students', type: 'deep', items: [["Severe falciparum malaria", "Any of: impaired consciousness or seizures, parasitaemia of 2% or more (UK guidance), acidosis, hypoglycaemia, kidney injury, pulmonary oedema or ARDS, shock, bleeding, or severe anaemia. Severe malaria needs IV artesunate and high-dependency or intensive care."], ["After artesunate", "Post-artesunate delayed haemolysis can occur 1–3 weeks later: check haemoglobin and haemolysis markers at follow-up. Always complete a full oral course after IV treatment."], ["Vivax and ovale", "These species leave dormant liver stages (hypnozoites) that cause relapses months later. After blood-stage treatment, give primaquine or tafenoquine, but only after G6PD testing (risk of haemolysis)."], ["Enteric fever resistance", "Quinolone resistance is now widespread in South Asia, and extensively drug-resistant typhoid from Pakistan is resistant to ceftriaxone too; use meropenem with or without azithromycin until susceptibilities are known."], ["High-consequence infections", "Fever within 21 days of travel to an area with Lassa, Ebola, Marburg or CCHF, with exposure risk, triggers the UKHSA VHF risk assessment before any routine tests, isolation, and discussion with the Imported Fever Service."], ["Eosinophilia", "Think helminths: schistosomiasis (freshwater in Africa) and strongyloides (can cause fatal hyperinfection if given steroids). Screen with serology and treat before immunosuppression."]] },
      { id: 'trial', t: 'Key trial: SEAQUAMAT', k: 'Evidence', type: 'trial', trial: {"name": "SEAQUAMAT", "cite": "Dondorp A et al. Lancet 2005;366:717–25", "q": "Is IV artesunate better than IV quinine for severe falciparum malaria?", "who": "1461 patients (mostly adults) with severe malaria in South-East Asia", "outcome": "Death in hospital", "newArm": "artesunate", "arms": [["Artesunate", 15], ["Quinine", 22]], "ans": 0, "result": "Mortality fell from 22% with quinine to 15% with artesunate, a relative reduction of about a third; artesunate also caused less hypoglycaemia.", "meaning": "IV artesunate is first line for severe malaria in the UK; quinine is only used if artesunate is not available."} },
      { id: 'pearls', t: 'Clinical pearls', k: 'Remember', type: 'pearls', items: [
        ['Malaria until proven otherwise', 'Three negative tests over 48–72 hours before ruling it out.'],
        ['Common things are common', 'Pneumonia, UTI and flu happen in travellers too.'],
        ['Prophylaxis is not a guarantee', 'Ask about missed doses and stopping early.'],
        ['Check the outbreak news', 'TravelHealthPro and UKHSA before you send samples.'],
        ['Visiting friends and relatives', 'Highest-risk travellers: often no prophylaxis and long stays.'],
        ['Eosinophilia is a clue', 'Think of worms: schistosomiasis and strongyloides.']] },
      { id: 'case', t: 'Unfolding case', k: 'Work through together', type: 'case', end: 'Case complete. Discuss: what advice could have prevented this?', steps: [
        { t: 'Emergency department', s: 'Ms J, 34, returned from visiting family in Ghana 12 days ago. She has fever, headache and vomiting. She took no malaria prophylaxis.', q: 'What is the most urgent test?', o: [['Malaria films and rapid antigen test', 1, 'Yes: falciparum malaria fits the timing and is an emergency.'], ['Dengue serology', 0, 'Possible, but malaria first.'], ['CT head', 0, 'Not before malaria tests.']] },
        { t: 'Results', s: 'Films show Plasmodium falciparum, 3% parasitaemia. She is alert, with normal kidney function and blood pressure.', q: 'Is this severe malaria?', o: [['Yes: parasitaemia of 2% or more counts as severe in UK guidance', 1, 'Yes: she needs IV artesunate.'], ['No: she is alert', 0, 'Parasitaemia alone makes it severe.'], ['Only if she becomes confused', 0, 'Other criteria count too.']] },
        { t: 'Treatment', s: 'You start treatment and refer to the infectious diseases team.', q: 'Which treatment?', o: [['IV artesunate, then a full oral course', 1, 'Yes: artesunate is first line for severe malaria.'], ['Oral doxycycline alone', 0, 'Not for falciparum treatment.'], ['Wait for repeat films', 0, 'Treat now.']] }] },
      { id: 'quiz', t: 'Quick quiz', k: 'Check understanding', type: 'quiz', items: [
        ['Minimum incubation period of falciparum malaria?', ['1 day', 'About 7 days', '30 days', '6 months'], 1, 'About 7 days.'],
        ['How many negative malaria tests to rule it out?', ['One', 'Two', 'Three', 'Five'], 2, 'Three over 48–72 hours.'],
        ['Fever with an eschar after safari suggests…', ['Dengue', 'Rickettsia', 'Typhoid', 'Hepatitis A'], 1, 'African tick bite fever.'],
        ['Within how many days of return should VHF be considered?', ['7', '21', '60', '90'], 1, '21 days.'],
        ['Which traveller group is at highest malaria risk?', ['Business travellers', 'Visiting friends and relatives', 'Cruise passengers', 'Skiers'], 1, 'VFR travellers.']] }
    ],
    take: 'Fever after the tropics is malaria until three tests are negative; use the incubation period and the history to narrow the rest.',
    see: [['Returned traveller guide', '/returned-traveller/'], ['Malaria guide', '/malaria/'], ['Country lookup', '/countries/'], ['Teaching hub', '/teaching/']],
    on: {
      day: function (el, S, redraw) { S.day = +el.value; var bd = el.closest('.tp-body'), v = vis(S); bd.querySelector('.tt-rows').innerHTML = v.rows; bd.querySelector('.tt-out').textContent = S.day + ' days'; bd.querySelector('.tt-fit').textContent = v.fit + ' of ' + INC.length + ' fit'; }
    }
  });
})();
