import React, {Component} from 'react';
import withRouter from 'react-router/lib/withRouter';
import Link from 'react-router/lib/Link';
import {connect} from 'react-redux';

const RouteBlock = ({route, location}) => {
  const routePath = route.path.split('/').filter(b => b.length > 0);
  const locationPath = location.pathname.split('/').filter(b => b.length > 0);
  console.log(routePath);
  console.log(locationPath);
  console.log('--------');
  return (
    <Link to={{pathname: route.path}} >
      <span style={{margin: '0 5px'}} >{route.name}</span>
    </Link>
    );
}

class BreadCrumbs extends Component {
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {

  }

  render() {
    console.log(this.props.routes);
    const {routes, location} = this.props;

    return (
      <div>
        {routes
          .filter(route => route.name)
          .map((route, i) =>
            <RouteBlock route={route} location={location} />
          )}
      </div>
      );
  }
}

const mapStateToProps = (state, props) => ({});

export default connect(mapStateToProps)(withRouter(BreadCrumbs));
