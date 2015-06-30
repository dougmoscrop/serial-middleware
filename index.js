var asyncWaterfall = require('async-waterfall'),
    ensureArray = require('ensure-array');

module.exports = function () {
  var middleware = ensureArray.apply(null, arguments);

  function async(req, res, next) {
    var startValues = Array.prototype.slice.call(arguments, 3);
    var context = this;

    function toAsync(target) {
      return function() {
        var callback = arguments[arguments.length - 1];
        var values = Array.prototype.slice.call(arguments, 0, -1);

        target.apply(context, [req, res, callback].concat(values));
      };
    }

    var asyncMiddleware = middleware.map(toAsync);

    function start(callback) {
      callback.apply(callback, [null].concat(startValues));
    }

    asyncWaterfall([start].concat(asyncMiddleware), function (err) {
      if (err) {
        next(err);
      } else {
        next();
      }
    });
  }

  var length = 3;

  if (middleware[0]) {
    length = middleware[0].length;
  }

  switch(length) {
    case 4:
      return function(req, res, next, value) {
        return async(req, res, next, value);
      };
    case 5:
      return function(req, res, next, value, name) {
        return async(req, res, next, value, name);
      };
    default:
      return async;
  }
};
