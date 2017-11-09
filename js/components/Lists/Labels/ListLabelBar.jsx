import React from 'react';
import {connect} from 'react-redux';
import {grey300, grey700} from 'material-ui/styles/colors';
import cn from 'classnames';
import styled from 'styled-components';

const HoverSourceContainer = styled.div.attrs({
  className: props => props.className
})`
  border-bottom: 1px solid ${grey300};
  margin-bottom: 10px;
`;

const HoverSpan = styled.div.attrs({
  className: props => props.className
})`
  font-size: 0.7em;
  color: #fff;
  user-select: none;
  cursor: default;
  ${HoverSourceContainer}:hover & {
    color: ${grey700};
  }
`;

const DefaultSpan = styled.span`
  color: ${grey700};
  user-select: none;
  cursor: default;
  font-size: ${props => props.large ? '1em' : '0.7em'};
`;

const ListLabelBar = ({person, listNameLabel}) => (
    <HoverSourceContainer className='row vertical-center'>
      <div className={cn('columns', 'small-8', 'large-7', {
        'medium-5': person.teamid > 0,
        'medium-6': person.teamid === 0,
      })}>
        <DefaultSpan large={listNameLabel} >
        {listNameLabel || 'List Name'}
        </DefaultSpan>
      </div>
      <HoverSpan
      className='hide-for-small-only medium-1 large-1 columns'
      >Updated</HoverSpan>
      <HoverSpan
      className='hide-for-small-only medium-1 large-1 columns'
      >Created</HoverSpan>
    {person.teamid > 0 &&
      <HoverSpan
      className='small-4 medium-2 large-1 columns horizontal-center'
      >Owner</HoverSpan>}
      <div className='hide-for-small-only medium-3 large-2 columns'>
      </div>
    </HoverSourceContainer>
  );

export default connect(state => ({person: state.personReducer.person}))(ListLabelBar);
