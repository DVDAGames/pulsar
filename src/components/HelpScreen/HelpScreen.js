import React, { Component } from 'react';

import { Link } from 'react-router';

import BackButton from '../BackButton/BackButton';

import ActionList from '../../config/actionlist';

let pulsarControls = window.pulsarControls;

class HelpScreen extends Component {
  constructor(props, context) {
    super(props, context);

    this.props = props;
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
        <BackButton />
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
