export function render(view: string, model: object, res: { render: Function }): void {
	// model.localizedText = data && data.localizedText;
	console.time('Render Time');
	res.render(view, model);
	console.timeEnd('Render Time');
}
