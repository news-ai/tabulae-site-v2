import {
  SelectionState,
  Entity,
  convertToRaw,
  convertFromRaw,
  Modifier,
} from 'draft-js';
import {red800} from 'material-ui/styles/colors';
import alertify from 'alertifyjs';

// look for old property format and trigger warning for user to update
const triggerNewEntityFormatWarning = rawContentState => new Promise((resolve, reject) => {
        const {blocks} = rawContentState;
        const CURLYREGEX = /{([^}]+)}/g;
        const oldPropertyMap = blocks.reduce((acc, block) => {
          let expectedMatches = block.text.match(CURLYREGEX);
          if (expectedMatches !== null) {
            expectedMatches.map(match => acc[match] = acc[match] ? acc[match] + 1 : 1);
          }
          return acc;
        }, {});
        const oldProperties = Object.keys(oldPropertyMap);
        if (oldProperties.length > 0) {
          alertify.confirm(
            `Template Conversion Update: ${oldProperties.length} Found`,
            `
            <div>
            We recently updated the custom properties format. Your template may be outdated with custom properties that will not work.
            </div>
            <div style='color:${red800}'>
            To update your template automatically, click OK to continue. Cancel if you'd like use the template as it is (custom properties with old format will not work anymore). To prevent this warning again, remember to save the template.
            </div>
            <div>
            The following custom properties will be converted:
              <ul>
              ${oldProperties.map(property => `<li>${property}</li>`).join('')}
              </ul>
            </div>`,
            _ => {
              let contentState = convertFromRaw(rawContentState);
              let cleanedBlocks = [];
              contentState.getBlockMap()
              .filter(block => block.getLength() > 0)
              .map(block => {
                let blockText = block.getText();
                let match = CURLYREGEX.exec(blockText);
                while (match !== null) {
                  if (match[0].length > 0) {
                    const propertyText = match[1];
                    const start = match.index;
                    const end = match.index + match[0].length;
                    const selectionToReplace = SelectionState
                    .createEmpty(block.getKey())
                    .merge({
                      focusKey: block.getKey(),
                      focusOffset: end,
                      anchorKey: block.getKey(),
                      anchorOffset: start
                    });
                    // create and insert new entity
                    contentState = contentState.createEntity('PROPERTY', 'IMMUTABLE', {property: propertyText});
                    contentState = Modifier.replaceText(
                      contentState,
                      selectionToReplace,
                      propertyText,
                      null,
                      contentState.getLastCreatedEntityKey()
                      );
                  }
                  match = CURLYREGEX.exec(blockText);
                }
              });
              resolve(convertToRaw(contentState));
            },
            _ => {
              // on cancel, return original rawContentState without replacing entities
              resolve(rawContentState);
            });
        } else {
          resolve(rawContentState);
        }
      });

export default triggerNewEntityFormatWarning;