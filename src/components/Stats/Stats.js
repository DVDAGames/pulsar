import React, { Component } from 'react';

class Stats extends Component {
  constructor(props) {
    super(props);

    this.props = props;
  }

  render() {
    return (
      <div className="game-hud-stats">
        <p><strong>Health</strong>: {this.props.health} / {this.props.maxHealth}</p>
        <p><strong>Energy</strong>: {this.props.energy} / {this.props.maxEnergy}</p>
        <p><strong>Bullets</strong>: {this.props.bullets} / {this.props.maxBullets}</p>
        <p><strong>Points</strong>: {this.props.points}</p>
        <p><strong>Lives</strong>: {this.props.lives}</p>
      </div>
    )
  }
};

export default Stats;
