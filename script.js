/** This is a setup funciton. */
function setup() {
  var canvas = createCanvas(400, 400);
  canvas.parent("sketch-holder");

  init();
}

/** This is the main interface with tweakpane */
const p = {
  dt: 0.01,
};

/** A second dict witch holds the current simulation state */
const s = {};

/** Init the simulation state. */
function init() {
  s.t = 0.0;
}

/** Finally, some constants which are not subject to change! */
const constants = {
  phys_width: 100, // physical units of the width
  phys_height: 100, // physical units of the height
  // we fit a square of phys_width x phys_height into the canvas
};

function scaleCanvas() {
  scale(width / constants.phys_width, height / constants.phys_height);
}

/** This is a draw function. */
function draw() {
  scaleCanvas();
  background(255);

  rect(2, 2, constants.phys_width - 4, constants.phys_height - 4);

  s.t += p.dt;

  circle(50 + 50 * sin(s.t), 50 + 50 * cos(s.t), 10);
}
