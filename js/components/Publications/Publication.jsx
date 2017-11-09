import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as publicationActions from './actions';
import * as actions from './DatabaseProfile/actions';
import isURL from 'validator/lib/isURL';
import {blue700, grey400} from 'material-ui/styles/colors';
import Waiting from 'components/Waiting';
import Organization from './Organization.jsx';
import Keywords from './Keywords.jsx';
import SocialProfiles from './SocialProfiles.jsx';

import alertify from 'alertifyjs';


const styles = {
  largeFont: {fontSize: '2em'},
  container: {marginTop: 40},
  text: {color: grey400, fontSize: '0.9em', marginRight: 5},
  emptyText: {marginRight: 5},
  emptyContainer: {margin: '20px 0'},
  promptFont: {color: blue700},
};

const Profile = ({organization, logo, socialProfiles}) => {
  return (
    <div className='row' style={{margin: '10px 0'}}>
      {organization &&
        <div className='large-6 medium-6 small-12 columns'>
          <Organization logo={logo} {...organization}/>
        </div>}
      {socialProfiles &&
        <div className='large-6 medium-6 small-12 columns'>
          <SocialProfiles socialProfiles={socialProfiles}/>
          {organization && organization.keywords &&
          <Keywords {...organization}/>}
        </div>}
    </div>
    );
};

const Publication = props => {
  const {publication, profile, patchPublication} = props;
  return (
    <div className='row' style={styles.container}>
      <div className='large-12 medium-12 small-12 columns'>
        <span style={styles.largeFont}>{publication.name}</span>
      </div>
    {publication.url &&
      <div className='large-12 medium-12 small-12 columns'>
        <a href={publication.url} target='_blank'>
          <span style={styles.text}>{publication.url} <i className='fa fa-external-link'/></span>
        </a>
      </div>}
    {!publication.url &&
      <div className='large-12 medium-12 small-12 columns' style={styles.emptyContainer}>
        <span style={styles.emptyText}>
        No website filled in for this publication.
        We pull in information about this publication based on the website url.
        </span>
        <span
        onClick={() => {
          alertify.prompt(
            'Enter website URL',
            'https://',
            (e, url) => isURL(url) && patchPublication(Object.assign({}, publication, {url})),
            e => console.log('input cancelled')
            );
        }} className='pointer' style={styles.promptFont}>Fill one in now?</span>
      </div>}
    {profile &&
      <Profile {...profile}/>}
    </div>
    );
};

class PublicationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    if (!this.props.publication) {
      this.props.fetchPublication()
      .then(_ => this.props.fetchDatabaseProfile());
    } else {
      this.props.fetchDatabaseProfile();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.publication && !this.props.publication.url && nextProps.publication.url) {
      // user just adde URL for a publication
      this.props.fetchDatabaseProfile();
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (props.isReceiving || !props.publication) ?
    <Waiting style={{margin: 40}} isReceiving={props.isReceiving} text='Loading...'/> :
    <Publication {...props}/>;
  }
}

const mapStateToProps = (state, props) => {
  const publicationId = parseInt(props.params.publicationId, 10);
  return {
    publicationId,
    publication: state.publicationReducer[publicationId],
    profile: state.publicationProfileReducer[publicationId],
    isReceiving: state.publicationReducer.isReceiving || state.publicationProfileReducer.isReceiving
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const publicationId = parseInt(props.params.publicationId, 10);
  return {
    fetchPublication: _ => dispatch(publicationActions.fetchPublication(publicationId)),
    patchPublication: publicationBody => dispatch(publicationActions.patchPublication(publicationId, publicationBody)),
    fetchDatabaseProfile: _ => dispatch(actions.fetchDatabaseProfile(publicationId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PublicationContainer);
