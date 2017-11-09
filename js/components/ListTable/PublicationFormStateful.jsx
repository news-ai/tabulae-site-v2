import React, {Component} from 'react';
import {connect} from 'react-redux';
import {actions as publicationActions} from 'components/Publications';
import TextField from 'material-ui/TextField';
import {blue50, blue800, grey700} from 'material-ui/styles/colors';
import isURL from 'validator/lib/isURL';
import ValidationHOC from 'components/ValidationHOC';
import IconButton from 'material-ui/IconButton';

class PublicationFormStateful extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      url: '',
    };
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
          fontSize: '0.7em',
          color: grey700,
          position: 'absolute',
          margin: 5
        }}>CLOSE</span>
        <div className='vertical-center' style={{marginTop: 5}} >
          <TextField
          hintStyle={{color: blue800}}
          underlineStyle={{color: blue800}}
          underlineFocusStyle={{color: blue800}}
          floatingLabelFocusStyle={{color: blue800}}
          hintText='Publication Name'
          floatingLabelText='Publication Name'
          value={state.name}
          onChange={e => this.setState({name: e.target.value})}
          />
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
            value={state.url}
            onChange={e => {
              // for validation
              onValueChange(e.target.value);
              // for updating value
              this.setState({url: e.target.value});
            }}
            />)}
          </ValidationHOC>
        </div>
        <div className='vertical-center' style={{margin: 10}}>
          <IconButton
          disabled={state.name.length === 0 || !isURL(state.url)}
          tooltip='Add Publication'
          iconClassName='fa fa-arrow-right'
          style={{
            right: 5,
            fontSize: '0.9em',
            color: grey700,
            position: 'absolute'
          }}
          onClick={_ => {
            props.createPublication({name: state.name, url: state.url})
            .then(response => {
              props.bubbleUpValue(response.data);
              props.onHide();
            });
          }}
          />
        </div>
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  return {};
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    createPublication: pubObj => dispatch(publicationActions.createPublication(pubObj))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PublicationFormStateful);
