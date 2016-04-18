import Bullet from '../Bullet/Bullet';

const createjs = window.createjs;

const defaults = {
  type: 'enemy',
  weakness: 'BULLET',
  health: 5,
  delay: 5,
  defaultDelay: 8,
  fired: false,
  destroyed: false,
  AI: 'chaser'
};

const AIActions = {
  'chaser': ['trackEnemy', 'move', 'fireShot'],
  'little-circle': ['trackEnemy', 'littleCircle', 'fireShot'],
  'big-circle': ['bigCircle', 'fireShot'],
  'sentinel': ['trackEnemy', 'fireShot']
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

  react(enemy, delta, entities, bullets) {
    const AI = this.properties.AI;

    if(this.properties.delay > 0 && this.properties.fired) {
      this.properties.delay--;
    } else {
      this.properties.delay = this.properties.defaultDelay;
      this.properties.fired = false;
    }

    if(AIActions.hasOwnProperty(AI)) {
      AIActions[AI].forEach((action) => {
        this[action](enemy, delta, entities, bullets);
      });
    }
  }

  trackEnemy(enemy, delta) {
    if(!createjs.Ticker.paused && !this.properties.destroyed) {
      const angle = (Math.atan2(enemy.y - this.entity.y, enemy.x - this.entity.x)) * (180 / Math.PI) * 2;

      if(this.entity.x > enemy.x) {
        if(this.entity.y < enemy.y) {
          this.entity.rotation = angle / 1.5 - 70;
        } else {
          this.entity.rotation = angle / 2 + 70;
        }
      } else {
        if(this.entity.y < enemy.y) {
          this.entity.rotation = angle / 1.5 + 70;
        } else {
          this.entity.rotation = angle / 1.5 - 70;
        }
      }

      return angle;
    }
  }

  littleCircle(enemy, delta, entities, bullets) {
    const circleRadius = 300;

    if(!this.properties.circleGenerated) {
      const circleG = new createjs.Graphics();

      const circleCenter = {
        x: this.entity.x,
        y: this.entity.y
      };

      circleG
        .beginStroke(createjs.Graphics.getRGB(255, 255, 255))
        .drawCircle((this.entity.x), (this.entity.y), circleRadius)
      ;

      const circleS = new createjs.Shape(circleG);

      this.stage.addChild(circleS);

      this.properties.circleGenerated = true;

      this.properties.circle = {
        entity: circleS,
        center: circleCenter
      };

      console.log(this.properties.circle);
    }

    const angle = this.trackEnemy(enemy, delta) * 0.002;

    const newX = (this.properties.circle.center.x + Math.cos(angle) * circleRadius);
    const newY = (this.properties.circle.center.y + Math.sin(angle) * circleRadius);

    this.entity.x = newX;
    this.entity.y = newY;

    //console.log()
  }

  patrol(enemy, delta) {
    let edgeDistances = [
      Math.abs(0 - this.entity.x),
      Math.abs(this.stage.canvas.clientWidth - this.entity.x),
      Math.abs(0 - this.entity.y),
      Math.abs(this.stage.canvas.clientHeight - this.entity.y)
    ];

    let edges = [
      'x-start',
      'x-end',
      'y-start',
      'y-end'
    ];

    const closeXStart = this.entity.x >= -40 && this.entity.x <= 40;
    const closeXEnd = this.entity.x >= this.stage.canvas.clientWidth - 40 && this.entity.x <= this.stage.canvas.clientWidth + 40;

    const closeYStart = this.entity.y >= -40 && this.entity.y <= 40;
    const closeYEnd = this.entity.y >= this.stage.canvas.clientHeight - 40 && this.entity.y <= this.stage.canvas.clientHeight + 40;

    let closestEdge;

    if(this.properties.lastClosestEdge) {
      if(closeXStart || closeXEnd || closeYStart || closeYEnd) {
        edgeDistances.splice(edges.indexOf(this.properties.lastClosestEdge), 1);

        closestEdge = edges[edgeDistances.indexOf(Math.min(...edgeDistances))];
      } else {
        closestEdge = this.properties.lastClosestEdge;
      }
    } else {
     closestEdge = edges[edgeDistances.indexOf(Math.min(...edgeDistances))];
    }

    this.properties.lastClosestEdge = closestEdge;

    console.log('patrolling towards:', closestEdge);

    switch(closestEdge) {
      case edges[0]:
        this.trackEnemy({ x: 0, y: this.entity.y});

        if(this.entity.x > 0) {
          this.entity.x -= delta * (Math.floor(Math.random() * ((200 - 1) - 1 + 1)) + 1);
        } else {
          this.entity.x += delta * (Math.floor(Math.random() * ((200 - 1) - 1 + 1)) + 1);
        }

        break;

      case edges[1]:
        this.trackEnemy({ x: this.stage.canvas.clientWidth, y: this.entity.y});

        if(this.entity.x > this.stage.canvas.clientWidth) {
          this.entity.x -= delta * (Math.floor(Math.random() * ((200 - 1) - 1 + 1)) + 1);
        } else {
          this.entity.x += delta * (Math.floor(Math.random() * ((200 - 1) - 1 + 1)) + 1);
        }

        break;

      case edges[2]:
        this.trackEnemy({ x: this.entity.x, y: 0});

        if(this.entity.y > 0) {
          this.entity.y -= delta * (Math.floor(Math.random() * ((200 - 1) - 1 + 1)) + 1);
        } else {
          this.entity.y += delta * (Math.floor(Math.random() * ((200 - 1) - 1 + 1)) + 1);
        }

        break;

      case edges[3]:
        this.trackEnemy({ x: this.entity.x, y: this.stage.canvas.clientHeight});

        if(this.entity.y > this.stage.canvas.clientHeight) {
          this.y -= delta * (Math.floor(Math.random() * ((200 - 1) - 1 + 1)) + 1);
        } else {
          this.y += delta * (Math.floor(Math.random() * ((200 - 1) - 1 + 1)) + 1);
        }

        break;

      default:
        break;
    }
  }

  move(player, delta, entities) {
    if(!createjs.Ticker.paused && !this.properties.destroyed) {
      let newX;
      let newY;

      let collision = this.checkForCollisions(entities, newX, newY);

      const playerAngle = this.trackEnemy(player, delta);

      if(playerAngle < 0) {
        newX = this.entity.x + Math.sin(this.entity.rotation * (Math.PI / -180)) * delta * (Math.floor(Math.random() * ((200 - 1) - 1 + 1)) + 1);
        newY = this.entity.y + Math.cos(this.entity.rotation * (Math.PI / -180)) * delta * (Math.floor(Math.random() * ((200 - 1) - 1 + 1)) + 1);
      } else {
        newX = this.entity.x - Math.sin(this.entity.rotation * (Math.PI / -180)) * delta * (Math.floor(Math.random() * ((200 - 1) - 1 + 1)) + 1);
        newY = this.entity.y - Math.cos(this.entity.rotation * (Math.PI / -180)) * delta * (Math.floor(Math.random() * ((200 - 1) - 1 + 1)) + 1);
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

  fireShot(enemy, delta, entities, bullets) {
    if(!createjs.Ticker.paused && !this.properties.destroyed) {
      if(!this.properties.fired) {
        this.properties.fired = true;

        const bullet = new Bullet(this.properties.bullet, this.entity, this.stage, { type: 'enemy', dmg: 5 });

        this.stage.addChild(bullet.entity);

        bullets.push(bullet);
      }
    }
  }

  destroy() {
    this.properties.destroyed = true;

    this.stage.removeChild(this.entity);
  }
};

export default Enemy;
