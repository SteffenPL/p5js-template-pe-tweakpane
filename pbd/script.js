const pv = p5.Vector;

/** This is the main interface with tweakpane */
const p = {
  dt: 0.2,
  N: 30,
  R: 5.0,
  dt_frame: 0.1,

  /** Some constants which are not subject to change! */
  w: 100, // physical units of the width
  h: 100, // physical units of the height
  coord_center: { x: 0, y: 0 }, // physical center of the canvas
};

let simulation = function (P) {
  /** export functions for external use */
  P.setup = setup;
  P.draw = draw;
  P.init = init;

  /** This is a setup function. */
  function setup() {
    P.createCanvas(400, 400);
    init();
  }

  /** A second dict witch holds the current simulation state */
  let s = {};

  function randomPos() {
    return P.createVector(P.random() * p.w, P.random() * p.h);
  }

  /** Init the simulation state. */
  function init() {
    s.t = 0.0;

    s.cells = [];
    for (let i = 0; i < p.N; i++) {
      s.cells.push({
        pos: randomPos(),
        vel: P.createVector(0, 0),
        dx: P.createVector(0, 0),
        R: p.R,
      });
    }
  }

  function projectCellCell(c1, c2) {
    const d = pv.sub(c2.pos, c1.pos);
    const l = d.mag();

    if (l > c1.R + c2.R) {
      return;
    }

    const n = d.copy().normalize();
    const f = l - c1.R - c2.R;
    const f1 = f * 0.5;
    c1.pos.add(n.mult(f1));
    c2.pos.add(n.mult(-1));
  }

  let draw_t = 0.0;

  /** This is a draw function. */
  function draw() {
    s.t += p.dt;
    draw_t += p.dt;

    for (let i = 0; i < s.cells.length; i++) {
      const c = s.cells[i];

      // compute forces
      c.vel.set(0, 0.5);

      // update the position
      c.dx.set(c.pos);
      c.dx.x -= 50;
      c.dx.y -= 50;
      c.dx.mult(-p.dt * 0.01);

      c.pos.add(c.dx);
    }

    for (let i = 0; i < s.cells.length; i++) {
      const c = s.cells[i];
      for (let j = i + 1; j < s.cells.length; j++) {
        projectCellCell(c, s.cells[j]);
      }
    }

    for (let i = 0; i < s.cells.length; i++) {
      const c = s.cells[i];
      if (c.pos.y > p.h - c.R) c.pos.y = p.h - c.R;
      if (c.pos.x > p.w - c.R) c.pos.x = p.w - c.R;
      if (c.pos.y < c.R) c.pos.y = c.R;
      if (c.pos.x < c.R) c.pos.x = c.R;
    }

    if (draw_t > p.dt_frame) {
      scaleCanvas();
      P.background(255);

      // draw the cells
      P.fill(0);
      P.stroke(0, 0, 0, 0);
      P.strokeWeight(0);
      for (let i = 0; i < s.cells.length; i++) {
        const c = s.cells[i];
        const irel = P.round((i / s.cells.length) * 128);
        P.fill(irel, 128 - irel, irel);
        P.circle(c.pos.x, c.pos.y, 2 * c.R);
      }

      draw_t = 0.0;
    }
  }

  /* Helper functions */
  function scaleCanvas() {
    // we fit a rectangle of w x h into the canvas
    const ratioX = P.width / p.w;
    const ratioY = P.height / p.h;
    if (ratioX < ratioY) {
      P.translate(0, (P.height - p.h * ratioX) / 2);
      P.scale(ratioX, ratioX);
    } else {
      P.translate((P.width - p.w * ratioY) / 2, 0);
      P.scale(ratioY, ratioY);
    }
    P.translate(p.coord_center.x, p.coord_center.y);
  }
};

const sim = new p5(simulation, "sketch-holder");
