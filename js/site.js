/* =====================================================================
   ABOVE PAR BOOKKEEPING — site.js  (no dependencies)
   ===================================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Debbie's live Calendly — used by the inline embed on index.html / contact.html.
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

  var ARROW = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* =========================================================
     SCHEDULER — Calendly, loaded on intent (fast first paint)
     Nothing Calendly-related touches the page until the section
     nears the viewport or the visitor asks to book.
     ========================================================= */
  var scheduler = $('.scheduler[data-cal]');
  var calWidget = scheduler ? scheduler.querySelector('.scheduler__embed') : null;
  var calUrl = calWidget ? calWidget.getAttribute('data-cal-url') : null;
  var calScriptState = 0;            // 0 none, 1 loading, 2 ready
  var calWaiters = [];
  var calOpened = false;

  function calScript(cb) {
    if (cb) calWaiters.push(cb);
    if (calScriptState === 2) return flushCal();
    if (calScriptState === 1) return;
    calScriptState = 1;
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://assets.calendly.com/assets/external/widget.css';
    document.head.appendChild(css);
    var s = document.createElement('script');
    s.src = 'https://assets.calendly.com/assets/external/widget.js';
    s.async = true;
    s.onload = function () { calScriptState = 2; flushCal(); };
    s.onerror = function () { calScriptState = 0; };
    document.head.appendChild(s);
  }
  function flushCal() {
    if (!(window.Calendly && window.Calendly.initInlineWidget)) return;
    var q = calWaiters; calWaiters = [];
    q.forEach(function (fn) { try { fn(); } catch (e) { /* ignore */ } });
  }

  function renderCal(prefill) {
    if (!calWidget || !calUrl) return;
    calScript(function () {
      try {
        calWidget.innerHTML = '';
        window.Calendly.initInlineWidget({ url: calUrl, parentElement: calWidget, prefill: prefill || {} });
        calOpened = true;
      } catch (e) { /* ignore */ }
    });
  }

  function openCal(prefill) {
    if (!scheduler || !calWidget) return false;
    if (!scheduler.classList.contains('is-open')) {
      scheduler.classList.add('is-open');
      var fh = scheduler.querySelector('.scheduler__facade-h');
      var fs = scheduler.querySelector('.scheduler__facade-s');
      var btn = scheduler.querySelector('[data-cal-open] .btn');
      if (fh) fh.textContent = 'Loading Debbie’s calendar';
      if (fs) fs.textContent = 'One moment while the live availability loads.';
      if (btn) btn.innerHTML = '<span class="spin" aria-hidden="true"></span>Loading…';
      setTimeout(function () { scheduler.classList.add('cal-ready'); }, 6000);
    }
    renderCal(prefill);
    return true;
  }

  // hide the loading veil once Calendly's iframe reports it has rendered
  window.addEventListener('message', function (e) {
    if (!scheduler) return;
    if (e.origin && e.origin.indexOf('calendly.com') === -1) return;
    var d = e.data;
    if (d && typeof d === 'object' && typeof d.event === 'string' && d.event.indexOf('calendly.') === 0) {
      scheduler.classList.add('cal-ready');
    }
  });

  function openScheduler(prefill) {
    prefill = prefill || {};
    var pf = {};
    if (prefill.name) pf.name = prefill.name;
    if (prefill.email) pf.email = prefill.email;
    if (prefill.note) pf.customAnswers = { a1: prefill.note };
    var target = document.getElementById('book');
    if (scheduler && calWidget && target) {
      openCal(pf);
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    } else {
      try { if (prefill.note) sessionStorage.setItem('apb_note', prefill.note); } catch (e) { /* ignore */ }
      window.location.href = 'contact.html#book';
    }
  }

  if (scheduler && calWidget) {
    var facade = scheduler.querySelector('[data-cal-open]');
    if (facade) {
      facade.addEventListener('click', function () { openCal({}); });
      ['mouseenter', 'focusin', 'touchstart'].forEach(function (ev) {
        facade.addEventListener(ev, function warm() { calScript(); facade.removeEventListener(ev, warm); }, { passive: true });
      });
    }
    // warm the Calendly script once the section is ~half a screen away
    if ('IntersectionObserver' in window) {
      var calIO = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { calScript(); calIO.disconnect(); }
      }, { rootMargin: '400px 0px' });
      calIO.observe(scheduler);
    }
    // arriving mid-flow: a carried quiz/message summary, or a direct #book link
    var carriedNote = '';
    try { carriedNote = sessionStorage.getItem('apb_note') || ''; if (carriedNote) sessionStorage.removeItem('apb_note'); } catch (e) { /* ignore */ }
    if (carriedNote) openCal({ customAnswers: { a1: carriedNote } });
    if (location.hash === '#book') {
      openCal({});
      setTimeout(function () { var t = document.getElementById('book'); if (t) t.scrollIntoView(); }, 250);
    }
  }

  $$('[data-book]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (scheduler && calWidget) { e.preventDefault(); openScheduler({}); return; }
      var href = a.getAttribute('href') || '';
      if (href === '#book' || href.indexOf('#book') === 0) { e.preventDefault(); window.location.href = 'contact.html#book'; }
      // otherwise the href already points at contact.html#book — let it navigate
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
          openScheduler({ note: note });
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
      openScheduler({ name: name, email: data.get('email') || '', note: note });
    });
  }

  /* =========================================================
     REVIEW BUBBLE — Debbie's real Google review, bottom-right
     ========================================================= */
  var GBP_URL = 'https://share.google/vOsIL2xC95UJYuE14';
  var GOOGLE_G = '<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">' +
    '<path fill="#4285F4" d="M23 12.25c0-.78-.07-1.53-.2-2.25H12v4.5h6.19a5.3 5.3 0 0 1-2.3 3.48v2.9h3.72C21.86 18.9 23 15.85 23 12.25z"/>' +
    '<path fill="#34A853" d="M12 24c3.11 0 5.72-1.03 7.62-2.79l-3.72-2.9c-1.03.7-2.36 1.1-3.9 1.1-3 0-5.55-2.03-6.46-4.76H1.7v2.99A12 12 0 0 0 12 24z"/>' +
    '<path fill="#FBBC05" d="M5.54 14.65a7.2 7.2 0 0 1 0-4.6V7.06H1.7a12 12 0 0 0 0 10.58l3.84-3z"/>' +
    '<path fill="#EA4335" d="M12 4.75c1.69 0 3.2.58 4.4 1.72l3.3-3.3C17.72 1.2 15.1 0 12 0 7.5 0 3.6 2.58 1.7 6.34l3.84 3C6.45 6.78 9 4.75 12 4.75z"/></svg>';
  var REVIEW_SHORT = 'Debbie and her team went above and beyond when I transitioned to their company — they really are above the par!';
  var bubble = $('.review-bubble');
  if (bubble) {
    var dismissed = false;
    try { dismissed = sessionStorage.getItem('apb_rev') === '1'; } catch (e) { /* */ }
    if (!dismissed) {
      var starRow = '<span class="tstar" aria-label="5 out of 5 stars">' +
        Array.apply(null, { length: 5 }).map(function () {
          return '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 15l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z"/></svg>';
        }).join('') + '</span>';
      bubble.innerHTML =
        '<div class="review-bubble__top"><span class="review-bubble__src">' + GOOGLE_G + ' Google review</span>' +
          '<button type="button" class="review-bubble__x" aria-label="Dismiss"><svg viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>' +
        '</div>' + starRow +
        '<p>&ldquo;' + REVIEW_SHORT + '&rdquo;</p>' +
        '<a class="review-bubble__who" href="' + GBP_URL + '" target="_blank" rel="noopener">' +
          '<span class="avatar">SR</span><span><b>Sarah Reyna</b><span>Verified on Google &rarr;</span></span></a>';
      bubble.querySelector('.review-bubble__x').addEventListener('click', function () {
        bubble.classList.remove('is-open');
        try { sessionStorage.setItem('apb_rev', '1'); } catch (e) { /* */ }
      });
      setTimeout(function () { bubble.classList.add('is-open'); }, reduce ? 800 : 4800);
    }
  }
})();
