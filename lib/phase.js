'use strict';

var express = require('express'),
    Router = require('express').Router;

/**
 * Phase is a set of steps. currently it is just an Express Router.
 * Creating another class to support helper methods in the future.
 */
var Phase = Router.bind(express);

module.exports = Phase;
