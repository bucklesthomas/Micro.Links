/* Antibiotic mechanisms of action: an interactive diagram of a Gram-negative bacterial cell with each target
   numbered. Tapping a target (or its button) highlights it and shows how the drugs act, whether they kill or
   inhibit, the main resistance mechanisms, and the antibiotics on this site in that group. */
(function () {
  var host = document.getElementById('mech');
  if (!host) return;
  var A = window.ABX_DATA;
  var abxHref = host.getAttribute('data-abx') || '';
  var hashMode = !!document.getElementById('view-links');
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function dl(id) { return hashMode ? '#drug-' + id : abxHref + '#drug-' + id; }

  var M = [
    { n: 1, k: 'Cell wall cross-linking (PBPs)', short: 'β-lactams', area: 'wall',
      drugs: ['benzylpenicillin', 'phenoxymethylpenicillin', 'amoxicillin', 'flucloxacillin', 'co-amoxiclav', 'piperacillin-tazobactam', 'temocillin', 'pivmecillinam', 'cefalexin', 'cefazolin', 'cefuroxime', 'ceftriaxone', 'cefotaxime', 'ceftazidime', 'cefepime', 'ceftaroline', 'ceftazidime-avibactam', 'ceftolozane-tazobactam', 'cefiderocol', 'meropenem', 'ertapenem', 'aztreonam'],
      how: 'β-lactams mimic the D-Ala-D-Ala end of peptidoglycan and bind penicillin-binding proteins (PBPs), the transpeptidases that cross-link the cell wall. The weakened wall ruptures as the cell grows. Gram-negatives are entered through porins; cefiderocol uses the iron-uptake system as a "Trojan horse". β-lactamase inhibitors (clavulanate, tazobactam, avibactam) protect the partner drug.',
      kill: 'Bactericidal, time-dependent (fT>MIC).',
      res: ['β-lactamases: penicillinases, ESBL, AmpC and carbapenemases (KPC, OXA-48, NDM)', 'Altered PBPs: PBP2a (mecA) in MRSA; altered PBP2x in penicillin-resistant pneumococci', 'Porin loss and efflux pumps in Gram-negatives'] },
    { n: 2, k: 'Peptidoglycan precursors (D-Ala-D-Ala)', short: 'Glycopeptides', area: 'wall',
      drugs: ['vancomycin-iv', 'vancomycin-oral', 'teicoplanin'],
      how: 'Glycopeptides bind the D-Ala-D-Ala terminus of the peptidoglycan building blocks, blocking both their joining into chains and cross-linking. They are too large to cross the Gram-negative outer membrane, so they only work on Gram-positives.',
      kill: 'Slowly bactericidal, AUC/MIC.',
      res: ['vanA or vanB: the precursor ends in D-Ala-D-Lac instead (VRE)', 'A thickened cell wall that traps the drug (VISA, hVISA)', 'Intrinsic in Gram-negatives (outer membrane barrier)'] },
    { n: 3, k: 'Early cell wall synthesis (MurA)', short: 'Fosfomycin', area: 'cyto',
      drugs: ['fosfomycin'],
      how: 'Fosfomycin enters through sugar-phosphate transporters (GlpT, UhpT) and irreversibly blocks MurA, the first committed step of peptidoglycan synthesis inside the cell.',
      kill: 'Bactericidal.',
      res: ['Mutations in the uptake transporters (arise rapidly; avoid monotherapy for systemic infection)', 'fosA enzymes that inactivate the drug'] },
    { n: 4, k: 'Cell membrane (Gram-positive)', short: 'Daptomycin', area: 'im',
      drugs: ['daptomycin'],
      how: 'Daptomycin inserts into the Gram-positive cytoplasmic membrane in a calcium-dependent way, causing depolarisation, potassium loss and cell death without lysis. Lung surfactant inactivates it, so it does not work for pneumonia.',
      kill: 'Rapidly bactericidal, concentration-dependent.',
      res: ['Membrane charge changes (mprF) and cell wall thickening, sometimes after vancomycin exposure', 'Intrinsic in Gram-negatives'] },
    { n: 5, k: 'Outer membrane (lipid A)', short: 'Polymyxins', area: 'om',
      drugs: ['colistin'],
      how: 'Polymyxins bind the lipid A of lipopolysaccharide, displacing calcium and magnesium and disrupting the outer and then inner membranes of Gram-negatives.',
      kill: 'Bactericidal, concentration-dependent.',
      res: ['Lipid A modification: chromosomal (mgrB, pmrAB) or plasmid mcr genes', 'Intrinsic in Proteus, Morganella, Providencia, Serratia and Burkholderia'] },
    { n: 6, k: '30S ribosomal subunit', short: 'Aminoglycosides, tetracyclines', area: 'ribo',
      drugs: ['gentamicin', 'amikacin', 'tobramycin', 'doxycycline', 'tigecycline'],
      how: 'Aminoglycosides bind the 16S rRNA of the 30S subunit and cause misreading of mRNA; the faulty proteins damage the membrane. Uptake needs oxygen-dependent transport, so they do not work on anaerobes. Tetracyclines and tigecycline block aminoacyl-tRNA from entering the A site.',
      kill: 'Aminoglycosides bactericidal (Cmax/MIC); tetracyclines bacteriostatic.',
      res: ['Aminoglycoside-modifying enzymes; 16S rRNA methylases (pan-aminoglycoside resistance)', 'Tetracycline efflux (tet) and ribosomal protection proteins (tetM); tigecycline evades most of these', 'Intrinsic: anaerobes (aminoglycosides); Proteus and Pseudomonas (tigecycline)'] },
    { n: 7, k: '50S ribosomal subunit', short: 'Macrolides, clindamycin, linezolid, chloramphenicol', area: 'ribo',
      drugs: ['clarithromycin', 'azithromycin', 'erythromycin', 'clindamycin', 'linezolid', 'chloramphenicol'],
      how: 'Macrolides and clindamycin block the exit tunnel of the 50S subunit (23S rRNA) so the growing protein chain cannot leave. Chloramphenicol blocks the peptidyl transferase centre. Linezolid stops the 70S initiation complex forming. Clindamycin and linezolid also switch off toxin production.',
      kill: 'Mostly bacteriostatic.',
      res: ['erm methylation of 23S rRNA: resistance to macrolides, lincosamides and streptogramin B (MLSB); inducible clindamycin resistance shows on the D-test', 'mef efflux (macrolides only)', 'Linezolid: 23S mutations (G2576T), cfr and optrA'] },
    { n: 8, k: 'Elongation factor G', short: 'Fusidic acid', area: 'ribo',
      drugs: ['fusidic-acid'],
      how: 'Fusidic acid locks elongation factor G on the ribosome after translocation, stalling protein synthesis.',
      kill: 'Bacteriostatic.',
      res: ['fusA mutations and fusB/fusC protection proteins; resistance emerges quickly, so combine for systemic use'] },
    { n: 9, k: 'DNA gyrase and topoisomerase IV', short: 'Quinolones', area: 'dna',
      drugs: ['ciprofloxacin', 'levofloxacin', 'moxifloxacin'],
      how: 'Quinolones trap DNA gyrase (mainly in Gram-negatives) and topoisomerase IV (mainly in Gram-positives) on DNA after they cut it, leaving double-strand breaks.',
      kill: 'Bactericidal, AUC/MIC.',
      res: ['Mutations in gyrA and parC (step-wise, higher MICs with each)', 'Efflux pumps and porin loss', 'Plasmid qnr protection and aac(6′)-Ib-cr modification'] },
    { n: 10, k: 'RNA polymerase', short: 'Rifampicin, fidaxomicin', area: 'dna',
      drugs: ['rifampicin', 'fidaxomicin'],
      how: 'Rifampicin binds the β subunit of DNA-dependent RNA polymerase and blocks transcription. Fidaxomicin binds a different site on RNA polymerase and is very narrow spectrum (C. difficile), sparing the gut flora.',
      kill: 'Rifampicin bactericidal; fidaxomicin bactericidal against C. difficile.',
      res: ['Single rpoB mutations give high-level rifampicin resistance quickly: always combine (except short prophylaxis)'] },
    { n: 11, k: 'Folate synthesis', short: 'Trimethoprim, sulfonamides', area: 'cyto',
      drugs: ['trimethoprim', 'co-trimoxazole'],
      how: 'Bacteria make their own folate. Sulfamethoxazole blocks dihydropteroate synthase (DHPS) and trimethoprim blocks dihydrofolate reductase (DHFR), two steps in the same pathway, so together (co-trimoxazole) they are synergistic.',
      kill: 'Each bacteriostatic; the combination is often bactericidal.',
      res: ['Acquired sul (DHPS) and dfr (DHFR) genes, often on plasmids', 'Intrinsic: Pseudomonas aeruginosa; enterococci can use folate from their surroundings'] },
    { n: 12, k: 'DNA damage after reduction', short: 'Metronidazole, nitrofurantoin', area: 'dna',
      drugs: ['metronidazole', 'nitrofurantoin'],
      how: 'Both are prodrugs. Metronidazole is reduced only in anaerobic organisms to toxic radicals that break DNA. Nitrofurantoin is reduced by bacterial nitroreductases to reactive intermediates that hit DNA, ribosomes and other targets, which is why resistance stays uncommon.',
      kill: 'Bactericidal.',
      res: ['Reduced nitroreductase activity (nfsA, nfsB) for nitrofurantoin', 'nim genes and reduced uptake in anaerobes (rare)', 'Intrinsic: aerobes (metronidazole); Proteus and Pseudomonas (nitrofurantoin)'] }
  ];
  var st = { sel: null };

  function marker(n, x, y) {
    return '<g class="mk" data-m="' + n + '" tabindex="0" role="button" aria-label="Target ' + n + ': ' + esc(M[n - 1].k) + '"><circle cx="' + x + '" cy="' + y + '" r="15"/><text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle">' + n + '</text></g>';
  }

  function svg() {
    var h = '<svg viewBox="34 8 792 492" class="mech-svg" role="img" aria-label="Diagram of a Gram-negative bacterial cell with numbered antibiotic targets">';
    h += '<defs><pattern id="pgHatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" class="pg-line"/></pattern>' +
      '<clipPath id="cellClip"><rect x="70" y="60" width="720" height="380" rx="190"/></clipPath></defs>';
    // Envelope: outer membrane, peptidoglycan, inner membrane, cytoplasm
    h += '<g class="ar ar-om"><rect class="om" x="70" y="60" width="720" height="380" rx="190"/></g>';
    h += '<g class="ar ar-wall"><rect class="pg" x="84" y="74" width="692" height="352" rx="176"/><rect class="pg-hatch" x="84" y="74" width="692" height="352" rx="176"/></g>';
    h += '<g class="ar ar-im"><rect class="im" x="98" y="88" width="664" height="324" rx="162"/></g>';
    h += '<rect class="cyto-base" x="104" y="94" width="652" height="312" rx="156"/><rect class="cyto" x="104" y="94" width="652" height="312" rx="156"/>';
    // Porin in the outer membrane (top-left)
    h += '<g class="porin"><rect x="300" y="58" width="22" height="20" rx="4"/><rect x="306" y="56" width="10" height="24" class="porin-hole"/></g>';
    // Chromosome (wavy closed loop)
    var pts = [];
    for (var i = 0; i <= 120; i++) { var a = i / 120 * Math.PI * 2, r = 1 + 0.06 * Math.sin(a * 9); pts.push((430 + 150 * r * Math.cos(a)).toFixed(1) + ',' + (250 + 78 * r * Math.sin(a)).toFixed(1)); }
    h += '<g class="ar ar-dna"><polyline class="dna" points="' + pts.join(' ') + '"/></g>';
    h += '<text class="lbl" x="430" y="254" text-anchor="middle">Chromosome (DNA)</text>';
    // Gyrase on DNA (left), RNA polymerase on DNA (bottom)
    h += '<g class="enz"><ellipse cx="292" cy="226" rx="20" ry="14"/><text class="lbl sm" x="292" y="204" text-anchor="middle">Gyrase</text></g>';
    h += '<g class="enz"><ellipse cx="470" cy="326" rx="22" ry="14"/><text class="lbl sm" x="470" y="352" text-anchor="middle">RNA polymerase</text></g>';
    // mRNA from RNA polymerase to ribosome
    h += '<path class="mrna" d="M492 324 C 540 318, 560 300, 596 300 L 700 300"/><text class="lbl sm" x="676" y="318">mRNA</text>';
    // Ribosome: 50S above, 30S below, protein chain emerging
    h += '<g class="ar ar-ribo"><ellipse class="r50" cx="640" cy="272" rx="40" ry="26"/><ellipse class="r30" cx="640" cy="308" rx="34" ry="16"/></g>';
    h += '<text class="lbl sm" x="640" y="276" text-anchor="middle">50S</text><text class="lbl sm" x="640" y="312" text-anchor="middle">30S</text>';
    h += '<path class="chain" d="M660 248 q 8 -14 0 -24 q -8 -10 4 -22"/><text class="lbl sm" x="676" y="206">Protein</text>';
    h += '<g class="enz"><rect x="686" y="261" width="44" height="20" rx="5"/><text class="lbl sm" x="708" y="275.5" text-anchor="middle">EF-G</text></g>';
    // Folate pathway (bottom-left)
    h += '<g class="fol"><text class="lbl sm" x="186" y="300">PABA</text><path class="arr" d="M190 306 L 190 326"/><rect x="160" y="327" width="60" height="18" rx="4"/><text class="lbl sm" x="190" y="340" text-anchor="middle">DHPS</text>' +
      '<path class="arr" d="M190 346 L 190 360"/><text class="lbl sm" x="190" y="372" text-anchor="middle">DHF</text><path class="arr" d="M206 368 L 232 368"/><rect x="232" y="359" width="56" height="18" rx="4"/><text class="lbl sm" x="259" y="372" text-anchor="middle">DHFR</text>' +
      '<path class="arr" d="M286 368 L 304 368"/><text class="lbl sm" x="320" y="372" text-anchor="middle">THF</text></g>';
    // MurA (top-left cytoplasm) feeding the wall
    h += '<g class="enz"><rect x="164" y="149" width="58" height="20" rx="5"/><text class="lbl sm" x="193" y="163" text-anchor="middle">MurA</text></g><path class="arr" d="M193 148 L 193 100"/>';
    // Nitroreductase producing radicals that hit DNA
    h += '<g class="enz"><rect x="340" y="361" width="108" height="20" rx="5"/><text class="lbl sm" x="394" y="375.5" text-anchor="middle">Nitroreductase</text></g><path class="zap" d="M394 360 l -6 -10 l 8 -2 l -6 -10"/>';
    // Wall building blocks (top) and PBP on inner membrane
    h += '<g class="enz"><rect x="348" y="82" width="44" height="19" rx="4"/><text class="lbl sm" x="370" y="96" text-anchor="middle">PBP</text></g>';
    h += '<text class="lbl sm" x="470" y="116" text-anchor="middle">D-Ala-D-Ala</text>';
    // Layer labels outside the cell
    h += '<path class="lead" d="M132 100 L 92 36"/><text class="lbl lyr" x="40" y="28">Outer membrane (Gram-negative only)</text>';
    h += '<path class="lead" d="M744 124 L 790 36"/><text class="lbl lyr" x="820" y="28" text-anchor="end">Peptidoglycan cell wall</text>';
    h += '<path class="lead" d="M716 398 L 774 474"/><text class="lbl lyr" x="820" y="492" text-anchor="end">Inner (cytoplasmic) membrane</text>';
    h += '<path class="lead" d="M311 56 L 311 34"/><text class="lbl lyr" x="318" y="30">Porin</text>';
    // Numbered markers
    h += marker(1, 370, 128) + marker(2, 470, 76) + marker(3, 193, 186) + marker(4, 300, 412) + marker(5, 610, 62) + marker(6, 594, 330) +
      marker(7, 594, 254) + marker(8, 752, 252) + marker(9, 262, 226) + marker(10, 470, 296) + marker(11, 140, 352) + marker(12, 452, 392);
    return h + '</svg>';
  }

  function list() {
    return '<div class="opts wide mech-opts">' + M.map(function (m) {
      return '<button type="button" class="opt' + (st.sel === m.n ? ' on' : '') + '" aria-pressed="' + (st.sel === m.n) + '" data-m="' + m.n + '"><span class="opt-text"><span class="mech-n">' + m.n + '</span>' + esc(m.short) + '</span><span class="opt-pts">' + esc(m.k) + '</span></button>';
    }).join('') + '</div>';
  }

  function panel() {
    if (!st.sel) return '<p class="ab-note">Tap a numbered target on the cell, or a drug group below, to see how it works.</p>';
    var m = M[st.sel - 1];
    var byId = {};
    if (A) A.drugs.forEach(function (d) { byId[d.id] = d; });
    var drugs = m.drugs.filter(function (id) { return byId[id]; }).map(function (id) { return '<a class="sp-chip" href="' + esc(dl(id)) + '">' + esc(byId[id].name) + '</a>'; }).join('');
    return '<div class="mech-head"><span class="mech-n big">' + m.n + '</span><div><p class="mech-kicker">' + esc(m.short) + '</p><h3>' + esc(m.k) + '</h3></div></div>' +
      '<p class="mech-how">' + esc(m.how) + '</p>' +
      '<table class="ab-tbl mech-tbl"><tr><th>Effect</th><td>' + esc(m.kill) + '</td></tr><tr><th>Resistance</th><td><ul>' + m.res.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul></td></tr></table>' +
      (drugs ? '<h4 class="vc-h">On this site</h4><div class="ab-aw mech-drugs">' + drugs + '</div>' : '');
  }

  // Keep the panel the height of its tallest entry so nothing below it moves when the selection changes
  function sizePanel() {
    var p = host.querySelector('#mech-panel'), keep = st.sel, h = 0;
    if (!p.offsetParent) return;
    p.style.minHeight = '';
    for (var i = 0; i <= M.length; i++) { st.sel = i || null; p.innerHTML = panel(); h = Math.max(h, p.offsetHeight); }
    st.sel = keep; p.innerHTML = panel(); p.style.minHeight = h + 'px';
  }
  function draw() {
    Array.prototype.forEach.call(host.querySelectorAll('#mech-list [data-m]'), function (b) { var on = +b.getAttribute('data-m') === st.sel; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
    host.querySelector('#mech-panel').innerHTML = panel();
    var s = host.querySelector('.mech-svg');
    s.classList.toggle('has-sel', !!st.sel);
    Array.prototype.forEach.call(s.querySelectorAll('.mk'), function (g) { g.classList.toggle('on', +g.getAttribute('data-m') === st.sel); });
    Array.prototype.forEach.call(s.querySelectorAll('.ar'), function (g) { g.classList.toggle('on', !!st.sel && g.classList.contains('ar-' + M[st.sel - 1].area)); });
  }
  function pick(n, scroll) {
    st.sel = st.sel === n ? null : n;
    draw();
    if (scroll && st.sel) { var p = host.querySelector('#mech-panel'); if (p.getBoundingClientRect().top > window.innerHeight - 120) p.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  }

  host.innerHTML = '<div class="mech-grid"><div class="mech-fig">' + svg() + '<p class="ab-note mech-gp">Drawn as a Gram-negative cell. Gram-positives have a much thicker peptidoglycan wall and no outer membrane: this is why vancomycin and daptomycin only work on Gram-positives, and polymyxins and aztreonam only on Gram-negatives.</p></div>' +
    '<div class="mech-side"><div id="mech-panel" class="mech-panel" aria-live="polite"></div></div></div><h2 class="section-title">All targets</h2><div id="mech-list"></div>';
  host.addEventListener('click', function (e) { var t = e.target.closest('[data-m]'); if (t) pick(+t.getAttribute('data-m'), t.tagName.toLowerCase() === 'button'); });
  host.addEventListener('keydown', function (e) { var t = e.target.closest('.mk'); if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(+t.getAttribute('data-m')); } });
  host.querySelector('#mech-list').innerHTML = list();
  draw(); sizePanel();
  // In the hosted copy the page starts hidden (height 0), so size again once it is shown
  if (window.IntersectionObserver) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) sizePanel(); }); }).observe(host.querySelector('#mech-panel'));
  var rw = 0, rt; window.addEventListener('resize', function () { if (window.innerWidth === rw) return; rw = window.innerWidth; clearTimeout(rt); rt = setTimeout(sizePanel, 150); });
  rw = window.innerWidth;
  window.MECH = M;
})();
