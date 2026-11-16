(function () {
  var root = document.documentElement;
  root.classList.add('js');

  document.addEventListener('DOMContentLoaded', function () {
    var bar = document.querySelector('.topbar');
    var onScroll = function () { if (bar) bar.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var toggle = document.getElementById('navtoggle');
    document.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () { if (toggle) toggle.checked = false; });
    });

    var items = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      items.forEach(function (el) { io.observe(el); });
    } else {
      items.forEach(function (el) { el.classList.add('in'); });
    }

    document.querySelectorAll('[data-carousel]').forEach(function (box) {
      var slides = box.querySelectorAll('.slide');
      var dots = box.querySelectorAll('.dots button');
      var cur = 0, timer = null;
      var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      function show(n) {
        cur = (n + slides.length) % slides.length;
        slides.forEach(function (s, k) { s.classList.toggle('on', k === cur); s.setAttribute('aria-hidden', k === cur ? 'false' : 'true'); });
        dots.forEach(function (d, k) { d.setAttribute('aria-current', k === cur ? 'true' : 'false'); });
      }
      function play() { if (!still) { stop(); timer = setInterval(function () { show(cur + 1); }, 7000); } }
      function stop() { if (timer) { clearInterval(timer); timer = null; } }
      dots.forEach(function (d, k) { d.addEventListener('click', function () { show(k); play(); }); });
      box.addEventListener('mouseenter', stop); box.addEventListener('mouseleave', play);
      box.addEventListener('focusin', stop); box.addEventListener('focusout', play);
      document.addEventListener('visibilitychange', function () { document.hidden ? stop() : play(); });
      show(0); play();
    });

    document.querySelectorAll('[data-rail]').forEach(function (rail) {
      var sec = rail.closest('section');
      var step = function () { var t = rail.querySelector('.tile'); return t ? t.getBoundingClientRect().width + 16 : 600; };
      var prev = sec && sec.querySelector('[data-rail-prev]'), next = sec && sec.querySelector('[data-rail-next]');
      if (prev) prev.addEventListener('click', function () { rail.scrollBy({ left: -step(), behavior: 'smooth' }); });
      if (next) next.addEventListener('click', function () { rail.scrollBy({ left: step(), behavior: 'smooth' }); });
    });

    document.querySelectorAll('[data-tabs]').forEach(function (box) {
      var tabs = box.querySelectorAll('[role="tab"]');
      var panels = box.querySelectorAll('[role="tabpanel"]');
      function select(i) {
        tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
        panels.forEach(function (p, k) { p.hidden = k !== i; });
      }
      tabs.forEach(function (t, k) {
        t.addEventListener('click', function () { select(k); });
        t.addEventListener('keydown', function (e) {
          var n = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
          if (n) { e.preventDefault(); var j = (k + n + tabs.length) % tabs.length; select(j); tabs[j].focus(); }
        });
      });
      select(0);
    });

    var form = document.querySelector('form[data-api]');
    if (form) {
      var sent = document.querySelector('[data-sent]'), err = document.querySelector('[data-error]');
      var errText = document.querySelector('[data-error-text]'), btn = form.querySelector('[data-submit]');
      var params = new URLSearchParams(location.search);
      var fallback = 'Could not send right now. Please email us at ' + form.getAttribute('data-fallback') + '.';
      var showError = function (msg) { errText.textContent = msg; err.hidden = false; sent.hidden = true; };
      var interest = params.get('interest');
      if (interest && form.interest) form.interest.value = interest;
      if (params.get('sent') === '1') { sent.hidden = false; }
      if (params.get('error')) { showError(params.get('error') === 'rate' ? 'Too many messages. Please try again later.' : 'Please fill in your name, a valid email and a message.'); }
      var endpoint = form.getAttribute('action');
      form.addEventListener('submit', function (e) {
        if (!endpoint) { e.preventDefault(); showError(fallback); return; }
        if (!window.fetch) return;
        e.preventDefault();
        btn.disabled = true;
        var body = new URLSearchParams(new FormData(form));
        body.set('ajax', '1');
        fetch(endpoint, { method: 'POST', body: body })
          .then(function (r) { return r.json().catch(function () { return { ok: false, error: fallback }; }); })
          .then(function (d) {
            if (d.ok) { form.reset(); sent.hidden = false; err.hidden = true; sent.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
            else { showError(d.error || fallback); }
          })
          .catch(function () { showError(fallback); })
          .then(function () { btn.disabled = false; });
      });
    }
  });
})();
