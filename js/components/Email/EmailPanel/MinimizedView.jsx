// @flow
import React from 'react';
import Paper from 'material-ui/Paper';
import FontIcon from 'material-ui/FontIcon';
import {grey50} from 'material-ui/styles/colors';

function MinimizedView({toggleMinimize}: {toggleMinimize: (event: Event) => void}) {
  return (
      <Paper zDepth={2} style={{
        width: 300,
        height: 50,
        backgroundColor: grey50,
        zIndex: 200,
        display: 'inline-block',
        textAlign: 'center'
      }}>
        <FontIcon
        color='lightgray'
        hoverColor='gray'
        style={{fontSize: '3em'}}
        key='minimized-view'
        className='fa fa-chevron-up pointer'
        onClick={toggleMinimize}
        />
      </Paper>);
}

export default MinimizedView;
