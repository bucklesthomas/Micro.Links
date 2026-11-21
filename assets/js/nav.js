/* Site-wide navigation helpers:
   - section jump bars (.jump) stick under the top bar while scrolling, as one sideways-scrolling row, and highlight the section in view
   - a "Back to top" button on long pages
   - faster page changes: prefetch internal pages when a link is hovered or touched (where speculation rules are not supported) */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function topbarH() { var t = document.querySelector('.topbar'); return t ? t.getBoundingClientRect().height : 0; }

  // ── Jump bars ─────────────────────────────────────────────
  // When a page's section bar scrolls out of view, a compact copy appears under the top bar (one sideways-scrolling row).
  var bars = [];
  function visible(el) { return !!(el && el.offsetParent !== null); }
  function setVars() {
    var tb = topbarH(), f = document.querySelector('.jump-float.show');
    root.style.setProperty('--tb-h', tb + 'px');
    root.style.scrollPaddingTop = (tb + (f ? f.getBoundingClientRect().height : 0) + 12) + 'px';
  }
  function bind() {
    bars.forEach(function (b) { if (b.io) b.io.disconnect(); if (b.so) b.so.disconnect(); if (b.fl && b.fl.parentNode) b.fl.parentNode.removeChild(b.fl); });
    bars = [];
    Array.prototype.forEach.call(document.querySelectorAll('nav.jump'), function (nav) {
      if (nav.classList.contains('jump-float') || !visible(nav) || nav.querySelectorAll('a[href^="#"]').length < 3) return;
      var fl = nav.cloneNode(true);
      fl.className = 'jump jump-float'; fl.removeAttribute('id');
      fl.setAttribute('aria-label', (nav.getAttribute('aria-label') || 'Sections') + ' (quick jump)');
      document.body.appendChild(fl);
      var b = { nav: nav, fl: fl };
      if ('IntersectionObserver' in window) {
        b.so = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            var gone = !e.isIntersecting && e.boundingClientRect.bottom <= topbarH() + 2;
            fl.classList.toggle('show', gone);
            setVars();
          });
        }, { rootMargin: '-' + Math.round(topbarH()) + 'px 0px 0px 0px', threshold: 0 });
        b.so.observe(nav);
        var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
        var flinks = Array.prototype.slice.call(fl.querySelectorAll('a[href^="#"]'));
        var targets = links.map(function (a) { return document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1))); });
        var mark = function () {
          var line = topbarH() + (fl.classList.contains('show') ? fl.getBoundingClientRect().height : 0) + 40, cur = -1;
          targets.forEach(function (t, i) { if (t && visible(t) && t.getBoundingClientRect().top <= line) cur = i; });
          links.forEach(function (a, i) { a.classList.toggle('here', i === cur); });
          flinks.forEach(function (a, i) { a.classList.toggle('here', i === cur); });
          var on = flinks[cur];
          if (on && fl.classList.contains('show')) {
            var nl = fl.getBoundingClientRect(), r = on.getBoundingClientRect();
            if (r.left < nl.left + 8 || r.right > nl.right - 8) fl.scrollTo({ left: fl.scrollLeft + r.left - nl.left - 24, behavior: reduce ? 'auto' : 'smooth' });
          }
        };
        b.io = new IntersectionObserver(mark, { rootMargin: '0px 0px -55% 0px', threshold: [0, 1] });
        targets.forEach(function (t) { if (t) b.io.observe(t); });
        b.mark = mark;
      }
      bars.push(b);
    });
    setVars();
  }
  // Jump links scroll within the page (no hash change, so the hosted copy's page router is not disturbed)
  document.addEventListener('click', function (e) {
    var a = e.target.closest('nav.jump a[href^="#"]');
    if (!a) return;
    var t = document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
    if (!t) return;
    e.preventDefault();
    setVars();
    var y = t.getBoundingClientRect().top + window.scrollY - (parseFloat(root.style.scrollPaddingTop) || 80);
    window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  });

  // ── Back to top ───────────────────────────────────────────
  var btt = document.createElement('button');
  btt.type = 'button'; btt.className = 'to-top'; btt.hidden = true;
  btt.setAttribute('aria-label', 'Back to top');
  btt.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 15V5M5 9.5L10 4.5l5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Top</span>';
  btt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  document.body.appendChild(btt);
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      bars.forEach(function (bb) { if (bb.mark) bb.mark(); });
      var show = window.scrollY > window.innerHeight * 1.5;
      if (btt.hidden === show) btt.hidden = !show;
      var bar = document.querySelector('.rf-bar');
      btt.classList.toggle('above-bar', !!(bar && visible(bar) && getComputedStyle(bar).display !== 'none'));
    });
  }, { passive: true });

  // ── Faster page changes: prefetch on hover or touch ───────
  var canSpec = window.HTMLScriptElement && HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules');
  if (!canSpec && location.protocol === 'https:') {
    var done = {};
    var pre = function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.origin !== location.origin) return;
      var u = a.href.split('#')[0];
      if (!u || u === location.href.split('#')[0] || done[u]) return;
      done[u] = true;
      var l = document.createElement('link'); l.rel = 'prefetch'; l.href = u; document.head.appendChild(l);
    };
    document.addEventListener('mouseover', pre, { passive: true });
    document.addEventListener('touchstart', pre, { passive: true });
  }

  // Rebind when pages draw their own jump bars (antibiotics, scores) or the hosted copy switches view
  var pend = null;
  new MutationObserver(function (ms) {
    if (!ms.some(function (m) { return Array.prototype.some.call(m.addedNodes, function (n) { return n.nodeType === 1 && !n.classList.contains('jump-float') && (n.matches('nav.jump') || (n.querySelector && n.querySelector('nav.jump:not(.jump-float)'))); }); })) return;
    clearTimeout(pend); pend = setTimeout(bind, 60);
  }).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('hashchange', function () { setTimeout(bind, 80); });
  window.addEventListener('load', function () { setTimeout(bind, 50); });
  window.addEventListener('resize', function () { clearTimeout(pend); pend = setTimeout(bind, 120); });
  bind();
})();
