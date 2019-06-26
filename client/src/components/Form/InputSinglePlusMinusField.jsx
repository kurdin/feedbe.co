import addClass from 'classnames';

import { checkErrorProps } from 'shared/utils';
import InputPlusMinus from './InputPlusMinus';
import ErrorHelper from './ErrorHelper';

const InputSinglePlusMinusField = ({
	label,
	helpText,
	placeholder,
	maxEnd = null,
	end = null,
	maxValue,
	form,
	handleForm,
	handleCheckErrors,
	isView = false,
	nullValue = 0,
	errors,
	mask,
	name
}) => {
	return (
		<div
			class={addClass(
				{
					correct: !isView && errors[name] === null && form[name] && nullValue !== form[name],
					'not-correct': errors[name]
				},
				'field'
			)}
		>
			<label class="label m-0">
				{label} <span class="check-done">&#245;</span>
			</label>

			<p class="control m-0">
				<InputPlusMinus
					value={form[name]}
					{...{ end, name, isView, maxEnd, nullValue, maxValue }}
					onChange={handleForm.onChange(name, true)}
					onBlur={handleCheckErrors(name)}
				/>
			</p>
			{!errors[name] && helpText && !isView && <p class="help has-text-dark">{helpText}</p>}
			<ErrorHelper error={errors[name]} onComponentShouldUpdate={checkErrorProps} />
		</div>
	);
};

export default InputSinglePlusMinusField;
