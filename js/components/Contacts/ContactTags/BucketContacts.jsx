import React, {Component} from 'react';
import BucketContactItemContainer from './BucketContactItemContainer.jsx';

class BucketContacts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentlyShowing: this.props.contacts.length > 0 ? this.props.contacts[0].id : undefined,
    };
    this.onSwitch = contactId => {
      this.props.onSwitchingContact(this.state.currentlyShowing, contactId);
      this.setState({currentlyShowing: contactId});
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.contacts.length !== nextProps.contacts.length && nextProps.contacts.length > 0) {
      this.setState({currentlyShowing: nextProps.contacts[0].id});
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    // console.log(props.contacts);
    // console.log(state.currentlyShowing);

    return props.contacts.length > 0 ? (
      <div style={styles.container}>
        {props.contacts.map((contact, i) =>
          <BucketContactItemContainer
          key={`bucket-${i}`}
          selected={props.selected}
          onSelect={this.props.onSelect}
          currentlyShowing={state.currentlyShowing}
          onSwitch={this.onSwitch}
          {...contact}
          />
          )}
      </div>
      ) : null;
  }
}

const styles = {
  container: {margin: '15px 5px'}
};

export default BucketContacts;
