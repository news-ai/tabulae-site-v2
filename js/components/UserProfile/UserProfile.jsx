import React, {Component} from 'react';
import {connect} from 'react-redux';
import {getInviteCount} from './actions';

import {grey700, blueGrey900, pink600} from 'material-ui/styles/colors';
import Avatar from 'material-ui/Avatar';
import Invite from './Invite.jsx';

import Tabs, {TabPane} from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';

import BasicSettings from './BasicSettings.jsx';
import EmailSettings from './EmailSettings.jsx';

import {actions as loginActions} from 'components/Login';

const InviteSteps = props => <div style={{
  display: 'flex',
  justifyContent: 'space-around',
  margin: '20px 0',
  padding: 30,
  textAlign: 'center'
}}>
  <span style={{color: grey700, fontSize: '1.5em'}} >For every friend invited that becomes a paid user, you get a <span style={{color: pink600}} >free month</span> added to your account</span>
</div>;


class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      activeKey: '1',
    };
    this.onTabChange = activeKey => this.setState({activeKey});
    this.onTabClick = (key) => {
      if (key === this.state.activeKey) this.setState({activeKey: ''});
    };
  }

  componentWillMount() {
    this.props.getInviteCount().then(count => {
      this.setState({count});
    });
  }

  render() {
    const state = this.state;
    const props = this.props;

    return (
      <div style={{marginTop: 40}}>
        <Tabs
        defaultActiveKey='1'
        onChange={this.onTabChange}
        activeKey={state.activeKey}
        renderTabBar={() => <ScrollableInkTabBar onTabClick={this.onTabClick}/>}
        renderTabContent={() => <TabContent/>}
        tabBarPosition='top'
        >
          <TabPane placeholder={<span>PLACEHOLDER</span>} tab='Basics' key='1'>
            <BasicSettings/>
          </TabPane>
          <TabPane placeholder={<span>PLACEHOLDER</span>} tab='Email Settings' key='2'>
            <EmailSettings/>
          </TabPane>
          <TabPane placeholder={<span>PLACEHOLDER</span>} tab='Invite' key='3'>
            <div className='row horizontal-center'>
              <div className='large-8 medium-8 small-12 columns' style={{margin: '20px 0'}} >
                <InviteSteps/>
                {
                /*<div className='horizontal-center'>
                  <span className='smalltext'>{state.count} friends signed up</span>
                </div>*/
                }
                <div className='horizontal-center' style={{margin: '20px 0'}}>
                  <Invite className='vertical-center'/>
                </div>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  return {
    person: state.personReducer.person,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    patchPerson: body => dispatch(loginActions.patchPerson(body)),
    getInviteCount: _ => dispatch(getInviteCount())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);
