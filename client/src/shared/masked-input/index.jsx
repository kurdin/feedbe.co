import { Component } from 'react';
import createTextMaskInputElement from './core/src/createTextMaskInputElement';
import { isNil } from './core/src/utilities';

export default class MaskedInput extends Component {
  constructor(props) {
    super(props);

    this.setRef = this.setRef.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onInput = this.onInput.bind(this);
  }

  setRef(inputElement) {
    this.inputElement = inputElement;
  }

  initTextMask() {
    const {
      props,
      props: { value }
    } = this;

    this.textMaskInputElement = createTextMaskInputElement({
      inputElement: this.inputElement,
      ...props
    });
    this.textMaskInputElement.update(value);
  }

  componentDidMount() {
    this.initTextMask();
  }

  componentDidUpdate(prevProps) {
    // Getting props affecting value
    const { value, pipe, mask, guide, placeholderChar, showMask } = this.props;

    // Сalculate that settings was changed:
    // - `pipe` converting to string, to compare function content
    // - `mask` converting to string, to compare values or function content
    // - `keepCharPositions` exludes, because it affect only cursor position
    const settings = { guide, placeholderChar, showMask };
    const isPipeChanged =
      typeof pipe === 'function' && typeof prevProps.pipe === 'function'
        ? pipe.toString() !== prevProps.pipe.toString()
        : (isNil(pipe) && !isNil(prevProps.pipe)) || (!isNil(pipe) && isNil(prevProps.pipe));
    const isMaskChanged = mask.toString() !== prevProps.mask.toString();
    const isSettingChanged =
      Object.keys(settings).some(prop => settings[prop] !== prevProps[prop]) || isMaskChanged || isPipeChanged;

    // Сalculate that value was changed
    const isValueChanged = value !== this.inputElement.value;

    // Check value and settings to prevent duplicating update() call
    if (isValueChanged || isSettingChanged) {
      this.initTextMask();
    }
  }

  render() {
    const { render, ...props } = this.props;

    delete props.mask;
    delete props.guide;
    delete props.pipe;
    delete props.placeholderChar;
    delete props.keepCharPositions;
    delete props.value;
    delete props.onBlur;
    delete props.onInput;
    delete props.showMask;

    return render(this.setRef, {
      onBlur: this.onBlur,
      onInput: this.onInput,
      defaultValue: this.props.value,
      ...props
    });
  }

  onInput(event) {
    this.textMaskInputElement.update();

    if (typeof this.props.onInput === 'function') {
      this.props.onInput(event);
    }
  }

  onBlur(event) {
    if (typeof this.props.onBlur === 'function') {
      this.props.onBlur(event);
    }
  }
}

MaskedInput.defaultProps = {
  render: (ref, props) => <input ref={ref} {...props} />
};

export { default as conformToMask } from './core/src/conformToMask.js';
