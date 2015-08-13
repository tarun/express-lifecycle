# Express Lifecycle

Attempt at having a before, main and after phase.

# Usage
```
var app = express();

require('express-lifecycle').init(app);

app.before(function(req, res, next) {
    // Before everything
});

app.after(function(req, res, next) {
    // After everything
});
```

# Beta
Still testing out how it works with errors, etc.

## Hopeless index
Is this achievable? seemed impossible, then difficult, in the end resorted back to overriding `res.end` - the one thing i didn't wan to do. And somehow survived not being able to access `next` in `end`.
