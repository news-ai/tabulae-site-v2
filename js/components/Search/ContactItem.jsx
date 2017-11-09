import React from 'react';
import {connect} from 'react-redux';
import Link from 'react-router/lib/Link';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import {grey50, grey700} from 'material-ui/styles/colors';

const smallSpan = {
  fontSize: '0.8em',
  fontColor: 'gray',
  marginRight: 5
};

const styles = {
  container: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 5,
    paddingBottom: 5,
  },
  archivedSpan: {marginLeft: 5, fontSize: '0.9em', color: grey700},
};

const ContactItem = ({email, firstname, lastname, listid, rowNum, query, id, publications, list}) => {
  return (
    <div className='row horizontal-center'>
      <Paper className='large-10 columns' zDepth={1} style={styles.container}>
        <div className='row'>
        <div className='large-10 medium-10 columns'>
          <div><span>{firstname} {lastname}</span></div>
          <div><span>{email}</span></div>
          {publications &&
            <div>
              <span style={smallSpan}>Publications</span><span>{publications.map(pub => pub.name).join(', ')}</span>
            </div>
          }
          <span style={smallSpan}>belongs in</span>
          <Link to={`/tables/${listid}`}><span>{list ? list.name : listid}</span></Link>
          <span style={styles.archivedSpan}>{list && list.archived && '(Archived)'}</span>
        </div>
        <div className='large-2 medium-2 columns vertical-center'>
          {listid &&
            <Link to={`/tables/${listid}/${id}`}>
              <IconButton
              tooltip='Go to Profile'
              tooltipPosition='top-right'
              iconClassName='fa fa-user'
              />
            </Link>}
          {rowNum &&
            <Link to={`/tables/${listid}?search=${query}`}>
              <IconButton
              tooltip='Go to Search Results in List'
              tooltipPosition='top-right'
              iconClassName='fa fa-list-alt'
              />
            </Link>}
        </div>
        </div>
      </Paper>
    </div>);
};

const mapStateToProps = (state, props) => {
  const listReducer = state.listReducer;
  return {
    list: listReducer[props.listid],
    publications: props.employers !== null && props.employers.map(pubid => state.publicationReducer[pubid])
  };
};

export default connect(mapStateToProps)(ContactItem);
