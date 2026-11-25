/* Teach on the ward: pick a topic and how long you have; get a ready-made session for medical students with a
   timed plan, learning points, questions with tap-to-reveal answers, something to show at the bedside, a short
   case (20 minutes) and a take-home message. Countdown timer and large-text mode. */
(function () {
  var host = document.getElementById('teach');
  if (!host) return;
  var base = host.getAttribute('data-base') || '';
  var hashMode = host.hasAttribute('data-hash');
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function url(u) { if (hashMode) { var m = /^\/([^/]+)\/(#.*)?$/.exec(u); return m ? (m[2] || '#' + m[1]) : u; } return base + u; }

  // pts: learning points (most important first); qs: [question, answer]; bed: bedside demonstrations;
  // take: take-home message; cs: short case for 20-minute sessions [stem, [[question, answer], ...]]; see: [label, path]
  var T = [
    { id: 'sepsis', t: 'Sepsis', pts: [
        'Sepsis is life-threatening organ dysfunction caused by a dysregulated response to infection.',
        'Recognise it early: NEWS2 of 5 or more, or one red-flag sign, should prompt a review for sepsis.',
        'Blood cultures before antibiotics, but do not delay antibiotics in high-risk patients: aim for within an hour.',
        'Lactate is a marker of severity; a raised lactate with hypotension needs senior and critical care input.',
        'Find and control the source: drain pus, remove infected lines, relieve obstruction.'],
      qs: [['Which observations make up NEWS2?', 'Respiratory rate, oxygen saturation (and whether on oxygen), systolic blood pressure, pulse, level of consciousness (ACVPU, including new confusion) and temperature.'],
        ['Why take blood cultures before antibiotics?', 'A single dose of antibiotic can sterilise blood cultures, losing the chance to identify the organism and its susceptibilities, which guides narrowing treatment later.'],
        ['What does a raised lactate tell you?', 'Tissue hypoperfusion or impaired lactate clearance; it marks higher risk of death. It is not specific to infection (liver disease, seizures, metformin, adrenaline).'],
        ['Name three sources you would look for in a septic patient with no obvious focus.', 'Urine, chest, abdomen (including biliary), skin and soft tissue, lines and devices, heart valves (endocarditis), joints and spine, meninges.'],
        ['When would you choose not to escalate to intensive care?', 'When it would not be in the patient’s interests or wishes: discuss treatment escalation plans and resuscitation decisions early, with the patient and family where possible.'],
        ['Why review antibiotics at 48–72 hours?', 'To narrow or stop based on cultures and progress ("Start Smart then Focus"), reducing side effects, C. difficile and resistance.']],
      bed: ['Count the respiratory rate for a full 30 seconds: it is the most often missed and most predictive observation.', 'Check capillary refill and skin mottling; look at the urine output on the fluid chart.'],
      take: 'Think sepsis, measure the observations properly, take cultures and give antibiotics fast, then find the source.',
      cs: ['A 74-year-old man is confused with a temperature of 38.9°C, heart rate 118, blood pressure 88/50, respiratory rate 26 and lactate 4.1 mmol/L. He has a long-term urinary catheter.', [['What is his risk category?', 'High risk: hypotension, raised respiratory rate, new confusion and lactate over 4 mmol/L.'], ['What do you do in the first hour?', 'Senior review, blood cultures, urine from a new catheter, IV antibiotics per local policy, IV fluid bolus, oxygen if needed, lactate repeat, catheter change, and critical care referral if not responding.']]],
      see: [['NEWS2 and qSOFA', '/scores/'], ['Blood culture triage', '/blood-culture-triage/']] },

    { id: 'cellulitis', t: 'Cellulitis', pts: [
        'Cellulitis is a spreading infection of the dermis and subcutaneous tissue, usually streptococcal or S. aureus.',
        'Most red legs are not cellulitis: bilateral redness suggests venous eczema, lipodermatosclerosis or oedema.',
        'Look for a portal of entry: tinea between the toes, ulcers, wounds, insect bites.',
        'Flucloxacillin is first line in the UK; mark the edge and review at 48 hours.',
        'Pain out of proportion, rapid spread or systemic toxicity suggests necrotising fasciitis: a surgical emergency.'],
      qs: [['How do you tell cellulitis from venous eczema?', 'Cellulitis is usually one-sided, hot, tender and spreading, often with fever; venous eczema is often bilateral, itchy, scaly and not very tender.'],
        ['Why mark the edge with a pen?', 'To judge spread or response objectively at the next review; redness can extend in the first 24–48 hours even when treatment is working.'],
        ['What would make you worry about necrotising fasciitis?', 'Pain out of proportion to the signs, rapid spread, blistering or dusky skin, crepitus, anaesthesia over the area, and systemic toxicity.'],
        ['Which organisms cause cellulitis, and what is the first-line antibiotic?', 'Streptococcus pyogenes and other β-haemolytic streptococci, and Staphylococcus aureus; flucloxacillin (clarithromycin or doxycycline if penicillin allergic).'],
        ['What reduces recurrence?', 'Treating tinea pedis, managing leg oedema (compression, elevation), skin care; prophylactic antibiotics for frequent recurrences.'],
        ['When should you take a swab?', 'Only if there is an open wound, ulcer or pus; intact skin swabs are not useful.']],
      bed: ['Look between the toes for tinea and cracked skin.', 'Compare both legs and feel for warmth and tenderness; check for a DVT if unsure.'],
      take: 'One hot, tender, spreading leg is cellulitis; two red legs usually are not. Look for the portal of entry.',
      cs: ['A 58-year-old woman has a red, hot, tender left lower leg for 2 days with a temperature of 38.2°C. There is maceration between her toes.', [['What is the likely diagnosis and source?', 'Cellulitis with tinea pedis as the portal of entry.'], ['How would you treat her?', 'Oral flucloxacillin (IV if systemically unwell or not tolerating oral), mark the edge, treat the tinea with a topical antifungal, elevate the leg, review at 48 hours.']]],
      see: [['Cellulitis (disease lookup)', '/diseases/#dz-cellulitis'], ['LRINEC score', '/scores/']] },

    { id: 'pneumonia', t: 'Community-acquired pneumonia', pts: [
        'CURB-65 (with clinical judgement) estimates severity and guides where to treat and which antibiotic.',
        'Most common cause is Streptococcus pneumoniae; atypicals include Mycoplasma and Legionella.',
        'Low severity: amoxicillin; high severity: broader cover including an atypical agent.',
        'Five days of antibiotics is enough for most patients who are improving.',
        'Repeat the chest X-ray at about 6 weeks only if symptoms persist or there is a risk of underlying cancer.'],
      qs: [['What does CURB-65 stand for?', 'Confusion, Urea over 7 mmol/L, Respiratory rate 30 or more, low Blood pressure (systolic under 90 or diastolic 60 or less), age 65 or over.'],
        ['Which tests would you send in moderate to severe pneumonia?', 'Chest X-ray, blood cultures, sputum culture, pneumococcal and Legionella urinary antigens, and a respiratory viral PCR in season.'],
        ['What clues suggest Legionella?', 'Severe pneumonia with confusion, diarrhoea, hyponatraemia, raised CK or deranged LFTs, and exposure to hot tubs, cooling towers or travel.'],
        ['How long should treatment last?', 'Five days for most, then stop if clinically stable.'],
        ['What does dull percussion at a lung base suggest?', 'Consolidation or a pleural effusion; an effusion may need tapping to exclude empyema.'],
        ['Which patients should have an HIV test?', 'Everyone with community-acquired pneumonia in high-prevalence areas, and anyone with recurrent pneumonia or other indicator conditions.']],
      bed: ['Percuss and listen for bronchial breathing over consolidation.', 'Look at the chest X-ray together and describe it systematically.'],
      take: 'Score severity with CURB-65, treat to the severity, and stop after five days if better.',
      cs: ['A 70-year-old man has 3 days of cough, fever and right-sided chest pain. He is confused, urea is 9 mmol/L, respiratory rate 24, blood pressure 110/70.', [['What is his CURB-65 score?', '3 (confusion, urea, age): high severity.'], ['What antibiotics and tests?', 'IV co-amoxiclav plus clarithromycin per NICE (or local policy); blood cultures, sputum, urinary antigens, and consider steroids for severe pneumonia in hospital.']]],
      see: [['CURB-65', '/scores/'], ['Pneumonia (disease lookup)', '/diseases/#dz-cap']] },

    { id: 'uti', t: 'Urinary tract infection', pts: [
        'Bacteria in the urine without symptoms (asymptomatic bacteriuria) usually should not be treated.',
        'Urine dipsticks are not useful in people over 65 or with catheters: diagnose on symptoms and culture.',
        'Women under 65 with cystitis: nitrofurantoin for 3 days (if kidney function allows).',
        'Pyelonephritis needs an agent that reaches the kidney: not nitrofurantoin.',
        'Confusion alone in an older person is not a reason to diagnose a UTI.'],
      qs: [['When should asymptomatic bacteriuria be treated?', 'In pregnancy, and before urological procedures that breach the mucosa. Not in older people or those with catheters.'],
        ['Why not use nitrofurantoin for pyelonephritis?', 'It concentrates in the bladder and does not reach useful levels in the kidney or blood.'],
        ['Which symptoms suggest a UTI in an older person?', 'New dysuria, new frequency or urgency, new incontinence, suprapubic pain, rigors, loin pain, or new or worsening delirium with other signs.'],
        ['How do you take urine from a catheterised patient?', 'From the sampling port of a new catheter (change a long-term catheter first), not from the bag.'],
        ['How long do you treat cystitis in men?', 'Seven days (and send a culture).'],
        ['What organisms cause most UTIs?', 'E. coli mainly; also Klebsiella, Proteus, Enterococcus and Staphylococcus saprophyticus in young women.']],
      bed: ['Look at the urine and the catheter bag; check when the catheter was last changed.', 'Feel for suprapubic tenderness and renal angle tenderness.'],
      take: 'Treat symptoms, not urine: no dipsticks over 65 or with catheters.',
      cs: ['An 86-year-old care home resident is more confused. A dipstick is positive for leucocytes and nitrites. She has no fever, dysuria or other urinary symptoms.', [['Should she be treated for a UTI?', 'Not on these findings: dipsticks are unreliable over 65 and asymptomatic bacteriuria is common. Look for other causes of confusion.'], ['What would you look for instead?', 'Dehydration, constipation, pain, medicines, hypoxia, other infections, electrolyte disturbance; review again if urinary symptoms or fever develop.']]],
      see: [['Lower UTI (disease lookup)', '/diseases/#dz-cystitis'], ['Pyelonephritis', '/diseases/#dz-pyelo']] },

    { id: 'bloodcultures', t: 'Blood cultures', pts: [
        'Take two sets (four bottles) before antibiotics, from separate venepunctures, ideally 20 mL per set.',
        'Volume matters more than timing with fever: under-filled bottles miss bacteraemia.',
        'Skin contaminants (coagulase-negative staphylococci, diphtheroids) in one set are usually not real.',
        'Staphylococcus aureus, Candida and Streptococcus pneumoniae in blood are never contaminants.',
        'Time to positivity helps: true pathogens usually flag within 24 hours.'],
      qs: [['How many sets should you take, and why?', 'Two sets from separate sites: it increases the chance of catching bacteraemia and helps tell contaminants (one set) from true infection (both sets).'],
        ['What is a contaminant, and how do you reduce them?', 'Skin flora picked up during sampling. Use aseptic technique, clean the skin with chlorhexidine and let it dry, and do not take cultures through old lines unless looking for line infection.'],
        ['What should happen when S. aureus grows in a blood culture?', 'Never ignore it: repeat cultures, echo, remove lines, look for a source, and an infection specialist review.'],
        ['Why is the bottle volume important?', 'The chance of detecting bacteraemia rises with the volume of blood cultured; under-filled bottles miss infections.'],
        ['What does a Gram stain tell you before the organism is identified?', 'Gram-positive or negative, cocci or rods, clusters or chains: enough to adjust empirical treatment (for example adding cover for staphylococci).'],
        ['Should you take blood cultures in every patient with a fever?', 'No: when bacteraemia is plausible (sepsis, rigors, suspected endocarditis, line infection, neutropenia), not for every temperature.']],
      bed: ['Show the blood culture bottles and the fill line; talk through the order (aerobic first with a butterfly).', 'Look at a culture result on the computer together.'],
      take: 'Two sets, well filled, before antibiotics; S. aureus is never a contaminant.',
      cs: ['A patient’s blood culture flags after 30 hours: one set of two shows Gram-positive cocci in clusters, later identified as coagulase-negative staphylococcus. No lines or prosthetic material.', [['Is this likely to be real?', 'Probably a contaminant: one of two sets, a skin organism, slow to flag, no device.'], ['What would change your mind?', 'Both sets positive, a central line, prosthetic valve or joint, or a patient who is unwell without another explanation.']]],
      see: [['Blood culture triage', '/blood-culture-triage/'], ['S. aureus bacteraemia', '/sab/']] },

    { id: 'classes', t: 'Antibiotic classes', pts: [
        'Antibiotics act on the cell wall (β-lactams, glycopeptides), protein synthesis (aminoglycosides, macrolides, tetracyclines), DNA (quinolones) or folate (trimethoprim).',
        'β-lactams (penicillins, cephalosporins, carbapenems) are the backbone of most treatment.',
        'Gram-negatives are covered by the broader agents: co-amoxiclav, cephalosporins, piperacillin–tazobactam, carbapenems, gentamicin.',
        'Anaerobes: metronidazole, co-amoxiclav, piperacillin–tazobactam and carbapenems.',
        'Atypicals (Mycoplasma, Legionella) need macrolides, doxycycline or quinolones: β-lactams do not work.'],
      qs: [['Name one antibiotic in each of four classes.', 'For example: amoxicillin (penicillin), ceftriaxone (cephalosporin), gentamicin (aminoglycoside), clarithromycin (macrolide), ciprofloxacin (quinolone), doxycycline (tetracycline).'],
        ['Why does flucloxacillin not work on MRSA?', 'MRSA has an altered penicillin-binding protein (PBP2a) that β-lactams like flucloxacillin cannot bind.'],
        ['Which antibiotic is used for C. difficile?', 'Oral vancomycin (or fidaxomicin); oral vancomycin stays in the gut.'],
        ['What are the main side effects to monitor with gentamicin?', 'Kidney toxicity and ototoxicity: monitor levels and kidney function.'],
        ['Why are quinolones used less now?', 'Safety warnings (tendon rupture, aortic aneurysm, neuropathy, mental health effects) and C. difficile risk.'],
        ['What does a co-amoxiclav add to amoxicillin?', 'Clavulanate, a β-lactamase inhibitor, which protects amoxicillin from many β-lactamases and adds anaerobe and some Gram-negative cover.']],
      bed: ['Look at the patient’s drug chart together and name the class of each antimicrobial.', 'Ask what organism each one is meant to cover.'],
      take: 'Know what each antibiotic is for: which bug, which site, and when to stop.',
      cs: ['A patient with an intra-abdominal abscess is on piperacillin–tazobactam. Cultures grow E. coli susceptible to co-amoxiclav and Bacteroides.', [['Can treatment be narrowed?', 'Yes: co-amoxiclav covers both and can be given orally once drained and improving.'], ['What else matters more than the antibiotic?', 'Source control: drainage of the abscess.']]],
      see: [['Mechanisms diagram', '/mechanisms/'], ['Spectrum chart', '/spectrum/']] },

    { id: 'allergy', t: 'Penicillin allergy', pts: [
        'About 10% of patients carry a penicillin allergy label; over 90% of them are not truly allergic.',
        'A false label leads to broader, less effective antibiotics, more C. difficile and MRSA, and worse outcomes.',
        'Take a proper history: what happened, when, how soon after the dose, and what treatment was needed.',
        'Rash, nausea or diarrhoea are often intolerance or the infection itself, not allergy.',
        'Low-risk patients (PEN-FAST under 3) can often be de-labelled with a direct oral challenge.'],
      qs: [['What questions do you ask about a penicillin allergy?', 'What was the reaction, how long ago, how soon after starting, was it treated (adrenaline, admission), and have they had a penicillin since.'],
        ['Which reactions are high risk?', 'Anaphylaxis, angioedema, severe skin reactions (Stevens–Johnson syndrome, DRESS), and organ involvement.'],
        ['What is the cross-reactivity between penicillins and cephalosporins?', 'Low (about 1–2%), mainly with similar side chains; most penicillin-allergic patients can have later-generation cephalosporins unless the reaction was severe.'],
        ['What does PEN-FAST measure?', 'Five years or less since reaction, Anaphylaxis or angioedema, Severe cutaneous reaction, and Treatment required: a score under 3 is low risk.'],
        ['Why does the label matter?', 'Alternatives are often broader, less effective and more toxic, with more resistance and C. difficile.'],
        ['What is a direct oral challenge?', 'Giving a test dose of amoxicillin under observation to prove tolerance, without skin testing first, in low-risk patients.']],
      bed: ['Take an allergy history from a patient with a penicillin label together.', 'Check the drug chart and records for previous penicillin doses tolerated.'],
      take: 'Ask what actually happened: most penicillin allergy labels are wrong.',
      cs: ['A 45-year-old woman says she is allergic to penicillin: as a child she had a rash with amoxicillin for an ear infection. She has had no penicillin since.', [['What is her PEN-FAST score?', '0: over 5 years ago, not anaphylaxis or a severe skin reaction, no treatment needed. Very low risk.'], ['What would you do?', 'Discuss de-labelling via a direct oral challenge pathway; until then, document the reaction details clearly.']]],
      see: [['Penicillin allergy', '/penicillin-allergy/'], ['PEN-FAST', '/scores/']] },

    { id: 'cdiff', t: 'Clostridioides difficile', pts: [
        'C. difficile causes antibiotic-associated diarrhoea and colitis, especially after broad-spectrum antibiotics.',
        'Test only unformed stool (Bristol 5–7) without another clear cause; do not test formed stool.',
        'Testing is two-step: GDH (organism present) then toxin (active disease).',
        'Isolate in a side room with enteric precautions; alcohol gel does not kill spores: wash with soap and water.',
        'Treat with oral vancomycin; stop unnecessary antibiotics and PPIs.'],
      qs: [['Which antibiotics carry the highest risk?', 'Clindamycin, cephalosporins, co-amoxiclav and quinolones; any antibiotic can cause it.'],
        ['Why does alcohol gel not work?', 'C. difficile forms spores, which survive alcohol; soap and water physically removes them.'],
        ['What markers suggest severe infection?', 'White cell count over 15, rising creatinine, temperature over 38.5°C, colitis on imaging, and ileus or toxic megacolon.'],
        ['What do GDH-positive, toxin-negative results mean?', 'C. difficile is present but may not be causing disease (colonisation); treat if the clinical picture fits, and isolate.'],
        ['How long do you treat?', 'Ten days of oral vancomycin (or fidaxomicin).'],
        ['How can recurrence be prevented?', 'Avoid unnecessary antibiotics and PPIs; fidaxomicin, bezlotoxumab or faecal microbiota transplant for repeated recurrences.']],
      bed: ['Show the Bristol stool chart and the stool chart for the patient.', 'Point out the isolation signage and the soap-and-water handwashing.'],
      take: 'Unformed stool, two-step test, side room, soap and water, oral vancomycin, stop the culprit antibiotic.',
      cs: ['A 78-year-old on co-amoxiclav for 5 days develops 6 episodes of watery diarrhoea a day. WCC is 17, creatinine has risen from 80 to 140.', [['What is the likely diagnosis and severity?', 'C. difficile infection; severe (WCC over 15, rising creatinine).'], ['What do you do?', 'Send stool, isolate, stop co-amoxiclav if possible, oral vancomycin, fluids, review PPIs, and assess for colitis complications.']]],
      see: [['C. difficile guide', '/cdiff/'], ['Isolation', '/isolation/']] },

    { id: 'traveller', t: 'Fever in the returned traveller', pts: [
        'Malaria first: any fever within a year of visiting a malarious area needs malaria tests, repeated until three are negative.',
        'Take a full travel history: where, when, how long, activities, prophylaxis and vaccines.',
        'Incubation periods help rule diagnoses in or out.',
        'Think about viral haemorrhagic fevers early if the patient was in an affected area within 21 days: risk-assess before testing.',
        'Common causes besides malaria: dengue, enteric fever, rickettsia, and ordinary infections like pneumonia and UTI.'],
      qs: [['Why is falciparum malaria an emergency?', 'It can progress to severe disease (cerebral malaria, kidney failure, acidosis) within hours, especially in non-immune travellers.'],
        ['What is the incubation period of falciparum malaria?', 'Usually 7–30 days; it is unlikely within 7 days of arriving in a malarious area.'],
        ['Which features suggest dengue?', 'Fever, headache, retro-orbital pain, myalgia, rash, low platelets and white cells, returning from the tropics within 2 weeks.'],
        ['What tests would you send?', 'Malaria films and rapid test, FBC, LFTs, U&E, blood cultures, and others guided by history (dengue NS1, HIV test).'],
        ['Why ask about malaria prophylaxis?', 'Good adherence lowers but does not remove the risk; incomplete courses are common.'],
        ['When would you think about a viral haemorrhagic fever?', 'Fever within 21 days of being in an area with Lassa, Ebola, Marburg or CCHF, especially with exposure risks: use the UKHSA risk assessment.']],
      bed: ['Take a structured travel history from a patient together.', 'Look for rash, eschar (rickettsia), jaundice and hepatosplenomegaly.'],
      take: 'Fever after the tropics is malaria until proven otherwise: three negative tests.',
      cs: ['A 32-year-old returned from visiting family in Nigeria 10 days ago with fever, headache and vomiting. He took no prophylaxis.', [['What is the most important test?', 'Malaria films and rapid antigen test, urgently.'], ['What would make it severe?', 'Parasitaemia 2% or more (UK threshold), impaired consciousness, kidney injury, acidosis, hypoglycaemia, shock, bleeding, or pulmonary oedema.']]],
      see: [['Returned traveller guide', '/returned-traveller/'], ['Malaria guide', '/malaria/']] },

    { id: 'ie', t: 'Infective endocarditis', pts: [
        'Suspect endocarditis with fever plus a new murmur, embolic events or a predisposing valve or device.',
        'Three sets of blood cultures before antibiotics, if the patient is stable.',
        'Echocardiography (TTE then TOE) and the modified Duke criteria make the diagnosis.',
        'S. aureus and viridans streptococci are the commonest causes.',
        'Treatment is long (4–6 weeks) and needs an endocarditis team including cardiac surgeons.'],
      qs: [['What are the peripheral signs of endocarditis?', 'Splinter haemorrhages, Janeway lesions, Osler’s nodes, Roth spots, clubbing (late), splenomegaly, and conjunctival petechiae.'],
        ['What are the major Duke criteria?', 'Typical organism in two blood cultures (or persistent bacteraemia), and evidence of endocardial involvement on imaging (vegetation, abscess, new regurgitation).'],
        ['Who is at highest risk?', 'Prosthetic valves, previous endocarditis, congenital heart disease, injecting drug use, and intracardiac devices.'],
        ['When is surgery needed?', 'Heart failure, uncontrolled infection (abscess, persistent bacteraemia), and large vegetations with embolic risk.'],
        ['Why is TOE better than TTE?', 'It sees vegetations, abscesses and prosthetic valves much better.'],
        ['Which organism in blood should always prompt an echo?', 'S. aureus.']],
      bed: ['Look at the hands, nails, conjunctivae and fundi for peripheral signs.', 'Listen for murmurs and compare with previous documentation.'],
      take: 'Fever plus a murmur is endocarditis until proven otherwise: three cultures, then echo.',
      cs: ['A 35-year-old who injects drugs has fever, breathlessness and a new murmur. Blood cultures grow S. aureus in all sets.', [['Which valve is likely involved?', 'The tricuspid valve (right-sided endocarditis), often with septic pulmonary emboli.'], ['What are the next steps?', 'Echo (TOE), repeat cultures, IV flucloxacillin (or vancomycin if MRSA), look for septic emboli, endocarditis team, harm reduction and support.']]],
      see: [['Endocarditis guide', '/endocarditis/'], ['Duke criteria', '/scores/']] },

    { id: 'meningitis', t: 'Meningitis', pts: [
        'Bacterial meningitis is an emergency: give antibiotics within an hour; do not delay for CT or lumbar puncture.',
        'The classic triad (fever, neck stiffness, altered consciousness) is often incomplete.',
        'Give dexamethasone with or before the first antibiotic dose.',
        'Meningococcal disease can present with a non-blanching rash and rapid shock.',
        'Close contacts of meningococcal disease need prophylaxis; it is notifiable.'],
      qs: [['Which CSF findings suggest bacterial meningitis?', 'Raised neutrophils, high protein, low glucose (CSF to blood ratio under 0.36), and organisms on Gram stain.'],
        ['When should CT come before lumbar puncture?', 'Focal neurology, papilloedema, seizures, reduced consciousness (GCS under 12), or severe immunocompromise.'],
        ['Why add amoxicillin in some patients?', 'To cover Listeria in people over 60, the immunocompromised and in pregnancy.'],
        ['What is the glass test?', 'A non-blanching rash stays visible when a glass is pressed on it: suggests meningococcal septicaemia.'],
        ['Who needs prophylaxis?', 'Household and close contacts of meningococcal disease in the previous 7 days (ciprofloxacin), via UKHSA.'],
        ['What are the main viral causes?', 'Enteroviruses, herpes simplex (HSV-2) and varicella zoster.']],
      bed: ['Demonstrate neck stiffness and Kernig’s sign (noting they are often absent).', 'Show the glass test on any rash.'],
      take: 'Suspect, treat within the hour with dexamethasone, then investigate.',
      cs: ['A 19-year-old student has 12 hours of headache, fever and vomiting, and a few non-blanching spots on her legs. Blood pressure 92/55.', [['What is the likely diagnosis?', 'Meningococcal septicaemia with or without meningitis.'], ['What do you do first?', 'IV ceftriaxone immediately (after blood cultures if no delay), fluids, senior and critical care review, and inform public health for contact prophylaxis.']]],
      see: [['Meningitis and encephalitis', '/meningitis-encephalitis/'], ['Contact prophylaxis', '/contact-prophylaxis/']] },

    { id: 'tb', t: 'Tuberculosis', pts: [
        'Think TB with cough over 3 weeks, fever, night sweats, weight loss or haemoptysis, especially in at-risk groups.',
        'Send three sputum samples for smear, culture and a rapid molecular test (which also detects rifampicin resistance).',
        'Treatment is RIPE: rifampicin, isoniazid, pyrazinamide and ethambutol for 2 months, then rifampicin and isoniazid for 4.',
        'Suspected infectious pulmonary TB needs a side room (negative pressure if possible) until assessed.',
        'TB is notifiable, and everyone with TB should have an HIV test.'],
      qs: [['Who is at higher risk of TB?', 'People from or who lived in high-incidence countries, HIV, immunosuppression (including biologics), homelessness, prison, drug or alcohol use, and close contacts.'],
        ['What are the main side effects of the four drugs?', 'Rifampicin: orange secretions, interactions, hepatitis. Isoniazid: neuropathy (give pyridoxine), hepatitis. Pyrazinamide: hepatitis, gout. Ethambutol: optic neuritis (check vision).'],
        ['Why is rifampicin important for interactions?', 'It is a strong enzyme inducer, reducing levels of many drugs including the contraceptive pill, warfarin and some antiretrovirals.'],
        ['What is latent TB?', 'Infection without active disease: a positive IGRA or skin test with a normal chest X-ray and no symptoms; treated to prevent reactivation in some groups.'],
        ['Why test for HIV?', 'HIV greatly increases TB risk and changes treatment; co-infection is common.'],
        ['How long is treatment for TB meningitis?', 'Twelve months, with steroids.']],
      bed: ['Look at a chest X-ray with upper lobe changes or cavitation.', 'Talk through the isolation and mask requirements on the door.'],
      take: 'Long cough plus weight loss: three sputums, isolate, test for HIV.',
      cs: ['A 28-year-old man who moved from Pakistan 2 years ago has a 6-week cough, night sweats and weight loss. The chest X-ray shows right upper lobe cavitation.', [['What do you do now?', 'Isolate in a side room, three sputum samples (smear, culture, molecular test), HIV test, and refer to the TB team.'], ['What happens after diagnosis?', 'RIPE treatment with monitoring (LFTs, visual acuity), notification, contact tracing, and directly observed therapy if adherence is a concern.']]],
      see: [['TB guide', '/tb/'], ['TB drug monographs', 'https://www.tbdrugmonographs.co.uk/']] }
  ];

  var TIMES = [[5, '5 minutes'], [10, '10 minutes'], [20, '20 minutes']];
  // How much of each topic to use, and the session plan, for each length
  var PLAN = {
    5: { pts: 3, qs: 2, bed: 0, cs: false, steps: [['Ask', 2, 'Two questions to the group'], ['Teach', 2, 'Three key points'], ['Wrap up', 1, 'Take-home message']] },
    10: { pts: 4, qs: 4, bed: 1, cs: false, steps: [['Ask', 4, 'Four questions to the group'], ['Teach', 3, 'Four key points'], ['Bedside', 2, 'Show one thing'], ['Wrap up', 1, 'Take-home message']] },
    20: { pts: 5, qs: 6, bed: 2, cs: true, steps: [['Case', 5, 'Work through a short case'], ['Ask', 6, 'Six questions to the group'], ['Teach', 4, 'Five key points'], ['Bedside', 4, 'Show two things'], ['Wrap up', 1, 'Take-home message']] }
  };
  var st = { topic: null, time: 10, big: false, end: 0, left: 0, run: false };
  var tick = 0;

  function opts(list, key, cls) {
    return '<div class="opts ' + (cls || '') + '">' + list.map(function (x) { var on = String(st[key]) === String(x[0]); return '<button type="button" class="opt' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-k="' + key + '" data-v="' + esc(x[0]) + '"><span class="opt-text">' + esc(x[1]) + '</span></button>'; }).join('') + '</div>';
  }
  function plan(p) {
    var tot = p.steps.reduce(function (a, s) { return a + s[1]; }, 0);
    return '<div class="tw-plan" role="list">' + p.steps.map(function (s, i) {
      return '<div class="tw-seg s' + i + '" role="listitem" style="flex:' + s[1] + '"><b>' + esc(s[0]) + '</b><span>' + s[1] + ' min</span><em>' + esc(s[2]) + '</em></div>';
    }).join('') + '</div><p class="tw-tot">' + tot + ' minutes in total</p>';
  }
  function session() {
    var tp = T.filter(function (x) { return x.id === st.topic; })[0];
    if (!tp) return '<p class="ab-note tw-empty">Choose a topic and how long you have.</p>';
    var p = PLAN[st.time], h = '';
    h += '<div class="tw-head"><div><p class="ir-eyebrow">' + st.time + '-minute session</p><h2 class="tw-title">' + esc(tp.t) + '</h2></div>' +
      '<div class="tw-timer"><span class="tw-clock" id="tw-clock">' + clock(st.run ? st.left : st.time * 60) + '</span><button type="button" class="reset tw-go" data-act="timer">' + (st.run ? 'Stop' : 'Start timer') + '</button></div></div>';
    h += '<div class="tw-bar"><i id="tw-bar" style="width:' + (st.run ? (100 - st.left / (st.time * 60) * 100) : 0) + '%"></i></div>';
    h += plan(p);
    if (p.cs && tp.cs) {
      h += '<section class="tw-block"><h3><span class="tw-n s0">Case</span>Work through together</h3><p class="tw-stem">' + esc(tp.cs[0]) + '</p>' + qa(tp.cs[1], 'c') + '</section>';
    }
    h += '<section class="tw-block"><h3><span class="tw-n s' + (p.cs ? 1 : 0) + '">Ask</span>Questions for the group</h3>' + qa(tp.qs.slice(0, p.qs), 'q') + '</section>';
    h += '<section class="tw-block"><h3><span class="tw-n s' + (p.cs ? 2 : 1) + '">Teach</span>Key points</h3><ol class="tw-pts">' + tp.pts.slice(0, p.pts).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol></section>';
    if (p.bed) h += '<section class="tw-block"><h3><span class="tw-n s' + (p.cs ? 3 : 2) + '">Bedside</span>Show them</h3><ul class="tw-bed">' + tp.bed.slice(0, p.bed).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></section>';
    h += '<div class="tw-take"><span>Take-home message</span><p>' + esc(tp.take) + '</p></div>';
    if (tp.see) h += '<p class="cov-chips tw-see">More on this site: ' + tp.see.map(function (l) { var ext = /^https?:/.test(l[1]); return '<a class="sp-chip" href="' + esc(ext ? l[1] : url(l[1])) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + esc(l[0]) + '</a>'; }).join('') + '</p>';
    return h;
  }
  function qa(list, pre) {
    return '<ol class="tw-qs">' + list.map(function (q, i) {
      return '<li><p class="tw-q">' + esc(q[0]) + '</p><button type="button" class="tw-reveal" data-act="reveal" aria-expanded="false" aria-controls="tw-' + pre + i + '">Show answer</button><p class="tw-a" id="tw-' + pre + i + '" hidden>' + esc(q[1]) + '</p></li>';
    }).join('') + '</ol><button type="button" class="tw-all" data-act="all">Show all answers</button>';
  }
  function clock(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function draw() {
    host.innerHTML = '<section class="card af-card tw-pick"><div class="ab-sec"><h4>Topic</h4>' + opts(T.map(function (x) { return [x.id, x.t]; }), 'topic', 'wide tw-topics') + '</div>' +
      '<div class="tw-row"><div class="ab-sec"><h4>Time you have</h4>' + opts(TIMES, 'time', 'tw-times') + '</div>' +
      '<div class="ab-sec"><h4>Display</h4><button type="button" class="sp-chip' + (st.big ? ' on' : '') + '" aria-pressed="' + st.big + '" data-act="big">Large text</button> <button type="button" class="sp-chip" data-act="random">Random topic</button></div></div></section>' +
      '<section class="card af-card tw-session' + (st.big ? ' big' : '') + '" id="tw-s" aria-live="polite">' + session() + '</section>';
  }
  function stopTimer() { st.run = false; clearInterval(tick); }
  function startTimer() {
    st.run = true; st.end = Date.now() + st.time * 60000; st.left = st.time * 60;
    clearInterval(tick);
    tick = setInterval(function () {
      st.left = (st.end - Date.now()) / 1000;
      var c = host.querySelector('#tw-clock'), b = host.querySelector('#tw-bar');
      if (c) c.textContent = clock(st.left);
      if (b) b.style.width = Math.min(100, 100 - st.left / (st.time * 60) * 100) + '%';
      if (st.left <= 0) { stopTimer(); if (c) { c.textContent = 'Time'; c.classList.add('done'); } var g = host.querySelector('.tw-go'); if (g) g.textContent = 'Start timer'; }
    }, 500);
  }
  host.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var k = b.getAttribute('data-k'), act = b.getAttribute('data-act');
    if (k) {
      st[k] = k === 'time' ? +b.getAttribute('data-v') : b.getAttribute('data-v'); stopTimer(); draw();
      try { history.replaceState(null, '', '#tw-' + st.topic + '-' + st.time); } catch (err) {}
      if (k === 'topic' && window.innerWidth < 760) host.querySelector('#tw-s').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (act === 'reveal') { var a = host.querySelector('#' + b.getAttribute('aria-controls')); var open = a.hidden; a.hidden = !open; b.setAttribute('aria-expanded', String(open)); b.textContent = open ? 'Hide answer' : 'Show answer'; }
    else if (act === 'all') { var list = b.previousElementSibling, anyHidden = !!list.querySelector('.tw-a[hidden]'); list.querySelectorAll('.tw-a').forEach(function (x) { x.hidden = !anyHidden; }); list.querySelectorAll('.tw-reveal').forEach(function (x) { x.setAttribute('aria-expanded', String(anyHidden)); x.textContent = anyHidden ? 'Hide answer' : 'Show answer'; }); b.textContent = anyHidden ? 'Hide all answers' : 'Show all answers'; }
    else if (act === 'timer') { if (st.run) { stopTimer(); host.querySelector('#tw-s').innerHTML = session(); } else { startTimer(); b.textContent = 'Stop'; } }
    else if (act === 'big') { st.big = !st.big; b.classList.toggle('on', st.big); b.setAttribute('aria-pressed', st.big); host.querySelector('#tw-s').classList.toggle('big', st.big); }
    else if (act === 'random') { var others = T.filter(function (x) { return x.id !== st.topic; }); st.topic = others[Math.floor(Math.random() * others.length)].id; stopTimer(); draw(); }
  });
  var m = /^#tw-([a-z]+)-(5|10|20)$/.exec(location.hash);
  if (m && T.some(function (x) { return x.id === m[1]; })) { st.topic = m[1]; st.time = +m[2]; }
  draw();
})();
