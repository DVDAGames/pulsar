import React, { Component } from 'react';

import { Link } from 'react-router';

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
            <li>
              <Link to="/game/play">Play Game</Link>
            </li>
            <li>
              <Link to="/game/settings">Settings</Link>
            </li>
            <li>
              <a href="/game/exit">Exit</a>
            </li>
          </ul>
        </nav>
      </div>
    );
  }
};

export default MenuScreen;
