import OutsideClickHandler from './OutsideClickHandler';

const SelectBoxItem = require('./select-box-item').default;
const SelectInput = require('./select-input').default;

const createClass = require('create-react-class');

const SelectBox = createClass({
  handleClickOutside: function(evt) {
    this.props.focusOut();
  },

  handleClick: function() {
    this.props.focusIn();
  },

  render: function() {
    var selectedItems = this.props.selectedValues.map(function(value) {
      var label = this.props.labelsByValue[value] || value;
      return <SelectBoxItem label={label} value={value} key={value} unselectValue={this.props.unselectValue} />;
    }, this);

    var classNames = this.props.selectBoxClassNames;
    if (this.props.className) classNames.push(this.props.className);

    if (!selectedItems.length && this.props.focus !== 'in') {
      selectedItems = <p className="empty-list">{this.props.selectPlaceholder}</p>;
    }

    return (
      <OutsideClickHandler component="div" className="wrapOutSide" onOutsideClick={this.handleClickOutside}>
        <div
          className={
            classNames.join(' ') +
            (this.props.focus === 'in' ? ' active' : '') +
            (this.props.disabled ? ' disabled' : '')
          }
          onClick={this.handleClick}
        >
          {selectedItems}

          <SelectInput
            onFocus={this.handleClick}
            // onBlur={this.handleClickOutside}
            maxSelectedItems={this.props.maxSelectedItems}
            selectedCount={this.props.selectedCount}
            className={this.props.className}
            focus={this.props.focus}
            disabled={this.props.disabled}
            isView={this.props.disabled}
            searchTerm={this.props.searchTerm}
            onClose={this.handleClickOutside}
            handleSearch={this.props.handleSearch}
            selectValue={this.props.selectValue}
            unselectValue={this.props.unselectValue}
          />
        </div>
      </OutsideClickHandler>
    );
  }
});

export default SelectBox;
