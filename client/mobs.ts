import type { Mob } from "../server/types.ts";

const ratImg = new Image();
ratImg.src = 'assets/rat.png';

const catImg = new Image();
catImg.src = 'assets/cat.png';

const giraffeImg = new Image();
giraffeImg.src = 'assets/giraffe.png';

export function drawMob(ctx: CanvasRenderingContext2D, mob: Mob, animationTimer: number) {
  ctx.save();
  ctx.translate(mob.x, mob.y);
  ctx.rotate(animationTimer / 10);
  if(mob.type === "rat") {
    ctx.drawImage(ratImg, -25, -25, 50, 50);
  }
  if(mob.type === "cat") {
    ctx.drawImage(catImg, -25, -25, 50, 50);
  }
  if(mob.type === "giraffe") {
    ctx.drawImage(giraffeImg, -50, -50, 100, 100);
  }
  ctx.restore();
}
