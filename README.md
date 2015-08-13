# Express Lifecycle

Attempt at having a before, main and after phase.

# Hopeless ?

res.send & res.redirect call res.end directly.

And technically after calling res.end()  - there is no need to call next.
and within end - we do not have access to
