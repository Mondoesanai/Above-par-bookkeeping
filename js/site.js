/* =====================================================================
   ABOVE PAR BOOKKEEPING — site.js  (no dependencies)
   ===================================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // When Debbie's real scheduler is ready, swap the custom booker (initBooker)
  // for a Calendly inline embed pointed at this URL.
  var CALENDLY = 'https://calendly.com/debbie-aboveparbookkeeping/30min';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- header scroll state ---------- */
  var header = $('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-solid', window.scrollY > 24); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  var toggle = $('.nav-toggle'), menu = $('.mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) { document.body.classList.remove('menu-open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { document.body.classList.remove('menu-open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealSel = '.rv, .gridreveal, .hero__stage';
  if (reduce || !('IntersectionObserver' in window)) {
    $$(revealSel).forEach(function (el) { el.classList.add('in', 'is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in', 'is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    $$(revealSel).forEach(function (el) { io.observe(el); });
  }

  /* ---------- count up ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var dur = 1400, t0 = null;
    if (reduce) { el.textContent = target.toFixed(dec); return; }
    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = (target * (1 - Math.pow(1 - p, 3))).toFixed(dec);
      if (p < 1) requestAnimationFrame(frame); else el.textContent = target.toFixed(dec);
    }
    requestAnimationFrame(frame);
  }
  var counters = $$('[data-count]');
  if (counters.length) {
    if (!('IntersectionObserver' in window)) counters.forEach(countUp);
    else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); } });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ---------- FAQ accordion ---------- */
  $$('.faq__item').forEach(function (item) {
    var btn = item.querySelector('.faq__q'), panel = item.querySelector('.faq__a'), inner = panel.firstElementChild;
    btn.addEventListener('click', function () {
      var open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.style.height = open ? inner.offsetHeight + 'px' : '0px';
    });
  });
  window.addEventListener('resize', function () {
    $$('.faq__item.open .faq__a').forEach(function (p) { p.style.height = p.firstElementChild.offsetHeight + 'px'; });
  });

  /* ---------- year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- hero photo 3D parallax tilt ---------- */
  var stage = $('.hero__stage'), stageInner = $('.hero__stage__inner');
  if (stage && stageInner && !reduce && window.matchMedia('(min-width:1001px) and (pointer:fine)').matches) {
    var baseY = -8, baseX = 4, raf = null, tx = baseY, ty = baseX;
    function apply() {
      stageInner.style.transform = 'rotateY(' + tx.toFixed(2) + 'deg) rotateX(' + ty.toFixed(2) + 'deg)';
      raf = null;
    }
    stage.addEventListener('mousemove', function (e) {
      var r = stage.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;   // -0.5 .. 0.5
      var py = (e.clientY - r.top) / r.height - 0.5;
      tx = baseY + px * 12;   // rotateY
      ty = baseX - py * 10;   // rotateX
      if (!raf) raf = requestAnimationFrame(apply);
    });
    stage.addEventListener('mouseleave', function () {
      stageInner.style.transition = 'transform .6s var(--ease)';
      tx = baseY; ty = baseX;
      if (!raf) raf = requestAnimationFrame(apply);
      setTimeout(function () { stageInner.style.transition = ''; }, 650);
    });
    stage.addEventListener('mouseenter', function () { stageInner.style.transition = 'transform .12s linear'; });
  }

  /* =========================================================
     BOOKER — custom calendar / scheduler UI (simulated)
     ========================================================= */
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CHECK = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10.5l4 4 8-9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var SERVICES = ['Free consultation', 'Monthly bookkeeping', 'Payroll', 'Catch-up / cleanup', 'Budget & forecasting', 'Not sure yet'];
  var SLOTS = ['9:00 AM', '9:30 AM', '10:00 AM', '11:00 AM', '1:00 PM', '1:30 PM', '2:30 PM', '3:30 PM'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var bookerState = { service: 'Free consultation', date: null, time: null, name: '', email: '', note: '' };
  var bookerEl = null;

  function initBooker(root) {
    bookerEl = root;
    var view = new Date(); view.setDate(1);
    var today = new Date(); today.setHours(0, 0, 0, 0);
    if (today.getDate() > 20) view.setMonth(view.getMonth() + 1); // roll to next month when this one is almost done

    root.querySelector('.booker__grid').innerHTML =
      '<aside class="booker__aside">' +
        '<p class="kicker kicker--plain" style="color:var(--gold)">Schedule</p>' +
        '<h3 class="h3">Book your free consultation</h3>' +
        '<p>Thirty minutes with Debbie &mdash; go over your business, your books, and what a clean monthly rhythm would look like. No pressure, no obligation.</p>' +
        '<ul class="booker__expect">' +
          '<li>A quick look at where your books stand today</li>' +
          '<li>What clean monthly bookkeeping would cover</li>' +
          '<li>A straight answer on cost &mdash; no hard sell</li>' +
        '</ul>' +
        '<figure class="booker__photo"><img src="images/photos/small-business.jpg" alt=""></figure>' +
        '<div class="booker__summary" data-summary>Choose a service, day, and time.</div>' +
      '</aside>' +
      '<div class="booker__main">' +
        '<div class="booker__step">' +
          '<p class="booker__label"><span class="num">1</span> What&rsquo;s this about?</p>' +
          '<div class="booker__services" data-services></div>' +
        '</div>' +
        '<div class="booker__step">' +
          '<p class="booker__label"><span class="num">2</span> Pick a day</p>' +
          '<div class="cal" data-cal></div>' +
        '</div>' +
        '<div class="booker__step">' +
          '<p class="booker__label"><span class="num">3</span> Pick a time <span style="font-weight:500;letter-spacing:.02em;text-transform:none;color:var(--muted-2)" data-tz>(Central Time)</span></p>' +
          '<div class="booker__times" data-times data-empty></div>' +
        '</div>' +
        '<div class="booker__confirm">' +
          '<button type="button" class="btn" data-confirm data-track="booking" disabled>Confirm booking' + ARROW + '</button>' +
          '<span class="booker__hint">You&rsquo;ll get an email to finalise. We never share your details.</span>' +
        '</div>' +
      '</div>' +
      '<div class="booker__done">' +
        '<span class="tick">' + CHECK + '</span>' +
        '<h3>Your consultation is requested</h3>' +
        '<p class="recap" data-recap></p>' +
        '<p>Debbie will confirm by email within one business day and send a calendar invite. Talk soon.</p>' +
        '<button type="button" class="link-more" data-again>Book another time</button>' +
      '</div>';

    var servicesWrap = root.querySelector('[data-services]');
    var calWrap = root.querySelector('[data-cal]');
    var timesWrap = root.querySelector('[data-times]');
    var confirmBtn = root.querySelector('[data-confirm]');
    var summaryEl = root.querySelector('[data-summary]');

    servicesWrap.innerHTML = SERVICES.map(function (s) {
      return '<button type="button" class="chip' + (s === bookerState.service ? ' is-sel' : '') + '" data-svc="' + s + '"><span>' + s + '</span></button>';
    }).join('');
    servicesWrap.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      bookerState.service = b.getAttribute('data-svc');
      $$('.chip', servicesWrap).forEach(function (c) { c.classList.toggle('is-sel', c === b); });
      syncSummary();
    });

    function renderCal() {
      var y = view.getFullYear(), m = view.getMonth();
      var first = new Date(y, m, 1).getDay();
      var days = new Date(y, m + 1, 0).getDate();
      var prevDisabled = (y === today.getFullYear() && m <= today.getMonth()) || y < today.getFullYear();
      var maxMonth = new Date(); maxMonth.setMonth(maxMonth.getMonth() + 3);
      var nextDisabled = (y > maxMonth.getFullYear()) || (y === maxMonth.getFullYear() && m >= maxMonth.getMonth());
      var cells = '';
      for (var i = 0; i < first; i++) cells += '<button class="is-empty" tabindex="-1" aria-hidden="true"></button>';
      for (var d = 1; d <= days; d++) {
        var date = new Date(y, m, d);
        var dow = date.getDay();
        var past = date < today;
        var weekend = dow === 0 || dow === 6;
        var disabled = past || weekend;
        var sel = bookerState.date && bookerState.date.getTime() === date.getTime();
        var isToday = date.getTime() === today.getTime();
        cells += '<button type="button" data-d="' + d + '"' + (disabled ? ' disabled' : '') +
          (sel ? ' class="is-sel"' : (isToday ? ' class="is-today"' : '')) + '>' + d + '</button>';
      }
      calWrap.innerHTML =
        '<div class="cal__head"><b>' + MONTHS[m] + ' ' + y + '</b><div class="cal__nav">' +
          '<button type="button" data-nav="-1"' + (prevDisabled ? ' disabled' : '') + ' aria-label="Previous month"><svg viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
          '<button type="button" data-nav="1"' + (nextDisabled ? ' disabled' : '') + ' aria-label="Next month"><svg viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
        '</div></div>' +
        '<div class="cal__dow"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div>' +
        '<div class="cal__days">' + cells + '</div>';
    }

    calWrap.addEventListener('click', function (e) {
      var nav = e.target.closest('[data-nav]');
      if (nav) { view.setMonth(view.getMonth() + parseInt(nav.getAttribute('data-nav'), 10)); renderCal(); return; }
      var day = e.target.closest('[data-d]');
      if (!day || day.disabled) return;
      bookerState.date = new Date(view.getFullYear(), view.getMonth(), parseInt(day.getAttribute('data-d'), 10));
      bookerState.time = null;
      renderCal();
      renderTimes();
      syncSummary();
    });

    function renderTimes() {
      if (!bookerState.date) { timesWrap.innerHTML = ''; timesWrap.setAttribute('data-empty', ''); return; }
      timesWrap.removeAttribute('data-empty');
      // pseudo-random but stable subset per date so it feels "live"
      var seed = bookerState.date.getDate() + bookerState.date.getMonth();
      timesWrap.innerHTML = SLOTS.filter(function (_, i) { return (seed + i) % 3 !== 0; }).map(function (t) {
        return '<button type="button" class="chip' + (bookerState.time === t ? ' is-sel' : '') + '" data-t="' + t + '"><span>' + t + '</span></button>';
      }).join('');
    }
    timesWrap.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      bookerState.time = b.getAttribute('data-t');
      $$('.chip', timesWrap).forEach(function (c) { c.classList.toggle('is-sel', c === b); });
      syncSummary();
    });

    function fmtDate(d) {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate();
    }
    function syncSummary() {
      var ok = bookerState.date && bookerState.time;
      confirmBtn.disabled = !ok;
      var parts = ['<b>' + bookerState.service + '</b>'];
      if (bookerState.date) parts.push(fmtDate(bookerState.date));
      if (bookerState.time) parts.push(bookerState.time + ' CT');
      summaryEl.innerHTML = parts.join('<br>');
    }

    confirmBtn.addEventListener('click', function () {
      if (confirmBtn.disabled) return;
      root.classList.add('is-done');
      var recap = root.querySelector('[data-recap]');
      recap.innerHTML = '<b>' + bookerState.service + '</b> &nbsp;&middot;&nbsp; ' +
        fmtDate(bookerState.date) + ' &nbsp;&middot;&nbsp; ' + bookerState.time + ' Central' +
        (bookerState.name ? ' &nbsp;&middot;&nbsp; ' + bookerState.name : '');
      root.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    });
    root.querySelector('[data-again]').addEventListener('click', function () {
      root.classList.remove('is-done');
      bookerState.date = null; bookerState.time = null;
      renderCal(); renderTimes(); syncSummary();
      root.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    });

    renderCal(); renderTimes(); syncSummary();
  }

  function openBooker(prefill) {
    prefill = prefill || {};
    if (prefill.service && SERVICES.indexOf(prefill.service) > -1) bookerState.service = prefill.service;
    else if (prefill.service) bookerState.service = 'Not sure yet';
    if (prefill.name) bookerState.name = prefill.name;
    if (prefill.email) bookerState.email = prefill.email;
    if (prefill.note) bookerState.note = prefill.note;
    var target = document.getElementById('book');
    if (target) {
      if (bookerEl) {
        $$('.booker__services .chip', bookerEl).forEach(function (c) {
          c.classList.toggle('is-sel', c.getAttribute('data-svc') === bookerState.service);
        });
        var s = bookerEl.querySelector('[data-summary]');
        if (s && !bookerEl.classList.contains('is-done')) s.innerHTML = '<b>' + bookerState.service + '</b><br>Pick a day and time.';
      }
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    } else {
      try {
        sessionStorage.setItem('apb_book', JSON.stringify({
          service: bookerState.service, name: bookerState.name, email: bookerState.email, note: bookerState.note
        }));
      } catch (e) { /* ignore */ }
      window.location.href = 'contact.html#book';
    }
  }

  var bk = $('[data-booker]');
  if (bk) {
    try {
      var carried = sessionStorage.getItem('apb_book');
      if (carried) { var c = JSON.parse(carried); sessionStorage.removeItem('apb_book');
        if (c.service) bookerState.service = SERVICES.indexOf(c.service) > -1 ? c.service : 'Not sure yet';
        bookerState.name = c.name || ''; bookerState.email = c.email || ''; bookerState.note = c.note || '';
      }
    } catch (e) { /* ignore */ }
    initBooker(bk);
  }

  // any [data-book] link opens the booker (or navigates to it)
  $$('[data-book]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      openBooker({ service: a.getAttribute('data-service') || null });
    });
  });

  /* =========================================================
     QUIZ — "Are your books losing you money?"  (no pricing)
     ========================================================= */
  var QUIZ = [
    { q: 'When did you last reconcile every bank & card account?', hint: 'Matching your books to the actual statements.',
      opts: [['This month', 0], ['A few months ago', 2], ['Not sure / over a year', 3], ['We don’t do that', 3]] },
    { q: 'Do you know your net profit for last month right now?', hint: 'Without opening a spreadsheet or calling anyone.',
      opts: [['Yes, to the dollar', 0], ['Roughly', 1], ['No idea', 3]] },
    { q: 'How far behind are your books today?', hint: 'Transactions entered and categorized.',
      opts: [['Current', 0], ['1–2 months', 2], ['3+ months / a year', 3]] },
    { q: 'Are invoices going out and getting paid on time?', hint: 'Or is money sitting in accounts receivable?',
      opts: [['Yes, tracked closely', 0], ['Mostly', 1], ['We chase them / not sure', 3], ['We don’t invoice', 0]] },
    { q: 'Who handles the books right now?', hint: '',
      opts: [['A dedicated bookkeeper', 0], ['Me, between everything else', 2], ['My spouse / an assistant', 2], ['Honestly, nobody', 3]] },
    { q: 'At tax time, how painful is handing off to your CPA?', hint: '',
      opts: [['Smooth — books are ready', 0], ['A scramble', 2], ['We file late / on extension', 3]] }
  ];

  var SPARK = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 1l1.8 5.2L17 8l-5.2 1.8L10 15l-1.8-5.2L3 8l5.2-1.8z"/></svg>';
  var LETTERS = ['A', 'B', 'C', 'D', 'E'];
  var QMAX = QUIZ.reduce(function (a, s) { return a + Math.max.apply(null, s.opts.map(function (o) { return o[1]; })); }, 0);

  function initQuiz(root) {
    var answers = new Array(QUIZ.length).fill(null);
    var view = 'intro'; // 'intro' | number (question idx) | 'result'

    root.classList.add('quiz');
    if (!root.querySelector('.quiz__glow')) {
      var g = document.createElement('div'); g.className = 'quiz__glow'; g.setAttribute('aria-hidden', 'true');
      root.appendChild(g);
    }

    function pct() {
      var score = answers.reduce(function (a, b) { return a + (b || 0); }, 0);
      return Math.round((score / QMAX) * 100);
    }

    function render() {
      var body = document.createElement('div');
      body.className = 'quiz__body';

      if (view === 'intro') {
        body.innerHTML =
          '<div class="quiz__intro">' +
            '<span class="quiz__badge">' + SPARK + ' Free 60&#8209;second quiz</span>' +
            '<h2 class="quiz__headline">Are your books<br><em>losing</em> you money?</h2>' +
            '<p class="quiz__meta">Answer ' + QUIZ.length + ' quick questions &mdash; no email needed &mdash; and get an honest read on your bookkeeping.</p>' +
            '<div class="quiz__pips" aria-hidden="true">' + QUIZ.map(function (_, i) { return '<i>' + (i + 1) + '</i>'; }).join('') + '</div>' +
            '<button type="button" class="btn quiz__start">Start the quiz' + ARROW + '</button>' +
          '</div>';
        body.querySelector('.quiz__start').addEventListener('click', function () { view = 0; render(); });
      }
      else if (view === 'result') {
        var p = pct();
        var health = 100 - p;
        var level = health >= 68 ? 'high' : health >= 42 ? 'mid' : 'low';
        var head = { low: 'Your books are likely costing you money', mid: 'A few gaps worth closing', high: 'You’re in good shape — let’s keep it that way' }[level];
        var blurb = {
          low: 'Decisions are being made on numbers that aren’t current or reconciled. That’s exactly where missed deductions, cash surprises, and late fees hide.',
          mid: 'The fundamentals are mostly there, but a couple of habits are letting errors and delays creep in — easy to fix with a steady monthly rhythm.',
          high: 'Your books sound current and reconciled. A second set of eyes and a consistent monthly close keeps it that way as you grow.'
        }[level];
        var flags = [];
        if (answers[0] >= 2) flags.push('Accounts aren’t being reconciled regularly');
        if (answers[1] >= 2) flags.push('No clear view of your monthly profit');
        if (answers[2] >= 2) flags.push('Books are behind and need catch-up');
        if (answers[3] >= 3) flags.push('Receivables aren’t being chased');
        if (answers[4] >= 2) flags.push('No dedicated person owns the books');
        if (answers[5] >= 2) flags.push('Tax season is a scramble');
        if (!flags.length) flags.push('Keep the monthly close consistent as you scale');

        var C = 339.292; // 2 * pi * 54
        var off = C * (1 - health / 100);
        body.innerHTML =
          '<span class="quiz__badge">' + SPARK + ' Your result</span>' +
          '<div class="quiz__result">' +
            '<div class="quiz__ring" data-level="' + level + '">' +
              '<svg viewBox="0 0 120 120" aria-hidden="true"><circle class="bg" cx="60" cy="60" r="54"/><circle class="fg" cx="60" cy="60" r="54" stroke-dasharray="' + C + '" stroke-dashoffset="' + C + '"/></svg>' +
              '<span class="quiz__ring-num"><b>' + health + '</b><span>Books health</span></span>' +
            '</div>' +
            '<p class="quiz__verdict">' + head + '</p>' +
            '<p class="quiz__blurb">' + blurb + '</p>' +
            '<ul class="quiz__fixes">' + flags.map(function (f) {
              return '<li><svg viewBox="0 0 20 20" fill="none"><path d="M4 10.5l4 4 8-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>' + f + '</span></li>';
            }).join('') + '</ul>' +
            '<button type="button" class="btn" data-quiz-book>Book a free consultation' + ARROW + '</button>' +
            '<button type="button" class="quiz__restart">Retake the quiz</button>' +
          '</div>';

        var note = 'Books-health quiz — ' + head + ' (health ' + health + '/100). Flags: ' + flags.join('; ') + '.';
        root.setAttribute('data-summary', note);
        requestAnimationFrame(function () {
          var fg = body.querySelector('.quiz__ring .fg'); if (fg) fg.style.strokeDashoffset = off;
        });
        body.querySelector('[data-quiz-book]').addEventListener('click', function () {
          openBooker({ service: 'Free consultation', note: note });
        });
        body.querySelector('.quiz__restart').addEventListener('click', function () {
          answers = new Array(QUIZ.length).fill(null); view = 'intro'; render();
          root.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
        });
      }
      else {
        var i = view;
        var step = QUIZ[i];
        var progressPct = Math.round(((i + 1) / QUIZ.length) * 100);
        body.innerHTML =
          '<div class="quiz__head">' +
            '<span class="quiz__badge">' + SPARK + ' Books&#8209;health quiz</span>' +
            '<span class="quiz__count">' + (i + 1) + ' / ' + QUIZ.length + '</span>' +
          '</div>' +
          '<div class="quiz__track"><i style="width:' + progressPct + '%"></i></div>' +
          '<p class="quiz__q">' + step.q + '</p>' +
          (step.hint ? '<p class="quiz__hint">' + step.hint + '</p>' : '') +
          '<div class="quiz__opts">' + step.opts.map(function (o, oi) {
            return '<button type="button" class="quiz-opt' + (answers[i] === o[1] && quizPicked[i] === oi ? ' is-sel' : '') + '" data-o="' + oi + '">' +
              '<span class="quiz-opt__k">' + LETTERS[oi] + '</span>' +
              '<span class="quiz-opt__t">' + o[0] + '</span>' +
              '<svg class="quiz-opt__go" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '</button>';
          }).join('') + '</div>' +
          '<button type="button" class="quiz__back"' + (i === 0 ? ' hidden' : '') + '>&larr; Back</button>';

        body.querySelector('.quiz__opts').addEventListener('click', function (e) {
          var b = e.target.closest('.quiz-opt'); if (!b) return;
          var oi = parseInt(b.getAttribute('data-o'), 10);
          answers[i] = step.opts[oi][1];
          quizPicked[i] = oi;
          $$('.quiz-opt', body).forEach(function (x) { x.classList.toggle('is-sel', x === b); });
          setTimeout(function () { view = (i < QUIZ.length - 1) ? i + 1 : 'result'; render(); }, reduce ? 0 : 260);
        });
        var bk = body.querySelector('.quiz__back');
        if (bk) bk.addEventListener('click', function () { view = i - 1; render(); });
      }

      var old = root.querySelector('.quiz__body');
      if (old) old.remove();
      root.appendChild(body);
    }

    var quizPicked = new Array(QUIZ.length).fill(null);
    render();
  }
  $$('[data-quiz]').forEach(initQuiz);

  /* =========================================================
     CONTACT FORM  ->  routes into the booker
     ========================================================= */
  var form = $('#contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = new FormData(form);
      var name = ((data.get('firstName') || '') + ' ' + (data.get('lastName') || '')).trim();
      var note = (data.get('message') || '').trim();
      form.classList.add('is-sent');
      var ok = form.querySelector('.form__ok');
      if (ok) {
        var ml = ok.querySelector('[data-mailto]');
        if (ml) ml.setAttribute('href', 'mailto:debbie.aboveparbookkeeping@gmail.com?subject=' +
          encodeURIComponent('Website enquiry — ' + (name || 'New')) +
          '&body=' + encodeURIComponent('Name: ' + name + '\nEmail: ' + (data.get('email') || '') + '\nPhone: ' + (data.get('phone') || '') + '\n\n' + note));
      }
      openBooker({ service: 'Free consultation', name: name, email: data.get('email') || '', note: note });
    });
  }

  /* =========================================================
     REVIEW BUBBLE (bottom-right, rotating, dismissible)
     ========================================================= */
  var REVIEWS = [
    { t: 'She caught two years of miscategorized expenses in the first month. Our CPA was thrilled.', n: 'Marcus D.', r: 'Contractor, S-Corp' },
    { t: 'For the first time I actually know what we made last month. Worth every penny.', n: 'Priya S.', r: 'Agency owner' },
    { t: 'Books used to be a Sunday-night panic. Now I never think about them.', n: 'Danielle R.', r: 'E-commerce, LLC' },
    { t: 'Payroll and invoicing just... handled. Above Par is the easiest vendor we work with.', n: 'Tom & Angela K.', r: 'Family HVAC business' }
  ];
  var bubble = $('.review-bubble');
  if (bubble) {
    var bi = Math.floor(Math.random() * REVIEWS.length), rot = null, dismissed = false;
    try { dismissed = sessionStorage.getItem('apb_rev') === '1'; } catch (e) { /* */ }
    var starRow = '<span class="tstar" aria-label="5 out of 5 stars">' +
      new Array(5).join('0').split('').map(function () { return '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 15l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z"/></svg>'; }).join('') +
      '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 15l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z"/></svg></span>';
    function paint() {
      var rv = REVIEWS[bi % REVIEWS.length];
      bubble.innerHTML =
        '<div class="review-bubble__top"><span class="review-bubble__src">' +
          '<svg viewBox="0 0 20 20" fill="currentColor" style="width:12px;height:12px"><path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 15l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z"/></svg> Client review</span>' +
          '<button type="button" class="review-bubble__x" aria-label="Dismiss"><svg viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>' +
        '</div>' + starRow +
        '<p>&ldquo;' + rv.t + '&rdquo;</p>' +
        '<div class="review-bubble__who"><span class="avatar">' + rv.n.split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('') + '</span>' +
          '<span><b>' + rv.n + '</b><span>' + rv.r + '</span></span></div>';
      bubble.querySelector('.review-bubble__x').addEventListener('click', function () {
        bubble.classList.remove('is-open'); dismissed = true;
        try { sessionStorage.setItem('apb_rev', '1'); } catch (e) { /* */ }
        if (rot) clearInterval(rot);
      });
    }
    if (!dismissed) {
      setTimeout(function () { paint(); bubble.classList.add('is-open'); }, reduce ? 800 : 5200);
      if (!reduce) rot = setInterval(function () {
        if (dismissed) return;
        bubble.classList.remove('is-open');
        setTimeout(function () { bi++; paint(); bubble.classList.add('is-open'); }, 500);
      }, 9000);
      bubble.addEventListener('mouseenter', function () { if (rot) { clearInterval(rot); rot = null; } });
    }
  }
})();
