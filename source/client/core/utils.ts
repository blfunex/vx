const debug = document.createElement("div");

document.body.appendChild(debug);

Object.assign(debug.style, {
  position: "fixed",
  opacity: 0.25,
  pointerEvents: "none",
  top: "0",
  left: "0"
});

export function createDebugCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  debug.appendChild(canvas);
  return (canvas as unknown) as OffscreenCanvas;
}
