/*! scs-site/nav-label.js v1.2.0 — Scott Clark Studio label nav menu + in-page links. No dependencies.
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
 * In-page links (v1.2.0): any <a href="#id"> on the page (e.g. "Book a 20-minute intro" → #contact) scrolls
 * to its target and keeps correcting until it actually arrives — lazy-loaded images above the target can
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

  /* ---- in-page anchors that land where they should ---- */
  var run = 0;
  function want(el) { return Math.min(el.getBoundingClientRect().top + window.scrollY, document.documentElement.scrollHeight - window.innerHeight); }
  function goTo(el) {
    var id = ++run, tries = 0, last = -1, still = 0;
    var behavior = reduce ? "auto" : "smooth";
    function aim() { window.scrollTo({ top: want(el), behavior: behavior }); }
    function done() {
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    }
    aim();
    (function check() {
      if (id !== run) return;                         // a newer anchor click or a user scroll took over
      var y = window.scrollY;
      if (Math.abs(y - want(el)) <= 2) { done(); return; }
      still = Math.abs(y - last) < 0.5 ? still + 1 : 0;
      last = y;
      if (still >= 6) { if (++tries > 4) { done(); return; } still = 0; aim(); }   // settled short: aim again
      requestAnimationFrame(check);
    })();
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
