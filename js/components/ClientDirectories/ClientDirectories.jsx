import React, {Component} from 'react';
import * as actions from './actions';
import withRouter from 'react-router/lib/withRouter';
import Waiting from '../Waiting';
import {connect} from 'react-redux';

import ListsTitle from '../Lists/Lists/ListsTitle.jsx';
import FontIcon from 'material-ui/FontIcon';
import {grey100, grey400, grey800} from 'material-ui/styles/colors';

const DirectoryParent = ({name, onClick, open, children}) => {
  return (
    <div>
      <div className='vertical-center' onClick={onClick} style={{
        cursor: 'pointer',
        backgroundColor: grey100,
        padding: 5,
        margin: '5px 0'
      }}>
        <FontIcon style={{margin: '0 10px'}} className='fa fa-folder' color={grey400}/>
        <span style={{fontSize: '1.1em', color: grey800}}>{name}</span>
      </div>
      {open && children}
    </div>
    );
};

class ClientDirectories extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.fetchClientNames();
  }

  render() {
    const props = this.props;
    return (
      <div className='large-offset-1 large-10 columns' style={{marginTop: 40}}>
        <ListsTitle title='Clients Directory'/>
        {props.isReceiving && <Waiting isReceiving={props.isReceiving} style={{float: 'right'}}/>}
        <div style={{marginTop: 20}}>
          {props.clientnames && props.clientnames.map((name, i) =>
            <DirectoryParent
            key={`directory-parent-${i}`}
            open={name === props.clientname}
            children={props.children}
            onClick={_ => props.router.push(`/clients/${name === props.clientname ? '' : name}`)}
            name={name}
            />)}
          {props.clientnames && props.clientnames.length === 0 &&
            <div className='horizontal-center vertical-center' style={{height: 400}}>
              <span>No Client name attached with any list. Try adding clientname in a list by clicking "Add Tag & Client" button on top.</span>
            </div>
          }
        </div>
      </div>
      );
  }
}


const mapStateToProps = (state, props) => {
  const clientname = props.params.clientname;
  return {
    clientname,
    clientnames: state.clientReducer.clientnames,
    isReceiving: state.clientReducer.isReceiving,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchClientNames: _ => dispatch(actions.fetchClientNames())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ClientDirectories));
