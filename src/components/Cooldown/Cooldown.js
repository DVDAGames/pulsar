import React, { Component } from 'react';

class Cooldown extends Component {
  constructor(props) {
    super(props);

    this.props = props;
  }

  render() {
    const displayDelay = this.props.delay / 60;
    const displayTransformDelay = this.props.transformDelay / 60;

    return (
      <div className="game-hud-cooldown">
        <p><strong>{ this.props.powerName }</strong>:</p>
        <ul>
          <li>{displayDelay}s</li>
          <li>{displayTransformDelay}s</li>
        </ul>
      </div>
    )
  }
};

export default Cooldown;
