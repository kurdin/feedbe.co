import classNames from 'classnames';

function menuRenderer({
	focusedOption,
	instancePrefix,
	labelKey,
	onFocus,
	onSelect,
	optionClassName,
	optionComponent,
	optionRenderer,
	options,
	onMouseMove,
	isKeyPressed,
	valueArray,
	valueKey,
	onOptionRef
}) {
	let Option = optionComponent;

	return options.map((option, i) => {
		let isSelected = valueArray && valueArray.indexOf(option) > -1;
		let isFocused = option === focusedOption;
		let optionClass = classNames(optionClassName, {
			'Select-option': true,
			'is-selected': isSelected,
			'is-focused': isFocused,
			'is-disabled': option.disabled
		});

		return (
			<Option
				className={optionClass}
				instancePrefix={instancePrefix}
				isDisabled={option.disabled}
				isFocused={isFocused}
				isSelected={isSelected}
				key={`option-${i}-${option[valueKey]}-${isFocused}`}
				onFocus={onFocus}
				isKeyPressed={isKeyPressed}
				onMouseMove={onMouseMove}
				onSelect={onSelect}
				option={option}
				optionIndex={i}
				ref={ref => {
					onOptionRef(ref, isFocused);
				}}
			>
				{optionRenderer(option, i)}
			</Option>
		);
	});
}

export default menuRenderer;
