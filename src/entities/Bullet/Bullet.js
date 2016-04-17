const createjs = window.createjs;

const defaults = {
  speed: 10,
  dmg: 25
};

class Bullet {
  constructor(bitmap, origin, properties = {}) {
    this.properties = Object.assign(defaults, properties);

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

    let x = origin.x;
    let y = origin.y;

    x -= Math.sin(origin.rotation * (Math.PI / -180));
    y -= Math.cos(origin.rotation * (Math.PI / -180));

    this.entity.x = x;
    this.entity.y = y;

    this.origin = {
      x: x,
      y: y,
      rotation: origin.rotation
    };

    this.entity.gotoAndPlay('idle');
  }

  shoot() {
    if(!createjs.Ticker.paused) {
      this.entity.x -= Math.sin(this.origin.rotation * (Math.PI / -180)) * this.properties.speed;
      this.entity.y -= Math.cos(this.origin.rotation * (Math.PI / -180)) * this.properties.speed;
    }
  }
};

export default Bullet;
