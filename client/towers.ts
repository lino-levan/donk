import type { Tower } from "../server/types.ts";

const houseImg = new Image();
houseImg.src = 'assets/house.png';

const irsImg = new Image();
irsImg.src = 'assets/irs.png';

const gasImg = new Image();
gasImg.src = 'assets/gas.png';

export function drawTower(ctx: CanvasRenderingContext2D, tower: Tower) {
  ctx.save();
  ctx.translate(tower.x, tower.y);
  if(tower.type === "house") {
    ctx.drawImage(houseImg, -50, -50, 100, 100);
  }
  if(tower.type === "irs") {
    ctx.drawImage(irsImg, -50, -50, 100, 100);
  }
  if(tower.type === "gas") {
    ctx.drawImage(gasImg, -50, -50, 100, 100);
  }
  ctx.restore();
}
