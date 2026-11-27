/* OPAT review: outpatient parenteral antimicrobial therapy template (uses notes-form.js). */
NoteForm({
  host: 'opat', prefix: 'op', key: 'mc-opat', title: 'OPAT REVIEW',
  sections: [
    { id: 'op', t: 'OPAT', ask: ['Type of review', 'How the antimicrobials are given', 'Which line'], f: [
      { id: 'cons', k: 'text', l: 'Consultant', ph: 'e.g. Dr B Jones, ID consultant', out: 'Consultant: ' },
      { id: 'rev', k: 'one', to: 'opd', l: 'Review', o: ['Suitability assessment', 'Weekly review', 'End of treatment review', 'Unscheduled review'], out: '' },
      { id: 'model', k: 'one', to: 'opd', l: 'Delivery', o: ['Self or carer administered', 'District nurse at home', 'Infusion clinic attendance', 'Care home'], out: 'Delivery: ' },
      { id: 'line', k: 'one', to: 'opd', l: 'Access', o: ['Peripheral cannula', 'Midline', 'PICC', 'Tunnelled line or port', 'Oral only'], out: 'Access: ' },
      { id: 'pump', k: 'one', to: 'opd', l: 'Administration', o: ['Bolus', 'Short infusion', 'Elastomeric pump (continuous)', 'Subcutaneous'], out: 'Administration: ' },
      { id: 'opd', k: 'area', l: 'Review type, delivery, access and details', rows: 3 }] },
    { id: 'pt', t: 'Patient', ask: ['Age, sex and weight (no name, date of birth or hospital number)', 'Allergies'], f: [
      { id: 'age', k: 'num', l: 'Age', u: 'years', group: 'pt' }, { id: 'sex', k: 'one', l: 'Sex', o: ['Male', 'Female'], group: 'pt' }, { id: 'wt', k: 'num', l: 'Weight', u: 'kg', group: 'pt' },
      { id: 'allergy', k: 'chips', to: 'allergyd', l: 'Allergies', o: ['No known drug allergies', 'Penicillin: rash', 'Penicillin: anaphylaxis', 'Other drug allergy'] },
      { id: 'allergyd', k: 'area', l: 'Allergies and details', rows: 2, nil: 'No allergy details' }] },
    { id: 'ind', t: 'Indication and treatment', ask: ['Diagnosis and organism', 'Antimicrobials, dose and start date', 'Day of treatment and planned end date'], f: [
      { id: 'diag', k: 'text', l: 'Diagnosis', ph: 'e.g. Streptococcal native valve endocarditis', out: 'Diagnosis: ' },
      { id: 'org', k: 'text', l: 'Organism and susceptibility', out: 'Organism: ', nil: 'No organism identified' },
      { id: 'abx', k: 'abx' },
      { id: 'day', k: 'num', l: 'Day of treatment', u: '', out: 'Day of treatment: ' },
      { id: 'end', k: 'text', l: 'Planned end date', ph: 'e.g. 14 December', out: 'Planned end: ' },
      { id: 'oral', k: 'text', l: 'Oral switch plan', ph: 'e.g. switch to oral linezolid at 4 weeks if CRP falling', out: 'Oral switch: ', nil: 'No oral switch planned' }] },
    { id: 'rv', t: 'Review', ask: ['How they are, and the response so far', 'Side effects', 'Line site and function', 'Any missed doses or problems at home'], f: [
      { id: 'resp', k: 'one', to: 'rvd', l: 'Clinical response', o: ['Improving', 'No change', 'Worse'], out: 'Response: ' },
      { id: 'sx', k: 'chips', to: 'rvd', l: 'Symptoms', neg: 'No', o: ['Fever', 'Rigors', 'Night sweats', 'Pain', 'Wound discharge', 'Swelling', 'Breathlessness'] },
      { id: 'se', k: 'chips', to: 'rvd', l: 'Side effects', neg: 'No', o: ['Nausea', 'Diarrhoea', 'Rash', 'Tinnitus or hearing change', 'Dizziness', 'Muscle pain', 'Numbness or tingling', 'Infusion reaction'] },
      { id: 'linec', k: 'chips', to: 'rvd', l: 'Line', o: ['Site clean and dry', 'Redness or tenderness', 'Discharge', 'Arm swelling', 'Blocked or sluggish', 'Dressing changed', 'Line flushed'], out: 'Line: ' },
      { id: 'miss', k: 'one', to: 'rvd', l: 'Doses', o: ['No missed doses', 'Missed doses', 'Pump problems'], out: 'Doses: ' },
      { id: 'rvd', k: 'area', l: 'Response, symptoms, side effects, line, doses and details', rows: 5, out: '' }] },
    { id: 'mon', t: 'Monitoring', ask: ['Observations', 'Weekly bloods', 'Drug levels and CK'], f: [
      { id: 'obs', k: 'obs' },
      { id: 'labs', k: 'labs' },
      { id: 'labsd', k: 'text', l: 'Date, trend or other results', ph: 'e.g. CRP 85 → 22 over 2 weeks', out: '' },
      { id: 'lvldone', k: 'chips', l: 'Levels (tap to add a line)', ins: 'lvl', out: 'Sent: ', o: ['Vancomycin level', 'Teicoplanin level', 'Gentamicin level', 'Amikacin level', 'CK (daptomycin)', 'ESR'] },
      { id: 'lvl', k: 'area', l: 'Levels: results', rows: 3 }] },
    { id: 'plan', t: 'Plan', ask: ['Continue, change, switch or stop', 'Next bloods and review', 'Line plan', 'Safety-netting given'], f: [
      { id: 'dec', k: 'chips', to: 'plan', l: 'Decision', o: ['Continue OPAT', 'Change dose', 'Change antibiotic', 'Switch to oral', 'Extend course', 'Stop treatment', 'Readmit'], out: '', head: 'PLAN' },
      { id: 'lineplan', k: 'one', to: 'plan', l: 'Line', o: ['Keep line', 'Remove line', 'Replace line'], out: 'Line: ' },
      { id: 'bloods', k: 'one', to: 'plan', l: 'Bloods', o: ['Weekly', 'Twice weekly', 'At end of treatment'], out: 'Bloods: ' },
      { id: 'next', k: 'one', to: 'plan', l: 'Next review', o: ['1 week', '2 weeks', 'End of treatment', 'ID clinic after OPAT'], out: 'Next review: ' },
      { id: 'safety', k: 'chips', to: 'plan', l: 'Safety-netting', o: ['Fever or rigors', 'Line problems', 'Rash or diarrhoea', 'Who to call (OPAT team or out of hours)'], out: 'Safety-netting given: ' },
      { id: 'plan', k: 'area', l: 'Decision, line, bloods, next review, safety-netting and details', rows: 5, out: '' }] }
  ]
});
