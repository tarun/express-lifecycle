# Express Lifecycle

Attempt at having a before, main and after phase.

### Goals

1. Ensure requests are processed by middleware in sequence irrespective of when they are added.
2. Ensure that `after` is processed before a request ends to perform cleanup/maintenance tasks.

Adds 'before', 'main' and 'after' lifecycle phases which are basically multiple instances of Express Routers.
All the express router bind methods [get, route, use, etc.] work on the phase objects.

# Usage
```
var app = express();

var lifecycle = require('express-lifecycle').init(app);

lifecycle.before.use(function(req, res, next) {
    // Before everything
});

lifecycle.main.use(function(req, res, next) {
    // Main Stuff
});

lifecycle.after.use(function(req, res, next) {
    // After everything
});
```

## Lifecycle Namespace
```
var app = express();
require('express-lifecycle').init(app);

app.lifecycle.before.use(...)
app.lifecycle.main.use(...)
app.lifecycle.after.use(...)
```

### The namespace can be customized
```
var app = express();
require('express-lifecycle').init(app, {
    ns: 'xyz'
});

app.xyz.before.use(...);
app.xyz.main.use(...);
app.xyz.after.use(...);
```

### '.' namespace
```
var app = express();
require('express-lifecycle').init(app, {
    ns: '.' // . has a special meaning
});

app.before.use(...);
app.main.use(...)
app.after.use(...);
```

## Direct Usage

Bypassing the helper init method, standalone lifecycle instances can be created standalone shared between apps.

```
var Lifecycle = require('express-lifecycle`);

var lifecycle = new Lifecycle();

lifecycle.middleware(app);

lifecycle.before.use(...)
lifecycle.main.use(...)
lifecycle.after.use(...)


lifecycle.extend(app);

app.lifecycle.before.use(...)
app.lifecycle.main.use(...)
app.lifecycle.after.use(...)
```

# Stability
Still testing out how it works with edge cases, errors, etc.

# History
Is this achievable? seemed impossible, then difficult, in the end resorted back to overriding `res.end` - the one thing I didn't want to do.
And somehow survived not being able to access `next` in `end` and it works now.

The idea of overriding res.end is from `express-session` and thats seems to be the only way to do it as res.redirect(), res.end() bypass the remaining middleware.
