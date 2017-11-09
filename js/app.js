/**
 *
 * app.js
 *
 * This is the entry file for the application, mostly just setup and boilerplate
 * code. Routes are configured at the end of this file!
 *
 */

// Load the ServiceWorker, the Cache polyfill, the manifest.json file and the .htaccess file
// import 'file-loader?name=[name].[ext]!../serviceworker.js';
// import 'file-loader?name=[name].[ext]!../manifest.json';
// import 'file-loader?name=[name].[ext]!../.htaccess';

// Check for ServiceWorker support before trying to install it
// if (process.env.NODE_ENV === 'development') {
//   if ('serviceWorker' in navigator && 'PushManager' in window) {
//     navigator.serviceWorker.register('/serviceworker.js')
//     .then(
//       registration => {
//         console.log('ServiceWorker registration successful with scope: ', registration.scope);
//         window.swRegistration = registration;
//       },
//       err => console.log('ServiceWorker registration failed: ', err)
//     ).catch(err => {
//       // Registration failed
//       console.log(err);
//     });
//   } else {
//     // No ServiceWorker Support
//     console.log('service worker is not supported');
//   }
// }

// Import all the third party stuff
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import Route from 'react-router/lib/Route';
import IndexRoute from 'react-router/lib/IndexRoute';
import Router from 'react-router/lib/Router';
import browserHistory from 'react-router/lib/browserHistory';
import configureStore from './configureStore';

// Import the pages
import NotFound from './components/NotFound';
import App from './components/App.jsx';
import ListManagerContainer from './components/Lists/ListManagerContainer.jsx';
import TagListsContainer from './components/Lists/TagListsContainer.jsx';
import ArchiveContainer from './components/Lists/ArchiveContainer.jsx';
import PublicListsContainer from './components/Lists/PublicListsContainer.jsx';
import TeamListsContainer from './components/Lists/TeamListsContainer.jsx';
import SearchBar from './components/Search';

import SentEmailsContainer from './components/Email/EmailAnalytics/SentEmailsContainer.jsx';
import AllSentEmailsContainer from './components/Email/EmailAnalytics/AllSentEmailsContainer.jsx';
import TrashSentEmailsContainer from './components/Email/EmailAnalytics/TrashSentEmailsContainer.jsx';
import ListSentEmailsContainer from './components/Email/EmailAnalytics/ListSentEmailsContainer.jsx';
import SearchSentEmails from './components/Email/EmailAnalytics/SearchSentEmails.jsx';
import ScheduledEmails from './components/Email/EmailAnalytics/ScheduledEmails.jsx';
import EmailStatsContainer from './components/Email/EmailAnalytics/EmailStats/EmailStatsContainer.jsx';
import CampaignContainer from './components/Email/EmailAnalytics/CampaignContainer.jsx';

import ContactProfile from './components/ContactProfile';
import ListTable from './components/ListTable';
import ListFetchingContainer from './components/ListTable/ListFetchingContainer.jsx';
import UserProfile from './components/UserProfile';
import ListFeed from './components/ListFeed';
import HeaderNaming from './components/HeaderNaming/HeaderNaming.jsx';
import ClientDirectories from './components/ClientDirectories/ClientDirectories.jsx';
import ClientDirectory from './components/ClientDirectories/ClientDirectory.jsx';
import Publication from './components/Publications/Publication.jsx';
import ContactTags from './components/Contacts/ContactTags/ContactTags.jsx';
import Workspace from './components/Workspace/Workspace.jsx';
import TemplateManager from './components/Workspace/TemplateManager.jsx';

import MultiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// Import the CSS file, which HtmlWebpackPlugin transfers to the build folder
import '../css/main.css';

const store = configureStore();

window.TABULAE_API_BASE = process.env.NODE_ENV === 'development' ? `https://dev-dot-newsai-1166.appspot.com/api` : `https://tabulae.newsai.org/api`;
window.TABULAE_HOME = process.env.NODE_ENV === 'development' ? `https://tabulae-dev.newsai.co` : `https://tabulae.newsai.co`;


// third-party services setups
if (process.env.NODE_ENV === 'production') {
  Raven.config(
    'https://c6c781f538ef4b6a952dc0ad3335cf61@sentry.io/100317',
    {
      release: '0.0.1',
      environment: 'production'
    }
    ).install();
}

mixpanel.init(process.env.MIXPANEL_TOKEN);

// Make reducers hot reloadable, see http://stackoverflow.com/questions/34243684/make-redux-reducers-and-other-non-components-hot-loadable
if (module.hot) {
  module.hot.accept('./reducers/rootReducer', () => {
    const nextRootReducer = require('./reducers/rootReducer').default;
    const nextRootEpic = require('./reducers/rootReducer').rootEpic;
    store.replaceReducer(nextRootReducer);
    store.replaceEpic(nextRootEpic);
  });
}

// wrap components that we want onboarding to, pass down props like routes

ReactDOM.render(
  <MultiThemeProvider>
    <Provider store={store}>
        <Router onUpdate={() => window.scrollTo(0, 0)} history={browserHistory}>
          <Route path='/' name='Home' component={App}>
            <IndexRoute component={ListManagerContainer} />
            <Route path='lists' name='List Manager' component={ListManagerContainer} />
            <Route path='contacts' name='Contacts' component={ContactTags} />
            <Route path='tables/:listId' staticName name='Table'>
              <IndexRoute component={ListFetchingContainer} />
              <Route path=':contactId' staticName name='Profile' component={ContactProfile} />
            </Route>
            <Route path='tags/:tag' staticName name='Tag Search' component={TagListsContainer} />
            <Route path='clients' staticName name='Clients' component={ClientDirectories}>
              <Route path=':clientname' component={ClientDirectory} />
            </Route>
            <Route path='listfeeds/:listId' staticName name='List Feed' component={ListFeed} />
            <Route path='publications/:publicationId' staticName name='Publication' component={Publication} />
            <Route path='headersnaming/:listId' staticName name='Header Naming' component={HeaderNaming} />
            <Route path='archive' name='Archive' component={ArchiveContainer} />
            <Route path='public' name='Public Lists' component={PublicListsContainer} />
            <Route path='team' name='Team Lists' component={TeamListsContainer} />
            <Route path='settings' name='Settings' component={UserProfile} />
            <Route path='workspace' name='Template Manager' component={TemplateManager}>
              <Route path='new-template' staticName name='New Template' component={Workspace} />
              <Route path=':templateId' staticName name='Saved Template' component={Workspace} />
            </Route>
            <Route path='emailstats' name='Sent & Scheduled Emails' component={SentEmailsContainer}>
              <IndexRoute component={CampaignContainer}/>
              <Route path='all' name='All Sent Emails' component={AllSentEmailsContainer} />
              <Route path='trash' name='Trash' component={TrashSentEmailsContainer} />
              <Route path='scheduled' name='Scheduled' component={ScheduledEmails} />
              <Route path='lists/:listId' staticName name='List' component={ListSentEmailsContainer} />
              <Route path='search(/:searchQuery)' staticName name='Search' component={SearchSentEmails} />
              <Route path='charts' staticName name='Charts' component={EmailStatsContainer} />
            </Route>
            <Route path='search' name='Search' component={SearchBar} />
            <Route path='*' staticName name='Not Found' component={NotFound} />
          </Route>
        </Router>
      </Provider>
    </MultiThemeProvider>,
  document.getElementById('app')
);
