const pv = p5.Vector;

let simulation = function (P5) {
  /** This is a setup function. */
  P5.setup = function () {
    let canvas = createCanvas(400, 400);
    canvas.parent("sketch-holder");

    init();
  };

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

  /** A second dict witch holds the current simulation state */
  let s = {};

  function randomPos() {
    return createVector(random() * p.w, random() * p.h);
  }

  /** Init the simulation state. */
  function init() {
    s.t = 0.0;

    s.cells = [];
    for (let i = 0; i < p.N; i++) {
      s.cells.push({
        pos: randomPos(),
        vel: createVector(0, 0),
        dx: createVector(0, 0),
        R: p.R,
      });
    }

    function createHalfspace(ax, ay, bx, by) {
      const a = createVector(ax, ay);
      const b = createVector(bx, by);
      const v = pv.sub(b, a);
      return {
        a: a,
        b: b,
        l0: v.mag(),
        v: v,
        n: v.copy().rotate(-HALF_PI).normalize(),
      };
    }

    s.halfspaces = [
      createHalfspace(0, 0, 0, p.w),
      createHalfspace(0, p.w, p.h, p.w),
      createHalfspace(p.h, p.w, p.h, 0.0),
      createHalfspace(p.h, 0.0, 0.0, 0.0),
    ];
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

  function projectCellLine(c, l) {
    c.dx.set(c.pos);
    c.dx.sub(l.a);

    // compute such that: a + ca * v + cn * n = c.pos
    const ca = c.dx.dot(l.v) / l.l0;
    const cn = c.dx.dot(l.n);

    // compute the distance to the line
    if (abs(cn) > c.R) {
      return;
    }

    if (ca < 0) {
      const d = c.dx.mag();
      if (d > c.R) {
        return;
      }

      // point-cell projection
      c.pos.add(c.dx.mult(c.R / d));
    } else if (ca > l.l0) {
      // point-cell projection
      c.dx.set(c.pos);
      c.dx.sub(l.b);
      const d = c.dx.mag();
      if (d > c.R) {
        return;
      }
      c.pos.add(c.dx.mult(c.R / d));
    } else {
      // point-line projection
      c.dx.set(l.n);
      if (cn > 0) c.dx.mult(c.R - cn);
      else c.dx.mult(-c.R - cn);
      c.pos.add(c.dx);
    }
  }

  function projectHalfspace(c, h) {
    c.dx.set(c.pos);
    c.dx.sub(h.a);

    // compute such that: a + ca * v + cn * n = c.pos
    // const ca = c.dx.dot(h.v) / h.l0;
    const cn = c.dx.dot(h.n);

    if (cn < c.R) {
      c.dx.set(h.n);
      c.dx.mult(c.R - cn);
      c.pos.add(c.dx);
    }
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
    }

    /*
    // perform collisions
    for (let i = 0; i < s.cells.length; i++) {
      const c = s.cells[i];
      for (let j = 0; j < s.lines.length; j++) {
        projectCellLine(c, s.lines[j]);
      }
    }

    for (let i = 0; i < s.cells.length; i++) {
      const c = s.cells[i];
      for (let j = 0; j < s.halfspaces.length; j++) {
        projectHalfspace(c, s.halfspaces[j]);
      }
    }
  */
    if (draw_t > p.dt_frame) {
      scaleCanvas();
      background(255);

      // draw the lines
      stroke(0);
      strokeWeight(1);
      for (let i = 0; i < s.lines.length; i++) {
        const l = s.lines[i];
        line(l.a.x, l.a.y, l.b.x, l.b.y);
      }

      // draw the halfspaces
      stroke(0);
      strokeWeight(1);
      for (let i = 0; i < s.halfspaces.length; i++) {
        const h = s.halfspaces[i];
        line(h.a.x, h.a.y, h.b.x, h.b.y);
      }

      // draw the cells
      fill(0);
      stroke(0, 0, 0, 0);
      strokeWeight(0);
      for (let i = 0; i < s.cells.length; i++) {
        const c = s.cells[i];
        const irel = round((i / s.cells.length) * 128);
        fill(irel, 128 - irel, irel);
        circle(c.pos.x, c.pos.y, 2 * c.R);
      }

      draw_t = 0.0;
    }
  }

  /* Helper functions */
  function scaleCanvas() {
    // we fit a rectangle of w x h into the canvas
    const ratioX = width / p.w;
    const ratioY = height / p.h;
    if (ratioX < ratioY) {
      translate(0, (height - p.h * ratioX) / 2);
      scale(ratioX, ratioX);
    } else {
      translate((width - p.w * ratioY) / 2, 0);
      scale(ratioY, ratioY);
    }
    translate(p.coord_center.x, p.coord_center.y);
  }
};

let sim = new p5(simulation, "sketch-holder");
