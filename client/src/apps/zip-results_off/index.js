/*global $ */

import ReactDom from 'react-dom';
import { ZipRouter } from './ZipRoutes.jsx';
import ZipSearch from '../main/ZipSearch.jsx';
import ZipStore from '../../stores/zipStore';
import { Provider } from 'react-mobx';

const { render, hydrate } = ReactDom;

const datashared = window.datashared || {};
const { providers, zip, zipData } = datashared;

hydrate(
	<Provider store={ZipStore}>
		<ZipRouter examples={providers} autoCompleteZips={zipData} baseUrl={`/${zip}`} />
	</Provider>,
	document.getElementById('app')
);
render(
	<Provider store={ZipStore}>
		<ZipSearch zip={zip} autoCompleteZips={zipData} />
	</Provider>,
	document.getElementById('zip-search')
);

/*eslint-disable */
// UItoTop.jQuery
// jQuery easing extended
$.easing['jswing'] = $.easing['swing'];
$.extend($.easing, {
	def: 'easeOutQuad',
	swing: function(a, b, c, d, e) {
		return $.easing[$.easing.def](a, b, c, d, e);
	},
	easeInQuad: function(a, b, c, d, e) {
		return d * (b /= e) * b + c;
	},
	easeOutQuad: function(a, b, c, d, e) {
		return -d * (b /= e) * (b - 2) + c;
	},
	easeInOutQuad: function(a, b, c, d, e) {
		if ((b /= e / 2) < 1) return (d / 2) * b * b + c;
		return (-d / 2) * (--b * (b - 2) - 1) + c;
	},
	easeInCubic: function(a, b, c, d, e) {
		return d * (b /= e) * b * b + c;
	},
	easeOutCubic: function(a, b, c, d, e) {
		return d * ((b = b / e - 1) * b * b + 1) + c;
	},
	easeInOutCubic: function(a, b, c, d, e) {
		if ((b /= e / 2) < 1) return (d / 2) * b * b * b + c;
		return (d / 2) * ((b -= 2) * b * b + 2) + c;
	},
	easeInQuart: function(a, b, c, d, e) {
		return d * (b /= e) * b * b * b + c;
	},
	easeOutQuart: function(a, b, c, d, e) {
		return -d * ((b = b / e - 1) * b * b * b - 1) + c;
	},
	easeInOutQuart: function(a, b, c, d, e) {
		if ((b /= e / 2) < 1) return (d / 2) * b * b * b * b + c;
		return (-d / 2) * ((b -= 2) * b * b * b - 2) + c;
	},
	easeInQuint: function(a, b, c, d, e) {
		return d * (b /= e) * b * b * b * b + c;
	},
	easeOutQuint: function(a, b, c, d, e) {
		return d * ((b = b / e - 1) * b * b * b * b + 1) + c;
	},
	easeInOutQuint: function(a, b, c, d, e) {
		if ((b /= e / 2) < 1) return (d / 2) * b * b * b * b * b + c;
		return (d / 2) * ((b -= 2) * b * b * b * b + 2) + c;
	},
	easeInSine: function(a, b, c, d, e) {
		return -d * Math.cos((b / e) * (Math.PI / 2)) + d + c;
	}
});

(function(e) {
	e.fn.UItoTop = function(t) {
		var n = {
				text: 'To Top',
				min: 800,
				inDelay: 600,
				outDelay: 400,
				containerID: 'toTop',
				containerHoverID: 'toTopHover',
				scrollSpeed: 1200,
				easingType: 'linear'
			},
			r = e.extend(n, t),
			i = '#' + r.containerID;

		t = e('#top').offset();
		var s = '#' + r.containerHoverID;
		e('body').append('<a href="#" id="' + r.containerID + '">' + r.text + '</a>');
		e(i)
			.hide()
			.on('click.UItoTop', function() {
				e('html, body')
					.stop(true)
					.animate(
						{
							scrollTop: t.top
						},
						1000,
						'easeInOutQuint'
					);
				e('#' + r.containerHoverID, this)
					.stop()
					.animate(
						{
							opacity: 0
						},
						r.inDelay,
						r.easingType
					);
				return false;
			})
			.prepend('<span id="' + r.containerHoverID + '"></span>')
			.hover(
				function() {
					e(s, this)
						.stop()
						.animate(
							{
								opacity: 1
							},
							600,
							'linear'
						);
				},
				function() {
					e(s, this)
						.stop()
						.animate(
							{
								opacity: 0
							},
							700,
							'linear'
						);
				}
			);
		e(window).scroll(function() {
			var t = e(window).scrollTop();
			if (t > r.min) e(i).fadeIn(r.inDelay);
			else e(i).fadeOut(r.Outdelay);
		});
	};
})($);

function ln(err) {
	var e = new Error(err);
	if (!e.stack)
		try {
			// IE requires the Error to actually be throw or else the Error's 'stack'
			// property is undefined.
			throw e;
		} catch (e) {
			if (!e.stack) {
				return 0; // IE < 10, likely
			}
		}
	var stack = e.stack.toString().split(/\r\n|\n/);
	// We want our caller's frame. It's index into |stack| depends on the
	// browser and browser version, so we need to search for the second frame:
	var frameRE = /:(\d+):(?:\d+)[^\d]*$/;
	do {
		var frame = stack.shift();
	} while (!frameRE.exec(frame) && stack.length);
	return frameRE.exec(stack.shift())[1];
}

$().UItoTop();

$().ready(() => {
	$('.home-image-loader').remove();
});
