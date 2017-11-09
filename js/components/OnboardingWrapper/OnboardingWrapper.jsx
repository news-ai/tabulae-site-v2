import React, { Component } from 'react';
import Joyride from 'react-joyride';
import { connect } from 'react-redux';

import 'node_modules/react-joyride/lib/styles/react-joyride-compiled.css';

const locales = {
  back: (<span>Back</span>),
  close: (<span>Close</span>),
  last: (<span>Last</span>),
  next: (<span>Next</span>),
  skip: (<span>Skip</span>)
};

class OnboardingWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      joyrideOverlay: true,
      joyrideType: 'continuous',
      ready: false,
      steps: [],
      firstTimeUser: false
    };
    this._addSteps = this._addSteps.bind(this);
    this._addTooltip = this._addTooltip.bind(this);
  }

  componentWillMount() {
    if (this.props.firstTimeUser !== this.state.firstTimeUser) {
      setTimeout( _ => {
        this.setState({ready: true});
      }, 7000);
      this.setState({firstTimeUser: true});
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.ready && this.state.ready) {
      this.refs.joyride.start();
    }
  }

  _addSteps(steps) {
    let joyride = this.refs.joyride;

    if (!Array.isArray(steps)) {
      steps = [steps];
    }

    if (!steps.length) {
      return false;
    }

    this.setState( function(currentState) {
      currentState.steps = currentState.steps.concat(joyride.parseSteps(steps));
      return currentState;
    });
  }


  _addTooltip(data) {
    this.refs.joyride.addTooltip(data);
  }

  render() {
    const state = this.state;
    const props = this.props;
    const childrenWithProps = React.Children.map(props.children,
     child => React.cloneElement(child, Object.assign({}, props, {addSteps: this._addSteps}))
    );
    return (
      <div>
        <Joyride
        ref='joyride'
        debug={false}
        showSkipButton
        showStepsProgress
        joyrideOverlay
        scrollToSteps={false}
        steps={state.steps}
        type={state.joyrideType}
        locale={locales}
        />
        {childrenWithProps}
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    firstTimeUser: state.personReducer.firstTimeUser
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OnboardingWrapper);
