import React, {Component} from 'react';
import {connect} from 'react-redux';
import withRouter from 'react-router/lib/withRouter';
import {actions as fileActions} from 'components/ImportFile';
import {Grid} from 'react-virtualized';

import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import {generateTableFieldsmap, reformatFieldsmap} from 'components/ListTable/helpers';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import find from 'lodash/find';

import {grey500, grey600, lightBlue50, lightBlue300, red800} from 'material-ui/styles/colors';
import alertify from 'alertifyjs';
import 'node_modules/alertifyjs/build/css/alertify.min.css';

const defaultSelectableOptions = [
  {value: 'firstname', label: 'First Name/Full Name', selected: false},
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
  {value: 'location', label: 'Location', selected: false},
  {value: 'phonenumber', label: 'Phone #', selected: false},
];

class HeaderNaming extends Component {
  constructor(props) {
    super(props);
    this.state = {
      order: [],
      options: defaultSelectableOptions,
      seleted: undefined,
      isLoading: false
    };
    this.rowRenderer = this._rowRenderer.bind(this);
    this.headerRenderer = this._headerRenderer.bind(this);
    this.onMenuChange = this._onMenuChange.bind(this);
    this.onSubmit = this._onSubmit.bind(this);
    this.onAddCustom = this._onAddCustom.bind(this);
    this.onListPresetSelect = this.onListPresetSelect.bind(this);
  }

  componentWillMount() {
    this.props.fetchHeaders();
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.headers && nextProps.headers) {
      this.setState({order: Array(nextProps.headers.length).fill(undefined)});
    }

    if (this.props.error !== nextProps.error && nextProps.didInvalidate) {
    }
  }

  componentWillUnmount() {
    this.props.onReducerReset();
  }

  _headerRenderer({columnIndex, rowIndex, key, style}) {
    let contentBody;
    switch (columnIndex) {
      case 0:
        contentBody = 'First Cell from First Row';
        break;
      case 1:
        contentBody = 'Preview Information';
        break;
      case 2:
        contentBody = 'Tabulae Properties';
        break;
      default:
        contentBody = '';
    }
    return (
      <div
      className='headersnaming-headercell vertical-center'
      key={key}
      style={style}>
        <span style={styles.headerCell}>{contentBody}</span>
      </div>
      );
  }

  _rowRenderer({columnIndex, rowIndex, key, style}) {
    const rows = this.props.headers[rowIndex].rows;
    let classname = rowIndex % 2 === 0 ?
        'headersnaming-cell evenRow vertical-center' :
        'headersnaming-cell oddRow vertical-center';
    let contentBody;
    switch (columnIndex) {
      case 0:
        contentBody = <span style={styles.bodyCell}>{rows[0]}</span>;
        break;
      case 1:
        contentBody = <span className='text' style={styles.bodyCell}>{rows[1]}</span>;
        break;
      case 2:
        contentBody = (
        <DropDownMenu
        value={this.state.order[rowIndex]}
        onChange={(e, i, v) => this.onMenuChange(e, i, v, rowIndex, this.state.order[rowIndex])}>
        {[
          <MenuItem key={-1} value={undefined} primaryText='----- Ignore Column -----' />,
          ...this.state.options
          .map((option, i) => (
            <MenuItem
            key={i}
            disabled={option.selected}
            value={option.value}
            primaryText={option.label}
            />))
        ]}
        </DropDownMenu>);
        break;
      default:
        contentBody = '';
    }

    return (
      <div
      className={classname}
      key={key}
      style={style}>
      {contentBody}
      </div>);
  }

  _onMenuChange(event, index, value, rowIndex, prevValue) {
    if (value === undefined) {
      // unselected a value
      const unselectOrder = this.state.order.map((columnName, i) => rowIndex === i ? undefined : columnName);
      const unselectOptions = this.state.options.map(option => option.value === prevValue ? Object.assign({}, option, {selected: false}) : option);
      this.setState({
        order: unselectOrder,
        options: unselectOptions
      }, _ => this._headernames.recomputeGridSize());
      return;
    }
    // selected a value
    let prevOrder = this.state.order.slice();
    if (this.state.order.some(columnName => columnName === prevValue)) {
      prevOrder = this.state.order.map(columnName => columnName === prevValue ? undefined : columnName);
    }
    const order = prevOrder.map((columnName, i) => i === rowIndex ? value : columnName);
    const options = this.state.options
    .map((option, i) => order.some(columnName => columnName === option.value) ?
      Object.assign({}, option, {selected: true}) : Object.assign({}, option, {selected: false}));
    this.setState({order, options}, _ => this._headernames.recomputeGridSize());
  }

  _onSubmit() {
    window.Intercom('trackEvent', 'processed_sheet');
    mixpanel.track('processed_sheet');
    const order = this.state.order.map(name => name || 'ignore_column');
    const headernames = this.state.order.reduce((acc, value) => {
      const headerOption = find(this.state.options, ['value', value]);
      acc.push(headerOption ? headerOption.label : '');
      return acc;
    }, []);
    this.props.onAddHeaders(order, headernames)
    .then(_ => {
      if (!this.props.didInvalidate) {
        this.setState({isLoading: true});
        setTimeout(_ => this.props.router.push(`/tables/${this.props.listId}?justCreated=true`), 2000);
      }
    });
  }

  _onAddCustom() {
    alertify.prompt(
      'Name Custom Property',
      'This will be applied as a custom column name.',
      '',
      (e, name) => {
        const value = name.toLowerCase().split(' ').join('_');
        if (this.state.options.some(option => option.value === value)) {
          alertify.alert('Dupliate Name', `The name: [${name}] you inputed already exist as an option. Please pick another.`, function(){});
          return;
        }
        const options = [...this.state.options, {value, label: name, selected: false}];
        this.setState({options}, _ => this._headernames.recomputeGridSize());
      },
      _ => {});
  }

  onListPresetSelect(list) {
    if (!list) {
      this.setState({selected: undefined});
      return;
    }
    const fieldsmap = generateTableFieldsmap(list)
    .filter(field => field.customfield && !field.readonly && !this.state.options.some(option => option.value === field.value))
    .map(field => ({value: field.value, label: field.name, selected: false}));
    const options = [...this.state.options, ...fieldsmap];
    this.setState({options, selected: list}, _ => this._headernames.recomputeGridSize());
    mixpanel.track('list_preset_on_upload');
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div className='horizontal-center' style={styles.container}>
    {props.isReceiving &&
      <span>LOADING ...</span>}
      {props.headers &&
        <div style={styles.headerContainer}>
          <div className='panel radius' style={styles.panel}>
            <h5>Name Your Columns</h5>
            <span className='text'>
            Look through each column we pulled from your file and map it to Tabulae properties we have.
            Tabulae will start to aggregate feeds from each contact's social fields once its connected. <a href='https://help.newsai.co/tabulae-how-to/how-to-upload-a-media-list' target='_blank'>Upload Guide</a>
            </span>
          </div>
          <div style={styles.preset.container} >
            <span style={styles.preset.label} >Add Existing List Properties to Dropdown</span>
            <Select labelKey='name' value={state.selected} options={this.props.lists} onChange={this.onListPresetSelect} />
          </div>
          <div>
            <FlatButton
            icon={<FontIcon className='fa fa-plus' color={grey500} />}
            style={styles.customBtn.style}
            labelStyle={styles.customBtn.label}
            label='Add Custom Properties'
            onClick={this.onAddCustom}
            />
          </div>
          <div style={styles.grid.container}>
            <Grid
            className='BodyGrid'
            cellRenderer={this.headerRenderer}
            columnCount={3}
            columnWidth={250}
            height={50}
            width={750}
            rowCount={1}
            rowHeight={50}
            />
          </div>
          <Grid
          ref={ref => this._headernames = ref}
          className='BodyGrid'
          cellRenderer={this.rowRenderer}
          columnCount={3}
          columnWidth={250}
          height={props.headers.length * 60}
          width={750}
          rowCount={props.headers.length}
          rowHeight={60}
          />
          <div style={styles.btn.container}>
            <RaisedButton
            className='right'
            labelStyle={styles.btn.label}
            disabled={props.didInvalidate}
            backgroundColor={lightBlue300}
            icon={
              <FontIcon color='#ffffff'
              className={!props.didInvalidate && props.isProcessWaiting ? 'fa fa-spinner fa-spin' : 'fa fa-paper-plane'}
              />}
            label='Submit'
            onClick={this.onSubmit} />
          {(props.isProcessWaiting || state.isLoading) &&
            <span className='text' style={styles.waiting} >Uploading... This may take from a few seconds to a few minutes depending on file size.</span>}
          {props.didInvalidate &&
            <div>
              <span style={styles.errorText}>Something went wrong while processing property headers.
              One common case is hidden columns/formulas on the Excel file which we can't parse. It can be solved by copy-paste the rows you want into a new Excel file.
              Please <a href={window.TABULAE_HOME}>Refresh</a> and try again or contact Support.
              </span>
            </div>}
          </div>
        </div>}
      </div>);
  }
}

const styles = {
  container: {margin: 30},
  errorText: {color: red800},
  btn: {
    container: {margin: 30},
    label: {color: '#ffffff', textTransform: 'none'},
  },
  grid: {
    container: {marginBottom: 20},
  },
  customBtn: {
    label: {textTransform: 'none'},
    style: {float: 'right', margin: 10},
  },
  panel: {
    backgroundColor: lightBlue50, padding: 20, margin: 10
  },
  headerContainer: {width: 750},
  preset: {
    container: {margin: 10},
    label: {color: grey600}
  },
  waiting: {color: grey600},
  headerCell: {fontSize: '1.1em', fontWeight: 'bold', marginLeft: 15, color: grey500},
  bodyCell: {marginLeft: 15},
};

const mapStateToProps = (state, props) => {
  const listId = parseInt(props.params.listId, 10);
  const lists = state.listReducer.lists.received.map(id => state.listReducer[id]);

  return {
    listId,
    isProcessWaiting: state.fileReducer.isProcessWaiting,
    isReceiving: state.headerReducer.isReceiving,
    headers: state.headerReducer[listId],
    didInvalidate: state.headerReducer.didInvalidate,
    error: state.headerReducer.error,
    lists
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const listId = parseInt(props.params.listId, 10);
  return {
    fetchHeaders: _ => dispatch(fileActions.fetchHeaders(listId)),
    onAddHeaders: (order, headernames) => dispatch(fileActions.addHeaders(listId, order, headernames)),
    onReducerReset: () => dispatch({type: 'HEADERS_REDUCER_RESET'})
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(HeaderNaming));
