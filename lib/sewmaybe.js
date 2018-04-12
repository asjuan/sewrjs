"use strict";
var resolve = require("./sewrcore");
var checkEmpty = function (value) {
    return value === null || value === undefined;
};
var maybe = function () {
    return function (fallback) {
        var o = Object.create(null), m;
        m = function (value) {
            var nested = Object.create(null);
            nested.isEmpty = true;
            nested.value = fallback;
            if (checkEmpty(value)) {
                return nested;
            }
            nested.isEmpty = false;
            nested.value = value;
            return nested;
        };
        o.stitch = function (gamma) {
            return resolve([m]).stitch(gamma);
        };
        o.sth = function (beta) {
            return resolve([m]).stitch(beta);
        };
        return o;
    };
};
module.exports = maybe;