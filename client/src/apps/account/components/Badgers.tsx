export const Badges = () => {
	return (
		<div>
			<span class="badge">
				<span class="name">
					<span>Website Status</span>
				</span>
				<span class="status green">
					<span>UP</span>
				</span>
			</span>
			<span class="badge">
				<span class="name">
					<span>Speed Test</span>
				</span>
				<span class="status blue">
					<span>Fast</span>
				</span>
			</span>
			<span class="badge">
				<span class="name">
					<span>dependencies</span>
				</span>
				<span class="status yellow">
					<span>up to date</span>
				</span>
			</span>
			<span class="badge">
				<span class="name">
					<span>build</span>
				</span>
				<span class="status red">
					<span>Failed</span>
				</span>
			</span>
			<span class="badge">
				<span class="name">
					<span>review</span>
				</span>
				<span class="status gray">
					<span>pending</span>
				</span>
			</span>
		</div>
	);
};
