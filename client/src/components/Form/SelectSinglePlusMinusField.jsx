import addClass from 'classnames';

import { checkErrorProps } from 'shared/utils';
import ErrorHelper from './ErrorHelper';

const InputSinglePlusMinusField = ({
	label,
	helpText,
	placeholder,
	maxEnd = null,
	end = null,
	form,
	handleForm,
	startValue = '--',
	nullValue = '--',
	step = 1,
	maxValue = 99,
	minValue = 0,
	handleCheckErrors,
	isView = false,
	inputWidth = '4rem',
	errors,
	mask,
	name
}) => {
	let value = typeof form[name] === 'undefined' || form[name] === null ? startValue : form[name];
	if (value >= 10) inputWidth = '4.5rem';

	const onFocusInOut = e => {
		let val = parseInt(e.target.value, 10);
		if (isNaN(val)) val = startValue;
		if (val === nullValue) val = null;
		handleCheckErrors(name)();
		handleForm.onChange(name)(val);
	};

	const plusMinusControl = (dir, v) => e => {
		if (startValue && value === '') value = startValue;
		let val = parseInt(v, 10);
		if (isNaN(val) && dir === 'plus') {
			val = minValue;
		} else if ((isNaN(val) || val === minValue) && dir === 'minus') {
			val = nullValue;
		} else {
			if (val < maxValue && dir === 'plus') val += step;
			if (val > minValue && dir === 'minus') val -= step;
			if (val > maxValue) val = maxValue;
			if (val <= minValue) val = minValue;
		}
		if (val === nullValue) val = null;
		handleCheckErrors(name)();
		handleForm.onChange(name)(val);
	};

	const options = [...Array(maxValue + 1).keys()].map((a, i) => i + minValue);
	if (options.indexOf(startValue) === -1) options.unshift(startValue);

	return (
		<div
			class={addClass(
				{
					correct:
						!isView &&
						errors[name] === null &&
						(form[name] || form[name] === 0) &&
						nullValue !== form[name],
					'not-correct': errors[name]
				},
				'field'
			)}
		>
			<label class="label m-0">
				{label} <span class="check-done">&#245;</span>
			</label>

			<p class="control m-0">
				<div class="field has-addons">
					{isView ? (
						<p class="control">
							{(form[name] || form[name] === 0) && value !== nullValue ? (
								<span class="tag is-disabled is-info">{value}</span>
							) : (
								<span class="tag is-disabled is-light">no set</span>
							)}
						</p>
					) : (
						[
							<p class="control">
								<button class="button minus" onClick={plusMinusControl('minus', value)}>
									<span class="icon">&#197;</span>
								</button>
							</p>,
							<p class="control">
								<div class="select">
									<select
										class="input"
										style={{ width: inputWidth, textAlign: 'center', zIndex: 2 }}
										onChange={onFocusInOut}
										value={value}
									>
										{options.map((age, i) => (
											<option value={age}>{age}</option>
										))}
									</select>
								</div>
							</p>,
							<p class="control">
								<button class="button plus" onClick={plusMinusControl('plus', value)}>
									<span class="icon">&#194;</span>
								</button>
							</p>
						]
					)}
				</div>
			</p>
			{!errors[name] && helpText && !isView && <p class="help has-text-dark">{helpText}</p>}
			<ErrorHelper error={errors[name]} onComponentShouldUpdate={checkErrorProps} />
		</div>
	);
};

export default InputSinglePlusMinusField;
