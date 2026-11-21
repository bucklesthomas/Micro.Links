/* Asplenia and splenic dysfunction: vaccines, prophylaxis and advice.
   Sources: Green Book chapter 7 (practical schedule for asplenia or splenic dysfunction) and chapter 25 (pneumococcal,
   October 2026: PCV20 replaces PPV23; PCV20 every 5 years in asplenia); PHA Northern Ireland splenectomy factsheet for
   health professionals (antibiotic doses, duration, standby antibiotics, travel, bites, ticks). */
(function () {
  var host = document.getElementById('aspl');
  if (!host) return;
  var DAY = 864e5, MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var st = { age: 'adult', sit: 'elective', date: '' };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function parse(v) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || ''); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null; }
  function fmt(t) { var d = new Date(t); return d.getUTCDate() + ' ' + MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
  var AGES = [['adult', '10 years or older (including adults)'], ['child', '2 to under 10 years'], ['infant', 'Under 2 years']];
  var SITS = [['elective', 'Elective splenectomy planned'], ['done', 'Splenectomy already done (or emergency)'], ['func', 'Functional hyposplenism (e.g. sickle cell disease)'], ['chemo', 'Splenic irradiation or chemotherapy planned']];
  var PEN = { adult: 'Phenoxymethylpenicillin 250 mg twice daily', child: 'Phenoxymethylpenicillin 250 mg twice daily (over 5 years) or 125 mg twice daily (1–5 years)', infant: 'Phenoxymethylpenicillin 62.5 mg twice daily (under 1 year) or 125 mg twice daily (1–5 years)' };
  var ERY = { adult: 'Erythromycin 500 mg twice daily', child: 'Erythromycin 250 mg twice daily (2–8 years) or 500 mg (over 8 years)', infant: 'Erythromycin 125 mg twice daily (1 month to 2 years)' };

  function chips(key, arr) {
    return '<div class="ab-aw">' + arr.map(function (x) { return '<button type="button" class="sp-chip' + (st[key] === x[0] ? ' on' : '') + '" data-' + key + '="' + x[0] + '">' + esc(x[1]) + '</button>'; }).join('') + '</div>';
  }
  function form() {
    var dl = st.sit === 'elective' ? 'Date of planned splenectomy (optional)' : st.sit === 'done' ? 'Date of splenectomy (optional)' : st.sit === 'chemo' ? 'Date treatment starts (optional)' : '';
    host.innerHTML = '<div class="ab-sec"><h4>Age</h4>' + chips('age', AGES) + '</div><div class="ab-sec"><h4>Situation</h4>' + chips('sit', SITS) + '</div>' +
      (dl ? '<div class="ab-sec"><div class="bp-inputs"><label>' + esc(dl) + '<input type="date" id="as-d" value="' + esc(st.date) + '"></label></div></div>' : '') +
      '<div id="as-out" class="bp-result" aria-live="polite"></div>';
    calc();
  }

  function calc() {
    var out = host.querySelector('#as-out'), d = parse(st.date), h = '', t = [];
    // Timing
    var when;
    if (st.sit === 'elective') when = d != null ? 'Vaccinate ideally 4–6 weeks before surgery (from ' + fmt(d - 42 * DAY) + ') and no later than 2 weeks before (' + fmt(d - 14 * DAY) + '). Never delay surgery for vaccines: if missed, give them from 2 weeks after the operation.' : 'Vaccinate ideally 4–6 weeks before surgery, and at least 2 weeks before. Never delay surgery for vaccines: if missed, give them from 2 weeks after the operation.';
    else if (st.sit === 'done') when = d != null ? 'Vaccinate from 2 weeks after the operation: from ' + fmt(d + 14 * DAY) + '.' : 'Vaccinate from 2 weeks after the operation.';
    else if (st.sit === 'chemo') when = d != null ? 'Vaccinate ideally 4–6 weeks before (from ' + fmt(d - 42 * DAY) + '), at least 2 weeks before (' + fmt(d - 14 * DAY) + '). If not possible, wait until at least 3 months after treatment ends.' : 'Vaccinate ideally 4–6 weeks (at least 2 weeks) before treatment; otherwise from 3 months after it ends.';
    else when = 'Vaccinate at diagnosis.';
    var vac;
    if (st.age === 'adult') vac = ['PCV20: one dose, then every 5 years', 'MenACWY conjugate vaccine: one dose', 'MenB: two doses, 4 weeks apart', 'Influenza: every year', 'COVID-19: as per the current programme'];
    else if (st.age === 'child') vac = ['Routine childhood schedule completed', 'PCV20: one dose, then every 5 years', 'MenACWY conjugate vaccine: one dose', 'MenB: two doses 8 weeks apart if the routine 2+1 MenB course was not completed', 'Influenza: every year (from 6 months)'];
    else vac = ['Routine schedule plus extra MenACWY and PCV20 doses, by age at diagnosis: follow the tables in Green Book chapters 7 and 25 (paediatrics or the immunisation team)', 'PCV20 again at 2 years, then every 5 years', 'Influenza: every year from 6 months'];
    h += '<h4 class="vc-h">Vaccines</h4><p class="as-when">' + esc(when) + '</p><ul class="is-list">' + vac.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
    h += '<p class="ab-note">An extra Hib vaccine is no longer recommended for asplenia (2020). PCV20 replaced PPV23 for risk groups in 2026. Use a conjugate MenACWY vaccine.</p>';

    var pro = [PEN[st.age] + ' (penicillin allergy: ' + ERY[st.age].charAt(0).toLowerCase() + ERY[st.age].slice(1) + ').',
      'Lifelong prophylaxis is recommended. Risk is highest in children under 16, adults over 50, and in the first 2 years after splenectomy.',
      'Always lifelong after invasive pneumococcal disease, with splenic malignancy or irradiation, or ongoing graft-versus-host disease.',
      'After splenectomy for trauma: at least 2 years; stopping may then be considered after counselling.' + (st.sit === 'func' ? ' Sickle cell disease: stopping may be considered over 5 years old if immunised and no severe pneumococcal infection, after discussion with their consultant.' : ''),
      'Standby course at home (amoxicillin, or clarithromycin if allergic, or per local protocol): start at the first sign of infection and seek urgent medical help.'];
    h += '<h4 class="vc-h">Antibiotic prophylaxis</h4><ul class="is-list">' + pro.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
    var adv = ['Fever or feeling unwell: urgent medical review; overwhelming infection can develop within hours.',
      'Animal bites, especially dogs (Capnocytophaga): prompt medical review and 5 days of co-amoxiclav (erythromycin if penicillin allergic).',
      'Travel: take the standby course; malaria prophylaxis and bite avoidance for malaria areas (severe malaria risk is higher).',
      'Ticks: avoid bites and check skin; Lyme disease and babesiosis can start as a flu-like illness.',
      'Give a patient leaflet and alert card where available, and record asplenia on the GP and hospital record.'];
    h += '<h4 class="vc-h">Advice for the patient</h4><ul class="is-list">' + adv.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
    h += '<div class="ie-actions"><button type="button" class="reset" data-copy>Copy for Epic</button></div>';
    var sitTxt = SITS.filter(function (x) { return x[0] === st.sit; })[0][1] + (d != null ? ' (' + fmt(d) + ')' : '');
    t.push('Asplenia / hyposplenism plan: ' + sitTxt + '; age ' + AGES.filter(function (x) { return x[0] === st.age; })[0][1] + '.', '', 'Vaccines: ' + when);
    vac.forEach(function (x) { t.push('- ' + x); });
    t.push('', 'Prophylaxis:'); pro.forEach(function (x) { t.push('- ' + x); });
    t.push('', 'Advice given:'); adv.forEach(function (x) { t.push('- ' + x); });
    t.push('', 'Per Green Book chapters 7 and 25 (Micro.Links asplenia page).');
    out.innerHTML = h;
    out.setAttribute('data-text', t.join('\n'));
  }

  function copy(btn) {
    var text = host.querySelector('#as-out').getAttribute('data-text') || '';
    function done(ok) { var o = btn.textContent; btn.textContent = ok ? 'Copied' : 'Select and copy below'; setTimeout(function () { btn.textContent = o; }, 1800); }
    function fallback() { var ta = document.createElement('textarea'); ta.value = text; ta.className = 'mc-copy-box'; btn.parentNode.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} if (ok) ta.parentNode.removeChild(ta); done(ok); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback); else fallback();
  }
  host.addEventListener('click', function (e) {
    var a = e.target.closest('[data-age]'), s = e.target.closest('[data-sit]'), c = e.target.closest('[data-copy]');
    if (a) { st.age = a.getAttribute('data-age'); form(); } else if (s) { st.sit = s.getAttribute('data-sit'); st.date = ''; form(); } else if (c) copy(c);
  });
  host.addEventListener('input', function (e) { if (e.target.id === 'as-d') { st.date = e.target.value; calc(); } });
  form();
})();
