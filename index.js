var asyncWaterfall = require('async-waterfall'),
	ensureArray = require('ensure-array');

module.exports = function () {
	var middleware = ensureArray.apply(null, arguments),
        first = middleware[0],
        useParamValue = 'function' === typeof first && (first.length === 2 || first.length === 4);
    
	function async(req, res, next, param) {
		var context = this;
        
		function toAsync(target) {
			return function () {
				var next = arguments[arguments.length - 1],
                    values = [].slice.call(arguments, 0, -1);

                if (useParamValue) {
                    values.unshift(param);
                }
                
                target.apply(context, [req, res, next].concat(values));
			};
		}

		asyncWaterfall(middleware.map(toAsync), function (err) {
			next(err);
		});
	}
                                                           
	if (useParamValue) {
		return function (req, res, next, value) {
			async(req, res, next, value);
		};
	} else {
		return function (req, res, next) {
			async(req, res, next);
		};
	}
};
