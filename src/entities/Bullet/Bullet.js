const createjs = window.createjs;

const defaults = {
  speed: 10,
  dmg: 25
};

class Bullet {
  constructor(bitmap, origin, properties = {}) {
    this.properties = Object.assign(defaults, properties);

    this.entity = new createjs.Bitmap(bitmap);

    let x = origin.x;
    let y = origin.y;

    x -= Math.sin(origin.rotation * (Math.PI / -180));
    y -= Math.cos(origin.rotation * (Math.PI / -180));

    const bulletRect = new createjs.Rectangle(10, 8, 12, 12);

    this.entity.setBounds(x, y, 8, 8);
    this.entity.sourceRect = bulletRect;

    this.entity.x = x;
    this.entity.y = y;

    this.origin = {
      x: x,
      y: y,
      rotation: origin.rotation
    };
  }

  shoot() {
    if(!createjs.Ticker.paused) {
      this.entity.x -= Math.sin(this.origin.rotation * (Math.PI / -180)) * this.properties.speed;
      this.entity.y -= Math.cos(this.origin.rotation * (Math.PI / -180)) * this.properties.speed;
    }
  }
};

export default Bullet;
