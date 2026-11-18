/*! scs-site/nav-label.js v1.1.0 — Scott Clark Studio label nav menu. No dependencies.
 *
 * Markup (Webflow, nav-label_component):
 *   <nav data-nav-label aria-label="Primary">
 *     <div class="nav-label_meta" data-nav-compact> … </div>
 *     <button data-nav-label-toggle aria-expanded="false" aria-controls="nav-panel"><span class="nav-label_toggle-icon"></span><span data-nav-label-text>Menu</span></button>
 *     <div data-nav-label-panel id="nav-panel"> … four links … </div>
 *     <div class="nav-label_status" data-nav-compact> … </div>
 *   </nav>
 * Open state: the nav, the panel and the toggle all get .is-open (style with combo classes). Closed panel is inert.
 * Esc closes and returns focus to the toggle; opening moves focus to the first link; clicking outside closes.
 *
 * Compact state (v1.1.0, DEC-091): once the page is scrolled past data-nav-label-compact-at (default 100px),
 * the nav and every [data-nav-compact] element inside it get .is-compact, so the card shrinks to the
 * monogram + Menu row and the status tab tucks away. Webflow combo classes can't target a parent's
 * state, so the class goes on each element. The menu is never compact while it is open.
 */
(function () {
  "use strict";
  function setup(nav) {
    var btn = nav.querySelector("[data-nav-label-toggle]"), panel = nav.querySelector("[data-nav-label-panel]");
    if (!btn || !panel) return;
    var label = btn.querySelector("[data-nav-label-text], .nav-label_toggle-text") || btn.querySelector("span:last-child");
    var compactEls = [nav].concat(Array.prototype.slice.call(nav.querySelectorAll("[data-nav-compact]")));
    var at = parseInt(nav.getAttribute("data-nav-label-compact-at"), 10);
    if (isNaN(at)) at = 100;
    var compact = null, ticking = false;

    function setCompact(on) {
      if (on === compact) return;
      compact = on;
      compactEls.forEach(function (el) { el.classList.toggle("is-compact", on); });
    }
    function update() {
      ticking = false;
      setCompact(!nav.classList.contains("is-open") && window.scrollY > at);
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

    function set(open, focusBtn) {
      btn.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      panel.classList.toggle("is-open", open);    // Webflow combo classes can't target a parent's state
      btn.classList.toggle("is-open", open);
      panel.inert = !open;
      if (label) label.textContent = open ? "Close" : "Menu";
      update();
      if (open) { var first = panel.querySelector("a,button"); if (first) first.focus(); }
      else if (focusBtn) btn.focus();
    }
    set(false);
    btn.addEventListener("click", function () { set(btn.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) set(false, true); });
    document.addEventListener("click", function (e) { if (nav.classList.contains("is-open") && !nav.contains(e.target)) set(false); });
    panel.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pageshow", update);
  }
  function init() { document.querySelectorAll("[data-nav-label]").forEach(function (n) { if (!n.__navLabel) { n.__navLabel = true; setup(n); } }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
