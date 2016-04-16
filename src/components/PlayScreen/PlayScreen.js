import React, { Component } from 'react';

class PlayScreen extends Component {
  constructor(props) {
    super(props);

    this.props = props;

    this.state = {
      gameStarted: false,
      gameOver: false,
      points: 0,
      health: 0,
      bullets: 0,
      shields: 0,
      bursts: 0,
      energy: 0
    };
  }

  render() {
    return (
      <div className="game-screen game-screen--play-screen">
        <p>game goes in canvas here</p>
        <canvas id="game"></canvas>
      </div>
    );
  }
};

export default PlayScreen;
