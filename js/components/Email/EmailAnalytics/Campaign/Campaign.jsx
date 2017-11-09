import React from 'react';
import {connect} from 'react-redux';
import Tooltip from 'components/Tooltip';

import Link from 'react-router/lib/Link';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import {grey800, blue800, grey600} from 'material-ui/styles/colors';

const blockStyles = {
  span: {
    fontSize: '0.8em',
    color: grey800,
    verticalAlign: 'text-top'
  },
  number: {
    padding: 2,
  },
  indicator: {
    fontSize: '1.5em',
    color: blue800
  },
  block: {
    display: 'block'
  },
  tooltip: {
    fontSize: '0.8em',
    color: 'darkgray'
  }
};

const tooltipStyles = {
  content: {
  },
  tooltip: {
    borderRadius: '6px',
    padding: 2
  },
  arrow: {
  },
};


const Block = ({title, value, hint, linkQuery, query}) => {
  let span = <span style={blockStyles.indicator}>{value}</span>;
  if (linkQuery) {
    span = <Link to={{pathname: '/emailstats/all', query: Object.assign({}, query, linkQuery)}} >{span}</Link>;
  }
  return (
    <div style={blockStyles.block}>
      <Tooltip content={hint} styles={tooltipStyles}>
        <span style={blockStyles.span}>{title}</span>
      </Tooltip>
      <div style={blockStyles.number}>
        {span}
      </div>
    </div>);
};

const Campaign = ({
  subject,
  baseSubject,
  delivered,
  opens,
  uniqueOpens,
  uniqueOpensPercentage,
  clicks,
  uniqueClicks,
  uniqueClicksPercentage,
  bounces,
  date,
  router
}) => {
  let query = {date};
  if (baseSubject) query.baseSubject = baseSubject;
  else query.subject = subject;
  return (
    <Paper className='row' zDepth={1} style={styles.container}>
      <div className='large-12 medium-12 small-12 columns'>
        <span className='smalltext' style={styles.date}>Created: {date}</span>
      </div>
      <div className='large-5 medium-12 small-12 columns'>
      {subject || <span style={styles.span}>(No Subject)</span>}
      </div>
      <div className='large-2 medium-4 small-4 columns'>
        <Block hint='Total number of email opens' value={opens} title='Total Opens' query={query} linkQuery={{filter: 'open'}} />
        <Block hint='Total number of clicks on embeded links' value={clicks} title='Total Clicks' query={query} linkQuery={{filter: 'click'}} />
      </div>
      <div className='large-2 medium-4 small-4 columns'>
        <Block hint='Total number of people who opened' value={uniqueOpens} title='Unique Opens'/>
        <Block hint='How many people opened out of people delivered' value={`${Math.round(uniqueOpensPercentage * 100) / 100}%`} title='Unique Open Rate'/>
      </div>
      {/*
      <div className='large-2 medium-4 small-4 columns'>
        <Block hint='' value={`${uniqueClicksPercentage}%`} title='Unique Clicks Rate'/>
      </div>
    */}
      <div className='large-2 medium-4 small-4 columns'>
        <Block hint='How many emails did not reach recepients' value={bounces} title='Bounces' query={query} linkQuery={{filter: 'bounce'}} />
        <Block hint='How many emails were delivered in this campaign' value={delivered} title='Total Delivered'/>
      </div>
      <div className='large-offset-9 medium-offset-8 small-offset-6 columns'>
        <div className='right'>
          <Link to={{pathname: '/emailstats/all', query}}>
            <FlatButton
            primary
            label='See Emails'
            icon={<FontIcon className='fa fa-chevron-right'/>}
            onClick={_ => {
              window.Intercom('trackEvent', 'check_campaign_emails');
              mixpanel.track('check_campaign_emails');
            }}
            />
          </Link>
        </div>
      </div>
    </Paper>
  );
};

const styles = {
  span: {color: grey800},
  container: {margin: 10, padding: 10},
  date: {color: grey600}
};

const mapStateToProps = (state, props) => {
  return {};
};

const mapDispatchToProps = (dispatch, props) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Campaign);
