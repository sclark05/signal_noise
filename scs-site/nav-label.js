/*! scs-site/nav-label.js v1.0.1 — Scott Clark Studio label nav menu. No dependencies.
 *
 * Markup (Webflow component nav_label):
 *   <nav data-nav-label aria-label="Primary">
 *     <button data-nav-label-toggle aria-expanded="false" aria-controls="nav-panel"><span class="nav-label_toggle-icon"></span><span data-nav-label-text>Menu</span></button>
 *     <div data-nav-label-panel id="nav-panel"> … four links … </div>
 *   </nav>
 * Open state: the nav, the panel and the toggle all get .is-open (style with combo classes). Closed panel is inert.
 * Esc closes and returns focus to the toggle; opening moves focus to the first link; clicking outside closes.
 */
(function () {
  "use strict";
  function setup(nav) {
    var btn = nav.querySelector("[data-nav-label-toggle]"), panel = nav.querySelector("[data-nav-label-panel]");
    if (!btn || !panel) return;
    var label = btn.querySelector("[data-nav-label-text], .nav-label_toggle-text") || btn.querySelector("span:last-child");
    function set(open, focusBtn) {
      btn.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      panel.classList.toggle("is-open", open);    // Webflow combo classes can't target a parent's state
      btn.classList.toggle("is-open", open);
      panel.inert = !open;
      if (label) label.textContent = open ? "Close" : "Menu";
      if (open) { var first = panel.querySelector("a,button"); if (first) first.focus(); }
      else if (focusBtn) btn.focus();
    }
    set(false);
    btn.addEventListener("click", function () { set(btn.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) set(false, true); });
    document.addEventListener("click", function (e) { if (nav.classList.contains("is-open") && !nav.contains(e.target)) set(false); });
    panel.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
  }
  function init() { document.querySelectorAll("[data-nav-label]").forEach(function (n) { if (!n.__navLabel) { n.__navLabel = true; setup(n); } }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
