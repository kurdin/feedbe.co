import { checkErrorProps } from 'shared/utils';
import ErrorHelper from './ErrorHelper';
import TextArea from 'shared/textarea-autoresize';

import addClass from 'classnames';

const InputField = ({
	label,
	helpText,
	minRows,
	limit,
	placeholder,
	form,
	handleForm,
	handleCheckErrors,
	errors,
	name,
	isView = false
}) => {
	let count = (form[name] && form[name].length) || 0;
	return (
		<div
			class={addClass(
				{ correct: errors[name] === null && form[name], 'not-correct': errors[name] },
				'field'
			)}
		>
			<label class="label m-0">
				{label} <span class="check-done">&#245;</span>
				{!isView && limit && count > 0 && (
					<span class="is-pulled-right chars-count">
						{count} / {limit}
					</span>
				)}
			</label>
			<p class="control m-0">
				<TextArea
					className={addClass({ 'is-danger': errors[name] }, 'input')}
					placeholder={isView ? 'not entered' : placeholder ? placeholder : `Enter ${name}`}
					minRows={minRows ? minRows : 3}
					disabled={isView}
					value={form[name]}
					onBlur={handleCheckErrors(name)}
					onChange={handleForm.input(name)}
				/>
				{!errors[name] && helpText && <p class="help has-text-dark hidden-help">{helpText}</p>}
				<ErrorHelper error={errors[name]} onComponentShouldUpdate={checkErrorProps} />
			</p>
		</div>
	);
};

export default InputField;
