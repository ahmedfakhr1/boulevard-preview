(function () {
  'use strict';
  var d = document, root = d.documentElement, body = d.body;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- sections fade and rise once ---------- */
  var rv = $$('.rv');
  if (hasIO && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- header: the wordmark joins once the hero is behind us ---------- */
  var hdr = $('.hdr'), hero = $('.hero');
  if (hdr && hero && hasIO) {
    new IntersectionObserver(function (es) {
      hdr.classList.toggle('show-brand', !es[0].isIntersecting);
    }, { threshold: 0 }).observe(hero);
  } else if (hdr) { hdr.classList.add('show-brand'); }

  /* ---------- drawer ---------- */
  var drawer = $('#drawer'), burger = $('.hdr .burger');
  function openDrawer() {
    drawer.hidden = false; root.classList.add('lock');
    requestAnimationFrame(function () { drawer.classList.add('open'); });
    burger.setAttribute('aria-expanded', 'true');
    var c = $('.drawer-close', drawer); if (c) c.focus();
  }
  function closeDrawer(focusBack) {
    if (drawer.hidden) return;
    drawer.classList.remove('open'); root.classList.remove('lock');
    burger.setAttribute('aria-expanded', 'false');
    setTimeout(function () { drawer.hidden = true; }, 200);
    if (focusBack) burger.focus();
  }
  if (drawer && burger) {
    burger.addEventListener('click', openDrawer);
    $('.drawer-close', drawer).addEventListener('click', function () { closeDrawer(true); });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { closeDrawer(false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(true); });
    window.addEventListener('resize', function () { if (innerWidth > 860) closeDrawer(false); });
  }

  /* ---------- Arabic pop-up ---------- */
  var pop = $('#ar-pop');
  function showAr() {
    closeDrawer(false);
    if (pop && pop.showModal) { if (!pop.open) pop.showModal(); } else if (pop) { pop.setAttribute('open', ''); }
  }
  $$('.ar, .ar-d').forEach(function (b) { b.addEventListener('click', showAr); });
  if (pop) {
    $$('[data-close]', pop).forEach(function (b) { b.addEventListener('click', function () { pop.close ? pop.close() : pop.removeAttribute('open'); }); });
    pop.addEventListener('click', function (e) { if (e.target === pop && pop.close) pop.close(); });
  }

  /* ---------- bottom bar: hides on scroll down, over the footer and over the booking section ---------- */
  var bar = $('.tabbar');
  if (bar) {
    var isHome = body.classList.contains('home'), lastY = scrollY, down = false, ticking = false, flags = { foot: false, book: false };
    var apply = function () {
      ticking = false;
      var y = scrollY, dy = y - lastY;
      if (Math.abs(dy) > 6) { down = dy > 0; lastY = y; }
      var hide = flags.foot || flags.book || (down && y > 120) || (isHome && y < 120);
      bar.classList.toggle('off', hide);
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(apply); } }, { passive: true });
    if (hasIO) {
      [['#foot', 'foot'], ['#book', 'book']].forEach(function (p) {
        var el = $(p[0]); if (!el) return;
        new IntersectionObserver(function (es) { flags[p[1]] = es[0].isIntersecting; apply(); }, { threshold: 0 }).observe(el);
      });
    }
    apply();
  }

  /* ---------- menu chips: scroll-spy ---------- */
  var chips = $('.chips');
  if (chips && hasIO) {
    var scroller = $('.chips-in', chips), links = $$('a', chips), map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var setActive = function (id) {
      links.forEach(function (a) { if (a === map[id]) { a.setAttribute('aria-current', 'true'); } else { a.removeAttribute('aria-current'); } });
      var a = map[id]; if (!a) return;
      var left = a.offsetLeft - (scroller.clientWidth - a.offsetWidth) / 2;
      scroller.scrollTo({ left: left, behavior: reduce ? 'auto' : 'smooth' });
    };
    var secs = $$('.msec');
    var top = (parseInt(getComputedStyle(root).getPropertyValue('--hh'), 10) || 64) + 70;
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-' + top + 'px 0px -70% 0px', threshold: 0 });
    secs.forEach(function (s) { spy.observe(s); });
    if (secs[0]) setActive(secs[0].id);
  }

  /* ---------- booking ---------- */
  var form = $('#book-form');
  if (form) {
    var BR = {
      o1: { name: 'O1', phone: '010 93377344', tel: '+201093377344', wa: '201093377344' },
      golf: { name: 'Golf Central', phone: '010 09555085', tel: '+201009555085', wa: '201009555085' },
      plaza: { name: 'Plaza España', ig: 'https://ig.me/m/boulevardcairo' },
      giza: { name: 'New Giza', phone: '010 10191121', tel: '+201010191121', wa: '201010191121' }
    };
    var f = form.elements, sent = $('#sent'), msgEl = $('#sent-msg'), acts = $('#sent-acts'), hint = $('#sent-hint');
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var iso = function (dt) { return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate()); };
    var now = new Date();
    f.date.min = iso(now); f.date.value = iso(now);

    var setBranch = function (k) { if (BR[k]) { f.branch.value = k; sent.hidden = true; } };
    var q = new URLSearchParams(location.search).get('branch'); if (q) setBranch(q);
    $$('[data-branch]').forEach(function (a) { a.addEventListener('click', function () { setBranch(a.getAttribute('data-branch')); }); });
    f.branch.addEventListener('change', function () { sent.hidden = true; });

    $$('[data-step]', form).forEach(function (b) {
      b.addEventListener('click', function () {
        var v = (parseInt(f.guests.value, 10) || 1) + parseInt(b.getAttribute('data-step'), 10);
        f.guests.value = Math.max(1, Math.min(40, v));
      });
    });

    var fmtDate = function (v) {
      var p = v.split('-'), dt = new Date(+p[0], +p[1] - 1, +p[2]);
      return dt.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).replace(',', '');
    };
    var fmtTime = function (v) {
      var p = v.split(':'), h = +p[0], m = p[1], ap = h >= 12 ? 'PM' : 'AM';
      return ((h % 12) || 12) + ':' + m + ' ' + ap;
    };
    var mk = function (cls, txt, href, ext) {
      var a = d.createElement(href ? 'a' : 'button');
      a.className = 'btn ' + cls; a.textContent = txt;
      if (href) { a.href = href; if (ext) { a.target = '_blank'; a.rel = 'noopener'; } } else { a.type = 'button'; }
      return a;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var b = BR[f.branch.value], n = Math.max(1, parseInt(f.guests.value, 10) || 1);
      var msg = 'Hi Boulevard ' + b.name + ', a table for ' + n + ' on ' + fmtDate(f.date.value) + ' at ' + fmtTime(f.time.value) + '. Name: ' + f.name.value.trim() + '.';
      var note = f.note.value.trim(); if (note) msg += ' Note: ' + note;
      msgEl.textContent = msg; acts.textContent = '';
      var copy = mk('btn-line', 'Copy message');
      copy.addEventListener('click', function () {
        var done = function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy message'; }, 1800); };
        if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(msg).then(done, done); }
        else { var t = d.createElement('textarea'); t.value = msg; d.body.appendChild(t); t.select(); try { d.execCommand('copy'); } catch (x) {} d.body.removeChild(t); done(); }
      });
      if (b.ig) {
        acts.appendChild(mk('btn-book', 'Message on Instagram', b.ig, true)); acts.appendChild(copy);
        hint.textContent = 'Plaza España has no phone listed. Copy the message, then paste it in the chat with @boulevardcairo.';
      } else {
        acts.appendChild(mk('btn-line', 'Call ' + b.name, 'tel:' + b.tel));
        acts.appendChild(mk('btn-book', 'Send on WhatsApp', 'https://wa.me/' + b.wa + '?text=' + encodeURIComponent(msg), true));
        acts.appendChild(copy);
        hint.textContent = b.name + ': ' + b.phone;
      }
      sent.hidden = false;
      sent.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
      sent.focus({ preventScroll: true });
    });
  }

  /* ---------- signature ---------- */
  (function () { var a = d.querySelector('a.sig'); if (!a) return; function play() { a.classList.remove('on'); void a.getBoundingClientRect(); a.classList.add('on'); } a.addEventListener('mouseenter', function () { if (!a.classList.contains('on')) play(); }); if (!matchMedia('(hover: none)').matches || !('IntersectionObserver' in window)) return; var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); setTimeout(play, 400); } }, { threshold: .9 }); io.observe(a); })();
})();
