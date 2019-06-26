import addClass from 'classnames';

import { checkErrorProps } from 'shared/utils';
import ErrorHelper from './ErrorHelper';
import SelectPopover from 'shared/infern-select-popover/src/scripts/components/select-popover';
import 'shared/infern-select-popover/dist/select-popover.css';

const InputSelectField = ({ label, options, helpText, placeholder, digits = false, form, handleForm, errors, maxSelectedItems, handleCheckErrors, name, isView = false }) => {
	return (
		<div
			class={addClass(
				{
					correct: errors[name] === null && form[name] && form[name].length > 0,
					'not-correct': errors[name]
				},
				'field'
			)}
		>
			<label class="label m-0">
				{label} <span class="check-done">&#245;</span>
			</label>
			<p class="control m-0">
				<SelectPopover
					options={options.map(type => {
						return { label: type, value: type };
					})}
					disabled={isView}
					isView={isView}
					maxSelectedItems={maxSelectedItems}
					selectPlaceholder={isView ? 'not entered' : placeholder}
					onChange={!isView ? handleForm.tags(name) : () => {}}
					onBlur={!isView ? handleCheckErrors(name) : () => {}}
					value={form[name] || []}
					selectBoxClassNames={['input', 'select-input']}
				/>
				{!errors[name] && helpText && <p class="help has-text-dark hidden-help">{helpText}</p>}
				<ErrorHelper error={errors[name]} onComponentShouldUpdate={checkErrorProps} />
			</p>
		</div>
	);
};

export default InputSelectField;
