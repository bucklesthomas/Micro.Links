/*
 * Imported malaria in adults — checked against the UK malaria treatment guidelines 2016
 * (Lalloo DG et al. J Infect 2016;72:635–49): summary points, Boxes 3–6 and 10, and the pregnancy section.
 * Artenimol–piperaquine weight bands follow the UKHSA treatment-failure guidance (corrected February 2025).
 */
(function () {
  window.GUIDES = window.GUIDES || {};

  var D = {
    artesunate: 'Artesunate 2.4 mg/kg IV at 0, 12 and 24 hours, then once daily',
    quinineIV:  'Quinine dihydrochloride: loading dose 20 mg/kg in 5% dextrose or dextrose/saline over 4 hours, then 10 mg/kg over 4 hours every 8 hours for the first 48 hours (12-hourly if IV quinine continues beyond 48 hours). No loading dose if quinine or mefloquine was taken in the previous 12 hours',
    al:         'Artemether–lumefantrine (Riamet) 4 tablets, then 4 tablets at 8, 24, 36, 48 and 60 hours (weight > 35 kg)',
    dhap:       'Artenimol–piperaquine (Eurartesim) once daily: 36 to < 75 kg, 3 tablets; ≥ 75 kg, 4 tablets (320 mg/40 mg). Take on an empty stomach and check the ECG first',
    ap:         'Atovaquone–proguanil (Malarone) 4 standard tablets once daily',
    quinine:    'Quinine sulfate 600 mg orally every 8 hours',
    doxy:       'Doxycycline 200 mg orally once daily',
    clinda:     'Clindamycin 450 mg orally every 8 hours',
    chloro:     'Chloroquine 620 mg base, then 310 mg base 6–8 hours later, then 310 mg base on days 2 and 3',
    pqV:        'Primaquine 30 mg (0.5 mg/kg) orally once daily',
    pqO:        'Primaquine 15 mg (0.25 mg/kg) orally once daily',
    pqWeekly:   'Primaquine 0.75 mg/kg (45 mg) orally once weekly'
  };

  var N = {
    notify: 'Malaria is notifiable: inform the local health protection team.',
    admitF: 'Admit most patients with falciparum malaria for at least 24 hours: they can deteriorate suddenly early in treatment. Admit all patients over 65.',
    films: 'Check parasite clearance with daily blood films. The count can rise in the first 24–36 hours of treatment without meaning treatment failure.',
    prophylaxis: 'Do not treat with the drug the patient took as prophylaxis.',
    resistance: 'Artemisinin partial resistance is spreading (Uganda, Kenya, Tanzania, Rwanda, Ethiopia, Eritrea; established in the Greater Mekong). Discuss travellers from these areas, and any treatment failure, with an ID consultant (UKHSA 2024–25).',
    recurrence: 'Tell the patient to attend for a same-day blood film if fever returns after treatment.',
    haemolysis: 'Delayed haemolysis occurs 7–21 days after IV artesunate in about 10–15% of patients: warn the patient and check haemoglobin about 14 days after treatment.',
    glucose: 'Check blood glucose every 4 hours, every 2 hours during IV quinine, and whenever consciousness falls.',
    g6pd: 'Check G6PD before primaquine. Give primaquine alongside the chloroquine or ACT (overlapping improves relapse prevention). In mild to moderate G6PD deficiency, a weekly regimen can be used with expert advice.',
    expert: 'Discuss every falciparum case with an infectious diseases or tropical medicine specialist.'
  };

  var SEVERE_HELP = 'Severe (UK Box 3) if any of: impaired consciousness or seizures; renal impairment (oliguria < 0.4 ml/kg/hour or creatinine > 265 µmol/L); acidosis (pH < 7.3); hypoglycaemia (< 2.2 mmol/L); pulmonary oedema or ARDS; Hb ≤ 80 g/L; spontaneous bleeding or DIC; shock (BP < 90/60 mmHg); haemoglobinuria (without G6PD deficiency); parasitaemia > 10%. Also give IV treatment if parasitaemia is > 2%, the patient cannot swallow or keep tablets down, or for pregnant women on specialist advice.';

  var Q = {
    start: {
      q: 'Which species?',
      options: [
        { label: 'P. falciparum or mixed', next: 'falc_sev' },
        { label: 'Species not known yet', sub: 'Treat as falciparum until confirmed', next: 'falc_sev' },
        { label: 'P. vivax', next: 'nf_sev' },
        { label: 'P. ovale', next: 'nf_sev' },
        { label: 'P. malariae', next: 'nf_sev' },
        { label: 'P. knowlesi', next: 'nf_sev' }
      ]
    },
    falc_sev: {
      q: 'Severe malaria, or another reason for IV treatment?',
      help: SEVERE_HELP,
      options: [
        { label: 'Yes', sub: 'Severe, or needs IV treatment', next: 'R_severe' },
        { label: 'No', sub: 'Uncomplicated', next: 'falc_preg' }
      ]
    },
    falc_preg: {
      q: 'Is the patient pregnant?',
      options: [
        { label: 'No', next: 'R_falc' },
        { label: 'Yes, first trimester', next: 'R_falc_preg1' },
        { label: 'Yes, second or third trimester', next: 'R_falc_preg23' }
      ]
    },
    nf_sev: {
      q: 'Severe or complicated malaria?',
      help: SEVERE_HELP + ' Severe disease is rare with non-falciparum species but is well recognised with P. knowlesi and P. vivax.',
      options: [
        { label: 'Yes', sub: 'Severe or complicated', next: function (a) { return relapsing(a) ? 'nf_preg' : 'R_severe'; } },
        { label: 'No', sub: 'Uncomplicated', next: 'nf_preg' }
      ]
    },
    nf_preg: {
      q: 'Is the patient pregnant or breastfeeding?',
      help: 'Primaquine is contraindicated in pregnancy, and in breastfeeding until the infant’s G6PD status is known.',
      options: [
        { label: 'No', next: function (a) { return relapsing(a) ? 'g6pd' : endNode(a); } },
        { label: 'Yes', next: function (a) { return endNode(a); } }
      ]
    },
    g6pd: {
      q: 'G6PD status?',
      help: 'Primaquine (for relapse prevention) can cause severe haemolysis in G6PD deficiency. Use a quantitative test where available; a qualitative test does not detect intermediate activity, which matters in women.',
      options: [
        { label: 'Normal', next: function (a) { return endNode(a); } },
        { label: 'Intermediate or mild to moderate deficiency', sub: 'Including heterozygous women with intermediate activity', next: function (a) { return endNode(a); } },
        { label: 'Severe deficiency', next: function (a) { return endNode(a); } },
        { label: 'Not known yet', sub: 'Sent, or not yet sent', next: function (a) { return endNode(a); } }
      ]
    }
  };

  function I(drug, dose, dur) { return { drug: drug, dose: dose, dur: dur }; }
  function species(a) { return a.start.label; }
  function relapsing(a) { return /vivax|ovale/.test(species(a)); }
  function severe(a) { return a.nf_sev && a.nf_sev.i === 0; }
  function endNode(a) { return severe(a) ? 'R_severe' : 'R_nf'; }

  // Relapse prevention (radical cure) for P. vivax and P. ovale, by G6PD status (UK malaria guideline 2016; WHO 2025)
  function radical(a, notes) {
    var sp = species(a), vivax = /vivax/.test(sp), sev = severe(a);
    if (a.nf_preg && a.nf_preg.i === 1) {
      notes.push('Primaquine is contraindicated in pregnancy and breastfeeding (until the infant’s G6PD status is known): give weekly chloroquine prophylaxis (500 mg) until after delivery or breastfeeding, then check G6PD and give primaquine.');
      return [{ name: 'Prevent relapse: after pregnancy and breastfeeding', noOr: true, items: [I('Chloroquine', '500 mg (310 mg base) orally once weekly until delivery and the end of breastfeeding', 'Then primaquine'), I('Then Primaquine', (vivax ? D.pqV : D.pqO) + ', once G6PD is confirmed normal', '14 days')] }];
    }
    var g = a.g6pd ? a.g6pd.i : 3, regs = [];
    var when = sev ? 'Start once the patient has recovered and is taking oral treatment, alongside the oral course where possible.' : 'Start alongside the chloroquine or ACT where possible: overlapping improves relapse prevention.';
    if (g === 0) regs.push({ name: 'Prevent relapse (G6PD normal)', noOr: true, items: [I('Primaquine', vivax ? D.pqV : D.pqO, '14 days')] });
    else if (g === 1) regs.push({ name: 'Prevent relapse (intermediate or mild to moderate G6PD deficiency: expert advice)', noOr: true, items: [I('Primaquine', D.pqWeekly + ', with haemoglobin checks and a warning to stop if urine turns dark', '8 weeks')] });
    else if (g === 2) regs.push({ name: 'Prevent relapse (severe G6PD deficiency)', noOr: true, items: [I('Do not give primaquine', 'Discuss with an ID or tropical medicine specialist. Options include treating relapses promptly as they occur, or weekly chloroquine prophylaxis for a period', '')] });
    else regs.push({ name: 'Prevent relapse: check G6PD first', noOr: true, items: [I('Send a quantitative G6PD test now', 'Then give primaquine according to the result: ' + (vivax ? '30 mg' : '15 mg') + ' daily for 14 days if normal; 0.75 mg/kg weekly for 8 weeks if intermediate or mild to moderate deficiency (expert advice); none if severe deficiency', 'Relapses take weeks: waiting for the result is safe')] });
    if (g !== 2) notes.push(when);
    if (sev || g === 3) notes.push('G6PD activity can read falsely normal during acute haemolysis, with a high reticulocyte count, and after blood transfusion (donor cells). After severe malaria, transfusion or haemolysis, repeat the test once recovered (about 3 months after a transfusion), or discuss with haematology.');
    notes.push('Primaquine is not licensed in the UK and may need to be ordered: ask pharmacy early. Give with food to reduce stomach upset.');
    if (vivax) notes.push('The P. vivax dose of 30 mg daily (0.5 mg/kg; about 7 mg/kg in total) covers the primaquine-tolerant strains from Oceania and South-East Asia. In heavier patients, discuss weight-based dosing with a specialist.');
    return regs;
  }

  var R = {
    R_severe: function (a) {
      var sp = species(a);
      var nf = /vivax|ovale/.test(sp);
      var notes = ['Manage in a high-dependency or intensive care setting. Watch for ARDS, DIC, acute kidney injury, seizures and Gram-negative sepsis (give broad-spectrum antibiotics if shocked).',
                   'Pregnancy: severe malaria in any trimester is treated as above, with artesunate preferred over quinine. IV quinine with clindamycin is the alternative.',
                   'Give IV quinine immediately if artesunate is not available: never delay treatment while obtaining it. Exchange transfusion is no longer recommended.', 'A UK-licensed IV artesunate product has been available since 2025: check where your hospital keeps it.',
                   N.glucose, N.films];
      var extra = nf ? radical(a, notes) : [];
      notes.push(N.haemolysis, N.resistance, N.notify, N.expert);
      return {
        title: 'Severe or complicated malaria (' + (/^Species/.test(sp) ? 'species not yet known' : sp) + ')',
        tone: 'red',
        regimens: [
          { name: 'First line', items: [I('Artesunate', D.artesunate, 'At least 24 hours, up to 5 days'), I('then a full oral course', 'Once improved and able to take tablets: artemether–lumefantrine or artenimol–piperaquine (doses as for uncomplicated malaria); or quinine with doxycycline; or atovaquone–proguanil', 'Full course')] },
          { name: 'If artesunate is not immediately available', items: [I('Quinine IV', D.quinineIV, 'Until able to swallow'), I('then Quinine orally', D.quinine, 'To complete 5–7 days of quinine'), I('plus Doxycycline', D.doxy + ' (clindamycin 450 mg 8-hourly in pregnancy)', '7 days from when able to swallow')] }
        ].concat(extra),
        notes: notes
      };
    },
    R_falc: {
      title: 'Uncomplicated falciparum malaria',
      regimens: [
        { name: 'Drug of choice', items: [I('Artemether–lumefantrine', D.al, '3 days')] },
        { name: 'Alternative', items: [I('Artenimol–piperaquine', D.dhap, '3 days')] },
        { name: 'If an artemisinin combination is not available', items: [I('Atovaquone–proguanil', D.ap, '3 days')] },
        { name: 'Or', noOr: true, items: [I('Quinine', D.quinine, '5–7 days'), I('plus Doxycycline', D.doxy, '7 days')] }
      ],
      notes: [N.admitF, N.films, 'If the patient vomits or cannot take tablets, give IV treatment as for severe malaria.', 'The UK-licensed artenimol–piperaquine product (Eurartesim) was discontinued in 2024: supply is now imported, so check availability with pharmacy.', 'The 2016 guideline gave artenimol–piperaquine bands of 36–60 kg (3 tablets) and > 60 kg (4 tablets); the bands shown follow UKHSA’s corrected 2025 table and the product licence.', N.prophylaxis, N.resistance, N.recurrence, N.notify]
    },
    R_falc_preg1: {
      title: 'Uncomplicated falciparum malaria, first trimester of pregnancy',
      tone: 'amber',
      summary: 'Admit, seek specialist advice, and manage with the obstetric team.',
      regimens: [{ name: 'Usual treatment', items: [I('Quinine', D.quinine, '7 days'), I('plus Clindamycin', D.clinda, '7 days')] }],
      notes: ['Data on artemether–lumefantrine in the first trimester are limited, but no harm has been detected: decide with the specialist.', 'Quinine can cause uterine contractions and hypoglycaemia: monitor glucose and the fetus.', 'Avoid doxycycline and primaquine in pregnancy.', N.resistance, N.notify]
    },
    R_falc_preg23: {
      title: 'Uncomplicated falciparum malaria, second or third trimester',
      tone: 'amber',
      summary: 'Admit and manage with the obstetric team.',
      regimens: [
        { name: 'Treatment of choice', items: [I('Artemether–lumefantrine', D.al, '3 days')] },
        { name: 'Alternative (any trimester)', items: [I('Quinine', D.quinine, '7 days'), I('plus Clindamycin', D.clinda, '7 days')] }
      ],
      notes: ['None of the oral ACTs or atovaquone–proguanil are licensed in pregnancy, but no adverse effects of artemether–lumefantrine have been found in the second and third trimesters.', 'Quinine can cause uterine contractions and hypoglycaemia.', 'Avoid doxycycline and primaquine in pregnancy.', N.resistance, N.notify]
    },
    R_nf: function (a) {
      var sp = species(a), preg = a.nf_preg && a.nf_preg.i === 1;
      var vivax = /vivax/.test(sp), ovale = /ovale/.test(sp), knowlesi = /knowlesi/.test(sp);
      var regs = [
        { name: 'Option 1', items: [I('Chloroquine', D.chloro, '3 days')] },
        { name: 'Option 2', items: [I('Artemether–lumefantrine or artenimol–piperaquine', D.al + '; or ' + D.dhap, '3 days')] }
      ];
      var notes = ['Use an ACT (option 2) if there is a mixed infection, the species is uncertain, or falciparum cannot be reliably excluded.'];
      if (vivax) notes.push('Chloroquine resistance in P. vivax is increasing, particularly from Papua New Guinea and Indonesia: an ACT may be preferred for infections from these areas.');
      if (knowlesi) notes.push('P. knowlesi can cause severe disease: measure the parasitaemia and give IV artesunate if severe.');
      if (vivax || ovale) regs = regs.concat(radical(a, notes));
      if (preg) notes.push('In pregnancy, chloroquine is safe throughout; ACTs can be used in the second and third trimesters, and quinine in the first trimester if resistant vivax is a concern.');
      notes.push('Most non-falciparum malaria can be treated as an outpatient unless there are complications or other concerns.', N.prophylaxis, N.recurrence, N.notify);
      return {
        title: 'Uncomplicated ' + sp + ' malaria' + (preg ? ' in pregnancy or breastfeeding' : ''),
        tone: preg ? 'amber' : null,
        regimens: regs,
        notes: notes
      };
    }
  };

  window.GUIDES.malaria = {
    Q: Q, R: R, eyebrow: 'Suggested treatment',
    ref: 'From the UK malaria treatment guidelines 2016 (Lalloo DG et al.), with UKHSA interim guidance on falciparum treatment failure (2024–25). Adult doses; children need weight-based dosing. Check interactions and local guidelines.'
  };
})();
