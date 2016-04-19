import React, { Component } from 'react';

class Stats extends Component {
  constructor(props) {
    super(props);

    this.props = props;
  }

  render() {
    return (
      <div className="game-hud-stats">
        <div className="game-hud-stats-bars">
          <div className="game-hud-stats-bar game-hud-stats-bar--health"><div className="game-hud-stats-bar-fill" data-val={this.props.health} data-max={this.props.maxHealth} style={{width: `${(this.props.health / this.props.maxHealth * 100)}%`}}></div></div>
          <div className="game-hud-stats-bar game-hud-stats-bar--energy"><div className="game-hud-stats-bar-fill" data-val={this.props.energy} data-max={this.props.maxEnergy} style={{width: `${(this.props.energy / this.props.maxEnergy * 100)}%`}}></div></div>
        </div>
        <div className="game-hud-stats-score">{this.props.points}</div>
        <div className="game-hud-stats-numbers">
          <p><strong>Bullets</strong>: {this.props.bullets} / {this.props.maxBullets}</p>
          <p><strong>Lives</strong>: {this.props.lives + 1}</p>
        </div>
      </div>
    )
  }
};

export default Stats;
