/* Example: <DropDown title='Admin Menu' {...{items}} onChange={this.handleMainDropDownChange} /> */

import { Component } from 'react';
import OutsideClickHandler from 'shared/OutsideClickHandler';
class DropDown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      activeItem: this.props.activeName
        ? props.items.indexOf(this.props.activeName)
        : props.items.find(item => item.isActive) || null
    };
  }

  handleOnChange = i => e => {
    e.preventDefault();
    this.setState({
      activeItem: i,
      open: false
    });
    this.props.onChange(this.props.items[i]);
  };

  handleToggleClick = () => {
    this.setState({ open: !this.state.open });
  };

  handleCloseClick = () => {
    this.setState({ open: false });
  };

  render({ title: defTitle, activeTitle = false, items = [] }) {
    const { activeItem, open: isOpen } = this.state;
    const { handleOnChange, handleToggleClick } = this;

    const title =
      activeTitle && activeItem !== null
        ? items[activeItem] && (items[activeItem].name || items[activeItem])
        : defTitle;

    const style = this.props['is-small'] ? { fontSize: '0.7rem' } : null;
    const btnStyle = this.props['is-small'] ? { height: 'auto', padding: '0 10px' } : null;

    return (
      <OutsideClickHandler component="div" style={{ display: 'inline-block' }} onOutsideClick={this.handleCloseClick}>
        <div class={`dropdown ${isOpen ? 'is-active' : ''}`}>
          <div class="dropdown-trigger">
            <button class="button" style={btnStyle} onClick={handleToggleClick} aria-controls="dropdown-menu">
              <span style={style}>{title}</span>
              <span class="icon is-small">&#203;</span>
            </button>
          </div>
          <div class="dropdown-menu" id="dropdown-menu" role="menu">
            <div class="dropdown-content" style={{ maxHeight: 100 }}>
              {items.map((item, i) => (
                <a
                  href="/#"
                  class={`dropdown-item ${item.isActive || i === activeItem ? 'is-active' : ''}`}
                  onClick={handleOnChange(i)}
                >
                  {item.name || item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </OutsideClickHandler>
    );
  }
}

export default DropDown;
