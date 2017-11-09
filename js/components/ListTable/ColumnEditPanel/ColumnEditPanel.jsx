import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import {actions as listActions} from 'components/Lists';
import HTML5Backend from 'react-dnd-html5-backend';
import Container from './Container.jsx';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {yellow50, grey600} from 'material-ui/styles/colors';
import {generateTableFieldsmap, reformatFieldsmap} from 'components/ListTable/helpers';
import Select from 'react-select';
import alertify from 'utils/alertify';
import 'react-select/dist/react-select.css';

class ColumnEditPanel extends Component {
  constructor(props) {
    super(props);
    const hiddenList = this.props.fieldsmap.filter(field => field.hidden && !field.tableOnly);
    const showList = this.props.fieldsmap.filter(field => !field.hidden && !field.tableOnly);
    this.state = {
      hiddenList,
      showList,
      isUpdating: false,
      dirty: false,
      selected: this.props.list
    };
    this.onUpdateList = this.onUpdateList.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onListPresetSelect = this.onListPresetSelect.bind(this);
  }

  componentWillMount() {
    if (!this.props.lists || this.props.lists.length === 0) {
      this.props.fetchLists();
    }
  }

  onSubmit() {
    const fieldsmap = reformatFieldsmap([...this.state.showList, ...this.state.hiddenList]);
    const listBody = {
      listId: this.props.listId,
      name: this.props.list.name,
      fieldsmap
    };
    this.setState({isUpdating: true});
    this.props.patchList(listBody)
    .then(_ => this.setState({isUpdating: false}, this.props.onRequestClose));
  }

  onUpdateList(list, containerType) {
    this.setState({[containerType]: list, dirty: true});
  }

  onListPresetSelect(list) {
    if (!list) list = this.props.list;
    const fieldsmap = generateTableFieldsmap(list);
    const hiddenList = fieldsmap.filter(field => field.hidden && !field.tableOnly);
    const showList = fieldsmap.filter(field => !field.hidden && !field.tableOnly);
    this.setState({showList, hiddenList, selected: list, dirty: true});
    mixpanel.track('apply_list_preset_post_upload');
  }

  render() {
    const state = this.state;
    const actions = [
      <FlatButton primary label='Cancel' disabled={state.isUpdating} onClick={this.props.onRequestClose} />,
      <FlatButton primary label={state.isUpdating ? 'Updating...' : 'Submit'} disabled={state.isUpdating || !state.dirty} onClick={this.onSubmit} />,
    ];

    // console.log(this.props.fieldsmap);

    return (
      <div>
        <Dialog
        autoScrollBodyContent modal
        actions={actions}
        open={this.props.open}
        title='Column Settings'
        onRequestClose={this.props.onRequestClose}
        >
          <div style={styles.instructionContainer}>
            <span className='text'>
              Drag each card to reorder the order of you columns.
              Drag column cards from <strong>Hidden Columns</strong> to <strong>Showing Columns</strong> to activate or de-activate default columns.
              You can also create custom columns that you can use as template variable in emails.
            </span>
          </div>
          <div className='panel' style={styles.panel}>
            <span className='smalltext'>
            There is a number of auto-generated columns that are activated when certain columns are not hidden. For example,
            activating <strong>Instagram Likes</strong> and <strong>Instagram Comments</strong> also activates <strong>Likes-to-Comments ratio</strong>.
            </span>
          </div>
          <div style={styles.instructionContainer} >
            <span style={styles.preset.label} >Apply Presets - </span>
            <span className='text'>Use properties from a previously created list</span>
            <div style={styles.preset.dropdown} >
              <Select labelKey='name' value={state.selected} options={this.props.lists} onChange={this.onListPresetSelect} />
            </div>
          </div>
          <div className='row' style={styles.columnsContainer}>
            <Container
            containerType='hiddenList'
            updateList={this.onUpdateList}
            className='large-4 medium-6 small-12 columns'
            id={1}
            title='Hidden Columns'
            list={state.hiddenList}
            />
            <Container
            containerType='showList'
            className='large-8 medium-6 small-12 columns'
            updateList={this.onUpdateList}
            id={2}
            title='Showing Columns'
            list={state.showList}
            />
          </div>
        </Dialog>
      </div>
    );
  }
}

const styles = {
  instructionContainer: {margin: '20px 0'},
  columnsContainer: {paddingTop: 20},
  preset: {
    label: {fontSize: '1.2em', color: grey600},
    dropdown: {margin: 10}
  },
  panel: {
    backgroundColor: yellow50,
    margin: 10,
    padding: 10
  },
};

const mapStateToProps = (state, props) => {
  const lists = state.listReducer.lists.received.map(id => state.listReducer[id]);
  const listId = props.listId;
  const list = state.listReducer[listId];

  const rawFieldsmap = generateTableFieldsmap(list);
  return {
    fieldsmap: rawFieldsmap,
    list: list,
    lists,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    patchList: listObj => dispatch(listActions.patchList(listObj)),
    fetchLists: _ => dispatch(listActions.fetchLists()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DragDropContext(HTML5Backend)(ColumnEditPanel));
