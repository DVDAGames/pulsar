import React, { Component } from 'react';

class TitleScreen extends Component {
  constructor(props) {
    super(props);

    this.props = props;
  }

  render() {
    return (
      <div className="game-screen game-screen--title-screen">
        <h1>pulsar</h1>
        <h2>by Dead Villager Dead Adventurer Games</h2>
        <p className="game-msg game-msg--throb">Press any key or hit a button your gamepad to start</p>
      </div>
    );
  }
};

export default TitleScreen;
