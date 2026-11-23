/* ID referral call: telephone referral template (uses notes-form.js). */
NoteForm({
  host: 'referral', prefix: 'rf', key: 'mc-referral', title: 'TELEPHONE INFECTION REFERRAL',
  sections: [
    { id: 'ref', t: 'Referral', ask: ['Who is calling: grade, team and hospital', 'What exactly is the question?', 'Advice only, or a request for review or transfer?'], f: [
      { id: 'cons', k: 'text', l: 'On-call consultant', ph: 'e.g. Dr B Jones, ID consultant', out: 'On-call consultant: ' },
      { id: 'me', k: 'text', l: 'Taken by (your name and role; remembered on this device)', ph: 'e.g. Dr A Smith, ID registrar', mine: true, out: 'Taken by: ' },
      { id: 'from', k: 'text', l: 'Referrer (role, team, hospital)', ph: 'e.g. Medical registrar, AMU, district general hospital', out: 'From: ' },
      { id: 'reason', k: 'chips', l: 'Reason', o: ['Antimicrobial advice', 'Positive culture', 'Fever, source unclear', 'Returned traveller', 'Possible HCID', 'Endocarditis', 'Bone or joint infection', 'CNS infection', 'HIV-related', 'TB query', 'Exposure or PEP', 'Review or transfer request', 'OPAT'] },
      { id: 'question', k: 'area', l: 'Specific question', out: 'Question: ' }] },
    { id: 'pt', t: 'Patient', ask: ['Age, sex and weight (no name, date of birth or hospital number)', 'Allergies, and what actually happened'], f: [
      { id: 'age', k: 'num', l: 'Age', u: 'years', group: 'pt' }, { id: 'sex', k: 'one', l: 'Sex', o: ['Male', 'Female'], group: 'pt' }, { id: 'wt', k: 'num', l: 'Weight', u: 'kg', group: 'pt' },
      { id: 'allergy', k: 'chips', l: 'Allergies', o: ['No known drug allergies', 'Penicillin: rash', 'Penicillin: anaphylaxis', 'Other drug allergy'] },
      { id: 'allergyd', k: 'text', l: 'Allergy details' }] },
    { id: 'hpc', t: 'Presenting illness', ask: ['When and how it started', 'Fever pattern and rigors', 'Localising symptoms', 'What has happened since admission'], f: [
      { id: 'onset', k: 'text', l: 'Onset', ph: 'e.g. 5 days, gradual' },
      { id: 'sx', k: 'chips', l: 'Symptoms', neg: 'Not present', o: ['Fever', 'Rigors', 'Night sweats', 'Weight loss', 'Headache', 'Confusion', 'Neck stiffness', 'Seizure', 'Cough', 'Breathlessness', 'Chest pain', 'Abdominal pain', 'Diarrhoea', 'Vomiting', 'Jaundice', 'Urinary symptoms', 'Back pain', 'Joint pain or swelling', 'Rash', 'Skin or wound infection', 'Line site problem', 'New murmur'] },
      { id: 'hpcd', k: 'area', l: 'History of presenting illness' }] },
    { id: 'bg', t: 'Background', ask: ['Immune status and immunosuppressive drugs', 'Implants, devices and lines', 'Admissions, surgery and antibiotics in the last 3 months', 'Known resistant organisms'], f: [
      { id: 'immuno', k: 'chips', l: 'Risk factors', none: 'None', o: ['None', 'HIV', 'Solid organ transplant', 'Stem cell transplant', 'Chemotherapy', 'Neutropenic', 'Steroids', 'Biologics or DMARDs', 'Asplenia', 'Diabetes', 'CKD', 'Dialysis', 'Cirrhosis', 'Pregnant', 'Injecting drug use', 'Alcohol excess'] },
      { id: 'devices', k: 'chips', l: 'Devices and implants', none: 'None', o: ['None', 'Prosthetic valve', 'Pacemaker or ICD', 'Prosthetic joint', 'Vascular graft or stent', 'Central line or PICC', 'Port', 'Urinary catheter', 'CSF shunt or drain', 'Recent surgery'] },
      { id: 'mdro', k: 'chips', l: 'Known resistant organisms', none: 'None known', o: ['None known', 'MRSA', 'ESBL', 'CPE', 'VRE', 'Pseudomonas', 'C. difficile', 'Candida auris'] },
      { id: 'recent', k: 'text', l: 'Recent admissions or antibiotics' },
      { id: 'pmh', k: 'area', l: 'Other relevant history and medicines' }] },
    { id: 'trav', t: 'Travel and exposures', ask: ['Where, when, for how long, rural or urban', 'Malaria prophylaxis and pre-travel vaccines', 'Animals, water, insects, food, sex, sick contacts, work'], f: [
      { id: 'links', k: 'links', l: 'Check current outbreaks and HCID status', o: [
        ['HCID list (UKHSA)', 'https://www.gov.uk/guidance/high-consequence-infectious-diseases-hcid'],
        ['VHF risk assessment', 'https://assets.publishing.service.gov.uk/media/6aa2833e92e72b8ac437f0b8/viral-haemorrhagic-fevers-risk-assessment-algorithm-september-2026.pdf'],
        ['TravelHealthPro outbreaks', 'https://travelhealthpro.org.uk/'],
        ['WHO Disease Outbreak News', 'https://www.who.int/emergencies/disease-outbreak-news'],
        ['ProMED', 'https://promedmail.org/'],
        ['Fit for Travel', 'https://www.fitfortravel.nhs.uk/']] },
      { id: 'travel', k: 'text', l: 'Travel (where, when returned, how long)', ph: 'e.g. Ghana, returned 9 days ago, 3 weeks visiting family', out: 'Travel: ' },
      { id: 'prev', k: 'chips', l: 'Prevention', o: ['No travel', 'Malaria prophylaxis taken', 'No malaria prophylaxis', 'Pre-travel vaccines', 'No pre-travel advice'] },
      { id: 'expo', k: 'chips', l: 'Exposures', neg: 'No exposure to', o: ['Mosquito bites', 'Tick bites', 'Freshwater', 'Animal bite or scratch', 'Farm animals', 'Unpasteurised dairy', 'Street food or untreated water', 'Sexual contact', 'Sick contacts', 'Healthcare abroad', 'Caves or bats', 'Occupational'] },
      { id: 'expod', k: 'area', l: 'Exposure details' }] },
    { id: 'obs', t: 'Observations', ask: ['Latest set, and the trend', 'Oxygen requirement', 'Conscious level', 'In ICU or HDU: organ support'], f: [{ id: 'obs', k: 'obs' },
      { id: 'icu', k: 'one', l: 'Critical care', o: ['In ICU or HDU'], out: '' },
      { id: 'icus', k: 'chips', l: 'Organ support', dep: { id: 'icu', v: 'In ICU or HDU' }, out: 'Organ support: ', o: ['Intubated and ventilated', 'Non-invasive ventilation', 'High-flow nasal oxygen', 'Proned', 'Vasopressors', 'Inotropes', 'CRRT', 'ECMO', 'Sedated'] },
      { id: 'icud', k: 'text', l: 'Support details', ph: 'e.g. noradrenaline 0.2 micrograms/kg/min, FiO₂ 0.5, PEEP 10', dep: { id: 'icu', v: 'In ICU or HDU' }, out: 'Support details: ' },
      { id: 'obsd', k: 'text', l: 'Trend or other', out: '' }] },
    { id: 'bloods', t: 'Bloods', ask: ['Latest values, and the date', 'Trend since admission'], f: [{ id: 'labs', k: 'labs' }, { id: 'labsd', k: 'text', l: 'Date, trend or other results', ph: 'e.g. today; CRP 320 → 250 over 48 h', out: '' }] },
    { id: 'micro', t: 'Microbiology', ask: ['Blood cultures: sets, result, time to positivity', 'Other samples and results', 'Serology, PCR, malaria tests'], f: [
      { id: 'bc', k: 'text', l: 'Blood cultures', ph: 'e.g. 2/2 sets S. aureus at 14 h; sensitivities pending' },
      { id: 'sampdone', k: 'chips', l: 'Other samples sent (tap to add a line for its result)', ins: 'samples', out: 'Sent: ', o: ['Urine culture', 'Sputum culture', 'CSF (LP)', 'Wound or pus swab', 'Throat swab', 'Stool culture', 'C. difficile test', 'Joint aspirate', 'Pleural fluid', 'Ascitic fluid', 'Tissue or bone', 'Line tip'] },
      { id: 'samples', k: 'area', l: 'Other samples: results', rows: 5 },
      { id: 'virodone', k: 'chips', l: 'Serology, PCR and antigen tests sent (tap to add a line)', ins: 'viro', out: 'Sent: ', o: ['Malaria films and RDT', 'Respiratory viral PCR', 'Legionella and pneumococcal urine antigens', 'HIV test', 'Hepatitis B and C', 'Syphilis serology', 'EBV and CMV', 'β-D-glucan', 'Galactomannan', 'Cryptococcal antigen', 'IGRA'] },
      { id: 'viro', k: 'area', l: 'Serology, PCR and antigen tests: results', rows: 4 }] },
    { id: 'img', t: 'Imaging', ask: ['What was done and when', 'Formal report or provisional'], f: [
      { id: 'imgdone', k: 'chips', l: 'Done (tap to add a line for its findings)', ins: 'imgd', out: 'Done: ', o: ['Chest X-ray', 'CT', 'Ultrasound', 'MRI', 'Echo (TTE)', 'TOE', 'PET-CT'] },
      { id: 'imgd', k: 'area', l: 'Findings', rows: 5 }] },
    { id: 'mx', t: 'Current management', ask: ['Antimicrobials: drug, dose, route, and when started', 'Source control done or planned', 'Response so far'], f: [
      { id: 'abx', k: 'abx' }, { id: 'source', k: 'text', l: 'Source control' }, { id: 'resp', k: 'text', l: 'Response so far', out: 'Response: ' }] },
    { id: 'adv', t: 'Impression and advice', ask: ['Your impression', 'Antimicrobial advice', 'Further tests', 'Follow-up: who calls whom, and when'], f: [
      { id: 'imp', k: 'area', l: 'Impression', head: 'IMPRESSION' }, { id: 'advice', k: 'area', l: 'Advice given', head: 'ADVICE GIVEN' },
      { id: 'inv', k: 'area', l: 'Investigations suggested', head: 'INVESTIGATIONS SUGGESTED' }, { id: 'fu', k: 'text', l: 'Follow-up', out: '', head: 'FOLLOW-UP' }] }
  ]
});
