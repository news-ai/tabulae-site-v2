import React from 'react';
import {grey400, grey50, grey800} from 'material-ui/styles/colors';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import FontIcon from 'material-ui/FontIcon';
import isURL from 'validator/lib/isURL';

const defaultStyle = {
  paddingTop: 10,
  paddingBottom: 10,
  margin: '10px 0',
  border: `dotted 1px ${grey400}`,
  borderRadius: '0.4em'
};

const defaultImgContainerStyle = {
  marginBottom: 20,
  marginTop: 20,
  backgroundColor: grey50,
  height: 500
};

const IMG_CONTAINER_OFFSET = 0;

const InstagramItem = ({
  screenWidth,
  style,
  text,
  createdat,
  instagramcomments,
  instagramid,
  instagramheight,
  instagramwidth,
  instagramlikes,
  instagramimage,
  instagramlink,
  instagramusername,
  instagramvideo,
  caption,
}) => {
  const containerStyle = style ? Object.assign({}, defaultStyle, style) : defaultStyle;
  const date = new Date(createdat);
  let imgContainerStyle = (screenWidth && screenWidth - IMG_CONTAINER_OFFSET < defaultImgContainerStyle.width) ?
  Object.assign(
    {},
    defaultImgContainerStyle, {
      width: screenWidth - IMG_CONTAINER_OFFSET > containerStyle.width ? containerStyle.width - IMG_CONTAINER_OFFSET : screenWidth - IMG_CONTAINER_OFFSET
    }) : defaultImgContainerStyle;
  return (
    <div className='row' style={containerStyle}>
      <div className='large-12 medium-12 small-12 columns'>
        <span style={{fontSize: '0.8em', color: grey400}}>from Instagram</span>
      </div>
      <div className='large-10 medium-12 small-12 columns'>
        {text && text
        .split(' ')
        .map((block, i) => <a className='pointer' key={`${instagramid}-${i}`} style={{color: grey800}} target='_blank' href={isURL(block) ? block : instagramlink}>{block} </a>)}
      </div>
      <div className='large-12 medium-12 small-12 columns'>
        <span style={{float: 'right'}}>
          {instagramusername ? <a className='pointer' target='_blank' href={`https://instagram.com/${instagramusername}`}>{instagramusername}</a> : instagramusername}
        </span>
      </div>
      <div className='large-12 medium-12 small-12 columns' style={{fontSize: '0.8em'}}>
        <span>{date.toDateString()}</span><span style={{marginLeft: 8}}>{date.toTimeString()}</span>
      </div>
      {caption &&
        <div className='large-12 medium-12 small-12 columns'>
          <span>{caption}</span>
        </div>}
      {!instagramvideo && <div className='large-12 medium-12 small-12 columns horizontal-center' style={imgContainerStyle}>
        <img style={{maxHeight: '100%', maxWidth: '100%'}} src={instagramimage} />
      </div>}
      {instagramvideo && <div className='large-12 medium-12 small-12 columns horizontal-center' style={imgContainerStyle}>
        <video src={instagramvideo} controls>
        Your browser does not support the <code>video</code> element.
        </video>
      </div>}
      <div className='large-12 medium-12 small-12 columns vertical-center horizontal-center' style={{marginBottom: 10}}>
        <Chip style={{margin: 5, float: 'right'}}>
          <Avatar size={30} icon={<FontIcon className='fa fa-heart' />} />
          {instagramlikes}
        </Chip>
        <Chip style={{margin: 5, float: 'right'}}>
          <Avatar size={30} icon={<FontIcon className='fa fa-comment' />} />
          {instagramcomments}
        </Chip>
      </div>
    </div>);
};

export default InstagramItem;
