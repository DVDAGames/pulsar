import ActionList from '../../config/actionlist';

import Bullet from '../../entities/Bullet/Bullet';

const createjs = window.createjs;

const forms = {
  [ActionList[5]]: {
    animations: {
      idle: 'cloud',
      action: 'absorb'
    },
    delay: 60,
    transformDelay: 30,
    defaultDelay: 60,
    defaultTransformDelay: 30
  },
  [ActionList[4]]: {
    animations: {
      idle: 'square',
      action: 'shield'
    },
    delay: 120,
    transformDelay: 60,
    defaultDelay: 120,
    defaultTransformDelay: 60
  },
  [ActionList[6]]: {
    animations: {
      idle: 'ship',
      action: 'ship'
    },
    delay: 15,
    transformDelay: 15,
    defaultDelay: 15,
    defaultTransformDelay: 15
  },
  [ActionList[7]]: {
    animations: {
      idle: 'sphere',
      action: 'burst'
    },
    delay: 180,
    transformDelay: 60,
    defaultDelay: 180,
    defaultTransformDelay: 60
  }
};

const defaultForm = Object.assign({}, forms[ActionList[5]]);

const defaults = {
  form: defaultForm,
  formList: forms,
  formName: ActionList[5],
  health: 100,
  energy: 10
};

class Player {
  constructor(bitmap, coords, stage, form = defaultForm, properties = {}) {
    this.properties = Object.assign(defaults, properties);

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
        square: {
          frames: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29]
        },
        shield: {
          frames: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
          next: 'square'
        },
        ship: {
          frames: [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69]
        },
        sphere: {
          frames: [70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89],
          speed: 0.3333333
        },
        burst: {
          frames: [90, 91, 92, 93, 94, 95, 96, 97, 98, 99],
          next: 'sphere'
        },
        absorb: {
          frames: [100, 101, 102, 103, 104],
          next: 'cloud'
        }
      }
    });

    this.entity = new createjs.Sprite(spritesheet);

    this.entity.setBounds((640 / 2 - 32 / 2), (480 / 2 - 32 / 2), 32, 32);

    this.entity.x = 640 / 2 - 32 / 2;
    this.entity.y = 480 / 2 - 32 / 2;

    this.entity.regX = 32 / 2;
    this.entity.regX = 32 / 3;

    this.entity.gotoAndPlay(this.properties.form.animations.idle);

    this.stage.addChild(this.entity);
  }

  getCooldowns(form) {
    const delay = this.properties.formList[form].delay;
    const transformDelay = this.properties.formList[form].transformDelay;

    return {
      delay,
      transformDelay
    };
  }

  resetCooldowns(form, transform = false) {
    let type = 'delay';
    let typeDefault = 'defaultDelay';

    if(transform) {
      type = 'transformDelay';
      typeDefault = 'defaultTransformDelay';
    }

    this.properties.formList[form][type] = this.properties.formList[form][typeDefault];
  }

  resetDelay() {
    this.properties.formList.delay = this.properties.formList.defaultDelay;
  }

  changeForms(form) {
    this.properties.form = Object.assign({}, forms[form]);
    this.properties.formName = form;

    this.entity.gotoAndPlay(this.properties.form.animations.idle);
  }

  move(action, delta) {
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

  use(bullets) {
    switch(this.properties.formName) {
      //bullet power
      case ActionList[6]:
        const bullet = new Bullet(this.properties.bullet, this.entity, { type: 'player' });

        this.stage.addChild(bullet.entity);

        bullets.push(bullet);

        break;

      //shield power
      case ActionList[4]:
      case ActionList[7]:
      case ActionList[5]:
        this.entity.gotoAndPlay(this.properties.form.animations.action);

        break;
    }

    return bullets;
  }
};

export default Player;
