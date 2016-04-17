import Bullet from '../Bullet/Bullet';

const createjs = window.createjs;

const defaults = {
  type: 'standard',
  weakness: 'BULLET',
  health: 25
};

class Enemy {
  constructor(bitmap, coords, stage, enemy, properties = {}) {
    this.properties = Object.assign(defaults, properties);

    this.stage = stage;

    const spritesheet = new createjs.SpriteSheet({
      images: [bitmap],
      frames: {
        width: 32,
        height: 32
      },
      animations: {
        idle: {
          frames: [0, 19],
          speed: 0.3333333
        }
      },
      framerate: 60
    });

    this.entity = new createjs.Sprite(spritesheet, 'idle');

    this.entity.x = coords.x;
    this.entity.y = coords.y;

    const angle = (Math.atan2(enemy.y - this.entity.y, enemy.x - this.entity.x)) * (180 / Math.PI);

    this.entity.rotation = angle;

    this.entity.setBounds(coords.x, coords.y, 32, 32);

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
    const bullet = new Bullet(this.properties.bullet, this.entity, { type: 'enemy' });

    this.stage.addChild(bullet.entity);

    bullets.push(bullet);
  }
};

export default Enemy;
