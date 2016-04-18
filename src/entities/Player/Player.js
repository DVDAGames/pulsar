import ActionList from '../../config/actionlist';

import Bullet from '../../entities/Bullet/Bullet';

const createjs = window.createjs;

const forms = {
  [ActionList[5]]: {
    animations: {
      idle: 'cloud',
      action: 'absorb'
    },
    drain: {
      freqeuncy: 30,
      defaultFrequency: 30,
      amount: 1
    },
    energyDrain: 100,
    generateBullets: 25,
    delay: 60,
    transformDelay: 30,
    defaultDelay: 60,
    defaultTransformDelay: 30
  },
  [ActionList[4]]: {
    animations: {
      idle: 'ship',
      action: 'ship'
    },
    recharge: {
      frequency: 60,
      defaultFrequency: 60,
      amount: 1
    },
    delay: 5,
    transformDelay: 10,
    defaultDelay: 5,
    defaultTransformDelay: 10
  }
};

const defaultForm = Object.assign({}, forms[ActionList[4]]);

const defaults = {
  type: 'player',
  form: defaultForm,
  formList: forms,
  formName: ActionList[4],
  health: 1000,
  energy: 1000,
  maxBullets: 250,
  bullets: 25,
  lives: 3,
  score: 0,
  lost: false
};

class Player {
  constructor(bitmap, coords, stage, form = defaultForm, properties = {}) {
    this.properties = Object.assign({}, defaults, properties);

    this.stage = stage;

    const spritesheet = new createjs.SpriteSheet({
      images: [bitmap],
      frames: {
        width: 32,
        height: 32,
        regX: 32 / 2,
        regY: 32 / 3,
        numFrames: 105
      },
      animations: {
        cloud: {
          frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
        },
        ship: {
          frames: [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69]
        },
        absorb: {
          frames: [100, 101, 102, 103, 104],
          next: 'cloud'
        }
      }
    });

    this.entity = new createjs.Sprite(spritesheet);

    this.generateShip();
  }

  generateShip() {
    this.entity.setBounds((640 / 2 - 32 / 2), (480 / 2 - 32 / 2), 32, 32);

    this.entity.x = 640 / 2 - 32 / 2;
    this.entity.y = 480 / 2 - 32 / 2;

    this.entity.regX = 32 / 2;
    this.entity.regX = 32 / 3;

    this.properties.health = 1000;
    this.properties.energy =200;
    this.properties.bullets = 25;

    this.entity.gotoAndPlay(this.properties.form.animations.idle);

    this.stage.addChild(this.entity);
  }

  exist(delta) {
    if(!this.properties.lost && !createjs.Ticker.paused) {
      switch(this.properties.formName) {
        case ActionList[5]:
          if(this.properties.form.drain.frequency > 0) {
            this.properties.form.drain.frequency--;
          } else {
            this.properties.form.drain.frequency = this.properties.form.drain.defaultFrequency;
            this.properties.energy -= this.properties.form.drain.amount;
          }

          if(this.properties.energy <= 0) {
            this.changeForms(ActionList[4]);
          }

          break;

        case ActionList[4]:
        default:
          if(this.properties.form.recharge.frequency > 0) {
            this.properties.form.recharge.frequency--;
          } else {
            this.properties.form.recharge.frequency = this.properties.form.recharge.defaultFrequency;
            this.properties.energy += this.properties.form.recharge.amount;
          }

          break;
      }

      return {
        energy: this.properties.energy,
        health: this.properties.health,
        bullets: this.properties.bullets
      };
    }
  }

  getCooldowns(form) {
    if(!this.properties.lost) {
      const delay = this.properties.formList[form].delay;
      const transformDelay = this.properties.formList[form].transformDelay;

      return {
        delay,
        transformDelay
      };
    }
  }

  resetCooldowns(form, transform = false) {
    if(!this.properties.lost) {
      let type = 'delay';
      let typeDefault = 'defaultDelay';

      if(transform) {
        type = 'transformDelay';
        typeDefault = 'defaultTransformDelay';
      }

      this.properties.formList[form][type] = this.properties.formList[form][typeDefault];
    }
  }

  resetDelay() {
    if(!this.properties.lost) {
      this.properties.formList.delay = this.properties.formList.defaultDelay;
    }
  }

  changeForms(form) {
    if(!this.properties.lost) {
      if(form === ActionList[4] && this.properties.energy > 0 || form == ActionList[5]) {
        this.properties.form = Object.assign({}, forms[form]);
        this.properties.formName = form;

        this.entity.gotoAndPlay(this.properties.form.animations.idle);

        return true;
      }

      return false;
    }
  }

  move(action, delta) {
    if(!this.properties.lost) {
      switch(action) {
        case ActionList[0]:
          this.entity.x -= Math.sin(this.entity.rotation * (Math.PI / -180)) * delta * 2.5;
          this.entity.y -= Math.cos(this.entity.rotation * (Math.PI / -180)) * delta * 2.5;

          break;

        case ActionList[1]:
          this.entity.x += Math.sin(this.entity.rotation * (Math.PI / -180)) * delta * 2.5;
          this.entity.y += Math.cos(this.entity.rotation * (Math.PI / -180)) * delta * 2.5;

          break;

        case ActionList[2]:
          this.entity.rotation -= delta * (180 / Math.PI) / 15;
          this.entity.x -= Math.sin(this.entity.rotation * (Math.PI / -180)) * delta * 1.5;

          break;

        case ActionList[3]:
          this.entity.rotation += delta * (180 / Math.PI) / 15;
          this.entity.x += Math.sin(this.entity.rotation * (Math.PI / -180)) * delta * 2.5;

          break;

        default:
          break;
      }
    }
  }

  takeHit(dmg) {
    if(!this.properties.lost) {
      if(dmg) {
        switch(this.properties.formName) {
          case ActionList[5]:
            if(this.properties.energy > 0) {
              this.properties.energy - 10
            }

            if(this.properties.bullets < this.properties.maxBullets) {
              this.properties.bullets++;
            }

            if(this.properties.energy <= 0) {
              this.changeForms(ActionList[4]);
            }

            break;

          case ActionList[4]:
          default:
            this.properties.health -= dmg;

            break;
        }
      }

      if(this.properties.health <= 0) {
        this.destroy();
      }
    }
  }

  destroy() {
    this.stage.removeChild(this.entity);

    this.properties.lives--;

    if(this.properties.lives >= 0) {
      this.generateShip();
    } else {
      this.properties.lost = true;
    }
  }

  use(bullets) {
    if(!this.properties.lost) {
      switch(this.properties.formName) {
        //absorb power
        case ActionList[5]:
          if(this.properties.energy > 0 && this.properties.energy > this.properties.form.energyDrain && this.properties.bullets < this.properties.maxBullets) {
            this.entity.gotoAndPlay(this.properties.form.animations.action);

            this.properties.energy -= this.properties.form.energyDrain;
            this.properties.bullets += (this.properties.bullets + this.properties.form.generateBullets > this.properties.maxBullets) ? this.properties.maxBullets - this.properties.bullets : this.properties.form.generateBullets;
          }

          if(this.properties.energy <= 0) {
            this.changeForms(ActionList[4]);
          }

          break;

        //bullet power
        case ActionList[4]:
        default:
          if(this.properties.bullets > 0) {
            this.properties.bullets--;

            const bullet = new Bullet(this.properties.bullet, this.entity, this.stage, { type: 'player', dmg: 30 });

            this.stage.addChild(bullet.entity);

            bullets.push(bullet);
          }

          break;
      }

      return {
        bullets,
        playerEnergy: this.properties.energy,
        playerBullets: this.properties.bullets
      };
    }
  }
};

export default Player;
