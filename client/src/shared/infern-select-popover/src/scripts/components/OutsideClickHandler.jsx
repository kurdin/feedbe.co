import { Component, createElement } from 'react';
// import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { addEventListener } from 'consolidated-events';

const defaultProps = {
	children: <span />,
	component: 'div',
	ignoreClass: 'ignore-onclickoutside',
	onOutsideClick() {}
};

export default class OutsideClickHandler extends Component {
	constructor(props) {
		super(props);
		this.onOutsideClick = this.onOutsideClick.bind(this);
	}

	componentDidMount() {
		// `capture` flag is set to true so that a `stopPropagation` in the children
		// will not prevent all outside click handlers from firing - maja
		this.clickHandle = addEventListener(document, 'click', this.onOutsideClick, { capture: true });
	}

	componentWillUnmount() {
		if (this.clickHandle) this.clickHandle();
	}

	onOutsideClick(e) {
		const { onOutsideClick } = this.props;
		const { childNode } = this;

		const isDescendantOfRoot = childNode && childNode.contains(e.target);
		if (!isDescendantOfRoot && !e.target.classList.contains(this.props.ignoreClass)) {
			onOutsideClick(e);
		}
	}

	render() {
		const { component, children, ...props } = this.props;
		let ref = ref => {
			this.childNode = ref;
		};

		// return <div ref={ref}>{this.props.children}</div>;

		// if (typeof component === 'string') {
		// 	return createVNode(
		// 		VNodeFlags.HtmlElement,
		// 		component,
		// 		props ? props.className : null,
		// 		children,
		// 		ChildFlags.UnknownChildren,
		// 		props,
		// 		null,
		// 		ref
		// 	);
		// }

		return createElement(
			component,
			{
				props,
				ref
			},
			children
		);
	}
}

OutsideClickHandler.defaultProps = defaultProps;
