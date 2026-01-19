// === Sclark Studio — Signal/Noise Builder v3.9 ===
// Adds: Bidirectional Spacing Expansion (-3 to +3)
// Core: Gravity Orbit + Mouse Interaction + Gradient + Embed Export

let baseSpacing = 6;
let chaos = 0.8, chaosIntensity = 1.2, rippleDepth = 1.2;
let speed = 0.004, size = 1.0, lineWeight = 1.5, blurAmount = 0.0;
let detailLevel = 0.7, bgAlpha = 255;
let lineColor = "#00C8A0", bgColor = "#202324";
let startColor = "#00C8A0", endColor = "#FF0080", gradientRotation = 0;
let offsetX1 = 0, offsetY1 = 10000, offsetX2 = 20000, offsetY2 = 30000, timeZ = 0;

// 🌌 Gravity orbit distortion
let gravitySpeed = 0.01, gravityRadius = 100, gravityStrength = 0.4;

// 🖱️ Mouse gravity effect
let mouseGravityEnabled = true;
let mouseGravityIntensity = 0.5;

// 🎚️ Dynamic ring count & spacing expansion
let ringsSlider, spacingExpansionSlider;

let chaosSlider, chaosIntensitySlider, rippleDepthSlider;
let speedSlider, sizeSlider, weightSlider, blurSlider, detailSlider;
let lineColorPicker, bgColorPicker, bgAlphaToggle;
let startColorPicker, endColorPicker, rotationSlider, colorModeSelect;
let gravitySpeedSlider, gravityRadiusSlider, gravityStrengthSlider;
let mouseGravityToggle, mouseGravitySlider;
let embedOutput, copyBtn;

function setup() {
  const c = createCanvas(windowWidth, windowHeight);
  c.parent("trunkwave");
  noFill();
  angleMode(RADIANS);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  let panel = select("#controls");
  if (!panel) {
    panel = createDiv().id("controls");
    panel.position(10, 10);
  }
  createControlPanel(panel);
}

function draw() {
  const bgSelected = bgAlphaToggle.checked();
  blurAmount = blurSlider.value();
  drawingContext.canvas.style.filter = `blur(${blurAmount}px)`;

  if (bgSelected) background(bgColorPicker.value());
  else clear();

  translate(width / 2, height / 2);
  const scaleFactor = sizeSlider.value();
  scale(scaleFactor);
  strokeWeight(weightSlider.value() / scaleFactor);

  offsetX1 -= 0.015 * speedSlider.value() * 60;
  offsetY1 += 0.01 * speedSlider.value() * 60;
  offsetX2 += 0.01 * speedSlider.value() * 60;
  offsetY2 -= 0.008 * speedSlider.value() * 60;
  timeZ += 0.0005 * speedSlider.value() * 60;

  const gx = cos(frameCount * gravitySpeedSlider.value()) * gravityRadiusSlider.value();
  const gy = sin(frameCount * gravitySpeedSlider.value()) * gravityRadiusSlider.value();
  const gStrength = gravityStrengthSlider.value();

  const ctx = drawingContext;

  // 🌈 Gradient rendering
  if (colorModeSelect.value() === "Linear") {
    const angle = radians(rotationSlider.value());
    const x1 = -width / 2 * cos(angle);
    const y1 = -height / 2 * sin(angle);
    const x2 = width / 2 * cos(angle);
    const y2 = height / 2 * sin(angle);
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, startColorPicker.value());
    grad.addColorStop(1, endColorPicker.value());
    ctx.strokeStyle = grad;
  } else if (colorModeSelect.value() === "Radial") {
    const maxR = max(width, height);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, maxR / 2);
    grad.addColorStop(0, startColorPicker.value());
    grad.addColorStop(1, endColorPicker.value());
    ctx.strokeStyle = grad;
  } else {
    ctx.strokeStyle = lineColorPicker.value();
  }

  drawSignal(gx, gy, gStrength);
}

function drawSignal(gx, gy, gStrength) {
  const rings = ringsSlider.value();
  const step = map(detailSlider.value(), 0, 1, 0.12, 0.02);

  // ✨ Bidirectional Spacing Expansion
  const spacingMod = 1 + spacingExpansionSlider.value() * 0.15;

  const mx = mouseX - width / 2;
  const my = mouseY - height / 2;

  for (let i = 0; i < rings; i++) {
    const baseRadius = 50 + i * baseSpacing * spacingMod;
    beginShape();

    for (let a = 0; a < TWO_PI; a += step) {
      const freq1 = (0.12 * i + 0.2) * rippleDepthSlider.value();
      const n1 = noise(cos(a) * freq1 + offsetX1, sin(a) * freq1 + offsetY1, timeZ + i * 0.02);
      const freq2 = (0.1 * i + 0.15) * rippleDepthSlider.value() * 0.8;
      const n2 = noise(cos(a + HALF_PI) * freq2 + offsetX2, sin(a + HALF_PI) * freq2 + offsetY2, timeZ * 0.9 + i * 0.05);
      const combined = n1 * 0.6 + n2 * 0.4;
      const ripple = 20 * chaosSlider.value() * chaosIntensitySlider.value() * combined;
      let radius = ripple + baseRadius;

      let x = radius * cos(a);
      let y = radius * sin(a);

      const dx = gx - x;
      const dy = gy - y;
      const d = sqrt(dx * dx + dy * dy);
      const pull = (gStrength / (d + 50));
      x += dx * pull * 50;
      y += dy * pull * 50;

      if (mouseGravityToggle.checked()) {
        const mdx = mx - x;
        const mdy = my - y;
        const md = sqrt(mdx * mdx + mdy * mdy);
        const mpull = mouseGravitySlider.value() / (md + 150);
        x += mdx * mpull * 150;
        y += mdy * mpull * 150;
      }

      vertex(x, y);
    }
    endShape(CLOSE);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function createControlPanel(panel) {
  function addDivider() {
    const div = createDiv().parent(panel);
    div.style("width", "100%");
    div.style("border-top", "1px solid rgba(255,255,255,0.1)");
    div.style("margin", "8px 0");
  }

  function addControl(label, el) {
    const wrapper = createDiv().parent(panel);
    wrapper.style("display", "flex");
    wrapper.style("justify-content", "space-between");
    wrapper.style("align-items", "center");
    wrapper.style("gap", "6px");
    wrapper.style("margin", "2px 0");

    const lab = createSpan(label).parent(wrapper);
    lab.style("font-size", "11px");
    el.parent(wrapper);
    el.style("flex", "1");
    const val = createSpan(el.value()).parent(wrapper);
    val.style("font-size", "10px");
    val.style("color", "#888");
    el.input(() => val.html(el.value()));
  }

  // === Signal Controls ===
  addControl("Chaos", (chaosSlider = createSlider(0, 3, chaos, 0.01)));
  addControl("Chaos Intensity", (chaosIntensitySlider = createSlider(0.5, 4.0, chaosIntensity, 0.1)));
  addControl("Ripple Depth", (rippleDepthSlider = createSlider(0.5, 2.0, rippleDepth, 0.01)));
  addControl("Spacing Expansion", (spacingExpansionSlider = createSlider(-3, 3, 0, 0.1)));
  addControl("Speed", (speedSlider = createSlider(0.001, 0.02, speed, 0.001)));
  addControl("Size", (sizeSlider = createSlider(0.5, 2.0, size, 0.01)));
  addControl("Line Weight", (weightSlider = createSlider(1, 5, lineWeight, 0.1)));
  addControl("Blur", (blurSlider = createSlider(0, 10, blurAmount, 0.1)));
  addControl("Detail", (detailSlider = createSlider(0, 1, detailLevel, 0.01)));
  addControl("Number of Rings", (ringsSlider = createSlider(10, 150, 60, 1)));

  addDivider();

  // === Gravity Controls ===
  createSpan("🧲 Gravity Orbit Distortion").parent(panel).style("font-size", "11px");
  addControl("Gravity Speed", (gravitySpeedSlider = createSlider(0, 0.05, gravitySpeed, 0.001)));
  addControl("Gravity Radius", (gravityRadiusSlider = createSlider(0, 200, gravityRadius, 1)));
  addControl("Gravity Strength", (gravityStrengthSlider = createSlider(0, 2, gravityStrength, 0.01)));

  addDivider();

  // === Mouse Controls ===
  createSpan("🖱️ Mouse Interaction").parent(panel).style("font-size", "11px");
  mouseGravityToggle = createCheckbox("Enable Mouse Gravity", mouseGravityEnabled);
  mouseGravityToggle.parent(panel);
  addControl("Mouse Intensity", (mouseGravitySlider = createSlider(0, 1, mouseGravityIntensity, 0.01)));

  addDivider();

  // === Color Controls ===
  createSpan("🎨 Colors").parent(panel).style("font-size", "11px");
  lineColorPicker = createColorPicker(lineColor);
  bgColorPicker = createColorPicker(bgColor);
  [lineColorPicker, bgColorPicker].forEach(p => styleColorPicker(p));
  addControl("Line Color", lineColorPicker);
  addControl("Background Color", bgColorPicker);
  bgAlphaToggle = createCheckbox("Enable Background", true);
  bgAlphaToggle.parent(panel);

  addDivider();

  // === Gradient Controls ===
  createSpan("🌈 Gradient Options").parent(panel).style("font-size", "11px");
  colorModeSelect = createSelect();
  colorModeSelect.option("Solid");
  colorModeSelect.option("Linear");
  colorModeSelect.option("Radial");
  colorModeSelect.selected("Solid");

  startColorPicker = createColorPicker(startColor);
  endColorPicker = createColorPicker(endColor);
  [startColorPicker, endColorPicker].forEach(p => styleColorPicker(p));

  addControl("Color Mode", colorModeSelect);
  addControl("Start Color", startColorPicker);
  addControl("End Color", endColorPicker);
  addControl("Rotation (°)", (rotationSlider = createSlider(0, 360, gradientRotation, 1)));

  addDivider();

  // === Embed Export ===
  createSpan("📄 Export").parent(panel).style("font-size", "11px");
  const instructions = createP("Copy and paste this code into your page’s custom code area, just before </body>.")
    .parent(panel);
  instructions.style("font-size", "10px");
  instructions.style("color", "#aaa");
  instructions.style("margin", "4px 0");

  const generateBtn = createButton("Generate Embed Code");
  generateBtn.parent(panel);
  generateBtn.mousePressed(generateEmbedCode);

  embedOutput = createElement("textarea");
  embedOutput.id("embedOutput");
  embedOutput.attribute("readonly", true);
  embedOutput.style("width", "100%");
  embedOutput.style("height", "180px");
  embedOutput.style("resize", "vertical");
  embedOutput.style("background", "rgba(255,255,255,0.05)");
  embedOutput.style("color", "#00ffbb");
  embedOutput.style("border", "1px solid rgba(255,255,255,0.1)");
  embedOutput.style("border-radius", "6px");
  embedOutput.style("font-family", "monospace");
  embedOutput.style("font-size", "11px");
  embedOutput.style("padding", "6px");
  embedOutput.parent(panel);

  copyBtn = createButton("📋 Copy Code");
  copyBtn.parent(panel);
  copyBtn.mousePressed(() => {
    navigator.clipboard.writeText(embedOutput.value());
    alert("✅ Embed code copied to clipboard!");
  });
}

function styleColorPicker(p) {
  p.style("border-radius", "8px");
  p.style("width", "28px");
  p.style("height", "28px");
  p.style("appearance", "none");
  p.style("border", "1px solid rgba(255,255,255,0.25)");
  p.style("background", "transparent");
  p.style("cursor", "pointer");
  p.style("padding", "0");
}

function generateEmbedCode() {
  const config = {
    el: "#YOUR-ELEMENT-ID",
    chaos: chaosSlider.value(),
    chaosIntensity: chaosIntensitySlider.value(),
    rippleDepth: rippleDepthSlider.value(),
    spacingExpansion: spacingExpansionSlider.value(),
    speed: speedSlider.value(),
    gravitySpeed: gravitySpeedSlider.value(),
    gravityRadius: gravityRadiusSlider.value(),
    gravityStrength: gravityStrengthSlider.value(),
    mouseGravity: mouseGravityToggle.checked(),
    mouseIntensity: mouseGravitySlider.value(),
    rings: ringsSlider.value(),
    startColor: startColorPicker.value(),
    endColor: endColorPicker.value(),
    gradientType: colorModeSelect.value(),
    blur: blurSlider.value(),
    lineWeight: weightSlider.value(),
    backgroundEnabled: bgAlphaToggle.checked()
  };

  const code = `
<!-- Paste this into your Webflow or WordPress Custom Code Block -->
<div id="YOUR-ELEMENT-ID" style="position:relative;width:100%;height:100%;overflow:hidden;"></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
<script src="embed/radialSignalEmbed.js"></script>
<script>
initRadialSignal(${JSON.stringify(config, null, 2)});
</script>
`;

  embedOutput.value(code.trim());
  navigator.clipboard.writeText(code.trim());
  alert("✅ Embed code copied! Replace #YOUR-ELEMENT-ID with your container’s ID.");
}
