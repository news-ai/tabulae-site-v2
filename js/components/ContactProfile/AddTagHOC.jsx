import React, {Component} from 'react';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {WithContext as ReactTags} from 'react-tag-input';
import {actions as contactActions} from 'components/Contacts';

class AddTagHOC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      tags: [],
    };
    this.onRequestOpen = _ => this.setState({open: true});
    this.onRequestClose = _ => this.setState({open: false});

    this.handleAddition = this._handleAddition.bind(this);
    this.handleDelete = this._handleDelete.bind(this);
    this.handleDrag = this._handleDrag.bind(this);
    this.onSubmit = this._onSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.tags !== nextProps.tags) {
      this.setState({
        tags: nextProps.tags === null ? [] : nextProps.tags.map((tag, i) => ({id: i, text: tag})),
      });
    }
  }

  _handleDelete(i) {
    this.setState({
      tags: this.state.tags.filter((tag, index) => index !== i)
    });
  }

  _handleAddition(tag) {
    if (this.state.tags.some(cTag => cTag.text === tag)) return;
    this.setState({
      tags: [
        ...this.state.tags,
        {
          id: this.state.tags.length + 1,
          text: tag
        }
      ]
    });
  }

  _handleDrag(tag, currPos, newPos) {
    const tags = [ ...this.state.tags ];

    // mutate array
    tags.splice(currPos, 1);
    tags.splice(newPos, 0, tag);

    // re-render
    this.setState({tags});
  }

  _onSubmit() {
    const tags = this.state.tags.map(tag => tag.text);
    window.Intercom('trackEvent', 'add_contact_tag', {tags: JSON.stringify(tags)});
    mixpanel.track('add_contact_tag', {tags: JSON.stringify(tags)});
    this.props.submitTags(tags).then(_ => this.setState({open: false}));
  }

  render() {
    const props = this.props;
    const state = this.state;

    const actions = [
      <FlatButton
      label='Cancel'
      onClick={this.onRequestClose}
      />,
      <FlatButton
      label='Submit'
      primary
      keyboardFocused
      onClick={this.onSubmit}
    />,
    ];
    return (
      <div>
        <Dialog actions={actions} open={state.open} title='Add Tag' modal onRequestClose={this.onRequestClose}>
          <ReactTags
          tags={state.tags}
          placeholder='Hit Enter after input'
          handleDelete={this.handleDelete}
          handleAddition={this.handleAddition}
          handleDrag={this.handleDrag}
          />
        </Dialog>
        {props.children({onRequestOpen: this.onRequestOpen})}
      </div>);
  }
}


const mapStateToProps = (state, props) => {
  const contact = state.contactReducer[props.contactId];
  return {
    tags: contact.tags
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    submitTags: tags => dispatch(contactActions.patchContact(props.contactId, {tags})),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddTagHOC);
