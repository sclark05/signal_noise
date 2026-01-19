/* ======================================================
   Signal/Noise Effect: Radial Field
   Author: Sclark Studio
   Version: 1.0
   ====================================================== */

(function () {
  if (!window.SignalNoise) {
    console.error("[Signal/Noise] Core framework not loaded!");
    return;
  }

  class RadialField extends window.SignalNoise.SignalNoiseBase {
    onInit(sketch) {
      this.t = 0;
    }

    onDraw(sketch) {
      const {
        chaos,
        rings,
        speed,
        lineWeight,
        lineColor,
        backgroundMode,
        backgroundColor,
        gravitySpeed = 0.01,
        gravityRadius = 100,
        gravityStrength = 0.4,
      } = this.config;

      sketch.push();

      sketch.translate(sketch.width / 2, sketch.height / 2);
      sketch.stroke(lineColor);
      sketch.strokeWeight(lineWeight);

      // Gravitational point animation
      const gx = sketch.cos(sketch.frameCount * gravitySpeed) * gravityRadius;
      const gy = sketch.sin(sketch.frameCount * gravitySpeed) * gravityRadius;

      for (let i = 0; i < rings; i++) {
        sketch.beginShape();
        for (let a = 0; a < sketch.TWO_PI; a += 0.05) {
          const ripple =
            20 * chaos * sketch.noise(sketch.cos(a) + i * 0.1, sketch.sin(a), this.t);
          let radius = 50 + i * 6 + ripple;
          let x = radius * sketch.cos(a);
          let y = radius * sketch.sin(a);

          // Gravity warp
          const dx = gx - x;
          const dy = gy - y;
          const d = sketch.sqrt(dx * dx + dy * dy);
          const pull = gravityStrength / (d + 50);
          x += dx * pull * 50;
          y += dy * pull * 50;

          sketch.vertex(x, y);
        }
        sketch.endShape(sketch.CLOSE);
      }

      sketch.pop();

      this.t += speed * 100;
    }
  }

  // Register the effect
  window.SignalNoiseEffects = window.SignalNoiseEffects || {};
  window.SignalNoiseEffects["radialField"] = RadialField;
})();
