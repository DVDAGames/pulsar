const createjs = window.createjs;

const defaults = {
  speed: 10,
  dmg: 5,
  hitTestDelay: 400
};

class Bullet {
  constructor(bitmap, origin, stage, properties = {}) {
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

    let x = origin.x;
    let y = origin.y;

    x -= Math.sin(origin.rotation * (Math.PI / -180));
    y -= Math.cos(origin.rotation * (Math.PI / -180));

    this.shotFrom = origin;

    this.entity.x = x;
    this.entity.y = y;

    this.entity.setBounds(x, y, 8, 8);

    this.origin = {
      x: x,
      y: y,
      rotation: origin.rotation
    };

    this.entity.gotoAndPlay('idle');
  }

  collisionCheck(objects) {
    let hits = [];
    let points = 0;

    const hit = objects.some((object, index) => {
      let check = object;

      if(object.properties.type !== this.properties.type) {
        if(object.hasOwnProperty('entity')) {
          check = object.entity;
        }

        let collisionX = false;
        let collisionY = false;

        if(this.entity.x <= check.x + check._bounds.width && this.entity.x >= check.x || check.x <= this.entity.x + this.entity._bounds.width && check.x >= this.entity.x) {
          collisionX = true;
        }

        if(this.entity.y <= check.y + check._bounds.height && this.entity.y >= check.y || check.y <= this.entity.y + this.entity._bounds.height && check.y >= this.entity.y) {
          collisionY = true;
        }

        if(collisionX && collisionY) {
          const pts = object.takeHit(this.properties.dmg);

          if(pts) {
            points += pts;
          }

          return true;
        }
      }
    });

    if(hit) {
      this.destroy();

      return {
        hit: true,
        pts: points
      };
    }

    return {
      hit: false,
      pts: points
    };
  }

  shoot(delta, entities) {
    if(!createjs.Ticker.paused) {
      const hitCheck = this.collisionCheck(entities);
      let offScreen = false;

      if(!hitCheck.hit) {
        this.entity.x -= Math.sin(this.origin.rotation * (Math.PI / -180)) * this.properties.speed;
        this.entity.y -= Math.cos(this.origin.rotation * (Math.PI / -180)) * this.properties.speed;
      }

      if(this.entity.x > this.stage.canvas.clientWidth + 50 || this.entity.x < -50 || this.entity.y < -50 || this.entity.y > this.stage.canvas.clientHeight) {
        offScreen = true;

        this.destroy();
      }

      return {
        hitCheck,
        offScreen
      };
    }
  }

  destroy() {
    this.stage.removeChild(this.entity);
  }
};

export default Bullet;
