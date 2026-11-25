/* Shared engine for the topic teaching pages (sepsis has its own file; the others use this).
   TeachPage({ host, objectives, take, plans: {5:{sec:min}, 10:{…}, 20:{…}}, sections: [...], on: {...}, after })
   Section: { id, t (title), k (kicker), type, ... }
     type 'html'   : html (string or function(S, T) returning html)
     type 'cards'  : cards [[title, clue, answer]], intro, outro
     type 'check'  : items [[title, detail]], intro, done
     type 'pearls' : items [[title, text]]
     type 'case'   : steps [{ t, s, q, o: [[text, correct(1/0), why]] }], end
     type 'quiz'   : items [[question, [options], correctIndex, why]]
   Custom sections use type 'html' with a function; buttons inside carry data-x="name" and are handled by on[name](el, S, redraw).
   S is a per-page state object; redraw(id) re-renders one section. */
(function () {
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  window.TeachPage = function (cfg) {
    var host = document.getElementById(cfg.host);
    if (!host) return;
    var base = host.getAttribute('data-base') || '', hashMode = host.hasAttribute('data-hash');
    function url(u) { if (/^https?:/.test(u)) return u; if (hashMode) { var m = /^\/([^/]+)\/(#.*)?$/.exec(u); return m ? (m[2] || '#' + m[1]) : u; } return base + u; }
    var S = { time: 10, cards: {}, check: {}, caseStep: {}, caseAns: {}, quiz: {} };
    if (cfg.state) Object.keys(cfg.state).forEach(function (k) { S[k] = cfg.state[k]; });
    var T = {
      esc: esc, url: url,
      ask: function (q, a) { return '<div class="tp-ask"><p><b>Ask:</b> ' + esc(q) + '</p><button type="button" class="tw-reveal" data-act="ans">Show answer</button><p class="tp-ans" hidden>' + esc(a) + '</p></div>'; },
      chips: function (name, list, val) { return '<div class="ab-aw">' + list.map(function (x) { var on = String(val) === String(x[0]); return '<button type="button" class="sp-chip' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-x="' + name + '" data-v="' + esc(x[0]) + '">' + esc(x[1]) + '</button>'; }).join('') + '</div>'; },
      opts: function (name, list, val, cls) { return '<div class="opts ' + (cls || 'wide') + '">' + list.map(function (x) { var on = String(val) === String(x[0]); return '<button type="button" class="opt' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-x="' + name + '" data-v="' + esc(x[0]) + '"><span class="opt-text">' + esc(x[1]) + '</span>' + (x[2] ? '<span class="opt-pts">' + esc(x[2]) + '</span>' : '') + '</button>'; }).join('') + '</div>'; },
      p: function (t) { return '<p class="tp-p">' + t + '</p>'; }
    };
    var SEC = {}; cfg.sections.forEach(function (s) { SEC[s.id] = s; });

    function body(s) {
      if (s.type === 'html') return typeof s.html === 'function' ? s.html(S, T) : s.html;
      if (s.type === 'cards') return (s.intro ? T.p(esc(s.intro)) : '') + '<div class="tp-cards">' + s.cards.map(function (c, i) {
        var on = !!(S.cards[s.id] || {})[i];
        return '<button type="button" class="tp-card' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-card="' + s.id + '" data-i="' + i + '"><b>' + esc(c[0]) + '</b>' + (on ? '<span class="tp-c1"><em>' + esc(s.l1 || 'Clues') + '</em>' + esc(c[1]) + '</span><span class="tp-c2"><em>' + esc(s.l2 || 'Do') + '</em>' + esc(c[2]) + '</span>' : '<span class="tp-flip">Tap to reveal</span>') + '</button>';
      }).join('') + '</div>' + (s.outro ? T.p(esc(s.outro)) : '');
      if (s.type === 'check') {
        var m = S.check[s.id] || {}, n = s.items.filter(function (x, i) { return m[i]; }).length, N = s.items.length;
        return (s.intro ? T.p(esc(s.intro)) : '') + '<div class="tp-six"><div class="tp-ring" aria-hidden="true"><svg viewBox="0 0 120 120"><circle class="bg" cx="60" cy="60" r="50"/><circle class="fg" cx="60" cy="60" r="50" stroke-dasharray="' + (314.16 * n / N).toFixed(1) + ' 314.16" transform="rotate(-90 60 60)"/></svg><b>' + n + '/' + N + '</b><span>done</span></div>' +
          '<ul class="tp-check">' + s.items.map(function (x, i) { var on = !!m[i]; return '<li><button type="button" class="tp-ck' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-check="' + s.id + '" data-i="' + i + '"><i aria-hidden="true"></i><span><b>' + esc(x[0]) + '</b>' + (on ? '<em>' + esc(x[1]) + '</em>' : '') + '</span></button></li>'; }).join('') + '</ul></div>' +
          (n === N && s.done ? '<p class="tp-done">' + esc(s.done) + '</p>' : '<p class="ab-note">Tap each step as the group names it.</p>');
      }
      if (s.type === 'pearls') return '<div class="tp-pearls">' + s.items.map(function (p) { return '<div class="tp-pearl"><b>' + esc(p[0]) + '</b><p>' + esc(p[1]) + '</p></div>'; }).join('') + '</div>';
      if (s.type === 'case') {
        var step = S.caseStep[s.id] || 0, ans = S.caseAns[s.id] || {}, h = '<ol class="tp-case">';
        for (var i = 0; i <= step && i < s.steps.length; i++) {
          var c = s.steps[i], a = ans[i];
          h += '<li class="tp-step"><p class="tp-st">' + esc(c.t) + '</p><p class="tp-ss">' + esc(c.s) + '</p><p class="tp-sq">' + esc(c.q) + '</p><div class="opts wide">' + c.o.map(function (o, j) {
            var cls = a == null ? '' : (o[1] ? ' right' : (a === j ? ' wrong' : ' faded'));
            return '<button type="button" class="opt tp-co' + cls + '" data-case="' + s.id + '" data-i="' + i + '" data-o="' + j + '"' + (a != null ? ' disabled' : '') + '><span class="opt-text">' + esc(o[0]) + '</span>' + (a != null && (o[1] || a === j) ? '<span class="opt-pts">' + esc(o[2]) + '</span>' : '') + '</button>';
          }).join('') + '</div></li>';
        }
        h += '</ol>';
        if (ans[step] != null && step < s.steps.length - 1) h += '<button type="button" class="reset tp-next" data-casenext="' + s.id + '">Next: ' + esc(s.steps[step + 1].t) + '</button>';
        else if (step === s.steps.length - 1 && ans[step] != null) h += '<p class="tp-done">' + esc(s.end || 'Case complete.') + '</p><button type="button" class="reset" data-casereset="' + s.id + '">Start again</button>';
        return h;
      }
      if (s.type === 'quiz') {
        var qa = S.quiz[s.id] || {}, score = 0, done = 0;
        var hq = '<ol class="tp-qz">' + s.items.map(function (q, i) {
          var a = qa[i]; if (a != null) { done++; if (a === q[2]) score++; }
          return '<li><p class="tp-sq">' + esc(q[0]) + '</p><div class="opts wide">' + q[1].map(function (o, j) {
            var cls = a == null ? '' : (j === q[2] ? ' right' : (a === j ? ' wrong' : ' faded'));
            return '<button type="button" class="opt tp-co' + cls + '" data-qz="' + s.id + '" data-i="' + i + '" data-o="' + j + '"' + (a != null ? ' disabled' : '') + '><span class="opt-text">' + esc(o) + '</span></button>';
          }).join('') + '</div>' + (a != null ? '<p class="tp-why">' + esc(q[3]) + '</p>' : '') + '</li>';
        }).join('') + '</ol>';
        return hq + '<p class="tp-qscore">' + (done ? 'Score: ' + score + ' of ' + done + (done === s.items.length ? ' <button type="button" class="reset" data-qzreset="' + s.id + '">Try again</button>' : '') : 'Answer to see the explanation.') + '</p>';
      }
      return '';
    }
    function sec(s) {
      return '<section class="card af-card tp-sec" id="tp-' + s.id + '" data-sec="' + s.id + '"><div class="tp-sh"><span class="tp-min" data-min></span><p class="tp-kick">' + esc(s.k || '') + '</p><h2>' + esc(s.t) + '</h2></div><div class="tp-body">' + body(s) + '</div><button type="button" class="tp-open" data-act="open">Show this section</button></section>';
    }
    function redraw(id) { var el = host.querySelector('#tp-' + id + ' .tp-body'); if (el) el.innerHTML = body(SEC[id]); if (cfg.after) cfg.after(S, host, id); }
    function planBar() {
      var p = cfg.plans[S.time], tot = 0, i = 0;
      var segs = cfg.sections.filter(function (s) { return p[s.id]; }).map(function (s) { tot += p[s.id]; return '<a class="tw-seg s' + (i++ % 5) + '" href="#tp-' + s.id + '" style="flex:' + p[s.id] + '"><b>' + esc(s.t) + '</b><span>' + p[s.id] + ' min</span></a>'; }).join('');
      return '<div class="tp-planhd"><div class="ab-sec"><h4>Time you have</h4><div class="opts tw-times">' + [5, 10, 20].map(function (t) { var on = S.time === t; return '<button type="button" class="opt' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-time="' + t + '"><span class="opt-text">' + t + ' minutes</span></button>'; }).join('') + '</div></div>' +
        '<p class="ab-note">Sections in the plan are open; the rest are folded but still there if the discussion goes that way.</p></div><div class="tw-plan">' + segs + '</div><p class="tw-tot">' + tot + ' minutes in total · then the take-home message</p>';
    }
    function applyPlan() {
      var p = cfg.plans[S.time];
      host.querySelectorAll('.tp-sec').forEach(function (s) { var id = s.getAttribute('data-sec'), m = p[id]; s.classList.toggle('out', !m); s.classList.remove('force'); s.querySelector('[data-min]').textContent = m ? m + ' min' : 'Not in this plan'; });
      host.querySelector('#tp-plan').innerHTML = planBar();
    }
    host.innerHTML = '<section class="card af-card tp-plan" id="tp-plan"></section>' +
      '<section class="card af-card tp-obj"><h2>By the end, students can</h2><ol>' + cfg.objectives.map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('') + '</ol></section>' +
      cfg.sections.map(sec).join('') +
      '<div class="tw-take"><span>Take-home message</span><p>' + esc(cfg.take) + '</p></div>' +
      (cfg.see ? '<p class="cov-chips tw-see">More on this site: ' + cfg.see.map(function (l) { var ext = /^https?:/.test(l[1]); return '<a class="sp-chip" href="' + esc(url(l[1])) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + esc(l[0]) + '</a>'; }).join('') + '</p>' : '');
    applyPlan();
    if (cfg.after) cfg.after(S, host, null);

    host.addEventListener('click', function (e) {
      var b = e.target.closest('button, a.tw-seg, [data-x]'); if (!b || !host.contains(b)) return;
      if (b.hasAttribute('data-time')) { S.time = +b.getAttribute('data-time'); applyPlan(); return; }
      var act = b.getAttribute('data-act');
      if (act === 'open') { b.closest('.tp-sec').classList.add('force'); return; }
      if (b.classList.contains('tw-seg')) { var t = host.querySelector(b.getAttribute('href')); if (t) { e.preventDefault(); t.classList.add('force'); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); } return; }
      if (act === 'ans') { var a = b.nextElementSibling, open = a.hidden; a.hidden = !open; b.textContent = open ? 'Hide answer' : 'Show answer'; return; }
      var id;
      if ((id = b.getAttribute('data-card'))) { var c = S.cards[id] = S.cards[id] || {}, i = +b.getAttribute('data-i'); c[i] = !c[i]; redraw(id); return; }
      if ((id = b.getAttribute('data-check'))) { var k = S.check[id] = S.check[id] || {}, j = +b.getAttribute('data-i'); k[j] = !k[j]; redraw(id); return; }
      if ((id = b.getAttribute('data-case'))) { (S.caseAns[id] = S.caseAns[id] || {})[+b.getAttribute('data-i')] = +b.getAttribute('data-o'); redraw(id); return; }
      if ((id = b.getAttribute('data-casenext'))) { S.caseStep[id] = (S.caseStep[id] || 0) + 1; redraw(id); var st = host.querySelectorAll('#tp-' + id + ' .tp-step'); st[st.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return; }
      if ((id = b.getAttribute('data-casereset'))) { S.caseStep[id] = 0; S.caseAns[id] = {}; redraw(id); return; }
      if ((id = b.getAttribute('data-qz'))) { (S.quiz[id] = S.quiz[id] || {})[+b.getAttribute('data-i')] = +b.getAttribute('data-o'); redraw(id); return; }
      if ((id = b.getAttribute('data-qzreset'))) { S.quiz[id] = {}; redraw(id); return; }
      var x = b.getAttribute('data-x');
      if (x && cfg.on && cfg.on[x]) cfg.on[x](b, S, redraw, T);
    });
    host.addEventListener('keydown', function (e) { var g = e.target.closest('g[data-x]'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); g.dispatchEvent(new MouseEvent('click', { bubbles: true })); } });
    host.addEventListener('input', function (e) { var x = e.target.getAttribute('data-xin'); if (x && cfg.on && cfg.on[x]) cfg.on[x](e.target, S, redraw, T); });
  };
})();
