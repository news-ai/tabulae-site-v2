import React, { Component } from 'react';
import {SketchPicker} from 'react-color';
import styled from 'styled-components';
import Popover from 'material-ui/Popover';

const Color = styled.div`
  width: 24px;
  height: 12px;
  border-radius: 2px;
  background: ${props => props.color ? props.color : 'black'};
`;

const Swatch = styled.div`
  padding: 3px;
  background-color: #ffffff;
  border-radius: 1px;
  box-shadow: 0 0 0 1px rgba(0,0,0,.1);
  display: inline-block;
  cursor: pointer;
`;

const PREFIX_MATCH = 'COLOR-';
class ColorPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      anchorEl: null
    };
    this.handleTouchTap = (event) => {
      event.preventDefault();
      this.setState({
        open: true,
        anchorEl: event.currentTarget,
      });
    };
    this.handleRequestClose = e => this.setState({open: false});
    this.onChange = color => this.props.onToggle(`COLOR-${color.hex}`);
  }

  render() {
    const currentStyle = this.props.editorState.getCurrentInlineStyle();
    const color = currentStyle
    .filter(val => val.substring(0, PREFIX_MATCH.length) === PREFIX_MATCH)
    .reduce((acc, col) => {
      if (col) acc = col;
      return acc;
    }, 'black');
    return (
      <div className='RichEditor-controls' style={{display: 'flex'}}>
        <Swatch onClick={this.handleTouchTap} >
          <Color color={color.split(PREFIX_MATCH)[1]} />
        </Swatch>
        <Popover
        open={this.state.open}
        anchorEl={this.state.anchorEl}
        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
        onRequestClose={this.handleRequestClose}
        >
          <SketchPicker color={color} onChange={this.onChange} />
        </Popover>
      </div>
    );
  }
}

export default ColorPicker;
