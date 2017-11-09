import find from 'lodash/find';
import {FONTSIZE_TYPES} from 'components/Email/EmailPanel/utils/typeConstants';
import tinycolor from 'tinycolor2';
export const htmlToBlock = (nodeName, node, lastList, inBlock) => {
  if (nodeName === 'figure') return;
  if (nodeName.toLowerCase() === 'p' || nodeName.toLowerCase() === 'div') {
    if (node.style.textAlign === 'center') {
      return {
        type: 'center-align',
        data: {}
      };
    } else if (node.style.textAlign === 'right') {
      return {
        type: 'right-align',
        data: {}
      };
    } else if (node.style.textAlign === 'justify') {
      return {
        type: 'justify-align',
        data: {}
      };
    } else {
      if (node.style && node.outerHTML) {
        // Handle MS Word lists special case that outputs <p> tags with custom css instead of <ol>/<ul>
        const {msoStyles} = node.outerHTML.split('\"').reduce(({prevIsStyle, msoStyles}, block, i) => {
          if (prevIsStyle) {
            msoStyles.push(block);
            prevIsStyle = false;
          } else {
            if (block.split('style=').length === 2) prevIsStyle = true;
          }
          return {prevIsStyle, msoStyles};
        }, {prevIsStyle: false, msoStyles: []});
        if (msoStyles.length > 0) {
          const msoString = 'mso-list';
          const styleBlock = msoStyles[0].split(';').filter(style => style.substring(0, msoString.length) === msoString)[0];
          if (styleBlock) {
            const actualStyle = styleBlock.split(':')[1];
            const depth = parseInt(actualStyle.split(' ')[1].split('level')[1]);
            const isUnordered = !!node.firstChild.style.fontFamily;
            // mutate node to remove msoIgnore node
            node.removeChild(node.firstChild);
            if (!isNaN(depth)) {
              return {
                type: isUnordered ? 'unordered-list-item' : 'ordered-list-item',
                depth: depth - 1,
                data: {}
              };
            }
          }
        }
      }
      return {
        type: 'unstyled',
        data: {}
      };
    }
  }
  if (nodeName.toLowerCase() === 'img') {
    // console.log(node);
    return {
      type: 'atomic',
      data: {}
    };
  }
};

const roundToHalf = (num) => (Math.round(num * 2) / 2).toFixed(1);
const isNumeric = (n) => !isNaN(parseFloat(n)) && isFinite(n);

const parseMixedNumberString = string => {
  let numString = [];
  let unitString = [];
  for (let char of string) (isNumeric(char) || char === '.') ? numString.push(char) : unitString.push(char);
  return {fontSize: numString.join(''), fontUnit: unitString.join('')};
}

export const htmlToStyle = (nodeName, node, currentStyle) => {
  let newStyle = currentStyle;
  if (nodeName === 'span') {
    if (!!node.style.fontSize) {
      const fontSizeString = node.style.fontSize;
      const {fontSize, fontUnit} = parseMixedNumberString(fontSizeString);
      if (!isNumeric(fontSize)) return currentStyle;

      // convert different font-size units to pt
      let convertedSize = parseFloat(fontSize);
      if (fontUnit === 'px') convertedSize = 3/4 * convertedSize;
      else if (fontUnit === 'em') convertedSize = 12 * convertedSize;
      else if (fontUnit === '%') convertedSize = 3/25 * convertedSize;

      let roundedFontSize = roundToHalf(convertedSize);
      if (Math.floor(roundedFontSize) === Math.ceil(roundedFontSize)) roundedFontSize = Math.ceil(roundedFontSize);

      const foundType = find(FONTSIZE_TYPES, type => type.label === roundedFontSize);
      if (foundType) newStyle = newStyle.add(foundType.style);
      else newStyle = newStyle.add(`SIZE-${roundedFontSize}`)
      // newStyle = newStyle.add(`SIZE-${roundedFontSize}`)
    }

    if (!!node.style.color) {
      const color = tinycolor(node.style.color);
      if (color.isValid()) {
        newStyle = newStyle.add(`COLOR-${color.toHexString()}`);
      }
    }

    return newStyle;
  } else {
    return currentStyle;
  }
};

export const htmlToEntity = (nodeName, node, createEntity) => {
  if (nodeName === 'a') {
    if (node.firstElementChild === null) {
      // LINK ENTITY
      return createEntity('LINK', 'MUTABLE', {url: node.href});
    } else if (node.firstElementChild.nodeName === 'IMG' || node.firstElementChild.nodeName === 'img') {
      // IMG ENTITY
      const imgNode = node.firstElementChild;
      const src = imgNode.src;
      const size = parseInt(imgNode.style['max-height'].slice(0, -1), 10) || 1;
      const imageLink = node.href;
      const entityKey = createEntity('IMAGE', 'MUTABLE', {src,
        size: `${size}%`,
        imageLink: imageLink || '#',
        align: 'left'
      });
      return entityKey;
    }
  }
  if (nodeName.toLowerCase() === 'img') {
    // console.log(node);
    const src = node.getAttribute('src');
    // console.log(src);
    const size = 1;
    const entityKey = createEntity('IMAGE', 'IMMUTABLE', {
      src,
      size: '100%',
      imageLink: '#',
      align: 'left'
    });
    // console.log(entityKey);
    return entityKey;
  }
}


export const CONVERT_CONFIGS = {
      htmlToStyle: htmlToStyle,
      htmlToBlock: htmlToBlock,
      htmlToEntity: htmlToEntity,
    };

