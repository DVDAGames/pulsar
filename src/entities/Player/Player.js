import ActionList from '../../config/actionlist';

import Bullet from '../../entities/Bullet/Bullet';

const createjs = window.createjs;

const forms = [
  ActionList[5],
  ActionList[6], //switch to 4 later
  ActionList[4], //switch back to 6 later
  ActionList[7]
];

const defaultForm = forms[0];

const defaults = {
  form: ActionList[5],
  health: 100,
  energy: 10
};

class Player {
  constructor(bitmaps, coords, stage, form = defaultForm, properties = {}) {
    this.properties = Object.assign(defaults, properties);

    this.stage = stage;

    this.formBitmaps = [];

    bitmaps.forEach((bitmap, index) => {
      this.formBitmaps[forms[index]] = bitmap;
    });

    const regX = 32 / 2;
    const regY = 32 / 3;
    const bounds = {
      x: (640 / 2 - 32 / 2),
      y: (480 / 2 - 32 / 2),
      width: 32,
      height: 32
    };

    const spritesheet = new createjs.SpriteSheet({
      images: [this.formBitmaps[form]],
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

    this.entity.setBounds((640 / 2 - 32 / 2), (480 / 2 - 32 / 2), 32, 32);

    this.entity.x = 640 / 2 - 32 / 2;
    this.entity.y = 480 / 2 - 32 / 2;

    this.entity.regX = 32 / 2;
    this.entity.regX = 32 / 3;

    this.stage.addChild(this.entity);
  }

  changeForms(form) {
    this.form = form;

    const spritesheet = new createjs.SpriteSheet({
      images: [this.formBitmaps[form]],
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
  }

  move(action, delta) {
    switch(action) {
      case ActionList[0]:
        this.entity.x -= Math.sin(this.entity.rotation * (Math.PI / -180)) * delta;
        this.entity.y -= Math.cos(this.entity.rotation * (Math.PI / -180)) * delta;

        break;

      case ActionList[1]:
        this.entity.x += Math.sin(this.entity.rotation * (Math.PI / -180)) * delta;
        this.entity.y += Math.cos(this.entity.rotation * (Math.PI / -180)) * delta;

        break;

      case ActionList[2]:
        this.entity.rotation -= delta * (180 / Math.PI) / 25;

        break;

      case ActionList[3]:
        this.entity.rotation += delta * (180 / Math.PI) / 25;

        break;

      default:
        break;
    }
  }

  use(bullets) {
    switch(this.form) {
      //bullet power
      case ActionList[6]:
        const bullet = new Bullet(this.properties.bullet, this.entity, { type: 'player' });

        this.stage.addChild(bullet.entity);

        bullets.push(bullet);

        return bullets;

        break;

      //absorb power
      case ActionList[5]:
      default:
        //use absorb power
        break
    }
  }
};

export default Player;
