const Notification = ({
	body = null,
	showClose = true,
	onClose = () => {},
	children,
	type = 'is-success'
}) => (
	<div class="notification-holder">
		<div class={'top notification animated pulse ' + type}>
			{showClose && <button class="delete" onClick={onClose} />}
			{body ? <span dangerouslySetInnerHTML={{ __html: body }} /> : children}
		</div>
	</div>
);

export default Notification;
