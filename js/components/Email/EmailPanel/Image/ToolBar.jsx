import React, {Component} from 'react';
import FontIcon from 'material-ui/FontIcon';
import {grey400, grey800, blue200, blue400} from 'material-ui/styles/colors';
import Slider from 'rc-slider';

import alertify from 'alertifyjs';
import 'rc-slider/assets/index.css';

class ToolBar extends Component {
  constructor(props) {
    super(props);
    this.state = {sliderValue: parseInt(props.size.slice(0, -1), 10) || 1};
  }

  render() {
    const props = this.props;
    const state = this.state;
    const setLink = _ => {
      alertify.prompt(
      '',
      'Enter a URL',
      'http://',
      (e, url) => props.onImageLinkChange(url),
      _ => {}
      );
    };
    const unsetLink = _ => props.onImageLinkChange('#');
    return (
      <div className='vertical-center' style={styles.container}>
        {props.diableToolbar ?
          <span className='smalltext' style={styles.disabledText}>Image Toolbar disabled at Preview.</span> :
          <div className='vertical-center'>
            <span style={styles.sliderText}>{`${state.sliderValue}%`}</span>
            <Slider
            min={0} max={100} step={1}
            style={styles.slider}
            onChange={sliderValue => this.setState({sliderValue})}
            onAfterChange={_ => props.onSizeChange(state.sliderValue)}
            value={state.sliderValue}
            />
            <FontIcon
            color={props.imageLink.length > 1 ? blue400 : grey800}
            hoverColor={props.imageLink.length > 1 ? blue200 : grey400}
            onClick={props.imageLink.length > 1 ? unsetLink : setLink}
            style={Object.assign({}, styles.icon, {marginLeft: 10})}
            className='fa fa-link span-button pointer'
            />
            <FontIcon
            color={props.align === 'left' ? blue400 : grey800}
            hoverColor={props.align === 'left' ? blue200 : grey400}
            onClick={_ => props.onImageAlignChange('left')}
            style={styles.icon}
            className='fa fa-align-left span-button pointer'
            />
            <FontIcon
            color={props.align === 'center' ? blue400 : grey800}
            hoverColor={props.align === 'center' ? blue200 : grey400}
            onClick={_ => props.onImageAlignChange('center')}
            style={styles.icon}
            className='fa fa-align-center span-button pointer'
            />
            <FontIcon
            color={props.align === 'right' ? blue400 : grey800}
            hoverColor={props.align === 'right' ? blue200 : grey400}
            onClick={_ => props.onImageAlignChange('right')}
            style={styles.icon}
            className='fa fa-align-right span-button pointer'
            />
          {/*
            <span
            style={{
              userSelect: 'none',
              fontSize: '0.6em',
              cursor: 'pointer',
              color: props.wrap ? 'red' : 'black'
            }}
            onClick={_ => props.onToggleImageWrap(!props.wrap)}
            >wrap</span>
          */}
        </div>}
      </div>
      );
  }
}

const styles = {
  container: {
    backgroundColor: '#ffffff',
    position: 'absolute',
    marginLeft: 0,
    marginTop: 0,
    padding: '2px 3px',
    border: `solid 1px ${grey400}`,
    borderRadius: 5,
    zIndex: 500,
    width: 230
  },
  icon: {fontSize: '14px', margin: '0 4px'},
  slider: {width: 70, margin: '0 5px'},
  disabledText: {color: grey800},
  sliderText: {width: 30, whiteSpace: 'nowrap', fontSize: '0.7em'}
};

export default ToolBar;
