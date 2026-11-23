/* Resistance takeover: a teaching animation. A grid of bacteria (each square stands for a clump of millions) grows,
   is killed as the antibiotic level rises and falls, and a few resistant cells compete for space. Charts show the drug
   level against the two MICs (the gap between them is the mutant selection window) and both populations over time.
   This is a simplified teaching model, not a pharmacological prediction. */
(function () {
  var host = document.getElementById('rt');
  if (!host) return;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ── Model constants ─────────────────────────────────────────
  var GW = 72, GH = 40, N = GW * GH;
  var HOURS = 21 * 24, TAU = 8, HALF = 3, KEL = Math.LN2 / HALF;
  var MIC_S = 1, MIC_R = 32;              // resistant cells need 32× the level
  var KMAX = 0.15, EC = 2;                // maximum kill per hour; half-maximal at 2× MIC
  var G_S = 0.12, G_R = 0.1;              // division per hour into free space (resistance carries a small fitness cost)
  var IMM = 0.004, MU = 0.00001;          // immune clearance per hour; chance a division gives a resistant mutant
  var START_FILL = 0.35;

  var PRESETS = {
    none: { n: 'No antibiotic', peak: 0, days: 7, miss: 0, r0: 4, combo: 0, t: 'Bacteria fill the space. The few resistant cells stay rare: without antibiotic pressure they have no advantage (and grow a little slower).' },
    good: { n: 'Good dose, full course', peak: 128, days: 7, miss: 0, r0: 4, combo: 0, t: 'Levels stay above even the resistant MIC for most of each dosing interval, so both populations are killed and the infection clears.' },
    low: { n: 'Low dose', peak: 16, days: 7, miss: 0, r0: 4, combo: 0, t: 'Levels sit between the two MICs (the mutant selection window): susceptible cells die, resistant cells survive and take over the freed space.' },
    early: { n: 'Stopped early', peak: 128, days: 2, miss: 0, r0: 4, combo: 0, t: 'The first days kill most bacteria, but survivors regrow once the antibiotic stops: relapse.' },
    missed: { n: 'Missed doses', peak: 128, days: 7, miss: 50, r0: 4, combo: 0, t: 'Long gaps let the level fall into the selection window, where resistant cells grow back between doses.' },
    combo: { n: 'Combination', peak: 16, days: 7, miss: 0, r0: 4, combo: 1, t: 'A second drug from another class kills the cells resistant to the first, so no single mutation is enough to survive.' }
  };
  var st = { pre: 'low', peak: 16, days: 7, miss: 0, r0: 4, combo: 0, speed: 2, playing: false };

  // ── Seeded random numbers, so a run is repeatable ──────────
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // Drug level (multiples of the susceptible MIC) for every hour of the run
  function levels(p) {
    var R = rng(99), doses = [];
    for (var t = 0; t < p.days * 24; t += TAU) if (!(p.miss && R() * 100 < p.miss) || t === 0) doses.push(t);
    var c = new Float32Array(HOURS + 1);
    for (var h = 0; h <= HOURS; h++) { var v = 0; doses.forEach(function (d) { if (d <= h) v += p.peak * Math.exp(-KEL * (h - d)); }); c[h] = v; }
    return { c: c, doses: doses };
  }
  function effect(c, mic) { if (c <= 0) return 0; var x = c / mic; return KMAX * x * x / (x * x + EC * EC); }

  function Sim(p) {
    var R = rng(12345);
    this.p = p; this.R = R; this.t = 0;
    this.g = new Uint8Array(N);              // 0 empty, 1 susceptible, 2 resistant
    for (var i = 0; i < N; i++) if (R() < START_FILL) this.g[i] = 1;
    for (var k = 0; k < p.r0; k++) { var j = Math.floor(R() * N); this.g[j] = 2; }
    this.lv = levels(p);
    this.hist = [this.count()];
    this.order = new Uint32Array(N); for (i = 0; i < N; i++) this.order[i] = i;
  }
  Sim.prototype.count = function () { var s = 0, r = 0, g = this.g; for (var i = 0; i < N; i++) { if (g[i] === 1) s++; else if (g[i] === 2) r++; } return [s, r]; };
  Sim.prototype.step = function () {
    if (this.t >= HOURS) return false;
    var g = this.g, R = this.R, o = this.order, c = this.lv.c[this.t];
    var kS = effect(c, MIC_S), kR = effect(c, MIC_R);
    if (this.p.combo) { var kB = effect(c, MIC_S); kS = 1 - (1 - kS) * (1 - kB); kR = 1 - (1 - kR) * (1 - kB); }
    for (var i = N - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)), x = o[i]; o[i] = o[j]; o[j] = x; }
    for (var n = 0; n < N; n++) {
      var a = o[n], v = g[a]; if (!v) continue;
      var die = (v === 1 ? kS : kR) + IMM;
      if (R() < die) { g[a] = 0; continue; }
      if (R() < (v === 1 ? G_S : G_R)) {
        var ax = a % GW, ay = (a / GW) | 0, dx = Math.floor(R() * 3) - 1, dy = Math.floor(R() * 3) - 1;
        var nx = ax + dx, ny = ay + dy;
        if ((dx || dy) && nx >= 0 && ny >= 0 && nx < GW && ny < GH) { var b = ny * GW + nx; if (!g[b]) g[b] = (v === 1 && R() < MU) ? 2 : v; }
      }
    }
    this.t++;
    this.hist.push(this.count());
    return true;
  };

  // ── Drawing ─────────────────────────────────────────────────
  function css(v, fb) { var s = getComputedStyle(host).getPropertyValue(v).trim(); return s || fb; }
  var sim = null, canvas, ctx, timer = 0, lastFrame = 0;
  function drawGrid() {
    if (!canvas) return;
    var w = canvas.clientWidth, dpr = window.devicePixelRatio || 1, h = Math.round(w * GH / GW);
    if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); canvas.style.height = h + 'px'; }
    var cs = canvas.width / GW, g = sim.g;
    var cE = css('--bg', '#f3f6f9'), cS = css('--accent', '#4da3e0'), cR = css('--high', '#c0392b');
    ctx.fillStyle = cE; ctx.fillRect(0, 0, canvas.width, canvas.height);
    var pad = Math.max(0.6, cs * 0.12), r = Math.max(1, cs * 0.3);
    for (var y = 0; y < GH; y++) for (var x = 0; x < GW; x++) {
      var v = g[y * GW + x]; if (!v) continue;
      ctx.fillStyle = v === 1 ? cS : cR;
      var px = x * cs + pad, py = y * cs + pad, s = cs - pad * 2;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(px, py, s, s, r); else ctx.rect(px, py, s, s); ctx.fill();
    }
  }
  var CW = 640, CH = 150, L = 46, RT = 12, T = 10, B = 26;
  function sx(h) { return L + (CW - L - RT) * h / HOURS; }
  function dayTicks(yTop, yBot) {
    var s = '';
    for (var d = 0; d <= 21; d += (CW < 480 ? 7 : 3)) { var x = sx(d * 24).toFixed(1); s += '<line class="rt-grid" x1="' + x + '" x2="' + x + '" y1="' + yTop + '" y2="' + yBot + '"/><text class="rt-tick" x="' + x + '" y="' + (yBot + 15) + '" text-anchor="middle">' + d + '</text>'; }
    return s;
  }
  function levelChart() {
    var c = sim.lv.c, max = 256, lo = 0.25;
    function sy(v) { v = Math.max(lo, Math.min(max, v)); return T + (CH - T - B) * (1 - (Math.log(v / lo) / Math.log(max / lo))); }
    var h = '<svg viewBox="0 0 ' + CW + ' ' + CH + '" class="rt-svg" role="img" aria-label="Antibiotic level over time compared with the MIC of susceptible and resistant bacteria">';
    h += '<rect class="rt-win" x="' + L + '" y="' + sy(MIC_R).toFixed(1) + '" width="' + (CW - L - RT) + '" height="' + (sy(MIC_S) - sy(MIC_R)).toFixed(1) + '"/>';
    h += dayTicks(T, CH - B);
    [1, 4, 16, 64, 256].forEach(function (v) { h += '<text class="rt-tick" x="' + (L - 6) + '" y="' + (sy(v) + 4).toFixed(1) + '" text-anchor="end">' + v + '×</text>'; });
    h += '<line class="rt-mic s" x1="' + L + '" x2="' + (CW - RT) + '" y1="' + sy(MIC_S).toFixed(1) + '" y2="' + sy(MIC_S).toFixed(1) + '"/><line class="rt-mic r" x1="' + L + '" x2="' + (CW - RT) + '" y1="' + sy(MIC_R).toFixed(1) + '" y2="' + sy(MIC_R).toFixed(1) + '"/>';
    h += '<text class="rt-lab r" x="' + (CW - RT - 4) + '" y="' + (sy(MIC_R) - 5).toFixed(1) + '" text-anchor="end">MIC of resistant cells</text>';
    h += '<text class="rt-lab s" x="' + (CW - RT - 4) + '" y="' + (sy(MIC_S) + 14).toFixed(1) + '" text-anchor="end">MIC of susceptible cells</text>';
    h += '<text class="rt-lab w" x="' + (CW - RT - 4) + '" y="' + ((sy(MIC_R) + sy(MIC_S)) / 2 + 4).toFixed(1) + '" text-anchor="end">Mutant selection window</text>';
    if (st.peak > 0) {
      var pts = []; for (var t = 0; t <= HOURS; t++) pts.push(sx(t).toFixed(1) + ',' + sy(c[t]).toFixed(1));
      h += '<polyline class="rt-level" points="' + pts.join(' ') + '"/>';
      sim.lv.doses.forEach(function (d) { h += '<line class="rt-dose" x1="' + sx(d).toFixed(1) + '" x2="' + sx(d).toFixed(1) + '" y1="' + (CH - B) + '" y2="' + (CH - B - 5) + '"/>'; });
    }
    h += '<line class="rt-now" x1="' + sx(sim.t).toFixed(1) + '" x2="' + sx(sim.t).toFixed(1) + '" y1="' + T + '" y2="' + (CH - B) + '"/>';
    h += '<line class="rt-ax" x1="' + L + '" x2="' + (CW - RT) + '" y1="' + (CH - B) + '" y2="' + (CH - B) + '"/>';
    return h + '</svg>';
  }
  function popChart() {
    var H2 = CH, max = N, hist = sim.hist;
    function sy(v) { var l = Math.log10(Math.max(1, v)) / Math.log10(max); return T + (H2 - T - B) * (1 - l); }
    var h = '<svg viewBox="0 0 ' + CW + ' ' + H2 + '" class="rt-svg" role="img" aria-label="Number of susceptible and resistant bacteria over time">';
    h += dayTicks(T, H2 - B);
    [1, 10, 100, 1000].forEach(function (v) { h += '<text class="rt-tick" x="' + (L - 6) + '" y="' + (sy(v) + 4).toFixed(1) + '" text-anchor="end">' + v + '</text>'; });
    // draw each population only while it exists (a gap means none left)
    function segs(k, cls) {
      var out = '', cur = [];
      hist.forEach(function (x, t) { if (x[k] > 0) cur.push(sx(t).toFixed(1) + ',' + sy(x[k]).toFixed(1)); else if (cur.length) { out += '<polyline class="rt-pop ' + cls + '" points="' + cur.join(' ') + '"/>'; cur = []; } });
      if (cur.length) out += '<polyline class="rt-pop ' + cls + '" points="' + cur.join(' ') + '"/>';
      return out;
    }
    h += segs(0, 's') + segs(1, 'r');
    h += '<line class="rt-ax" x1="' + L + '" x2="' + (CW - RT) + '" y1="' + (H2 - B) + '" y2="' + (H2 - B) + '"/>';
    h += '<text class="rt-tick" x="' + ((L + CW - RT) / 2) + '" y="' + (H2 - 1) + '" text-anchor="middle">Days</text>';
    return h + '</svg>';
  }
  function verdict() {
    var x = sim.hist[sim.hist.length - 1], s = x[0], r = x[1], tot = s + r, onDrug = sim.t < st.days * 24 && st.peak > 0;
    var day = Math.floor(sim.t / 24), hr = sim.t % 24;
    var head = 'Day ' + day + ', hour ' + hr + (st.peak > 0 ? (onDrug ? ' · on treatment' : ' · treatment stopped') : ' · no antibiotic');
    var cls = 'mid', msg;
    if (sim.t >= HOURS) {
      if (tot === 0) { cls = 'low'; msg = 'Cleared: no bacteria left.'; }
      else if (r > s) { cls = 'high'; msg = 'Resistance has taken over: ' + Math.round(r / tot * 100) + '% of the bacteria are resistant.'; }
      else if (st.peak > 0 && tot > N * 0.2) { cls = 'high'; msg = 'Relapse: the bacteria grew back, mostly still susceptible.'; }
      else { cls = st.peak > 0 ? 'mid' : 'high'; msg = st.peak > 0 ? 'Not cleared.' : 'Untreated infection: the space has filled with bacteria.'; }
    } else if (tot === 0) { cls = 'low'; msg = 'Cleared: no bacteria left.'; }
    else { msg = tot ? Math.round(r / tot * 100) + '% of bacteria are resistant.' : ''; }
    return '<div class="rt-status ' + cls + '"><b>' + esc(head) + '</b><span>' + esc(msg) + '</span></div>';
  }
  function counts() {
    var x = sim.hist[sim.hist.length - 1];
    return '<span class="rt-key s"><i></i>Susceptible <b>' + x[0] + '</b></span><span class="rt-key r"><i></i>Resistant <b>' + x[1] + '</b></span>';
  }
  function paint() {
    drawGrid();
    var box = host.querySelector('#rt-lv'); CW = Math.max(320, Math.min(640, Math.round(box.clientWidth || 640))); CH = CW < 480 ? 170 : 150;
    host.querySelector('#rt-lv').innerHTML = levelChart();
    host.querySelector('#rt-pop').innerHTML = popChart();
    host.querySelector('#rt-st').innerHTML = verdict();
    host.querySelector('#rt-cnt').innerHTML = counts();
    var b = host.querySelector('#rt-play'); b.textContent = st.playing ? 'Pause' : (sim.t >= HOURS ? 'Replay' : 'Play');
  }

  // ── Running ─────────────────────────────────────────────────
  var SPEEDS = [[1, 'Slow', 6], [2, 'Normal', 18], [3, 'Fast', 60]];
  function tps() { return SPEEDS.filter(function (s) { return s[0] === st.speed; })[0][2]; }
  function loop(ts) {
    if (!st.playing) return;
    if (!lastFrame) lastFrame = ts;
    var n = Math.max(1, Math.round((ts - lastFrame) / 1000 * tps()));
    if ((ts - lastFrame) >= 1000 / tps()) {
      lastFrame = ts;
      for (var i = 0; i < n && sim.t < HOURS; i++) sim.step();
      paint();
      if (sim.t >= HOURS) { st.playing = false; paint(); return; }
    }
    timer = requestAnimationFrame(loop);
  }
  function play() { if (sim.t >= HOURS) reset(); st.playing = true; lastFrame = 0; cancelAnimationFrame(timer); timer = requestAnimationFrame(loop); paint(); }
  function pause() { st.playing = false; cancelAnimationFrame(timer); paint(); }
  function reset(auto) { cancelAnimationFrame(timer); sim = new Sim({ peak: st.peak, days: st.days, miss: st.miss, r0: st.r0, combo: st.combo }); st.playing = false; paint(); if (auto) play(); }

  // ── Controls ────────────────────────────────────────────────
  var PEAKS = [0, 2, 4, 8, 16, 32, 64, 128, 256];
  function peakText(v) { return v ? v + '× MIC' : 'None'; }
  function chipRow(key, items) { return '<div class="ab-aw" role="group">' + items.map(function (x) { var on = String(st[key]) === String(x[0]); return '<button type="button" class="sp-chip' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-k="' + key + '" data-v="' + x[0] + '">' + esc(x[1]) + '</button>'; }).join('') + '</div>'; }
  function controls() {
    return '<div class="ab-sec"><h4>Scenario</h4>' + chipRow('pre', Object.keys(PRESETS).map(function (k) { return [k, PRESETS[k].n]; }).concat([['custom', 'Custom']])) + '</div>' +
      '<p class="rt-explain" id="rt-explain">' + esc(st.pre !== 'custom' ? PRESETS[st.pre].t : 'Your own settings: change the sliders and watch what happens.') + '</p>' +
      '<div class="rt-sliders">' +
      '<div class="ab-sec"><h4>Peak level after each dose</h4><div class="pk-range"><input type="range" id="rt-peak" min="0" max="' + (PEAKS.length - 1) + '" step="1" value="' + PEAKS.indexOf(st.peak) + '" aria-label="Peak level"><output id="rt-peak-o">' + peakText(st.peak) + '</output></div></div>' +
      '<div class="ab-sec"><h4>Course length</h4><div class="pk-range"><input type="range" id="rt-days" min="1" max="14" step="1" value="' + st.days + '" aria-label="Course length"><output id="rt-days-o">' + st.days + ' day' + (st.days === 1 ? '' : 's') + '</output></div></div>' +
      '<div class="ab-sec"><h4>Doses missed</h4><div class="pk-range"><input type="range" id="rt-miss" min="0" max="75" step="5" value="' + st.miss + '" aria-label="Doses missed"><output id="rt-miss-o">' + st.miss + '%</output></div></div>' +
      '<div class="ab-sec"><h4>Resistant cells at the start</h4><div class="pk-range"><input type="range" id="rt-r0" min="0" max="20" step="1" value="' + st.r0 + '" aria-label="Resistant cells at the start"><output id="rt-r0-o">' + st.r0 + '</output></div></div>' +
      '</div>' +
      '<div class="ab-sec"><h4>Second drug from another class</h4>' + chipRow('combo', [[0, 'No'], [1, 'Yes, same level']]) + '</div>';
  }
  function build() {
    host.innerHTML = '<div class="rt-layout"><section class="card af-card rt-stage">' +
      '<div class="rt-bar"><div class="rt-btns"><button type="button" class="reset rt-main" id="rt-play">Play</button><button type="button" class="reset" id="rt-reset">Restart</button></div>' +
      '<div class="rt-speed" data-speed>' + chipRow('speed', SPEEDS.map(function (s) { return [s[0], s[1]]; })) + '</div></div>' +
      '<div id="rt-st"></div><canvas id="rt-canvas" class="rt-canvas" aria-label="Grid of bacteria: blue squares are susceptible, red squares are resistant"></canvas>' +
      '<p class="rt-counts" id="rt-cnt"></p>' +
      '<h4 class="rt-h">Antibiotic level (multiples of the susceptible MIC)</h4><div id="rt-lv"></div>' +
      '<h4 class="rt-h">Bacteria (log scale)</h4><div id="rt-pop"></div></section>' +
      '<section class="card af-card rt-ctrl" id="rt-ctrl">' + controls() + '</section></div>';
    canvas = host.querySelector('#rt-canvas'); ctx = canvas.getContext('2d');
  }
  function applyPreset(k) { var p = PRESETS[k]; st.pre = k; st.peak = p.peak; st.days = p.days; st.miss = p.miss; st.r0 = p.r0; st.combo = p.combo; host.querySelector('#rt-ctrl').innerHTML = controls(); }

  host.addEventListener('click', function (e) {
    if (e.target.id === 'rt-play') { if (st.playing) pause(); else play(); return; }
    if (e.target.id === 'rt-reset') { reset(true); return; }
    var c = e.target.closest('[data-k]'); if (!c) return;
    var k = c.getAttribute('data-k'), v = c.getAttribute('data-v');
    if (k === 'pre') { if (v === 'custom') { st.pre = 'custom'; host.querySelector('#rt-ctrl').innerHTML = controls(); return; } applyPreset(v); reset(true); return; }
    if (k === 'speed') { st.speed = +v; host.querySelector('[data-speed]').innerHTML = chipRow('speed', SPEEDS.map(function (s) { return [s[0], s[1]]; })); return; }
    if (k === 'combo') { st.combo = +v; st.pre = 'custom'; host.querySelector('#rt-ctrl').innerHTML = controls(); reset(true); }
  });
  var deb = 0;
  host.addEventListener('input', function (e) {
    var id = e.target.id, v = +e.target.value;
    if (id === 'rt-peak') { st.peak = PEAKS[v]; host.querySelector('#rt-peak-o').textContent = peakText(st.peak); }
    else if (id === 'rt-days') { st.days = v; host.querySelector('#rt-days-o').textContent = v + ' day' + (v === 1 ? '' : 's'); }
    else if (id === 'rt-miss') { st.miss = v; host.querySelector('#rt-miss-o').textContent = v + '%'; }
    else if (id === 'rt-r0') { st.r0 = v; host.querySelector('#rt-r0-o').textContent = v; }
    else return;
    if (st.pre !== 'custom') { st.pre = 'custom'; host.querySelectorAll('[data-k="pre"]').forEach(function (b) { var on = b.getAttribute('data-v') === 'custom'; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }); host.querySelector('#rt-explain').textContent = 'Your own settings: change the sliders and watch what happens.'; }
    clearTimeout(deb); deb = setTimeout(function () { reset(true); }, 180);
  });
  window.addEventListener('resize', function () { if (sim) drawGrid(); });

  build();
  applyPreset('low');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  reset(false);
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); play(); } }, { threshold: 0.3 });
    io.observe(canvas);
  }
  // For testing: run a scenario to the end without drawing
  window.RT_TEST = function (p) { var s = new Sim(p); while (s.step()) {} var x = s.hist[s.hist.length - 1]; var maxR = 0; s.hist.forEach(function (h) { if (h[1] > maxR) maxR = h[1]; }); return { s: x[0], r: x[1], minTot: Math.min.apply(null, s.hist.map(function (h) { return h[0] + h[1]; })), maxR: maxR }; };
})();
