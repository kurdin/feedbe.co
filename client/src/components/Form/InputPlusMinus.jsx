const nonFun = () => {
	void 0;
};

const InputPlusMinus = ({
	nullValue = 0,
	step = 1,
	maxValue = 99,
	minValue = 0,
	startValue = null,
	onChange = nonFun,
	onBlur = () => {},
	value,
	name,
	isView = false,
	inputWidth = '4rem',
	digits = true,
	end = null,
	maxEnd = null
}) => {
	const onFocusInOut = () => {
		let val = parseInt(end ? value.split(end)[0] : value, 10) || 0;
		onBlur();
		onChange(val);
	};

	const plusMinusControl = (dir, value) => {
		if (!value) value = '';
		if (startValue && value === '') value = startValue;
		let val = parseInt(end ? value.split(end)[0] : value, 10) || 0;
		if (val < maxValue && dir === 'plus') val += step;
		if (val > minValue && dir === 'minus') val -= step;
		if (val < 0) val = 0;
		onBlur();
		onChange(val);
	};

	if (typeof value === 'undefined') value = nullValue;
	if (end) value += end;
	else if (maxEnd && value === maxValue) value += maxEnd;

	// let isChanged = (value !== '') ? true : false;

	return (
		<div class="field has-addons">
			{isView ? (
				<p class="control">
					<span class="tag is-disabled is-info">{value}</span>
				</p>
			) : (
				[
					<p class="control">
						<button class="button minus" onClick={e => plusMinusControl('minus', value)}>
							<span class="icon">&#197;</span>
						</button>
					</p>,
					<p class="control">
						<input
							class="input"
							style={{ width: inputWidth, textAlign: 'center', zIndex: 99 }}
							onFocus={onFocusInOut}
							onBlur={onFocusInOut}
							value={value}
						/>
					</p>,
					<p class="control">
						<button class="button plus" onClick={e => plusMinusControl('plus', value)}>
							<span class="icon">&#194;</span>
						</button>
					</p>
				]
			)}
		</div>
	);
};

export default InputPlusMinus;
