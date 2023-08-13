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

function init() {
  s.t = 0.0;
}

/** This is a draw function. */
function draw() {
  background(255);

  s.dt = p.dt;
  s.t += s.dt;

  circle(200 + 100 * sin(s.t), 200 + 100 * cos(s.t), 10);
}
