import React, { Component } from 'react';

import ActionList from '../../config/actionlist';

import Cooldown from '../Cooldown/Cooldown';

import Stats from '../Stats/Stats';

class HUD extends Component {
  constructor(props) {
    super(props);

    this.props = props;
  }

  render() {
    let powers;

    const cooldowns = Object.keys(this.props.cooldowns).map((power, index) => {
      const powerName = power;
      const { delay, transformDelay, delayActive, transformDelayActive } = this.props.cooldowns[power];

      let max;
      let uses;

      if(powerName === ActionList[4]) {
        max = this.props.playerMaxShields;
        uses = this.props.playerShields;
      } else if(powerName === ActionList[7]) {
        max = this.props.playerMaxBursts;
        uses = this.props.playerBursts;
      }

      const data = {
        powerName,
        delay,
        transformDelay,
        delayActive,
        transformDelayActive,
      };

      if(max && typeof uses !== 'undefined') {
        data.max = max;
        data.uses = uses;
      }

      return (
        <li key={`cooldown-${index}`} className={(this.props.currentPower === powerName) ? 'game-hud-cooldown-power game-hud-cooldown-power--active' : 'game-hud-cooldown-power'}>
          <Cooldown {...data} />
        </li>
      );
    });

    return (
      <div className="game-hud">
        <ul className="game-hud-list game-hud-list--cooldowns">
          { cooldowns }
        </ul>
        <Stats health={this.props.playerHealth} maxHealth={this.props.playerMaxHealth} energy={this.props.playerEnergy} maxEnergy={this.props.playerMaxEnergy} />
      </div>
    );
  }
};

export default HUD;
