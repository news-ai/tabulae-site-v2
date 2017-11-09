import React, {Component} from 'react';
import {connect} from 'react-redux';
import withRouter from 'react-router/lib/withRouter';
import Waiting from '../Waiting';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Chip from 'material-ui/Chip';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import EmptySelected from './EmptySelected.jsx';
import * as c from 'material-ui/styles/colors';
import regression from 'regression';
import {_getter, divide, isNumber} from './helpers';
import find from 'lodash/find';

const colors = [
  c.red300, c.blue300, c.purple300, c.cyan300, c.green300, c.indigo300, c.orange300,
  c.red400, c.blue400, c.purple400, c.cyan400, c.green400, c.indigo400, c.orange400,
  c.red500, c.blue500, c.purple500, c.cyan500, c.green500, c.indigo500, c.orange500,
  c.red600, c.blue600, c.purple600, c.cyan600, c.green600, c.indigo600, c.orange600,
  c.red700, c.blue700, c.purple700, c.cyan700, c.green700, c.indigo700, c.orange700,
  c.red800, c.blue800, c.purple800, c.cyan800, c.green800, c.indigo800, c.orange800,
];

class ScatterPlotHOC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      value: [],
      averageBySelected: null,
      data: null,
      dataArray: [],
      regressionData: [],
      labels: [],
      xfieldname: this.props.defaultXFieldname,
      yfieldname: this.props.defaultYFieldname
    };
    this.getRegression = this._getRegression.bind(this);
    this.setData = this._setData.bind(this);
  }

  componentWillReceiveProps(nextProps) {
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.open === true && prevState.open === false) {
      if (this.props.contacts.length > 0) this.setData();
    }
    if (this.state.xfieldname !== prevState.xfieldname || this.state.yfieldname !== prevState.yfieldname) {
      if (this.props.contacts.length > 0) this.setData();
    }
  }

  _setData() {
    const xfieldObj = find(this.props.fieldsmap, fieldObj => fieldObj.value === this.state.xfieldname);
    const yfieldObj = find(this.props.fieldsmap, fieldObj => fieldObj.value === this.state.yfieldname);
    if (!xfieldObj || !yfieldObj) return;
    const data = this.props.contacts
    .map(contactObj => {
      let obj = {};
      obj.x = parseFloat(_getter(contactObj, xfieldObj));
      obj.y = parseFloat(_getter(contactObj, yfieldObj));
      obj.username = contactObj.instagram;
      obj.id = contactObj.id;
      return obj;
    }).filter(obj => obj.x && obj.y);
    this.setState({data}, _ => this.getRegression());
  }

  _getRegression() {
    if (this.state.data === null || this.state.data.length === 0) return;
    const dataArray = this.state.data.map(obj => [obj.x, obj.y]);
    const result = regression('linear', dataArray);
    const m = result.equation[0];
    const cc = result.equation[1];
    let min = this.state.data[0].x;
    let max = this.state.data[0].x;
    let objX, objY, tempY;
    let above = [];
    let below = [];
    for (let i = 0; i < this.state.data.length; i++) {
      objX = this.state.data[i].x;
      objY = this.state.data[i].y;
      tempY = m * objX + cc;
      if (objY >= tempY) above.push(Object.assign({}, this.state.data[i]));
      else below.push(Object.assign({}, this.state.data[i]));
      if (objX < min) min = objX;
      if (objX > max) max = objX;
    }

    this.setState({
      above,
      below,
      regressionData: [
        {y: m * min + cc, x: min},
        {y: m * max + cc, x: max}
      ]});
  }

  render() {
    const state = this.state;
    const props = this.props;

    return (
      <div>
        <Dialog
        title='Trendline'
        open={state.open}
        modal
        actions={[<FlatButton label='Close' onClick={_ => this.setState({open: false})}/>]}
        autoScrollBodyContent
        onRequestClose={_ => this.setState({open: false})}
        >
          <Waiting isReceiving={props.isReceiving}/>
          <EmptySelected {...props}/>
          {state.open && state.data && props.selected.length > 0 &&
              <ScatterChart data={state.data} width={700} height={400} margin={{top: 20, right: 20, bottom: 20, left: 20}}>
                <XAxis dataKey={'x'} name={state.xfieldname}/>
                <YAxis dataKey={'y'} name={state.yfieldname}/>
                <ZAxis dataKey={'username'} name='username'/>
                <Scatter data={state.data} fill={colors[0]}/>
                <Scatter data={state.regressionData} line fill={colors[1]}/>
                <CartesianGrid/>
                <Tooltip cursor={{strokeDasharray: '3 3'}}/>
              </ScatterChart>
            }
            <div className='row vertical-center'>
                <span>X-Axis</span>
                <DropDownMenu value={state.xfieldname} onChange={(e, index, xfieldname) => this.setState({xfieldname})}>
                {
                  props.fieldsmap
                  .filter(fieldObj => isNumber(_getter(props.contacts[0], fieldObj)))
                  .map((fieldObj, i) => <MenuItem key={`xfield-${i}`} value={fieldObj.value} primaryText={fieldObj.name}/>)
                }
                </DropDownMenu>
            </div>
            <div className='row vertical-center'>
              <span>Y-Axis</span>
              <DropDownMenu value={state.yfieldname} onChange={(e, index, yfieldname) => this.setState({yfieldname})}>
                {
                  props.fieldsmap
                  .filter(fieldObj => isNumber(_getter(props.contacts[0], fieldObj)))
                  .map((fieldObj, i) => <MenuItem key={`xfield-${i}`} value={fieldObj.value} primaryText={fieldObj.name}/>)
                }
              </DropDownMenu>
            </div>
            <div className='row' style={{margin: '15px 0'}}>
              <div>
                <span><span style={{color: c.blue500}}>Blue</span> are contacts above the line. <span style={{color: c.red500}}>Red</span> are contacts below the line.</span>
              </div>
              {state.above && state.above.map(obj =>
                <Chip
                style={{margin: 2}}
                backgroundColor={c.blue200}
                key={`chip-${obj.id}`}
                onClick={_ => props.router.push(`/tables/${props.listId}/${obj.id}`)}>
                {obj.username}
                </Chip>)}
              {state.below && state.below.map(obj =>
                <Chip
                style={{margin: 2}}
                backgroundColor={c.red200}
                key={`chip-${obj.id}`}
                onClick={_ => props.router.push(`/tables/${props.listId}/${obj.id}`)}>
                {obj.username}
                </Chip>)}
            </div>
        </Dialog>
        {props.children({
          onRequestOpen: _ => this.setState({open: true})
        })}
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  return {
    contacts: props.selected.map(id => state.contactReducer[id]).filter(contact => contact && contact.instagram !== null)
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ScatterPlotHOC));
