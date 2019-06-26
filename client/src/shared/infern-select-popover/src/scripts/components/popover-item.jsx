const createClass = require('create-react-class');

var PopoverItem = createClass({
  handleClick: function(e) {
    e.preventDefault();
    var selectedObj = {
      label: this.props.label,
      value: this.props.value
    };
    this.props.selectValue(selectedObj);
  },
  render: function() {
    return (
      <span class="tag is-medium is-info ignore-onclickoutside" onClick={this.handleClick}>
        {this.props.label}
      </span>
    );
  }
});

export default PopoverItem;
