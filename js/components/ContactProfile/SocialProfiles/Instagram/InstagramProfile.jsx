import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as actions from './actions';
import * as instagramDataActions from '../../SocialDataGraphs/Instagram/actions';
import SocialDataGraph from '../../SocialDataGraphs/SocialDataGraph.jsx';

import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';

const graphParams = {
  Likes: true,
  Posts: false,
  Followers: false,
  Following: false,
  Comments: true,
};

const graphDataKeys = ['Likes', 'Posts', 'Followers', 'Following', 'Comments'];
const graphAverageKeys = ['Posts', 'Followers'];

class InstagramProfile extends Component {
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
      window.Intercom('trackEvent', 'check_instagram_stats');
      mixpanel.track('check_instagram_stats');
      if (!this.props.profile) this.props.fetchInstagram();
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    const profile = props.profile;
    return (
      <div>
        <Dialog autoScrollBodyContent open={state.open} title='Instagram Profile' onRequestClose={_ => this.setState({open: false})}>
          {props.isReceiving && <FontIcon className={'fa fa-spinner fa-spin'} />}
          {props.profile &&
            <div className='row' style={{marginTop: 10}}>
              <div className='large-3 medium-4 small-12 columns'>
                <div className='horizontal-center'><img src={profile.profile_picture} /></div>
                <div className='horizontal-center'><a href={`https://instagram.com/${profile.Username}`} target='_blank'><span>{profile.Username}</span></a></div>
                <div className='horizontal-center'><span>{profile.full_name}</span></div>
              </div>
              <div className='large-9 medium-8 small-12 columns'>
                <div><span className='text'>Followers: </span><span>{profile.counts.followed_by}</span></div>
                <div><span className='text'>Following: </span><span>{profile.counts.follows}</span></div>
                <div><span className='text'>Media: </span><span>{profile.counts.media}</span></div>
                <div><span className='text'>Website: </span><span>{profile.website}</span></div>
                <div style={{margin: 10}}>
                  <span>{profile.bio}</span>
                </div>
              </div>
            </div>}
            {props.graphdata &&
            <SocialDataGraph
            data={props.graphdata.received}
            title='Instagram'
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
    profile: state.instagramProfileReducer[props.contactId],
    isReceiving: state.instagramProfileReducer.isReceiving,
    graphdata: state.instagramDataReducer[props.contactId],
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchInstagram: _ => dispatch(actions.fetchInstagramProfile(props.contactId)),
    fetchGraphData: _ => dispatch(instagramDataActions.fetchContactInstagramData(props.contactId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(InstagramProfile);
