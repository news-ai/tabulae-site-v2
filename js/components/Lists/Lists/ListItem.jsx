// @flow
import React, {Component} from 'react';
import Link from 'react-router/lib/Link';
import withRouter from 'react-router/lib/withRouter';
import {grey50, grey100, grey200, teal50, teal200, grey500, grey600, grey700} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import Tags from 'components/Tags/TagsContainer.jsx';
import Tag from 'components/Tags/Tag.jsx';
import {connect} from 'react-redux';
import get from 'lodash/get';
import Collapse from 'react-collapse';
import cn from 'classnames';
import moment from 'moment-timezone';
import styled from 'styled-components';

const FORMAT = 'ddd, MMM Do Y, hh:mm A';

const styles = {
  smallIcon: {
    fontSize: 16,
    color: grey700
  },
  small: {
    width: 36,
    height: 36,
    padding: 2,
  },
  text: {fontSize: '0.7em', color: grey600},
};

const ParentContainer = styled.div.attrs({
  className: props => props.className
})`
  padding-left: 11px;
  padding-right: 11px;
  border-left: 4px double #fefefe;
  border-right: 4px double #fefefe;
  border-bottom: 2px solid #fefefe;
  border-top: 2px solid #fefefe;
  &:hover {
    border-left: 4px double ${grey600};
    border-right: 4px double ${grey600};
    border-bottom: 2px double ${grey50};
    border-top: 2px solid ${grey50};
  }
`;

const MockSpan = styled.h2`
  font-size: 1rem;
  font-weight: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  color: #0000EE;
  padding: 0;
  margin: 0;
`;

const ListItem = ({list, onToggle, iconName, tooltip, router, nameString, person, isArchiving, extraIconButtons}) => {
  const updatedDate = new Date(list.updated);
  const createdDate = new Date(list.created);
  // person.teamid = 0;
  return (
    <ParentContainer className='row vertical-center'>
      <div
      id={list.name === 'My first list!' && 'listitem_table_hop'}
      className={cn('pointer', 'small-8', 'large-7', 'vertical-center', 'columns', {
        'medium-5': person.teamid > 0,
        'medium-6': person.teamid === 0
      })}
      >
        <div style={{
          flex: 1,
          minWidth: 0,
        }} >
          <MockSpan>
            <Link to={`/tables/${list.id}`}>{list.name}</Link>
          </MockSpan>
        </div>
        <div
        className='right'
        style={{
          whiteSpace: 'nowrap',
        }}
        >
        {list.publiclist &&
          <Tag
          hideDelete
          color={teal50}
          borderColor={teal200}
          key='public-tag'
          text='Public'
          link='/public'
          />}
          <Tags hideDelete createLink={name => `/tags/${name}`} listId={list.id}/>
        </div>
      </div>
      <div className='hide-for-small-only medium-1 large-1 columns'>
        <span style={styles.text}>{updatedDate.toLocaleDateString()}</span>
      </div>
      <div className='hide-for-small-only medium-1 large-1 columns'>
        <span style={styles.text}>{createdDate.toLocaleDateString()}</span>
      </div>
    {person.teamid > 0 &&
      <div className='small-4 medium-2 large-1 columns horizontal-center'>
        <span style={styles.text}>{nameString}</span>
      </div>}
      <div className='hide-for-small-only medium-3 large-2 columns'>
        <Link to={`/listfeeds/${list.id}`}>
          <IconButton
          tooltip='List Feed'
          id={list.name === 'My first list!' && 'listitem_listfeed_hop'}
          iconStyle={styles.smallIcon}
          style={styles.small}
          iconClassName='fa fa-list'
          tooltipPosition='top-left'
          />
        </Link>
        {!list.readonly && onToggle &&
          <IconButton
          tooltip={tooltip}
          iconStyle={styles.smallIcon}
          style={styles.small}
          iconClassName={isArchiving ? 'fa fa-spin fa-spinner' : iconName}
          onClick={_ => onToggle(list.id)}
          tooltipPosition='top-left'
          />}
        {extraIconButtons}
      </div>
    </ParentContainer>
    );
};

const mapStateToProps = (state, props) => {
  let nameString = '';
  if (state.personReducer.person.id === props.list.createdby) nameString = 'Me';
  else {
    const user = state.personReducer[props.list.createdby];
    if (user) {
      nameString = `${user.firstname} ${user.lastname}`;
    }
  }
  return {
    nameString,
    person: state.personReducer.person,
    isArchiving: get(state, `isFetchingReducer.lists[${props.list.id}].isArchiving`, false),
  };
};

export default connect(mapStateToProps)(withRouter(ListItem));
