import { checkErrorProps } from 'shared/utils';
import MaskedInput from 'shared/masked-input';
import ErrorHelper from './ErrorHelper';

import addClass from 'classnames';

const InputField = ({
	label,
	helpText,
	placeholder,
	digits = false,
	form,
	handleForm,
	handleCheckErrors,
	errors,
	mask,
	name,
	showAsTagInView = false,
	showAsTagInViewClass = '',
	isView = false
}) => {
	return (
		<div class={addClass({ correct: errors[name] === null && form[name], 'not-correct': errors[name] }, 'field')}>
			<label class="label m-0">
				{label} <span class="check-done">&#245;</span>
			</label>
			{isView && showAsTagInView ? (
				<span class={`tag is-disabled ${showAsTagInViewClass}`}>{form[name]}</span>
			) : (
				<p class="control m-0">
					{mask ? (
						<MaskedInput
							class={addClass({ 'is-danger': errors[name] }, 'input')}
							type="text"
							mask={mask}
							placeholder={isView ? 'not entered' : placeholder ? placeholder : `Enter ${name}`}
							disabled={isView}
							value={form[name]}
							onInput={handleForm.input(name, digits)}
							onBlur={handleCheckErrors(name)}
						/>
					) : (
						<input
							class={addClass({ 'is-danger': errors[name] }, 'input')}
							type="text"
							placeholder={isView ? 'not entered' : placeholder ? placeholder : `Enter ${name}`}
							value={form[name]}
							disabled={isView}
							onInput={handleForm.input(name, digits)}
							onBlur={handleCheckErrors(name)}
						/>
					)}
					{!errors[name] && helpText && <p class="help has-text-dark hidden-help">{helpText}</p>}
					<ErrorHelper error={errors[name]} onComponentShouldUpdate={checkErrorProps} />
				</p>
			)}
		</div>
	);
};

export default InputField;
