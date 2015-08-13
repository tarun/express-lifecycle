'use strict';

var expect = require('chai').expect,
    supertest_as_promised = require('supertest-as-promised');

var express = require('express');

var Lifecycle = require('..'),
    Phase = Lifecycle.Phase;

describe('Lifecycle', function() {
    var app,
        agent,
        lifecycle;

    describe('class', function() {
        it('should match api spec', function () {
            expect(Lifecycle).to.exist;
            expect(Lifecycle).to.be.a('function');
            expect(Lifecycle.prototype.middleware).to.be.a('function');
            expect(Lifecycle.init).to.be.a('function');
        });

        it('should have all phases', function() {
            var lc = new Lifecycle();
            expect(lc.before).to.exist;
            expect(lc.main).to.exist;
            expect(lc.after).to.exist;
            expect(lc.phases).to.have.length(5);
        });
    });


    describe('express', function() {

        it('should init app', function() {
            var i = 0;
            var mock_app = {
                use: function() {
                    i++;
                }
            };

            var lc = Lifecycle.init(mock_app);

            // Test LC create
            expect(lc).to.exist;
            expect(lc).to.be.an.instanceof(Lifecycle);

            // Test Middleware
            expect(i).to.equal(lc.phases.length);

            // Test Extend
            assertPhaseMethods(lc);
        });

        it('should middleware middleware to app', function() {
            var i = 0;
            var mock_app = {
                use: function() {
                    i++;
                }
            };

            var lc = new Lifecycle();

            lc.middleware(mock_app);

            expect(i).to.equal(lc.phases.length);
        });

        it('should extend app with phase methods', function() {
            var lc = new Lifecycle();
            assertPhaseMethods(lc);

            assertPhaseMethods(lc.extend({}).lifecycle);
            assertPhaseMethods(lc.extend({}, {
                ns: '.'
            }));

            var ns = {
                ns: 'xyz'
            };
            assertPhaseMethods(lc.extend({}, ns).xyz);

            // Double Extend
            assertPhaseMethods(lc.extend(lc.extend({})).lifecycle);

            assertPhaseMethods(lc.extend(lc.extend({}, ns), ns).xyz);
        });

        it.skip('should avoid duplicate middleware bind');

        function assertPhaseMethods(o) {
            expect(o).to.exist;
            expect(o.before, 'before').to.exist;
            expect(o.main, 'main').to.exist;
            expect(o.after, 'after').to.exist;

            if (!o instanceof Lifecycle) {
                expect(o._open, '_open').to.not.exist;
                expect(o._close, '_close').to.not.exist;
            }
        }
    });

    describe('phase sequence', function() {
        it('only lifecycle routes after init', function() {
            var i = 0,
                called_before,
                called_main,
                called_after;

            buildApp();

            lifecycle.before.use(function(req, res, next) {
                console.log('before');
                called_before = ++i;
                next();
            });
            lifecycle.main.use(function(req, res, next) {
                console.log('main');
                called_main = ++i;
                next();
            });
            registerDone(lifecycle.main);
            lifecycle.after.use(function(req, res, next) {
                console.log('after');
                called_main = ++i;
                next();
            });

            return testApp()
            .expect('done')
            .then(function() {
                expect(called_before).to.equal(1);
                expect(called_main).to.equal(2);

                //
                expect(called_after).to.equal(3);
            });
        });
    });

    function registerDone(router) {
        router.get('/xyz', function(req, res) {
            res.send('done');
        });
    }

    function buildApp() {
        if (!app) {
            app = express();
        }

        if (!lifecycle) {
            lifecycle = Lifecycle.init(app);
        }

        agent = supertest_as_promised.agent(app);
    }

    function testApp() {
        if (!agent) {
            buildApp();
        }
        return agent.get('/xyz');
    }

    afterEach(function () {
        app = agent = lifecycle = null;
    });

});
