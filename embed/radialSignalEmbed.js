/* ======================================================
   Signal/Noise Embed Loader
   Author: Sclark Studio
   Version: 1.1
   ====================================================== */

(function () {
  // --- Utility: dynamically load JS file with fallback ---
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = () => {
        console.log(`[Signal/Noise] Loaded: ${url}`);
        resolve(url);
      };
      script.onerror = () => {
        console.error(`[Signal/Noise] Failed to load: ${url}`);
        reject(url);
      };
      document.head.appendChild(script);
    });
  }

  // --- Global initSignalNoise() entry point ---
  window.initSignalNoise = async function (options = {}) {
    // --- p5.js presence check ---
    if (typeof p5 === "undefined") {
      console.error("[Signal/Noise] p5.js not found. Please include it before this script.");
      return;
    }

    // --- Extract configuration ---
    const { el = "body", effect = "radialField" } = options;
    const basePath = "https://sclark05.github.io/signal_noise/";

    console.log(`[Signal/Noise] Loading effect: ${effect}...`);

    try {
      // --- Verify target element exists ---
      const container =
        typeof el === "string" ? document.querySelector(el) : el;
      if (!container) {
        console.error(`[Signal/Noise] Could not find container "${el}".`);
        return;
      }

      // --- Load core framework ---
      await loadScript(basePath + "core/signalNoiseCore.js");

      // --- Load effect file ---
      await loadScript(basePath + "effects/" + effect + ".js");

      // --- Wait briefly to ensure scripts have registered ---
      setTimeout(() => {
        if (
          window.SignalNoiseEffects &&
          typeof window.SignalNoiseEffects[effect] === "function"
        ) {
          console.log(`[Signal/Noise] Effect '${effect}' initialized.`);
          new window.SignalNoiseEffects[effect](options);
        } else {
          console.error(`[Signal/Noise] Failed to find effect '${effect}' after loading.`);
        }
      }, 50);
    } catch (err) {
      console.error("[Signal/Noise] Error loading effect:", effect, err);
    }
  };
})();
