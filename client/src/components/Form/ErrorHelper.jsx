import Animate from 'animate.css-react';

const ErrorHelper = ({ error }) => {
	return (
		<Animate
			component="div"
			enter="fadeInUp"
			leave="fadeOutUp"
			durationEnter={300}
			durationChange={300}
			durationLeave={300}
		>
			{error && (
				<p class="help is-danger" key={error}>
					{error}{' '}
				</p>
			)}
		</Animate>
	);
};

export default ErrorHelper;
