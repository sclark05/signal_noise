/* ======================================================
   Signal/Noise Core Framework
   Author: Sclark Studio
   Version: 1.1
   ====================================================== */

(function () {
  // Create global namespace if not defined
  if (typeof window.SignalNoise === "undefined") {
    window.SignalNoise = {};
  }

  // --- Safety check for p5.js presence ---
  if (typeof window.p5 === "undefined") {
    console.error(
      "[Signal/Noise] p5.js not detected. Please include it before loading SignalNoiseCore.js."
    );
    return;
  }

  class SignalNoiseBase {
    constructor(config = {}) {
      this.config = Object.assign(
        {
          el: "body",
          backgroundColor: "#0f0f0f",
          backgroundMode: "Color",
          lineColor: "#00C8A0",
          chaos: 1.0,
          rings: 60,
          speed: 0.004,
          lineWeight: 2,
          width: window.innerWidth,
          height: window.innerHeight,
        },
        config
      );

      // Resolve target element
      this.el =
        typeof this.config.el === "string"
          ? document.querySelector(this.config.el)
          : this.config.el;

      if (!this.el) {
        console.error("[Signal/Noise] Target element not found:", this.config.el);
        return;
      }

      // Initialize
      this.init();
    }

    init() {
      const self = this;

      new p5((sketch) => {
        self.sketch = sketch;
        sketch.setup = () => self.setup(sketch);
        sketch.draw = () => self.draw(sketch);
        sketch.windowResized = () => self.onResize(sketch);
      }, this.el);
    }

    setup(sketch) {
      this.canvas = sketch.createCanvas(this.config.width, this.config.height);
      sketch.noFill();
      sketch.stroke(this.config.lineColor);
      sketch.strokeWeight(this.config.lineWeight);

      if (this.config.backgroundMode === "Color") {
        sketch.background(this.config.backgroundColor);
      }

      this.onInit(sketch);
    }

    draw(sketch) {
      if (this.config.backgroundMode === "Color") {
        sketch.background(this.config.backgroundColor);
      } else {
        sketch.clear();
      }

      sketch.stroke(this.config.lineColor);
      sketch.strokeWeight(this.config.lineWeight);

      this.onDraw(sketch);
    }

    onInit(sketch) {
      // To be overridden by effect files
    }

    onDraw(sketch) {
      // To be overridden by effect files
    }

    onResize(sketch) {
      sketch.resizeCanvas(window.innerWidth, window.innerHeight);
    }
  }

  // Attach class to namespace
  window.SignalNoise.SignalNoiseBase = SignalNoiseBase;

  console.log("[Signal/Noise] Core framework initialized.");
})();
