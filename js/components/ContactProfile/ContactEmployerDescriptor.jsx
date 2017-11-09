import React, {Component} from 'react';
import {connect} from 'react-redux';
import Chip from 'material-ui/Chip';
import {actions as contactActions} from 'components/Contacts';
import withRouter from 'react-router/lib/withRouter';

class ContactEmployerDescriptor extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const props = this.props;
    const contactEmployers = props.contact[props.which].filter(id => id !== props.employer.id);
    let contactBody = {};
    contactBody[props.which] = contactEmployers;
    return (
      <div className={props.className} style={props.style}>
        <Chip
        onClick={e => props.router.push(`/publications/${props.employer.id}`)}
        onRequestDelete={_ => !props.contact.readonly && props.patchContact(props.contact.id, contactBody)}
        >
        {props.employer.name}
        </Chip>
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    patchContact: (contactId, body) => dispatch(contactActions.patchContact(contactId, body)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ContactEmployerDescriptor));
