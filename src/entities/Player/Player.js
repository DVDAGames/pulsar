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
      amount: 50
    },
    energyDrain: 250,
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
      amount: 100
    },
    delay: 10,
    transformDelay: 10,
    defaultDelay: 10,
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

    this.cooldowns = {};

    Object.keys(forms).forEach((power) => {
      const { delay, transformDelay } = this.getCooldowns(power);
      const delayActive = false;
      const transformDelayActive = false;

      this.cooldowns[power] = {
        delayActive,
        transformDelayActive,
        delay,
        transformDelay
      };
    });

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
    this.properties.energy = 200;
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
            console.log('out of energy');
            this.changeForms(ActionList[4]);
          }

          break;

        case ActionList[4]:
        default:
          if(this.properties.form.recharge.frequency > 0) {
            this.properties.form.recharge.frequency--;
          } else {
            this.properties.form.recharge.frequency = this.properties.form.recharge.defaultFrequency;
            if(this.properties.energy < this.properties.maxEnergy) {
              if(this.properties.energy + this.properties.form.recharge.amount < this.properties.maxEnergy) {
                this.properties.energy += this.properties.form.recharge.amount;
              } else {
                this.properties.energy = this.properties.maxEnergy;
              }
            }
          }

          break;
      }

      for(const power in this.cooldowns) {
        if(this.cooldowns.hasOwnProperty(power)) {
          if(this.cooldowns[power].delay > 0 && this.cooldowns[power].delayActive) {
            this.cooldowns[power].delay--;
          } else {
            this.cooldowns[power].delay = this.properties.formList[power].defaultDelay;
            this.cooldowns[power].delayActive = false;
          }

          if(this.cooldowns[power].transformDelay > 0 && this.cooldowns[power].transformDelayActive) {
            this.cooldowns[power].transformDelay--;
          } else {
            this.cooldowns[power].transformDelay = this.properties.formList[power].defaultTransformDelay;
            this.cooldowns[power].transformDelayActive = false;
          }
        }
      }

      return {
        cooldowns: this.cooldowns,
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

  changeForms(form) {
    if(!this.properties.lost) {
      if(form === ActionList[5] && this.properties.energy > 0 || form === ActionList[4]) {
        this.properties.form = Object.assign({}, forms[form]);
        this.properties.formName = form;

        this.resetCooldowns(form);

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

          break;

        case ActionList[3]:
          this.entity.rotation += delta * (180 / Math.PI) / 15;

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
            if(!this.cooldowns[ActionList[5]].delayActive) {
              this.entity.gotoAndPlay(this.properties.form.animations.action);

              this.properties.energy -= this.properties.form.energyDrain;
              this.properties.bullets += (this.properties.bullets + this.properties.form.generateBullets > this.properties.maxBullets) ? this.properties.maxBullets - this.properties.bullets : this.properties.form.generateBullets;

              this.cooldowns[ActionList[5]].delayActive = true;
            }
          }

          if(this.properties.energy <= 0) {
            this.changeForms(ActionList[4]);
          }

          break;

        //bullet power
        case ActionList[4]:
        default:
          if(this.properties.bullets > 0) {
            if(!this.cooldowns[ActionList[4]].delayActive) {
              this.properties.bullets--;

              const bullet = new Bullet(this.properties.bullet, this.entity, this.stage, { type: 'player', dmg: 60 });

              this.stage.addChild(bullet.entity);

              bullets.push(bullet);

              this.cooldowns[ActionList[4]].delayActive = true;
            }
          }

          break;
      }

      return {
        bullets,
        playerEnergy: this.properties.energy,
        playerBullets: this.properties.bullets,
        cooldowns: this.cooldowns
      };
    }
  }
};

export default Player;
