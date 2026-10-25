(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Hero-ingang: één georkestreerd moment ---------- */
  var hero = $('.hero');
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { hero.classList.add('hero-ready'); });
  });

  /* ---------- Kop-reveal per hoofdstuk (één keer) ---------- */
  var chapters = $$('.chapter');
  if ('IntersectionObserver' in window) {
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); reveal.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    chapters.forEach(function (c) { reveal.observe(c); });
  } else {
    chapters.forEach(function (c) { c.classList.add('in'); });
  }

  /* ---------- Scrollspy: waar ben ik? ---------- */
  var links = $$('#railList a');
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && byId[e.target.id]) {
          links.forEach(function (a) { a.removeAttribute('aria-current'); });
          byId[e.target.id].setAttribute('aria-current', 'true');
          // houd de actieve link zichtbaar in de horizontale mobiele balk
          var a = byId[e.target.id];
          var bar = a.closest('.rail');
          if (bar && bar.scrollWidth > bar.clientWidth) {
            bar.scrollTo({ left: a.offsetLeft - 24, behavior: reduce ? 'auto' : 'smooth' });
          }
        }
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    chapters.forEach(function (c) { spy.observe(c); });
  }

  /* ---------- Leesvoortgang ---------- */
  var bar = $('#progressBar');
  var ticking = false;
  function updateProgress() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, h.scrollTop / max) : 0) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();

  /* ---------- Demo: bulk create ---------- */
  var rows = [
    { title: 'Nieuwe sneaker', tag: 'Loop op wolken', cta: 'Bestel nu', bg: '#FF5CA8', ink: '#0B1033' },
    { title: 'Zomerjam', tag: 'Fris, vers, lokaal', cta: 'Proef het', bg: '#E4FF4D', ink: '#0B1033' },
    { title: 'Koffie to go', tag: 'Wakker voor elke deadline', cta: 'Probeer gratis', bg: '#FFFFFF', ink: '#2B3FFF' },
    { title: 'Nachtbus', tag: 'Altijd veilig thuis', cta: 'Plan je rit', bg: '#0B1033', ink: '#FFFFFF' }
  ];
  var frames = $('#frames');
  var status = $('#demoStatus');
  var sheetBtns = $$('#sheetList button');
  var playBtn = $('#playBtn');
  var playRow = $('#playRow');
  var current = 0;
  var timer = null;
  var playing = false;

  function show(i, announce) {
    current = i;
    var r = rows[i];
    frames.style.setProperty('--f-bg', r.bg);
    frames.style.setProperty('--f-ink', r.ink);
    $$('[data-f]', frames).forEach(function (el) { el.textContent = r[el.getAttribute('data-f')]; });
    sheetBtns.forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
    if (!reduce) {
      frames.classList.remove('swap');
      void frames.offsetWidth; // herstart de animatie
      frames.classList.add('swap');
    }
    if (announce) status.textContent = 'Rij ' + (i + 1) + ' van ' + rows.length + ' geladen: ' + r.title + '. Story, post en banner zijn bijgewerkt.';
  }

  function setPlaying(on) {
    playing = on;
    clearInterval(timer);
    if (on) timer = setInterval(function () { show((current + 1) % rows.length, false); }, 3000);
    playBtn.textContent = on ? 'Pauzeer' : 'Speel af';
    playBtn.setAttribute('aria-pressed', on ? 'false' : 'true');
  }

  // Zelf een rij kiezen = automatisch wisselen stopt
  sheetBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      setPlaying(false);
      show(parseInt(b.getAttribute('data-i'), 10), true);
    });
  });

  playRow.hidden = false;
  playBtn.addEventListener('click', function () {
    if (playing) {
      setPlaying(false);
      status.textContent = 'Voorbeeld gepauzeerd.';
    } else {
      setPlaying(true);
      show((current + 1) % rows.length, true); // meteen zichtbaar resultaat
      status.textContent += ' Voorbeeld speelt af.';
    }
  });

  show(0, false);
  // Automatisch afspelen alleen zonder reduced motion
  setPlaying(!reduce);

  /* ---------- Beeldbewerking: batch ---------- */
  var tilesEl = $('#tiles');
  var batchBtn = $('#batchBtn');
  var count = $('#batchCount');
  var tiles = [];
  var seeds = [
    [-30, 22, 1.3, -20, '50%'], [24, -26, .8, 15, '20%'], [-18, -30, 1.1, 40, '50%'], [30, 18, .9, -35, '10%'],
    [-26, 10, 1.2, 25, '30%'], [12, 30, .7, -10, '50%'], [-34, -14, .9, 50, '10%'], [20, 24, 1.25, -45, '50%'],
    [-10, -34, 1, 12, '20%'], [32, -8, 1.15, -28, '50%'], [-22, 28, .85, 33, '30%'], [8, -24, 1.3, -18, '10%']
  ];
  seeds.forEach(function (s) {
    var t = document.createElement('div');
    t.className = 'tile';
    var i = document.createElement('i');
    i.style.setProperty('--x', s[0] + '%');
    i.style.setProperty('--y', s[1] + '%');
    i.style.setProperty('--s', s[2]);
    i.style.setProperty('--rot', s[3] + 'deg');
    i.style.setProperty('--r', s[4]);
    t.appendChild(i);
    tilesEl.appendChild(t);
    tiles.push(t);
  });
  var batchRunning = false;
  batchBtn.addEventListener('click', function () {
    if (batchRunning) return;
    batchRunning = true;
    batchBtn.disabled = true;
    tiles.forEach(function (t) { t.classList.remove('done'); });
    var n = 0;
    count.textContent = '0 van ' + tiles.length + ' verwerkt';
    tiles.forEach(function (t, idx) {
      setTimeout(function () {
        t.classList.add('done');
        n++;
        count.textContent = n + ' van ' + tiles.length + ' verwerkt';
        if (n === tiles.length) {
          batchRunning = false;
          batchBtn.disabled = false;
          batchBtn.textContent = 'Opnieuw uitvoeren';
          count.textContent = 'Klaar: ' + n + ' van ' + tiles.length + ' verwerkt';
        }
      }, reduce ? 0 : idx * 70);
    });
  });

  /* ---------- Content: AI-voorstel vs. bijsturing ---------- */
  var poster = $('#poster');
  $$('.seg-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      poster.setAttribute('data-state', b.getAttribute('data-state'));
      $$('.seg-btn').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
    });
  });

  /* ---------- Web: prompt afspelen ---------- */
  var typed = $('#typed');
  var typeBtn = $('#typeBtn');
  var termOut = $('#termOut');
  var full = typed.getAttribute('data-full');
  var outItems = $$('li', termOut);
  var typing = false;
  typeBtn.addEventListener('click', function () {
    if (typing) return;
    typing = true;
    typeBtn.disabled = true;
    termOut.classList.add('armed');
    outItems.forEach(function (li) { li.classList.remove('on'); });
    function finish() {
      typed.classList.remove('typing');
      typed.textContent = full;
      outItems.forEach(function (li, k) {
        setTimeout(function () { li.classList.add('on'); }, reduce ? 0 : k * 260);
      });
      setTimeout(function () {
        typing = false; typeBtn.disabled = false; typeBtn.textContent = 'Speel opnieuw af';
      }, reduce ? 0 : outItems.length * 260 + 100);
    }
    if (reduce) { finish(); return; }
    typed.textContent = '';
    typed.classList.add('typing');
    var i = 0;
    var iv = setInterval(function () {
      i += 2;
      typed.textContent = full.slice(0, i);
      if (i >= full.length) { clearInterval(iv); finish(); }
    }, 28);
  });

  /* ---------- Mail: automatisatieflow ---------- */
  var flowItems = $$('#flow li');
  var flowBtn = $('#flowBtn');
  var flowStatus = $('#flowStatus');
  var flowRunning = false;
  flowBtn.addEventListener('click', function () {
    if (flowRunning) return;
    flowRunning = true;
    flowBtn.disabled = true;
    flowItems.forEach(function (li) { li.classList.remove('on'); });
    flowItems.forEach(function (li, k) {
      setTimeout(function () {
        flowItems.forEach(function (o) { o.classList.remove('on'); });
        li.classList.add('on');
        flowStatus.textContent = li.textContent;
        if (k === flowItems.length - 1) {
          flowRunning = false;
          flowBtn.disabled = false;
          flowBtn.textContent = 'Schrijf nog iemand in';
          flowStatus.textContent = 'Flow afgerond: ' + li.textContent;
        }
      }, reduce ? k * 50 : k * 800);
    });
  });

  /* ---------- Optionele AI-beelden: tonen zodra het bestand bestaat ---------- */
  $$('.shot').forEach(function (fig) {
    var img = $('img', fig);
    var probe = new Image();
    probe.onload = function () { img.src = fig.getAttribute('data-src'); fig.hidden = false; };
    probe.src = fig.getAttribute('data-src');
  });
})();
