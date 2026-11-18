/*! scs-site/ruled-bars.js v1.0.0 — Scott Clark Studio home hero. No dependencies.
 *
 * Markup (Webflow):
 *   <header class="section_home-hero">           position:fixed; inset:0; height:100svh
 *     <div data-ruled-bars data-theme-bg="#1D4ED8" data-ink="#F4EFE6" ...></div>   the field; canvas is injected
 *     <button data-ruled-bars-toggle aria-pressed="false"><span>Pause motion</span></button>
 *   </header>
 *   <div data-ruled-bars-shade></div>            optional: fixed overlay darkened as content covers the hero
 *
 * Every setting is a data attribute on the field (see DEFAULTS); missing ones fall back to the defaults.
 * Honours prefers-reduced-motion (one still frame, no parallax, toggle hidden).
 */
(function () {
  "use strict";

  var DEFAULTS = {
    ink: "#F4EFE6", motion: "wave", count: 11, thick: 0.78, thin: 0.34, soft: 0.23, stagger: 0.014,
    speed: 1, travel: 0.2, follow: 0.7, lens: 160,
    texture: "stipple", cell: 17, angle: 45, cover: 1, wear: 1,
    parallax: 0.28, shade: 0.45, fps: 30, maxDpr: 2
  };
  var NUM = ["count", "thick", "thin", "soft", "stagger", "speed", "travel", "follow", "lens", "cell", "angle", "cover", "wear", "parallax", "shade", "fps", "maxDpr"];

  function smooth(e0, e1, x) { var t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }
  function readOpts(el) {
    var o = {}, k, ds = el.dataset;
    for (k in DEFAULTS) o[k] = DEFAULTS[k];
    ["ink", "motion", "texture"].forEach(function (k) { if (ds[k]) o[k] = ds[k]; });
    NUM.forEach(function (k) { if (ds[k] != null && isFinite(parseFloat(ds[k]))) o[k] = parseFloat(ds[k]); });
    o.count = Math.max(1, Math.round(o.count));
    return o;
  }

  function RuledBars(field) {
    this.field = field;
    this.o = readOpts(field);
    this.hero = field.closest("[data-ruled-bars-hero]") || field.closest("header, section") || field.parentElement;
    this.shade = document.querySelector("[data-ruled-bars-shade]");
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.fine = matchMedia("(pointer: fine)").matches;
    this.dpr = Math.min(window.devicePixelRatio || 1, this.o.maxDpr);
    var cv = this.cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    if (getComputedStyle(field).position === "static") field.style.position = "relative";
    field.appendChild(cv);
    this.c = cv.getContext("2d");
    this.t = 0; this.last = 0; this.raf = 0; this.paused = false; this.visible = true;
    this.cur = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, s: 0, on: false };
    this.screen = null; this.screenKey = "";
    this._wear();
    this._bind();
    this._resize();
    this._frame(performance.now(), true);
    this._scroll();
    this._kick();
  }

  /* letterpress wear: ink knocked out in fine speckle + soft blotches (generated once) */
  RuledBars.prototype._wear = function () {
    var S = 384, g = document.createElement("canvas"); g.width = g.height = S;
    var x = g.getContext("2d"), lo = document.createElement("canvas"); lo.width = lo.height = 24;
    var lx = lo.getContext("2d"), ld = lx.createImageData(24, 24), k;
    for (k = 0; k < ld.data.length; k += 4) ld.data[k + 3] = Math.random() * 255;
    lx.putImageData(ld, 0, 0); x.imageSmoothingEnabled = true; x.drawImage(lo, 0, 0, S, S);
    var blot = x.getImageData(0, 0, S, S).data, id = x.createImageData(S, S);
    for (k = 0; k < id.data.length; k += 4) {
      var a = Math.random() < 0.07 ? 0.55 + Math.random() * 0.45 : 0;
      a = Math.max(a, Math.max(0, blot[k + 3] / 255 - 0.72) * 0.9);
      id.data[k + 3] = Math.min(1, a) * 255;
    }
    x.clearRect(0, 0, S, S); x.putImageData(id, 0, 0);
    this.wearPat = this.c.createPattern(g, "repeat");
  };

  /* print screen the bars are rebuilt through; cached until a setting changes */
  RuledBars.prototype._buildScreen = function () {
    var o = this.o, d = this.dpr, key = [o.texture, o.cell, o.angle, o.cover, d].join("|");
    if (key === this.screenKey) return; this.screenKey = key; this.screen = null;
    if (o.texture === "letterpress" || (o.texture === "stipple" && o.cover >= 1)) return;
    var pc = document.createElement("canvas"), x = pc.getContext("2d"), S = Math.max(2, Math.round(o.cell * d));
    if (o.texture === "halftone") {
      pc.width = pc.height = S; var r = Math.sqrt(o.cover / Math.PI) * S;
      x.beginPath(); x.arc(S / 2, S / 2, r, 0, Math.PI * 2); x.fill();
      [[0, 0], [S, 0], [0, S], [S, S]].forEach(function (p) { x.beginPath(); x.arc(p[0], p[1], Math.max(0, r - S * 0.5) * 1.2, 0, Math.PI * 2); x.fill(); });
    } else if (o.texture === "lines") {
      pc.width = pc.height = S; x.fillRect(0, 0, S, Math.max(1, S * o.cover));
    } else {
      var T = 384, L = Math.max(8, Math.round(T / (o.cell * 1.6))), lo = document.createElement("canvas");
      pc.width = pc.height = T; lo.width = lo.height = L;
      var lx = lo.getContext("2d"), ld = lx.createImageData(L, L), k;
      for (k = 0; k < ld.data.length; k += 4) { var v = Math.random() * 255; ld.data[k] = ld.data[k + 1] = ld.data[k + 2] = v; ld.data[k + 3] = 255; }
      lx.putImageData(ld, 0, 0); x.imageSmoothingEnabled = true; x.drawImage(lo, 0, 0, T, T);
      var cl = x.getImageData(0, 0, T, T), id = x.createImageData(T, T);
      for (k = 0; k < id.data.length; k += 4) id.data[k + 3] = (0.55 * Math.random() + 0.45 * cl.data[k] / 255) < o.cover ? 255 : 0;
      x.clearRect(0, 0, T, T); x.putImageData(id, 0, 0);
    }
    this.screen = this.c.createPattern(pc, "repeat");
    if (this.screen.setTransform) {
      var m = new DOMMatrix().scale(1 / d, 1 / d);
      this.screen.setTransform(o.texture === "stipple" ? m : m.rotate(o.angle));
    }
  };

  RuledBars.prototype._resize = function () {
    var r = this.field.getBoundingClientRect();
    this.W = r.width; this.H = r.height;
    this.cv.width = Math.round(this.W * this.dpr); this.cv.height = Math.round(this.H * this.dpr);
  };

  RuledBars.prototype._draw = function () {
    var o = this.o, c = this.c, W = this.W, H = this.H, n = o.count, pitch = H / n, t = this.t, cur = this.cur;
    if (!W || !H) return;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); c.clearRect(0, 0, W, H);
    c.fillStyle = o.ink; c.beginPath();
    var STEP = Math.max(4, W / 220);
    for (var i = 0; i < n; i++) {
      var base = (i + 1) * pitch - pitch * 0.08, k = n > 1 ? i / (n - 1) : 0;
      var edge = 0.72 + (k - 0.5) * o.stagger * n;
      if (o.motion === "wave") edge += Math.sin(t * 0.7 - k * 2.6) * o.travel;
      else if (o.motion === "drift") edge += (Math.sin(t * 0.45 + k * 1.9) * 0.65 + Math.sin(t * 0.23 - k * 4.1) * 0.35) * o.travel;
      else if (o.motion === "breathe") edge += Math.sin(t * 0.6) * o.travel;
      else edge += Math.sin(t * 0.9 - k * 6.2) * Math.cos(t * 0.2) * o.travel * 1.2;
      if (cur.s > 0.01 && o.follow > 0) {
        var near = Math.exp(-Math.pow(((base - pitch / 2) - cur.y) / (pitch * 3.5), 2));
        edge += (cur.x / W - edge) * near * o.follow * cur.s;
      }
      c.moveTo(0, base);
      for (var x = 0; x <= W + STEP; x += STEP) {
        var w = o.thick + (o.thin - o.thick) * smooth(edge - o.soft, edge + o.soft, x / W);
        if (cur.s > 0.01 && o.lens > 0) {
          var dx = x - cur.x, dy = (base - pitch / 2) - cur.y;
          w += (0.035 - w) * cur.s * smooth(o.lens, o.lens * 0.25, Math.sqrt(dx * dx + dy * dy * 1.6));
        }
        c.lineTo(Math.min(x, W), base - w * pitch);
      }
      c.lineTo(W, base); c.closePath();
    }
    c.fill();
    this._buildScreen();
    if (this.screen) { c.globalCompositeOperation = "destination-in"; c.fillStyle = this.screen; c.fillRect(0, 0, W, H); }
    if (o.wear > 0) { c.globalCompositeOperation = "destination-out"; c.globalAlpha = o.wear; c.fillStyle = this.wearPat; c.fillRect(0, 0, W, H); }
    c.globalCompositeOperation = "source-over"; c.globalAlpha = 1;
  };

  RuledBars.prototype._frame = function (now, force) {
    if (!force && now - this.last < 1000 / this.o.fps) return;
    var dt = this.last ? Math.min(0.1, (now - this.last) / 1000) : 0; this.last = now;
    if (!this.reduced) this.t += dt * this.o.speed;
    var cur = this.cur;
    cur.x += (cur.tx - cur.x) * 0.16; cur.y += (cur.ty - cur.y) * 0.16; cur.s += ((cur.on ? 1 : 0) - cur.s) * 0.08;
    this._draw();
  };

  RuledBars.prototype._running = function () { return !this.reduced && !this.paused && this.visible && !document.hidden; };
  RuledBars.prototype._kick = function () {
    var self = this;
    if (this._running() && !this.raf) { var loop = function (n) { self.raf = requestAnimationFrame(loop); self._frame(n, false); }; this.raf = requestAnimationFrame(loop); }
    else if (!this._running() && this.raf) { cancelAnimationFrame(this.raf); this.raf = 0; }
  };

  /* fixed hero: drift up behind the content, darken as it is covered, stop animating once covered */
  RuledBars.prototype._scroll = function () {
    var vh = window.innerHeight, y = window.scrollY, o = this.o;
    if (!this.reduced && o.parallax) this.hero.style.transform = "translate3d(0," + (-y * o.parallax).toFixed(1) + "px,0)";
    if (this.shade) this.shade.style.opacity = (Math.min(1, y / vh) * o.shade).toFixed(3);
    var v = y < vh * 1.02; if (v !== this.visible) { this.visible = v; this._kick(); }
    // fully covered: hide the fixed hero so it can never paint over later content (e.g. the footer)
    var hide = y > vh * 1.1; if (hide !== this.hidden) { this.hidden = hide; this.hero.style.visibility = hide ? "hidden" : ""; if (this.shade) this.shade.style.visibility = hide ? "hidden" : ""; }
  };

  RuledBars.prototype._bind = function () {
    var self = this, ticking = false;
    this._onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; self._scroll(); }); } };
    this._onVis = function () { self._kick(); };
    this._ro = new ResizeObserver(function () { self._resize(); self._frame(performance.now(), true); });
    this._ro.observe(this.field);
    addEventListener("scroll", this._onScroll, { passive: true });
    document.addEventListener("visibilitychange", this._onVis);
    if (this.fine && !this.reduced) {
      this._onMove = function (e) {
        var r = self.field.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        var inside = x >= -40 && y >= -40 && x <= r.width + 40 && y <= r.height + 40;
        if (inside && !self.cur.on) { self.cur.x = x; self.cur.y = y; }
        self.cur.tx = x; self.cur.ty = y; self.cur.on = inside;
      };
      addEventListener("pointermove", this._onMove, { passive: true });
    }
    var btn = this.btn = (this.hero || document).querySelector("[data-ruled-bars-toggle]");
    if (btn) {
      if (this.reduced) { btn.hidden = true; return; }
      var label = btn.querySelector("span") || btn;
      this._onBtn = function () {
        self.paused = !self.paused; btn.setAttribute("aria-pressed", String(self.paused));
        label.textContent = self.paused ? "Play motion" : "Pause motion"; self.last = 0; self._kick();
      };
      btn.addEventListener("click", this._onBtn);
    }
  };

  RuledBars.prototype.pause = function () { this.paused = true; this._kick(); };
  RuledBars.prototype.play = function () { this.paused = false; this.last = 0; this._kick(); };
  RuledBars.prototype.set = function (opts) { for (var k in opts) this.o[k] = opts[k]; this.screenKey = ""; this._frame(performance.now(), true); };
  RuledBars.prototype.destroy = function () {
    cancelAnimationFrame(this.raf); this._ro.disconnect();
    removeEventListener("scroll", this._onScroll); document.removeEventListener("visibilitychange", this._onVis);
    if (this._onMove) removeEventListener("pointermove", this._onMove);
    if (this._onBtn) this.btn.removeEventListener("click", this._onBtn);
    this.hero.style.transform = ""; this.hero.style.visibility = ""; this.cv.remove(); delete this.field.__ruledBars;
  };

  function init() {
    document.querySelectorAll("[data-ruled-bars]").forEach(function (el) { if (!el.__ruledBars) el.__ruledBars = new RuledBars(el); });
  }
  window.ScsRuledBars = RuledBars;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
