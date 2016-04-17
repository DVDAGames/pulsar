import React, { Component } from 'react';

import { Gamepadder, GamepadderUtils } from 'gamepadder';

import { Buttonmancer, ButtonmancerUtils } from 'buttonmancer';

import ActionMap from '../../config/actionmap';

import ActionList from '../../config/actionlist';

import Player from '../../entities/Player/Player';

import Enemy from '../../entities/Enemy/Enemy';

const preload = [
  {
    src: "/assets/player_form_absorb.png",
    id: "player_absorb"
  },
  {
    src: "/assets/player_form_shield.png",
    id: "player_shield"
  },
  {
    src: "/assets/player_bullet.png",
    id: 'player_bullet'
  },
  {
    src: "/assets/enemy_standard.png",
    id: 'enemy_standard'
  },
  {
    src: "/assets/enemy_bullet.png",
    id: 'enemy_bullet'
  }
];

const createjs = window.createjs;

let assets = [];
let bullets = [];
let enemies = [];

let stage;
let player;

class PlayScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      gameStarted: false,
      gameOver: false,
      gamePaused: false,
      playerPoints: 0,
      playerHealth: 0,
      playerBullets: 0,
      playerShields: 0,
      playerBursts: 0,
      playerEnergy: 0,
      numberOfPlayers: 1,
      controllers: [],
      playUsing: 'gamepad',
      controlsChosen: false,
      currentPower: ActionList[5]
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
      assets.push(queue.getResult('player_absorb'));
      assets.push(queue.getResult('player_shield'));
      assets.push(queue.getResult('player_bullet'));
      assets.push(queue.getResult('enemy_standard'));
      assets.push(queue.getResult('enemy_bullet'));

      this.renderGame();
    };

    queue.on('complete', loaded, this);

    queue.loadManifest(preload);
  }

  renderGame() {
    stage = new createjs.Stage('game');

    const playerBitmaps = [
      assets[0],
      assets[2]
    ];

    const coords = {
      x: 640 / 2 - 32 / 2,
      y: 480 / 2 - 32 / 2
    };

    const properties = {
      bullet: assets[2]
    };

    player = new Player(playerBitmaps, coords, stage, this.state.currentPower, properties);

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
      'standard'
    ];

    const typeRoll = Math.floor(Math.random() * ((types.length - 1) - 0 + 1)) + 0;

    const type = types[typeRoll];

    const position = {
      x: 120,
      y: 10
    };

    const bullets = {
      standard: assets[4]
    }

    const properties = {
      bullet: bullets[type],
      type: type
    };

    const enemy = new Enemy(assets[3], position, stage, player.entity, properties);

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
                //SHIELD
                //BULLET
                //BURST
                case ActionList[5]:
                case ActionList[4]:
                case ActionList[6]:
                case ActionList[7]:
                  if(!createjs.Ticker.paused) {
                    player.changeForms(actionName);

                    this.state.currentPower = actionName;

                    this.setState({ currentPower: this.state.currentPower });
                  }

                  break;

                //USE_POWER
                case ActionList[8]:
                  if(!createjs.Ticker.paused) {
                    bullets = player.use(bullets);
                  }

                  break;

                //PAUSE
                case ActionList[9]:
                  createjs.Ticker.paused = !createjs.Ticker.paused;

                  this.state.gamePaused = !this.state.gamePaused;

                  this.setState({
                    gamePaused: this.state.gamePaused
                  });
                default:
                  break;
              }
            }
          }
        }
      }
    });

    if(!enemies.length) {
      this.spawnEnemy();
    } else {
      enemies.forEach((enemy) => {
        enemy.move(player.entity, delta);
        enemy.fireShot(bullets);
      });
    }

    bullets.forEach((bullet) => {
      bullet.shoot(delta);
    });
  }

  render() {
    return (
      <div className="game-screen game-screen--play-screen">

        {(createjs.Ticker.paused) ? <h3 class="game-screen-message game-screen-message--paused">PAUSED</h3> : ''}

      </div>
    );
  }
};

export default PlayScreen;
