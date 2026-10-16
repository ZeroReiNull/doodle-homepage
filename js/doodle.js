/** Pointer-based doodle canvas with responsive, theme-aware redraws. */
const canvas = document.getElementById("doodle-canvas");
const ctx = canvas.getContext("2d");
const strokes = [];
let currentStroke = null;
let drawingPointer = null;
let canvasWidth = 0;
let canvasHeight = 0;
let canvasScale = 1;

function redrawCanvas() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim();
  ctx.fillStyle = ctx.strokeStyle;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const points of strokes) {
    ctx.beginPath();
    const first = points[0];
    if (points.length === 1) {
      ctx.arc(first.x * canvasWidth, first.y * canvasHeight, 1, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.moveTo(first.x * canvasWidth, first.y * canvasHeight);
      points.slice(1).forEach(p => ctx.lineTo(p.x * canvasWidth, p.y * canvasHeight));
      ctx.stroke();
    }
  }
}

function resizeCanvas() {
  canvasWidth = canvas.clientWidth;
  canvasHeight = canvas.clientHeight;
  canvasScale = window.devicePixelRatio || 1;
  const width = Math.round(canvasWidth * canvasScale);
  const height = Math.round(canvasHeight * canvasScale);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  redrawCanvas();
}

window.addEventListener("resize", resizeCanvas);
if (typeof ResizeObserver !== "undefined") new ResizeObserver(resizeCanvas).observe(canvas);
setTimeout(resizeCanvas, 0);
systemTheme.addEventListener("change", () => requestAnimationFrame(redrawCanvas));

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left - canvas.clientLeft) / canvasWidth,
    y: (e.clientY - rect.top - canvas.clientTop) / canvasHeight
  };
}

canvas.addEventListener("pointerdown", e => {
  if (drawingPointer !== null || (e.pointerType === "mouse" && e.button !== 0)) return;
  e.preventDefault();
  resizeCanvas();
  drawingPointer = e.pointerId;
  canvas.setPointerCapture(e.pointerId);
  currentStroke = [getPos(e)];
  strokes.push(currentStroke);
  redrawCanvas();
});

canvas.addEventListener("pointermove", e => {
  if (e.pointerId !== drawingPointer) return;
  for (const point of (e.getCoalescedEvents?.().length ? e.getCoalescedEvents() : [e])) {
    currentStroke.push(getPos(point));
  }
  redrawCanvas();
});

function finishStroke(e) {
  if (e.pointerId !== drawingPointer) return;
  drawingPointer = null;
  currentStroke = null;
}

canvas.addEventListener("pointerup", finishStroke);
canvas.addEventListener("pointercancel", finishStroke);
canvas.addEventListener("lostpointercapture", finishStroke);
document.getElementById("clear-canvas-btn").addEventListener("click", () => {
  strokes.length = 0;
  drawingPointer = null;
  currentStroke = null;
  redrawCanvas();
});
