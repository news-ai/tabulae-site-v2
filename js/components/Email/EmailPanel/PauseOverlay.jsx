import React from 'react';
import FontIcon from 'material-ui/FontIcon';
import {grey800} from 'material-ui/styles/colors';
import styled from 'styled-components';

const Container = styled.div`
  background: rgba(66, 66, 66, 0.7);
  border-sizing: border-box;
  z-index: ${props => props.zIndex || 250};
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${props => props.height || '100%'};
  width: ${props => props.width || '100%'};
`;

const styles = {
  container: {margin: 0},
  text: {color: '#ffffff', fontSize: '1.1em'},
  icon: {margin: '0 5px'}
};

const PauseOverlay = ({message, width, height, zIndex}) => (
  <Container width={width} height={height} zIndex={zIndex} >
    <div style={styles.container}>
      <span style={styles.text}>{message || 'Loading...'}</span>
      <FontIcon style={styles.icon} color='#ffffff' className='fa fa-spin fa-spinner' />
    </div>
  </Container>);

export default PauseOverlay;
