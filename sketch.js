// === Sclark Studio — Signal/Noise Builder v3.9.5 ===
// Transparent Rendering + Sub-Pixel Lines + Unified Embed Behavior

let chaos = 0.8, chaosIntensity = 1.2, rippleDepth = 1.2;
let speed = 0.004, size = 1.0, lineWeight = 1.5, blurAmount = 0.0;
let spacingExpansion = 0, detailLevel = 0.7;
let lineColor = "#00C8A0", bgColor = "#202324";
let startColor = "#00C8A0", endColor = "#FF0080", gradientRotation = 0;
let backgroundEnabled = true;

let chaosSlider, chaosIntensitySlider, rippleDepthSlider;
let speedSlider, sizeSlider, weightSlider, blurSlider, spacingSlider;
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

function draw() {
  drawingContext.globalCompositeOperation = "source-over";
  drawingContext.canvas.style.filter = `blur(${blurSlider.value()}px)`;

  if (bgToggle.checked()) {
    background(color(bgColorPicker.value()));
  } else {
    background(0, 0, 0, 0); // transparent background fix
  }

  translate(width / 2, height / 2);
  const scaleFactor = sizeSlider.value();
  scale(scaleFactor);

  const lw = Math.max(0.1, weightSlider.value() / scaleFactor);
  strokeWeight(lw);

  const ctx = drawingContext;

  // 🎨 Gradient options
  if (colorModeSelect.value() === "Linear") {
    const grad = ctx.createLinearGradient(-width / 2, 0, width / 2, 0);
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

  const mx = mouseX - wi
