export const controls = {
  scale: 1,
  targetScale: 1,
  offsetX: 0,
  offsetY: 0,
  dragging: false,
  lastX: 0,
  lastY: 0,
  building: false,
  mousedown: false,
}

function handleZoom(deltaScale: number) {
  controls.targetScale += deltaScale;
  controls.targetScale = Math.max(0.5, Math.min(3, controls.targetScale)); // Clamp scale between 0.5 and 3
}

const canvas = document.body;//document.getElementById("canvas")! as HTMLCanvasElement;

// Mouse event handlers
canvas.addEventListener('mousedown', (e) => {
  controls.lastX = e.clientX;
  controls.lastY = e.clientY;

  if(!controls.building) {
    controls.dragging = true;
  }

  controls.mousedown = true;
});

canvas.addEventListener('mousemove', (e) => {
  if (controls.dragging) {
    controls.offsetX += e.clientX - controls.lastX;
    controls.offsetY += e.clientY - controls.lastY;
  }
  controls.lastX = e.clientX;
  controls.lastY = e.clientY;
});

canvas.addEventListener('mouseup', () => {
  controls.dragging = false;
  controls.mousedown = false;
});

// Zoom controls
window.addEventListener('keydown', (event) => {
  if (event.key === '=') {
    handleZoom(0.1); // Zoom in
  } else if (event.key === '-') {
    handleZoom(-0.1); // Zoom out
  }
});
