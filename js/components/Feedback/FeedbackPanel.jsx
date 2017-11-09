import React, {Component} from 'react';
import {connect} from 'react-redux';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
// import Textarea from 'react-textarea-autosize';
import TextareaAutosize from 'react-autosize-textarea';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import {actions as loginActions} from 'components/Login';
import {blue50} from 'material-ui/styles/colors';

const thankyouString = 'Feedback submitted.\n\nThank you. Your feedback is very much appreciated.';

class Feedback extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '-------- n/a --------',
      text: ''
    };
    this.handleChange = (event, index, value) => this.setState({value});
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div>
        {props.feedback ?
          <div className='vertical-center horizontal-center' style={{margin: '0 40px', backgroundColor: blue50, borderRadius: '1.1em', padding: 15}}>
            <span style={{fontSize: '1.3em'}}>{thankyouString}</span>
          </div> :
          <div style={{margin: '0 20px', padding: 15, backgroundColor: blue50, borderRadius: '1.1em'}}>
            <div style={{margin: 20}}>
              <div className='vertical-center'>
                <span style={{marginRight: 10}}>Select a Reason below:</span>
                <DropDownMenu value={state.value} onChange={this.handleChange}>
                  <MenuItem value='-------- n/a --------' primaryText='-------- n/a --------'/>
                  <MenuItem value='Too expensive' primaryText='Too expensive'/>
                  <MenuItem value='Found better solution' primaryText='Found better solution'/>
                  <MenuItem value='Lacks features' primaryText='Lacks features'/>
                  <MenuItem value='Usability issues' primaryText='Usability issues'/>
                  <MenuItem value='Bad customer service' primaryText='Bad customer service'/>
                </DropDownMenu>
              </div>
            </div>
            <div style={{margin: 20}}>
              <div style={{margin: '5px 0'}} className='vertical-center'>
                <span>Feedback:</span>
              </div>
              <div className='vertical-center'>
                <TextareaAutosize
                style={{minHeight: 30}}
                placeholder='What did you liked or disliked about your experience? Leave us a note here.'
                maxRows={5}
                value={state.text}
                onChange={e => this.setState({text: e.target.value})}
                />
              </div>
              <div className='horizontal-center' style={{marginTop: 20}}>
                <RaisedButton label='Submit Feedback' onClick={_ => props.postFeedback(state.reason, state.feedback)}/>
              </div>
            </div>
          </div>}
      </div>);
  }
}

const FeedbackPanel = props => {
  if (props.didInvalidate) {
    return (
      <div className='vertical-center horizontal-center' style={{margin: '0 40px', backgroundColor: blue50, borderRadius: '1.1em', padding: 15}}>
        <span style={{fontSize: '1.3em'}}>Feedback submission failed. Try again later or shoot us an email at feedback@newsai.co.</span>
      </div>);
  }
  return props.isReceiving ?
    <div className='vertical-center horizontal-center' style={{margin: '0 40px'}}>
      <FontIcon className='fa fa-spinner fa-spin fa-3x'/>
    </div> :
    <Feedback {...props}/>;
};

const mapStateToProps = (state, props) => {
  return {
    feedback: state.personReducer.feedback,
    isReceiving: state.personReducer.feedbackIsReceiving,
    didInvalidate: state.personReducer.feedbackDidInvalidate,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    postFeedback: (reason, feedback) => dispatch(loginActions.postFeedback(reason, feedback))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackPanel);
