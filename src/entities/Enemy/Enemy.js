import Bullet from '../Bullet/Bullet';

const createjs = window.createjs;

const defaults = {
  type: 'enemy',
  weakness: 'BULLET',
  health: 25,
  delay: 5,
  defaultDelay: 8,
  fired: false,
  destroyed: false
};

class Enemy {
  constructor(bitmap, coords, stage, enemy, properties = {}) {
    this.properties = Object.assign({}, defaults, properties);

    this.stage = stage;

    const spritesheet = new createjs.SpriteSheet({
      images: [bitmap],
      frames: {
        width: 32,
        height: 32,
        regX: 32 / 2,
        regY: 32 / 3,
        numFrames: 20
      },
      animations: {
        idle: {
          frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
        }
      }
    });

    this.entity = new createjs.Sprite(spritesheet, 'idle');

    this.entity.x = coords.x;
    this.entity.y = coords.y;

    const angle = (Math.atan2(enemy.y - this.entity.y, enemy.x - this.entity.x)) * (180 / Math.PI);

    this.entity.rotation = angle;

    this.entity.setBounds(coords.x, coords.y, 32, 32);

    this.entity.gotoAndPlay('idle');

    this.stage.addChild(this.entity);
  }

  trackEnemy(enemy, delta) {
    if(!createjs.Ticker.paused && !this.properties.destroyed) {
      const angle = (Math.atan2(enemy.y - this.entity.y, enemy.x - this.entity.x)) * (180 / Math.PI) * 1.5;

      this.entity.rotation = angle;

      return angle;
    }
  }

  move(player, delta, entities) {
    if(!createjs.Ticker.paused && !this.properties.destroyed) {
      let newX;
      let newY;

      let collision = this.checkForCollisions(entities, newX, newY);

      const playerAngle = this.trackEnemy(player, delta);

      if(playerAngle < 0) {
        newX = this.entity.x + Math.sin(this.entity.rotation * (Math.PI / -180)) * delta * 100;
        newY = this.entity.y + Math.cos(this.entity.rotation * (Math.PI / -180)) * delta * 100;
      } else {
        newX = this.entity.x - Math.sin(this.entity.rotation * (Math.PI / -180)) * delta * 100;
        newY = this.entity.y - Math.cos(this.entity.rotation * (Math.PI / -180)) * delta * 100;
      }

      this.entity.x = newX;
      this.entity.y = newY;
    }
  }

  checkForCollisions(objects, newX, newY) {
    const hit = objects.some((object, index, array) => {
      if(object != this) {
        let collisionX = false;
        let collisionY = false;

        if(this.entity.x <= object.entity.x + object.entity._bounds.width && this.entity.x >= object.entity.x || object.entity.x <= this.entity.x + this.entity._bounds.width && object.entity.x >= this.entity.x) {
          collisionX = true;
        }

        if(this.entity.y <= object.entity.y + object.entity._bounds.height && this.entity.y >= object.entity.y || object.entity.y <= this.entity.y + this.entity._bounds.height && object.entity.y >= this.entity.y) {
          collisionY = true;
        }

        if(collisionX && collisionY) {
          object.takeHit(this.properties.dmg);

          return true;
        }
      }
    });

    return hit;
  }

  takeHit(dmg) {
    if(!createjs.Ticker.paused && !this.properties.destroyed) {
      this.properties.health -= dmg;

      if(this.properties.health <= 0) {
        this.destroy();
      }
    }
  }

  fireShot(bullets) {
    if(!createjs.Ticker.paused && !this.properties.destroyed) {
      this.properties.fired = true;

      const bullet = new Bullet(this.properties.bullet, this.entity, this.stage, { type: 'enemy', dmg: 50 });

      this.stage.addChild(bullet.entity);

      bullets.push(bullet);
    }
  }

  destroy() {
    this.properties.destroyed = true;

    this.stage.removeChild(this.entity);
  }
};

export default Enemy;
