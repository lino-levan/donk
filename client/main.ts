/// <reference lib="dom" />

import { Game } from "./game.ts";
import { controls } from "./controls.ts";
const game = new Game();

const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

// Smoothly interpolate between the current and target values
function smoothStep(start: number, end: number, step: number) {
  return start + (end - start) * step;
}

function eventLoop() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Smoothly update the scale and offset
  controls.scale = smoothStep(controls.scale, controls.targetScale, 0.1);
  controls.offsetX = smoothStep(controls.offsetX, controls.offsetX, 0.1);
  controls.offsetY = smoothStep(controls.offsetY, controls.offsetY, 0.1);

  ctx.save();
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.translate(controls.offsetX, controls.offsetY);
  ctx.scale(controls.scale, controls.scale);

  game.render(ctx);

  ctx.restore();

  setTimeout(eventLoop, 1000 / 60);
}

eventLoop();
