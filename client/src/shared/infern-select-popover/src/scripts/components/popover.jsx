const PopoverItem = require('./popover-item').default;

const createClass = require('create-react-class');

var Popover = createClass({
  render: function() {
    var tags = [];
    var searchTerm = this.props.searchTerm.toString().toLowerCase();

    this.props.options.forEach(function(option) {
      var label = option.label,
        value = option.value,
        labelSlug = label.toString().toLowerCase();

      if (
        this.props.selectedValues.indexOf(option.value) !== -1 ||
        (searchTerm && labelSlug.indexOf(searchTerm) === -1)
      )
        return;

      tags.push(<PopoverItem key={value} label={label} value={value} selectValue={this.props.selectValue} />);
    }, this);

    if (!tags.length) {
      tags.push(
        <span key="none" className="empty-list">
          No Options to show
        </span>
      );
    }

    var classNames = this.props.popoverClassNames;
    if (classNames.indexOf('ignore-onclickoutside') === -1) {
      classNames.push('ignore-onclickoutside');
    }

    var style = {
      display: this.props.focus === 'in' ? 'block' : 'none',
      position: 'relative'
    };

    return (
      <div className={classNames.join(' ')} style={style}>
        {tags}
        <div class="close-select-box" onClick={this.props.onClose}>
          &times;
        </div>
      </div>
    );
  }
});

export default Popover;
