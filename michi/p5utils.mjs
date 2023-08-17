/* Helper functions */
export function scaleCanvas(P, p) {
  // we fit a rectangle of w x h into the canvas
  const m = p.margin;
  const w = p.w + 2*m;
  const h = p.h + 2*m;
  const ratioX = P.width / w;
  const ratioY = P.height / h;

  if (ratioX < ratioY) {
    P.translate(0, (P.height - h * ratioX) / 2);
    P.scale(ratioX, ratioX);
  } else {
    P.translate((P.width - w * ratioY) / 2, 0);
    P.scale(ratioY, ratioY);
  }
  P.translate(p.coord_center.x + m, p.coord_center.y + m);
}
