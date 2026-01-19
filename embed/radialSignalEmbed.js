// === Signal / Noise — Embed Script (v3.9.2) ===
// Reliable, Webflow-safe p5.js loader with full resize + DOM readiness handling

function initRadialSignal(config) {
  if (!window.p5) {
    console.error("[Signal/Noise] p5.js not found — please include it before this script.");
    return;
  }

  const el = document.querySelector(config.el);
  if (!el) {
    console.error(`[Signal/Noise] Element not found for selector: ${config.el}`);
    return;
  }

  // Ensure parent container can hold an absolutely positioned canvas
  const style = getComputedStyle(el);
  if (style.position === "static") el.style.position = "relative";
  el.style.overflow = "hidden";

  // Helper: create and mount the p5 instance safely
  const startSketch = () => {
    try {
      new p5((s) => {
        let offsetX1 = 0, offsetY1 = 10000, offsetX2 = 20000, offsetY2 = 30000, timeZ = 0;

        s.setup = () => {
          const canvas = s.createCanvas(el.offsetWidth, el.offsetHeight);
          canvas.parent(el);

          // Apply Vanta-style resilient canvas styling
          Object.assign(canvas.elt.style, {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            background: "transparent",
            pointerEvents: "none"
          });

          s.noFill();
          s.angleMode(s.RADIANS);
          s.strokeJoin(s.ROUND);
          s.strokeCap(s.ROUND);
        };

        s.draw = () => {
          s.drawingContext.canvas.style.filter = `blur(${config.blur}px)`;
          if (config.backgroundEnabled) s.background(0, 0, 0, 255);
          else s.clear();

          s.translate(s.width / 2, s.height / 2);
          const scaleFactor = 1;
          s.scale(scaleFactor);
          s.strokeWeight(config.lineWeight / scaleFactor);

          offsetX1 -= 0.015 * config.speed * 60;
          offsetY1 += 0.01 * config.speed * 60;
          offsetX2 += 0.01 * config.speed * 60;
          offsetY2 -= 0.008 * config.speed * 60;
          timeZ += 0.0005 * config.speed * 60;

          const gx = s.cos(s.frameCount * config.gravitySpeed) * config.gravityRadius;
          const gy = s.sin(s.frameCount * config.gravitySpeed) * config.gravityRadius;
          const gStrength = config.gravityStrength;

          const ctx = s.drawingContext;

          // 🎨 Gradient rendering
          if (config.gradientType === "Linear") {
            const grad = ctx.createLinearGradient(-s.width / 2, 0, s.width / 2, 0);
            grad.addColorStop(0, config.startColor);
            grad.addColorStop(1, config.endColor);
            ctx.strokeStyle = grad;
          } else if (config.gradientType === "Radial") {
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(s.width, s.height) / 2);
            grad.addColorStop(0, config.startColor);
            grad.addColorStop(1, config.endColor);
            ctx.strokeStyle = grad;
          } else {
            ctx.strokeStyle = config.startColor;
          }

          const mx = s.mouseX - s.width / 2;
          const my = s.mouseY - s.height / 2;

          for (let i = 0; i < config.rings; i++) {
            const baseRadius = 50 + i * (6 + config.spacingExpansion);
            s.beginShape();

            for (let a = 0; a < s.TWO_PI; a += 0.04) {
              const freq1 = (0.12 * i + 0.2) * config.rippleDepth;
              const n1 = s.noise(
                s.cos(a) * freq1 + offsetX1,
                s.sin(a) * freq1 + offsetY1,
                timeZ + i * 0.02
              );
              const freq2 = (0.1 * i + 0.15) * config.rippleDepth * 0.8;
              const n2 = s.noise(
                s.cos(a + s.HALF_PI) * freq2 + offsetX2,
                s.sin(a + s.HALF_PI) * freq2 + offsetY2,
                timeZ * 0.9 + i * 0.05
              );
              const combined = n1 * 0.6 + n2 * 0.4;
              const ripple = 20 * config.chaos * config.chaosIntensity * combined;
              let radius = ripple + baseRadius;

              let x = radius * s.cos(a);
              let y = radius * s.sin(a);

              // Gravity orbit distortion
              const dx = gx - x;
              const dy = gy - y;
              const d = Math.sqrt(dx * dx + dy * dy);
              const pull = gStrength / (d + 50);
              x += dx * pull * 50;
              y += dy * pull * 50;

              // Mouse gravity interaction
              if (config.mouseGravity) {
                const mdx = mx - x;
                const mdy = my - y;
                const md = Math.sqrt(mdx * mdx + mdy * mdy);
                const mpull = config.mouseIntensity / (md + 150);
                x += mdx * mpull * 150;
                y += mdy * mpull * 150;
              }

              s.vertex(x, y);
            }
            s.endShape(s.CLOSE);
          }
        };

        s.windowResized = () => {
          s.resizeCanvas(el.offsetWidth, el.offsetHeight);
        };
      });
    } catch (err) {
      console.error("[Signal/Noise] Initialization failed:", err);
    }
  };

  // Webflow-safe and DOM-ready initialization
  if (document.readyState === "complete" || document.readyState === "interactive") {
    // Webflow sometimes injects content after DOMContentLoaded
    setTimeout(startSketch, 200);
  } else {
    window.Webflow ||= [];
    window.Webflow.push(() => setTimeout(startSketch, 200));
    document.addEventListener("DOMContentLoaded", () => setTimeout(startSketch, 200));
  }
}
