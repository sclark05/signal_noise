// === Signal / Noise — Radial Field Builder ===

let chaosSlider, speedSlider, ringsSlider, lineWeightSlider;
let gravitySpeedSlider, gravityRadiusSlider, gravityStrengthSlider;
let bgModeSelect, bgColorPicker, lineColorPicker;

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("trunkwave");
  noFill();
  stroke(255);
  createControls();
}

function draw() {
  if (bgModeSelect.value() === "Transparent") {
    clear();
  } else {
    background(bgColorPicker.value());
  }

  translate(width / 2, height / 2);
  stroke(lineColorPicker.value());
  strokeWeight(lineWeightSlider.value());

  const chaos = chaosSlider.value();
  const rings = ringsSlider.value();
  const gravitySpeed = gravitySpeedSlider.value();
  const gravityRadius = gravityRadiusSlider.value();
  const gravityStrength = gravityStrengthSlider.value();

  const gx = cos(frameCount * gravitySpeed) * gravityRadius;
  const gy = sin(frameCount * gravitySpeed) * gravityRadius;

  for (let i = 0; i < rings; i++) {
    beginShape();
    for (let a = 0; a < TWO_PI; a += 0.05) {
      const ripple = 20 * chaos * noise(cos(a) + i * 0.1, sin(a), frameCount * 0.01);
      let radius = 50 + i * 6 + ripple;
      let x = radius * cos(a);
      let y = radius * sin(a);

      const dx = gx - x;
      const dy = gy - y;
      const d = sqrt(dx * dx + dy * dy);
      const pull = gravityStrength / (d + 50);
      x += dx * pull * 50;
      y += dy * pull * 50;

      vertex(x, y);
    }
    endShape(CLOSE);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function createControls() {
  const panel = select("#controls");

  function addControl(label, element) {
    const div = createDiv();
    div.class("control");
    div.child(createSpan(label));
    div.child(element);
    div.parent(panel);
  }

  chaosSlider = createSlider(0, 3, 1.2, 0.1);
  addControl("Chaos", chaosSlider);

  speedSlider = createSlider(0, 0.02, 0.004, 0.001);
  addControl("Speed", speedSlider);

  ringsSlider = createSlider(10, 120, 80, 1);
  addControl("Rings", ringsSlider);

  lineWeightSlider = createSlider(1, 5, 2, 0.1);
  addControl("Line Weight", lineWeightSlider);

  gravitySpeedSlider = createSlider(0, 0.05, 0.01, 0.001);
  addControl("Gravity Speed", gravitySpeedSlider);

  gravityRadiusSlider = createSlider(0, 200, 100, 1);
  addControl("Gravity Radius", gravityRadiusSlider);

  gravityStrengthSlider = createSlider(0, 1, 0.4, 0.01);
  addControl("Gravity Strength", gravityStrengthSlider);

  bgModeSelect = createSelect();
  bgModeSelect.option("Color");
  bgModeSelect.option("Transparent");
  bgModeSelect.selected("Color");
  addControl("Background Mode", bgModeSelect);

  bgColorPicker = createColorPicker("#202324");
  bgColorPicker.class("color-picker");
  addControl("Background Color", bgColorPicker);

  lineColorPicker = createColorPicker("#00C8A0");
  lineColorPicker.class("color-picker");
  addControl("Line Color", lineColorPicker);
}
