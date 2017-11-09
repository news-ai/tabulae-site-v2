import React, {Component} from 'react';
import {XAxis, YAxis, CartesianGrid, Legend, Line, Tooltip, LineChart} from 'recharts';
import {red300, blue300, purple300, cyan300, green300, indigo300, orange300} from 'material-ui/styles/colors';

const colors = [red300, blue300, purple300, cyan300, green300, indigo300, orange300];

class LineGraph extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <LineChart
      width={550}
      height={300}
      data={props.data}
      margin={{top: 5, right: 40, left: 20, bottom: 5}}>
        <XAxis dataKey='datestring'/>
        <YAxis/>
        <CartesianGrid strokeDasharray='3 3'/>
        <Tooltip/>
        <Legend />
        {props.dataKeys.map((dataKey, i) => (
          <Line key={i} type='monotone' dataKey={dataKey} stroke={colors[i]} activeDot={{r: 8}}/>
          ))}
      </LineChart>
      );
  }
}

export default LineGraph;
