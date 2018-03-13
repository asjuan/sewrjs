"use strict";
var resolve = require("./sewrcore");
var eagerResolver = function eagerResolver(current, original) {
    var r = Object.create(null);
    r.on = function () {
        return current;
    };
    r.stitch = function (gamma) {
        var v;
        if (current) {
            v = gamma.call(null, current);
        }
        else {
            v = gamma.call(null, original);
        }
        if (typeof v === 'function') {
            return resolve([v]);
        }
        if (typeof v === 'undefined') {
            v = current;
        }
        return eagerResolver(v, original);
    };
    r.sth = function (gamma) {
        return r.stitch(gamma);
    };
    return r;
};
module.exports = eagerResolver;
