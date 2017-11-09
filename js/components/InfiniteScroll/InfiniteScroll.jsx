import React, {Component} from 'react';

class InfiniteScroll extends Component {
  constructor(props) {
    super(props);
    this.onScrollBottom = this._onScrollBottom.bind(this);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScrollBottom);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScrollBottom);
  }

  _onScrollBottom(ev) {
    ev.preventDefault();
    // console.log(window.innerHeight + window.scrollY + 20);
    // console.log(document.body.scrollHeight);
    // console.log('----------');
    if ((window.innerHeight + window.scrollY + 20) >= document.body.scrollHeight) {
      // console.log('scrolled');
      this.props.onScrollBottom();
    }
  }
  render() {
    return (
      <div className={this.props.className}>
        {this.props.children}
      </div>);
  }
}

export default InfiniteScroll;
