import { Component } from 'react';
import Select from './Select';
import stripDiacritics from './utils/stripDiacritics';

const defaultCache = {};

const defaultProps = {
	autoload: true,
	cache: defaultCache,
	children: defaultChildren,
	ignoreAccents: true,
	ignoreCase: true,
	loadingPlaceholder: 'Loading...',
	options: [],
	searchPromptText: 'Type to search'
};

export default class Async extends Component {
	constructor(props, context) {
		super(props, context);

		this._cache = props.cache === defaultCache ? {} : props.cache;

		this.state = {
			isLoading: false,
			options: props.options
		};

		this._onInputChange = this._onInputChange.bind(this);
	}

	componentDidMount() {
		const { autoload } = this.props;

		if (autoload) {
			this.loadOptions('');
		}
	}

	componentWillUpdate(nextProps, nextState) {
		const propertiesToSync = ['options'];
		propertiesToSync.forEach(prop => {
			if (this.props[prop] !== nextProps[prop]) {
				this.setState({
					[prop]: nextProps[prop]
				});
			}
		});
	}

	clearOptions() {
		this.setState({ options: [] });
	}

	loadOptions(inputValue) {
		const { loadOptions } = this.props;
		const cache = this._cache;

		if (cache && cache.hasOwnProperty(inputValue)) {
			this.setState({
				options: cache[inputValue]
			});

			return;
		}

		const callback = (error, data) => {
			if (callback === this._callback) {
				this._callback = null;

				const options = (data && data.options) || [];

				if (cache) {
					cache[inputValue] = options;
				}

				this.setState({
					isLoading: false,
					options
				});
			}
		};

		// Ignore all but the most recent request
		this._callback = callback;

		const promise = loadOptions(inputValue, callback);
		if (promise) {
			promise.then(data => callback(null, data), error => callback(error));
		}

		if (this._callback && !this.state.isLoading) {
			this.setState({
				isLoading: true
			});
		}

		return inputValue;
	}

	_onInputChange(inputValue) {
		const { ignoreAccents, ignoreCase, onInputChange } = this.props;

		if (ignoreAccents) {
			inputValue = stripDiacritics(inputValue);
		}

		if (ignoreCase) {
			inputValue = inputValue.toLowerCase();
		}

		if (onInputChange) {
			onInputChange(inputValue);
		}

		return this.loadOptions(inputValue);
	}

	inputValue() {
		if (this.select) {
			return this.select.state.inputValue;
		}
		return '';
	}

	noResultsText() {
		const { loadingPlaceholder, noResultsText, searchPromptText } = this.props;
		const { isLoading } = this.state;

		const inputValue = this.inputValue();

		if (isLoading) {
			return loadingPlaceholder;
		}
		if (inputValue && noResultsText) {
			return noResultsText;
		}
		return searchPromptText;
	}

	focus() {
		this.select.focus();
	}

	render() {
		const { children, loadingPlaceholder, placeholder } = this.props;
		const { isLoading, options } = this.state;

		const props = {
			noResultsText: this.noResultsText(),
			placeholder: isLoading ? loadingPlaceholder : placeholder,
			options: isLoading && loadingPlaceholder ? [] : options,
			ref: ref => (this.select = ref),
			onChange: newValues => {
				if (this.props.multi && this.props.value && newValues.length > this.props.value.length) {
					this.clearOptions();
				}
				this.props.onChange(newValues);
			}
		};

		return children({
			...this.props,
			...props,
			isLoading,
			onInputChange: this._onInputChange
		});
	}
}

Async.defaultProps = defaultProps;

function defaultChildren(props) {
	return <Select {...props} />;
}
