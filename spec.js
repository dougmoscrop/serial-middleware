var assert = require('assert'),
    serial = require('./');

var error = new Error();
var counter = 0;

function throwIfCalled() {
	throw 'should not be called';
}

function many(howMany, middleware, done) {
	var arr = [],
	i;

	for (i = 0; i < howMany; ++i) {
		arr.push(middleware);
	}

	serial(arr)({ foo: '123' }, {}, function (err) {
		assert(typeof err === 'undefined');
		assert.equal(counter, arr.length);
		done();
	}, 'value');
}

beforeEach(function () {
	counter = 0;
});

describe('serial-middleware', function () {

	function success(req, res, next) {
		counter++;
		next();
	}

	function failure(req, res, next) {
		counter++;
		next(error);
	}

	it('calls next', function (done) {
		serial(success)({}, {}, function next(err) {
			assert(typeof err === 'undefined');
			assert.equal(counter, 1);
			done();
		});
	});

	it('passes error through', function (done) {
		serial(failure)({}, {}, function next(err) {
			assert.equal(err, error);
			assert.equal(counter, 1);
			done();
		});
	});

	it('works with several', function (done) {
		many(5, success, done);
	});

	it('works with a lot', function (done) {
		many(1024, success, done);
	});

	it('short circuits when an error is provided', function (done) {
		serial(success, success, failure, success, throwIfCalled)({}, {}, function (err) {
			assert.equal(err, error);
			assert.equal(counter, 3);
			done();
		});
	});

	describe('passing additional values', function() {
		it('works with one', function (done) {
			serial(
				function (req, res, next) {
					counter++;
					next(null, 'value');
				},
				function (req, res, next, value) {
					counter++;
					assert.equal(value, 'value');
					next();
				}
			)({}, {}, function (err) {
				assert(typeof err === 'undefined');
				assert.equal(counter, 2);
				done();
			});
		});

		it('works with many', function (done) {
			serial(
				function (req, res, next) {
					counter++;
					next(null, 'value', 'otherValue');
				},
				function (req, res, next, value, otherValue) {
					counter++;
					assert.equal(value, 'value');
					assert.equal(otherValue, 'otherValue');
					next();
				}
			)({}, {}, function (err) {
				assert(typeof err === 'undefined');
				assert.equal(counter, 2);
				done();
			});
		});

		it('does not interfere with errors', function (done) {
			serial(
				function (req, res, next) {
					counter++;
					next(null, 'value');
				},
				function (req, res, next, value) {
					counter++;
					assert.equal(value, 'value');
					next();
				},
				function(req, res, next) {
					counter++;
					next(error);
				},
				throwIfCalled
			)({}, {}, function (err) {
				assert(error === err);
				assert.equal(counter, 3);
				done();
			});
		});

	});
});
