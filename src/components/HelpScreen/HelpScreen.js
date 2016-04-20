import React, { Component } from 'react';

import { Link } from 'react-router';

import BackButton from '../BackButton/BackButton';

import { Gamepadder, GamepadderUtils } from 'gamepadder';

import { Buttonmancer, ButtonmancerUtils } from 'buttonmancer';

import ActionMap from '../../config/actionmap';

import ActionList from '../../config/actionlist';

let pulsarControls = window.pulsarControls;

class HelpScreen extends Component {
  constructor(props, context) {
    super(props, context);

    this.tick = this.tick.bind(this);

    this.state = {
      controlsChosen: pulsarControls.controlsChosen,
      controllers: pulsarControls.controllers,
      playUsing: pulsarControls.playUsing,
      numberOfPlayers: pulsarControls.numberOfPlayers
    };

    this.props = props;
  }

  componentDidMount() {
    this.refs.back.refs.backButton.focus();

    this.addListeners();

    const fps = 10;

    this.checkForControllerInteractions = setInterval(() => {
      requestAnimationFrame(this.tick);
    }, 1000 / fps);
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

  tick() {
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

              let currentIndex;
              let newIndex;

              switch(actionName) {
                //USE_POWER
                //PAUSE
                //MENU_SELECT
                case ActionList[6]:
                case ActionList[7]:
                case ActionList[8]:
                  clearInterval(this.checkForControllerInteractions);

                  this.refs.back.refs.backButton.click();

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
    const actionKeys = {};
    const controllerType = pulsarControls.controllers[0].controller.name;

    for(const input in pulsarControls.controllers[0].buttonMap.map) {
      if(pulsarControls.controllers[0].buttonMap.map.hasOwnProperty(input)) {
        actionKeys[pulsarControls.controllers[0].buttonMap.map[input]] = input;
      }
    }

    return (
      <div className="game-screen game-screen--help-screen">
        <BackButton ref='back' />
        <ul>
          <li>Use {actionKeys[ActionList[0]]}, {actionKeys[ActionList[1]]}, {actionKeys[ActionList[2]]}, and {actionKeys[ActionList[3]]} to move</li>
          <li>Your ship has a limited number of bullets</li>
          <li>{actionKeys[ActionList[5]]} on your {controllerType} changes into a form that replenishes bullets by absorbing enemy bullets</li>
          <li>{actionKeys[ActionList[4]]} on your {controllerType} changes back into your ship form</li>
          <li>Staying in absorption form drains energy</li>
          <li>Staying in ship form regenerates energy</li>
          <li>In ship form {actionKeys[ActionList[6]]} on your {controllerType} fires bullets</li>
          <li>In absorption form {actionKeys[ActionList[6]]} on your {controllerType} converts some energy into some bullets</li>
        </ul>
      </div>
    );
  }
};

HelpScreen.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default HelpScreen;
