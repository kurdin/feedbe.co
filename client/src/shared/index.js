/* globals $$*/
import { createElement } from 'react';
const Link = props => {
	// var router = ref.router;

	var activeClassName = props.activeClassName;
	var activeStyle = props.activeStyle;
	var className = props.className;
	var onClick = props.onClick;
	var to = props.to;
	var elemProps = {};
	if (className) {
		elemProps.className = className;
	}
	// if (router.location.pathname === to) {
	//     if (activeClassName) {
	//         elemProps.className = (className ? className + ' ' : '') + activeClassName;
	//     }
	//     if (activeStyle) {
	//         elemProps.style = Object.assign({}, props.style, activeStyle);
	//     }
	// }
	// let url = to.replace(/\/\/+/g, '/');
	elemProps.href = to;
	elemProps.onclick = function navigate(e) {
		if (e.button !== 0 || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) {
			return;
		}
		e.preventDefault();
		if (typeof onClick === 'function') {
			onClick(e);
		}
		$$.SuperAction.CHANGE_VIEW(to);
		$$.router.setUrl(to.substr(1));

		// router.push(to, e.target.textContent);
	};

	return createElement('a', elemProps, props.children);
};

export { Link };
