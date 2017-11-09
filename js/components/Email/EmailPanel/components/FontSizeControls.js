import React, {Component} from 'react';
import MenuItem from 'material-ui/MenuItem';
import find from 'lodash/find';
import DropDownMenu from 'material-ui/DropDownMenu';
import TextField from 'material-ui/TextField';
import findAllFontSizesInSelection from 'components/Email/EmailPanel/editorUtils/findAllFontSizesInSelection';

const PLACEHOLDER = '---';
const FONT_PREFIX = 'SIZE-';

class FontSizeControls extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      value: ''
    };
    this.onChange = e => this.setState({value: e.target.value});
    this.onKeyDown = e => {
      if (e.keyCode === 13) this.onSubmit();
    };
    this.onSubmit = e => {
      const value = parseFloat(this.state.value);
      if (isNaN(value) || value === 0) {
        this.setState({value: '', show: false});
        return;
      }
      const selectStyle = `SIZE-${value}`;
      this.props.onToggle(selectStyle);
      this.setState({value: '', show: false});
    };
    this.onDropDownChange = (e, index, newValue) => {
      if (newValue === '---') return;
      if (newValue === 'custom') {
        this.setState({show: true}, _ => setTimeout(_ => this.fontSizeCustom.focus(), 300));
        return;
      }
      const selectStyle = `SIZE-${newValue}`;
      this.props.onToggle(selectStyle);
    };
  }

  render() {
    const props = this.props;
    const {inlineStyles} = props;
    const currentFontSizes = findAllFontSizesInSelection(props.editorState);
    let value = '10.5';
    let currentType = {label: '10.5', value: 'SIZE-10.5'};
    // filling in custom sizing to dropdown from pasted HTML if found
    const leftover = currentFontSizes
    .map(font => font.split(FONT_PREFIX)[1])
    .filter(size => inlineStyles.filter(style => style.label === size).length === 0);
    const inlineStylesWithExtraStyles = [
    ...inlineStyles,
    ...leftover.map(size => ({inlineType: 'size', label: size, style: `SIZE-${size}`}))
    ].sort((a, b) => parseFloat(a.label) - parseFloat(b.label));
    
    if (currentFontSizes.length > 1) {
      // more than one fontSize selected
      value = PLACEHOLDER;
      currentType = undefined;
    } else if (currentFontSizes.length === 1) {
      currentType = find(inlineStylesWithExtraStyles, type => currentFontSizes[0] === type.style);
      value = currentType.label;
    }

    const menuItems = [
      <MenuItem
      key={`fontsize-select-default`}
      value={PLACEHOLDER}
      style={styles.menuLabel}
      primaryText={PLACEHOLDER}
      label={PLACEHOLDER}
      />,
      <MenuItem
      key={`fontsize-select-custom`}
      value='custom'
      style={styles.menuCustomLabel}
      primaryText='Custom'
      label='Custom Size'
      />,
      ...inlineStylesWithExtraStyles.map(type =>
        <MenuItem
        key={`fontsize-select-${type.label}`}
        value={type.label}
        primaryText={type.label}
        label={type.label}
        />)
    ];

    const renderNodes = this.state.show ? (
      <TextField
      id='fontsize-custom'
      ref={ref => this.fontSizeCustom = ref}
      value={this.state.value}
      onChange={this.onChange}
      onKeyDown={this.onKeyDown}
      onBlur={this.onSubmit}
      style={styles.textfield}
      />
      ) : (
        <DropDownMenu
        style={styles.dropdownStyle}
        underlineStyle={styles.underlineStyle}
        value={value}
        onChange={this.onDropDownChange}
        >
        {menuItems}
        </DropDownMenu>
      );

    return renderNodes;
  }
}

const styles = {
  underlineStyle: {display: 'none', margin: 0},
  dropdownStyle: {fontSize: '0.9em'},
  textfield: {width: 40},
  menuLabel: {padding: 0},
  menuCustomLabel: {padding: 0, fontSize: '0.8em'},
};

export default FontSizeControls;

