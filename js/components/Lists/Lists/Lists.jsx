import React from 'react';
import ListItem from './ListItem.jsx';
import ListsTitle from './ListsTitle.jsx';
import Waiting from '../../Waiting';
import ListLabelBar from 'components/Lists/Labels/ListLabelBar';

const loading = {
  zIndex: 160,
  top: 80,
  right: 10,
  position: 'fixed'
};

const styles = {
  listitemContainer: {marginBottom: 30, marginTop: 15}
};



const Lists = ({isReceiving, title, lists, statementIfEmpty, onToggle, listItemIcon, backRoute, backRouteTitle, tooltip, extraIconButtons}) => {
  return (
    <div>
      <Waiting isReceiving={isReceiving} style={loading} />
      <ListsTitle title={title} route={backRoute} iconName='fa fa-angle-right fa-fw' backRouteTitle={backRouteTitle} />
      <ListLabelBar />
      <div style={styles.listitemContainer}>
       {lists.length === 0 &&
        <span>{statementIfEmpty}</span>}
        {
          lists.map( (list, i) =>
          <ListItem
          key={i}
          list={list}
          onToggle={onToggle}
          iconName={listItemIcon}
          tooltip={tooltip}
          extraIconButtons={extraIconButtons}
          />)
        }
      </div>
    </div>
    );
}

export default Lists;
