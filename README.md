Usage
========
```javascript
var serial = require('serial-middleware');

router.param('foo', serial(
    function (req, res, next, foo) {
        next();
    },
    function (req, res, next, foo) {
        // append new value
        next(null, 'bar');
    },
    function (req, res, next, foo, bar) {
        // for param middleware, the fourth-argument 'param value' is always preserved
        next(null, 'baz');
    },
    function (req, res, next, foo, baz) {
        // baz replaced bar in this case
        // just specify more than one if you want to carry them through
        next(null, 'bar', 'baz');
    },
    function (req, res, next, foo, bar, baz) {
        next(new Error('fail'));
    },
    function (req, res, next) {
        // will not be called due to the error passed to next
    }
));
```