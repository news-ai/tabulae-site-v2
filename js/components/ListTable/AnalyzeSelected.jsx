import React, {Component} from 'react';

import Waiting from '../Waiting';
import EmptySelected from './EmptySelected.jsx';
import Dialog from 'material-ui/Dialog';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import {XAxis, YAxis, CartesianGrid, Line, Tooltip, LineChart} from 'recharts';
import * as c from 'material-ui/styles/colors';

const colors = [
  c.red300, c.blue300, c.purple300, c.cyan300, c.green300, c.indigo300, c.orange300,
  c.red400, c.blue400, c.purple400, c.cyan400, c.green400, c.indigo400, c.orange400,
  c.red500, c.blue500, c.purple500, c.cyan500, c.green500, c.indigo500, c.orange500,
  c.red600, c.blue600, c.purple600, c.cyan600, c.green600, c.indigo600, c.orange600,
  c.red700, c.blue700, c.purple700, c.cyan700, c.green700, c.indigo700, c.orange700,
  c.red800, c.blue800, c.purple800, c.cyan800, c.green800, c.indigo800, c.orange800,
];

const SELECT_THRESHOLD = 10;

function divide(numerator, denomenator, fixedTo) {
  if (numerator === undefined || denomenator === undefined) return undefined;
  const res = Math.round(numerator * (1 / fixedTo) / denomenator) / (1 / fixedTo);
  if (!isNaN(res)) return res;
}

const GraphSeriesItem = props => {
  let data = props.dataMap[props.dataKey];
  if (props.averageBySelected && props.averageBySelected !== null) {
    data = data.map((oldDataObj, i) => {
      let dataObj = Object.assign({}, oldDataObj);
      props.handles.map(handle => (
        dataObj[handle] = divide(dataObj[handle], props.dataMap[props.averageBySelected][i][handle], 0.001)
      ));
      return dataObj;
    });
  }

  return (
    <div className='row'>
      <div className='large-6 medium-12 small-12 columns'>
        <div className='row'>
          <h5>{props.dataKey}</h5>
        </div>
        <div className='row'>
          <LineChart
          width={720}
          height={250}
          data={data}
          margin={{top: 5, right: 40, left: 20, bottom: 5}}>
            <XAxis dataKey='dateString'/>
            <YAxis/>
            <CartesianGrid strokeDasharray='3 3'/>
            <Tooltip/>
            {props.handles.map((handle, index) => (
              <Line key={`${props.dataKey}-${props.passdownkey}-${index}`} type='monotone' dataKey={handle} stroke={index - 1 > colors.length ? colors[index % colors.length] : colors[index]} activeDot={{r: 8}}/>
              ))}
          </LineChart>
        </div>
      </div>
    </div>);
};

class AnalyzeSelected extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      value: [],
      averageBySelected: null
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.open && this.state.open) {
      if (this.props.selected.length > 0 && this.props.selected.length < SELECT_THRESHOLD) this.props.fetchData(this.props.selected);
    }
  }

  render() {
    const state = this.state;
    const props = this.props;
    return (
      <div>
        <Dialog
        title='Analyze Selected'
        open={state.open}
        modal
        actions={[<FlatButton label='Close' onClick={_ => this.setState({open: false})}/>]}
        autoScrollBodyContent
        onRequestClose={_ => this.setState({open: false})}
        >
          <Waiting isReceiving={props.isReceiving}/>
          <EmptySelected {...props}/>
          {props.selected.length > SELECT_THRESHOLD &&
            <div>
              <span>You selected {props.selected.length} contacts, which makes the graph data points. Please select less than {SELECT_THRESHOLD} contacts.</span>
            </div>
          }
          {props.averageBy && state.open && props.selected.length > 0 && props.selected.length <= SELECT_THRESHOLD &&
            <div style={{margin: '20px 0'}}>
              <span>Average By: </span>
              <DropDownMenu value={state.averageBySelected} onChange={(e, index, val) => this.setState({averageBySelected: val})}>
              {[<MenuItem key={-1} value={null} primaryText='None' />,
                ...props.averageBy.map((dataKey, i) => <MenuItem key={i} value={dataKey} primaryText={dataKey}/>)
                ]}
              </DropDownMenu>
            </div>
          }
          {props.selected.length > 0 &&
            state.open &&
            !props.isReceiving &&
            props.dataKeys.map((dataKey, i) => {
              if (state.averageBySelected && state.averageBySelected !== null && state.averageBySelected === dataKey) return null;
              return (
              <GraphSeriesItem key={`wrapper-graph-${i}`} averageBySelected={state.averageBySelected} dataKey={dataKey} {...props}/>
              );
            })}
        </Dialog>
        {props.children({
          onRequestOpen: _ => this.setState({open: true})
        })}
      </div>);
  }
}

export default AnalyzeSelected;
