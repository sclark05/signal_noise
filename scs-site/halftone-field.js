/*! scs-site/halftone-field.js v1.0.0 — Scott Clark Studio footer halftone field. No dependencies.
 *
 * A grid of dots whose size drifts with a slow, layered wave — the riso/halftone language of the
 * ruled-bars hero, in a calmer form for the footer (DEC-093). Fine pointers get a soft lens.
 *
 * Markup:  <div data-halftone-field aria-hidden="true"></div>   (the script adds a canvas that fills it)
 * Options (data-* on that element, all optional):
 *   data-ink="#F5F3EF"   dot colour            data-cell="14"   grid pitch in CSS px
 *   data-max="0.46"      max radius / cell     data-speed="1"   motion speed multiplier
 *   data-lens="140"      cursor lens radius px (0 = off)
 *   data-fade="0.45"     soft elliptical edge, as a share of the radius (dots dissolve into the space around)
 * Pauses off-screen and in hidden tabs. prefers-reduced-motion: one still frame.
 */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  function num(el, name, dflt) { var v = parseFloat(el.getAttribute("data-" + name)); return isNaN(v) ? dflt : v; }
  function smooth(e0, e1, x) { var t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }

  function setup(host) {
    var ink = host.getAttribute("data-ink") || getComputedStyle(host).color || "#F5F3EF";
    var cell = num(host, "cell", 14), maxR = num(host, "max", 0.46), speed = num(host, "speed", 1);
    var lensR = finePointer ? num(host, "lens", 140) : 0, fade = Math.min(0.95, num(host, "fade", 0.45));

    var canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none";
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    host.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    var w = 0, h = 0, dpr = 1, visible = true, raf = 0, t0 = performance.now();
    var mx = -1e4, my = -1e4, lx = -1e4, ly = -1e4;

    function resize() {
      var r = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduce || !visible) draw(0.0);
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = ink;
      lx += (mx - lx) * 0.12; ly += (my - ly) * 0.12;
      var cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
      var ox = (w - (cols - 1) * cell) / 2, oy = (h - (rows - 1) * cell) / 2;
      var cx = w / 2, cy = h / 2, rMax = cell * maxR;
      ctx.beginPath();
      for (var j = 0; j < rows; j++) {
        var y = oy + j * cell, ny = y / 90, qy = (y - cy) / cy;
        for (var i = 0; i < cols; i++) {
          var x = ox + i * cell, nx = x / 90;
          // Two slow travelling waves, one bent by the other: soft bands that drift and fold.
          var a = Math.sin(nx * 0.9 + t * 0.55 + Math.sin(ny * 0.8 - t * 0.35) * 1.6);
          var b = Math.cos(ny * 1.1 - t * 0.4 + Math.sin(nx * 0.6 + t * 0.25) * 1.2);
          var v = 0.5 + 0.5 * (a * 0.6 + b * 0.4);
          v = v * v * (3 - 2 * v);
          var qx = (x - cx) / cx, d = Math.sqrt(qx * qx + qy * qy);
          var e = 1 - smooth(1 - fade, 1, d);
          if (lensR) {
            var dx = x - lx, dy = y - ly, d2 = dx * dx + dy * dy, L2 = lensR * lensR;
            if (d2 < L2) { var k = 1 - d2 / L2; v = v + (1 - v) * k * k * 0.85; }
          }
          var r = rMax * v * e;
          if (r > 0.35) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 6.2832); }
        }
      }
      ctx.fill();
    }

    function frame(now) {
      raf = 0;
      if (!visible || document.hidden) return;
      draw(((now - t0) / 1000) * speed);
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf && !reduce && visible && !document.hidden) raf = requestAnimationFrame(frame); }

    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(host); else window.addEventListener("resize", resize);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); }, { rootMargin: "100px" }).observe(host);
    }
    document.addEventListener("visibilitychange", start);
    if (lensR) {
      var zone = host.closest("[data-halftone-zone]") || host;
      zone.addEventListener("pointermove", function (e) { var r = host.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
      zone.addEventListener("pointerleave", function () { mx = -1e4; my = -1e4; });
    }
    resize();
    if (reduce) draw(0.0); else start();
  }

  function init() { document.querySelectorAll("[data-halftone-field]").forEach(function (el) { if (!el.__halftone) { el.__halftone = true; setup(el); } }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
