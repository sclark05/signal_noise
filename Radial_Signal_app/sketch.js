// === Sclark Studio — Signal/Noise Builder v3.9.8 ===
// Full Stable Build: All Controls (Including Detail) + Transparency + Embed + Safe Startup

let chaos = 0.8, chaosIntensity = 1.2, rippleDepth = 1.2;
let speed = 0.004, size = 1.0, lineWeight = 1.5, blurAmount = 0.0;
let spacingExpansion = 0, detailLevel = 0.7, falloffIntensity = 0.5;
let lineColor = "#00C8A0", bgColor = "#202324";
let startColor = "#00C8A0", endColor = "#FF0080", gradientRotation = 0;
let backgroundEnabled = true;

// Control elements
let chaosSlider, chaosIntensitySlider, rippleDepthSlider, falloffSlider;
let speedSlider, sizeSlider, weightSlider, blurSlider, spacingSlider, detailSlider;
let lineColorPicker, bgColorPicker, bgToggle;
let startColorPicker, endColorPicker, rotationSlider, colorModeSelect;
let embedOutput, generateBtn, copyBtn;
let gravitySpeed = 0.01, gravityRadius = 100, gravityStrength = 0.4;
let gravitySpeedSlider, gravityRadiusSlider, gravityStrengthSlider;
let ringsSlider;
let mouseGravityToggle, mouseGravitySlider;

function setup() {
  const c = createCanvas(windowWidth, windowHeight);
  c.parent("trunkwave");
  noFill();
  angleMode(RADIANS);
  strokeJoin(ROUND);
  strokeCap(ROUND);
  pixelDensity(window.devicePixelRatio || 1);
  createControlPanel();
}

// ✅ Prevents errors before UI is ready
function controlsReady() {
  return (
    chaosSlider &&
    chaosIntensitySlider &&
    rippleDepthSlider &&
    falloffSlider &&
    spacingSlider &&
    detailSlider &&
    speedSlider &&
    sizeSlider &&
    weightSlider &&
    blurSlider &&
    gravitySpeedSlider &&
    gravityRadiusSlider &&
    gravityStrengthSlider &&
    ringsSlider &&
    mouseGravityToggle &&
    mouseGravitySlider &&
    colorModeSelect &&
    startColorPicker &&
    endColorPicker &&
    lineColorPicker &&
    bgColorPicker &&
    bgToggle
  );
}

function draw() {
  if (!controlsReady()) return;

  drawingContext.canvas.style.filter = `blur(${blurSlider.value()}px)`;

  if (bgToggle.checked()) {
    background(color(bgColorPicker.value()));
  } else {
    clear();
  }

  translate(width / 2, height / 2);
  const scaleFactor = sizeSlider.value();
  scale(scaleFactor);

  const lw = Math.max(0.5, weightSlider.value() / scaleFactor);
  strokeWeight(lw);

  const ctx = drawingContext;

  // Update gradient rotation
  gradientRotation = rotationSlider.value();

  // === Gradient Rendering ===
  if (colorModeSelect.value() === "Linear") {
    let angle = radians(gradientRotation);
    let halfW = width / 2;
    let startX = -halfW * cos(angle);
    let startY = -halfW * sin(angle);
    let endX = halfW * cos(angle);
    let endY = halfW * sin(angle);
    const grad = ctx.createLinearGradient(startX, startY, endX, endY);
    grad.addColorStop(0, startColorPicker.value());
    grad.addColorStop(1, endColorPicker.value());
    ctx.strokeStyle = grad;
  } else if (colorModeSelect.value() === "Radial") {
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, max(width, height) / 2);
    grad.addColorStop(0, startColorPicker.value());
    grad.addColorStop(1, endColorPicker.value());
    ctx.strokeStyle = grad;
  } else {
    ctx.strokeStyle = lineColorPicker.value();
  }

  const gx = cos(frameCount * gravitySpeedSlider.value()) * gravityRadiusSlider.value();
  const gy = sin(frameCount * gravitySpeedSlider.value()) * gravityRadiusSlider.value();

  const mx = mouseX - width / 2;
  const my = mouseY - height / 2;

  const chaosVal = chaosSlider.value();
  const intensity = chaosIntensitySlider.value();
  const ripple = rippleDepthSlider.value();
  const falloff = falloffSlider.value();

  for (let i = 0; i < ringsSlider.value(); i++) {
    const baseRadius = 50 + i * (6 + spacingSlider.value());
    const falloffFactor = lerp(1, 0.2, (i / ringsSlider.value()) * falloff);
    beginShape();

    const step = map(detailSlider.value(), 0, 1, 0.12, 0.02);

    for (let a = 0; a < TWO_PI; a += step) {
      const freq1 = (0.12 * i + 0.2) * ripple;
      const n1 = noise(cos(a) * freq1, sin(a) * freq1, frameCount * speedSlider.value());
      const freq2 = (0.1 * i + 0.15) * ripple * 0.8;
      const n2 = noise(cos(a + HALF_PI) * freq2, sin(a + HALF_PI) * freq2, frameCount * speedSlider.value() * 0.9);
      const combined = n1 * 0.6 + n2 * 0.4;
      const rippleVal = 20 * chaosVal * intensity * combined * falloffFactor;
      let radius = rippleVal + baseRadius;

      let x = radius * cos(a);
      let y = radius * sin(a);

      const dx = gx - x;
      const dy = gy - y;
      const d = sqrt(dx * dx + dy * dy);
      const pull = gravityStrengthSlider.value() / (d + 50);
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

// === CONTROL PANEL ===
function createControlPanel() {
  const panel = select("#controls");

  function addLabel(text) {
    const lbl = createSpan(text);
    lbl.style("font-size", "11px");
    lbl.style("color", "#ccc");
    lbl.style("margin", "6px 0");
    lbl.parent(panel);
  }

  function addDivider() {
    const div = createDiv();
    div.style("border-top", "1px solid rgba(255,255,255,0.1)");
    div.style("margin", "6px 0");
    div.parent(panel);
  }

  function addControl(label, el) {
    const wrap = createDiv();
    wrap.parent(panel);
    wrap.style("display", "flex");
    wrap.style("align-items", "center");
    wrap.style("justify-content", "space-between");
    wrap.style("gap", "6px");

    const lab = createSpan(label);
    lab.style("font-size", "10px");
    lab.style("color", "#aaa");
    lab.parent(wrap);

    el.parent(wrap);
    const val = createSpan(el.value());
    val.style("font-size", "10px");
    val.style("color", "#777");
    val.parent(wrap);
    el.input(() => val.html(el.value()));
  }

  // === Core Signal Controls ===
  addLabel("🎛 Core Signal Controls");
  addControl("Chaos", (chaosSlider = createSlider(0, 3, chaos, 0.01)));
  addControl("Chaos Intensity", (chaosIntensitySlider = createSlider(0.5, 3, chaosIntensity, 0.1)));
  addControl("Falloff Intensity", (falloffSlider = createSlider(0, 1, falloffIntensity, 0.01)));
  addControl("Ripple Depth", (rippleDepthSlider = createSlider(0.5, 2, rippleDepth, 0.01)));
  addControl("Speed", (speedSlider = createSlider(0.001, 0.02, speed, 0.001)));
  addControl("Size", (sizeSlider = createSlider(0.5, 2, size, 0.01)));
  addControl("Line Weight", (weightSlider = createSlider(0.5, 5, lineWeight, 0.1)));
  addControl("Detail", (detailSlider = createSlider(0, 1, detailLevel, 0.01)));
  addControl("Spacing Expansion", (spacingSlider = createSlider(-3, 3, spacingExpansion, 0.1)));
  addControl("Blur", (blurSlider = createSlider(0, 10, blurAmount, 0.1)));
  addControl("Rings", (ringsSlider = createSlider(10, 150, 60, 1)));

  addDivider();

  // === Gravity Controls ===
  addLabel("🧲 Gravity Orbit Distortion");
  addControl("Gravity Speed", (gravitySpeedSlider = createSlider(0, 0.05, gravitySpeed, 0.001)));
  addControl("Gravity Radius", (gravityRadiusSlider = createSlider(0, 200, gravityRadius, 1)));
  addControl("Gravity Strength", (gravityStrengthSlider = createSlider(0, 2, gravityStrength, 0.01)));

  addDivider();

  // === Mouse Interaction ===
  addLabel("🖱 Mouse Interaction");
  mouseGravityToggle = createCheckbox("Enable Mouse Gravity", true);
  mouseGravityToggle.parent(panel);
  addControl("Mouse Intensity", (mouseGravitySlider = createSlider(0, 1, 0.5, 0.01)));

  addDivider();

  // === Colors & Gradient ===
  addLabel("🎨 Colors");
  lineColorPicker = createColorPicker(lineColor);
  bgColorPicker = createColorPicker(bgColor);
  addControl("Line Color", lineColorPicker);
  addControl("Background Color", bgColorPicker);
  bgToggle = createCheckbox("Enable Background", true);
  bgToggle.parent(panel);

  addDivider();

  addLabel("🌈 Gradient Options");
  colorModeSelect = createSelect();
  colorModeSelect.option("Solid");
  colorModeSelect.option("Linear");
  colorModeSelect.option("Radial");
  colorModeSelect.selected("Solid");
  addControl("Mode", colorModeSelect);
  startColorPicker = createColorPicker(startColor);
  endColorPicker = createColorPicker(endColor);
  addControl("Start Color", startColorPicker);
  addControl("End Color", endColorPicker);
  addControl("Rotation", (rotationSlider = createSlider(0, 360, gradientRotation, 1)));

  addDivider();

  // === Embed Code ===
  addLabel("📤 Embed Code Generator");
  generateBtn = createButton("Generate Embed Code");
  generateBtn.parent(panel);
  generateBtn.mousePressed(generateEmbedCode);

  embedOutput = createElement("textarea");
  embedOutput.attribute("readonly", true);
  embedOutput.style("width", "100%");
  embedOutput.style("height", "160px");
  embedOutput.style("background", "rgba(255,255,255,0.05)");
  embedOutput.style("color", "#0f0");
  embedOutput.style("border", "1px solid rgba(255,255,255,0.1)");
  embedOutput.style("font-family", "monospace");
  embedOutput.style("font-size", "10px");
  embedOutput.parent(panel);

  copyBtn = createButton("📋 Copy Code");
  copyBtn.parent(panel);
  copyBtn.mousePressed(() => {
    navigator.clipboard.writeText(embedOutput.value());
    alert("✅ Embed code copied!");
  });
}

function generateEmbedCode() {
  const config = {
    el: "#YOUR-ELEMENT-ID",
    chaos: chaosSlider.value(),
    chaosIntensity: chaosIntensitySlider.value(),
    rippleDepth: rippleDepthSlider.value(),
    falloffIntensity: falloffSlider.value(),
    spacingExpansion: spacingSlider.value(),
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
    detailLevel: detailSlider.value(),
    backgroundEnabled: bgToggle.checked()
  };

  const code = `
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
<script src="https://sclark05.github.io/signal_noise/embed/radialSignalEmbed.js"></script>
<script>
initRadialSignal(${JSON.stringify(config, null, 2)});
</script>`;

  embedOutput.value(code.trim());
  navigator.clipboard.writeText(code.trim());
}
