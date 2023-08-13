/** This is a setup funciton. */
function setup() {
  var canvas = createCanvas(400, 500);
  canvas.parent("sketch-holder");

  init();
}

/** This is the main interface with tweakpane */
const p = {
  dt: 0.01,

  /** Some constants which are not subject to change! */
  phys_width: 120, // physical units of the width
  phys_height: 100, // physical units of the height
  phys_center: { x: 60, y: 50 }, // physical center of the canvas
};

/** A second dict witch holds the current simulation state */
const s = {};

/** Init the simulation state. */
function init() {
  s.t = 0.0;
}

function scaleCanvas() {
  // we fit a rectangle of phys_width x phys_height into the canvas
  const ratioX = width / p.phys_width;
  const ratioY = height / p.phys_height;
  if (ratioX < ratioY) {
    translate(0, (height - p.phys_height * ratioX) / 2);
    scale(ratioX, ratioX);
  } else {
    translate((width - p.phys_width * ratioY) / 2, 0);
    scale(ratioY, ratioY);
  }
  translate(p.phys_center.x, p.phys_center.y);
}

/** This is a draw function. */
function draw() {
  scaleCanvas();
  background(255);

  rect(
    -p.phys_width / 2 + 2,
    -p.phys_height / 2 + 2,
    p.phys_width - 4,
    p.phys_height - 4
  );

  s.t += p.dt;

  circle(50 * sin(s.t), 50 * cos(s.t), 10);
}
