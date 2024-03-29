import { drawMob } from "./mobs.ts";
import { drawTower } from "./towers.ts";
import { drawProjectile, type Projectile } from "./projectiles.ts";
import { killAnimal, placeBuilding, currentWorldData } from "./socket.ts";
import { controls } from "./controls.ts";
import { selectedTower } from "./ui.ts";

const projectiles: Projectile[] = [];

let animationTimer = 0;
const costOfTower = {
  "house": 100,
  "irs": 200,
  "gas": 300,
};
const path = [[10, 10], [1150.0, 10.0], [1200.0, 60.0], [1200.0, 260.0], [1150.0, 310.0], [60.0, 310.0], [10.0, 360.0], [10.0, 560.0], [60.0, 610.0], [1150.0, 610.0], [1200.0, 660.0], [1200.0, 860.0], [1150.0, 910.0], [60.0, 910.0], [10.0, 960.0], [10.0, 1160.0], [60.0, 1210.0], [1150.0, 1210.0], [1219.23, 1163.85], [1680.77, 56.15], [1650.0, 10.0], [1350.0, 10.0], [1315.81, 57.43], [1684.19, 1162.57], [1750.0, 1210.0], [1800, 1210]];
export class Game {
  constructor() {
  }

  render(ctx: CanvasRenderingContext2D) {
    if(currentWorldData === null) {
      ctx.fillStyle = "black";
      ctx.font = "30px Arial";
      ctx.fillText("Loading...", 10, 50);
      return;
    }

    animationTimer++;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    for(const point of path) {
      ctx.lineTo(point[0], point[1]);
    }
    ctx.stroke();

    for(const tower of currentWorldData.towers) {
      drawTower(ctx, tower);
    }

    for(const mob of currentWorldData.animals) {
      drawMob(ctx, mob, animationTimer);
    }

    for(const projectile of projectiles) {
      drawProjectile(ctx, projectile);
    }

    // Move the mobs towards their point
    for(const mob of currentWorldData.animals) {
      const point = path[mob.nextPoint];
      const dx = point[0] - mob.x;
      const dy = point[1] - mob.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if(distance < 5) {
        mob.nextPoint++;
        if(mob.nextPoint >= path.length) {
          mob.nextPoint = 0;
        }
        continue;
      }
      mob.x += dx / distance * 3;
      mob.y += dy / distance * 3;

      // Remove mobs that have no health
      if(mob.health <= 0) {
        killAnimal(mob.id, mob.lastShotBy);
      }
    }

    // Towers shoot at mobs
    for(const tower of currentWorldData.towers) {
      if(tower.cooldown !== 0) {
        tower.cooldown--;
        continue;
      }

      if(tower.type === "irs") {
        continue;
      }

      // Collect mobs within 100 pixels
      const mobsInRange = currentWorldData.animals.filter(mob => {
        const dx = mob.x - tower.x;
        const dy = mob.y - tower.y;
        return Math.sqrt(dx * dx + dy * dy) < 500;
      });

      // Shoot at the first mob in range
      if(mobsInRange.length > 0) {
        const mob = mobsInRange[0];
        const dx = mob.x - tower.x;
        const dy = mob.y - tower.y;

        // Adjust the target angle to account for the mob's movement
        const angle = Math.atan2(dy, dx);
        if(tower.type === "house") {
          projectiles.push({
            type: "brick",
            x: tower.x,
            y: tower.y,
            angle,
            lifetime: 100,
            owner: tower.owner
          });
          tower.cooldown = 20;
        } else if(tower.type === "gas") {
          projectiles.push({
            type: "oil",
            x: tower.x,
            y: tower.y,
            angle,
            lifetime: 100,
            owner: tower.owner
          });
          tower.cooldown = 5;
        }
      }
    }

    // Move the projectiles
    for(const projectile of projectiles) {
      projectile.x += Math.cos(projectile.angle) * 5;
      projectile.y += Math.sin(projectile.angle) * 5;
      projectile.lifetime--;

      // Apply damage to mobs that are hit by projectiles
      for(const mob of currentWorldData.animals) {
        const dx = mob.x - projectile.x;
        const dy = mob.y - projectile.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if(distance < 50) {
          mob.health -= 10;
          mob.lastShotBy = projectile.owner;
          projectiles.splice(projectiles.indexOf(projectile), 1);
          continue;
        }
      }

      // Remove the projectile if it is out of lifetime
      if(projectile.lifetime === 0) {
        projectiles.splice(projectiles.indexOf(projectile), 1);
      }
    }

    const gameX = (controls.lastX - controls.offsetX) / controls.scale;
    const gameY = (controls.lastY - controls.offsetY) / controls.scale;

    if(controls.building) {
      // Check if the tower can be placed
      let canPlace = true;
      for(const tower of currentWorldData.towers) {
        const dx = tower.x - gameX;
        const dy = tower.y - gameY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if(distance < 50) {
          canPlace = false;
          break;
        }
      }

      ctx.globalAlpha = 0.5;
      if(!canPlace) {
        ctx.globalCompositeOperation = "difference";
      }
      drawTower(ctx, {
        type: selectedTower,
        x: gameX,
        y: gameY,
        cooldown: 0,
        cost: costOfTower[selectedTower],
        owner: "player"
      })
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      if(controls.mousedown && canPlace) {
        placeBuilding({
          type: selectedTower,
          x: gameX,
          y: gameY,
          cooldown: 0,
          cost: costOfTower[selectedTower],
          owner: "player"
        })
        controls.mousedown = false;
        controls.building = false;
      }
    }
  }
}
