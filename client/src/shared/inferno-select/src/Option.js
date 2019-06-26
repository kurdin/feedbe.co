const createClass = require('create-react-class');
import classNames from 'classnames';

const Option = createClass({
	blockEvent(event) {
		event.preventDefault();
		event.stopPropagation();
		if (event.target.tagName !== 'A' || !('href' in event.target)) {
			return;
		}
		if (event.target.target) {
			window.open(event.target.href, event.target.target);
		} else {
			window.location.href = event.target.href;
		}
	},

	handleMouseDown(event) {
		event.preventDefault();
		event.stopPropagation();
		this.props.onSelect(this.props.option, event);
	},

	handleMouseEnter(event) {
		if (this.props.isKeyPressed) return;
		this.onFocus(event);
	},

	handleMouseMove(event) {
		this.props.onMouseMove();
		this.onFocus(event);
	},

	handleTouchEnd(event) {
		// Check if the view is being dragged, In this case
		// we don't want to fire the click event (because the user only wants to scroll)
		if (this.dragging) return;

		this.handleMouseDown(event);
	},

	handleTouchMove(event) {
		// Set a flag that the view is being dragged
		this.dragging = true;
	},

	handleTouchStart(event) {
		// Set a flag that the view is not being dragged
		this.dragging = false;
	},

	onFocus(event) {
		if (!this.props.isFocused) {
			this.props.onFocus(this.props.option, event);
		}
	},
	render() {
		var { option, instancePrefix, optionIndex } = this.props;
		var className = classNames(this.props.className, option.className);

		return option.disabled ? (
			<div className={className} onMouseDown={this.blockEvent} onClick={this.blockEvent}>
				{this.props.children}
			</div>
		) : (
			<div
				className={className}
				style={option.style}
				role="option"
				onMouseDown={this.handleMouseDown}
				onMouseEnter={this.handleMouseEnter}
				onMouseMove={this.handleMouseMove}
				onTouchStart={this.handleTouchStart}
				onTouchMove={this.handleTouchMove}
				onTouchEnd={this.handleTouchEnd}
				id={instancePrefix + '-option-' + optionIndex}
				title={option.title}
			>
				{this.props.children}
			</div>
		);
	}
});

export default Option;
