/* MŌNAI cinematic theme layer for the demo app: background field, intro,
   chrome wordmark, and 3D tilt. Runs alongside the compiled React build. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ── fixed background layer ── */
  var bg = document.createElement('div');
  bg.className = 'mn-bg';
  bg.setAttribute('aria-hidden', 'true');
  bg.innerHTML = '<canvas id="mn-cosmos"></canvas><div class="mn-rays"></div><div class="mn-aurora"></div><div class="mn-grid"></div>' +
    '<div class="mn-orb gold"></div><div class="mn-orb blue"></div><div class="mn-stars"></div><div class="mn-flare"></div><div class="mn-vignette"></div><div class="mn-noise"></div>';
  document.body.insertBefore(bg, document.body.firstChild);

  var stars = bg.querySelector('.mn-stars');
  for (var i = 0; i < 40; i++) {
    var s = document.createElement('div');
    s.className = 'mn-star' + (Math.random() < 0.35 ? ' b' : '');
    var size = 1.5 + Math.random() * 2;
    s.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 100) + '%;animation-delay:' + (Math.random() * 4) + 's;animation-duration:' + (2.5 + Math.random() * 3) + 's';
    stars.appendChild(s);
  }
  if (!reduce) {
    (function meteor() {
      var m = document.createElement('div');
      m.className = 'mn-meteor';
      m.style.left = (10 + Math.random() * 60) + '%';
      m.style.top = (5 + Math.random() * 40) + '%';
      stars.appendChild(m);
      setTimeout(function () { m.remove(); }, 1800);
      setTimeout(meteor, 5000 + Math.random() * 9000);
    })();
  }

  /* ── additive particle field (same mechanism as the landing page) ── */
  (function cosmos() {
    var c = document.getElementById('mn-cosmos');
    var ctx = c.getContext('2d');
    if (!ctx) return;
    var W = 0, H = 0, DPR = 1, mx = 0, my = 0, cx = 0, cy = 0, vel = 0, vel2 = 0, raf = 0;
    var t0 = performance.now();
    var N = window.innerWidth < 900 ? 260 : 600;
    var COLS = ['255,224,138', '245,200,66', '150,190,255', '76,152,255', '255,250,235'];
    var sprites = COLS.map(function (col) {
      var sp = document.createElement('canvas'); sp.width = sp.height = 64;
      var g = sp.getContext('2d'); var r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      r.addColorStop(0, 'rgba(' + col + ',1)'); r.addColorStop(0.22, 'rgba(' + col + ',.55)'); r.addColorStop(1, 'rgba(' + col + ',0)');
      g.fillStyle = r; g.fillRect(0, 0, 64, 64); return sp;
    });
    var pts = [];
    for (var i = 0; i < N; i++) pts.push({ x: (Math.random() - 0.5) * 2.6, y: (Math.random() - 0.5) * 1.7, z: 0.18 + Math.random() * 0.82, seed: Math.random() * 100, s: 0.5 + Math.random() * 1.7, c: i % COLS.length });
    var resize = function () { DPR = Math.min(1.5, window.devicePixelRatio || 1); W = c.width = Math.floor(window.innerWidth * DPR); H = c.height = Math.floor(window.innerHeight * DPR); c.style.width = window.innerWidth + 'px'; c.style.height = window.innerHeight + 'px'; };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', function (e) { mx = (e.clientX / window.innerWidth - 0.5) * 2; my = (e.clientY / window.innerHeight - 0.5) * 2; }, { passive: true });
    // the app scrolls inside panels, so listen to scroll anywhere and use wheel speed
    document.addEventListener('wheel', function (e) { vel = Math.min(1, Math.abs(e.deltaY) / 400); }, { passive: true });
    document.addEventListener('scroll', function () { vel = Math.min(1, vel + 0.35); }, { passive: true, capture: true });
    var draw = function (now) {
      var t = (now - t0) / 1000;
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      cx += (mx * 0.6 - cx) * 0.03; cy += (my * 0.35 - cy) * 0.03;
      var f = Math.min(W, H) * 0.95;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var px = p.x + Math.sin(t * 0.7 + p.seed) * 0.06 + vel2 * 0.18 * Math.sin(p.seed);
        var py = p.y + Math.cos(t * 0.5 + p.seed * 1.3) * 0.05 - vel2 * 0.06;
        var z = p.z + Math.sin(t * 0.3 + p.seed) * 0.04;
        var sx = ((px - cx * 0.14) / z) * f * 0.5 + W / 2, sy = ((py - cy * 0.1) / z) * f * 0.5 + H / 2;
        var size = p.s * (1.1 / z) * (1 + vel2 * 1.6) * 3.2 * DPR; if (size > 110 * DPR) size = 110 * DPR;
        if (sx < -size || sx > W + size || sy < -size || sy > H + size) continue;
        var a = (0.32 + 0.4 * Math.sin(t * 2 + p.seed) + vel2 * 0.5) * (1.15 - z * 0.7);
        ctx.globalAlpha = Math.max(0, Math.min(1, a * 0.7));
        ctx.drawImage(sprites[p.c], sx - size / 2, sy - size / 2, size, size);
      }
      vel2 += (vel - vel2) * 0.08; vel *= 0.9;
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw(t0);
    document.addEventListener('visibilitychange', function () { if (document.hidden) cancelAnimationFrame(raf); else if (!reduce) raf = requestAnimationFrame(draw); });
  })();

  /* ── intro loader ── */
  (function intro() {
    var seen = false;
    try { seen = sessionStorage.getItem('monai-intro-demo') === '1'; } catch (e) {}
    if (seen || reduce) return;
    var el = document.createElement('div');
    el.className = 'mn-intro'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="bar top"></div><div class="bar bottom"></div><div class="sweep"></div><div class="center">' +
      '<img src="/monai-icon-180.png" alt=""><div class="word"><span>M</span><span>Ō</span><span>N</span><span>A</span><span>I</span></div>' +
      '<div class="sub">EXECUTIVE WORKSPACE · DEMO</div><div class="loadbar"><i></i></div><div class="pct">Loading 0%</div></div>';
    document.body.appendChild(el);
    document.body.classList.add('mn-intro-on');
    var letters = el.querySelectorAll('.word span');
    for (var i = 0; i < letters.length; i++) letters[i].style.animationDelay = (0.55 + i * 0.09) + 's';
    var fill = el.querySelector('.loadbar i'), pct = el.querySelector('.pct'), t0 = performance.now();
    (function tick(now) {
      var p = Math.min(1, (now - t0) / 1700); p = 1 - Math.pow(1 - p, 3);
      fill.style.transform = 'scaleX(' + p + ')'; pct.textContent = 'Loading ' + Math.round(p * 100) + '%';
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
    var done = false;
    var finish = function () {
      if (done) return; done = true;
      el.classList.add('done'); document.body.classList.remove('mn-intro-on');
      try { sessionStorage.setItem('monai-intro-demo', '1'); } catch (e) {}
      setTimeout(function () { el.remove(); }, 1000);
    };
    el.addEventListener('click', finish);
    setTimeout(finish, 2400);
  })();

  /* ── decorate the React tree: chrome wordmark, tilt cards ── */
  var decorate = function () {
    var h1s = document.querySelectorAll('h1');
    for (var i = 0; i < h1s.length; i++) {
      var h = h1s[i];
      if (h.textContent.trim() === 'MŌNAI' && !h.classList.contains('mn-wm')) {
        h.classList.add('mn-wm', 'mn-chrome'); h.setAttribute('data-text', 'MŌNAI');
      }
    }
    if (!fine || reduce) return;
    var cards = document.querySelectorAll('#root .rounded-2xl.border:not(.mn-tilt), #root .rounded-xl.border:not(.mn-tilt), #root .glass-panel:not(.mn-tilt)');
    for (var j = 0; j < cards.length; j++) {
      var el = cards[j], r = el.getBoundingClientRect();
      if (r.width > 0 && r.width < 720 && r.height > 60 && r.height < 620 && !el.closest('.mn-tilt')) el.classList.add('mn-tilt');
    }
  };
  var root = document.getElementById('root');
  var pending = 0;
  new MutationObserver(function () { if (pending) return; pending = setTimeout(function () { pending = 0; decorate(); }, 60); }).observe(root, { childList: true, subtree: true });
  decorate();

  if (fine && !reduce) {
    document.addEventListener('pointermove', function (e) {
      var el = e.target.closest && e.target.closest('.mn-tilt');
      if (!el) return;
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--ry', (x * 6).toFixed(2) + 'deg');
      el.style.setProperty('--rx', (-y * 6).toFixed(2) + 'deg');
      el.style.setProperty('--gx', ((x + 0.5) * 100).toFixed(1) + '%');
      el.style.setProperty('--gy', ((y + 0.5) * 100).toFixed(1) + '%');
    }, { passive: true });
    document.addEventListener('pointerout', function (e) {
      var el = e.target.closest && e.target.closest('.mn-tilt');
      if (el && !(e.relatedTarget && el.contains(e.relatedTarget))) { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); }
    }, { passive: true });
  }
})();
