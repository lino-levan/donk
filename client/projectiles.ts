export type Projectile = {
  type: "brick" | "oil";
  x: number;
  y: number;
  angle: number;
  lifetime: number;
  owner: string;
}

const brickImg = new Image();
brickImg.src = 'assets/brick.png';

const oilImg = new Image();
oilImg.src = 'assets/oil.png';

export function drawProjectile(ctx: CanvasRenderingContext2D, projectile: Projectile) {
  ctx.save();
  ctx.translate(projectile.x, projectile.y);
  ctx.rotate(projectile.angle);
  if(projectile.type === "brick") {
    ctx.drawImage(brickImg, -25, -10, 50, 20);
  }
  if(projectile.type === "oil") {
    ctx.drawImage(oilImg, -25, -25, 50, 20);
  }
  ctx.restore();
}
