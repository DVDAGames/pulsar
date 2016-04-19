import React, { Component } from 'react';

import { Link } from 'react-router';

let pulsarControls = window.pulsarControls;

class MenuScreen extends Component {
  constructor(props, context) {
    super(props, context);

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
              <Link to="/game/help">How To Play</Link>
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

MenuScreen.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default MenuScreen;
