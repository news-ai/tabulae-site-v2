import styled from 'styled-components';

// based on css from https://codepen.io/sdthornton/pen/wBZdXq

const defaultDepth = '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)';
const DEPTH_2 = '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)';
const DEPTH_3 = '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)';
const DEPTH_4 = '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)';
const DEPTH_5 = '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)';

const Paper = styled.div.attrs({
  className: props => props.className
})`
  box-shadow: ${props => {
    switch (props.zDepth) {
      case 1:
        return defaultDepth;
      case 2:
        return DEPTH_2;
      case 3:
        return DEPTH_3;
      case 4:
        return DEPTH_4;
      case 5:
        return DEPTH_5;
      default:
        return defaultDepth;
    }
  }};
  `;

  export default Paper;

