import { Browser, Store, Selectors, Defaults } from './globals';

import hideAllPoppers from './hideAllPoppers';

import closest from '../utils/closest';
import find from '../utils/find';

/**
* To run a single time, once DOM is presumed to be ready
* @return {Boolean} whether the function has run or not
*/
export default function init() {
    if (init.done) return false;
    init.done = true;

    // If the script is in <head>, document.body is null, so it's set in the
    // init function
    Defaults.appendTo = document.body;

    const mousemoveHandler = (() => {
        let time;

        return () => {
            const now = performance && performance.now();

            if (now && now - time < 10) {
                Browser.touch = false;
                document.removeEventListener('mousemove', mousemoveHandler);
                if (!Browser.iOS() && document.body.classList.contains('tippy-touch')) {
                    document.body.classList.remove('tippy-touch');
                }
            }

            time = now;
        };
    })();

    const touchHandler = () => {
        Browser.touch = true;

        if (Browser.iOS()) {
            document.body.classList.add('tippy-touch');
        }

        if (Browser.dynamicInputDetection) {
            document.addEventListener('mousemove', mousemoveHandler);
        }
    };

    const clickHandler = event => {
        // Simulated events dispatched on the document
        if (!(event.target instanceof Element)) {
            return hideAllPoppers();
        }

        const el = closest(event.target, Selectors.TOOLTIPPED_EL);
        const popper = closest(event.target, Selectors.POPPER);

        if (popper) {
            const ref = find(Store, ref => ref.popper === popper);
            if (typeof ref === 'undefined') return;
            const { settings: { interactive } } = ref;
            if (interactive) return;
        }

        if (el) {
            const ref = find(Store, ref => ref.el === el);
            if (typeof ref === 'undefined') return;
            const { settings: { hideOnClick, multiple, trigger } } = ref;

            // If they clicked before the show() was to fire, clear it

            // Hide all poppers except the one belonging to the element that was clicked IF
            // `multiple` is false AND they are a touch user, OR
            // `multiple` is false AND it's triggered by a click
            if ((!multiple && Browser.touch) || (!multiple && trigger.indexOf('click') !== -1)) {
                return hideAllPoppers(ref);
            }

            // If hideOnClick is not strictly true or triggered by a click don't hide poppers
            if (hideOnClick !== true || trigger.indexOf('click') !== -1) return;
        }

        // Don't trigger a hide for tippy controllers, and don't needlessly run loop
        if (closest(event.target, Selectors.CONTROLLER) || !document.querySelector(Selectors.POPPER)) return;

        hideAllPoppers();
    };

    // Hook events
    document.addEventListener('click', clickHandler);
    document.addEventListener('touchstart', touchHandler);

    if (!Browser.SUPPORTS_TOUCH && (navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)) {
        document.addEventListener('pointerdown', touchHandler);
    }

    return true;
}
