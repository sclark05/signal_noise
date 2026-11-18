# scs-site

Scripts for the Scott Clark Studio Webflow site. Each file is self-contained with no dependencies, and is loaded from jsDelivr at a pinned tag:

```
https://cdn.jsdelivr.net/gh/sclark05/signal_noise@scs-site-v1.0.0/scs-site/<file>.js
```

Webflow registers each file as a hosted script with its version and SRI hash, so pushing here never changes the live site. Only bumping the registered version in Webflow does.

| File | Where it loads | What it does |
| --- | --- | --- |
| `ruled-bars.js` | Home page footer | Ruled-bars hero: tapered bars with a looping wave, riso stipple + ink wear, cursor pull/lens, parallax behind the content, pause control. |
| `nav-label.js` | Site footer | Label nav menu: aria-expanded, inert closed panel, Esc closes, focus management. |
| `page-transition.js` | Site footer, plus a small `<head>` snippet (see file header) | Wave page transition: bars cover the screen, navigate, reveal on the next page. Prefetches on hover. |

All three respect `prefers-reduced-motion` (still hero, no transition).

## Hero settings
Data attributes on the `[data-ruled-bars]` element override the defaults (the defaults are the locked design, 2026-11-18):

`data-ink` `#F4EFE6` · `data-motion` `wave` · `data-count` `11` · `data-thick` `0.78` · `data-thin` `0.34` · `data-soft` `0.23` · `data-stagger` `0.014` · `data-speed` `1` · `data-travel` `0.2` · `data-follow` `0.7` · `data-lens` `160` · `data-texture` `stipple` · `data-cell` `17` · `data-angle` `45` · `data-cover` `1` · `data-wear` `1` · `data-parallax` `0.28` · `data-shade` `0.45`

Motion: `wave` `drift` `breathe` `cascade`. Texture: `letterpress` `halftone` `lines` `stipple`.

## Releasing
1. Merge to `main`.
2. Tag `scs-site-vX.Y.Z` and push the tag.
3. In Webflow, register the new URL with its SRI hash and bump the version.
