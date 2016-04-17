import Bullet from '../Bullet/Bullet';

const createjs = window.createjs;

const defaults = {
  type: 'standard',
  weakness: 'BULLET',
  health: 25,
  delay: 15,
  defaultDelay: 15,
  fired: false
};

class Enemy {
  constructor(bitmap, coords, stage, enemy, properties = {}) {
    this.properties = Object.assign(defaults, properties);

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
    if(!createjs.Ticker.paused) {
      const angle = (Math.atan2(enemy.y - this.entity.y, enemy.x - this.entity.x)) * (180 / Math.PI) * 1.5;

      this.entity.rotation = angle;
    }
  }

  move(player, delta) {
    if(!createjs.Ticker.paused) {
      this.trackEnemy(player, delta);

      this.entity.x -= Math.sin(this.entity.rotation * (Math.PI / -180)) * delta * 100;
      this.entity.y -= Math.cos(this.entity.rotation * (Math.PI / -180)) * delta * 100;
    }
  }

  fireShot(bullets) {
    this.properties.fired = true;

    const bullet = new Bullet(this.properties.bullet, this.entity, { type: 'enemy' });

    this.stage.addChild(bullet.entity);

    bullets.push(bullet);
  }
};

export default Enemy;
