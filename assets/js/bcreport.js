/* Positive blood culture report: template for phoning or documenting a positive blood culture (uses notes-form.js). */
NoteForm({
  host: 'bcreport', prefix: 'bcr', key: 'mc-bcreport', title: 'POSITIVE BLOOD CULTURE: MICROBIOLOGY ADVICE', askLabel: 'Check:',
  sections: [
    { id: 'rep', t: 'Report', ask: ['Who you are speaking to, and their role', 'Confirm the patient on your systems (not in this note)'], f: [
      { id: 'me', k: 'text', l: 'Reported by (your name and role; remembered on this device)', ph: 'e.g. Dr A Smith, microbiology registrar', mine: true, out: 'Reported by: ' },
      { id: 'to', k: 'text', l: 'Reported to (role, team, ward)', ph: 'e.g. FY2, respiratory, ward 5', out: 'Reported to: ' },
      { id: 'how', k: 'one', l: 'How', o: ['Phone', 'In person', 'Epic message'] }] },
    { id: 'cult', t: 'Culture', ask: ['How many sets and bottles are positive', 'Where each set was taken from', 'Time to positivity'], f: [
      { id: 'sets', k: 'text', l: 'Sets positive', ph: 'e.g. 2 of 2 sets', out: 'Positive: ' },
      { id: 'bottles', k: 'chips', l: 'Bottles', o: ['Aerobic', 'Anaerobic', 'Paediatric'] },
      { id: 'site', k: 'chips', l: 'Taken from', o: ['Peripheral', 'Central line', 'PICC', 'Port', 'Arterial line', 'Dialysis line', 'Not recorded'] },
      { id: 'ttp', k: 'num', l: 'Time to positivity', u: 'hours' },
      { id: 'taken', k: 'text', l: 'When taken', ph: 'e.g. on admission; day 4 of admission', out: 'Taken: ' }] },
    { id: 'id', t: 'Gram stain and identification', ask: ['Gram stain appearance', 'Identification and how it was made', 'Resistance markers from rapid tests'], f: [
      { id: 'gram', k: 'chips', l: 'Gram stain', o: ['Gram-positive cocci in clusters', 'Gram-positive cocci in chains or pairs', 'Gram-positive bacilli', 'Gram-negative bacilli', 'Gram-negative cocci', 'Yeasts', 'Mixed'] },
      { id: 'org', k: 'text', l: 'Identification', ph: 'e.g. Staphylococcus aureus', list: ['Staphylococcus aureus', 'Coagulase-negative staphylococcus', 'Staphylococcus lugdunensis', 'Streptococcus pneumoniae', 'Streptococcus pyogenes (group A)', 'Streptococcus agalactiae (group B)', 'Streptococcus dysgalactiae (group C/G)', 'Viridans group streptococcus', 'Streptococcus anginosus group', 'Enterococcus faecalis', 'Enterococcus faecium', 'Escherichia coli', 'Klebsiella pneumoniae', 'Klebsiella oxytoca', 'Enterobacter cloacae complex', 'Klebsiella aerogenes', 'Proteus mirabilis', 'Serratia marcescens', 'Citrobacter freundii', 'Pseudomonas aeruginosa', 'Acinetobacter baumannii', 'Stenotrophomonas maltophilia', 'Haemophilus influenzae', 'Neisseria meningitidis', 'Salmonella Typhi', 'Salmonella Paratyphi A', 'Non-typhoidal Salmonella', 'Campylobacter', 'Bacteroides fragilis group', 'Clostridium perfringens', 'Listeria monocytogenes', 'Bacillus species', 'Corynebacterium species', 'Cutibacterium acnes', 'Candida albicans', 'Candida glabrata (Nakaseomyces glabratus)', 'Candida parapsilosis', 'Candida auris', 'Cryptococcus neoformans'], out: 'Identification: ' },
      { id: 'meth', k: 'chips', l: 'Method', o: ['MALDI-TOF', 'Rapid PCR panel', 'Culture', 'Pending'] },
      { id: 'mark', k: 'chips', l: 'Resistance markers', none: 'None detected', nil: 'No resistance markers detected', o: ['None detected', 'MRSA (mecA or PBP2a)', 'ESBL', 'AmpC', 'Carbapenemase', 'VRE'] },
      { id: 'markd', k: 'text', l: 'Marker details', ph: 'e.g. OXA-48 detected; vanA', out: '' }] },
    { id: 'sus', t: 'Susceptibilities', ask: ['Which results are final, and which are pending'], f: [
      { id: 'sir', k: 'sir', l: 'Results', o: ['Penicillin', 'Amoxicillin', 'Flucloxacillin', 'Co-amoxiclav', 'Piperacillin–tazobactam', 'Temocillin', 'Cefalexin', 'Cefuroxime', 'Ceftriaxone', 'Ceftazidime', 'Ceftazidime–avibactam', 'Meropenem', 'Ertapenem', 'Gentamicin', 'Amikacin', 'Ciprofloxacin', 'Co-trimoxazole', 'Trimethoprim', 'Nitrofurantoin', 'Clindamycin', 'Erythromycin', 'Doxycycline', 'Vancomycin', 'Teicoplanin', 'Daptomycin', 'Linezolid', 'Rifampicin', 'Fluconazole', 'Echinocandin'] },
      { id: 'sird', k: 'text', l: 'Pending or other results', ph: 'e.g. full susceptibilities to follow; vancomycin MIC 1 mg/L', out: '' }] },
    { id: 'ctx', t: 'Clinical context', ask: ['How the patient is now: obs, NEWS2, ward or ICU', 'Likely source, and any lines or implants', 'Current antimicrobials and allergies'], f: [
      { id: 'status', k: 'chips', l: 'Status', o: ['Stable', 'Febrile', 'Septic', 'Septic shock', 'On ICU', 'Neutropenic', 'Improving'] },
      { id: 'source', k: 'chips', l: 'Likely source', o: ['Line', 'Urinary', 'Biliary or intra-abdominal', 'Chest', 'Skin or soft tissue', 'Bone or joint', 'Endocarditis', 'CNS', 'Unknown'] },
      { id: 'devices', k: 'chips', l: 'Devices and implants', none: 'None', nil: 'No devices or implants', o: ['None', 'Central line or PICC', 'Port', 'Dialysis line', 'Prosthetic valve', 'Pacemaker or ICD', 'Prosthetic joint', 'Vascular graft or stent', 'Urinary catheter'] },
      { id: 'allergy', k: 'chips', l: 'Allergies', o: ['No known drug allergies', 'Penicillin: rash', 'Penicillin: anaphylaxis', 'Other drug allergy'] },
      { id: 'allergyd', k: 'text', l: 'Allergy details' },
      { id: 'abx', k: 'abx', l: 'Current antimicrobials', out: 'Current antimicrobials:' },
      { id: 'ctxd', k: 'area', l: 'Other context', out: '' }] },
    { id: 'adv', t: 'Interpretation and advice', ask: ['Is this real?', 'Antimicrobial advice and source control', 'Follow-up: who calls whom, and when'], f: [
      { id: 'interp', k: 'one', l: 'Interpretation', o: ['True bacteraemia likely', 'Possible contaminant: repeat cultures', 'Likely contaminant', 'Too early to say'], head: 'INTERPRETATION', out: '' },
      { id: 'interpd', k: 'area', l: 'Comment', out: '' },
      { id: 'advice', k: 'area', l: 'Antimicrobial advice', head: 'ADVICE', out: '' },
      { id: 'actions', k: 'chips', l: 'Actions advised', o: ['Repeat blood cultures', 'Follow-up cultures at 48 hours', 'Remove or replace line', 'Echo (TTE)', 'TOE', 'Imaging for source', 'Source control', 'Infection specialist review', 'Check drug levels', 'Isolation', 'IPC informed', 'Notify UKHSA'] },
      { id: 'fu', k: 'text', l: 'Follow-up', ph: 'e.g. Micro to call with susceptibilities tomorrow', out: '', head: 'FOLLOW-UP' }] }
  ]
});
