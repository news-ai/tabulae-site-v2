// @flow
import processInlineStylesAndEntities from './processInlineStylesAndEntities';

let blockTagMap = {
  'header-one':               ['<h1>','</h1>\n'],
  'header-two':               ['<h1>','</h1>\n'],
  'unstyled':                 ['<div>','</div>\n'],
  'code-block':               ['<pre><code>','</code></pre>\n'],
  'blockquote':               ['<blockquote>','</blockquote>\n'],
  'ordered-list-item':        ['<li>','</li>\n'],
  'unordered-list-item':      ['<li>','</li>\n'],
  // 'atomic':                   ['<figure>','</figure>\n'],
  'atomic':                   ['<figure style="margin: 0">','</figure>\n'],
  // 'atomic':              ['<figure style="text-align:center">','</figure>\n'],
  'center-align':             ['<div style="text-align:center">','</div>\n'],
  'left-align':               ['<div>','</div>\n'],
  'right-align':              ['<div style="text-align:right">','</div>\n'],
  'justify-align':            ['<div style="text-align:justify">','</div>\n'],
  'default':                  ['<p>','</p>\n']
};

let inlineTagMap = {
  'BOLD': ['<strong>','</strong>'],
  'ITALIC': ['<em>','</em>'],
  'UNDERLINE': ['<u>','</u>'],
  'CODE': ['<code>','</code>'],
  'STRIKETHROUGH': ['<del>', '</del>'],
  'default': ['<span style="font-size:10.5pt;">','</span>'],
};

const match = (word, prefix) => word.substring(0, prefix.length) === prefix;

const combinableInlineFn = style => {
  const SIZE_PREFIX = 'SIZE-';
  if (match(style, SIZE_PREFIX)) {
    const size = style.split(SIZE_PREFIX)[1];
    return [`font-size:${size}pt;`, 'span'];
  }
  const COLOR_PREFIX = 'COLOR-';
  if (match(style, COLOR_PREFIX)) {
    const color = style.split(COLOR_PREFIX)[1];
    return [`color:${color};`, 'span'];
  }
  if (combinableInlineTagMap[style]) return combinableInlineTagMap[style];
}

let combinableInlineTagMap = {
  'Arial': ['font-family:Arial, &#39;Helvetica Neue&#39;, Helvetica, sans-serif;', 'span'],
  'Helvetica': ['font-family:&#39;Helvetica Neue&#39;, Helvetica, Arial, sans-serif;', 'span'],
  'Times New Roman': ['font-family:&#39;Times New Roman&#39;, Times, serif;', 'span'],
  'Courier New': ['font-family:&#39;Courier New&#39;, Courier, &#39;Lucida Sans Typewriter&#39;, &#39;Lucida Typewriter&#39;, monospace;', 'span'],
  'Courier': ['font-family:Courier;','span'],
  'Palatino': ['font-family:Palatino, &#39;Palatino Linotype&#39;, &#39;Palatino LT STD&#39;, &#39;Book Antiqua&#39;, Georgia, serif;', 'span'],
  'Garamond': ['font-family:Garamond, Baskerville, &#39;Baskerville Old Face&#39;, &#39;Hoefler Text&#39;, &#39;Times New Roman&#39;, serif;', 'span'],
  'Bookman': ['font-family:Bookman;', 'span'],
  'Avant Garde': ['font-family:&#39;Avant Garde&#39;, Avantgarde, &#39;Century Gothic&#39;, CenturyGothic, AppleGothic, sans-serif;', 'span'],
  'Verdana': ['font-family:Verdana, Geneva, sans-serif;', 'span'],
  'Tahoma': ['font-family:Tahoma, Geneva, sans-serif;', 'span'],
  'Impact': ['font-family:Impact, Charcoal, sans-serif;', 'span'],
  'Avenir': ['font-family:&#39;Avenir Next&#39;, sans-serif;', 'span'],
  'Nunito': ['font-family:Nunito;', 'span'],
  'BOLD': ['font-weight:bold;', 'span'],
  'ITALIC': ['font-style:italic;', 'span'],
  'UNDERLINE': ['text-decoration:underline;', 'span'],
  // 'CODE': ['<code>','</code>'],
  'STRIKETHROUGH': ['text-decoration:line-through;', 'span'],
}

let entityTagMap = {
  'PROPERTY': {
    process: data => [`<%= `, ' %>']
  },
  'LINK': {
    process: data => ['<a href="<%= url %>" target="_blank">', '</a>'],
  },
  'IMAGE': {
    default: [
      `<div style="text-align:<%= align %>">
        <img src="<%= src %>">`,
        `</img>
      </div>`
    ],
    process: data => {
      if (data.imageLink && data.imageLink !== '#') {
        return [
        `<div style="text-align:<%= align %>">
            <a href="<%= imageLink %>" target="_blank">
              <img src="<%= src %>">`,
              `</img>
            </a>
          </div>`];
      } else {
        return [
        `<div style="text-align:<%= align %>">
            <img src="<%= src %>">`,
            `</img>
          </div>`
        ];
      }
    } 
  }
}

let nestedTagMap = {
  'ordered-list-item': ['<ol>', '</ol>'],
  'unordered-list-item': ['<ul>', '</ul>']
};

// transform entity data at html compile stage
const entityDataConversionMap = {
  IMAGE: data => {
    const size = parseInt(data.size.slice(0, -1), 10) / 100;
    return Object.assign({}, data, {
      src: data.size === '100%' ? data.src : `https://image1.newsai.org/${size.toFixed(2)}x/${data.src}`
    });
  }
};

export default function(raw) {
  let html = '';
  let lastIndex = raw.blocks.length - 1;
  let st = [];

  raw.blocks.forEach(function(block, index) {
    if (block.text.length === 0) {
      // clean up from nested blocks when escape into normal grafs
      while (st.length > 0) html += st.pop();
      html += '<br>';
    } else {
      if (nestedTagMap[block.type]) {
        const prevBlock = raw.blocks[index - 1];
        const nextBlock = raw.blocks[index + 1];
        const nestedBlockType = nestedTagMap[block.type];
        const content = processInlineStylesAndEntities({inlineTagMap, entityTagMap, entityMap: raw.entityMap, block, combinableInlineFn, entityDataConversionMap});
        if (!prevBlock || !nestedTagMap[prevBlock.type]) {
          html += nestedBlockType[0];
          st.push(nestedBlockType[1]);
        }
        if (nextBlock && nestedTagMap[nextBlock.type]) {
          if (block.depth < nextBlock.depth) {
            html += '<li>' + content;
            html += nestedTagMap[nextBlock.type][0]
            st.push('</li>');
            st.push(nestedTagMap[nextBlock.type][1]);
          } else if (block.depth === nextBlock.depth) {
            if (block.type !== nextBlock.type) {
              html += '<li>' + content + '</li>';
              html += st.pop();
              html += nestedTagMap[nextBlock.type][0];
              st.push(nestedTagMap[nextBlock.type][1]);
            }
            else html += '<li>' + content + '</li>';
          } else {
            html += '<li>' + content + '</li>';
            let diff = block.depth - nextBlock.depth;
            while (diff > 0) {
              html += st.pop();
              html += st.pop();
              diff -= 1;
            }
            // force-break ordering to make consistent with draft-js rendering
            // which breaks ordering when mixing ordered-list-items and unordered-list-items
            // if (block.type === 'unordered-list-item' && nextBlock.type === 'ordered-list-item') {
            if (nextBlock.type === 'ordered-list-item') {
              html += st.pop() || '';
              html += st.pop() || '';
              html += nestedTagMap[nextBlock.type][0];
              st.push(nestedTagMap[nextBlock.type][1]);
            }
          }
        } else {
          html += '<li>' + content + '</li>';
          while (st.length > 0) html += st.pop();
        }
      } else {
        // clean up from nested blocks when escape into normal grafs
        while (st.length > 0) html += st.pop();

        let blockTag = blockTagMap[block.type];
        html += blockTag ?
          blockTag[0] +
            processInlineStylesAndEntities({inlineTagMap, entityTagMap, entityMap: raw.entityMap, block, combinableInlineFn, entityDataConversionMap}) +
            blockTag[1] :
          blockTagMap['default'][0] +
            processInlineStylesAndEntities({inlineTagMap, block, combinableInlineFn, entityDataConversionMap}) +
            blockTagMap['default'][1];
      }
    }
  });
  return html;
}
