'use strict';

var expect = require('chai').expect,
    supertest_as_promised = require('supertest-as-promised');

var express = require('express');

var Phase = require('..').Phase;

describe('Phase', function() {
    var app,
        agent,
        phase;

    describe('class', function() {
        it('should match api spec', function () {
            expect(Phase).to.exist;
            expect(Phase).to.be.a('function');
        });

        it('should have router methods', function() {
            var p = new Phase();
            expect(p).to.exist;
            expect(p.use).to.be.a('function');
        });
    });

    describe('express', function() {
        it('should execute handler', function() {
            var called = false;
            return testApp(function(req, res, next) {
                    called = true;
                    next();
                })
                .expect('done')
                .then(function() {
                    expect(called).to.be.true;
                });
        });

        it('should execute multipe handlers', function() {
            var called_a = false,
                called_b = false;
            return testApp([
                function(req, res, next) {
                    called_a = true;
                    next();
                },
                function(req, res, next) {
                    called_b = true;
                    next();
                }])
                .expect('done')
                .then(function() {
                    expect(called_a).to.be.true;
                    expect(called_b).to.be.true;
                });
        });
    });


    function buildApp(handlers) {
        phase = new Phase();

        if (!Array.isArray(handlers) && typeof handlers === 'function') {
            handlers = [ handlers ];
        }
        if (Array.isArray(handlers)) {
            handlers.forEach(function(handler) {
                phase.use(handler);
            });
        }
        phase.get('/xyz', function(req, res) {
            res.send('done');
        });

        app = express();
        app.use(phase);

        agent = supertest_as_promised.agent(app);
    }

    function testApp(handler) {
        if (!agent) {
            buildApp(handler);
        }
        return agent.get('/xyz');
    }

    afterEach(function () {
        app = agent = phase = null;
    });

});
