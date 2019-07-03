export function render(
	view: string,
	model: object,
	res: { locals: { renderStartTime: number }; render: Function; send: Function }
): void {
	// model.localizedText = data && data.localizedText;

	if (res.locals.renderStartTime) {
		res.render(view, model, async (err, html) => {
			if (err) {
				console.log(err);
			}
			const renderTime = Date.now() - res.locals.renderStartTime;
			const style =
				'z-index:99999999;position:absolute;color: white;top: 20px;left:50%;margin-left: -140px;width: 280px;border-radius: 5px;font-size: 15px;font-weight: 500;background: #c78400;text-align: center;';
			res.send(html.replace(/<\/body>/gim, `<div style="${style}">Page Render Time: ${renderTime} ms</div></body>`));
		});
	} else {
		res.render(view, model);
	}
}

// function timeout(ms) {
// 	return new Promise(res => setTimeout(res, ms));
// }
