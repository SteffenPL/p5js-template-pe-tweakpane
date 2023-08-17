const pv = p5.Vector;
import { scaleCanvas } from "./p5utils.mjs";

/** This is the main interface with tweakpane */
export const p = {
  dt: 0.005,
  N: 30,
  R: 2.0,
  dt_frame: 0.1,
  left: 0,

  /** Chemotaxis */
  chemo: { x: 10, y: 10, intensity: 2 }, // location of chemotaxis

  /** Some constants which are not subject to change! */
  w: 100, // physical units of the width
  h: 100, // physical units of the height
  margin: 5,
  coord_center: { x: 0, y: 0 }, // physical center of the canvas
};

export let simulation = function (P) {
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

    s.lines = [
      createLine(10, 10, 40, 40),
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

  let draw_t = 0.0;

  
  /** This is a draw function. */
  function draw() {
    s.t += p.dt;
    draw_t += p.dt;

    for (let i = 0; i < s.cells.length; i++) {
      const c = s.cells[i];

      // compute forces and store into dx
      c.dx.set(c.pos);
      c.dx.x =  - p.chemo.intensity*(c.pos.x - p.chemo.x);
      c.dx.y =  - p.chemo.intensity*(c.pos.y - p.chemo.y);

      // update the position
      c.dx.mult(p.dt);
      c.pos.add(c.dx);
    }

    for (let i = 0; i < s.cells.length; i++) {
      const c = s.cells[i];
      for (let j = i + 1; j < s.cells.length; j++) {
        projectCellCell(c, s.cells[j]);
      }
    }

    // perform collisions
    for (let i = 0; i < s.cells.length; i++) {
      const c = s.cells[i];
      for (let j = 0; j < s.lines.length; j++) {
        projectCellLine(c, s.lines[j]);
      }
    }

    for (let i = 0; i < s.cells.length; i++) {
      const c = s.cells[i];
      if (c.pos.y > p.h - c.R) c.pos.y = p.h - c.R;
      if (c.pos.x > p.w - c.R) c.pos.x = p.w - c.R;
      if (c.pos.y < c.R) c.pos.y = c.R;
      if (c.pos.x < c.R + p.left) c.pos.x = c.R + p.left;
    }

    scaleCanvas(P, p);
    P.background(255);

    P.stroke(0, 0, 0);
    P.strokeWeight(1);
    P.fill(255,128,0,128);
    P.circle(p.chemo.x, p.chemo.y,4*p.chemo.intensity);


    // draw the cells
    P.stroke(0, 0, 0, 0);
    P.strokeWeight(0);

    for (let i = 0; i < s.cells.length; i++) {
      const c = s.cells[i];

      const irel = P.round((i / s.cells.length) * 128);
      P.fill(irel, 128 - irel, 0);

      P.circle(c.pos.x, c.pos.y, 2 * c.R);
    }

    P.stroke(0, 0, 0);
    P.strokeWeight(1);
    P.line(p.left,0,p.left,100);

    P.stroke(0, 0, 0);
    P.strokeWeight(1);
    P.line(p.w,0,p.w,p.h);

    //const m = pixel2World(P.mouseX, P.mouseY);
    //P.circle(m.x, m.y, 1);

    P.stroke(0);
    P.strokeWeight(1);
    for (let i = 0; i < s.lines.length; i++) {
      const l = s.lines[i];
      P.line(l.a.x, l.a.y, l.b.x, l.b.y);
    }

  }

  function pixel2World(x, y) {

    // we fit a rectangle of w x h into the canvas
    const m = p.margin;
    const w = p.w + 2*m;
    const h = p.h + 2*m;
    const ratioX = P.width / w;
    const ratioY = P.height / h;
  
    x -= p.coord_center.x + 3*m;
    y -= p.coord_center.y + 3*m;
    if (ratioX < ratioY) {
      x /= ratioX;
      y /= ratioX;
      y -= (P.height - h * ratioX) / 2;
    } else {
      x /= ratioY;
      y /= ratioY;
      x -= (P.width - w * ratioY) / 2;
    }
    return {x: x, y: y}
  }
  


  let i_pressed = -1;

  const lastMouse = P.createVector(0,0);
  const deltaMouse = P.createVector(0,0);


  P.mousePressed = function () {

    const mobj = pixel2World(P.mouseX, P.mouseY);
    const m = P.createVector(mobj.x,mobj.y);

    let d_min = p.h + p.w;


    for (let j = 0; j < s.lines.length; j++) {

      for (let i = 0; i < s.cells.length; i++) {
        const ci = s.cells[i];

        const d = pv.dist(ci.pos, m);
        if( d < d_min && d < 2 * ci.R ) {
          i_pressed = i;
          d_min = d;
        }
      }

    const cj = s.lines[j];
    const d = pv.dist(ci.pos, m);
    if( d < d_min && d < 2 * cj.R ) {
      j_pressed = j;
      d_min = d;
  }
}

    if( i_pressed > -1) {
      s.cells[i_pressed].R = 3;
    }

    lastMouse.set(m);
  }


  P.touchMoved = function () {
    if( i_pressed > -1) {
      const mobj = pixel2World(P.mouseX, P.mouseY);
      const m = P.createVector(mobj.x,mobj.y);
      s.cells[i_pressed].pos.set(m);

      //deltaMouse.set(m);
      //deltaMouse.sub(lastMouse);

      //s.cells[i_pressed].pos.add(deltaMouse);
      //s.cells[i_pressed].R = 5;

      //lastMouse.set(m);
    }
  }

  P. mouseReleased = function () {
    if( i_pressed > -1) {
      //s.cells[i_pressed].R = 2;
      i_pressed = -1;
    }
  }

  function createLine(ax, ay, bx, by) {
    const a = P.createVector(ax, ay);
    const b = P.createVector(bx, by);
    const v = pv.sub(b, a);
    return {
      a: a,
      b: b,
      l0: v.mag(),
      v: v,
      n: v.copy().rotate(-P.HALF_PI).normalize(),
    };
  }
  
  
  function projectCellLine(c, l) {
    c.dx.set(c.pos);
    c.dx.sub(l.a);
  
    // compute such that: a + ca * v + cn * n = c.pos
    const ca = c.dx.dot(l.v) / l.l0;
    const cn = c.dx.dot(l.n);
  
    // compute the distance to the line
    if (P.abs(cn) > c.R) {
      return;
    }
  
    if (ca < 0) {
      const d = c.dx.mag();
      if (d > c.R) {
        return;
      }

      c.dx.normalize();
      c.dx.mult(c.R - d);
  
      // point-cell projection
      c.pos.add(c.dx);
    } else if (ca > l.l0) {
      // point-cell projection
      c.dx.set(c.pos);
      c.dx.sub(l.b);

      const d = c.dx.mag();
      if (d > c.R) {
        return;
      }

      c.dx.normalize();
      c.dx.mult(c.R - d);
      c.pos.add(c.dx);

    } else {
      // point-line projection
      c.dx.set(l.n);
      if (cn > 0) c.dx.mult(c.R - cn);
      else c.dx.mult(-c.R - cn);
      c.pos.add(c.dx);
    }
  }
  
};










