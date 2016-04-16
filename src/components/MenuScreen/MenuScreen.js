import React, { Component } from 'react';

class MenuScreen extends Component {
  constructor(props) {
    super(props);

    this.props = props;
  }

  render() {
    return (
      <div className="game-screen game-screen--menu-screen">
        <nav>
          <ul>
            <li>Play Game</li>
            <li>Settings</li>
            <li>Exit</li>
          </ul>
        </nav>
      </div>
    );
  }
};

export default MenuScreen;
