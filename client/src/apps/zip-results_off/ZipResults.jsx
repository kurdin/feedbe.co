/*globals $, window, Array */
/*Messages Main JSX Compoment*/

import { Component } from 'react';
import debounce from 'lodash/debounce';
import addClass from 'classnames';
// import { Link } from 'inferno-router';

// import Sandbox from '../main/sandbox.js';
// import NewCodeForm from './New-Code-Form';
// import RemoveCodeModal from './Remove-Code-Modal';
import ProviderBlock from './ProviderBlock';
import noScroll from 'shared/noScroll';
import { observer, inject } from 'react-mobx';
// import Clipboard from 'clipboard';
import select from 'select';
import copy from 'copy-to-clipboard';

const componentName = 'Zip Results';

const uniqueArr = (arrArg, key) =>
	arrArg.filter(
		(elem, pos, arr) =>
			arr.findIndex(t => {
				return key ? t[key] === elem[key] : t === elem;
			}) === pos
	);

// const sandbox = new Sandbox(generateUUID());
@inject('store')
@observer
class ZipResults extends Component {
	static displayName = componentName;
	elements = {};
	editorInited = false;
	submiting = false;
	form = {
		active: true
	};

	constructor(props) {
		super(props);
		this.store = props.store;
		let examples = props.examples || [];
		this.baseUrl = props.baseUrl;
		const { params } = props.match;
		const code = examples.filter(code => code.id === params.id)[0] || null;
		this.state = {
			examples: examples,
			examplesFiltered: null,
			catSelected: null,
			tagsSelected: [],
			errors: {},
			view: props.doView ? { code } : null,
			clear: false
		};
		this.buildTagsAndCategories(examples);
		if (props.doRun) {
			let code = examples.filter(code => code.id === params.id)[0];
			if (code && code.code) this.runCode(code.code);
		} else if (props.doViewCategory) {
			let catName = params.name;
			let code = examples.filter(code => slugify(code.category) === catName)[0];
			if (code && code.code) {
				/* eslint-disable */
				this.state.catSelected = code.category;
				this.state.navSelected = 'categories';
				this.state.examplesFiltered = this.applyFilters(false);
				/* eslint-enable */
				this.slideToExamples();
			}
		} else if (props.doViewTag && this.tagOptions) {
			let tagName = params.name;
			let tag = this.tagOptions.filter(tag => slugify(tag.label) === tagName)[0];
			if (tag) {
				/* eslint-disable */
				this.state.tagsSelected = [tagName];
				this.state.navSelected = 'tags';
				this.state.examplesFiltered = this.applyFilters(false);
				/* eslint-enable */
				this.slideToExamples();
			}
		}
	}

	buildTagsAndCategories(examples = []) {
		let tags = [];
		let category = [];
		examples.forEach(code => {
			category.push({ label: code.category });
			tags = uniqueArr(tags.concat(code.tags));
		});
		this.tagOptions = tags.map(tag => {
			return { label: tag };
		});
		let categoryWithCount = {};
		category.forEach(cat => {
			categoryWithCount[cat.label] = (categoryWithCount[cat.label] || 0) + 1;
		});
		this.categoryOptions = Object.keys(categoryWithCount).map(cat => ({
			label: cat,
			count: categoryWithCount[cat]
		}));
	}

	scrollTo(el, time = 600, offset = 0) {
		if (!el) return;
		$('html, body').animate(
			{
				scrollTop: $(el).offset().top + offset
			},
			time
		);
	}

	setUrl(path, method = 'pushState') {
		if (typeof window === 'undefined') return;
		if (window.history && !window.history.pushState) return;
		var params = window.location.search || '';
		this.baseUrl = this.baseUrl === '/' ? '' : this.baseUrl;
		window.history[method ? 'replaceState' : method]({}, '', this.baseUrl + path + params);
	}

	runCode(code, scrolltime = 800) {
		let t = $('#framewrap').offset();
		let codeBlock = this.props.editor.bottomBlock;
		codeBlock.editor.setValue('');
		$('html, body')
			.stop(true)
			.animate(
				{
					scrollTop: t.top
				},
				scrolltime,
				'easeOutQuart'
			)
			.promise()
			.then(() => {
				codeBlock.editor.setValue(code);
				codeBlock.editor.refresh();
				codeBlock.editor.focus();
				codeBlock.run();
			});
	}

	applyFilters(setState = true) {
		let examplesFiltered = this.state.examples;
		let filter = this.filterTerm;
		let category = this.state.catSelected;
		let tags = this.state.tagsSelected;

		if (category) {
			examplesFiltered = examplesFiltered.filter(code => code.category.indexOf(category) !== -1);
		} else if (tags && tags.length) {
			examplesFiltered = examplesFiltered.filter(code => {
				let found = code.tags.filter(function(n) {
					return tags.indexOf(n) !== -1;
				});
				if (found.length) return true;
				else return false;
			});
		}

		if (this.filterTerm) {
			examplesFiltered = examplesFiltered.filter(code => {
				return (
					code.name.toLowerCase().indexOf(filter) !== -1 ||
					code.id.toLowerCase().indexOf(filter) !== -1 ||
					code.category.toLowerCase().indexOf(filter) !== -1 ||
					code.description.toLowerCase().indexOf(filter) !== -1
				);
			});
		}
		if (setState) {
			this.setState({
				examplesFiltered: examplesFiltered
			});
		} else {
			return examplesFiltered;
		}
	}

	slideToExamples() {
		var t = $('.api-examples').offset();
		$('html, body')
			.stop(true)
			.animate(
				{
					scrollTop: t.top
				},
				1000,
				'easeOutQuart'
			);
	}

	on = {
		card: {
			run: (code, id) => e => {
				e.preventDefault();
				e.stopPropagation();
				this.runCode(code);
				this.setUrl('/' + id);
			},
			copy: (code, id) => e => {
				e.preventDefault();
				e.stopPropagation();
				let copied = copy(code);
				if (copied)
					this.setState({
						copied: id
					});
				let selectTextPre = $(e.currentTarget).parent();
				if (selectTextPre && selectTextPre.length > 0) select(selectTextPre[0]);
			},
			view: id => e => {
				e.preventDefault();
				let viewCode = this.state.examples.filter(code => code.id === id);
				this.setUrl('/' + slugify(viewCode[0].name) + '/' + viewCode[0].id);
				this.setState({
					view: {
						code: viewCode[0]
					}
				});
			}
		},
		navlist: {
			menuToggle: e => {
				e.preventDefault();
				this.setState({
					navListMenuOpen: this.state.navListMenuOpen ? false : true
				});
			},
			selectTags: name => e => {
				e.preventDefault();
				let selected = this.state.tagsSelected;
				let nameIndex = selected.indexOf(name);
				if (nameIndex === -1) {
					selected.push(name);
				} else selected.splice(nameIndex, 1);
				this.setState(
					{
						tagsSelected: selected
					},
					() => {
						this.applyFilters();
					}
				);
			},
			selectCat: name => e => {
				e.preventDefault();
				this.setState(
					{
						catSelected: this.state.catSelected === name ? null : name
					},
					() => {
						this.applyFilters();
					}
				);
			},
			select: navitem => e => {
				e.preventDefault();
				this.setState(
					{
						navSelected: navitem,
						navListMenuOpen: false,
						catSelected: null,
						tagsSelected: []
					},
					() => {
						this.applyFilters();
					}
				);
			},
			categories: e => {
				e.preventDefault();
				this.setState(
					{
						navSelected: this.state.navSelected === 'categories' ? null : 'categories',
						catSelected: null,
						navListMenuOpen: false,
						tagsSelected: []
					},
					() => {
						this.applyFilters();
					}
				);
			},
			tags: e => {
				e.preventDefault();
				this.setState(
					{
						navSelected: this.state.navSelected === 'tags' ? null : 'tags',
						catSelected: null,
						navListMenuOpen: false,
						tagsSelected: []
					},
					() => {
						this.applyFilters();
					}
				);
			}
		},
		modal: {
			selectTag: name => e => {
				e.preventDefault();
				this.setUrl('/tag/' + slugify(name));
				this.setState(
					{
						view: null,
						catSelected: null,
						navSelected: 'tags',
						tagsSelected: [name]
					},
					() => {
						this.applyFilters();
						this.slideToExamples();
					}
				);
			},
			selectCat: name => e => {
				e.preventDefault();
				this.setUrl('/cat/' + slugify(name));
				this.setState(
					{
						view: null,
						catSelected: name,
						navSelected: 'categories'
					},
					() => {
						this.applyFilters();
						this.slideToExamples();
					}
				);
			},
			run: (code, id) => e => {
				e.preventDefault();
				e.stopPropagation();
				this.setUrl('/' + id);
				this.setState(
					{
						view: null
					},
					() => {
						this.runCode(code);
					}
				);
			},
			cancelCodeRemove: e => {
				e.preventDefault();
				this.setUrl('/');
				this.setState({
					view: null
				});
			}
		},
		list: {
			inputFilter: debounce(e => {
				e.preventDefault();
				this.filterTerm = e.target.value && e.target.value.toLowerCase();
				this.applyFilters();
			}, 100),
			removeFilter: e => {
				e.preventDefault();
				this.filterTerm = null;
				this.applyFilters();
			}
		}
	};

	_componentWillMount() {
		console.log('in componentWillMount');
	}

	_componentWillUnmount() {
		// this.clipboard.destroy();
	}

	_componentDidUnmount() {
		console.log('in componentDidUnmount, lets clean');
	}

	_shouldComponentUpdate() {
		// return false;
	}

	componentDidUpdate() {
		if (this.state.viewId) {
			this.scrollTo('#' + this.state.viewId);
		}
	}

	componentWillUpdate() {}

	handleKeyDown = e => {
		var intKey = window.Event ? e.which : e.keyCode;
		if (intKey === 27) {
			this.on.modal.cancelCodeRemove(e);
		}
	};

	removeKeysEvent() {
		noScroll.off();
		window.removeEventListener('keydown', this.handleKeyDown, false);
	}

	addKeysEvent() {
		noScroll.on();
		window.addEventListener('keydown', this.handleKeyDown, false);
	}

	render({ store }) {
		const { getCount, plusCount } = store;
		let { navSelected, copied, catSelected, tagsSelected, navListMenuOpen } = this.state;

		let examples = this.state.examplesFiltered ? this.state.examplesFiltered : this.state.examples;
		let examplesTotal = this.state.examples.length;
		let filtered = examples.length !== examplesTotal ? true : false;
		let mainDIVstyle = {};
		if (filtered && this.elements.maindiv) {
			mainDIVstyle = { height: this.elements.maindiv.clientHeight };
		}

		return (
			<div ref={ref => (this.elements.maindiv = ref)} style={mainDIVstyle}>
				<div class="box">
					<nav class="nav">
						<div class="nav-left">
							<div class="nav-item">
								<div class="field has-addons">
									<p class="control">
										{this.filterTerm && (
											<a href="#" title="Remove Filter" class="removeFilter icon" onClick={this.on.list.removeFilter}>
												&#205;
											</a>
										)}
										<input
											class="input is-medium"
											onInput={this.on.list.inputFilter}
											type="text"
											placeholder="Filter..."
											value={getCount}
										/>
										<button onClick={plusCount}>Add to Counter</button>
									</p>
								</div>
							</div>
							<div class="nav-item">
								<p class="subtitle is-5">
									{filtered ? (
										<span>
											<strong>{examples.length}</strong> found
										</span>
									) : (
										<span>
											<strong>{examplesTotal}</strong> examples
										</span>
									)}
								</p>
							</div>
						</div>
						<span class={addClass({ 'is-active': navListMenuOpen }, 'nav-toggle')} onClick={this.on.navlist.menuToggle}>
							<span />
							<span />
							<span />
						</span>
						<div class={addClass({ 'is-active': navListMenuOpen }, 'nav-right nav-menu main-nav')}>
							<a
								class={addClass({ 'is-active': navSelected === 'categories' }, 'nav-item is-tab')}
								onClick={this.on.navlist.categories}
							>
								Categories <span class={addClass({ flip: navSelected === 'categories' }, 'icon-angle-down')} />
							</a>
							<a
								class={addClass({ 'is-active': navSelected === 'tags' }, 'nav-item is-tab')}
								onClick={this.on.navlist.tags}
							>
								Tags <span class={addClass({ flip: navSelected === 'tags' }, 'icon-angle-down')} />
							</a>
							<a
								class={addClass({ 'is-active': !navSelected }, 'nav-item is-tab')}
								onClick={this.on.navlist.select(null)}
							>
								All
							</a>
							{/*<a class={ addClass({'is-active': navSelected === 'popular'}, 'nav-item is-tab') } onClick={ this.on.navlist.select('popular') }>Popular</a>
							 */}
							<span class="nav-item">
								{/*
          <a class={ addClass({'is-primary': navSelected === 'favorites'}, 'button') } onClick={ this.on.navlist.select('favorites') }><span class="icon">&#0083;</span> <span>Favorites</span>
          </a>
        	*/}
							</span>
						</div>
					</nav>
				</div>

				{navSelected === 'categories' && (
					<div class="columns-cats">
						{this.categoryOptions.map(cat => (
							<a
								href="#"
								class={addClass({ 'is-primary': catSelected === cat.label }, 'cat tag is-medium')}
								onClick={this.on.navlist.selectCat(cat.label)}
							>
								{cat.label}
							</a>
						))}
					</div>
				)}

				{navSelected === 'tags' && (
					<div class="columns-tags">
						{this.tagOptions.map(tag => (
							<a
								href="#"
								class={addClass(
									{ 'is-info': tagsSelected.indexOf(tag.label) === -1 },
									{ 'is-primary': tagsSelected.indexOf(tag.label) !== -1 },
									'tag'
								)}
								onClick={this.on.navlist.selectTags(tag.label)}
							>
								{tag.label}
							</a>
						))}
					</div>
				)}

				<div class="columns">
					<div class="column is-narrow">
						<div class="box" style={{ width: 200, height: '100%' }}>
							<p class="title is-5">Narrow column</p>
						</div>
					</div>
					<div class="column content">
						<div>
							<div class="columns is-multiline">
								{examples.length > 0 ? (
									examples.map(example => (
										<ProviderBlock on={this.on.card} key={example.id} copied={copied} example={example} />
									))
								) : (
									<div class="column">
										<div class="has-text-centered is-6">Nothing Found :( Change Zip code or extend search radius</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default ZipResults;

function slugify(text) {
	return text
		.toString()
		.toLowerCase()
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(/&/g, '-and-') // Replace & with 'and'
		.replace(/[^\w-]+/g, '') // Remove all non-word chars
		.replace(/--+/g, '-') // Replace multiple - with single -
		.replace(/^-+/, '') // Trim - from start of text
		.replace(/-+$/, ''); // Trim - from end of text
}
