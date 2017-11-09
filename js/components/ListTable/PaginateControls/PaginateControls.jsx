import React, {Component} from 'react';
import styled from 'styled-components';
import {grey400, grey600, grey700, grey800} from 'material-ui/styles/colors';
import Popover from 'material-ui/Popover';
import PlainSelect from 'components/PlainSelect';

export const PaginationHandle = styled.i.attrs({
  className: props => props.className
})`
  margin: 0px 5px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  color: ${props => props.disabled ? grey400 : grey600};
  &:hover {
    color: ${props => props.disabled ? grey400 : grey800};
  }
`;

export const PaginationLabel = styled.span`
  font-size: 0.9em;
  cursor: pointer;
  color: ${grey700};
`;

class PaginationLabelContainer extends Component {
  constructor(props) {
    super(props);
    // this.state = {
    //   anchorEl: null,
    //   open: false
    // };
    // this.handleRequestClose = e => this.setState({open: false});
    // this.onRequestOpen = e => {
    //   e.preventDefault();
    //   this.setState({open: true, anchorEl: e.currentTarget});
    // };
  }
  render() {
    const {currentPage, listLength, pageSize, onPageSizeChange} = this.props;
    let total = Math.floor(listLength / pageSize);
    if (listLength % pageSize !== 0) total += 1;
    if (pageSize === -1) total = 1;

    return (
      <div>
        {/*
            <option value={5}>5</option>
        <Popover
        open={this.state.open}
        anchorEl={this.state.anchorEl}
        anchorOrigin={{horizontal: 'left', vertical: 'center'}}
        targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
        onRequestClose={this.handleRequestClose}
        >
        </Popover>
        */}
        <PaginationLabel>
          {currentPage} / {total} per <PlainSelect value={pageSize} onChange={e => onPageSizeChange(parseInt(e.target.value, 10))} >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={-1}>Infinity</option>
          </PlainSelect>
        </PaginationLabel>
      </div>
    );
  }
}


const PaginateControls = ({containerClassName, currentPage, pageSize, listLength, onPrev, onNext, onPageSizeChange}) => {
  let total = Math.floor(listLength / pageSize);
  if (listLength % pageSize !== 0) total += 1;
  if (pageSize === -1) total = 1;
  return (
    <div className={containerClassName} style={{marginRight: 15}} >
      <PaginationHandle
      className='fa fa-chevron-left'
      disabled={currentPage - 1 === 0 || pageSize === -1}
      onClick={e => pageSize !== -1 && currentPage - 1 > 0 && onPrev(currentPage - 1)}
      />
      <PaginationLabelContainer
      currentPage={currentPage}
      listLength={listLength}
      pageSize={pageSize}
      onPageSizeChange={onPageSizeChange}
      />
      <PaginationHandle
      className='fa fa-chevron-right'
      disabled={currentPage + 1 > total || pageSize === -1}
      onClick={e => pageSize !== -1 && currentPage + 1 <= total && onNext(currentPage + 1)}
      />
    </div>
    );
}

export default PaginateControls;
