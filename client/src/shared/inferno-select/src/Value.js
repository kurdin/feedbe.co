const createClass = require('create-react-class');
import classNames from 'classnames';

const Value = createClass({
	displayName: 'Value',

	handleMouseDown(event) {
		if (event.type === 'mousedown' && event.button !== 0) {
			return;
		}
		if (this.props.onClick) {
			event.stopPropagation();
			this.props.onClick(this.props.value, event);
			return;
		}
		if (this.props.value.href) {
			event.stopPropagation();
		}
	},

	onRemove(event) {
		event.preventDefault();
		event.stopPropagation();
		this.props.onRemove(this.props.value);
	},

	handleTouchEndRemove(event) {
		// Check if the view is being dragged, In this case
		// we don't want to fire the click event (because the user only wants to scroll)
		if (this.dragging) return;

		// Fire the mouse events
		this.onRemove(event);
	},

	handleTouchMove(event) {
		// Set a flag that the view is being dragged
		this.dragging = true;
	},

	handleTouchStart(event) {
		// Set a flag that the view is not being dragged
		this.dragging = false;
	},

	renderRemoveIcon() {
		if (this.props.disabled || !this.props.onRemove) return;
		return (
			<span
				className="Select-value-icon"
				aria-hidden="true"
				onMouseDown={this.onRemove}
				onTouchEnd={this.handleTouchEndRemove}
				onTouchStart={this.handleTouchStart}
				onTouchMove={this.handleTouchMove}
			>
				&times;
			</span>
		);
	},

	renderLabel() {
		let className = 'Select-value-label';
		return this.props.onClick || this.props.value.href ? (
			<a
				className={className}
				href={this.props.value.href}
				target={this.props.value.target}
				onMouseDown={this.handleMouseDown}
				onTouchEnd={this.handleMouseDown}
			>
				{this.props.children}
			</a>
		) : (
			<span className={className} role="option" aria-selected="true" id={this.props.id}>
				{this.props.children}
			</span>
		);
	},

	render() {
		return (
			<div
				className={classNames('Select-value', this.props.value.className)}
				style={this.props.value.style}
				title={this.props.value.title}
			>
				{this.renderRemoveIcon()}
				{this.renderLabel()}
			</div>
		);
	}
});

export default Value;
