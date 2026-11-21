/* Shared engine for structured note templates (ID referral call, blood culture report).
   A page calls NoteForm({ host, prefix, key, title, sections, ... }); each section lists fields:
     text | area | num | one | chips (none: exclusive option, neg: label for negatives, ins: id of a textarea to add a line to)
     obs | labs | abx | links | sir (S / I / R per antibiotic)
   Field options: out (prefix in the note; default "Label: " for text, chips and num, nothing for area), group (join on one line),
   head (start a new heading in the note), mine (your own name: remembered on this device, put in the note header).
   No patient identifiers are asked for. Entries are kept in this browser tab only (sessionStorage) until cleared or the tab closes. */
(function () {
  var ME = 'mc-note-me', ME_OLD = 'mc-referral-me';
  var LABS = [
    ['wcc', 'WCC', 4, 11], ['neut', 'Neut', 2, 7.5], ['lymph', 'Lymph', 1, 4], ['hb', 'Hb', 115, 170], ['plt', 'Plt', 150, 400],
    ['crp', 'CRP', 0, 5], ['pct', 'PCT', 0, 0.5], ['na', 'Na', 133, 146], ['k', 'K', 3.5, 5.3], ['urea', 'Urea', 2.5, 7.8],
    ['creat', 'Creat', 45, 110], ['egfr', 'eGFR', 60, 999], ['bili', 'Bili', 0, 21], ['alt', 'ALT', 0, 40], ['alp', 'ALP', 30, 130],
    ['alb', 'Alb', 35, 50], ['lact', 'Lactate', 0, 2], ['inr', 'INR', 0.8, 1.2]
  ];
  var OBS = [['temp', 'Temp', '°C', 36, 38], ['hr', 'HR', '/min', 50, 100], ['bp', 'BP', 'mmHg'], ['rr', 'RR', '/min', 12, 20], ['sats', 'SpO2', 'e.g. 94% on 2 L'], ['gcs', 'GCS', '', 15, 15], ['news', 'NEWS2', '', 0, 4]];
  var ABX = ['Amoxicillin', 'Benzylpenicillin', 'Flucloxacillin', 'Co-amoxiclav', 'Piperacillin–tazobactam', 'Temocillin', 'Cefalexin', 'Cefazolin', 'Cefuroxime', 'Ceftriaxone', 'Ceftazidime', 'Ceftazidime–avibactam', 'Meropenem', 'Ertapenem', 'Gentamicin', 'Amikacin', 'Vancomycin', 'Teicoplanin', 'Daptomycin', 'Linezolid', 'Clarithromycin', 'Azithromycin', 'Doxycycline', 'Clindamycin', 'Ciprofloxacin', 'Levofloxacin', 'Co-trimoxazole', 'Metronidazole', 'Nitrofurantoin', 'Rifampicin', 'Aciclovir', 'Fluconazole', 'Micafungin', 'Liposomal amphotericin', 'Artesunate'];
  var ID_RE = /\b\d{3}[ -]?\d{3}[ -]?\d{4}\b|\b(nhs ?(no|number)|mrn|dob|d\.o\.b|date of birth|hospital (no|number)|hosp no|lab (no|number))\b/i;
  var ID_RE2 = /\b[A-Z]{1,3}\d{6,10}\b/;
  var SIR = { S: 'Susceptible', I: 'Susceptible, increased exposure', R: 'Resistant' };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function lc(x) { return /^[A-Z][A-Z0-9]/.test(x) ? x : x.charAt(0).toLowerCase() + x.slice(1); }

  window.NoteForm = function (cfg) {
    var host = document.getElementById(cfg.host);
    if (!host) return;
    var P = cfg.prefix, S = cfg.sections;
    var st = { v: {}, abx: [] };
    try { var sv = JSON.parse(sessionStorage.getItem(cfg.key) || 'null'); if (sv && sv.v) st = sv; } catch (e) {}
    if (!st.abx) st.abx = [];
    try { var me = localStorage.getItem(ME) || localStorage.getItem(ME_OLD); if (me) st.v.me = me; } catch (e) {}
    function save() { try { sessionStorage.setItem(cfg.key, JSON.stringify(st)); } catch (e) {} }
    function val(id) { var x = st.v[id]; return x == null ? '' : x; }
    function arr(id) { return Array.isArray(st.v[id]) ? st.v[id] : []; }
    function obj(id) { return st.v[id] && typeof st.v[id] === 'object' && !Array.isArray(st.v[id]) ? st.v[id] : {}; }
    function fieldDef(id) { for (var i = 0; i < S.length; i++) for (var j = 0; j < S[i].f.length; j++) if (S[i].f[j].id === id) return S[i].f[j]; return {}; }

    function chipBtn(kind, f, o, cls, pressed, label) {
      return '<button type="button" class="sp-chip rf-chip' + cls + '" aria-pressed="' + pressed + '"' + (label ? ' aria-label="' + esc(label) + '"' : '') +
        ' data-' + kind + '="' + f.id + '" data-o="' + esc(o) + '">' + esc(o) + '</button>';
    }
    function field(f) {
      if (f.k === 'text') return '<label class="rf-f rf-wide"><span>' + esc(f.l) + '</span><input data-v="' + f.id + '" value="' + esc(val(f.id)) + '" placeholder="' + esc(f.ph || '') + '"' + (f.list ? ' list="' + P + '-' + f.id + '-list"' : '') + ' autocomplete="off"></label>' +
        (f.list ? '<datalist id="' + P + '-' + f.id + '-list">' + f.list.map(function (x) { return '<option value="' + esc(x) + '">'; }).join('') + '</datalist>' : '');
      if (f.k === 'area') return '<label class="rf-f rf-wide"><span>' + esc(f.l) + '</span><textarea data-v="' + f.id + '" rows="' + (f.rows || 3) + '" placeholder="' + esc(f.ph || '') + '">' + esc(val(f.id)) + '</textarea></label>';
      if (f.k === 'num') return '<label class="rf-f rf-num"><span>' + esc(f.l) + '</span><span class="rf-u"><input data-v="' + f.id + '" inputmode="decimal" value="' + esc(val(f.id)) + '" autocomplete="off"><em>' + esc(f.u || '') + '</em></span></label>';
      if (f.k === 'chips' || f.k === 'one') {
        var sel = f.k === 'one' ? [val(f.id)] : arr(f.id), no = arr(f.id + '_no');
        return '<div class="rf-f rf-wide"><span>' + esc(f.l) + (f.neg ? '<small class="rf-tip">Tap once for yes, twice for no (red), three times to clear</small>' : '') + '</span><div class="ab-aw">' + f.o.map(function (o) {
          var on = sel.indexOf(o) !== -1, isNo = no.indexOf(o) !== -1;
          return chipBtn(f.k, f, o, (on ? ' on' : '') + (isNo ? ' no' : ''), on ? 'true' : isNo ? 'mixed' : 'false', isNo ? 'No ' + o : '');
        }).join('') + '</div></div>';
      }
      if (f.k === 'sir') {
        var m = obj(f.id);
        return '<div class="rf-f rf-wide"><span>' + esc(f.l) + '<small class="rf-tip">Tap once for S (green), twice for I (amber), three times for R (red), four times to clear</small></span><div class="ab-aw">' + f.o.map(function (o) {
          var s = m[o] || '';
          return chipBtn('sir', f, o, s ? ' s' + s : '', s ? 'true' : 'false', s ? o + ': ' + SIR[s] : '').replace('>' + esc(o) + '<', '>' + (s ? '<b class="rf-sirk">' + s + '</b> ' : '') + esc(o) + '<');
        }).join('') + '</div></div>';
      }
      if (f.k === 'obs') return '<div class="rf-grid">' + OBS.map(function (o) {
        return '<label class="rf-f rf-lab"><span>' + o[1] + '</span><input data-v="o_' + o[0] + '" data-lo="' + (o[3] != null ? o[3] : '') + '" data-hi="' + (o[4] != null ? o[4] : '') + '" ' + (o[0] === 'bp' || o[0] === 'sats' ? '' : 'inputmode="decimal" ') + 'value="' + esc(val('o_' + o[0])) + '" placeholder="' + esc(o[2]) + '" autocomplete="off"></label>';
      }).join('') + '</div>';
      if (f.k === 'labs') return '<div class="rf-grid">' + LABS.map(function (o) {
        return '<label class="rf-f rf-lab"><span>' + o[1] + '</span><input data-v="l_' + o[0] + '" data-lo="' + o[2] + '" data-hi="' + o[3] + '" inputmode="decimal" value="' + esc(val('l_' + o[0])) + '" autocomplete="off"></label>';
      }).join('') + '</div>';
      if (f.k === 'links') return '<div class="rf-wide rf-links"><span class="rf-lbl">' + esc(f.l) + '</span><div class="rf-linkrow">' + f.o.map(function (l) {
        return '<a href="' + l[1] + '" target="_blank" rel="noopener">' + esc(l[0]) + ' <span class="ext" aria-hidden="true">↗</span></a>';
      }).join('') + '</div></div>';
      if (f.k === 'abx') return '<div class="rf-wide rf-abx"><span class="rf-lbl">' + esc(f.l || 'Antimicrobials') + '</span>' + st.abx.map(function (a, i) {
        return '<div class="rf-abxrow"><input data-abx="' + i + '" data-k="d" list="' + P + '-abxlist" value="' + esc(a.d) + '" placeholder="Drug" autocomplete="off">' +
          '<input data-abx="' + i + '" data-k="dose" value="' + esc(a.dose) + '" placeholder="Dose, route, frequency" autocomplete="off">' +
          '<input data-abx="' + i + '" data-k="start" value="' + esc(a.start) + '" placeholder="Started (e.g. day 3)" autocomplete="off">' +
          '<button type="button" class="reset" data-delabx="' + i + '" aria-label="Remove">Remove</button></div>';
      }).join('') + '<button type="button" class="reset" data-addabx>Add antimicrobial</button>' +
        '<datalist id="' + P + '-abxlist">' + ABX.map(function (a) { return '<option value="' + esc(a) + '">'; }).join('') + '</datalist></div>';
      return '';
    }

    function hasVal(f) {
      if (f.mine || f.k === 'links') return false;
      if (f.k === 'obs') return OBS.some(function (o) { return val('o_' + o[0]) !== ''; });
      if (f.k === 'labs') return LABS.some(function (o) { return val('l_' + o[0]) !== ''; });
      if (f.k === 'abx') return st.abx.some(function (a) { return a.d; });
      if (f.k === 'chips') return arr(f.id).length > 0 || arr(f.id + '_no').length > 0;
      if (f.k === 'sir') return Object.keys(obj(f.id)).length > 0;
      return val(f.id) !== '';
    }
    function filled(s) { return s.f.some(hasVal); }

    function draw() {
      var h = '<nav class="rf-nav" aria-label="Sections">' + S.map(function (s, i) {
        return '<a href="#' + P + '-' + s.id + '" class="sp-chip' + (filled(s) ? ' done' : '') + '" data-sec="' + s.id + '">' + (i + 1) + '. ' + esc(s.t) + '</a>';
      }).join('') + '</nav><div class="rf-layout"><div class="rf-form">';
      S.forEach(function (s, i) {
        h += '<section class="card rf-sec" id="' + P + '-' + s.id + '"><h2><span class="rf-n">' + (i + 1) + '</span>' + esc(s.t) + '</h2>' +
          (s.ask ? '<p class="rf-ask"><b>' + esc(cfg.askLabel || 'Ask about:') + '</b> ' + s.ask.map(esc).join(' · ') + '</p>' : '') + '<div class="rf-fields">' + s.f.map(field).join('') + '</div></section>';
      });
      h += '</div><aside class="rf-side"><div class="card rf-prev" id="' + P + '-prev"><div class="rf-prevhead"><h2>Note preview</h2><span class="rf-count"></span></div>' +
        '<pre class="rf-note"></pre><p class="rf-warn" hidden></p><div class="ie-actions"><button type="button" class="reset rf-copy" data-copy>Copy for Epic</button>' +
        '<button type="button" class="reset" data-clear>Clear form</button></div>' +
        '<p class="rf-priv">No patient names, dates of birth, hospital or lab numbers. Entries stay in this browser tab only, and are removed when you clear the form or close the tab. Your own name is remembered on this device.</p></div></aside></div>' +
        '<div class="rf-bar"><a href="#' + P + '-prev" class="reset" data-goprev>Preview</a><button type="button" class="reset rf-copy" data-copy>Copy for Epic</button></div>';
      host.innerHTML = h;
      Array.prototype.forEach.call(host.querySelectorAll('[data-lo]'), flag);
      note();
    }

    function flag(inp) {
      var lo = parseFloat(inp.getAttribute('data-lo')), hi = parseFloat(inp.getAttribute('data-hi')), x = parseFloat(String(inp.value).replace(',', '.'));
      inp.classList.remove('lo', 'hi');
      if (isFinite(x) && inp.value.trim() !== '') { if (isFinite(lo) && x < lo) inp.classList.add('lo'); else if (isFinite(hi) && x > hi) inp.classList.add('hi'); }
    }
    function stamp() {
      var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
      return p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    }

    // Note lines for one field
    function lines(f) {
      var out = f.out != null ? f.out : (f.k === 'area' ? '' : f.l + ': ');
      if (f.k === 'text' || f.k === 'area') return val(f.id) ? [out + val(f.id)] : [];
      if (f.k === 'num') return val(f.id) ? [out + val(f.id) + (f.u ? ' ' + f.u : '')] : [];
      if (f.k === 'one') return val(f.id) ? [out + val(f.id)] : [];
      if (f.k === 'chips') {
        var yes = arr(f.id);
        if (f.ins) yes = yes.filter(function (x) { return String(val(f.ins)).indexOf(x) === -1; });
        var r = [];
        if (yes.length) r.push(out + yes.join(', '));
        var no = arr(f.id + '_no');
        if (no.length) r.push(f.neg + ': ' + no.map(lc).join(', '));
        return r;
      }
      if (f.k === 'sir') {
        var m = obj(f.id), r2 = [];
        ['S', 'I', 'R'].forEach(function (k) {
          var ds = f.o.filter(function (o) { return m[o] === k; });
          if (ds.length) r2.push(SIR[k] + ': ' + ds.map(lc).join(', '));
        });
        return r2;
      }
      if (f.k === 'obs') { var ob = OBS.map(function (o) { var x = val('o_' + o[0]); return x !== '' ? o[1] + ' ' + x + (o[0] === 'temp' ? '°C' : '') : ''; }).filter(Boolean).join(', '); return ob ? [ob] : []; }
      if (f.k === 'labs') { var lb = LABS.map(function (o) { var x = val('l_' + o[0]); return x !== '' ? o[1] + ' ' + x : ''; }).filter(Boolean).join(', '); return lb ? [lb] : []; }
      if (f.k === 'abx') {
        var rows = st.abx.filter(function (a) { return a.d; }).map(function (a) { return '- ' + [a.d, a.dose, a.start && 'started ' + a.start].filter(Boolean).join(', '); });
        return rows.length && f.out ? [f.out].concat(rows) : rows;
      }
      return [];
    }
    function gval(f) { var v = val(f.id); return v === '' ? '' : (f.k === 'num' && f.u ? v + ' ' + f.u : v); }

    function build() {
      var L = [cfg.title, 'Date and time: ' + stamp()];
      S.forEach(function (s) { s.f.forEach(function (f) { if (f.mine && val(f.id)) L.push((f.out || 'By: ') + val(f.id)); }); });
      S.forEach(function (s) {
        var head = s.note || s.t.toUpperCase(), buf = [];
        function flush() { if (buf.length) { L.push(''); L.push(head); buf.forEach(function (x) { L.push(x); }); } buf = []; }
        for (var i = 0; i < s.f.length; i++) {
          var f = s.f[i];
          if (f.mine) continue;
          if (f.head) { flush(); head = f.head; }
          if (f.group) {
            var g = [];
            while (i < s.f.length && s.f[i].group === f.group) { var x = gval(s.f[i]); if (x) g.push(x); i++; }
            i--;
            if (g.length) buf.push((f.gout || '') + g.join(', '));
            continue;
          }
          buf = buf.concat(lines(f));
        }
        flush();
      });
      return L.join('\n');
    }

    var armed = false;
    function note() {
      var t = build(), pre = host.querySelector('.rf-note');
      if (pre) pre.textContent = t;
      var c = host.querySelector('.rf-count');
      if (c) c.textContent = S.filter(filled).length + ' of ' + S.length + ' sections';
      Array.prototype.forEach.call(host.querySelectorAll('.rf-nav [data-sec]'), function (a) {
        var s = S.filter(function (x) { return x.id === a.getAttribute('data-sec'); })[0]; a.classList.toggle('done', filled(s));
      });
      var w = host.querySelector('.rf-warn'), bad = ID_RE.test(t) || ID_RE2.test(t);
      if (w) { w.hidden = !bad; w.textContent = bad ? 'This looks like it may contain an identifier (an NHS, hospital or lab number, or a date of birth). Remove it before copying.' : ''; }
      armed = false;
      Array.prototype.forEach.call(host.querySelectorAll('.rf-copy'), function (b) { b.textContent = 'Copy for Epic'; });
    }

    function copy(btn) {
      var text = build();
      if ((ID_RE.test(text) || ID_RE2.test(text)) && !armed) { armed = true; btn.textContent = 'Possible identifier: tap again to copy'; return; }
      function done(ok) { btn.textContent = ok ? 'Copied' : 'Select the text in the preview'; setTimeout(function () { btn.textContent = 'Copy for Epic'; }, 1800); armed = false; }
      function fallback() { var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); done(ok); }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback); else fallback();
    }

    // Tapping an imaging test (for example) adds "Test: " as a line in a findings box; untapping removes it if still empty
    function insertLine(target, label, adding) {
      var ta = host.querySelector('[data-v="' + target + '"]'); if (!ta) return;
      var ls = String(ta.value).split('\n'), prefix = label + ':';
      var idx = -1;
      ls.forEach(function (l, i) { if (idx === -1 && l.trim().indexOf(prefix) === 0) idx = i; });
      if (adding) {
        if (idx === -1) { while (ls.length && ls[ls.length - 1].trim() === '') ls.pop(); ls.push(prefix + ' '); idx = ls.length - 1; }
        ta.value = ls.join('\n');
        var pos = ls.slice(0, idx + 1).join('\n').length;
        ta.focus(); ta.setSelectionRange(pos, pos);
      } else if (idx !== -1 && ls[idx].trim() === prefix) { ls.splice(idx, 1); ta.value = ls.join('\n'); }
      st.v[target] = ta.value;
    }
    function setChipStates(id) {
      var a = arr(id), n = arr(id + '_no');
      Array.prototype.forEach.call(host.querySelectorAll('[data-chips="' + id + '"]'), function (x) {
        var o = x.getAttribute('data-o'), on = a.indexOf(o) !== -1, isNo = n.indexOf(o) !== -1;
        x.classList.toggle('on', on); x.classList.toggle('no', isNo);
        x.setAttribute('aria-pressed', on ? 'true' : isNo ? 'mixed' : 'false');
        if (isNo) x.setAttribute('aria-label', 'No ' + o); else x.removeAttribute('aria-label');
      });
    }

    host.addEventListener('input', function (e) {
      var el = e.target;
      if (el.hasAttribute('data-v')) {
        var id = el.getAttribute('data-v');
        st.v[id] = el.value;
        if (el.hasAttribute('data-lo')) flag(el);
        if (fieldDef(id).mine) { try { localStorage.setItem(ME, el.value); } catch (err) {} }
      } else if (el.hasAttribute('data-abx')) st.abx[+el.getAttribute('data-abx')][el.getAttribute('data-k')] = el.value;
      else return;
      save(); note();
    });

    var clearArmed = false;
    host.addEventListener('click', function (e) {
      var b = e.target.closest('button, a'); if (!b || !host.contains(b)) return;
      if (b.hasAttribute('data-chips')) {
        var id = b.getAttribute('data-chips'), o = b.getAttribute('data-o'), fd = fieldDef(id), a = arr(id).slice(), i = a.indexOf(o);
        if (fd.neg) {
          var n = arr(id + '_no').slice(), ni = n.indexOf(o);
          if (i !== -1) { a.splice(i, 1); n.push(o); } else if (ni !== -1) n.splice(ni, 1); else a.push(o);
          st.v[id + '_no'] = n;
        } else if (i === -1) {
          if (fd.none) a = o === fd.none ? [] : a.filter(function (x) { return x !== fd.none; });
          a.push(o);
        } else a.splice(i, 1);
        st.v[id] = a; setChipStates(id);
        if (fd.ins) insertLine(fd.ins, o, i === -1);
        save(); note();
      } else if (b.hasAttribute('data-one')) {
        var id1 = b.getAttribute('data-one'), o1 = b.getAttribute('data-o');
        st.v[id1] = st.v[id1] === o1 ? '' : o1;
        Array.prototype.forEach.call(host.querySelectorAll('[data-one="' + id1 + '"]'), function (x) { var on = st.v[id1] === x.getAttribute('data-o'); x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); });
        save(); note();
      } else if (b.hasAttribute('data-sir')) {
        var id2 = b.getAttribute('data-sir'), o2 = b.getAttribute('data-o'), m = obj(id2), order = ['', 'S', 'I', 'R'];
        var nx = order[(order.indexOf(m[o2] || '') + 1) % 4];
        if (nx) m[o2] = nx; else delete m[o2];
        st.v[id2] = m;
        b.className = 'sp-chip rf-chip' + (nx ? ' s' + nx : '');
        b.setAttribute('aria-pressed', nx ? 'true' : 'false');
        if (nx) b.setAttribute('aria-label', o2 + ': ' + SIR[nx]); else b.removeAttribute('aria-label');
        b.innerHTML = (nx ? '<b class="rf-sirk">' + nx + '</b> ' : '') + esc(o2);
        save(); note();
      } else if (b.hasAttribute('data-addabx')) { st.abx.push({ d: '', dose: '', start: '' }); save(); redraw(); var ins = host.querySelectorAll('[data-k="d"]'); if (ins.length) ins[ins.length - 1].focus(); }
      else if (b.hasAttribute('data-delabx')) { st.abx.splice(+b.getAttribute('data-delabx'), 1); save(); redraw(); }
      else if (b.hasAttribute('data-copy')) copy(b);
      else if (b.hasAttribute('data-clear')) {
        if (!clearArmed) { clearArmed = true; b.textContent = 'Tap again to clear everything'; setTimeout(function () { clearArmed = false; b.textContent = 'Clear form'; }, 3000); return; }
        clearArmed = false; st = { v: { me: st.v.me || '' }, abx: [] }; try { sessionStorage.removeItem(cfg.key); } catch (err) {} draw();
        window.scrollTo(0, host.getBoundingClientRect().top + window.scrollY - 80);
      } else if (b.hasAttribute('data-sec') || b.hasAttribute('data-goprev')) {
        e.preventDefault();
        var tgt = document.getElementById(b.hasAttribute('data-goprev') ? P + '-prev' : P + '-' + b.getAttribute('data-sec'));
        if (tgt) window.scrollTo({ top: tgt.getBoundingClientRect().top + window.scrollY - 76, behavior: 'smooth' });
      }
    });
    function redraw() { var y = window.scrollY; draw(); window.scrollTo(0, y); }
    draw();
  };
})();
