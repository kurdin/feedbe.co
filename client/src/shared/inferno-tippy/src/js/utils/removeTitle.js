/**
* Removes the title from the tooltipped element
* @param {Element} el
*/
export default function removeTitle(el) {
	const title = el.getAttribute('title') !== 'undefined' ? el.getAttribute('title') : 'html';
	el.setAttribute('data-original-title', title);
	el.removeAttribute('title');
}
