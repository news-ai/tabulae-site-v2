import React from 'react';
import Link from 'react-router/lib/Link';

const styles = {
  container: {marginTop: 10, marginBottom: 10},
  text: {fontSize: '2em', marginRight: 10}
};

function ListManagerTitle({title, backRouteTitle, route, iconName}) {
  return (
    <div style={styles.container}>
      <span style={styles.text}>{title}</span>
      {route && backRouteTitle && <Link to={route}>
        <span>{backRouteTitle}</span>
        <i className={iconName} aria-hidden='true'></i>
      </Link>}
    </div>);
}

export default ListManagerTitle;
