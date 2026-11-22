/* PK/PD explainer: diagrams of fT>MIC, Cmax/MIC and AUC/MIC, an interactive one-compartment dosing curve,
   and a table of the site's antibiotics by PK/PD index (window.ABX_DATA).
   The curves are illustrative (one-compartment model, typical adult parameters), not for dosing. */
(function () {
  var host = document.getElementById('pkpd');
  if (!host) return;
  var A = window.ABX_DATA;
  var abxHref = host.getAttribute('data-abx') || '';
  var hashMode = !!document.getElementById('view-links');
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function dl(id) { return hashMode ? '#drug-' + id : abxHref + '#drug-' + id; }

  // One-compartment model with zero-order infusion, superposition of repeated doses (steady state shown).
  function conc(t, p) {
    var k = Math.LN2 / p.th, c = 0, tinf = Math.max(p.tinf, 0.01), R = p.dose / tinf, kv = k * p.v;
    for (var n = -Math.ceil(120 / p.tau); n * p.tau <= t; n++) {
      var t0 = n * p.tau, dt = t - t0;
      if (dt < 0) continue;
      if (dt <= tinf) c += (R / kv) * (1 - Math.exp(-k * dt));
      else c += (R / kv) * (1 - Math.exp(-k * tinf)) * Math.exp(-k * (dt - tinf));
    }
    return c * (p.fu || 1);
  }
  function single(t, p) { // single dose, for the concept diagrams
    var k = Math.LN2 / p.th, tinf = p.tinf, R = p.dose / tinf, kv = k * p.v;
    if (t < 0) return 0;
    if (t <= tinf) return (R / kv) * (1 - Math.exp(-k * t));
    return (R / kv) * (1 - Math.exp(-k * tinf)) * Math.exp(-k * (t - tinf));
  }

  // ── Concept diagrams ────────────────────────────────────────────
  var W = 320, H = 190, PL = 34, PR = 12, PT = 16, PB = 28;
  function axes(xlab) {
    return '<line class="ax" x1="' + PL + '" y1="' + (H - PB) + '" x2="' + (W - PR) + '" y2="' + (H - PB) + '"/>' +
      '<line class="ax" x1="' + PL + '" y1="' + PT + '" x2="' + PL + '" y2="' + (H - PB) + '"/>' +
      '<text class="axl" x="' + ((PL + W - PR) / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + xlab + '</text>' +
      '<text class="axl" transform="translate(12 ' + ((PT + H - PB) / 2) + ') rotate(-90)" text-anchor="middle">Concentration</text>';
  }
  function concept(kind) {
    var p = { dose: 100, v: 10, th: 2.2, tinf: 0.5 }, T = 12, cmax = 9.6, mic = 2.2;
    var sx = function (t) { return PL + (t / T) * (W - PL - PR); }, sy = function (c) { return H - PB - (c / (cmax * 1.08)) * (H - PB - PT); };
    var pts = [], above = [], tA = null, tB = null;
    for (var i = 0; i <= 240; i++) {
      var t = T * i / 240, c = single(t, p);
      pts.push(sx(t).toFixed(1) + ',' + sy(c).toFixed(1));
      if (c >= mic) { above.push([t, c]); if (tA === null) tA = t; tB = t; }
    }
    var peakT = 0, peakC = 0;
    for (var j = 0; j <= 240; j++) { var tt = T * j / 240, cc = single(tt, p); if (cc > peakC) { peakC = cc; peakT = tt; } }
    var h = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="pk-svg" role="img" aria-label="' + kind + ' diagram">';
    if (kind === 'time') {
      // shade the curve above MIC, and the time band on the axis
      var poly = above.map(function (a) { return sx(a[0]).toFixed(1) + ',' + sy(a[1]).toFixed(1); }).join(' ');
      poly += ' ' + sx(tB).toFixed(1) + ',' + sy(mic).toFixed(1) + ' ' + sx(tA).toFixed(1) + ',' + sy(mic).toFixed(1);
      h += '<polygon class="fill-a" points="' + poly + '"/>';
      h += '<rect class="band" x="' + sx(tA).toFixed(1) + '" y="' + (H - PB - 7) + '" width="' + (sx(tB) - sx(tA)).toFixed(1) + '" height="7" rx="2"/>';
      h += '<line class="guide" x1="' + sx(tA).toFixed(1) + '" y1="' + sy(mic).toFixed(1) + '" x2="' + sx(tA).toFixed(1) + '" y2="' + (H - PB) + '"/><line class="guide" x1="' + sx(tB).toFixed(1) + '" y1="' + sy(mic).toFixed(1) + '" x2="' + sx(tB).toFixed(1) + '" y2="' + (H - PB) + '"/>';
      h += '<text class="lab strong" x="' + ((sx(tA) + sx(tB)) / 2).toFixed(1) + '" y="' + (H - PB - 12) + '" text-anchor="middle">Time above MIC</text>';
    } else if (kind === 'peak') {
      h += '<line class="arrow" x1="' + sx(peakT).toFixed(1) + '" y1="' + (sy(mic) - 2).toFixed(1) + '" x2="' + sx(peakT).toFixed(1) + '" y2="' + (sy(peakC) + 6).toFixed(1) + '" marker-end="url(#pkArrow)" marker-start="url(#pkArrowS)"/>';
      h += '<circle class="dot" cx="' + sx(peakT).toFixed(1) + '" cy="' + sy(peakC).toFixed(1) + '" r="4"/>';
      h += '<text class="lab strong" x="' + (sx(peakT) + 10).toFixed(1) + '" y="' + (sy(peakC) + 4).toFixed(1) + '">Cmax</text>';
      h += '<text class="lab strong" x="' + (sx(peakT) + 10).toFixed(1) + '" y="' + ((sy(peakC) + sy(mic)) / 2 + 4).toFixed(1) + '">Cmax ÷ MIC</text>';
    } else {
      var poly2 = sx(0) + ',' + sy(0) + ' ' + pts.join(' ') + ' ' + sx(T) + ',' + sy(0);
      h += '<polygon class="fill-b" points="' + poly2 + '"/>';
      h += '<text class="lab strong" x="' + sx(1.6).toFixed(1) + '" y="' + sy(3.6).toFixed(1) + '">AUC</text>';
    }
    h += '<polyline class="curve" points="' + pts.join(' ') + '"/>';
    h += '<line class="mic" x1="' + PL + '" y1="' + sy(mic).toFixed(1) + '" x2="' + (W - PR) + '" y2="' + sy(mic).toFixed(1) + '"/><text class="micl" x="' + (W - PR - 2) + '" y="' + (sy(mic) - 5).toFixed(1) + '" text-anchor="end">MIC</text>';
    h += axes('Time after dose');
    h += '</svg>';
    return h;
  }

  // ── Interactive explorer ─────────────────────────────────────────
  var PRE = {
    bl: { n: 'Meropenem-like β-lactam', dose: 1000, v: 20, th: 1, fu: 0.98, taus: [6, 8, 12], tau: 8, modes: ['bolus', 'ext', 'cont'], mode: 'bolus', mic: 2, idx: 'time', unit: 'mg', note: '1 g every 8 hours, half-life about 1 hour.' },
    ag: { n: 'Gentamicin-like aminoglycoside', dose: 490, v: 21, th: 2.5, fu: 1, taus: [8, 24], tau: 24, modes: ['bolus'], mode: 'bolus', mic: 1, idx: 'peak', unit: 'mg', note: '7 mg/kg for a 70 kg adult, half-life about 2.5 hours.' },
    vg: { n: 'Vancomycin', dose: 1000, v: 49, th: 6, fu: 0.55, taus: [8, 12, 24], tau: 12, modes: ['bolus', 'cont'], mode: 'bolus', mic: 1, idx: 'auc', unit: 'mg', note: '1 g every 12 hours, volume 0.7 L/kg, half-life about 6 hours. Shown as total drug, as in TDM practice.' }
  };
  var MICS = [0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 32];
  var MODE = { bolus: 'Short infusion (30 min)', ext: 'Extended infusion (3 hours)', cont: 'Continuous infusion' };
  var st = { pre: 'bl', tau: 8, mode: 'bolus', mic: 2, dmul: 1 };

  function sim() {
    var P = PRE[st.pre], tau = st.tau, dose = P.dose * st.dmul;
    if (st.pre === 'vg') dose = P.dose * st.dmul * tau / 12; // keep the daily dose fixed when the interval changes
    if (st.pre === 'bl') dose = P.dose * st.dmul;
    var tinf = st.mode === 'cont' ? tau : st.mode === 'ext' ? 3 : 0.5;
    var p = { dose: dose, v: P.v, th: P.th, tinf: tinf, tau: tau, fu: st.pre === 'vg' ? 1 : P.fu };
    var N = 480, pts = [], cmax = 0, above = 0, auc = 0, prev = null;
    for (var i = 0; i <= N; i++) {
      var t = 24 * i / N, c = conc(t, p);
      pts.push([t, c]);
      if (c > cmax) cmax = c;
      if (i > 0) { auc += (c + prev) / 2 * (24 / N); if ((c + prev) / 2 >= st.mic) above += 24 / N; }
      prev = c;
    }
    return { pts: pts, cmax: cmax, ft: 100 * above / 24, auc: auc, daily: dose * 24 / tau, p: p };
  }

  function plot(r) {
    var W2 = 640, H2 = 300, L = 46, Rr = 16, T2 = 16, B = 36;
    var ymax = Math.max(r.cmax, st.mic) * 1.15;
    var nice = [1, 2, 5, 10, 20, 25, 50, 100, 200];
    var step = nice.filter(function (n) { return ymax / n <= 6; })[0] || 200;
    ymax = Math.ceil(ymax / step) * step;
    var sx = function (t) { return L + t / 24 * (W2 - L - Rr); }, sy = function (c) { return H2 - B - c / ymax * (H2 - B - T2); };
    var h = '<svg viewBox="0 0 ' + W2 + ' ' + H2 + '" class="pk-svg pk-big" role="img" aria-label="Concentration over 24 hours at steady state">';
    for (var y = 0; y <= ymax + 1e-9; y += step) h += '<line class="grid" x1="' + L + '" x2="' + (W2 - Rr) + '" y1="' + sy(y).toFixed(1) + '" y2="' + sy(y).toFixed(1) + '"/><text class="tick" x="' + (L - 6) + '" y="' + (sy(y) + 4).toFixed(1) + '" text-anchor="end">' + y + '</text>';
    for (var x = 0; x <= 24; x += 4) h += '<text class="tick" x="' + sx(x).toFixed(1) + '" y="' + (H2 - B + 16) + '" text-anchor="middle">' + x + '</text>';
    var P = PRE[st.pre], line = r.pts.map(function (q) { return sx(q[0]).toFixed(1) + ',' + sy(q[1]).toFixed(1); }).join(' ');
    if (P.idx === 'auc') h += '<polygon class="fill-b" points="' + sx(0) + ',' + sy(0) + ' ' + line + ' ' + sx(24) + ',' + sy(0) + '"/>';
    if (P.idx === 'time') {
      // shade where above MIC
      var seg = [], segs = [];
      r.pts.forEach(function (q) { if (q[1] >= st.mic) seg.push(q); else if (seg.length) { segs.push(seg); seg = []; } });
      if (seg.length) segs.push(seg);
      segs.forEach(function (sg) {
        h += '<polygon class="fill-a" points="' + sg.map(function (q) { return sx(q[0]).toFixed(1) + ',' + sy(q[1]).toFixed(1); }).join(' ') + ' ' + sx(sg[sg.length - 1][0]).toFixed(1) + ',' + sy(st.mic).toFixed(1) + ' ' + sx(sg[0][0]).toFixed(1) + ',' + sy(st.mic).toFixed(1) + '"/>';
        h += '<rect class="band" x="' + sx(sg[0][0]).toFixed(1) + '" y="' + (H2 - B - 7) + '" width="' + Math.max(1, sx(sg[sg.length - 1][0]) - sx(sg[0][0])).toFixed(1) + '" height="7" rx="2"/>';
      });
    }
    h += '<polyline class="curve" points="' + line + '"/>';
    if (P.idx === 'peak') {
      var pk = r.pts.reduce(function (m, q) { return q[1] > m[1] ? q : m; }, [0, 0]);
      h += '<circle class="dot" cx="' + sx(pk[0]).toFixed(1) + '" cy="' + sy(pk[1]).toFixed(1) + '" r="4.5"/><text class="lab strong" x="' + (sx(pk[0]) + 10).toFixed(1) + '" y="' + (sy(pk[1]) + 4).toFixed(1) + '">Cmax ' + pk[1].toFixed(1) + '</text>';
    }
    h += '<line class="mic" x1="' + L + '" x2="' + (W2 - Rr) + '" y1="' + sy(st.mic).toFixed(1) + '" y2="' + sy(st.mic).toFixed(1) + '"/><text class="micl" x="' + (W2 - Rr - 2) + '" y="' + (sy(st.mic) - 6).toFixed(1) + '" text-anchor="end">MIC ' + st.mic + ' mg/L</text>';
    h += '<line class="ax" x1="' + L + '" x2="' + (W2 - Rr) + '" y1="' + (H2 - B) + '" y2="' + (H2 - B) + '"/><line class="ax" x1="' + L + '" x2="' + L + '" y1="' + T2 + '" y2="' + (H2 - B) + '"/>';
    h += '<text class="axl" x="' + ((L + W2 - Rr) / 2) + '" y="' + (H2 - 6) + '" text-anchor="middle">Hours (steady state)</text><text class="axl" transform="translate(13 ' + ((T2 + H2 - B) / 2) + ') rotate(-90)" text-anchor="middle">' + (st.pre === 'vg' ? 'Total' : 'Free') + ' concentration (mg/L)</text>';
    return h + '</svg>';
  }

  function chips(key, arr, lab) {
    return '<div class="ab-aw" role="group">' + arr.map(function (x) { var v = x[0]; return '<button type="button" class="sp-chip' + (String(st[key]) === String(v) ? ' on' : '') + '" data-k="' + key + '" data-v="' + v + '">' + esc(x[1]) + '</button>'; }).join('') + '</div>';
  }
  function explorer() {
    var P = PRE[st.pre], r = sim();
    var h = '<div class="pk-ctrl"><div class="ab-sec"><h4>Drug</h4>' + chips('pre', Object.keys(PRE).map(function (k) { return [k, PRE[k].n]; })) + '</div>';
    h += '<div class="ab-sec"><h4>Dosing interval</h4>' + chips('tau', P.taus.map(function (t) { return [t, 'Every ' + t + ' hours']; })) + '</div>';
    if (P.modes.length > 1) h += '<div class="ab-sec"><h4>Infusion</h4>' + chips('mode', P.modes.map(function (m) { return [m, MODE[m]]; })) + '</div>';
    h += '<div class="ab-sec"><h4>Organism MIC</h4><div class="pk-range"><input type="range" id="pk-mic" min="0" max="' + (MICS.length - 1) + '" step="1" value="' + MICS.indexOf(st.mic) + '" aria-label="MIC"><output>' + st.mic + ' mg/L</output></div></div>';
    h += '<div class="ab-sec"><h4>Dose</h4><div class="pk-range"><input type="range" id="pk-dose" min="0.5" max="2" step="0.25" value="' + st.dmul + '" aria-label="Dose"><output>' + Math.round(r.p.dose) + ' mg per dose (' + Math.round(r.daily) + ' mg a day)</output></div></div></div>';
    h += '<div class="pk-plot">' + plot(r) + '</div>';
    var ok = function (b) { return b ? 'ok' : 'low'; };
    var m1 = r.ft, m2 = r.cmax / st.mic, m3 = r.auc / st.mic;
    var tgt = st.pre === 'bl' ? m1 >= 40 : st.pre === 'ag' ? m2 >= 8 : m3 >= 400;
    h += '<div class="pk-metrics">' +
      '<div class="pk-m' + (P.idx === 'time' ? ' main ' + ok(m1 >= 40) : '') + '"><span>' + (st.pre === 'vg' ? 'T>MIC' : 'fT>MIC') + '</span><b>' + Math.round(m1) + '%</b><small>' + (P.idx === 'time' ? 'target ≥ 40% (100% in critical illness)' : 'of the dosing interval') + '</small></div>' +
      '<div class="pk-m' + (P.idx === 'peak' ? ' main ' + ok(m2 >= 8) : '') + '"><span>Cmax/MIC</span><b>' + (m2 >= 100 ? Math.round(m2) : m2.toFixed(1)) + '</b><small>' + (P.idx === 'peak' ? 'target ≥ 8–10' : 'peak ' + r.cmax.toFixed(1) + ' mg/L') + '</small></div>' +
      '<div class="pk-m' + (P.idx === 'auc' ? ' main ' + ok(m3 >= 400) : '') + '"><span>AUC24/MIC</span><b>' + Math.round(m3) + '</b><small>' + (P.idx === 'auc' ? 'target ≥ 400 (AUC24 400–600)' : 'AUC24 ' + Math.round(r.auc) + ' mg·h/L') + '</small></div></div>';
    h += '<p class="ab-note pk-cap">' + esc(P.note) + ' ' + (tgt ? 'The target for this drug is met at this MIC.' : 'The target for this drug is not met at this MIC: try a shorter interval, ' + (P.modes.length > 1 ? 'a longer infusion, ' : '') + 'or a higher dose.') + ' Illustrative model only, not for dosing.</p>';
    return h;
  }

  // ── Table of site antibiotics by index ───────────────────────────
  function table() {
    if (!A) return '';
    var G = [
      ['Time-dependent: fT>MIC', function (x) { return x === 'fT>MIC'; }],
      ['Concentration-dependent: Cmax/MIC', function (x) { return /^Cmax\/MIC/.test(x); }],
      ['Exposure-dependent: AUC/MIC', function (x) { return /AUC\/MIC/.test(x) && !/^Cmax/.test(x); }],
      ['Local concentration', function (x) { return /concentration/i.test(x); }]
    ];
    var h = '';
    G.forEach(function (g) {
      var ds = A.drugs.filter(function (d) { return d.pkpd && g[1](d.pkpd.idx || ''); });
      if (!ds.length) return;
      h += '<h3 class="pk-th">' + esc(g[0]) + '</h3><table class="ab-tbl pk-tbl"><tbody>' + ds.map(function (d) {
        return '<tr><th><a href="' + esc(dl(d.id)) + '">' + esc(d.name) + '</a></th><td>' + esc(d.pkpd.target) + '</td></tr>';
      }).join('') + '</tbody></table>';
    });
    return h;
  }

  function draw() {
    host.querySelector('#pk-concepts-a').innerHTML = concept('time');
    host.querySelector('#pk-concepts-b').innerHTML = concept('peak');
    host.querySelector('#pk-concepts-c').innerHTML = concept('auc');
    host.querySelector('#pk-explorer').innerHTML = explorer();
    var tb = host.querySelector('#pk-table'); if (tb) tb.innerHTML = table();
  }
  function redrawExplorer() { host.querySelector('#pk-explorer').innerHTML = explorer(); }

  host.addEventListener('click', function (e) {
    var b = e.target.closest('[data-k]');
    if (!b) return;
    var k = b.getAttribute('data-k'), v = b.getAttribute('data-v');
    if (k === 'pre') { var P = PRE[v]; st.pre = v; st.tau = P.tau; st.mode = P.mode; st.mic = P.mic; st.dmul = 1; }
    else if (k === 'tau') st.tau = +v;
    else st[k] = v;
    redrawExplorer();
  });
  host.addEventListener('input', function (e) {
    if (e.target.id === 'pk-mic') st.mic = MICS[+e.target.value];
    else if (e.target.id === 'pk-dose') st.dmul = +e.target.value;
    else return;
    var id = e.target.id;
    redrawExplorer();
    var el = host.querySelector('#' + id); if (el) el.focus();
  });
  // Arrow marker defs once
  var defs = document.createElement('div');
  defs.innerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="pkArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="arrowhead"/></marker><marker id="pkArrowS" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="arrowhead"/></marker></defs></svg>';
  host.appendChild(defs.firstChild);
  draw();
  window.PKPD = { conc: conc, sim: sim, st: st };
})();
