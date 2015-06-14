Usage
========
```javascript
  var serial = require('serial-middleware');

  router.use(serial(
    function (req, res, next) {
      // append new value
      next(null, 'foo');
    },
    function (req, res, next, foo) {
      // foo is 'foo'
      // more than one supported
      next(null, 'bar', 'baz');
    },
    function (req, res, next, bar, baz) {
      // short circuit
      next(new Error());
    },
    function (req, res, next) {
      // will not be called due to the Error passed to next
    }
  ));
```
