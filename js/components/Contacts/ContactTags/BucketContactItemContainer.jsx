import React, {Component} from 'react';
import {connect} from 'react-redux';
import FontIcon from 'material-ui/FontIcon';
import ContactItemContainer from '../ContactFeed/ContactItemContainer.jsx';
import {blue500, grey100, grey300, grey600} from 'material-ui/styles/colors';
import Paper from 'material-ui/Paper';

class BucketContactItemContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {hover: false};
    this.onMouseOver = e => this.setState({hover: true});
    this.onMouseOut = e => this.setState({hover: false});
    this.onBlockClick = e => {
      this.setState({hover: false});
      props.onSwitch(props.id);
    };
  }

  render() {
    const props = this.props;
    const state = this.state;
    const paperStyle = state.hover ? Object.assign({}, styles.paper, {backgroundColor: grey100}) : styles.paper;
    const checked = props.selected.some(id => id === props.id);

    return props.currentlyShowing === props.id ?
    <div style={styles.contactItem} >
      <ContactItemContainer checked={checked} {...props} />
    </div>
     : (
      <Paper zDepth={1} className='pointer row' onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut} onClick={this.onBlockClick} style={paperStyle} >
        <div className='large-1 medium-1 small-1 columns'>
          <FontIcon style={styles.block.check} color={checked ? blue500 : grey300} className='fa fa-check'/>
        </div>
        <div className='large-9 medium-9 small-8 columns'>
        {props.list &&
          <span style={styles.block.label}>List: {props.list.name}</span>}
        </div>
        <div className='large-2 medium-2 small-3 columns'>
        {state.hover &&
          <span style={styles.block.label}>Expand +</span>}
        </div>
      </Paper>
      );
  }
}

const styles = {
  block: {
    check: {fontSize: '0.9em'},
    label: {color: grey600, fontSize: '0.7em'}
  },
  contactItem: {margin: '2px 0'},
  paper: {padding: '0 5px'}
};

const mapStateToProps = (state, props) => {
  return {
    list: state.listReducer[props.listid],
  };
};

export default connect(mapStateToProps)(BucketContactItemContainer);
