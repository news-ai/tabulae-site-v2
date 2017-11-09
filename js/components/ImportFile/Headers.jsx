import React, { Component } from 'react';
import {connect} from 'react-redux';
import 'node_modules/react-select/dist/react-select.css';
import AutoComplete from 'material-ui/AutoComplete';
import RaisedButton from 'material-ui/RaisedButton';
import alertify from 'alertifyjs';
import Waiting from '../Waiting';
import 'node_modules/alertifyjs/build/css/alertify.min.css';
import * as fileActions from './actions';
import isString from 'lodash/isString';

// DEPRECIATED!!!

const defaultSelectableOptions = [
  {value: 'firstname', label: 'First Name', selected: false},
  {value: 'lastname', label: 'Last Name', selected: false},
  {value: 'email', label: 'Email', selected: false},
  {value: 'employers', label: 'Employer/Publication'},
  {value: 'pastemployers', label: 'Past Employer(s)', selected: false},
  {value: 'linkedin', label: 'LinkedIn', selected: false},
  {value: 'twitter', label: 'Twitter', selected: false},
  {value: 'instagram', label: 'Instagram', selected: false},
  {value: 'website', label: 'Website', selected: false},
  {value: 'blog', label: 'Blog', selected: false},
  {value: 'notes', label: 'Notes', selected: false},
];

const config = {
  text: 'label',
  value: 'value'
};

const listItemStyle = {
  borderBottom: '1px solid lightgray',
  margin: '0 0 0 0',
  textAlign: 'left',
  height: 23,
  overflow: 'auto',
};

class Headers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      headers: this.props.headers,
      options: defaultSelectableOptions,
      order: Array(this.props.headers.length).fill(undefined)
    };
    this._sendHeaderNames = this._sendHeaderNames.bind(this);
    this.onNewRequest = this._onNewRequest.bind(this);
    this.clearValue = this._clearValue.bind(this);
    this.handleFirstRowClick = this._handleFirstRowClick.bind(this);
  }

  _sendHeaderNames() {
    const {order, headers} = this.state;
    const {onProcessHeaders} = this.props;
    let untitledCount = 0;
    const newOrder = order.map(item => {
      if (item) {
        return item;
      } else if (!item || item.length === 0) {
        untitledCount++;
        return `ignore_column`;
      }
    });
    if (untitledCount > 0) {
      alertify.confirm(
        `There are ${untitledCount} columns that will be dropped when the list is imported.
        Make sure columns have names if you would like to import them.`,
        _ => onProcessHeaders(newOrder),
        _ => {}
        );
    } else if (untitledCount === headers.length) {
      alertify.alert(`Import List Error`, `Importing empty list is not allowed. You must at least name one column.`, function() {});
    } else {
      onProcessHeaders(newOrder);
    }
  }

  _onNewRequest(req, reqIndex, headerIndex) {
    let order = this.state.order;
    if (isString(req)) {
      // custom
      order[headerIndex] = req;
    } else {
      // default
      // reset previous selected
      let options = this.state.options.map(option => {
        if (req.value !== 'employers' || req.value !== 'pastemployers') return option;
        else if (req.value === option.value) option.selected = true;
        return option;
      });
      this.setState({options});

      order[headerIndex] = req.value;
    }
    this.setState({order});
  }

  _clearValue(headerIndex) {
    const headerValue = (this.state.order[headerIndex]) ? this.state.order[headerIndex] : undefined;
    let options = this.state.options.map(option => {
      if (headerValue === option.value) option.selected = false;
      return option;
    });
    this.setState({options});
  }

  _handleFirstRowClick() {
    const order = this.state.headers
    .map(header => header.rows[0]);
    const {onProcessHeaders} = this.props;
    let untitledCount = 0;
    const newOrder = order.map(item => {
      if (item) {
        return item;
      } else if (!item || item.length === 0) {
        untitledCount++;
        return `ignore_column`;
      }
    });
    if (untitledCount > 0) {
      alertify.confirm(
        `There are ${untitledCount} columns that will be dropped when the list is imported.
        Make sure columns have names if you would like to import them.`,
        _ => onProcessHeaders(newOrder),
        _ => {}
        );
    } else {
      onProcessHeaders(newOrder);
    }
  }

  render() {
    /*
    <div className='large-4 columns'>
            <RaisedButton labelStyle={{textTransform: 'none'}} label='Or, use 1st Row as Column Name' onClick={this.handleFirstRowClick} />
          </div>*/
    const state = this.state;
    return (
      <div>
        <div className='row' style={{marginBottom: '30px'}}>
          <span>By setting the columns, you can do things like, emailing from template, sync up contact to their LinkedIn/Twitter, etc.</span><br />
          <span>You can custom set column names by typing the name in the dropdown bar as well.</span>
        </div>
        <div className='row'>
          <div className='large-8 columns'>
            <Waiting isReceiving={this.props.isProcessWaiting} textStyle={{marginLeft: 10}} text='PROCESSING...' />
          </div>
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginBottom: '30px'
        }}>

        {state.headers.map((header, i) =>
          <div key={i} style={{width: 180}}>
          <AutoComplete
          floatingLabelText='Column Name'
          openOnFocus
          onBlur={e => this.onNewRequest(e.target.value, null, i)}
          onFocus={_ => this.clearValue(i)}
          filter={AutoComplete.fuzzyFilter}
          onNewRequest={(req, reqIndex) => this.onNewRequest(req, reqIndex, i)}
          dataSource={state.options.filter(item => !item.selected)}
          dataSourceConfig={config}
        />
            <ul className='u-full-width' style={{listStyleType: 'none'}}>
            {header.rows.map((rowItem, j) => <li className='u-full-width' key={j} style={listItemStyle}>{rowItem}</li>)}
            </ul>
          </div>)}
        </div>
        <button className='button' style={{float: 'right'}} onClick={this._sendHeaderNames}>Finish</button>
      </div>
    );
  }
}


const mapStateToProps = (state, props) => {
  return {
    headers: props.listId && state.headerReducer[props.listId],
    isProcessWaiting: state.fileReducer.isProcessWaiting
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    onProcessHeaders: order => dispatch(fileActions.addHeaders(props.listId, order)),
    fetchHeaders: listId => dispatch(fileActions.fetchHeaders(listId)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Headers);
