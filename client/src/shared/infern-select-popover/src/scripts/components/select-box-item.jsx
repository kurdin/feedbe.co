import { Component } from 'react';

class SelectBoxItem extends Component {
  handleRemove = e => {
    e.preventDefault();
    var objToUnselect = {
      label: this.props.label,
      value: this.props.value
    };
    this.props.unselectValue(objToUnselect);
  };

  render() {
    return (
      <span className="tag is-small is-info">
        {this.props.label}
        <button onClick={this.handleRemove} class="delete is-small" />
      </span>
    );
  }
}

export default SelectBoxItem;
