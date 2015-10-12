# leya-tpl
Asynchronously load and transform template.

	var tpl = require('leya-tpl');

	tpl.loadTransform({
		file: 'test',
		data: {
			test: {
				scope: this,
				fn: method
			}
		},
		done: function(err, text) {

		}
	});