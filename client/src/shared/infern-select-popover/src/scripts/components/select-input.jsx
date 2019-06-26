import createClass from 'create-react-class';

var SelectInput = createClass({
  handleSearch: function(e) {
    // var searchInput = Inferno.findDOMNode(this.searchInput);
    this.props.handleSearch(this.searchInput.value);
  },

  handleBackspace: function(e) {
    if (this.props.searchTerm.length !== 0 && e.keyCode === 13) {
      var objToUnselect = {
        label: this.searchInput.value,
        value: this.searchInput.value
      };
      this.props.selectValue(objToUnselect);
    }
  },

  componentDidUpdate: function() {
    // var input = Inferno.findDOMNode(this.searchInput);
    var input = this.searchInput;
    if (this.props.focus === 'in') {
      input.focus();
    } else {
      input.blur();
    }
  },

  render: function() {
    let placeholder = '';
    if (this.props.maxSelectedItems && !this.props.isView) {
      if (this.props.selectedCount === 0) placeholder = `limit ${this.props.maxSelectedItems}`;
      else {
        placeholder =
          this.props.maxSelectedItems === this.props.selectedCount
            ? ''
            : this.props.maxSelectedItems > this.props.selectedCount
            ? ` limit ${this.props.maxSelectedItems - this.props.selectedCount} more`
            : '';
      }
    }

    return (
      <input
        type="text"
        className="search-input"
        ref={ref => {
          this.searchInput = ref;
        }}
        placeholder={placeholder}
        disabled={this.props.disabled}
        onKeyDown={this.handleBackspace}
        onFocus={this.props.onFocus}
        // onBlur={this.props.onBlur}
        value={this.props.searchTerm}
        onInput={this.handleSearch}
      />
    );
  }
});

export default SelectInput;
