import React, { Component } from 'react';

class SettingsScreen extends Component {
  constructor(props) {
    super(props);

    this.props = props;
  }

  render() {
    return (
      <div className="game-screen game-screen--settings-screen">
        <h2>Settings</h2>
        <p>This isn't currently implemented</p>
      </div>
    );
  }
};

export default SettingsScreen;
