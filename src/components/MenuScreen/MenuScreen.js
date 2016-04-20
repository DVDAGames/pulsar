import React, { Component } from 'react';

import { Link } from 'react-router';

import { Gamepadder, GamepadderUtils } from 'gamepadder';

import { Buttonmancer, ButtonmancerUtils } from 'buttonmancer';

import ActionMap from '../../config/actionmap';

import ActionList from '../../config/actionlist';

let pulsarControls = window.pulsarControls;

class MenuScreen extends Component {
  constructor(props, context) {
    super(props, context);

    this.tick = this.tick.bind(this);

    this.checkForControllerInteractions = null;

    this.state = {
      controlsChosen: pulsarControls.controlsChosen,
      controllers: pulsarControls.controllers,
      playUsing: pulsarControls.playUsing,
      numberOfPlayers: pulsarControls.numberOfPlayers,
      menuItems: [
        {
          key: 'playGame',
          display: 'Play Game',
          link: '/game/play'
        },
        {
          key: 'howToPlay',
          display: 'How To Play',
          link: '/game/help'
        },
        {
          key: 'exit',
          display: 'Exit',
          link: '/game/exit'
        }
      ],
      selectedMenuItem: 'playGame'
    };

    this.props = props;
  }

  componentDidMount() {
    this.refs.menu.refs.selectedItem.children[0].focus();

    const fps = 10;

    this.checkForControllerInteractions = setInterval(() => {
      requestAnimationFrame(this.tick);
    }, 1000 / fps);
  }

  componentDidUpdate() {
    this.refs.menu.refs.selectedItem.children[0].focus();
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
                //MOVE_UP
                //MOVE_LEFT
                case ActionList[0]:
                case ActionList[2]:
                  this.state.menuItems.some((item, index) => {
                    const { key } = item;

                    if(key === this.state.selectedMenuItem) {
                      currentIndex = index;

                      return true;
                    }
                  });

                  newIndex = currentIndex - 1;

                  if(newIndex < 0) {
                    newIndex = this.state.menuItems.length - 1;
                  }

                  this.state.selectedMenuItem = this.state.menuItems[newIndex].key;

                  this.setState({
                    selectedMenuItem: this.state.selectedMenuItem
                  });

                  break;

                //MOVE_DOWN
                //MOVE_RIGHT
                case ActionList[1]:
                case ActionList[3]:
                  this.state.menuItems.some((item, index) => {
                    const { key } = item;

                    if(key === this.state.selectedMenuItem) {
                      currentIndex = index;

                      return true;
                    }
                  });

                  newIndex = currentIndex + 1;

                  if(newIndex > this.state.menuItems.length - 1) {
                    newIndex = 0;
                  }

                  this.state.selectedMenuItem = this.state.menuItems[newIndex].key;

                  this.setState({
                    selectedMenuItem: this.state.selectedMenuItem
                  });

                  break;

                //USE_POWER
                //PAUSE
                //MENU_SELECT
                case ActionList[6]:
                case ActionList[7]:
                case ActionList[8]:
                  clearInterval(this.checkForControllerInteractions);

                  this.refs.menu.refs.selectedItem.children[0].click();

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
      <div className="game-screen game-screen--menu-screen">
        <nav>
          <Menu ref="menu" items={this.state.menuItems} selectedItem={this.state.selectedMenuItem} />
        </nav>
      </div>
    );
  }
};

MenuScreen.contextTypes = {
    router: React.PropTypes.object.isRequired
};

class Menu extends Component {
  constructor(props) {
    super(props);

    this.props = props;
  }

  render() {
    const menu = this.props.items.map((item) => {
      const { key, display, link } = item;

      let ref = `${key}Item`;

      if(key === this.props.selectedItem) {
        ref = 'selectedItem';
      }

      return (
        <li key={key} ref={ref}>
          <Link to={link}>{display}</Link>
        </li>
      );
    });
    return (
      <ul>
        { menu }
      </ul>
    )
  }
};

export default MenuScreen;
