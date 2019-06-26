/*globals $, window, Array, CodeMirror*/
/*Messages Main JSX Compoment*/

import { Component } from 'react';
import debounce from 'lodash/debounce';
import addClass from 'classnames';
import { Link } from 'inferno-router';
import { JSXFilters } from '../../shared/filters';

import Sandbox from '../main/sandbox.js';
import NewCodeForm from './NewCodeForm';
import RemoveCodeModal from './RemoveCodeModal';
import ViewCodeModal from './RemoveCodeModal';
import axios from 'axios';

const componentName = 'Admin Main';
const defaultCode = '/* Enter ES6 Code HERE, Click [VERIFY] to check your code then press SAVE */';

// const STATES = require('./data/states');
const schema = require('../../shared/validate');
const filter = new JSXFilters();
const uniqueArr = arrArg => arrArg.filter((elem, pos, arr) => arr.indexOf(elem) === pos);

const NewCodeFormSchema = schema({
	id: {
		type: 'string'
	},
	name: {
		type: 'string',
		required: true,
		message: 'Name is required.'
	},
	active: {
		type: 'boolean'
	},
	category: {
		type: 'string',
		required: true,
		message: 'Category is required.'
	},
	description: {
		type: 'string',
		required: true,
		message: 'Description is required.'
	},
	code: {
		type: 'string',
		required: true,
		message: 'Code is not entered or empty.'
	},
	tags: {
		type: 'array',
		required: true,
		message: 'Tags is required.'
	}
});

const sandbox = new Sandbox(generateUUID());

class AdminMain extends Component {
	static displayName = componentName;
	elements = {};
	editorInited = false;
	submiting = false;
	form = {
		active: true
	};

	constructor(props) {
		super(props);
		// props.match.params.paramName
		const params = props.match.params;
		let examples = props.providers || [];
		this.baseUrl = props.baseUrl;
		this.state = {
			addNew: props.addNew ? true : false,
			examples: examples,
			edit: props.doEdit ? true : false,
			examplesFiltered: null,
			errorMessage: null,
			errors: {},
			view: props.doView
				? {
						code: examples.filter(code => code.id === params.id)[0]
				  }
				: null,
			clear: false
		};

		if (props.doEdit && params.id) {
			this.editCode(params.id, true);
		}
		this.tagOptions = [];
		this.buildTagsAndCategories(this.state.examples);
	}

	buildTagsAndCategories(examples = []) {
		let tags = [];
		let category = [];
		examples.forEach(code => {
			category.push(code.category);
			category = uniqueArr(category);
			tags = uniqueArr(tags.concat(code.tags));
		});
		this.tagOptions = tags.map(tag => {
			return { label: tag, value: tag };
		});
		this.categoryOptions = category.map(cat => {
			return { label: cat, value: cat };
		});
	}

	scrollTo(el, time = 600) {
		$('html, body').animate(
			{
				scrollTop: $(el).offset().top + 80
			},
			time
		);
	}

	setUrl(path, method = 'pushState') {
		if (typeof window === 'undefined') return;
		if (window.history && !window.history.pushState) return;
		var params = window.location.search || '';
		window.history[method ? 'replaceState' : method]({}, '', this.baseUrl + path + params);
	}

	editCode(id, init = false) {
		let editCode = this.state.examples.filter(code => code.id === id);
		this.form = Object.assign({}, editCode[0]);
		if (!init) {
			this.setUrl('/edit/' + id);
			this.clearForm(() => {
				this.form = Object.assign({}, editCode[0]);
				this.setState({
					addNew: false,
					edit: true
				});
			});
		}
		this.scrollTo('#admin', 600);
	}

	on = {
		modal: {
			editCode: id => e => {
				e.preventDefault();
				this.editCode(id);
				this.setState({
					doremove: false,
					view: null,
					remove: null,
					errors: {
						remove: null
					}
				});
			},
			cancelCodeRemove: e => {
				e.preventDefault();
				this.setUrl('/');
				this.setState({
					doremove: false,
					view: null,
					remove: null,
					errors: {
						remove: null
					}
				});
			},
			removeCode: e => {
				e.preventDefault();
				if (this.state.doremove && this.state.remove && this.state.remove.code) {
					axios
						.delete('/admin/code/remove/' + this.state.remove.code.id)
						.then(response => {
							if (response.data && response.data.status === 'ok') {
								let newExamples = this.state.examples.filter(code => code.id !== response.data.id);
								this.buildTagsAndCategories(newExamples);
								this.setState({
									examples: newExamples,
									remove: null,
									doremove: false,
									removing: false,
									errors: {
										remove: null
									}
								});
							}
						})
						.catch(error => {
							this.setState({
								doremove: false,
								removing: false,
								errors: {
									remove: error.message
								}
							});
						});
					this.setState({
						doremove: false,
						removing: true
					});
				} else {
					this.setState({
						doremove: true
					});
				}
			},
			removeCancelCode: e => {
				e.preventDefault();
				this.setState({
					doremove: false,
					removing: false
				});
			}
		},
		list: {
			inputFilter: e => {
				e.preventDefault();
				let filter = e.target.value && e.target.value.toLowerCase();
				let examplesFiltered = this.state.examples.filter(code => {
					return (
						code.name.toLowerCase().indexOf(filter) !== -1 ||
						code.id.toLowerCase().indexOf(filter) !== -1 ||
						code.category.toLowerCase().indexOf(filter) !== -1 ||
						code.description.toLowerCase().indexOf(filter) !== -1
					);
				});
				if (!filter) examplesFiltered = null;
				this.filterTerm = filter;
				this.setState({
					examplesFiltered: examplesFiltered
				});
			},
			removeFilter: e => {
				e.preventDefault();
				this.filterTerm = null;
				this.setState({
					examplesFiltered: null
				});
			},
			cloneCode: id => e => {
				e.preventDefault();
				this.clearForm(() => {
					let cloneCode = this.state.examples.filter(code => code.id === id);
					this.form = Object.assign({}, cloneCode[0]);
					delete this.form.id;
					this.context.router.push('/edit/' + id);
					this.setState({
						addNew: true,
						edit: false
					});
					this.scrollTo('#admin', 300);
				});
			},
			removeCode: id => e => {
				e.preventDefault();
				let removecode = this.state.examples.filter(code => code.id === id);
				this.setState({
					remove: {
						code: removecode[0]
					}
				});
			},
			viewCode: id => e => {
				e.preventDefault();
				let viewCode = this.state.examples.filter(code => code.id === id);
				this.setUrl('/' + id);
				this.setState({
					view: {
						code: viewCode[0]
					}
				});
			},
			editCode: id => e => {
				e.preventDefault();
				this.editCode(id);
			}
		},
		form: {
			tags: e => {
				this.form['tags'] = e.value;
				if (e.value.length > 0) this.on.checkErrors('tags');
			},
			checkbox: input => e => {
				this.form[input] = e.target.checked;
				this.forceUpdate();
			},
			input: input =>
				debounce(e => {
					// console.log(e.target.value);
					this.form[input] = e.target.value;
					if (e.target.value && this.state.errors[input]) this.on.checkErrors(input);
				}, 100),
			onChange: input => value => {
				this.form[input] = value;
				if (value && this.state.errors[input]) this.on.checkErrors(input);
				this.forceUpdate();
			}
		},

		editor: {
			codeVerify: e => {
				if (this.errorLine) {
					this.editor.removeLineClass(this.errorLine, 'background', 'line-error');
					this.errorLine = null;
				}
				if (this.errorMessage) this.setState({ errorMessage: null });
				let code = this.form.code || null;
				sandbox.runCode(code, res => {
					if (!code && typeof e === 'function') return e('err');
					if (res.error) {
						if (res.error.line) {
							this.editor.addLineClass(res.error.line - 1, 'background', 'line-error');
							this.errorLine = this.editor.getLineHandle(res.error.line - 1);
						}
						if (res.error.message) this.setState({ noError: false, errorMessage: res.error.message });
						$('.CodeMirror, .CodeMirror-gutters', this.elements.editorElement).animate(
							{
								backgroundColor: '#FBC2C4'
							},
							30,
							function() {
								$(this).animate(
									{
										backgroundColor: '#F1F5ED'
									},
									230
								);
							}
						);
					} else if (res.ok) {
						this.setState({ noError: true });
						if (typeof e === 'function') e();
						$('.CodeMirror, .CodeMirror-gutters', this.elements.editorElement).animate(
							{
								backgroundColor: '#89ED55'
							},
							60,
							function() {
								$(this).animate(
									{
										backgroundColor: '#F1F5ED'
									},
									230
								);
							}
						);
					}
				});
			},

			change: editor => {
				this.submiting = false;
				if (this.state.noError !== null) {
					this.setState({
						noError: null,
						errorMessage: null
					});
				}
				if (this.errorLine) {
					this.editor.removeLineClass(this.errorLine, 'background', 'line-error');
					this.errorLine = null;
				}
				this.form.code = editor.getValue();
				if (this.state.errors.code) this.on.checkErrors('code');
				return false;
			},

			saveNewCode: e => {
				e.preventDefault();
				this.submiting = true;
				this.on.editor.codeVerify(() => {
					let isErrors = this.on.checkErrors(null);
					if (!isErrors) {
						let url = this.state.edit && this.form.id ? `/admin/code/update/${this.form.id}` : '/admin/code/add';
						axios
							.post(url, this.form)
							.then(response => {
								if (response.data && response.data.status === 'ok') {
									this.submiting = false;
									let newExamples = [...this.state.examples];
									if (response.data.updatedCode) {
										let updatedCode = newExamples.filter(code => code.id === response.data.updatedCode.id);
										let index = this.state.examples.indexOf(updatedCode[0]);
										newExamples[index] = response.data.updatedCode;
									} else if (response.data.newcode) newExamples.unshift(response.data.newcode);
									this.buildTagsAndCategories(newExamples);
									this.setState(
										{
											edit: false,
											examples: newExamples
										},
										this.clearForm
									);
								}
							})
							.catch(error => {
								this.submiting = false;
								this.setState({
									errors: {
										submit: error.message
									}
								});
							});
					}
					this.submiting = false;
				});
			}
		},

		checkErrors: input => {
			// return false;
			let errors = NewCodeFormSchema.validate(this.form);
			let formErrors = {};
			errors.forEach(err => {
				formErrors[err.path] = err.message;
			});
			if (input && formErrors[input] === this.state.errors[input]) return true;
			if (formErrors !== this.state.errors) {
				this.setState({
					errors: formErrors,
					noError: this.state.noError === true ? null : this.state.noError
				});
			}
			if (errors.length > 0) {
				return true;
			} else {
				return false;
			}
		},

		// addNewCode: e => {
		// 	if (this.state.edit) {
		// 		this.form = {
		// 			active: true
		// 		};
		// 	}
		// 	e.preventDefault();
		// 	if (this.state.addNew) this.context.router.push('/');
		// 	else this.context.router.push('/new');
		// 	this.setState({
		// 		addNew: !this.state.addNew,
		// 		edit: false
		// 	});
		// },

		cloneCode: e => {
			e.preventDefault();
			delete this.form.id;
			this.setState({
				addNew: true,
				edit: false
			});
		},

		cancelNewCode: e => {
			e.preventDefault();
			this.clearForm();
			this.context.router.push('/');
			this.setState({
				edit: false,
				addNew: false
			});
		},

		cancelClearNewCode: e => {
			e.preventDefault();
			this.setState({
				clear: false
			});
		},

		clearNewCode: e => {
			e.preventDefault();
			if (!this.state.clear) {
				this.setState({
					clear: true
				});
			} else {
				this.clearForm();
			}
		}
	};

	clearForm(cb) {
		this.form = {
			active: true
		};
		if (this.editor) this.editor.setValue(defaultCode);
		this.setState(
			{
				errors: {},
				clear: false
			},
			cb
		);
	}

	componentWillMount() {
		console.log('in componentWillMount');
	}

	componentWillUnmount() {
		console.log('componentWillUnmount, lets clearInterval');
	}

	componentDidUnmount() {
		console.log('in componentDidUnmount, lets clean');
	}

	_shouldComponentUpdate() {
		// return false;
	}

	componentWillUpdate() {}

	handleSubmit(event) {
		event.preventDefault();
		alert('Submiting form, input value is: ' + this.inputName.value);
		//this.setState({ name: this.inputName.value });
	}

	handleKeyDown = e => {
		var intKey = window.Event ? e.which : e.keyCode;
		if (intKey === 27) {
			this.on.modal.cancelCodeRemove(e);
		}
	};

	removeKeysEvent() {
		window.removeEventListener('keydown', this.handleKeyDown, false);
	}

	addKeysEvent() {
		window.addEventListener('keydown', this.handleKeyDown, false);
	}

	initCodeMirrorHightLightedCode() {
		return;
		this.addKeysEvent();
		let code = this.state.remove ? this.state.remove.code.code : this.state.view ? this.state.view.code.code : '';
		let mode = 'javascript';

		CodeMirror.runMode(code, mode, this.elements.removeCodeElement);
	}

	initCodeMirror() {
		return;
		let code = defaultCode;
		if (this.form.code && this.form.code.trim() !== '') {
			code = this.form.code;
		}

		if (this.editor) {
			this.editor.on('change', null);
			this.elements.editorElement.innerHTML = '';
		}

		this.editor = CodeMirror(this.elements.editorElement, {
			value: code,
			mode: 'javascript',
			lineNumbers: true,
			scrollbarStyle: 'simple',
			viewportMargin: Infinity,
			extraKeys: {
				'Ctrl-Enter': this.on.editor.codeVerify
				// "Ctrl-Space": "autocomplete"
			}
		});
		this.editor.on('change', this.on.editor.change);
		$(this.elements.editorElement)
			.off('click')
			.on('click', e => {
				e.preventDefault();
				if (this.editor.getValue() === defaultCode) {
					this.editor.execCommand('selectAll');
				}
			});
	}

	render() {
		let examples = this.state.examplesFiltered ? this.state.examplesFiltered : this.state.examples;
		let examplesTotal = this.state.examples.length;

		return (
			<div>
				<nav class="level">
					<div class="level-left">
						<div class="level-item">
							<div class="field has-addons">
								<p class="control">
									{this.state.examplesFiltered && (
										<a href="#" title="Remove Filter" class="removeFilter icon" onClick={this.on.list.removeFilter}>
											&#205;
										</a>
									)}
									<input
										class="input is-medium"
										onInput={this.on.list.inputFilter}
										type="text"
										placeholder="Filter"
										value={this.filterTerm}
									/>
								</p>
							</div>
						</div>
						<div class="level-item">
							<p class="subtitle is-medium has-text-left fixed-100">
								<strong>{examples.length}</strong> of <strong>{examplesTotal}</strong>
							</p>
						</div>
					</div>
					<div class="level-item">
						<p class="control">
							<Link
								class="add-new button is-medium is-primary"
								onClick2={this.on.addNewCode}
								to={this.state.addNew ? '/' : '/new'}
							>
								{this.state.addNew ? (
									<span>
										<span class="icon">&#205;</span>
										<b>CANCEL NEW CODE</b>
									</span>
								) : (
									<span>
										<span class="icon">&#192;</span>
										<b>ADD NEW CODE</b>
									</span>
								)}
							</Link>
						</p>
					</div>
				</nav>

				{this.state.addNew && (
					<NewCodeForm
						on={this.on}
						key="newcode"
						clear={this.state.clear}
						elements={this.elements}
						verifyError={this.state.errorMessage}
						errors={this.state.errors}
						onComponentDidMount={this.initCodeMirror.bind(this)}
						noVerifyError={this.state.noError}
						onComponentDidUpdate={this.initCodeMirror.bind(this)}
						form={this.form}
						submiting={this.submiting}
						submitted={this.state.submitted}
						tagOptions={this.tagOptions}
						categoryOptions={this.categoryOptions}
					/>
				)}

				{this.state.edit && (
					<NewCodeForm
						on={this.on}
						key="editcode"
						clear={this.state.clear}
						elements={this.elements}
						verifyError={this.state.errorMessage}
						errors={this.state.errors}
						onComponentDidMount={this.initCodeMirror.bind(this)}
						onComponentDidUpdate={this.initCodeMirror.bind(this)}
						noVerifyError={this.state.noError}
						form={this.form}
						edit={true}
						submiting={this.submiting}
						submitted={this.state.submitted}
						tagOptions={this.tagOptions}
						categoryOptions={this.categoryOptions}
					/>
				)}

				{this.state.remove && (
					<RemoveCodeModal
						key="removecode"
						removing={this.state.removing}
						remove={this.state.doremove}
						code={this.state.remove.code}
						on={this.on.modal}
						view={this.state.view}
						elements={this.elements}
						error={this.state.errors.remove}
						onComponentWillUnmount={this.removeKeysEvent.bind(this)}
					/>
				)}

				{this.state.view && (
					<ViewCodeModal
						onlist={this.on.list}
						key="viewcode"
						code={this.state.view.code}
						on={this.on.modal}
						viewOnly={true}
						elements={this.elements}
						onComponentWillUnmount={this.removeKeysEvent.bind(this)}
						error={null}
					/>
				)}

				<table class="table">
					<thead>
						<tr>
							<th class="is-narrow">id</th>
							<th>Name</th>
							<th>Description</th>
							<th>Category</th>
							<th>Tags</th>
							<th class="is-narrow">
								<abbr title="Favorites">Fav</abbr>
							</th>
							<th>Code</th>
							<th class="is-narrow">&nbsp;</th>
						</tr>
					</thead>
					<tbody>
						{examples.map(example => (
							<tr class={addClass({ disabled: !example.active }, 'row')}>
								<td class="is-narrow is-id">
									<a href="#" onClick={this.on.list.viewCode(example.id)}>
										{example.id}
									</a>{' '}
								</td>
								<td>{example.name}</td>
								<td>{filter.str(example.description).cut(20).val}</td>
								<td>{example.category}</td>
								<td>{example.tags && example.tags.map(tag => <span>{tag} </span>)}</td>
								<td class="is-narrow">{example.fav}</td>
								<td>{filter.str(example.code).cut(20).val}</td>
								<td class="actions is-narrow">
									{/* <a href="#" title="view" onClick={ this.on.list.viewCode(example.id) }>&#0088;</a> */}
									<a href="#" title="edit" onClick={this.on.list.editCode(example.id)}>
										&#0063;
									</a>
									<a href="#" title="clone" onClick={this.on.list.cloneCode(example.id)}>
										&#0047;
									</a>
									<a href="#" title="remove" onClick={this.on.list.removeCode(example.id)}>
										&#205;
									</a>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	}
}

export default AdminMain;

function generateUUID() {
	var d = new Date().getTime();
	var uuid = 'xxxx-xxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c === 'x' ? r : (r & 0x7) | 0x8).toString(16);
	});
	return uuid;
}
