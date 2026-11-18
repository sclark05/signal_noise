/*! scs-site/page-transition.js v1.0.0 — Scott Clark Studio "wave" page transition. No dependencies.
 *
 * Load site-wide (footer, defer). Add this to the site <head> so a page reached through the transition
 * starts covered and never flashes (colour must match data-color below):
 *
 *   <style>html.scs-pt-in::after{content:"";position:fixed;inset:0;z-index:2147483646;background:#F4EFE6;
 *     animation:scs-pt-fail 0s 1.5s forwards}@keyframes scs-pt-fail{to{visibility:hidden}}</style>
 *   <script>try{if(sessionStorage.getItem("scs-pt")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)
 *     document.documentElement.classList.add("scs-pt-in")}catch(e){}</script>
 *
 * Options: <html data-pt-color="#F4EFE6" data-pt-bars="12" data-pt-duration="620">
 * Opt a link out with data-no-transition. Reduced motion: no transition at all.
 */
(function () {
  "use strict";
  var KEY = "scs-pt", root = document.documentElement, ds = root.dataset;
  var COLOR = ds.ptColor || "#F4EFE6", BARS = parseInt(ds.ptBars, 10) || 12, DUR = parseInt(ds.ptDuration, 10) || 620;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2), busy = false, cv, cx;

  function smooth(e0, e1, x) { var t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }
  function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function store(v) { try { v ? sessionStorage.setItem(KEY, "1") : sessionStorage.removeItem(KEY); } catch (e) {} }

  function canvas() {
    if (cv) return cv;
    cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:2147483647;pointer-events:none;display:none";
    document.body.appendChild(cv); cx = cv.getContext("2d");
    return cv;
  }

  /* mode "cover": bars sweep in left→right, each a beat behind the one above, until the screen is solid.
     mode "reveal": the same sweep carries them off to the right. */
  function sweep(mode, done) {
    var w = innerWidth, h = innerHeight, pitch = h / BARS, t0 = performance.now(), STEP = Math.max(6, w / 160);
    canvas(); cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cv.style.display = "block"; cv.style.pointerEvents = "auto";
    (function f(now) {
      var p = Math.min(1, (now - t0) / DUR);
      cx.clearRect(0, 0, w, h); cx.fillStyle = COLOR; cx.beginPath();
      for (var i = 0; i < BARS; i++) {
        var k = BARS > 1 ? i / (BARS - 1) : 0, base = (i + 1) * pitch + 1;
        var front = ease(Math.min(1, Math.max(0, (p - k * 0.28) / 0.72))) * 1.5 - 0.25;
        cx.moveTo(0, base);
        for (var x = 0; x <= w + STEP; x += STEP) {
          var u = x / w, cov = mode === "cover" ? smooth(front + 0.25, front - 0.25, u) : smooth(front - 0.25, front + 0.25, u);
          cx.lineTo(Math.min(x, w), base - (pitch + 2) * cov);
        }
        cx.lineTo(w, base); cx.closePath();
      }
      cx.fill();
      if (p < 1) requestAnimationFrame(f); else if (done) done();
    })(t0);
  }

  function hide() { if (cv) { cv.style.display = "none"; cv.style.pointerEvents = "none"; } root.classList.remove("scs-pt-in"); busy = false; }

  function eligible(a, e) {
    if (!a || a.hasAttribute("data-no-transition") || a.hasAttribute("download")) return false;
    if (a.target && a.target !== "_self") return false;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    var url; try { url = new URL(a.href, location.href); } catch (err) { return false; }
    if (url.origin !== location.origin) return false;
    if (url.pathname === location.pathname && url.search === location.search) return false; // same page / hash links
    return url;
  }

  function prefetch(a) {
    if (a.__ptPrefetched || !a.href) return; a.__ptPrefetched = true;
    var l = document.createElement("link"); l.rel = "prefetch"; l.href = a.href; document.head.appendChild(l);
  }

  if (!reduced) {
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]"), url = eligible(a, e);
      if (!url || busy) return;
      e.preventDefault(); busy = true; store(true);
      sweep("cover", function () { location.href = url.href; });
    });
    ["pointerenter", "focusin", "touchstart"].forEach(function (ev) {
      document.addEventListener(ev, function (e) { var a = e.target.closest && e.target.closest("a[href]"); if (a && eligible(a, { button: 0 })) prefetch(a); }, { passive: true, capture: true });
    });
  }

  function arrive() {
    var came = false; try { came = !!sessionStorage.getItem(KEY); } catch (e) {}
    store(false);
    if (!came || reduced) { hide(); return; }
    busy = true; canvas();
    // draw a full cover first, then drop the CSS cover underneath it and play the reveal
    cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr);
    cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.fillStyle = COLOR; cx.fillRect(0, 0, innerWidth, innerHeight);
    cv.style.display = "block"; root.classList.remove("scs-pt-in");
    requestAnimationFrame(function () { sweep("reveal", hide); });
  }

  // back/forward cache: never land on a covered page
  addEventListener("pageshow", function (e) { if (e.persisted) { store(false); hide(); } });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arrive); else arrive();
})();
