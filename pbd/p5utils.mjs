/* Helper functions */
export function scaleCanvas(P, p) {
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
