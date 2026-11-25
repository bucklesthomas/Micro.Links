/* ID clinic review: outpatient clinic template (uses notes-form.js). */
NoteForm({
  host: 'clinic', prefix: 'cl', key: 'mc-clinic', title: 'INFECTIOUS DISEASES CLINIC',
  sections: [
    { id: 'cl', t: 'Clinic', ask: ['New or follow-up', 'Who referred, and the question', 'Consultant for this clinic'], f: [
      { id: 'cons', k: 'text', l: 'Consultant', ph: 'e.g. Dr B Jones, ID consultant', out: 'Consultant: ' },
      { id: 'type', k: 'one', l: 'Visit', o: ['New patient', 'Follow-up', 'Post-discharge review', 'Telephone or video'], out: '' },
      { id: 'clin', k: 'one', l: 'Clinic', o: ['General ID', 'Bone and joint', 'TB', 'HIV', 'Travel and tropical', 'Endocarditis', 'OPAT', 'Viral hepatitis'], out: 'Clinic: ' },
      { id: 'from', k: 'text', l: 'Referred by', ph: 'e.g. GP, orthopaedics, AMU', out: 'Referred by: ' },
      { id: 'q', k: 'area', l: 'Reason for referral or review', out: 'Reason: ' }] },
    { id: 'pt', t: 'Patient', ask: ['Age, sex and weight (no name, date of birth or hospital number)', 'Allergies, and what actually happened'], f: [
      { id: 'age', k: 'num', l: 'Age', u: 'years', group: 'pt' }, { id: 'sex', k: 'one', l: 'Sex', o: ['Male', 'Female'], group: 'pt' }, { id: 'wt', k: 'num', l: 'Weight', u: 'kg', group: 'pt' },
      { id: 'allergy', k: 'chips', l: 'Allergies', o: ['No known drug allergies', 'Penicillin: rash', 'Penicillin: anaphylaxis', 'Other drug allergy'] },
      { id: 'allergyd', k: 'text', l: 'Allergy details', nil: 'No allergy details' }] },
    { id: 'dx', t: 'Diagnosis and history', ask: ['Working diagnosis and organism', 'What has happened since the last review', 'Symptoms now'], f: [
      { id: 'diag', k: 'text', l: 'Diagnosis', ph: 'e.g. MSSA native vertebral osteomyelitis', out: 'Diagnosis: ' },
      { id: 'org', k: 'text', l: 'Organism and susceptibility', ph: 'e.g. MSSA, penicillin resistant, clindamycin susceptible', out: 'Organism: ', nil: 'No organism identified' },
      { id: 'prog', k: 'one', l: 'Progress', o: ['Improving', 'No change', 'Worse', 'Resolved'], out: 'Progress: ' },
      { id: 'sx', k: 'chips', l: 'Symptoms', neg: 'No', o: ['Fever', 'Night sweats', 'Weight loss', 'Pain', 'Wound discharge', 'Swelling', 'Cough', 'Diarrhoea', 'Rash', 'Fatigue'] },
      { id: 'hx', k: 'area', l: 'History since last review', rows: 5, out: '' }] },
    { id: 'tx', t: 'Treatment', ask: ['Current antimicrobials, dose and start date', 'Adherence and missed doses', 'Side effects'], f: [
      { id: 'abx', k: 'abx' },
      { id: 'dur', k: 'text', l: 'Planned duration or end date', ph: 'e.g. 6 weeks from 2 November; end 14 December', out: 'Planned duration: ' },
      { id: 'adh', k: 'one', l: 'Adherence', o: ['Good', 'Some missed doses', 'Poor', 'Not currently on treatment'], out: 'Adherence: ' },
      { id: 'se', k: 'chips', l: 'Side effects', neg: 'No', o: ['Nausea', 'Diarrhoea', 'Rash', 'Tinnitus or hearing change', 'Visual change', 'Numbness or tingling', 'Tendon or joint pain', 'Jaundice', 'Low mood'] },
      { id: 'sed', k: 'text', l: 'Side effect details', nil: 'No side effects' }] },
    { id: 'bg', t: 'Background', ask: ['Immune status', 'Implants and devices', 'Occupation, smoking and alcohol'], f: [
      { id: 'immuno', k: 'chips', l: 'Risk factors', none: 'None', nil: 'No immunosuppression or other risk factors', o: ['None', 'HIV', 'Solid organ transplant', 'Chemotherapy', 'Steroids', 'Biologics or DMARDs', 'Asplenia', 'Diabetes', 'CKD', 'Dialysis', 'Cirrhosis', 'Pregnant', 'Injecting drug use'] },
      { id: 'devices', k: 'chips', l: 'Devices and implants', none: 'None', nil: 'No devices or implants', o: ['None', 'Prosthetic valve', 'Pacemaker or ICD', 'Prosthetic joint', 'Metalwork', 'Vascular graft or stent', 'PICC or line'] },
      { id: 'pmh', k: 'area', l: 'Other relevant history and medicines', nil: 'No other relevant history' },
      { id: 'occ', k: 'text', l: 'Occupation', out: 'Occupation: ', nil: 'Not working', head: 'SOCIAL HISTORY' },
      { id: 'smoke', k: 'one', l: 'Smoking', o: ['Never smoked', 'Ex-smoker', 'Current smoker'], out: 'Smoking: ' },
      { id: 'alc', k: 'one', l: 'Alcohol', o: ['None', 'Within recommended limits', 'Above recommended limits', 'Alcohol dependence'], out: 'Alcohol: ', nil: 'No alcohol' }] },
    { id: 'ex', t: 'Examination', ask: ['Observations and weight', 'Site of infection: wound, joint, line, scar', 'Anything new'], f: [
      { id: 'obs', k: 'obs' },
      { id: 'exam', k: 'area', l: 'Examination findings', rows: 4, out: '' }] },
    { id: 'res', t: 'Results', ask: ['Latest bloods and trend', 'Microbiology', 'Imaging', 'Drug levels'], f: [
      { id: 'labs', k: 'labs' },
      { id: 'labsd', k: 'text', l: 'Date, trend or other results', ph: 'e.g. CRP 120 → 18 over 4 weeks', out: '' },
      { id: 'micro', k: 'area', l: 'Microbiology', out: 'Microbiology: ', nil: 'No new microbiology' },
      { id: 'imgdone', k: 'chips', l: 'Imaging (tap to add a line for its findings)', ins: 'imgd', out: 'Imaging: ', o: ['Chest X-ray', 'X-ray', 'CT', 'MRI', 'Ultrasound', 'TTE', 'TOE', 'PET-CT'] },
      { id: 'imgd', k: 'area', l: 'Imaging findings', rows: 3 },
      { id: 'lvl', k: 'text', l: 'Drug levels', ph: 'e.g. vancomycin trough 14 mg/L', out: 'Drug levels: ' }] },
    { id: 'plan', t: 'Impression and plan', ask: ['Your impression', 'Treatment decision', 'Tests before next review', 'Follow-up and who gets a copy'], f: [
      { id: 'imp', k: 'area', l: 'Impression', head: 'IMPRESSION' },
      { id: 'dec', k: 'chips', l: 'Treatment decision', o: ['Continue current treatment', 'Switch to oral', 'Change antibiotic', 'Extend course', 'Stop antibiotics', 'Start treatment', 'Suppressive antibiotics', 'Surgical opinion'], out: '', head: 'PLAN' },
      { id: 'tests', k: 'chips', l: 'Tests before next review', o: ['FBC, U&E, LFT, CRP', 'ESR', 'Drug levels', 'Blood cultures', 'Imaging', 'ECG', 'Hearing or vision check'], out: 'Tests: ' },
      { id: 'plan', k: 'area', l: 'Plan details', rows: 4, out: '' },
      { id: 'fu', k: 'one', l: 'Follow-up', o: ['2 weeks', '4 weeks', '6 weeks', '3 months', '6 months', 'End of treatment', 'Discharged from clinic'], out: 'Follow-up: ' },
      { id: 'cc', k: 'chips', l: 'Letter copied to', o: ['GP', 'Referring team', 'Patient', 'OPAT team'], out: 'Copy to: ' }] }
  ]
});
