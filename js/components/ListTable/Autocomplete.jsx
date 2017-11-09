import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import Popover, {PopoverAnimationVertical} from 'material-ui/Popover';
import MenuItem from 'material-ui/MenuItem';
import Menu from 'material-ui/Menu';
import debounce from 'lodash/debounce';
import keycode from 'keycode';

/*

<Autocomplete
searchText={}
onChange={}
options={}
maxSearchResults={}
labelGetter={}
/>

 */

class Autocomplete extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      anchorEl: null,
      searchText: '',
      focusTextField: true // only useful when using arrow to select option in popover
    };
    this.close = this.close.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.handleRequestClose = _ => this.setState({open: false});
    this.handleBlur = this.handleBlur.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
  }

  close() {
    this.setState({
      open: false,
      anchorEl: null,
    });
  }

  handleMouseDown(event) {
    // Keep the TextField focused
    event.preventDefault();
  }


  handleKeyDown(event) {
    switch (keycode(event)) {
      case 'enter':
        this.close();
        break;
      case 'esc':
        this.close();
        break;
      case 'down':
        event.preventDefault();
        this.setState({
          open: true,
          focusTextField: false,
        });
        break;
      default:
        break;
    }
  }

  onChange(e, newValue) {
    e.preventDefault();
    this.setState({
      anchorEl: e.currentTarget,
      searchText: newValue,
    }, debounce(_ => this.props.onInputUpdate(newValue), 200));
    debounce(_ => {
      if (this.state.searchText.length > 0) this.setState({open: true});
    }, 300)();
  }

  onSelect(option) {
    let getter = label => label;
    if (this.props.labelGetter) getter = this.props.labelGetter;
    this.props.onOptionSelect(option);
    this.setState({searchText: getter(option), open: false});
  }

  handleBlur() {
    // this.setState({open: false});
  }

  handleFocus() {
    this.setState({focusTextField: true, open: true});
    // console.log('focus');
    this.searchTextField.focus();
  }

  render() {
    const props = this.props;
    const state = this.state;
    let getter = label => label;
    let menu = props.options.map(
      (option, i) =>
        <MenuItem
          key={option + i}
          onClick={_ => this.onSelect(option)}
          primaryText={option}
        />
      );
    if (props.maxSearchResults) {
      menu = menu.filter((option, i) => i < props.maxSearchResults);
    }

    return (
      <div>
        <TextField
        id='searchTextField'
        ref={ref => this.searchTextField = ref}
        autoComplete='off'
        onKeyDown={this.handleKeyDown}
        onBlur={this.handleBlur}
        onFocus={this.handleFocus}
        floatingLabelText={this.props.floatingLabelText}
        hintText={this.props.hintText}
        fullWidth={this.props.fullWidth}
        multiLine={false}
        value={state.searchText}
        onChange={this.onChange}
        />
        <Popover
        canAutoPosition={false}
        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
        useLayerForClickAway={false}
        open={props.options.length > 0 && state.open}
        anchorEl={state.anchorEl}
        onRequestClose={this.handleRequestClose}
        animation={PopoverAnimationVertical}
        >
          <Menu
          desktop
          disableAutoFocus={state.focusTextField}
          initiallyKeyboardFocused
          onMouseDown={this.handleMouseDown}
          maxHeight={200}
          >
            {menu}
          </Menu>
        </Popover>
        
      </div>
    );
  }
}

export default Autocomplete;
