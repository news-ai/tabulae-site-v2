import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as actions from './actions';
import * as twitterDataActions from '../../SocialDataGraphs/Twitter/actions';
import SocialDataGraph from '../../SocialDataGraphs/SocialDataGraph.jsx';

import Chip from 'material-ui/Chip';
import {lightBlue100} from 'material-ui/styles/colors';

import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';

const graphParams = {
  Likes: true,
  Posts: false,
  Followers: false,
  Following: false,
  Retweets: true,
};

const graphDataKeys = ['Likes', 'Posts', 'Followers', 'Following', 'Retweets'];
const graphAverageKeys = ['Posts', 'Followers'];

class TwitterProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  componentWillMount() {
    if (!this.props.graphdata) this.props.fetchGraphData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.open === false && this.state.open === true) {
      // onRequestOpen hit
      window.Intercom('trackEvent', 'check_twitter_stats');
      mixpanel.track('check_twitter_stats');
      if (!this.props.profile) this.props.fetchTwitter();
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    const profile = props.profile;
    return (
      <div>
        <Dialog autoScrollBodyContent open={state.open} title='Twitter Profile' onRequestClose={_ => this.setState({open: false})}>
          {props.isReceiving && <FontIcon className={'fa fa-spinner fa-spin'} />}
          {props.profile &&
            <div className='row' style={{marginTop: 15}}>
              <div className='large-3 medium-4 small-12 columns'>
                <div className='horizontal-center'><img src={profile.profile_image_url} /></div>
                <div className='horizontal-center'><a href={`https://twitter.com/${profile.Username}`} target='_blank'><span>{profile.Username}</span></a></div>
                <div className='horizontal-center'><span>{profile.name}</span></div>
                <div className='horizontal-center'>{profile.verified && <Chip style={{margin: 10}} backgroundColor={lightBlue100}>Verified</Chip>}</div>
              </div>
              <div className='large-9 medium-8 small-12 columns'>
                <div>
                  <div><span className='text'>Favorites: </span><span>{profile.favourites_count}</span></div>
                  <div><span className='text'>Followers: </span><span>{profile.followers_count}</span></div>
                  <div><span className='text'>Following: </span><span>{profile.friends_count}</span></div>
                  <div><span className='text'>Location: </span><span>{profile.location}</span></div>
                </div>
                <div style={{margin: 10}}>
                  <span>{profile.description}</span>
                </div>
              </div>
            </div>}
          {props.graphdata &&
            <SocialDataGraph
            data={props.graphdata.received}
            title='Twitter'
            dataKeys={graphDataKeys}
            params={graphParams}
            averageBy={graphAverageKeys}
            />}
        {props.graphdata && props.graphdata.offset !== null &&
          <RaisedButton label='Load More' onClick={props.fetchGraphData}/>}
        </Dialog>
        {props.children({onRequestOpen: _ => this.setState({open: true})})}
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    profile: state.twitterProfileReducer[props.contactId],
    isReceiving: state.twitterProfileReducer.isReceiving,
    graphdata: state.twitterDataReducer[props.contactId],
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchTwitter: _ => dispatch(actions.fetchTwitterProfile(props.contactId)),
    fetchGraphData: _ => dispatch(twitterDataActions.fetchContactTwitterData(props.contactId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TwitterProfile);
