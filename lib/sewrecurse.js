"use strict";
var resolve = require("./sewrcore");
var recurse = function () {
    return function (f) {
        var isNotAnObject = function (e) {
            var isOther = typeof e !== "object";
            return isOther;
        }, m;
        m = function (value) {
            var nested = Object.create(null);
            nested.hasLeavesOn = function (name) {
                if (!Array.isArray(nested.value[name])) {
                    return false;
                }
                if (nested.value[name].some(isNotAnObject)) {
                    return false;
                }
                return nested.value[name].length > 0;
            };
            nested.recurseOn = function (name) {
                var children = nested.value[name].map(function (c) {
                    return m(c);
                });
                return children;
            };
            nested.value = value;
            return f(nested);
        };
        return resolve([m]);
    };
};
module.exports = recurse;