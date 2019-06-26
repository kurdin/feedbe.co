const SelectBox = require('./select-box').default;
const Popover = require('./popover').default;

const createClass = require('create-react-class');

var SelectPopover = createClass({
  getDefaultProps: function() {
    return {
      options: [],
      value: [],
      refs: {},
      disabled: false,
      maxSelectedItems: null,
      name: 'react-select-popover',
      selectPlaceholder: 'Choose some options',
      componentClassNames: ['react-select-popover'],
      selectBoxClassNames: ['select-input'],
      popoverClassNames: ['popover', 'arrow-top']
    };
  },

  getInitialState: function() {
    return {
      searchTerm: '',
      selectedValues: this.valueAsArray(this.props.value),
      focus: 'out'
    };
  },

  valueAsArray: function(value) {
    return value ? (Array.isArray(value) ? value : [value]) : [];
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      selectedValues: this.valueAsArray(nextProps.value)
    });
  },

  selectValue: function(selectedObj) {
    var selectedValues = this.state.selectedValues;
    if (this.props.maxSelectedItems && selectedValues.length + 1 >= this.props.maxSelectedItems) {
      selectedValues[this.props.maxSelectedItems - 1] = selectedObj.value;
      this.setState({
        focus: 'out'
      });
    } else {
      selectedValues.push(selectedObj.value);
    }

    this.setState({
      selectedValues: selectedValues,
      searchTerm: ''
    });

    this.triggerOnChange({
      event: 'added',
      item: selectedObj,
      value: this.state.selectedValues
    });
  },

  unselectValue: function(objToUnselect) {
    if (this.props.disabled) return;
    var selectedValues = this.state.selectedValues;
    objToUnselect = objToUnselect || selectedValues[selectedValues.length - 1] || {};
    var index = selectedValues.indexOf(objToUnselect.value);
    if (index !== -1) {
      selectedValues.splice(index, 1);

      this.setState({
        selectedValues: selectedValues
      });

      this.triggerOnChange({
        event: 'removed',
        item: objToUnselect,
        value: this.state.selectedValues
      });
    }
  },

  handleSearch: function(term) {
    this.setState({
      searchTerm: term
    });
  },

  focusIn: function() {
    if (this.props.disabled) return;
    this.setState({
      focus: 'in'
    });
  },

  focusOut: function() {
    // if (this.state.focus === 'in' && this.props.onBlur) this.props.onBlur();
    this.setState({
      focus: 'out',
      searchTerm: ''
    });
  },

  triggerOnChange: function(eventObject) {
    if (this.props.onChange && !this.props.isView) {
      this.props.onChange(eventObject);
      this.props.onBlur();
    }
  },

  render: function() {
    var labelsByValue = {};
    for (var i = 0; i < this.props.options.length; i++) {
      labelsByValue[this.props.options[i].value] = this.props.options[i].label;
    }

    return (
      <div className={`react-select-popover${this.state.focus === 'in' ? ' focused' : ' '}`}>
        <SelectBox
          selectedValues={this.state.selectedValues}
          selectValue={this.selectValue}
          labelsByValue={labelsByValue}
          unselectValue={this.unselectValue}
          handleSearch={this.handleSearch}
          searchTerm={this.state.searchTerm}
          disabled={this.props.disabled}
          isView={this.props.isView}
          focusIn={this.focusIn}
          focus={this.state.focus}
          focusOut={this.focusOut}
          maxSelectedItems={this.props.maxSelectedItems}
          selectedCount={this.state.selectedValues.length}
          selectPlaceholder={this.props.selectPlaceholder}
          selectBoxClassNames={this.props.selectBoxClassNames}
        />

        <Popover
          options={this.props.options}
          selectedValues={this.state.selectedValues}
          selectValue={this.selectValue}
          searchTerm={this.state.searchTerm}
          focus={this.state.focus}
          onClose={this.focusOut}
          popoverClassNames={this.props.popoverClassNames}
        />
      </div>
    );
  }
});

export default SelectPopover;
