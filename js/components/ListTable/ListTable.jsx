import React, {Component} from 'react';
import {connect} from 'react-redux';
import withRouter from 'react-router/lib/withRouter';
import Link from 'react-router/lib/Link';
import classNames from 'classnames';
import styled from 'styled-components';

import find from 'lodash/find';
import difference from 'lodash/difference';
import isEmpty from 'lodash/isEmpty';

import {actions as listActions} from 'components/Lists';
import {actions as publicationActions} from 'components/Publications';
import {actions as contactActions} from 'components/Contacts';
import {actions as loginActions} from 'components/Login';

import hopscotch from 'hopscotch';
import 'node_modules/hopscotch/dist/css/hopscotch.min.css';
import {tour} from './tour';

import MenuItem from 'material-ui/MenuItem';
import IconMenu from 'material-ui/IconMenu';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import TextField from 'material-ui/TextField';
import {grey50, teal400, teal900, blue100, blue200, blue300, grey400, grey500, grey600, grey700, grey800} from 'material-ui/styles/colors';
import {Grid, ScrollSync} from 'react-virtualized';
import Draggable from 'react-draggable';
import Dialog from 'material-ui/Dialog';
import LinearProgress from 'material-ui/LinearProgress';
import Paper from 'material-ui/Paper';

import EmailPanel from 'components/Email/EmailPanel/EmailPanel.jsx';
import Drawer from 'material-ui/Drawer';
import {ControlledInput} from '../ToggleableEditInput';
import Waiting from '../Waiting';
import CopyToHOC from './CopyToHOC';
import ColumnEditPanel from 'components/ListTable/ColumnEditPanel/ColumnEditPanel.jsx';
import AddContactHOC from './AddContactHOC.jsx';
import AddTagDialogHOC from './AddTagDialogHOC.jsx';
import EditMultipleContactsHOC from './EditMultipleContactsHOC.jsx';
import PanelOverlayHOC from './PanelOverlayHOC.jsx';
import EmptyListStatement from './EmptyListStatement.jsx';
import AnalyzeSelectedTwitterHOC from './AnalyzeSelectedTwitterHOC.jsx';
import AnalyzeSelectedInstagramHOC from './AnalyzeSelectedInstagramHOC.jsx';
import ScatterPlotHOC from './ScatterPlotHOC.jsx';
import Tags from 'components/Tags/TagsContainer.jsx';
import Tag from 'components/Tags/Tag.jsx';
import EditContactDialog from './EditContactDialog.jsx';
import PlainIconButton from './PlainIconButton';
import PaginateControls from './PaginateControls';

import {
  generateTableFieldsmap,
  measureSpanSize,
  exportOperations,
  isNumber,
  _getter
} from './helpers';
import alertify from 'utils/alertify';
import 'react-virtualized/styles.css';
import './Table.css';

const localStorage = window.localStorage;
let DEFAULT_WINDOW_TITLE = window.document.title;
let INTERVAL_ID = undefined;


const applyDocumentTitle = name => {
  // change document title to list name and show # of unread notifications
  const currentTitle = window.document.title;
  if (currentTitle.split(' --- ').length > 1) { // List Title
    const regExp = /\(([^)]+)\)/;
    const matches = regExp.exec(currentTitle);
    if (matches === null) { // no notif
      window.document.title = `${name} --- NewsAI Tabulae`;
    } else {
      window.document.title = `(${matches[1]}) ${name} --- NewsAI Tabulae`;
    }
  } else { // normal title
    const currentTitleArray = currentTitle.split(' ');
    if (currentTitleArray[0] === 'NewsAI') { // no notifs default
      window.document.title = `${name} --- NewsAI Tabulae`;
    } else { // has notif count in title
      window.document.title = `${currentTitleArray[0]} ${name} --- NewsAI Tabulae`;
    }
  }
};

class ListTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
      isSearchOn: false,
      errorText: '',
      searchContacts: [],
      selected: [],
      columnWidths: null,
      dragPositions: [],
      dragged: false,
      sortPositions: this.props.fieldsmap === null ? null : this.props.fieldsmap.map(fieldObj => fieldObj.sortEnabled ?  0 : 2),
      onSort: false,
      sortedIds: [],
      lastRowIndexChecked: null,
      profileContactId: null,
      screenWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
      screenHeight: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
      firsttime: this.props.firstTimeUser,
      leftoverHeight: undefined,
      scrollToRow: undefined,
      currentSearchIndex: 0,
      isDeleting: false,
      showContactEditPanel: false,
      currentEditContactId: undefined,
      isEmailPanelOpen: false,
      initializeEmailPanel: false,
      showColumnEditPanel: false,
      currentPage: 1,
      pageSize: 200
    };

    // store outside of state to update synchronously for PanelOverlay
    this.showProfileTooltip = false;
    this.onTooltipPanel = false;
    this.onShowEmailClick = _ => {
      if (props.person.emailconfirmed) {
        this.setState({isEmailPanelOpen: true, initializeEmailPanel: true});
        // this.fetchOperations(this.props, 'all');
      } else {
        alertify.alert('Trial Alert', 'You can start using the Email feature after you confirmed your email. Look out for the confirmation email in your inbox.', function() {});
      }
    }


    if (this.props.listData) {
      applyDocumentTitle(this.props.listData.name);
    }
    this.onSearchClick = this.onSearchClick.bind(this);

    window.onresize = _ => {
      const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      this.setGridHeight();
      this.setState({screenWidth, screenHeight});
    };
    this.setColumnStorage = columnWidths => localStorage.setItem(this.props.listId, JSON.stringify({columnWidths}));
    this.getColumnStorage = _ => {
      try {
        const item = localStorage.getItem(this.props.listId);
        const store = JSON.parse(localStorage.getItem(this.props.listId));
        if (!store) return undefined;
        else return store.columnWidths;
      } catch (e) {
        console.log(e);
        return undefined;
      }
    };
    this.clearColumnStorage = columnWidths => localStorage.setItem(this.props.listId, undefined);
    this.getColumnWidth = ({index}) => {
      const wid = this.state.columnWidths[index];
      if (!wid) {
        this.clearColumnStorage();
        return 70;
      }
      return wid + 10;
    };
    this.fetchOperations = this._fetchOperations.bind(this);
    this.onCheckSelected = this._onCheckSelected.bind(this);
    this.onCheck = this._onCheck.bind(this);
    this.onSearchClearClick = this._onSearchClearClick.bind(this);
    this.onSearch = this._onSearch.bind(this);
    this.onSearchKeyDown = this.onSearchKeyDown.bind(this);
    this.getNextSearchResult = this._getNextSearchResult.bind(this);
    this.cellRenderer = this._cellRenderer.bind(this);
    this.headerRenderer = this._headerRenderer.bind(this);
    this.onExportClick = this._onExportClick.bind(this);
    this.onHeaderDragStart = this._onHeaderDragStart.bind(this);
    this.onHeaderDragStop = this._onHeaderDragStop.bind(this);
    this.onSort = columnIndex => {
      return new Promise((resolve, reject) => {
        if (this.props.contacts.length < this.props.listData.contacts.length) {
          return this.fetchOperations(this.props, 'all')
          .then(_ => this._onSort(columnIndex));
        } else {
          this._onSort(columnIndex);
        }
      });
    };
    this._onSort = this._onSort.bind(this);
    this.onRemoveContacts = this._onRemoveContacts.bind(this);
    this.setDataGridRef = ref => (this._DataGrid = ref);
    this.setHeaderGridRef = ref => (this._HeaderGrid = ref);
    this.setGridHeight = this._setGridHeight.bind(this);
    this.resetSort = () => this.setState({
      sortPositions: this.props.fieldsmap === null ? null : this.props.fieldsmap.map(fieldObj => fieldObj.sortEnabled ? 0 : 2),
      onSort: false,
      sortedIds: [],
    });
    this.checkEmailDupes = this._checkEmailDupes.bind(this);
    this.forceEmailPanelRemount = _ => this.setState({initializeEmailPanel: false}, _ => this.setState({initializeEmailPanel: true}));
  }

  componentWillMount() {
    // get locally stored columnWidths
    let columnWidths = this.getColumnStorage();
    if (columnWidths) this.setState({columnWidths});
    if (this.props.searchQuery) {
      this.fetchOperations(this.props).then(_ => this.onSearch(this.props.searchQuery));
    }
    else if (this.props.location.query.justCreated == 'true') {
      this.fetchOperations(this.props).then(_ => this.checkEmailDupes());
    }
    else this.fetchOperations(this.props);

    setTimeout(this.setGridHeight, 1500);
    if (this.state.sortPositions === null) {
      const sortPositions = this.props.fieldsmap.map(fieldObj => fieldObj.sortEnabled ?  0 : 2);
      this.setState({sortPositions});
    }

    if (this.state.columnWidths === null || this.state.columnWidths !== this.props.fieldsmap.length) {
      let columnWidths = this.props.fieldsmap.map((fieldObj, i) => {
        const name = fieldObj.name;
        const size = measureSpanSize(name, '16px Source Sans Pro');
        return size.width > 70 ? size.width : 70;
      });

      if (this.props.contacts.length > 0 && !this.state.dragged) {
        this.props.fieldsmap.map((fieldObj, i) => {
          let max = columnWidths[i];
          this.props.contacts.map(contact => {
            let content;
            if (fieldObj.customfield) {
              if (contact.customfields === null) return;
              if (!contact.customfields.some(obj => obj.name === fieldObj.value)) return;
              content = find(contact.customfields, obj => obj.name === fieldObj.value).value;
            } else {
              content = contact[fieldObj.value];
            }
            const size = measureSpanSize(content, '16px Source Sans Pro');
            if (size.width > max) max = size.width;
          });
          columnWidths[i] = max;
        });
      }

      this.setState({columnWidths}, _ => {
        if (this._HeaderGrid && this._DataGrid) {
          this._HeaderGrid.recomputeGridSize();
          this._DataGrid.recomputeGridSize();
        }
      });
    }
  }

  componentDidMount() {
    const props = this.props;
    window.Intercom('trackEvent', 'opened_sheet', {listId: props.listData.id});
    mixpanel.track('opened_sheet', {listId: props.listData.id, size: props.listData.contacts !== null ? props.listData.contacts.length : 0});
    INTERVAL_ID = setInterval(_ => {
      if (!this.state.isEmailPanelOpen) this.fetchOperations(this.props, 'partial', 50);
    }, 20000);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.listDidInvalidate) {
      this.props.router.push('/notfound');
    }

    if (nextProps.listData) {
      applyDocumentTitle(nextProps.listData.name);
    }

    if (nextProps.listId !== this.props.listId) {
      // underlying list changed
      this.fetchOperations(nextProps);
    }

    this.setGridHeight();

    if (this.state.sortPositions === null) {
      const sortPositions = nextProps.fieldsmap.map(fieldObj => fieldObj.sortEnabled ?  0 : 2);
      this.setState({sortPositions});
    }

    let columnWidths = this.state.columnWidths;
    if (this.props.fieldsmap.length !== nextProps.fieldsmap.length || columnWidths === null || nextProps.fieldsmap.length !== columnWidths.length) {
      columnWidths = nextProps.fieldsmap.map((fieldObj, i) => {
        const name = fieldObj.name;
        const size = measureSpanSize(name, '16px Source Sans Pro')
        return size.width > 70 ? size.width : 70;
      });
    }

    if (nextProps.contacts.length > 0 && !this.state.dragged) {
      nextProps.fieldsmap.map((fieldObj, i) => {
        let max = columnWidths[i];
        nextProps.contacts.map(contact => {
          let content;
          if (fieldObj.customfield) {
            if (contact.customfields === null) return;
            if (!contact.customfields.some(obj => obj.name === fieldObj.value)) return;
            content = find(contact.customfields, obj => obj.name === fieldObj.value).value;
          } else if (fieldObj.tableOnly) {
            return;
          } else {
            content = contact[fieldObj.value];
          }
          const size = measureSpanSize(content, '16px Source Sans Pro')
          if (size.width > max) max = size.width;
        });
        columnWidths[i] = max;
      });
    }

    this.setState({columnWidths},
      _ => {
      if (this._HeaderGrid && this._DataGrid) {
        this._HeaderGrid.recomputeGridSize();
        this._DataGrid.recomputeGridSize();
      }
    });

    if (nextProps.searchQuery !== this.props.searchQuery) {
      if (nextProps.searchQuery) {
        this.onSearch(nextProps.searchQuery);
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // if (this.props.contactIsReceiving && nextProps.contactIsReceiving && !this.state.isEmailPanelOpen) return false;
    return true;
  }


  componentWillUnmount() {
    window.onresize = undefined;
    // clear out list title
    const title = window.document.title;
    const regExp = /\(([^)]+)\)/;
    const matches = regExp.exec(title);
    if (matches === null) { // no notif
      window.document.title = `NewsAI Tabulae`;
    } else {
      window.document.title = `(${matches[1]}) NewsAI Tabulae`;
    }
    clearInterval(INTERVAL_ID);
  }

  _checkEmailDupes() {
    let seen = {};
    let dupMap = {};
    let dupes = [];
    this.props.contacts.map(contact => {
      if (isEmpty(contact.email)) return;
      if (seen[contact.email]) {
        dupes.push(contact.id);
        dupMap[contact.email] = true;
      }
      else seen[contact.email] = true;
    });
    if (Object.keys(dupMap).length > 0) alertify.alert('Duplicate Email Warning', `We found email duplicates for ${Object.keys(dupMap).join(', ')}. Every duplicate email is selected if you wish to delete them. If not, you can deselect them all by clicking on "Selected" label twice.`);
    this.setState({selected: dupes});
  }

  _setGridHeight() {
    const headerContainer = document.getElementById('HeaderGridContainerId');
    if (headerContainer) {
      const leftoverHeight = document.body.clientHeight - (headerContainer.getBoundingClientRect().top + 45);
      if (leftoverHeight !== this.state.leftoverHeight) {
        this.setState({leftoverHeight});
      }
    }
  }

  _onHeaderDragStart(e, {x, y}, columnIndex) {
    let dragPositions = this.state.dragPositions.slice();
    dragPositions[columnIndex] = {x, y};
    this.setState({dragPositions});
  }

  _onHeaderDragStop(e, {x, y}, columnIndex) {
    let columnWidths = this.state.columnWidths.slice();
    columnWidths[columnIndex] += x
    let dragPositions = this.state.dragPositions.slice();
    dragPositions[columnIndex] = {x: 0, y: 0};
    this.setState(
      {columnWidths, dragPositions, dragged: true},
      _ => {
        if (this._HeaderGrid && this._DataGrid) {
          this.setColumnStorage(columnWidths);
          this._HeaderGrid.recomputeGridSize();
          this._DataGrid.recomputeGridSize();
        }
      });
  }

  _onCheck(e, contactId, contacts, {columnIndex, rowIndex, key, style}) {
    const lastRowIndexChecked = this.state.lastRowIndexChecked;
    if (e.nativeEvent.shiftKey && lastRowIndexChecked !== rowIndex && lastRowIndexChecked !== null) {
      let selected = this.state.selected.slice();
      let last = null;
      if (rowIndex < lastRowIndexChecked) {
        for (let i = rowIndex; i < lastRowIndexChecked; i++) {
          const checked = this.state.selected.some(id => id === contacts[i].id);
          selected = !checked ? [...selected, contacts[i].id] : selected.filter(id => id !== contacts[i].id);
        }
      } else {
        for (let i = rowIndex; i > lastRowIndexChecked; i--) {
          const checked = this.state.selected.some(id => id === contacts[i].id);
          selected = !checked ? [...selected, contacts[i].id] : selected.filter(id => id !== contacts[i].id);
        }
      }
      this.setState({lastRowIndexChecked: rowIndex, selected});
    } else {
      this.onCheckSelected(contactId);
      this.setState({lastRowIndexChecked: rowIndex});
    }
  }

  _onCheckSelected(contactId) {
    const checked = this.state.selected.some(id => id === contactId);
    const selected = !checked ?
    [...this.state.selected, contactId] :
    this.state.selected.filter(id => id !== contactId);
    this.setState({selected});
  }

  _headerRenderer({columnIndex, key, style}) {
    const content = this.props.fieldsmap[columnIndex].name;
    const value = this.props.fieldsmap[columnIndex].value;
    const sortDirection = this.state.sortPositions[columnIndex];

    let directionIcon = 'fa fa-circle-o';
    if (sortDirection === 1) {
      directionIcon = 'fa fa-caret-up';
    } else if (sortDirection === -1) {
      directionIcon = 'fa fa-caret-down';
    }
    let customSpan;
    if (value === 'selected') {
      const checked = this.state.selected.length === this.props.listData.contacts.length;
      customSpan = (
        <input
        type='checkbox'
        className='pointer'
        checked={checked}
        onClick={_ => this.setState({selected: checked ? [] : this.props.listData.contacts.slice()})}
        />
        );
    }

    return (
      <div className='headercell' key={key} style={style}>
        {customSpan || <span className='text' style={{whiteSpace: 'nowrap'}}>{content}</span>}
        {sortDirection !== 2 &&
          <i style={{fontSize: sortDirection === 0 ? '0.5em' : '1em'}}
          className={`${directionIcon} sort-icon`}
          onClick={_ => this.onSort(columnIndex)} aria-hidden='true' />}
        <Draggable
        axis='x'
        bounds={{left: 0 - this.state.columnWidths[columnIndex]}}
        position={this.state.dragPositions[columnIndex]}
        onStop={(e, args) => this.onHeaderDragStop(e, args, columnIndex)}>
          <div className='draggable-handle right'></div>
        </Draggable>
      </div>);
  }

  _cellRenderer(cellProps) {
    const {columnIndex, rowIndex, key, style} = cellProps;
    const rIndex = this.state.pageSize !== -1 ? (this.state.currentPage - 1) * this.state.pageSize + rowIndex : rowIndex; // compute paginated actual index
    const fieldObj = this.props.fieldsmap[columnIndex];
    let contacts = this.state.onSort ? this.state.sortedIds.map(id => this.props.contactReducer[id]) : this.props.contacts;
    const contact = contacts[rIndex];
    let content = _getter(contacts[rIndex], fieldObj) || '';
    // switch row to different color classname if it is search result
    let className = classNames(
      'vertical-center',
      'cell',
      {evenRow: contact && !contact.isSearchResult && rIndex % 2 === 0},
      {oddRow: contact && !contact.isSearchResult && rIndex % 2 === 0},
      {findresult: contact && contact.isSearchResult}
      );
    let contentBody;
    let contentBody2 = null;
    if (fieldObj.tableOnly && contacts[rIndex]) {
      const rowData = contacts[rIndex];
      switch (fieldObj.value) {
        case 'index':
          contentBody = <span>{rIndex + 1}</span>;
          break;
        case 'selected':
          const isChecked = this.state.selected.some(id => id === rowData.id);
          contentBody = (
            <FontIcon
            onClick={e => this.onCheck(e, rowData.id, contacts, cellProps)}
            color={blue200}
            style={styles.profileIcon}
            className={isChecked ? 'fa fa-square pointer' : 'fa fa-square-o pointer'}
            />);
          break;
        case 'profile':
          contentBody = (
              <Link to={`/tables/${this.props.listId}/${rowData.id}`}>
                <FontIcon
                id='profile_hop'
                className='fa fa-arrow-right'
                color={blue300}
                style={styles.profileIcon}
                onMouseEnter={e => {
                  this.showProfileTooltip = true;
                  this.setState({
                    profileX: e.clientX,
                    profileY: e.clientY,
                    profileContactId: rowData.id
                  });
                }}
                onMouseLeave={e => {
                  setTimeout(_ => {
                    this.showProfileTooltip = this.onTooltipPanel;
                    this.forceUpdate();
                  }, 80);
                }}
                />
              </Link>
              );
          contentBody2 = !this.props.listData.readonly &&
          <FontIcon
          onClick={_ => this.setState({currentEditContactId: rowData.id, showContactEditPanel: true})}
          className='fa fa-edit pointer'
          style={styles.profileIcon}
          color={blue300}
          />;
          break;
        default:
          contentBody = <span>{content}</span>;
      }
    } else {
      switch (fieldObj.value) {
        case 'tags':
          contentBody = content ? content
          .slice(0, 3)
          .map((tag, i) =>
            <Tag
            key={`${tag}-${i}`}
            hideDelete
            whiteLabel
            text={tag}
            color={teal400}
            borderColor={teal900}
            link={`/contacts?tag=${tag}`}
            />) : '';
          break;
        default:
          contentBody = <span>{content}</span>;
      }
    }

    return (
      <div className={className} key={key} style={style}>
      {contentBody}{contentBody2}
      </div>
      );
  }

  _fetchOperations(props, fetchType, amount) {
    if (
      props.listData.contacts !== null &&
      props.received.length < props.listData.contacts.length
      ) {
      if (fetchType === 'partial' && this.state.pageSize !== -1) return props.fetchManyContacts(props.listId, amount || this.state.pageSize);
      else if (fetchType === 'all') return props.loadAllContacts(props.listId);
      return this.state.pageSize === -1 ? props.loadAllContacts(props.listId) : props.fetchManyContacts(props.listId, this.state.pageSize);
    }
    return Promise.resolve(true);
  }

  _onSort(columnIndex) {
    const sortDirection = this.state.sortPositions[columnIndex];
    const fieldObj = this.props.fieldsmap[columnIndex];
    let newDirection;
    if (sortDirection === 0) {
      newDirection = 1;
    } else if (sortDirection === 1) {
      newDirection = -1;
    } else {
      newDirection = 0;
    }
    const sortPositions = this.state.sortPositions
      .map((position, i) => i === columnIndex ? newDirection : position);
    const onSort = sortPositions.some(position => position === -1 || position === 1);


    const contactIds = this.props.received.slice();
    let filteredIds, emptyIds, sortedIds;
    if (onSort) {
      if (fieldObj.customfield) {
        filteredIds = contactIds.filter(id => _getter(this.props.contactReducer[id], fieldObj));
        emptyIds = contactIds.filter(id => !_getter(this.props.contactReducer[id], fieldObj));
      } else {
        filteredIds = contactIds.filter(id => _getter(this.props.contactReducer[id], fieldObj));
        emptyIds = contactIds.filter(id => !_getter(this.props.contactReducer[id], fieldObj));
      }
      filteredIds.sort((a, b) => {
        let valA = _getter(this.props.contactReducer[a], fieldObj);
        let valB = _getter(this.props.contactReducer[b], fieldObj);
        if (isNumber(valA)) {
          valA = parseFloat(valA);
          valB = parseFloat(valB);
        } else if (typeof valA === 'string') {
          valA = valA.toUpperCase();
          valB = valB.toUpperCase();
        }
        if (valA < valB) return 0 - newDirection;
        else if (valA > valB) return newDirection;
        else return 0;
      });
      sortedIds = filteredIds.concat(emptyIds);
    }
    this.setState({sortPositions, onSort, sortedIds});
  }


  _onExportClick() {
    window.Intercom('trackEvent', 'on_export_click');
    mixpanel.track('on_export_click');
    this.fetchOperations(this.props, 'all')
    .then(_ => exportOperations(this.props.contacts, this.props.fieldsmap, this.props.listData.name));
  }

  _onRemoveContacts() {
    const selected = this.state.selected;
    if (selected.length === 0) return;
    alertify.promisifyConfirm('Delete Contacts', `This action cannot be reversed. Are you sure you want to delete ${selected.length} contact(s).`)
    .then(
      _ => {
        const newListContacts = difference(this.props.listData.contacts, selected);

        // if deleted contact is the only one in a page then move page back
        const getTotal = (listLength, pageSize) => {
          let total = Math.floor(listLength / pageSize);
          if (listLength % pageSize !== 0) total += 1;
          if (pageSize === -1) total = 1;
          return total;
        };
        let currentPage = this.state.currentPage;
        let oldTotal = getTotal(this.props.listData.contacts.length, this.state.pageSize);
        let newTotal = getTotal(newListContacts.length, this.state.pageSize);
        if (currentPage > newTotal) currentPage = newTotal;

        // ListTable skips to top when deleting the bottom contacts of non-first pages
        // get rowPosition of smallest selected contact
        // or sorted
        const getContactListPosition = (id, list, pageSize) => {
          const pos = list.indexOf(id);
          return pos ? pos % pageSize : pos;
        };
        const ids = this.state.onSort ? this.state.sortedIds : this.props.listData.contacts;
        const minListPosition = Math.min(...selected.map(id => getContactListPosition(id, ids, this.state.pageSize)).filter(pos => pos));

        // backend requires deleteContacts first before patchList to prevent race condition
        this.setState({isDeleting: true, currentPage});
        this.props.deleteContacts(selected)
        .then(_ => this.props.patchList({
          listId: this.props.listId,
          contacts: newListContacts,
          name: this.props.listData.name,
        }))
        .then(_ => {
          // clean up contacts after list to prevent list rendering undefined contacts
          this.setState({isDeleting: false, scrollToRow: minListPosition === 0 ? 0 : minListPosition - 1});
        });

        if (this.state.onSort) {
          this.setState({sortedIds: difference(this.state.sortedIds, selected)});
        }
        this.setState({selected: []});
      },
      _ => {}
      );
  }

  _onSearch(searchValue) {
    const props = this.props;
    if (searchValue !== this.state.searchValue) {
      this.setState({searchValue});
    }
    window.Intercom('trackEvent', 'listtable_search');
    props.searchListContacts(props.listId, searchValue)
    .then(({searchContactMap, ids}) => {
      const existIds = ids.filter(id => props.listData.contacts.indexOf(id) !== -1);
      // find where first search result is in the list
      let scrollToFirstPosition = props.listData.contacts.indexOf(existIds[0]);
      let currentPage = this.state.currentPage;
      if (this.state.pageSize !== -1 && scrollToFirstPosition !== -1) {
        currentPage =  Math.floor(scrollToFirstPosition / this.state.pageSize) + 1;
        if (scrollToFirstPosition % this.state.pageSize === 0) currentPage -= 1;
      }
      if (currentPage <= 1) currentPage = 1;
      scrollToFirstPosition = this.state.pageSize === -1 ? scrollToFirstPosition : scrollToFirstPosition % this.state.pageSize;
      mixpanel.track('listtable_search', {num_results: existIds.length, list_size: props.listData.contacts.length});
      this.setState({
        isSearchOn: true,
        currentSearchIndex: 0,
        scrollToRow: scrollToFirstPosition,
        currentPage,
      });
    });
  }

  onSearchClick(e) {
    const searchValue = this.searchValue.getValue();
    if (!!searchValue === false) {
      this.props.router.push(`/tables/${this.props.listId}`);
      this.onSearchClearClick();
    } else if (this.state.isSearchOn && searchValue === this.state.searchValue && this.props.listData.searchResults.length > 0) {
      this.getNextSearchResult();
    } else {
      this.props.router.push(`/tables/${this.props.listId}?search=${searchValue}`);
      this.setState({searchValue});
    }
  }

  _onSearchClearClick() {
    this.props.router.push(`/tables/${this.props.listId}`);
    this.setState({
      searchValue: '',
      errorText: null,
      isSearchOn: false,
      currentSearchIndex: 0
    });
  }

  onSearchKeyDown(e) {
    if (e.key === 'Enter') {
      const searchValue = this.searchValue.getValue();
      this.props.router.push(`/tables/${this.props.listId}?search=${searchValue}`);
      this.setState({searchValue});
    }
  }

  _getNextSearchResult() {
    const currentSearchIndex = (this.state.currentSearchIndex + 1) % this.props.listData.searchResults.length;
    let scrollToRow;
    if (this.props.listData.searchResults.length > 0) {
      for (let i = 0; this.props.listData.contacts.length; i++) {
        if (this.props.listData.contacts[i] === this.props.listData.searchResults[currentSearchIndex]) {
          scrollToRow = i;
          break;
        }
      }
    }

    let currentPage = 1;
    if (this.state.pageSize !== -1) {
      currentPage =  Math.floor(scrollToRow / this.state.pageSize) + 1;
      if (scrollToRow % this.state.pageSize === 0) currentPage -= 1;
    }
    if (currentPage <= 1) currentPage = 1;
    scrollToRow = this.state.pageSize === -1 ? scrollToRow : scrollToRow % this.state.pageSize;
    this.setState({currentSearchIndex, scrollToRow, currentPage});
  }

  render() {
    const props = this.props;
    const state = this.state;

    let total = Math.floor(props.received.length / this.state.pageSize);
    if (props.received.length % this.state.pageSize !== 0) total += 1;
    let rowCount = this.state.currentPage < total ? this.state.pageSize : props.received.length % this.state.pageSize;
    if (rowCount === 0) rowCount = this.state.pageSize;
    if (state.pageSize === -1) rowCount = props.received.length;
    if (state.isDeleting) rowCount = 0;

    return (
      <div style={styles.container}>
        {
          props.firstTimeUser &&
          <Dialog open={state.firsttime} modal onRequestClose={_ => this.setState({firsttime: false})}>
            <p><span style={{fontWeight: 'bold'}}>Table</span> powers <span style={{fontWeight: 'bold'}}>List Feed</span>.</p>
            <p>It comes with default columns that connect social profiles to power different feeds and dynamic graphs.</p>
            <div className='horizontal-center' style={{margin: '10px 0'}}>
              <div style={{margin: '0 3px'}}>
                <RaisedButton label='Skip Tour' onClick={_ => {
                  this.setState({firsttime: false});
                  props.removeFirstTimeUser();
                }}/>
              </div>
              <div style={{margin: '0 3px'}}>
                <RaisedButton primary label='Start Tour' onClick={_ => {
                  this.setState({firsttime: false});
                  hopscotch.startTour(tour);
                }}/>
              </div>
            </div>
          </Dialog>
        }
        <EditContactDialog
        listId={props.listId}
        contactId={state.currentEditContactId}
        open={state.showContactEditPanel}
        onClose={_ => this.setState({showContactEditPanel: false})}
        />
        {this.showProfileTooltip &&
          <PanelOverlayHOC
          onMouseEnter={_ => {
            this.showProfileTooltip = true;
            this.onTooltipPanel = true;
          }}
          onMouseLeave={_ => {
            this.showProfileTooltip = false;
            this.onTooltipPanel = false;
            this.forceUpdate();
          }}
          profileX={state.profileX}
          profileY={state.profileY}
          contactId={state.profileContactId}
          listId={props.listId}
          />}
        <div style={{display: 'flex', justifyContent: 'space-between'}} >
          <Link style={{margin: '5px 15px'}} to={`/listfeeds/${props.listId}`}>
            <i className='fa fa-arrow-right' />
            <span className='text' style={{marginLeft: 10}} >List Feed</span>
          </Link>
        {(props.contactIsReceiving || props.listData === undefined) &&
          <div className='vertical-center' style={{padding: '5px 10px'}} >
            <span className='text' style={{color: grey500, margin: '0 10px'}} >Loading Contacts</span>
            <FontIcon className='fa fa-spin fa-spinner smalltext' color={grey500} />
          </div>}
        </div>
        <div className='vertical-center' style={{marginTop: 5, justifyContent: 'space-between', flexWrap: 'wrap'}}>
          <div style={{display: 'flex', flexDirection: 'column', marginLeft: 15}} >
            <span className='smalltext' style={{color: grey700}}>{props.listData.client}</span>
            <ControlledInput
            async
            disabled={props.listData.readonly}
            name={props.listData.name}
            onBlur={value => props.patchList({listId: props.listId, name: value})}
            />
          </div>
          <div className='vertical-center' style={{marginTop: 15}} >
            <PlainIconButton label='Email' className='fa fa-envelope' onClick={this.onShowEmailClick} disabled={state.isEmailPanelOpen || props.listData.readonly} />
            <PlainIconButton label='Export' className='fa fa-download' onClick={this.onExportClick} />
            <CopyToHOC listId={props.listId} selected={state.selected}>
            {({onRequestOpen}) => (
              <PlainIconButton
              id='copy_contacts_hop'
              label='Copy'
              className='fa fa-copy'
              onClick={onRequestOpen}
              />)}
            </CopyToHOC>
            <PlainIconButton
            id='add_remove_columns_hop'
            disabled={props.listData.readonly}
            label='Organize'
            className='fa fa-table'
            onClick={_ => this.setState({showColumnEditPanel: true})}
            />
            <ColumnEditPanel onRequestClose={_ => this.setState({showColumnEditPanel: false})} open={state.showColumnEditPanel} listId={props.listId} />
            <AddContactHOC contacts={props.contacts} listId={props.listId}>
            {({onRequestOpen}) => (
              <PlainIconButton
              label='Add'
              id='add_contact_hop'
              disabled={props.listData.readonly}
              className='fa fa-plus'
              onClick={onRequestOpen}
              />)}
            </AddContactHOC>
            <AddTagDialogHOC listId={props.listId}>
              {({onRequestOpen}) =>
              <PlainIconButton className='fa fa-tags' onClick={onRequestOpen} label='Tag' disabled={props.listData.readonly} />}
            </AddTagDialogHOC>
            <PlainIconButton
            label='Delete'
            className={state.isDeleting ? 'fa fa-spin fa-spinner' : 'fa fa-trash'}
            disabled={props.listData.readonly || state.selected.length === 0}
            onClick={this.onRemoveContacts}
            />
            <EditMultipleContactsHOC selected={state.selected} listId={props.listId}>
            {({onRequestOpen}) =>
              <PlainIconButton
              className='fa fa-edit'
              label='Edit'
              disabled={props.listData.readonly || state.selected.length < 2}
              onClick={_ => {
                if (state.selected.length === props.listData.contacts.length) this.fetchOperations(this.props, 'all');
                onRequestOpen();
              }}
              />}
            </EditMultipleContactsHOC>
          </div>
          <div className='vertical-center' style={{marginTop: 15}} >
            <TextField
            id='search-input'
            ref={ref => this.searchValue = ref}
            hintText='Search...'
            onKeyDown={this.onSearchKeyDown}
            floatingLabelText={state.isSearchOn && props.listData.searchResults ? `Found ${props.listData.searchResults.length} matches. ${props.listData.searchResults.length > 0 ? `Currently on ${state.currentSearchIndex+1}.` : ''}` : undefined}
            floatingLabelFixed={state.isSearchOn}
            defaultValue={props.searchQuery || ''}
            errorText={state.errorText}
            />
            <IconButton
            className='noprint'
            iconClassName='fa fa-search'
            tooltip='Search'
            tooltipPosition='bottom-center'
            style={{marginLeft: 5}}
            onClick={this.onSearchClick}
            />
          </div>
        {
          props.fieldsmap !== null &&
          <div className='vertical-center'>
            <ScatterPlotHOC selected={state.selected} defaultYFieldname='instagramlikes' defaultXFieldname='instagramfollowers' listId={props.listId} fieldsmap={props.fieldsmap}>
            {sc => (
              <AnalyzeSelectedInstagramHOC selected={state.selected} listId={props.listId}>
              {inst => (
               <AnalyzeSelectedTwitterHOC selected={state.selected} listId={props.listId}>
                {twt => (
                  <IconMenu
                  iconButtonElement={<PlainIconButton label='Analyze Selected' className='fa fa-line-chart' />}
                  anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                  targetOrigin={{horizontal: 'left', vertical: 'top'}}
                  >
                    <MenuItem
                    primaryText='Twitter Contacts'
                    leftIcon={<FontIcon className='fa fa-twitter'/>}
                    onClick={twt.onRequestOpen}
                    />
                    <MenuItem
                    primaryText='Instagram Contacts'
                    leftIcon={<FontIcon className='fa fa-instagram'/>}
                    onClick={inst.onRequestOpen}
                    />
                    <MenuItem
                    primaryText='Trendline'
                    leftIcon={<FontIcon className='fa fa-area-chart'/>}
                    onClick={sc.onRequestOpen}
                    disabled={state.selected.length === 0}
                    />
                  </IconMenu>)}
                </AnalyzeSelectedTwitterHOC>)}
              </AnalyzeSelectedInstagramHOC>)}
           </ScatterPlotHOC>
          </div>}
        </div>
      {!state.isEmailPanelOpen &&
        <Paper
        className='vertical-center pointer'
        zDepth={2}
        style={styles.emailPanelDragHandle}
        onClick={_ => !props.listData.readonly ? this.onShowEmailClick() : null}
        >
          <FontIcon color={grey400} hoverColor={grey500} className='fa fa-chevron-left' />
        </Paper>}
        <Drawer
        openSecondary
        docked={false}
        containerStyle={styles.drawer.container}
        overlayStyle={styles.drawer.overlay}
        width={800}
        open={state.isEmailPanelOpen}
        onRequestChange={isEmailPanelOpen => this.setState({isEmailPanelOpen})}
        >
        {state.initializeEmailPanel &&
          <EmailPanel
          width={800}
          selected={state.selected}
          fieldsmap={props.fieldsmap.filter(fieldObj => !fieldObj.hideCheckbox)}
          listId={props.listId}
          onClose={_ => this.setState({isEmailPanelOpen: false})}
          onReset={this.forceEmailPanelRemount}
          loadAllContacts={_ => this.fetchOperations(props, 'all')}
          />}
        </Drawer>
        <div className='vertical-center' style={{margin: '10px 0', justifyContent: 'space-between'}}>
          <Tags listId={props.listId} createLink={name => `/tags/${name}`} />
          <PaginateControls
          containerClassName='vertical-center'
          currentPage={state.currentPage}
          pageSize={state.pageSize}
          onPageSizeChange={pageSize => {
            if (pageSize === -1) this.fetchOperations(this.props, 'all');
            this.setState({pageSize, currentPage: 1});
          }} 
          listLength={!!props.listData.contacts ? props.listData.contacts.length : 0}
          onPrev={currentPage => this.setState({currentPage, scrollToRow: 0})}
          onNext={currentPage => {
            if (props.contacts.length < currentPage * state.pageSize) this.fetchOperations(this.props);
            this.setState({currentPage, scrollToRow: 0});
          }}
          />
        </div>
        <div>
          <div style={{borderBottom: `4px solid ${blue100}`, width: '100%'}} />
        {isEmpty(props.listData.contacts) &&
          <EmptyListStatement className='row horizontal-center vertical-center' style={{height: 400}} />}
        {!isEmpty(props.received) && !isEmpty(state.columnWidths) &&
          <ScrollSync>
          {({onScroll, scrollLeft}) =>
            <div>
              <div id='HeaderGridContainerId' className='HeaderGridContainer'>
                <Grid
                ref={ref => this.setHeaderGridRef(ref)}
                className='HeaderGrid'
                cellRenderer={this.headerRenderer}
                columnCount={props.fieldsmap.length}
                columnWidth={args => this.getColumnWidth(args) || 70}
                height={45}
                autoContainerWidth
                width={state.screenWidth}
                rowCount={1}
                rowHeight={32}
                scrollLeft={scrollLeft}
                overscanColumnCount={3}
                />
              </div>
            {state.isDeleting &&
              <div style={{backgroundColor: grey50, display: 'flex', alignItems: 'stretch', justifyContent: 'center', height: '100%'}} >
                <span className='text' style={{color: grey500}} >Deleting Contact(s)...</span> 
              </div>}
              <Grid
              ref={ref => this.setDataGridRef(ref)}
              className='BodyGrid'
              cellRenderer={this.cellRenderer}
              columnCount={props.fieldsmap.length}
              columnWidth={args => this.getColumnWidth(args) || 70}
              overscanRowCount={10}
              height={state.leftoverHeight || 500}
              width={state.screenWidth}
              rowCount={rowCount}
              rowHeight={30}
              onScroll={onScroll}
              scrollToRow={state.scrollToRow}
              />
            </div>}
          </ScrollSync>}
        </div>
      </div>);
  }
}

const styles = {
  drawer: {
    container: {zIndex: 400, backgroundColor: '#ffffff'},
    overlay: {zIndex: 300}
  },
  container: {marginTop: 10},
  emailPanelDragHandle: {
    zIndex: 400,
    position: 'fixed',
    right: 0,
    top: '35%',
    height: '15%',
    padding: '0 5px',
    backgroundColor: grey50
  },
  nameBlock: {
    parent: {
      marginTop: 40,
    },
  },
  loading: {
    zIndex: 200,
    top: 80,
    right: 10,
    position: 'fixed'
  },
  profileIcon: {fontSize: '0.9em', padding: '0 1px', margin: '0 5px'},
};

const mapStateToProps = (state, props) => {
  const listId = props.listId;
  const listData = state.listReducer[listId];
  const publicationReducer = state.publicationReducer;
  const searchQuery = props.location.query.search;

  // if one contact is loaded before others, but also indexes lastFetchedIndex for lazy-loading
  let received = [];
  let contacts = [];

  if (!isEmpty(listData.contacts)) {
    listData.contacts.map((contactId, i) => {
      if (state.contactReducer[contactId]) {
        let contact = state.contactReducer[contactId];
        if (searchQuery && listData.searchResults && listData.searchResults.filter(id => contactId === id).length > 0) {
          contact.isSearchResult = true;
        } else {
          contact.isSearchResult = false;
        }
        received.push(contactId);
        contacts.push(contact);
      }
    });
  }

  const rawFieldsmap = generateTableFieldsmap(listData);

  const querySelected = props.location.query.selected ? props.location.query.selected.split(',') : undefined;

  return {
    received,
    searchQuery,
    listId,
    listIsReceiving: state.listReducer.isReceiving,
    listData,
    fieldsmap: rawFieldsmap.filter(fieldObj => !fieldObj.hidden && !fieldObj.internal),
    rawFieldsmap,
    contacts,
    contactIsReceiving: state.contactReducer.isReceiving,
    publicationReducer,
    person: state.personReducer.person,
    firstTimeUser: state.personReducer.firstTimeUser,
    contactReducer: state.contactReducer,
    listDidInvalidate: state.listReducer.didInvalidate,
    querySelected
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    searchListContacts: (listId, query) => dispatch(contactActions.searchListContacts(listId, query)),
    patchList: listObj => dispatch(listActions.patchList(listObj)),
    patchContacts: contacts => dispatch(contactActions.patchContacts(contacts)),
    addContacts: contacts => dispatch(contactActions.addContacts(contacts)),
    createPublication: name => dispatch(publicationActions.createPublication(name)),
    updateOutdatedContacts: contactId => dispatch(contactActions.updateContact(contactId)),
    fetchList: listId => dispatch(listActions.fetchList(listId)),
    fetchContacts: listId => dispatch(contactActions.fetchContacts(listId)),
    searchPublications: query => dispatch(publicationActions.searchPublications(query)),
    clearSearchCache: listId => dispatch({type: 'CLEAR_LIST_SEARCH', listId}),
    deleteContacts: ids => dispatch(contactActions.deleteContacts(ids)),
    loadAllContacts: listId => dispatch(contactActions.loadAllContacts(listId)),
    removeFirstTimeUser: _ => dispatch(loginActions.removeFirstTimeUser()),
    fetchManyContacts: (listId, amount) => dispatch(contactActions.fetchManyContacts(listId, amount)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ListTable));
