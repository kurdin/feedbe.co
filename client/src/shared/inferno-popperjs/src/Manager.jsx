import { createElement } from 'inferno-create-element';
import { Component } from 'inferno-component';

class Manager extends Component {
  static defaultProps = {
    tag: 'div'
  };

  getChildContext() {
    return {
      popperManager: {
        setTargetNode: this._setTargetNode,
        getTargetNode: this._getTargetNode
      }
    };
  }

  _setTargetNode = node => {
    this._targetNode = node;
  };

  _getTargetNode = () => {
    return this._targetNode;
  };

  render() {
    const { tag, children, ...restProps } = this.props;
    if (tag !== false) {
      return createElement(tag, restProps, children);
    } else {
      return children;
    }
  }
}

export default Manager;
