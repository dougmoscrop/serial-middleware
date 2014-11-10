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

    serial(arr)({}, {}, function (err) {
        assert('undefined' === typeof err);
        assert.equal(counter, arr.length);
        done();
    }, 'value');
}


beforeEach(function () {
    counter = 0;
});

function common(success, failure) {
    it('calls next', function (done) {
        serial(success)({}, {}, function next(err) {
            assert('undefined' === typeof err);
            assert.equal(counter, 1);
            done();
        });
    });

    it('passes an error through', function (done) {
        serial(failure)({}, {}, function next(err) {
            assert.equal(err, error);
            assert.equal(counter, 1);
            done();
        });
    });

    it('withs with several', function (done) {
        many(5, success, done);
    });

    it('works with a lot', function (done) {
        many(1024, success, done);
    });

    it('short circuits when an error is provided', function (done) {
        serial(success, success, failure, throwIfCalled)({}, {}, function (err) {
            assert.equal(err, error);
            assert.equal(counter, 3);
            done();
        });
    });
}

describe('middleware (arity 3)', function () {

    function success(req, res, next) {
        counter++;
        next();
    }

    function failure(req, res, next) {
        counter++;
        next(error);
    }

    common(success, failure);

    it('can pass additional values downstream', function (done) {
        serial(
            function (req, res, next) {
                counter++;
                next(null, 'value')
            },
            function (req, res, next, value) {
                counter++;
                assert.equal(value, 'value');
                next();
            }
        )({}, {}, function (err) {
            assert('undefined' === typeof err);
            assert.equal(counter, 2);
            done();
        });
    });
});

describe('param middleware (arity 4)', function () {

    function success(req, res, next, value) {
        counter++;
        next();
    }

    function failure(req, res, next, value) {
        counter++;
        next(error);
    }

    common(success, failure);

    function checkValue(req, res, next, value) {
        counter++;
        assert.equal(value, 'value');
        next();
    }

    it('passes the value through each', function (done) {
        many(5, checkValue, done);
    });

    it('also passes additional values', function (done) {
        serial(
            function (req, res, next, value) {
                counter++;
                assert.equal(value, 'value');
                next(null, 'additionalValue');
            },
            function (req, res, next, value, additionalValue) {
                counter++;
                assert.equal(value, 'value');
                assert.equal(additionalValue, 'additionalValue');
                next();
            }
        )({}, {}, function (err) {
            assert('undefined' === typeof err);
            assert.equal(counter, 2);
            done();
        }, 'value');
    });
});
