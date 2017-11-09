import React, {Component} from 'react';
import TextField from 'material-ui/TextField';
import {blue50, blue800, grey700} from 'material-ui/styles/colors';
import isURL from 'validator/lib/isURL';
import ValidationHOC from 'components/ValidationHOC';

class PublicationForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div style={{padding: 10, margin: 5, backgroundColor: blue50, position: 'relative'}}>
        <span
        className='pointer right'
        onClick={props.onHide}
        style={{
          right: 5,
          fontSize: '0.9em',
          color: grey700,
          position: 'absolute'
        }}>Close</span>
        <div className='vertical-center'>
          <span style={{fontSize: '1.1em'}}>Publication Form</span>
        </div>
        <div className='vertical-center'>
          <TextField
          hintStyle={{color: blue800}}
          underlineStyle={{color: blue800}}
          underlineFocusStyle={{color: blue800}}
          floatingLabelFocusStyle={{color: blue800}}
          hintText='Publication Name'
          floatingLabelText='Publication Name'
          value={props.publicationObj.name}
          onChange={e => props.onValueChange(e.target.value, 'name')}
          />
        </div>
        <div className='vertical-center'>
          <ValidationHOC rules={[{validator: isURL, errorMessage: 'Not a valid url.'}]}>
          {({onValueChange, errorMessage}) => (
            <TextField
            hintStyle={{color: blue800}}
            underlineStyle={{color: blue800}}
            underlineFocusStyle={{color: blue800}}
            floatingLabelFocusStyle={{color: blue800}}
            errorText={errorMessage}
            hintText='Website Link'
            floatingLabelText='Website Link'
            value={props.publicationObj.url}
            onChange={e => {
              // for validation
              onValueChange(e.target.value);
              // for updating value
              props.onValueChange(e.target.value, 'url');
            }}
            />)}
          </ValidationHOC>
        </div>
      </div>
    );
  }
}

export default PublicationForm;
