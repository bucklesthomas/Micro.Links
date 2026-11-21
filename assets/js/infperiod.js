/* Infectious period and contact-window calculator (UK).
   Sources: UKHSA national measles guidelines and Green Book measles chapter; UKHSA guidelines on post-exposure prophylaxis for
   varicella or shingles (updated 2026); Green Book varicella chapter; UKHSA national pertussis guidance; UKHSA TB contact tracing
   guidance (October 2026); UKHSA meningococcal, iGAS and hepatitis A public health guidance (as on the contact prophylaxis page);
   CDC mumps clinical overview (infectious period) with UKHSA exclusion advice. */
(function () {
  var host = document.getElementById('infp');
  if (!host) return;
  var DAY = 864e5;
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function parse(v) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || ''); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null; }
  function add(t, n) { return t + n * DAY; }
  function addMonths(t, n) { var d = new Date(t); d.setUTCMonth(d.getUTCMonth() + n); return d.getTime(); }
  function fmt(t) { var d = new Date(t); return WD[d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' + MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
  function today() { var d = new Date(); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()); }
  function iso(t) { var d = new Date(t); return d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + d.getUTCDate()).slice(-2); }
  function rel(t) {
    var n = Math.round((t - today()) / DAY);
    if (n === 0) return 'today';
    if (n === 1) return 'tomorrow';
    if (n === -1) return 'yesterday';
    return n > 0 ? 'in ' + n + ' days' : n * -1 + ' days ago';
  }

  /* Each disease: anchor date label, optional second date, and compute(a, b, opt, e) returning rows.
     a = anchor date, b = second date (or null), e = contact's first exposure date (or null). */
  var D = {
    measles: {
      n: 'Measles', a: 'Rash onset', link: ['/contact-prophylaxis/', 'Measles PEP guide'],
      calc: function (a, b, o, e) {
        var r = { inf: [add(a, -4), add(a, 4)], infTxt: '4 days before to 4 full days after rash onset (rash day = day 0)',
          excl: 'Exclude from work, school or nursery until 4 full days after rash onset: back on ' + fmt(add(a, 5)) + '.',
          contacts: 'Close contact (household, face to face, or more than 15 minutes in a small room) between ' + fmt(add(a, -4)) + ' and ' + fmt(add(a, 4)) + '. Any contact counts for immunosuppressed people.',
          inc: [7, 21] };
        var E = e != null ? e : add(a, -4);
        r.pep = [
          { t: add(E, 3), n: 'MMR vaccine (susceptible contacts aged 6 months or over, not pregnant or immunosuppressed)', w: 'within 72 hours of first exposure' },
          { t: add(E, 6), n: 'HNIG (or IVIG if immunosuppressed) for vulnerable susceptible contacts: infants under 1, pregnant, immunosuppressed', w: 'within 6 days of first exposure' }
        ];
        r.E = E; r.Edef = e == null;
        r.notes = ['Report vulnerable contacts (immunosuppressed, pregnant, infants under 1) to the health protection team urgently.', 'Watch contacts for symptoms from day 7 to day 21 after exposure.'];
        return r;
      }
    },
    chickenpox: {
      n: 'Chickenpox', a: 'Rash onset', opt: 'Case is immunosuppressed', link: ['/contact-prophylaxis/', 'Chickenpox PEP guide'],
      calc: function (a, b, o, e) {
        var r = { inf: [add(a, -1), o ? null : add(a, 5)], infTxt: o ? '24 hours before rash onset until all lesions have crusted over (may be prolonged when immunosuppressed)' : '24 hours before rash onset to 5 days after the rash first appears',
          excl: 'Exclude until all lesions have crusted over (usually about 5 days after rash onset: ' + fmt(add(a, 5)) + ').',
          contacts: 'Significant exposure: household (continuous), face to face, or 15 minutes or more in the same small room, from ' + fmt(add(a, -1)) + (o ? ' until all lesions crust.' : ' to ' + fmt(add(a, 5)) + '.'),
          inc: [10, 21] };
        var E = e != null ? e : a;
        r.pep = [
          { t0: add(E, 7), t: add(E, 14), n: 'Oral aciclovir 800 mg 4 times daily or valaciclovir 1 g 3 times daily for 7 days (susceptible high-risk contacts: immunosuppressed, pregnant, neonates)', w: 'start on day 7 after first exposure; can start up to day 14' },
          { t: add(E, 10), n: 'IVIG 0.2 g/kg if antivirals cannot be taken', w: 'ideally within 7 days, no later than 10 days' }
        ];
        r.E = E; r.Edef = e == null;
        r.notes = ['For household contacts, day 0 is the rash onset date of the index case.', 'Check VZV IgG urgently in high-risk contacts without a clear history (result usually within 24 hours).'];
        return r;
      }
    },
    shingles: {
      n: 'Shingles', a: 'Rash onset', link: ['/contact-prophylaxis/', 'Chickenpox PEP guide'],
      calc: function (a, b, o, e) {
        var E = e != null ? e : a;
        return { inf: [a, null], infTxt: 'From rash onset until all lesions have crusted over (localised or disseminated)',
          excl: 'Localised shingles that can be covered: no exclusion. Disseminated, exposed or immunosuppressed: isolate until all lesions crust.',
          contacts: 'Significant exposure to exposed or disseminated shingles (or localised shingles in an immunosuppressed case) from ' + fmt(a) + ' until lesions crust.',
          inc: [10, 21], E: E, Edef: e == null,
          pep: [
            { t0: add(E, 7), t: add(E, 14), n: 'Oral aciclovir or valaciclovir for 7 days for susceptible high-risk contacts', w: 'start on day 7 after first exposure; can start up to day 14' },
            { t: add(E, 10), n: 'IVIG 0.2 g/kg if antivirals cannot be taken', w: 'ideally within 7 days, no later than 10 days' }
          ], notes: ['Contacts who develop chickenpox do so 10–21 days after exposure.'] };
      }
    },
    mumps: {
      n: 'Mumps', a: 'Onset of parotid swelling',
      calc: function (a) {
        return { inf: [add(a, -2), add(a, 5)], infTxt: '2 days before to 5 days after onset of parotid swelling (virus can be shed from 7 days before to 9 days after)',
          excl: 'Exclude for 5 days after onset of swelling: back on ' + fmt(add(a, 6)) + '.',
          contacts: 'Close contact between ' + fmt(add(a, -2)) + ' and ' + fmt(add(a, 5)) + '.', inc: [12, 25], pep: [],
          notes: ['No effective post-exposure prophylaxis: offer MMR to unvaccinated contacts for future protection.', 'Watch contacts for symptoms 12–25 days after exposure.'] };
      }
    },
    pertussis: {
      n: 'Pertussis', a: 'Cough onset', b: 'Antibiotics started (optional)', link: ['/contact-prophylaxis/', 'Pertussis PEP guide'],
      calc: function (a, b) {
        var end = add(a, 21), why = '21 days after cough onset (untreated)';
        if (b != null && add(b, 2) < end) { end = add(b, 2); why = '48 hours after starting an appropriate antibiotic'; }
        return { inf: [null, end], infTxt: 'From the catarrhal (coryzal) phase, before the cough, until ' + why,
          excl: 'Exclude until ' + why + ': back on ' + fmt(add(end, 1)) + '.',
          contacts: 'Close contact (household, or overnight in the same room) while infectious.',
          inc: [7, 21],
          pep: [{ t: add(a, 21), n: 'Macrolide chemoprophylaxis for all close contacts when one is in a priority group', w: 'within 21 days of the case’s cough onset (UKHSA may shorten this during high activity)' },
            { t: add(a, 21), n: 'Antibiotic treatment of the case (if a priority-group contact)', w: 'within 21 days of cough onset' }],
          notes: ['Priority groups: unprotected infants under 1; pregnant from 32 weeks; healthcare or childcare workers and household members of these groups who have not had a pertussis vaccine in 5 years.'] };
      }
    },
    tb: {
      n: 'Pulmonary or laryngeal TB', a: 'Earliest respiratory symptom or abnormal finding (e.g. CXR)', b: 'Effective treatment started (optional)', link: ['/tb/', 'TB guide'],
      calc: function (a, b) {
        return { inf: [addMonths(a, -3), b != null ? add(b, 14) : null], infTxt: 'Look-back from 3 months before the earliest of respiratory symptom onset or the first finding consistent with TB, until 2 weeks of effective treatment (drug-sensitive TB)',
          excl: b != null ? 'Conventionally non-infectious after 2 weeks of effective treatment: ' + fmt(add(b, 14)) + ' (risk assess before discharge: adherence, extent of disease, microbiology, drug resistance).' : 'Infectious until 2 weeks of effective treatment (drug-sensitive TB).',
          contacts: 'Household and close contacts first, whatever the contact time. Wider rounds: a guide of 8 hours or more cumulative contact while infectious (4 hours or more for vulnerable contacts).',
          inc: null, pep: [],
          notes: ['Contacts: IGRA (and CXR or symptom review as per the TB service). Children under 5 and immunosuppressed contacts need prompt assessment.', 'Drug-resistant TB: infectious period and contact management need specialist risk assessment.'] };
      }
    },
    mening: {
      n: 'Invasive meningococcal disease', a: 'Illness onset', b: 'Antibiotics started (optional)', link: ['/contact-prophylaxis/', 'Meningococcal prophylaxis guide'],
      calc: function (a, b) {
        return { inf: [add(a, -7), b != null ? add(b, 1) : null], infTxt: 'Contacts in the 7 days before onset; the case is no longer infectious after 24 hours of appropriate antibiotics (ceftriaxone or ciprofloxacin)',
          excl: b != null ? 'Droplet precautions until 24 hours of antibiotics: ' + fmt(add(b, 1)) + '.' : 'Droplet precautions until 24 hours of appropriate antibiotics.',
          contacts: 'Prolonged close contact in the 7 days before onset (from ' + fmt(add(a, -7)) + '): household, shared dormitory or kitchen, sexual partners. Healthcare workers only with direct exposure of mouth or nose to secretions before 24 hours of antibiotics.',
          inc: [2, 10],
          pep: [{ t: add(a, 28), n: 'Single-dose ciprofloxacin (or rifampicin, ceftriaxone, azithromycin) for close contacts', w: 'ideally within 24 hours of diagnosis; up to 4 weeks after onset' }],
          notes: ['Offer MenACWY or MenB vaccine to contacts once the group is known, as advised by the health protection team.'] };
      }
    },
    igas: {
      n: 'Invasive group A streptococcus', a: 'Diagnosis of the case', b: 'Antibiotics started (optional)', link: ['/contact-prophylaxis/', 'iGAS prophylaxis guide'],
      calc: function (a, b) {
        return { inf: [add(a, -7), b != null ? add(b, 1) : null], infTxt: 'Contacts in the 7 days before diagnosis; the case is not infectious after 24 hours of appropriate antibiotics',
          excl: b != null ? 'Isolate until 24 hours of antibiotics: ' + fmt(add(b, 1)) + '.' : 'Isolate until 24 hours of appropriate antibiotics.',
          contacts: 'Prolonged household-type close contact in the 7 days before diagnosis (from ' + fmt(add(a, -7)) + '). High risk: 75 or over, pregnant from 37 weeks, within 28 days of birth, neonates, active chickenpox.',
          inc: [1, 3],
          pep: [{ t: add(a, 10), n: 'Antibiotic prophylaxis for high-risk close contacts (or the whole household when two or more cases)', w: 'within 24 hours, no later than 10 days after the index diagnosis' }],
          notes: ['Warn-and-inform advice to all close contacts; watch for symptoms for 30 days (until ' + fmt(add(a, 30)) + ').'] };
      }
    },
    hepa: {
      n: 'Hepatitis A', a: 'Symptom onset', b: 'Jaundice onset (optional)', link: ['/contact-prophylaxis/', 'Hepatitis A PEP guide'],
      calc: function (a, b, o, e) {
        var j = b != null ? b : a;
        var E = e != null ? e : add(a, -14);
        return { inf: [add(a, -14), add(j, 7)], infTxt: '2 weeks before symptom onset to 1 week after jaundice onset' + (b == null ? ' (symptom onset used: no jaundice date entered)' : ''),
          excl: 'Exclude from work or school until 7 days after jaundice onset: back on ' + fmt(add(j, 8)) + '. Food handlers: discuss with environmental health.',
          contacts: 'Household, sexual, nappy-changing or toileting contact, or shared injecting equipment, from ' + fmt(add(a, -14)) + ' to ' + fmt(add(j, 7)) + '.',
          inc: [15, 50], E: E, Edef: e == null,
          pep: [{ t: add(E, 14), n: 'Hepatitis A vaccine (plus HNIG for those aged 60 or over, liver disease, or immunosuppression)', w: 'within 14 days of exposure' }],
          notes: ['Later presenters: vaccine may still help household contacts within 8 weeks of the index case’s jaundice (see the hepatitis A guide).'] };
      }
    }
  };
  var ORDER = ['measles', 'chickenpox', 'shingles', 'mumps', 'pertussis', 'tb', 'mening', 'igas', 'hepa'];
  var st = { d: null, a: '', b: '', e: '', o: false };

  function base() {
    return (document.querySelector('script[data-base]') || { getAttribute: function () { return ''; } }).getAttribute('data-base').replace(/\/$/, '');
  }
  function href(u) { return document.getElementById('view-links') ? '#' + u.replace(/^\/|\/$/g, '') : base() + u; }

  function form() {
    var h = '<div class="ab-sec"><h4>Infection</h4><div class="ab-aw">' + ORDER.map(function (k) {
      return '<button type="button" class="sp-chip' + (st.d === k ? ' on' : '') + '" data-d="' + k + '">' + esc(D[k].n) + '</button>';
    }).join('') + '</div></div>';
    if (st.d) {
      var x = D[st.d];
      h += '<div class="ab-sec"><h4>Dates</h4><div class="bp-inputs">' +
        '<label>' + esc(x.a) + '<input type="date" id="ip-a" value="' + esc(st.a) + '"></label>' +
        (x.b ? '<label>' + esc(x.b) + '<input type="date" id="ip-b" value="' + esc(st.b) + '"></label>' : '') +
        (['measles', 'chickenpox', 'shingles', 'hepa'].indexOf(st.d) >= 0 ? '<label>Contact’s first exposure (optional)<input type="date" id="ip-e" value="' + esc(st.e) + '"></label>' : '') +
        '</div>' + (x.opt ? '<label class="opt toggle ip-opt"><input type="checkbox" id="ip-o"' + (st.o ? ' checked' : '') + '><span class="tick" aria-hidden="true"></span><span class="opt-text">' + esc(x.opt) + '</span></label>' : '') + '</div>';
    }
    h += '<div id="ip-out" class="bp-result" aria-live="polite"></div>';
    host.innerHTML = h;
    calc();
  }

  function row(label, val, sub) { return '<tr><th>' + esc(label) + '</th><td>' + val + (sub ? '<small class="ip-rel">' + esc(sub) + '</small>' : '') + '</td></tr>'; }

  function calc() {
    var out = host.querySelector('#ip-out');
    if (!st.d) { out.innerHTML = '<p class="ab-note">Pick an infection, then enter the dates.</p>'; return; }
    var x = D[st.d], a = parse(st.a), b = parse(st.b), e = parse(st.e);
    if (a == null) { out.innerHTML = '<p class="ab-note">Enter the date: ' + esc(x.a.charAt(0).toLowerCase() + x.a.slice(1)) + '.</p>'; return; }
    var r = x.calc(a, b, st.o, e), h = '', t = [], now = today();
    var s0 = r.inf[0], s1 = r.inf[1];
    var live = (s0 == null || s0 <= now) && (s1 == null || now <= s1);
    h += '<div class="vc-big ' + (live ? 'red' : 'green') + '"><span>Infectious period</span><b class="ip-range">' + (s0 != null ? esc(fmt(s0)) : 'Before cough') + ' → ' + (s1 != null ? esc(fmt(s1)) : 'ongoing') + '</b><small>' + esc(r.infTxt) + (live ? ' · infectious today' : (s1 != null && now > s1 ? ' · no longer infectious' : '')) + '</small></div>';
    h += '<table class="ab-tbl vc-tbl ip-tbl">';
    h += row('Exclusion or isolation', esc(r.excl));
    h += row('Contacts who count', esc(r.contacts));
    if (r.inc) {
      var E = r.E != null ? r.E : null;
      h += row('Incubation period', r.inc[0] + '–' + r.inc[1] + ' days' + (E != null ? ': if first exposed ' + esc(fmt(E)) + ', watch from ' + esc(fmt(add(E, r.inc[0]))) + ' to ' + esc(fmt(add(E, r.inc[1]))) : ''));
    }
    h += '</table>';
    t.push(x.n + ': ' + x.a.charAt(0).toLowerCase() + x.a.slice(1) + ' ' + fmt(a) + (b != null && x.b ? '; ' + x.b.replace(' (optional)', '').toLowerCase() + ' ' + fmt(b) : '') + '.');
    t.push('Infectious period: ' + (s0 != null ? fmt(s0) : 'from catarrhal phase') + ' to ' + (s1 != null ? fmt(s1) : 'not yet determined') + ' (' + r.infTxt + ').');
    t.push('Exclusion: ' + r.excl);
    t.push('Contacts: ' + r.contacts);
    if (r.pep && r.pep.length) {
      h += '<h4 class="vc-h">Post-exposure deadlines' + (r.E != null ? (r.Edef ? ' <small>(assuming first exposure ' + esc(fmt(r.E)) + '; enter the contact’s date to change)</small>' : ' <small>(first exposure ' + esc(fmt(r.E)) + ')</small>') : '') + '</h4><ul class="ip-pep">';
      t.push('Post-exposure deadlines' + (r.E != null ? ' (first exposure ' + fmt(r.E) + ')' : '') + ':');
      r.pep.forEach(function (p) {
        var gone = p.t < now, soon = !gone && p.t - now <= 2 * DAY;
        var when = p.t0 != null ? fmt(p.t0) + ' to ' + fmt(p.t) : 'by ' + fmt(p.t);
        h += '<li class="' + (gone ? 'ip-gone' : soon ? 'ip-soon' : 'ip-open') + '"><b>' + esc(when) + '</b> <span class="ip-rel">' + esc(gone ? 'window closed ' + rel(p.t) : 'closes ' + rel(p.t)) + '</span><span>' + esc(p.n) + ' — ' + esc(p.w) + '</span></li>';
        t.push('- ' + p.n + ': ' + when + ' (' + p.w + ')' + (gone ? ' - window closed' : ''));
      });
      h += '</ul>';
    }
    if (r.notes && r.notes.length) h += '<ul class="vc-notes ip-notes">' + r.notes.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>';
    if (x.link) h += '<div class="rf-linkrow ie-links"><a href="' + esc(href(x.link[0])) + '">' + esc(x.link[1]) + '</a></div>';
    t.push('', 'Dates from Micro.Links infectious period calculator; confirm with the health protection team.');
    h += '<div class="ie-actions"><button type="button" class="reset" data-copy>Copy for Epic</button></div>';
    out.innerHTML = h;
    out.setAttribute('data-text', t.join('\n'));
  }

  function copy(btn) {
    var text = host.querySelector('#ip-out').getAttribute('data-text') || '';
    function done(ok) { var o = btn.textContent; btn.textContent = ok ? 'Copied' : 'Select and copy below'; setTimeout(function () { btn.textContent = o; }, 1800); }
    function fallback() { var ta = document.createElement('textarea'); ta.value = text; ta.className = 'mc-copy-box'; btn.parentNode.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} if (ok) ta.parentNode.removeChild(ta); done(ok); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback); else fallback();
  }

  host.addEventListener('input', function (ev) {
    var id = ev.target.id;
    if (id === 'ip-a') st.a = ev.target.value; else if (id === 'ip-b') st.b = ev.target.value; else if (id === 'ip-e') st.e = ev.target.value; else if (id === 'ip-o') st.o = ev.target.checked; else return;
    calc();
  });
  host.addEventListener('change', function (ev) { if (ev.target.id === 'ip-o') { st.o = ev.target.checked; calc(); } });
  host.addEventListener('click', function (ev) {
    var d = ev.target.closest('[data-d]');
    if (d) { st.d = d.getAttribute('data-d'); st.b = ''; st.e = ''; st.o = false; if (!st.a) st.a = iso(today()); form(); return; }
    var c = ev.target.closest('[data-copy]');
    if (c) copy(c);
  });
  form();
  window.INF_PERIOD = { D: D, parse: parse, fmt: fmt };
})();
