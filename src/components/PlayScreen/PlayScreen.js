import React, { Component } from 'react';

import { Gamepadder, GamepadderUtils } from 'gamepadder';

import { Buttonmancer, ButtonmancerUtils } from 'buttonmancer';

import HUD from '../HUD/HUD';

import ActionMap from '../../config/actionmap';

import ActionList from '../../config/actionlist';

import Player from '../../entities/Player/Player';

import Enemy from '../../entities/Enemy/Enemy';

import Star from '../../entities/Star/Star';

const preload = [
  {
    src: '/assets/player.png',
    id: 'player'
  },
  {
    src: '/assets/player_bullet.png',
    id: 'player_bullet'
  },
  {
    src: '/assets/enemy_standard.png',
    id: 'enemy_standard'
  },
  {
    src: '/assets/enemy_bullet.png',
    id: 'enemy_bullet'
  },
  {
    src: '/assets/star_small.png',
    id: 'star_small'
  },
  {
    src: '/assets/star_big.png',
    id: 'star_big'
  },
  {
    src: '/assets/game_over.wav',
    id: 'sound/game_over'
  },
  {
    src: '/assets/enemy_bullet.wav',
    id: 'sound/enemy_bullet'
  },
  {
    src: '/assets/enemy_destroyed.wav',
    id: 'sound/enemy_destroyed'
  },
  {
    src: '/assets/player_absorbed.wav',
    id: 'sound/player_absorbed'
  },
  {
    src: '/assets/player_bullet.wav',
    id: 'sound/player_bullet'
  },
  {
    src: '/assets/player_destroyed.wav',
    id: 'sound/player_destroyed'
  },
  {
    src: '/assets/player_generated_bullets.wav',
    id: 'sound/player_generated_bullets'
  },
  {
    src: '/assets/player_hit.wav',
    id: 'sound/player_hit'
  },
  {
    src: '/assets/player_transform.wav',
    id: 'sound/player_transform'
  }
];

const AITypes = [
  {
    personality: 'chaser',
    delay: 40,
    defaultDelay: 40,
    pts: 50,
    dmg: 50
  },
  {
    personality: 'arc',
    delay: 35,
    defaultDelay: 35,
    pts: 75,
    dmg: 15
  },
  {
    personality: 'sentinel',
    delay: 30,
    defaultDelay: 30,
    pts: 25,
    dmg: 25
  },
  {
    personality: 'patroller',
    delay: 30,
    defaultDelay: 30,
    pts: 25,
    dmg: 25
  }
];

const createjs = window.createjs;

const puslarControls = window.pulsarControls;

let assets = {};
let bullets = [];
let enemies = [];
let stars = [];

let stage;
let player;

const maxStars = 60;
const minStars = 15;

class PlayScreen extends Component {
  constructor(props, context) {
    super(props, context);

    this.props = props;

    this.tick = this.tick.bind(this);

    this.state = {
      gameStarted: false,
      gameOver: false,
      gamePaused: false,
      playerPoints: 0,
      playerMaxHealth: 1000,
      playerMaxEnergy: 1000,
      playerHealth: 1000,
      playerEnergy: 200,
      playerBullets: 25,
      playerMaxBullets: 100,
      numberOfPlayers: pulsarControls.numberOfPlayers,
      numberOfLives: 2,
      maxNumberOfEnemies: 25,
      lastEnemySpawnPosition: null,
      controllers: pulsarControls.controllers,
      playUsing: pulsarControls.playUsing,
      controlsChosen: pulsarControls.controlsChosen,
      currentPower: ActionList[4],
      cooldowns: {}
    };
  }

  componentDidMount() {
    this.addListeners();

    const queue = new createjs.LoadQueue(false);

    queue.installPlugin(createjs.Sound);

    const loaded = () => {
      assets.sounds = {};
      assets.player = queue.getResult('player');
      assets.player_bullet = queue.getResult('player_bullet');
      assets.enemy = queue.getResult('enemy_standard');
      assets.enemy_bullet = queue.getResult('enemy_bullet');
      assets.star_small = queue.getResult('star_small');
      assets.star_big = queue.getResult('star_big');
      assets.sounds.game_over = queue.getResult('sound/game_over');
      assets.sounds.enemy_bullet = queue.getResult('sound/enemy_bullet');
      assets.sounds.enemy_destroyed = queue.getResult('sound/enemy_destroyed');
      assets.sounds.player_absorbed = queue.getResult('sound/player_absorbed');
      assets.sounds.player_bullet = queue.getResult('sound/player_bullet');
      assets.sounds.player_destroyed = queue.getResult('sound/player_destroyed');
      assets.sounds.player_generated_bullets = queue.getResult('sound/player_generated_bullets');
      assets.sounds.player_hit = queue.getResult('sound/player_hit');
      assets.sounds.player_transform = queue.getResult('sound/player_transform');

      this.renderGame();
    };

    queue.on('complete', loaded, this);

    queue.loadManifest(preload);
  }

  renderGame() {
    stage = new createjs.Stage('game');

    const starImages = [
      {
        img: assets.star_big,
        width: 16,
        height: 16
      },
      {
        img: assets.star_small,
        width: 8,
        height: 8
      },
      {
        img: assets.star_big,
        width: 16,
        height: 16
      },
      {
        img: assets.star_small,
        width: 8,
        height: 8
      }
    ];

    const starsToGenerate = Math.floor(Math.random() * ((maxStars - 1) - minStars + 1)) + minStars;

    for(let i = 0; i < starsToGenerate; i++) {
      const x = Math.floor(Math.random() * (((stage.canvas.clientWidth + 10) - 1) - 10 + 1)) + 10;
      const y = Math.floor(Math.random() * (((stage.canvas.clientHeight + 10) - 1) - 10 + 1)) + 10;
      const size = Math.floor(Math.random() * ((starImages.length - 1) - 0 + 1)) + 0;
      const star = new Star(starImages[size].img, starImages[size].width, starImages[size].height, { x, y }, stage);

      stars.push(star);
    }

    const coords = {
      x: 960 / 2 - 32 / 2,
      y: 768 / 2 - 32 / 2
    };

    const properties = {
      lives: this.state.numberOfLives,
      bullet: assets.player_bullet,
      health: this.state.playerHealth,
      energy: this.state.playerEnergy,
      bullets: this.state.playerBullets,
      maxBullets: this.state.playerMaxBullets,
      maxHealth: this.state.playerMaxHealth,
      maxEnergy: this.state.playerMaxEnergy,
      sounds: {
        player_absobed: assets.sounds.player_absorbed,
        player_bullet: assets.sounds.player_bullet,
        player_destroyed: assets.sounds.player_destroyed,
        player_generated_bullets: assets.sounds.player_generated_bullets,
        player_hit: assets.sounds.player_hit,
        player_transform: assets.sounds.player_transform
      }
    };

    player = new Player(assets.player, coords, stage, this.state.currentPower, properties);

    Object.keys(this.state.cooldowns).forEach((power) => {
      const { delay, transformDelay } = player.getCooldowns(power);
      const delayActive = false;
      const transformDelayActive = false;

      this.state.cooldowns[power] = {
        delayActive,
        transformDelayActive,
        delay,
        transformDelay
      };
    });

    this.setState({
      cooldowns: player.cooldowns,
      gameStarted: true
    });

    stage.update();

    createjs.Ticker.setFPS(60);
    createjs.Ticker.useRAF = true;
    createjs.Ticker.addEventListener('tick', stage);
    createjs.Ticker.addEventListener('tick', this.tick);
  }

  addListeners() {
    this.controllerConnectedEvent = window.addEventListener('gamepadconnected', (e) => {
      if(!this.state.controlsChosen) {
        this.state.controlsChosen = true;
        this.state.playUsing = 'gamepad';
      }

      if(this.state.playUsing === 'gamepad' && this.state.controllers.length < this.state.numberOfPlayers) {
        console.log('gamepad connected');

        const controller = new Gamepadder(e.gamepad);

        const buttonMap = new Buttonmancer(ButtonmancerUtils.convertButtonIndexesToButtonNames(ActionMap[this.state.playUsing], controller.options.buttonMap));

        if(!this.state.controllers[controller.id]) {
          this.state.controllers[controller.id] = {
            controller,
            buttonMap
          };

          this.setState({
            controllers: this.state.controllers,
            controlsChosen: this.state.controlsChosen,
            playUsing: this.state.playUsing
          });
        }

        this.controllerDisconnectedEvent = window.addEventListener('gamepaddisconnected', (e) => {
          console.log('gamepad disconnected');
          this.state.controllers.splice(e.gamepad.id, 1);

          this.setState({
            controllers: this.state.controllers
          });
        });
      }
    });

    document.addEventListener('keydown', (e) => {
      e.preventDefault();

      let keyPressed = ButtonmancerUtils.getKey(e).key;

      if(this.state.controlsChosen && this.state.playUsing === 'keyboard' && keyPressed && keyPressed.key) {
        this.state.controllers[0].controller.keyPresses[keyPressed.key] = true;
      }
    });

    document.addEventListener('keyup', (e) => {
      e.preventDefault();

      let keyPressed = ButtonmancerUtils.getKey(e).key;

      if(keyPressed && keyPressed.key && keyPressed.key === ActionMap.PAUSE) {
        createjs.Ticker.paused = !createjs.Ticker.paused;

        this.state.gamePaused = !this.state.gamePaused;

        this.setState({
          gamePaused: this.state.gamePaused
        });
      } else {
        if(this.state.controlsChosen && this.state.playUsing === 'keyboard' && keyPressed && keyPressed.key) {
          this.state.controllers[0].controller.keyPresses[keyPressed.key] = false;
        }
      }
    });
  }

  spawnEnemy() {
    const AITypeRoll = Math.floor(Math.random() * ((AITypes.length - 1) - 0 + 1)) + 0;

    const AIType = AITypes[AITypeRoll];

    const positions = [
      {
        x: 120,
        y: 10
      },
      {
        x: 250,
        y: 590
      },
      {
        x: 720,
        y: 590
      },
      {
        x: 40,
        y: 400
      },
      {
        x: 4,
        y: 10
      },
      {
        x: 360,
        y: 20
      },
      {
        x: 20,
        y: 220
      },
      {
        x: 780,
        y: 340
      }
    ];

    let position = positions[Math.floor(Math.random() * ((positions.length - 1) - 0 + 1)) + 0];

    while(position === this.state.lastEnemySpawnPosition) {
      position = positions[Math.floor(Math.random() * ((positions.length - 1) - 0 + 1)) + 0];
    }

    const properties = {
      bullet: assets.enemy_bullet,
      AI: AIType.personality,
      type: 'enemy',
      delay: AIType.delay,
      defaultDelay: AIType.defaultDelay,
      pts: AIType.pts,
      sounds: {
        hit: assets.sounds.enemy_destroyed,
        fire: assets.sounds.enemy_bullet
      }
    };

    this.state.lastEnemySpawnPosition = position;

    this.setState({
      lastEnemySpawnPosition: this.state.lastEnemySpawnPosition
    });

    const enemy = new Enemy(assets.enemy, position, stage, player.entity, properties);

    enemies.push(enemy);
  }

  tick(event) {
    if(this.state.gameOver) {
      createjs.Ticker.removeEventListener('tick', stage);
      createjs.Ticker.removeEventListener('tick', this.tick);
    } else {
      const delta = event.delta / 1000;

      const gamepads = GamepadderUtils.getGamepads();

      this.state.controllers.forEach((inputMethod, index) => {
        let buttonPresses;
        let previousButtons;

        if(inputMethod.controller.name === 'Keyboard') {
          buttonPresses = inputMethod.controller.keyPresses;
        } else {
          const buttonPressObject = inputMethod.controller.checkForButtonPress(gamepads[index]);

          buttonPresses = buttonPressObject.buttonPresses;
          previousButtons = buttonPressObject.previousButtons
        }

        if(buttonPresses) {
          for(const pressedButton in buttonPresses) {
            if(buttonPresses.hasOwnProperty(pressedButton)) {
              if(buttonPresses[pressedButton] && inputMethod.buttonMap.map.hasOwnProperty(pressedButton)) {
                const actionName = inputMethod.buttonMap.map[pressedButton];

                const movementDelta = delta * 100;

                switch(actionName) {
                  //MOVE_UP
                  //MOVE_DOWN
                  //MOVE_LEFT
                  //MOVE_RIGHT
                  case ActionList[0]:
                  case ActionList[1]:
                  case ActionList[2]:
                  case ActionList[3]:
                    if(!createjs.Ticker.paused) {
                      player.move(actionName, movementDelta);
                    }

                    break;

                  //ABSORB
                  //BULLET
                  case ActionList[4]:
                  case ActionList[5]:
                    if(!createjs.Ticker.paused) {
                      const transformed = player.changeForms(actionName);

                      if(transformed) {
                        this.state.currentPower = actionName;

                        this.setState({
                          currentPower: this.state.currentPower
                        });
                      }
                    }

                    break;

                  //USE_POWER
                  case ActionList[6]:
                    if(!createjs.Ticker.paused) {
                      if(player.properties.formName === ActionList[5] && this.state.playerBullets < this.state.playerMaxBullets && this.state.playerEnergy > player.properties.formList[ActionList[5]].energyDrain || player.properties.formName === ActionList[4]) {
                        const playerValues = player.use(bullets);

                        bullets = playerValues.bullets;

                        this.setState({
                          cooldowns: playerValues.cooldowns,
                          playerEnergy: playerValues.playerEnergy,
                          playerBullets: playerValues.playerBullets
                        });
                      }
                    }

                    break;

                  //PAUSE
                  case ActionList[7]:
                    createjs.Ticker.paused = !createjs.Ticker.paused;

                    this.state.gamePaused = !this.state.gamePaused;

                  default:
                    break;
                }
              }
            }
          }
        }
      });

      if(!createjs.Ticker.paused) {
        if(enemies.length <= this.state.maxNumberOfEnemies) {
          const rng = Math.floor(Math.random() * (100 - 1 + 1)) + 1;

          if(rng > 75 || rng < 25) {
            this.spawnEnemy();
          }
        } else {
          const removeEnemies = [];

          enemies.forEach((enemy, index) => {
            if(enemy.properties.destroyed) {
              removeEnemies.push(enemy);
            } else {
              enemy.react(player.entity, delta, [player, ...enemies], bullets);
            }
          });

          removeEnemies.forEach((enemy) => {
            enemies.splice(enemies.indexOf(enemy), 1);
          });
        }

        bullets.forEach((bullet, index, array) => {
          const shoot = bullet.shoot(delta, [player, ...enemies], this.state.points);

          if(shoot.hitCheck.hit || shoot.offScreen) {
            array.splice(index, 1);
          }

          this.state.playerPoints = this.state.playerPoints + shoot.hitCheck.pts;
        });

        stars.forEach((star) => {
          star.drift(delta);
        });

        player.exist(delta);

        if(player.properties.lost) {
          createjs.Sound.play('sound/game_over');
        }

        this.setState({
          points: this.state.playerPoints,
          currentForm: player.properties.formName,
          gameOver: player.properties.lost,
          gameStarted: !player.properties.lost,
          playerHealth: player.properties.health,
          playerEnergy: player.properties.energy,
          playerBullets: player.properties.bullets,
          cooldowns: player.cooldowns,
          gamePaused: this.state.gamePaused,
          numberOfLives: player.properties.lives
        });
      }
    }
  }

  render() {
    return (
      <div className="game-screen game-screen--play-screen">

        {(createjs.Ticker.paused || this.state.gamePaused) ? <div className="game-screen-overlay game-screen-overlay--paused"><p>PAUSED</p></div> : ''}
        {(this.state.gameOver) ? <div className="game-screen-overlay game-screen-overlay--game-over"><p>GAME OVER</p><p>Score: {this.state.playerPoints}</p></div> : ''}

        <HUD {...this.state} />
      </div>
    );
  }
};

PlayScreen.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default PlayScreen;
