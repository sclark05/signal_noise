# scs-site

Scripts for the Scott Clark Studio Webflow site. Each file is self-contained with no dependencies and is served from jsDelivr, **pinned to a commit SHA** with an SRI hash:

```
https://cdn.jsdelivr.net/gh/sclark05/signal_noise@<commit-sha>/scs-site/<file>.js
```

Webflow registers each file as a hosted script (name, version, URL, SRI hash), so pushing here never changes the live site. Only registering a new version in Webflow and applying it to a page does.

| File | Version | Where it loads | What it does |
| --- | --- | --- | --- |
| `ruled-bars.js` | 1.1.1 | Home (hero + footer band) | Ruled bars: tapered bars with a looping wave, riso stipple + ink wear, cursor pull/lens, pause control. Hero mode: fixed behind the content with parallax, a cover shade, and a pause once covered. Inline mode: a band anywhere on the page (the footer), animating only while on screen, optionally mirrored. |
| `nav-label.js` | 1.2.1 | Every page with the label nav | Label nav menu (aria-expanded, inert closed panel, Esc closes and returns focus, click outside closes) and in-page `#` links (eased, distance-paced scroll that keeps correcting as lazy images grow the page, cancels on user input, focuses the target, jumps under reduced motion). |
| `page-transition.js` | 1.0.1 | Every page, plus a small `<head>` snippet (below) | Wave page transition: bars cover the screen, the page navigates, the next page reveals. Prefetches on hover; skips modified clicks, new-tab and same-page links; back/forward cache safe; CSS failsafe. |
| `halftone-field.js` | 1.0.0 | Not in use | An earlier footer direction (halftone dot field), replaced by the ruled-bars band. Kept for reference. |

All of them respect `prefers-reduced-motion` (still frames, no transition, no eased scroll).

Toggles rendered by Webflow as `<a>` (Webflow turns `<button>` into a link) are given `role="button"`, focusability, Space/Enter activation and no `#` jump.

## Ruled bars settings
Tune visually with the **Ruled Bars builder** (`../Ruled_Bars_app/`, live at `sclark05.github.io/signal_noise/Ruled_Bars_app/`). It runs this exact script and outputs the Webflow custom attributes to paste.

Data attributes on the `[data-ruled-bars]` element override the defaults (the defaults are the locked hero design, 2026-11-18):

`data-ink` `#F4EFE6` · `data-motion` `wave` · `data-count` `11` · `data-thick` `0.78` · `data-thin` `0.34` · `data-soft` `0.23` · `data-stagger` `0.014` · `data-speed` `1` · `data-travel` `0.2` · `data-follow` `0.7` · `data-lens` `160` · `data-texture` `stipple` · `data-cell` `17` · `data-angle` `45` · `data-cover` `1` · `data-wear` `1` · `data-parallax` `0.28` · `data-shade` `0.45`

Motion: `wave` `drift` `breathe` `cascade`. Texture: `letterpress` `halftone` `lines` `stipple`.

Inline use (the footer band):

```html
<footer data-ruled-bars-zone>
  <div data-ruled-bars data-mode="inline" data-flip="xy" data-count="8"></div>
  <a class="hero-bars_toggle">Pause motion</a>
</footer>
```

- `data-mode="inline"`: no parallax, shade or hide-on-scroll; animates only while on screen.
- `data-flip="x" | "y" | "xy"`: mirrors the field; the cursor pull and lens follow the mirror.
- The pause toggle is found inside the nearest `[data-ruled-bars-zone]` (inline) or the hero.

## Releasing a change
1. Commit the change on a branch and merge it to `main` (Gate 6).
2. Compute the SRI hash: `openssl dgst -sha384 -binary <file>.js | openssl base64 -A` → `sha384-…`.
3. In Webflow, register the file again under the same display name with the new version, the commit-SHA URL and the hash, then apply that version to the pages that use it.
4. Publishing the site (Gate 7) is what makes it live.

Pin to a commit that's on `main` (merge commits, not squash) so the SHA stays reachable.

## Page transition head snippet
Put this in the head code of every page that loads `page-transition.js` (match the colour to `data-pt-color`):

```html
<style>html.scs-pt-in::after{content:"";position:fixed;inset:0;z-index:2147483646;background:#F4EFE6;animation:scs-pt-fail 0s 1.5s forwards}@keyframes scs-pt-fail{to{visibility:hidden}}</style>
<script>try{if(sessionStorage.getItem("scs-pt")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("scs-pt-in")}catch(e){}</script>
```

**Never put a literal `</script>` or `</style>` in any of the `.js` files, even in a comment.** If Webflow inlines a file, that tag ends the script early and the rest of the code shows on the page as text.
