const createjs = window.createjs;

const defaults = {};

class Star {
  constructor(bitmap, width, height, coords, stage, properties = {}) {
    this.properties = Object.assign(defaults, properties);

    this.stage = stage;

    const spritesheet = new createjs.SpriteSheet({
      images: [bitmap],
      frames: {
        width: width,
        height: height,
        regX: width / 2,
        regY: height / 2,
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

    this.entity.gotoAndPlay('idle');

    this.stage.addChild(this.entity);
  }
};

export default Star;
