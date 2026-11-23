/* β-lactamases teaching page: how β-lactamases cause resistance (envelope and ring diagrams), the Ambler classes
   (interactive tree), which enzyme destroys which β-lactam, which inhibitor blocks which enzyme, and phenotype clues. */
(function () {
  var host = document.getElementById('bl');
  if (!host) return;
  var A = window.ABX_DATA;
  var abxHref = host.getAttribute('data-abx') || '';
  var hashMode = !!document.getElementById('view-links');
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var have = {};
  if (A) A.drugs.forEach(function (d) { have[d.id] = 1; });
  function drug(name, id) { return id && have[id] ? '<a href="' + esc(hashMode ? '#drug-' + id : abxHref + '#drug-' + id) + '">' + esc(name) + '</a>' : esc(name); }

  // ── Diagram 1: the cell envelope ─────────────────────────
  function ring(x, y, broken) {
    // A small β-lactam ring: a square with a carbonyl; broken = the amide side missing
    var s = 14;
    return '<g class="bl-ring' + (broken ? ' broken' : '') + '" transform="translate(' + x + ',' + y + ')">' +
      (broken ? '<path d="M0 0 L' + s + ' 0 L' + s + ' ' + s + ' L0 ' + s + '"/><path class="cut" d="M-3 3 L3 -3 M-3 11 L3 17"/>' : '<rect width="' + s + '" height="' + s + '"/>') +
      '<path d="M0 0 L-6 -6"/></g>';
  }
  function envelope() {
    var h = '<svg viewBox="0 0 560 330" class="bl-svg" role="img" aria-label="Cell envelope of a Gram-negative bacterium showing a β-lactamase in the periplasm breaking a β-lactam before it reaches the penicillin-binding protein">';
    h += '<defs><pattern id="blHatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" class="pg-line"/></pattern></defs>';
    // Layers
    h += '<text class="lbl lyr" x="8" y="22">Outside the cell</text>';
    function bilayer(y) { var b = '<rect class="mem" x="0" y="' + y + '" width="560" height="18"/>'; for (var x = 4; x < 560; x += 9) b += '<circle class="head" cx="' + x + '" cy="' + (y + 2.5) + '" r="2.6"/><circle class="head" cx="' + x + '" cy="' + (y + 15.5) + '" r="2.6"/>'; return b; }
    h += bilayer(60);
    h += '<rect class="porin" x="120" y="54" width="38" height="30" rx="7"/><rect class="porin-hole" x="131" y="54" width="16" height="30" rx="3"/>';
    h += '<rect class="porin" x="400" y="54" width="38" height="30" rx="7"/><rect class="porin-hole" x="411" y="54" width="16" height="30" rx="3"/>';
    h += '<rect class="peri" x="0" y="78" width="560" height="134"/>';
    h += '<rect class="pg" x="0" y="176" width="560" height="16"/><rect class="pg-hatch" x="0" y="176" width="560" height="16"/>';
    h += bilayer(212);
    h += '<rect class="cyto" x="0" y="228" width="560" height="102"/>';
    h += '<text class="lbl side" x="552" y="52" text-anchor="end">Outer membrane</text>';
    h += '<text class="lbl side" x="552" y="100" text-anchor="end">Periplasm</text>';
    h += '<text class="lbl side" x="552" y="170" text-anchor="end">Peptidoglycan</text>';
    h += '<text class="lbl side" x="552" y="248" text-anchor="end">Inner membrane</text>';
    // β-lactams outside
    h += ring(60, 34) + ring(132, 24) + ring(226, 30) + ring(412, 24);
    // Path 1: in through porin, caught by β-lactamase, broken
    h += '<path class="flow" d="M139 40 L 139 104"/>';
    h += '<g class="enzyme"><path d="M178 112 a 26 22 0 1 0 0 32 l -18 -16 z"/><text class="lbl sm acc2" x="160" y="166" text-anchor="middle">β-lactamase</text></g>';
    h += ring(132, 114);
    h += '<path class="flow" d="M200 128 L 240 128"/>' + ring(252, 121, true) + '<text class="lbl sm" x="280" y="132">Ring broken: inactive</text>';
    // Path 2: through the other porin to the PBP
    h += '<path class="flow ok" d="M419 40 L 419 194"/>';
    h += '<g class="pbp"><rect x="384" y="196" width="70" height="22" rx="6"/><text class="lbl sm" x="419" y="211" text-anchor="middle">PBP</text></g>';
    // Plasmid and gene in the cytoplasm
    h += '<circle class="plasmid" cx="160" cy="282" r="28"/><text class="lbl sm" x="160" y="286" text-anchor="middle">bla gene</text>';
    h += '<path class="flow thin" d="M160 252 L 160 172"/><text class="lbl sm" x="200" y="296">Plasmid or chromosome</text>';
    // Numbered notes
    function n(k, x, y) { return '<g class="bl-n"><circle cx="' + x + '" cy="' + y + '" r="11"/><text x="' + x + '" y="' + (y + 4) + '" text-anchor="middle">' + k + '</text></g>'; }
    h += n(1, 104, 96) + n(2, 214, 104) + n(3, 470, 207) + n(4, 202, 266);
    return h + '</svg>';
  }
  function envNotes() {
    return '<ol class="bl-steps">' +
      '<li>β-lactams cross the Gram-negative outer membrane through <b>porins</b>.</li>' +
      '<li>A <b>β-lactamase</b> in the periplasm breaks the β-lactam ring before the drug reaches its target. Gram-positives (such as the <i>S. aureus</i> penicillinase) release it outside the cell instead.</li>' +
      '<li>Only drug that escapes reaches the <b>penicillin-binding proteins</b> (PBPs) that build the cell wall. MRSA is different: it has a new PBP (PBP2a), not a β-lactamase.</li>' +
      '<li>The <b>bla gene</b> may be on the chromosome (often inducible, as with AmpC) or on a plasmid that spreads between bacteria (ESBL, CPE). Porin loss on top of an ESBL or AmpC can cause carbapenem resistance without a carbapenemase.</li></ol>';
  }

  // ── Diagram 2: the chemistry ──────────────────────────────
  function chem() {
    var h = '<svg viewBox="0 0 560 210" class="bl-svg" role="img" aria-label="A β-lactamase hydrolyses the amide bond of the four-membered β-lactam ring, opening it">';
    // Intact ring
    h += '<g class="mol"><path d="M80 70 L 140 70 L 140 130 L 80 130"/><path class="amide" d="M80 70 L 80 130"/>' +
      '<path d="M80 70 L 52 42 M86 64 L 58 36"/><text class="atom" x="44" y="34">O</text>' +
      '<text class="atom" x="62" y="146">N</text><path d="M140 70 L 166 54"/><text class="lbl sm" x="170" y="54">R</text><path d="M140 130 L 166 146"/><text class="lbl sm" x="170" y="152">R′</text></g>';
    h += '<text class="lbl sm" x="112" y="104" text-anchor="middle">β-lactam</text><text class="lbl sm" x="112" y="118" text-anchor="middle">ring</text><text class="lbl sm acc" x="56" y="104" text-anchor="end">amide</text><text class="lbl sm acc" x="56" y="118" text-anchor="end">bond</text>';
    h += '<path class="attack" d="M30 178 C -20 150, -10 90, 74 78"/><text class="lbl sm acc" x="8" y="196">Ser–OH or Zn²⁺–OH⁻</text>';
    // Arrow
    h += '<path class="flow" d="M214 100 L 316 100"/><text class="lbl sm" x="265" y="88" text-anchor="middle">+ H₂O</text><text class="lbl sm" x="265" y="122" text-anchor="middle">hydrolysis</text>';
    // Opened ring
    h += '<g class="mol"><path d="M410 70 L 470 70 L 470 130 L 410 130"/><path d="M410 70 L 382 42 M416 64 L 388 36"/><text class="atom" x="374" y="34">O</text>' +
      '<path d="M410 70 L 380 86"/><text class="atom" x="340" y="94">HO</text><text class="atom" x="384" y="146">NH</text>' +
      '<path d="M470 70 L 496 54"/><text class="lbl sm" x="500" y="54">R</text><path d="M470 130 L 496 146"/><text class="lbl sm" x="500" y="152">R′</text></g>';
    h += '<text class="lbl sm" x="440" y="180" text-anchor="middle">Ring opened: can no longer bind PBPs</text>';
    return h + '</svg>';
  }

  // ── Ambler classes ────────────────────────────────────────
  var CL = {
    A: { t: 'Class A', site: 'Serine', ex: 'TEM-1, SHV-1, CTX-M, KPC',
      rows: [['Key enzymes', 'Penicillinases (TEM-1, SHV-1; blaZ in S. aureus); ESBLs (CTX-M, mainly CTX-M-15 in the UK; TEM and SHV variants); carbapenemases (KPC)'],
        ['Where', 'Mostly on plasmids. SHV-1 is on the K. pneumoniae chromosome, which is why Klebsiella is always amoxicillin resistant'],
        ['Destroys', 'Penicillinases: penicillins. ESBLs: also third-generation cephalosporins and aztreonam. KPC: all β-lactams including carbapenems'],
        ['Spares', 'ESBLs spare cephamycins (cefoxitin), temocillin and carbapenems'],
        ['Inhibited by', 'Clavulanate and tazobactam (not KPC); avibactam, vaborbactam and relebactam (including KPC)']] },
    B: { t: 'Class B', site: 'Zinc (metallo-enzymes)', ex: 'NDM, VIM, IMP',
      rows: [['Key enzymes', 'NDM, VIM, IMP (acquired); L1 in Stenotrophomonas maltophilia, CphA in Aeromonas and CfiA in some Bacteroides fragilis (chromosomal)'],
        ['Where', 'Acquired enzymes on plasmids in Enterobacterales, Pseudomonas and Acinetobacter'],
        ['Destroys', 'All β-lactams including carbapenems and the newer combinations, except aztreonam'],
        ['Spares', 'Aztreonam, but most isolates also carry an ESBL or AmpC that destroys it; avibactam protects it (aztreonam–avibactam)'],
        ['Inhibited by', 'No licensed inhibitor. Zinc chelators (EDTA, dipicolinic acid) inhibit it in the laboratory']] },
    C: { t: 'Class C', site: 'Serine', ex: 'AmpC, CMY, DHA',
      rows: [['Key enzymes', 'Chromosomal AmpC (inducible in Enterobacter, K. aerogenes, C. freundii, Hafnia, Serratia, Morganella, Providencia, Pseudomonas); plasmid AmpC (CMY, DHA) in E. coli, Klebsiella and P. mirabilis'],
        ['Where', 'Chromosome (inducible, can be stably derepressed by mutation) or plasmid'],
        ['Destroys', 'Penicillins, cephamycins (cefoxitin), first- to third-generation cephalosporins, aztreonam'],
        ['Spares', 'Cefepime (if the MIC is low) and carbapenems; temocillin is stable'],
        ['Inhibited by', 'Poorly by clavulanate and tazobactam; well by avibactam, vaborbactam and relebactam']] },
    D: { t: 'Class D', site: 'Serine', ex: 'OXA-1, OXA-48, OXA-23',
      rows: [['Key enzymes', 'OXA-1 (narrow, carried with CTX-M-15); OXA-48-like carbapenemases (OXA-48, -181, -232, -244) in Enterobacterales; OXA-23, -24 and -58 in Acinetobacter baumannii'],
        ['Where', 'Mostly plasmids; OXA-51 is chromosomal in A. baumannii'],
        ['Destroys', 'OXA-1: penicillins and co-amoxiclav, reduces piperacillin–tazobactam activity. OXA-48: penicillins, temocillin (high level) and carbapenems (low level); not third-generation cephalosporins unless an ESBL is also present'],
        ['Spares', 'OXA-48 alone spares ceftazidime, ceftriaxone and aztreonam'],
        ['Inhibited by', 'Avibactam (OXA-48). Not reliably by clavulanate or tazobactam; not by vaborbactam or relebactam']] }
  };
  var st = { c: 'A' };
  function tree() {
    var h = '<svg viewBox="10 0 600 236" class="bl-svg bl-tree" role="group" aria-label="Ambler classes of β-lactamase">';
    h += '<rect class="node root" x="245" y="6" width="150" height="34" rx="8"/><text class="lbl nd" x="320" y="28" text-anchor="middle">β-lactamases</text>';
    h += '<path class="link" d="M320 40 L 320 54 M190 54 L 530 54 M190 54 L 190 66 M530 54 L 530 66"/>';
    h += '<rect class="node mid" x="90" y="66" width="200" height="34" rx="8"/><text class="lbl nd" x="190" y="88" text-anchor="middle">Serine at the active site</text>';
    h += '<rect class="node mid" x="430" y="66" width="200" height="34" rx="8"/><text class="lbl nd" x="530" y="88" text-anchor="middle">Zinc at the active site</text>';
    h += '<path class="link" d="M190 100 L 190 114 M70 114 L 310 114 M70 114 L 70 126 M190 114 L 190 126 M310 114 L 310 126 M530 100 L 530 126"/>';
    [['A', 70], ['C', 190], ['D', 310], ['B', 530]].forEach(function (p) {
      var c = CL[p[0]], x = p[1];
      h += '<g class="cls' + (st.c === p[0] ? ' on' : '') + '" data-c="' + p[0] + '" tabindex="0" role="button" aria-pressed="' + (st.c === p[0]) + '" aria-label="Ambler ' + c.t + '">' +
        '<rect x="' + (x - 54) + '" y="126" width="108" height="106" rx="10"/><text class="big" x="' + x + '" y="166" text-anchor="middle">' + p[0] + '</text>' +
        c.ex.split(', ').map(function (e, i) { return '<text class="lbl sm" x="' + x + '" y="' + (184 + i * 13.5) + '" text-anchor="middle">' + esc(e) + '</text>'; }).join('') + '</g>';
    });
    return h + '</svg>';
  }
  function clsPanel() {
    var c = CL[st.c];
    return '<div class="mech-head"><span class="mech-n big">' + st.c + '</span><div><p class="mech-kicker">' + esc(c.site) + '</p><h3>Ambler class ' + st.c + '</h3></div></div>' +
      '<table class="ab-tbl mech-tbl">' + c.rows.map(function (r) { return '<tr><th>' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td></tr>'; }).join('') + '</table>';
  }
  function clsOpts() {
    return '<div class="opts bl-opts">' + ['A', 'B', 'C', 'D'].map(function (k) {
      return '<button type="button" class="opt' + (st.c === k ? ' on' : '') + '" aria-pressed="' + (st.c === k) + '" data-c="' + k + '"><span class="opt-text">Class ' + k + '</span><span class="opt-pts">' + esc(CL[k].ex) + '</span></button>';
    }).join('') + '</div>';
  }

  // ── Matrices ──────────────────────────────────────────────
  var ENZ = [['Penicillinase', 'A: TEM-1, SHV-1'], ['ESBL', 'A: CTX-M'], ['AmpC', 'C'], ['KPC', 'A'], ['OXA-48', 'D'], ['MBL', 'B: NDM, VIM, IMP']];
  var WORD = ['Destroyed (inactive)', 'Variable or not reliable', 'Usually active'];
  var DR = [
    ['Penicillins', [['Amoxicillin', 'amoxicillin', '000000'], ['Co-amoxiclav', 'co-amoxiclav', '210000'], ['Piperacillin–tazobactam', 'piperacillin-tazobactam', '211000'], ['Temocillin', 'temocillin', '222100'], ['Pivmecillinam (cystitis)', 'pivmecillinam', '221000']]],
    ['Cephalosporins', [['Ceftriaxone, cefotaxime', 'ceftriaxone', '200010'], ['Ceftazidime', 'ceftazidime', '200010'], ['Cefepime', 'cefepime', '212010'], ['Ceftazidime–avibactam', 'ceftazidime-avibactam', '222220'], ['Ceftolozane–tazobactam', 'ceftolozane-tazobactam', '221000'], ['Cefiderocol', 'cefiderocol', '222221']]],
    ['Carbapenems and monobactams', [['Ertapenem', 'ertapenem', '222010'], ['Meropenem', 'meropenem', '222010'], ['Meropenem–vaborbactam', '', '222200'], ['Imipenem–relebactam', '', '222200'], ['Aztreonam', 'aztreonam', '201011'], ['Aztreonam–avibactam', '', '222222']]]
  ];
  var IWORD = ['Not inhibited', 'Weak or partial', 'Inhibited'];
  var INH = [['Clavulanate', '', '220000'], ['Tazobactam', '', '221000'], ['Avibactam', '', '222220'], ['Vaborbactam', '', '222200'], ['Relebactam', '', '222200']];
  function matrix(groups, label, words) {
    var h = '<div class="spec-scroll bl-scroll"><table class="spec bl-spec"><thead><tr class="spec-org"><th class="spec-corner"><span class="sr">' + esc(label) + '</span></th>';
    ENZ.forEach(function (e, i) { h += '<th scope="col" data-col="' + i + '"><span>' + esc(e[0]) + ' <small>' + esc(e[1]) + '</small></span></th>'; });
    h += '</tr></thead><tbody>';
    groups.forEach(function (g) {
      if (g[0]) h += '<tr class="spec-cls"><th colspan="' + (ENZ.length + 1) + '"><span>' + esc(g[0]) + '</span></th></tr>';
      g[1].forEach(function (d) {
        h += '<tr><th scope="row">' + drug(d[0], d[1]) + '</th>';
        d[2].split('').forEach(function (v, i) { h += '<td data-col="' + i + '" title="' + esc(d[0] + ' vs ' + ENZ[i][0] + ': ' + words[+v]) + '"><i class="c' + v + '"></i><span class="sr">' + words[+v] + '</span></td>'; });
        h += '</tr>';
      });
    });
    return h + '</tbody></table></div>';
  }
  function key(words) { return '<div class="sp-key" aria-hidden="true"><span><i class="c2"></i>' + words[2] + '</span><span><i class="c1"></i>' + words[1] + '</span><span><i class="c0"></i>' + words[0] + '</span></div>'; }

  function drawCls() {
    var t = host.querySelector('#bl-tree'), o = host.querySelector('#bl-cls-opts'), p = host.querySelector('#bl-cls-panel');
    t.innerHTML = tree(); o.innerHTML = clsOpts(); p.innerHTML = clsPanel();
  }

  host.querySelector('#bl-env').innerHTML = envelope();
  host.querySelector('#bl-env-notes').innerHTML = envNotes();
  host.querySelector('#bl-chem').innerHTML = chem();
  host.querySelector('#bl-drug-mx').innerHTML = key(WORD) + matrix(DR, 'Antibiotic', WORD);
  host.querySelector('#bl-inh-mx').innerHTML = key(IWORD) + matrix([['', INH]], 'Inhibitor', IWORD);
  drawCls();
  host.addEventListener('click', function (e) { var t = e.target.closest('[data-c]'); if (t) { st.c = t.getAttribute('data-c'); drawCls(); } });
  host.addEventListener('keydown', function (e) { var t = e.target.closest('g[data-c]'); if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); st.c = t.getAttribute('data-c'); drawCls(); var g = host.querySelector('g[data-c="' + st.c + '"]'); if (g) g.focus(); } });
})();
