import React from 'react';
import styled from 'styled-components';
import {grey300, grey400, grey500, grey700} from 'material-ui/styles/colors';

const PlainFontIcon = styled.i.attrs({
  className: props => props.className
})`
  color: ${props => props.disabled ? grey400 : grey500};
  font-size: 1.3em;
  margin: auto;
  &:hover {
    color: ${props => !props.disabled && grey700};
  }
`;

const PlainIconButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  margin: ${props => props.margin || '3px 8px'};
`;

const PlainIconButtonLabel = styled.span`
  font-size: 0.7em;
  white-space: nowrap;
  color: ${props => props.disabled ? grey500 : grey700};
`;

const PlainIconButton = ({label, onClick, disabled, className, margin}) => {
  return (
  <PlainIconButtonContainer margin={margin} disabled={disabled} onClick={e => !disabled && onClick(e)}>
    <PlainFontIcon className={className} disabled={disabled} />
    <PlainIconButtonLabel disabled={disabled} >{label}</PlainIconButtonLabel>
  </PlainIconButtonContainer>
  );
}

export default PlainIconButton;
