import Bullet from '../Bullet/Bullet';

const createjs = window.createjs;

const defaults = {
  type: 'enemy',
  weakness: 'BULLET',
  health: 10,
  delay: 10,
  defaultDelay: 10,
  fired: false,
  destroyed: false,
  AI: 'chaser',
  pts: 20,
  dmg: 10
};

const AIActions = {
  'chaser': ['trackEnemy', 'move', 'fireShot'],
  'arc': ['trackEnemy', 'littleCircle', 'fireShot'],
  'patroller': ['trackEnemy', 'patrol', 'fireShot'],
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

  playSound(id) {
    createjs.Sound.play(`sound/${id}`);
  }

  react(enemy, delta, entities, bullets, points) {
    const AI = this.properties.AI;

    if(AIActions.hasOwnProperty(AI)) {
      AIActions[AI].forEach((action) => {
        if(action !== 'fireShot') {
          this[action](enemy, delta, entities, bullets);
        } else {
          if(this.properties.delay > 0 && this.properties.fired) {
            this.properties.delay--;
          } else {
            this.properties.delay = this.properties.defaultDelay;
            this.properties.fired = false;

            this[action](enemy, delta, entities, bullets);
          }
        }
      });
    }
  }

  trackEnemy(enemy, delta) {
    if(!createjs.Ticker.paused && !this.properties.destroyed) {
      const angle = (Math.atan2(enemy.y - this.entity.y, enemy.x - this.entity.x)) * (180 / Math.PI) * 2;

      if(Math.abs(this.entity.x - enemy.x) > 50 && Math.abs(this.entity.y - enemy.y) > 50) {
        if(this.entity.x > enemy.x + 50) {
          if(this.entity.y < enemy.y - 50) {
            this.entity.rotation = angle / 1.5 - 70;
          } else {
            this.entity.rotation = angle / 2 + 70;
          }
        } else {
          if(this.entity.y < enemy.y - 50) {
            this.entity.rotation = angle / 1.5 + 70;
          } else {
            this.entity.rotation = angle / 1.5 - 70;
          }
        }
      }

      return angle;
    }
  }

  littleCircle(enemy, delta, entities, bullets) {
    const circleRadius = 150;

    if(!this.properties.circleGenerated) {
      const circleG = new createjs.Graphics();

      this.properties.circle = {
        x: this.entity.x,
        y: this.entity.y,
        radius: circleRadius
      };

      this.properties.circleGenerated = true;
    }

    const angle = this.trackEnemy(enemy, delta) / 120;

    let newX = (this.properties.circle.x + Math.cos(angle) * circleRadius);
    let newY = (this.properties.circle.y + Math.sin(angle) * circleRadius);

    if(Math.abs(this.entity.x - enemy.x) < 50 && Math.abs(this.entity.y - enemy.y) < 50) {
      newX = newX - 20;
      newY = newY - 20;
    } else {
      this.entity.x = newX;
      this.entity.y = newY;
    }
  }

  patrol(enemy, delta) {
    if(!createjs.Ticker.paused) {
      const edges = [
        'x-start',
        'x-end',
        'y-start',
        'y-end'
      ];

      if(!this.properties.patrolGenerated) {
        let edgeDistances = [
          Math.abs(0 - this.entity.x),
          Math.abs(this.stage.canvas.clientWidth - this.entity.x),
          Math.abs(0 - this.entity.y),
          Math.abs(this.stage.canvas.clientHeight - this.entity.y)
        ];

        this.properties.patrolStartPos = {
          x: this.entity.x,
          y: this.entity.y
        };

        this.properties.patrolGenerated = true;
        this.properties.patrolEnded = false;

        let farthestEdge = edges[edgeDistances.indexOf(Math.max(...edgeDistances))];

        let patrolEndPos;

        this.properties.farthestEdge = farthestEdge;

        switch(farthestEdge) {
          case edges[0]:
            patrolEndPos = {
              x: 0 + this.entity._bounds.width,
              y: this.entity.y
            };

            break;

          case edges[1]:
            patrolEndPos = {
              x: this.stage.canvas.clientWidth - this.entity._bounds.width,
              y: this.entity.y
            };

            break;

          case edges[2]:
            patrolEndPos = {
              x: this.entity.x,
              y: 0 + this.entity._bounds.height
            }

            break;

          case edges[3]:
            patrolEndPos = {
              x: this.entity.x,
              y: this.stage.canvas.clientHeight - this.entity._bounds.height
            };

            break;

          default:
            break;
        }

        this.properties.patrolEndPos = patrolEndPos;
      }

      if(!this.properties.patrolEnded) {
        if(this.properties.farthestEdge === edges[1]) {
          this.entity.x += delta * 50;
        }

        if(this.properties.farthestEdge === edges[3]) {
          this.entity.y += delta * 50;
        }

        if(this.properties.farthestEdge === edges[0]) {
          this.entity.x -= delta * 50;
        }

        if(this.properties.farthestEdge === edges[2]) {
          this.entity.y -= delta * 50;
        }

        if(Math.abs(this.entity.x - this.properties.patrolEndPos.x) <= 40 && Math.abs(this.entity.y - this.properties.patrolEndPos.y) <= 40) {
          this.properties.patrolEnded = true;
        }
      } else {
        if(this.properties.farthestEdge === edges[1]) {
          this.entity.x -= delta * 50;
        }

        if(this.properties.farthestEdge === edges[3]) {
          this.entity.y -= delta * 50;
        }

        if(this.properties.farthestEdge === edges[0]) {
          this.entity.x += delta * 50;
        }

        if(this.properties.farthestEdge === edges[2]) {
          this.entity.y += delta * 50;
        }

        if(Math.abs(this.entity.x - this.properties.patrolStartPos.x) <= 40 && Math.abs(this.entity.y - this.properties.patrolStartPos.y) <= 40) {
          this.properties.patrolEnded = false;
        }
      }
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
      }
    });

    return hit;
  }

  takeHit(dmg) {
    if(!createjs.Ticker.paused && !this.properties.destroyed) {
      this.properties.health -= dmg;

      if(this.properties.health <= 0) {
        this.destroy();

        return this.properties.pts;
      }
    }
  }

  fireShot(enemy, delta, entities, bullets) {
    if(!createjs.Ticker.paused && !this.properties.destroyed) {
      if(!this.properties.fired) {
        this.properties.fired = true;

        this.playSound('enemy_bullet');

        const bullet = new Bullet(this.properties.bullet, this.entity, this.stage, { type: 'enemy', dmg: this.properties.dmg });

        this.stage.addChild(bullet.entity);

        bullets.push(bullet);
      }
    }
  }

  destroy() {
    this.properties.destroyed = true;

    this.playSound('enemy_destroyed');

    this.stage.removeChild(this.entity);
  }
};

export default Enemy;
