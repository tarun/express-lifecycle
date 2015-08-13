'use strict';

var Phase = require('./phase');

function endResponse(lifecycle, req, res) {
    var _called = false;
    var _chunk;
    var _encoding;
    var _end = res.end;

    res.lifecycle_done = false;
    res.end = function lifecycleEnd(chunk, encoding) {
        console.log('end');
        var _res = this || res; // here this is res
        var _req = (_res && _res.req) || req;

        _res.lifecycle_end_triggered = true;
        if (res.lifecycle_done) {
            // actually call end.
            console.log('actual end');
            _end.call(_res, _chunk, _encoding);
        } else {
            // save params for later use.
            _chunk = chunk;
            _encoding = encoding;

            lifecycle.after.handle(_req, _res);
            lifecycle._close.handle(_req, _res);
        }
    };
}

function Lifecycle() {
    // Initialize Phases
    this.phases.forEach(function(phase) {
        this[phase] = new Phase();
    }, this);

    var self = this;
    this._open.use(function(req, res, next) {
        console.log('open');
        endResponse(self, req, res);
        next();
    });
    this._close.use(function(req, res, next) {
        console.log('close');
        res.lifecycle_done = true;
        if (res.lifecycle_end_triggered = true) {
            res.end();
        } else {
            next();
        }
    });
}
Lifecycle.prototype = {

    _open: null,
    before: null,
    main: null,
    after: null,
    _close: null,

    phases: ['_open', 'before', 'main', 'after', '_close'],

    middleware: function(app) {
        // Register Middleware
        this.phases.forEach(function(phase) {
            app.use(this[phase]);
        }, this);
    },

    extend: function(app, options) {
        if (!app) {
            throw new Error('No app was provided to bind a lifecycle on');
        }

        options = options || {};

        // Determine host object based on app and namespace.
        var host;
        var namespace = typeof options.ns === 'undefined' ? 'lifecycle' : options.ns;
        if (namespace === '.') {
            host = app;
        } else if (namespace) {
            host = app[namespace];
            if (!host) {
                app[namespace] = host = {};
            }
        } else {
            throw new Error('No namespace provided to bind the lifecycle on');
        }

        // Assign methods onto host from lifecycle for each phase.
        host['lifecycle'] = this;
        this.phases.forEach(function(phase) {
            if (!/^_/.test(phase)) {
                host[phase] = this[phase];
            }
        }, this);

        return app;
    }
};

Lifecycle.init = function init(app, options) {
    var lifecycle = new Lifecycle();
    lifecycle.middleware(app);
    lifecycle.extend(app, options);
    return lifecycle;
};
// Lifecycle.Phase = Phase;

module.exports = Lifecycle;
