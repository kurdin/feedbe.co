import { checkErrorProps } from 'shared/utils';
import ErrorHelper from './ErrorHelper';

import addClass from 'classnames';

const CheckBoxInput = ({ label, helpText, minRows, limit, placeholder, form, handleForm, handleCheckErrors, errors, name, isView = false }) => {
	return (
		<div class={addClass({ correct: errors[name] === null, 'not-correct': errors[name] }, 'field')}>
			<p class="control m-0">
				<div class={`ig-control has-text-right ${isView ? 'op-5' : ''}` }>
					<input type="checkbox" id={name + '_checkbox'} class={addClass({ 'is-danger': errors[name] }, 'ig-control__cbx')} checked={form[name] === true ?true : false} onChange={!isView ? handleForm.checkbox(name) : () => {}}/>
					<label for={name + '_checkbox'}>{label}</label>
				</div>
				<ErrorHelper error={errors[name]} onComponentShouldUpdate={checkErrorProps} />
			</p>
		</div>
	);
};

export default CheckBoxInput;