var asyncWaterfall = require('async-waterfall'),
    ensureArray = require('ensure-array');

module.exports = function () {
	var middleware = ensureArray.apply(null, arguments);

	function async(req, res, next) {
		var context = this;

		function toAsync(target) {
			return function() {
				var callback = arguments[arguments.length - 1];
				var values = Array.prototype.slice.call(arguments, 0, -1);

				target.apply(context, [req, res, callback].concat(values));
			};
		}

		asyncWaterfall(middleware.map(toAsync), function (err) {
			if (err) {
				next(err);
			} else {
				next();
			}
		});
	}

	return async;
};
