# Ruled Bars — Builder

Tuning tool for the Scott Clark Studio "ruled bars" field (home hero + footer band).

- **Open:** `Ruled_Bars_app/index.html` (served by GitHub Pages alongside the other SignalNoise apps).
- **What it runs:** the production script, `../scs-site/ruled-bars.js`, so the preview is exactly what ships.
- **Presets:** Home hero (locked settings), Footer band (8 bars, flipped + flopped, 260px frame), Script defaults.
- **Output:** the Webflow custom attributes that differ from the script's defaults. In Webflow, select the bars
  element (`hero-bars_field` or `footer-signal_band`) → Element settings → Custom attributes, one row per line.
  Attributes you remove fall back to the defaults.
- **Share:** settings live in the URL hash, so "Copy share link" captures the exact look.

Settings changes never need a code change. Only new behaviour (a new motion, a new texture) changes
`scs-site/ruled-bars.js`, which then needs a new version + SRI hash registered in Webflow.
