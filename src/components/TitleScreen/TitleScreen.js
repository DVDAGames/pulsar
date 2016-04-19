import React, { Component } from 'react';

import { Gamepadder, GamepadderUtils } from 'gamepadder';

import { Buttonmancer, ButtonmancerUtils } from 'buttonmancer';

import ActionMap from '../../config/actionmap';

import ActionList from '../../config/actionlist';

let pulsarControls = window.pulsarControls;

class TitleScreen extends Component {
  constructor(props, context) {
    super(props, context);

    this.props = props;

    this.goToMenu = this.goToMenu.bind(this);

    pulsarControls.controllers = [];
    pulsarControls.controlsChosen = false;
    pulsarControls.playUsing = 'gamepad';``
  }

  componentDidMount() {
    if (!('ongamepadconnected' in window) || GamepadderUtils.getGamepads().length !== pulsarControls.numberOfPlayers) {
      //No gamepad events available, poll instead.
      this.checkForGamePadsInterval = setInterval(this.pollGamepads.bind(this), 300);
    }

    this.addListeners();
  }

  pollGamepads() {
    const gamepads = GamepadderUtils.getGamepads();

    if(gamepads.length && gamepads[0]) {
      pulsarControls.controlsChosen = true;
      pulsarControls.playUsing = 'gamepad';

      gamepads.forEach((pad, index) => {
        const controller = new Gamepadder(pad);
        const buttonMap = new Buttonmancer(ActionMap[pulsarControls.playUsing]);

        if(!pulsarControls.controllers[index]) {
          pulsarControls.controllers[index] = {
            controller,
            buttonMap
          };
        }
      });

      if(gamepads.length === pulsarControls.numberOfPlayers) {
        clearInterval(this.checkForGamePadsInterval);
      }

      this.goToMenu();
    }
  }

  goToMenu() {
    this.context.router.replace('/game/menu', pulsarControls);
  }

  addListeners() {
    this.controllerConnectedEvent = window.addEventListener('gamepadconnected', (e) => {
      if(!pulsarControls.controlsChosen) {
        pulsarControls.controlsChosen = true;
        pulsarControls.playUsing = 'gamepad';
      }

      if(pulsarControls.playUsing === 'gamepad' && pulsarControls.controllers.length < pulsarControls.numberOfPlayers) {
        console.log('gamepad connected');

        const controller = new Gamepadder(e.gamepad);

        const buttonMap = new Buttonmancer(ButtonmancerUtils.convertButtonIndexesToButtonNames(ActionMap[pulsarControls.playUsing], controller.options.buttonMap));

        if(!pulsarControls.controllers[controller.id]) {
          pulsarControls.controllers[controller.id] = {
            controller,
            buttonMap
          };

          this.goToMenu();
        }

        this.controllerDisconnectedEvent = window.addEventListener('gamepaddisconnected', (e) => {
          console.log('gamepad disconnected');
          pulsarControls.controllers.splice(e.gamepad.id, 1);
        });
      }
    });

    document.addEventListener('keydown', (e) => {
      e.preventDefault();

      if(!pulsarControls.controlsChosen) {
        let keyPressed = ButtonmancerUtils.getKey(e).key;

        clearInterval(this.checkForGamePadsInterval);

        console.log('using keyboard instead of gamepad');

        pulsarControls.playUsing = 'keyboard';
        pulsarControls.controlsChosen = true;

        const actions = ActionMap[pulsarControls.playUsing];

        pulsarControls.controllers[0] = {
          controller: {
            id: 0,
            name: 'Keyboard',
            keyPresses: {}
          },
          buttonMap: new Buttonmancer(actions)
        };

        this.goToMenu();
      }
    });
  }

  render() {
    return (
      <div className="game-screen game-screen--title-screen">
        <h1>pulsar</h1>
        <h2>by Dead Villager Dead Adventurer Games</h2>
        <p className="game-msg game-msg--throb">hit a button your gamepad or keyboard to start</p>
      </div>
    );
  }
};

TitleScreen.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default TitleScreen;
