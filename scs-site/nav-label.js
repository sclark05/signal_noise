/*! scs-site/nav-label.js v1.2.1 — Scott Clark Studio label nav menu + in-page links. No dependencies.
 *
 * Markup (Webflow, nav-label_component):
 *   <nav data-nav-label aria-label="Primary">
 *     <a data-nav-label-toggle aria-expanded="false" aria-controls="nav-panel"><span class="nav-label_toggle-icon"></span><span data-nav-label-text>Menu</span></a>
 *     <div data-nav-label-panel id="nav-panel"> … four links … </div>
 *   </nav>
 * Open state: the nav, the panel and the toggle all get .is-open (style with combo classes; Webflow combos
 * can't target a parent's state). Closed panel is inert. Esc closes and returns focus to the toggle;
 * opening moves focus to the first link; clicking outside closes.
 *
 * In-page links (v1.2.x): any <a href="#id"> on the page (e.g. "Book a 20-minute intro" → #contact) glides
 * to its target with the site's ease (v1.2.1) and follows it until it actually arrives — lazy-loaded images above the target can
 * grow the page mid-scroll, which made Webflow's one-shot smooth scroll stop short. Focus moves to the
 * target for keyboard and screen-reader users. Opt out per link with data-no-anchor-fix.
 *
 * v1.2.0 also removes the compact-on-scroll state (DEC-094: nothing changes on scroll).
 */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Webflow renders these toggles as <a>; make any non-<button> behave like one (focusable, Space/Enter, no "#" jump). */
  function asButton(el) {
    if (el.tagName === "BUTTON") return;
    el.setAttribute("role", "button");
    var noHref = !el.hasAttribute("href");
    if (noHref) el.tabIndex = 0;
    el.addEventListener("keydown", function (e) {
      if (e.key === " " || e.key === "Spacebar" || (noHref && e.key === "Enter")) { e.preventDefault(); el.click(); }
    });
  }

  function setup(nav) {
    var btn = nav.querySelector("[data-nav-label-toggle]"), panel = nav.querySelector("[data-nav-label-panel]");
    if (!btn || !panel) return;
    var label = btn.querySelector("[data-nav-label-text], .nav-label_toggle-text") || btn.querySelector("span:last-child");

    function set(open, focusBtn) {
      btn.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      panel.classList.toggle("is-open", open);
      btn.classList.toggle("is-open", open);
      panel.inert = !open;
      if (label) label.textContent = open ? "Close" : "Menu";
      if (open) { var first = panel.querySelector("a,button"); if (first) first.focus(); }
      else if (focusBtn) btn.focus();
    }
    set(false);
    asButton(btn);
    btn.addEventListener("click", function (e) { e.preventDefault(); set(btn.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) set(false, true); });
    document.addEventListener("click", function (e) { if (nav.classList.contains("is-open") && !nav.contains(e.target)) set(false); });
    panel.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
  }

  /* ---- in-page anchors that land where they should ----
     Our own eased scroll: duration scales with distance (600–1400ms), easing matches the site's
     --ease-in-out (cubic-bezier(.65,0,.35,1)), and the destination is re-read every frame, so if
     lazy images grow the page mid-scroll the path bends smoothly instead of stopping short. */
  var run = 0;
  function want(el) { return Math.max(0, Math.min(el.getBoundingClientRect().top + window.scrollY, document.documentElement.scrollHeight - window.innerHeight)); }
  function bezier(x1, y1, x2, y2) {
    function a(p1, p2) { return 1 - 3 * p2 + 3 * p1; } function b(p1, p2) { return 3 * p2 - 6 * p1; } function c(p1) { return 3 * p1; }
    function at(t, p1, p2) { return ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t; }
    function slope(t, p1, p2) { return 3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1); }
    return function (x) {
      var t = x;
      for (var i = 0; i < 8; i++) { var d = slope(t, x1, x2); if (Math.abs(d) < 1e-6) break; t -= (at(t, x1, x2) - x) / d; }
      return at(Math.min(1, Math.max(0, t)), y1, y2);
    };
  }
  var ease = bezier(0.65, 0, 0.35, 1);
  function goTo(el) {
    var id = ++run;
    function done() {
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    }
    var from = window.scrollY, dist = Math.abs(want(el) - from);
    if (reduce || dist < 2) { window.scrollTo(0, want(el)); done(); return; }
    var dur = Math.min(1400, Math.max(600, 400 + dist * 0.25)), t0 = 0, dest = want(el), y = from;
    document.documentElement.style.scrollBehavior = "auto";   // our animation, not the browser's
    (function step(now) {
      if (id !== run) { document.documentElement.style.scrollBehavior = ""; return; }   // user took over
      if (!t0) t0 = now;
      var k = Math.min(1, (now - t0) / dur);
      dest += (want(el) - dest) * 0.12;               // if the page grows, the destination drifts, never snaps
      var next = from + (dest - from) * ease(k);
      y += Math.max(-140, Math.min(140, next - y));   // cap any single frame's move
      window.scrollTo(0, y);
      if (k < 1 || Math.abs(want(el) - y) > 1) {
        if (k >= 1) { from = y; t0 = now; dur = Math.min(600, Math.max(250, Math.abs(want(el) - y) * 0.6)); dest = want(el); }
        requestAnimationFrame(step); return;
      }
      document.documentElement.style.scrollBehavior = "";
      done();
    })(performance.now());
  }
  function cancel() { run++; }
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute("data-no-anchor-fix") || a.matches("[data-nav-label-toggle], [role=button]")) return;
    var hash = a.getAttribute("href");
    if (hash.length < 2) return;
    var el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!el) return;
    e.preventDefault();
    e.stopImmediatePropagation();                     // keep Webflow's one-shot smooth scroll from competing
    if (history.pushState) history.pushState(null, "", hash);
    goTo(el);
  }, true);
  window.addEventListener("wheel", cancel, { passive: true });
  window.addEventListener("touchstart", cancel, { passive: true });
  window.addEventListener("keydown", function (e) { if (/^(Arrow|Page|Home|End| )/.test(e.key)) cancel(); });

  function init() { document.querySelectorAll("[data-nav-label]").forEach(function (n) { if (!n.__navLabel) { n.__navLabel = true; setup(n); } }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
