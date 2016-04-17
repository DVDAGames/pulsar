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
  }
];

const createjs = window.createjs;

let assets = {};
let bullets = [];
let enemies = [];
let stars = [];

let stage;
let player;

const maxStars = 60;
const minStars = 15;

class PlayScreen extends Component {
  constructor(props) {
    super(props);

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
      playerMaxBullets: 250,
      numberOfPlayers: 1,
      numberOfLives: 3,
      maxNumberOfEnemies: 20,
      lastEnemySpawnPosition: null,
      controllers: [],
      playUsing: 'gamepad',
      controlsChosen: false,
      currentPower: ActionList[4],
      cooldowns: {
        [ActionList[4]]: {},
        [ActionList[5]]: {}
      }
    };
  }

  componentDidMount() {
    if (!('ongamepadconnected' in window) || GamepadderUtils.getGamepads().length !== this.state.numberOfPlayers) {
      //No gamepad events available, poll instead.
      this.checkForGamePadsInterval = setInterval(this.pollGamepads.bind(this), 300);
    }

    this.addListeners();

    const queue = new createjs.LoadQueue(false);

    const loaded = () => {
      assets.player = queue.getResult('player');
      assets.player_bullet = queue.getResult('player_bullet');
      assets.enemy = queue.getResult('enemy_standard');
      assets.enemy_bullet = queue.getResult('enemy_bullet');
      assets.star_small = queue.getResult('star_small');
      assets.star_big = queue.getResult('star_big');

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
      x: 640 / 2 - 32 / 2,
      y: 480 / 2 - 32 / 2
    };

    const properties = {
      bullet: assets.player_bullet,
      health: this.state.playerHealth,
      energy: this.state.playerEnergy,
      bullets: this.state.playerBullets,
      maxBullets: this.state.playerMaxBullets,
      maxHealth: this.state.playerMaxHealth,
      maxEnergy: this.state.playerMaxEnergy
    };

    player = new Player(assets.player, coords, stage, this.state.currentPower, properties);

    Object.keys(this.state.cooldowns).forEach((power) => {
      const { delay, transformDelay } = player.getCooldowns(power);
      const delayActive = false;
      const transformDelayActive = false;

      this.state.cooldowns[this.state.currentPower] = {
        delayActive,
        transformDelayActive,
        delay,
        transformDelay
      };
    });

    this.setState({
      cooldowns: this.state.cooldowns
    });

    stage.update();

    createjs.Ticker.setFPS(60);
    createjs.Ticker.useRAF = true;
    createjs.Ticker.addEventListener('tick', stage);
    createjs.Ticker.addEventListener('tick', this.tick.bind(this));
  }

  pollGamepads() {
    const gamepads = GamepadderUtils.getGamepads();

    if(gamepads.length && gamepads[0]) {
      this.state.controlsChosen = true;
      this.state.playUsing = 'gamepad';

      gamepads.forEach((pad, index) => {
        const controller = new Gamepadder(pad);
        const buttonMap = new Buttonmancer(ActionMap[this.state.playUsing]);

        if(!this.state.controllers[index]) {
          this.state.controllers[index] = {
            controller,
            buttonMap
          };
        }
      });

      if(gamepads.length === this.state.numberOfPlayers) {
        clearInterval(this.checkForGamePadsInterval);
      }

      this.setState({
        controllers: this.state.controllers,
        playUsing: this.state.playUsing,
        controlsChosen: this.state.controlsChosen
      });
    }
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

      if(this.state.controlsChosen && this.state.playUsing === 'keyboard') {
        this.state.controllers[0].controller.keyPresses[keyPressed.key] = true;
      } else if(!this.state.controlsChosen) {
        clearInterval(this.checkForGamePadsInterval);

        console.log('using keyboard instead of gamepad');

        this.state.playUsing = 'keyboard';
        this.state.controlsChosen = true;

        const actions = ActionMap[this.state.playUsing];

        this.state.controllers[0] = {
          controller: {
            id: 0,
            name: 'Keyboard',
            keyPresses: {}
          },
          buttonMap: new Buttonmancer(actions)
        };

        this.setState({
          playUsing: this.state.playUsing,
          controllers: this.state.controllers,
          controlsChosen: this.state.controlsChosen
        });
      }
    });

    document.addEventListener('keyup', (e) => {
      e.preventDefault();

      let keyPressed = ButtonmancerUtils.getKey(e).key;

      if(keyPressed.key === ActionMap.PAUSE) {
        createjs.Ticker.paused = !createjs.Ticker.paused;

        this.state.gamePaused = !this.state.gamePaused;

        this.setState({
          gamePaused: this.state.gamePaused
        });
      } else {
        if(this.state.controlsChosen && this.state.playUsing === 'keyboard') {
          this.state.controllers[0].controller.keyPresses[keyPressed.key] = false;
        }
      }
    });
  }

  spawnEnemy() {
    const types = [
      'enemy'
    ];

    const typeRoll = Math.floor(Math.random() * ((types.length - 1) - 0 + 1)) + 0;

    const type = types[typeRoll];

    const positions = [
      {
        x: 120,
        y: 10
      },
      {
        x: 250,
        y: 690
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
        y: -40
      },
      {
        x: -40,
        y: 220
      },
      {
        x: 840,
        y: 340
      }
    ];

    let position = positions[Math.floor(Math.random() * ((positions.length - 1) - 0 + 1)) + 0];

    while(position === this.state.lastEnemySpawnPosition) {
      position = positions[Math.floor(Math.random() * ((positions.length - 1) - 0 + 1)) + 0];
    }

    const bulletTypes = {
      enemy: assets.enemy_bullet
    }

    const properties = {
      bullet: bulletTypes[type],
      type: type
    };

    const enemy = new Enemy(assets.enemy, position, stage, player.entity, properties);

    enemies.push(enemy);
  }

  tick(event) {
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
                  if(!createjs.Ticker.paused && !this.state.cooldowns[this.state.currentPower].transformDelayActive) {
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
                  if(!createjs.Ticker.paused && !this.state.cooldowns[this.state.currentPower].delayActive) {
                    const { delay, transformDelay } = player.getCooldowns(this.state.currentPower);
                    const delayActive = true;
                    const transformDelayActive = true;

                    this.state.cooldowns[this.state.currentPower] = {
                      delayActive,
                      transformDelayActive,
                      delay,
                      transformDelay
                    };

                    const playerValues = player.use(bullets);

                    bullets = playerValues.bullets;

                    this.setState({
                      playerEnergy: playerValues.playerEnergy,
                      playerBullets: playerValues.playerBullets
                    });
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

    for(const power in this.state.cooldowns) {
      if(this.state.cooldowns.hasOwnProperty(power)) {
        if(this.state.cooldowns[power].delay > 0 && this.state.cooldowns[power].delayActive) {
          this.state.cooldowns[power].delay--;
        } else {
          this.state.cooldowns[power].delay = player.properties.formList[power].defaultDelay;
          this.state.cooldowns[power].delayActive = false;
        }

        if(this.state.cooldowns[power].transformDelay > 0 && this.state.cooldowns[power].transformDelayActive) {
          this.state.cooldowns[power].transformDelay--;
        } else {
          this.state.cooldowns[power].transformDelay = player.properties.formList[power].defaultTransformDelay;
          this.state.cooldowns[power].transformDelayActive = false;
        }
      }
    }

    if(enemies.length < this.state.maxNumberOfEnemies) {
      const rng = Math.floor(Math.random() * (100 - 1 + 1)) + 1;

      if(rng > 70) {
        this.spawnEnemy();
      }
    } else {
      enemies.forEach((enemy, index, array) => {
        if(enemy.properties.destroyed) {
          array.splice(index, 1);
        } else {
          enemy.move(player.entity, delta, [player, ...enemies]);

          if(enemy.properties.delay > 0 && enemy.properties.fired) {
            enemy.properties.delay--;
          } else {
            enemy.properties.delay = enemy.properties.defaultDelay;
            enemy.properties.fired = false;

            enemy.fireShot(bullets);
          }
        }
      });
    }

    bullets.forEach((bullet, index, array) => {
      const shoot = bullet.shoot(delta, [player, ...enemies]);

      if(shoot) {
        array.splice(index, 1);
      }
    });

    stars.forEach((star) => {
      star.drift(delta);
    });

    player.exist(delta);

    this.setState({
      playerHealth: player.properties.health,
      playerEnergy: player.properties.energy,
      playerBullets: player.properties.bullets,
      cooldowns: this.state.cooldowns,
      gamePaused: this.state.gamePaused
    });
  }

  render() {
    return (
      <div className="game-screen game-screen--play-screen">

        {(createjs.Ticker.paused) ? <h3 class="game-screen-message game-screen-message--paused">PAUSED</h3> : ''}

        <HUD {...this.state} />
      </div>
    );
  }
};

export default PlayScreen;
