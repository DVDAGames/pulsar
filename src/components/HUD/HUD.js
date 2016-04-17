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

      const data = {
        powerName,
        delay,
        transformDelay,
        delayActive,
        transformDelayActive,
      };

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
        <Stats bullets={this.props.playerBullets} maxBullets={this.props.playerMaxBullets} health={this.props.playerHealth} maxHealth={this.props.playerMaxHealth} energy={this.props.playerEnergy} maxEnergy={this.props.playerMaxEnergy} />
      </div>
    );
  }
};

export default HUD;
