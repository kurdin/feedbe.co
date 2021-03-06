import Select from './Select';
import { createClass } from 'inferno-create-class';

function reduce(obj, props = {}) {
	return Object.keys(obj).reduce((props, key) => {
		const value = obj[key];
		if (value !== undefined) props[key] = value;
		return props;
	}, props);
}

const AsyncCreatable = createClass({
	displayName: 'AsyncCreatableSelect',

	focus() {
		this.select.focus();
	},

	render() {
		return (
			<Select.Async {...this.props}>
				{asyncProps => (
					<Select.Creatable {...this.props}>
						{creatableProps => (
							<Select
								{...reduce(asyncProps, reduce(creatableProps, {}))}
								onInputChange={input => {
									creatableProps.onInputChange(input);
									return asyncProps.onInputChange(input);
								}}
								ref={ref => {
									this.select = ref;
									creatableProps.ref(ref);
									asyncProps.ref(ref);
								}}
							/>
						)}
					</Select.Creatable>
				)}
			</Select.Async>
		);
	}
});

export default AsyncCreatable;
