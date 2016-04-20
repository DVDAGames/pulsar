import React, { Component } from 'react';

class BackButton extends Component {
  constructor(props, context) {
    super(props, context);

    this.props = props;
  }

  render() {
    return (
      <a href="#" ref="backButton" className="game-back-button" onClick={this.context.router.goBack}>Back</a>
    );
  }
}

BackButton.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default BackButton;
