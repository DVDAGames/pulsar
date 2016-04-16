import React, { Component } from 'react';

import { Gamepadder, GamepadderUtils } from 'gamepadder';

import { Buttonmancer, ButtonmancerUtils } from 'buttonmancer';

import ActionMap from '../../config/actionmap';

import ActionList from '../../config/actionlist';

const preload = [
  {
    src: "/assets/player.png",
    id: "player"
  }
];

const createjs = window.createjs;

let assets = [];

let stage;
let player;

class PlayScreen extends Component {
  constructor(props) {
    super(props);

    this.numberOfPlayers = 1;

    this.state = {
      gameStarted: false,
      gameOver: false,
      playerPoints: 0,
      playerHealth: 0,
      playerBullets: 0,
      playerShields: 0,
      playerBursts: 0,
      playerEnergy: 0,
      numberOfPlayers: 1,
      controllers: [],
      playUsing: 'gamepad'
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
      assets.push(queue.getResult('player'));

      this.renderGame();
    };

    queue.on('complete', loaded, this);

    queue.loadManifest(preload);
  }

  renderGame() {
    stage = new createjs.Stage('game');

    player = new createjs.Bitmap(assets[0]);

    player.setBounds((640 / 2 - 32 / 2), (480 / 2 - 32 / 2), 32, 32);

    player.x = 640 / 2 - 32 / 2;
    player.y = 480 / 2 - 32 / 2;

    stage.addChild(player);

    stage.update();

    createjs.Ticker.setFPS(60);
    createjs.Ticker.useRAF = true;
    createjs.Ticker.addEventListener('tick', stage);
    createjs.Ticker.addEventListener('tick', this.tick.bind(this));
  }

  pollGamepads() {
    const gamepads = GamepadderUtils.getGamepads();

    if(gamepads.length) {
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
        controllers: this.state.controllers
      });
    }
  }

  addListeners() {
    this.controllerConnectedEvent = window.addEventListener('gamepadconnected', (e) => {
      console.log('gamepad connected');

      const controller = new Gamepadder(e.gamepad);

      const buttonMap = new Buttonmancer(ButtonmancerUtils.convertButtonIndexesToButtonNames(ActionMap[this.state.playUsing], controller.options.buttonMap));

      if(!this.state.controllers[controller.id]) {
        this.state.controllers[controller.id] = {
          controller,
          buttonMap
        };

        this.setState({
          controllers: this.state.controllers
        });
      }

      this.controllerDisconnectedEvent = window.addEventListener('gamepaddisconnected', (e) => {
        console.log('gamepad disconnected');
        this.state.controllers.splice(e.gamepad.id, 1);

        this.setState({
          controllers: this.state.controllers
        });
      });
    });

    this.keyboardStartEvent = document.addEventListener('keydown', this.keyboardStartFunction.bind(this));
  }

  keyboardStartFunction(e) {
    clearInterval(this.checkForGamePadsInterval);

    console.log('using keyboard instead of gamepad');

    this.state.playUsing = 'keyboard';

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
      controllers: this.state.controllers
    });

    document.removeEventListener('keydown', this.keyboardStartFunction);
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

              const movementDelata = delta * 100;

              switch(actionName) {
                case ActionList[0]:
                  player.y -= movementDelata;
                  break;
                case ActionList[1]:
                  player.y += movementDelata;
                  break;
                case ActionList[2]:
                  player.x -= movementDelata;
                  break;
                case ActionList[3]:
                  player.x += movementDelata;
                  break;
                default:
                  break;
              }
            }
          }
        }
      }
    });
  }

  render() {
    return (
      <div className="game-screen game-screen--play-screen">
      </div>
    );
  }
};

export default PlayScreen;
