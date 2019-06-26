'use strict';

module.exports = function (view, model, res) {
	// model.localizedText = data && data.localizedText;
	res.render(view, model);
};