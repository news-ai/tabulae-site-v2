import React, {Component} from 'react';
import withRouter from 'react-router/lib/withRouter';
import Link from 'react-router/lib/Link';
import {connect} from 'react-redux';
import intercomSetup from '../chat';

import {actions as loginActions} from 'components/Login';
import {loginConstant} from 'components/Login/constants';
import {actions as notificationActions} from 'components/Notifications';
import * as joyrideActions from './Joyride/actions';

import Login from './Login';
import Breadcrumbs from 'react-breadcrumbs';
import NotificationBadge  from 'react-notification-badge';
import BreadCrumbs from 'components/BreadCrumbs/BreadCrumbs.jsx';

import RaisedButton from 'material-ui/RaisedButton';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import FeedbackPanel from './Feedback/FeedbackPanel.jsx';
import Badge from 'material-ui/Badge';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import NotificationPanel from 'components/Notifications/NotificationPanel.jsx';
import {grey700, grey500, blue600, blue300, red700} from 'material-ui/styles/colors';

const navStyle = {
  position: 'fixed',
  backgroundColor: '#ffffff',
  // border: '1px dotted black',
  boxShadow: '0px 0px 5px 3px rgba(0, 0, 0, 0.1)',
  top: 0,
  padding: 5,
  zIndex: 300
};

const noNavBarLocations = ['static'];
function matchNoNavBar(pathname) {
  const pathblocks = pathname.split('/');
  return noNavBarLocations.some(loc => loc === pathblocks[pathblocks.length - 1 ]);
}

let DEFAULT_WINDOW_TITLE = window.document.title;
    // window.document.title = DEFAULT_WINDOW_TITLE;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogin: false,
      isDrawerOpen: false,
      showNavBar: true,
      firstTimeUser: false,
      didScroll: false,
      feedbackPanelOpen: false,
      notificationPanelOpen: false,
      notificationAnchorEl: null
    };
    this.onNotificationPanelOpen = this.onNotificationPanelOpen.bind(this);
    this.onNotificationPanelClose = this.onNotificationPanelClose.bind(this);
    this.toggleDrawer = _ => this.setState({isDrawerOpen: !this.state.isDrawerOpen});
    this.closeDrawer = _ => this.setState({isDrawerOpen: false});
    this.turnOnGeneralGuide = _ => {
      this.props.turnOnGeneralGuide();
      this.setState({firstTimeUser: false});
    };
    this.turnOnUploadGuide = _ => {
      this.props.turnOnUploadGuide();
      this.setState({firstTimeUser: false});
    };
    this.onSkipTour = _ => this.setState({firstTimeUser: false});
    this.onDrawerChange = isDrawerOpen => this.setState({isDrawerOpen});
    this.goToBilling = _ => (window.location.href = 'https://tabulae.newsai.org/api/billing');
  }

  componentWillMount() {
    this.props.getAuth();
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isLogin && !this.state.isLogin && nextProps.person) {
      // nextProps.setupNotificationSocket();
     
      if (nextProps.firstTimeUser) {
        this.props.setFirstTimeUser();
        this.setState({firstTimeUser: true});
      }
      this.setState({isLogin: true});
    }
    if (matchNoNavBar(nextProps.location.pathname) && nextProps.isLogin) {
      this.setState({showNavBar: false});
    } else {
      this.setState({showNavBar: true});
    }

    if (this.props.numUnreadNotification !== nextProps.numUnreadNotification) {
      const title = window.document.title;
      if (nextProps.numUnreadNotification === 0) {
        // remove notification #
        window.document.title = title.split(' ').filter((_, i) => i > 0).join(' ');
      } else if (this.props.numUnreadNotification === 0) {
        window.document.title = `(${nextProps.numUnreadNotification}) ${title}`;
      } else { // increase or decrease in notif count but not zero
        const titleWithoutCount = title.split(' ').filter((_, i) => i > 0).join(' ');
        window.document.title = `(${nextProps.numUnreadNotification}) ${titleWithoutCount}`;
      }

    }

    // if (this.props.location.pathname !== nextProps.location.pathname) {
    //   console.log(this.props.location.pathname);
    //   console.log(nextProps.location.pathname);
    //   console.log(nextProps.location);
    //   console.log('---------');
    // }
  }

  onNotificationPanelOpen(e) {
    this.setState({notificationPanelOpen: true, notificationAnchorEl: e.currentTarget});
  }

  onNotificationPanelClose() {
    if (this.props.numUnreadNotification > 0) this.props.readReceiptNotification();
    this.setState({notificationPanelOpen: false});
  }

  render() {
    const props = this.props;
    const state = this.state;
    const NavBar = (state.showNavBar && props.person) && (
      <div>
        {
          props.firstTimeUser &&
          <Dialog title={`Welcome, ${props.person.firstname}`} open={state.firstTimeUser}>
            <div style={styles.dialogContainer}>
              <div className='horizontal-center'>
                <RaisedButton primary style={styles.btn} label='Guide me through an existing sheet' onClick={this.turnOnGeneralGuide}/>
              </div>
              <div className='horizontal-center'>
                <RaisedButton primary style={styles.btn} label='Show me how to upload my first sheet' onClick={this.turnOnUploadGuide}/>
              </div>
              <div className='horizontal-center'>
                <RaisedButton style={styles.btn} label='Skip Tour' onClick={this.onSkipTour} />
              </div>
            </div>
          </Dialog>
        }
        {
          props.isLogin &&
          <Dialog autoScrollBodyContent open={!props.person.isactive && props.location.pathname !== '/settings'} modal>
            <div className='horizontal-center'>
              <p style={{fontSize: 20}}>Thanks for using NewsAI Tabulae!</p>
            </div>
            <div className='horizontal-center'>
              <p>Your subscription is over. To re-subscribe please visit the our billing page.</p>
            </div>
            <div className='horizontal-center' style={styles.btn}>
              <RaisedButton primary label='Go to Billing' onClick={this.goToBilling} />
            </div>
            <div className='horizontal-center' style={styles.btn}>
              <Link to='/settings'>
                <RaisedButton label='Invite friends, get 1 month' labelColor='#ffffff' backgroundColor={blue300} />
              </Link>
            </div>
            <div className='horizontal-center' style={styles.btn}>
              <RaisedButton label='Logout' onClick={props.logoutClick}/>
            </div>
            <div style={{margin: 30}}>
              <div onClick={_ => this.setState({feedbackPanelOpen: true})} className='horizontal-center pointer'>
                <p style={{fontSize: 14}}>We are always looking for ways to improve. Let us know how the experience was for you!
                  <FontIcon style={{margin: '0 5px', fontSize: '0.9em'}} color={blue600} hoverColor={blue300} className='fa fa-chevron-down' />
                </p>
              </div>
            {state.feedbackPanelOpen &&
              <FeedbackPanel />}
            </div>
          </Dialog>
        }
        <Drawer docked={false} open={state.isDrawerOpen} onRequestChange={this.onDrawerChange} >
          <Link to='/'><MenuItem onClick={this.closeDrawer} rightIcon={<FontIcon className='fa fa-home'/>}>Home</MenuItem></Link>
          <Link to='/clients'><MenuItem onClick={this.closeDrawer} rightIcon={<FontIcon className='fa fa-folder'/>}>Client Directory</MenuItem></Link>
          <Link to='/search'><MenuItem onClick={this.closeDrawer} rightIcon={<FontIcon className='fa fa-search'/>}>Search</MenuItem></Link>
          <Link to='/emailstats'><MenuItem onClick={this.closeDrawer} rightIcon={<FontIcon className='fa fa-envelope'/>}>Sent & Scheduled Emails</MenuItem></Link>
          <Link to='/workspace'><MenuItem onClick={this.closeDrawer} rightIcon={<FontIcon className='fa fa-desktop'/>}>Template Manager</MenuItem></Link>
          <Link to='/public'><MenuItem onClick={this.closeDrawer} rightIcon={<FontIcon className='fa fa-table'/>}>Public Lists</MenuItem></Link>
        {props.person.teamid > 0 &&
          <Link to='/team'><MenuItem onClick={this.closeDrawer} rightIcon={<FontIcon className='fa fa-users'/>}>Team Lists</MenuItem></Link>}
          <Link to='/settings'><MenuItem onClick={this.closeDrawer} rightIcon={<FontIcon className='fa fa-cogs'/>}>Settings</MenuItem></Link>
          <MenuItem onClick={this.closeDrawer} onClick={this.goToBilling} rightIcon={<FontIcon className='fa fa-credit-card'/>}>Billing</MenuItem>
          <a href='https://help.newsai.co' target='_blank'><MenuItem onClick={this.closeDrawer} rightIcon={<FontIcon className='fa fa-question'/>}>Help Center</MenuItem></a>
          <Link to='/settings'><MenuItem onClick={this.closeDrawer}>Refer a Colleague</MenuItem></Link>
        </Drawer>
        <div className='u-full-width row noprint vertical-center' style={navStyle}>
          <div className='small-6 medium-1 large-1 columns vertical-center'>
            <IconButton iconStyle={styles.drawerIcon} onClick={this.toggleDrawer} iconClassName='fa fa-bars noprint' />
          </div>
          <div className='hide-for-small-only medium-8 large-8 columns vertical-center'>
            <div>
              <span style={styles.breadcrumbText}>You are at: </span>
            </div>
            <div id='breadcrumbs_hop' style={{marginTop: 16}}>
              <Breadcrumbs routes={props.routes} params={props.params} separator=' > '/>
            {/*
              <BreadCrumbs />
            */}
            </div>
          </div>
          <div className='small-6 medium-2 large-2 columns vertical-center horizontal-center clearfix'>
            <div>
            {props.numUnreadNotification > 0 &&
              <NotificationBadge
              count={props.numUnreadNotification}
              style={styles.notificationBadge}
              effect={[null, null, {top:'-5px'}, {top:'0px'}]}
              />}
              <IconButton iconStyle={styles.notificationBell} onClick={this.onNotificationPanelOpen} iconClassName='fa fa-bell' />
            </div>
            <Popover
              open={state.notificationPanelOpen}
              anchorEl={state.notificationAnchorEl}
              anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
              targetOrigin={{horizontal: 'right', vertical: 'top'}}
              onRequestClose={this.onNotificationPanelClose}
            >
              <NotificationPanel />
            </Popover>
            <RaisedButton style={{marginLeft: 10}} label='Logout' onClick={props.logoutClick} labelStyle={styles.btnLabel} />
          </div>
        </div>
        <div style={styles.placeholderHeight}></div>
      </div>
      );
    return (
      <div style={styles.container}>
        {
          props.isLogin ?
            <div>
              {state.showNavBar && NavBar}
              {props.children}
              <FloatingActionButton
              id='custom_intercom_launcher'
              backgroundColor={blue600}
              style={styles.intercomBtn}
              iconClassName='fa fa-comment-o'
              />
            </div> : <Login/>
        }
      </div>
      );
  }
}

const styles = {
  btn: {margin: 10},
  dialogContainer: {margin: '10px 0'},
  intercomBtn: {
    position: 'fixed',
    bottom: 20,
    right: 20
  },
  container: {width: '100%', height: '100%'},
  btnLabel: {textTransform: 'none'},
  breadcrumbText: {color: 'gray', marginRight: 8},
  placeholderHeight: {height: 60},
  notificationBadge: {backgroundColor: blue300},
  notificationBell: {color: grey500},
  drawerIcon: {color: grey700}
};

const mapStateToProps = (state, props) => {
  const notifications = state.notificationReducer.messages;
  return {
    data: state,
    isLogin: state.personReducer.person ? true : false,
    loginDidInvalidate: state.personReducer.didInvalidate,
    person: state.personReducer.person,
    firstTimeUser: props.location.query.firstTimeUser || state.personReducer.firstTimeUser,
    numUnreadNotification: notifications ? notifications.reduce((total, message) => message.unread ? total + 1 : total, 0) : 0,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getAuth: _ => dispatch({type: loginConstant.REQUEST}),
    logoutClick: _ => dispatch(loginActions.logout()),
    setFirstTimeUser: _ => dispatch(loginActions.setFirstTimeUser()),
    fetchNotifications: _ => dispatch(notificationActions.fetchNotifications()),
    turnOnUploadGuide: _ => dispatch(joyrideActions.turnOnUploadGuide()),
    turnOnGeneralGuide: _ => dispatch(joyrideActions.turnOnGeneralGuide()),
    // setupNotificationSocket: _ => dispatch(notificationActions.setupNotificationSocket()),
    readReceiptNotification: _ => dispatch({type: 'READ_NOTIFICATIONS'})
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(App));
