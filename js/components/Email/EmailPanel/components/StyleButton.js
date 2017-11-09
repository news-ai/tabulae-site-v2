import React from 'react';
import { blueA400, blue200, grey500, grey800 } from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';

const buttonStyle = {
  marginRight: 10
};

const style = { width: 28, height: 28, padding: 6 };
export default class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    const props = this.props;
    let renderNode;
    let color = props.active ? blueA400 : grey800;
    let hoverColor = props.active ? blue200 : grey500;
    let onClick = this.onToggle;
    let pointerClassName = 'pointer';
    if (props.disabled) {
      color = grey500;
      onClick = undefined;
      pointerClassName = 'not-allowed';
    }

    if (props.icon) {
      renderNode = (
        <IconButton iconStyle={{ width: 14, height: 14, fontSize: '14px', color: color }}
                    hoveredStyle={{ color: hoverColor }}
                    style={style}
                    iconClassName={props.icon}
                    onClick={onClick}
                    tooltip={props.label}
                    tooltipPosition={props.tooltipPosition || 'top-right'} />);
    } else {
      renderNode = (
        <span className={pointerClassName} style={buttonStyle} onMouseDown={onClick}>{props.label}</span>);
    }

    return renderNode;
  }
}
