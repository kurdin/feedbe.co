const SingleSwitch = ({
	label = 'Label Here',
	ONOFF = true,
	labelOn = 'On',
	labelOff = 'Off',
	onChange,
	value }) => {

	value = value === true ? true : false;
	const onSwitch = () => {
		onChange(!value);
	};

	return (
		<label class="md-switch m-y-xs">
			<input type="checkbox" class="has-value" checked={value ? true : false} onChange={onSwitch} />
			<i class="primary" />
			{value ? (
				<span>
					<small>
						{label}
						{ONOFF && <span> - {labelOn}</span>}
					</small>
				</span>
			) : (
				<span>
					<small class="text-muted">
						{label}
						{ONOFF && <span> - {labelOff}</span>}
					</small>
				</span>
			)}
		</label>
	);
};

export default SingleSwitch;
