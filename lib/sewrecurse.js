"use strict";
var resolve = require("./sewrcore");
var treerecurse = function () {
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
var iterate = function () {
    return function (acc, f) {
        var m = function (value) {
            var nested = Object.create(null);
            nested.input = value;
            nested.accumulator = acc;
            nested.runAgain = function (input) {
                var initial = {
                    accumulator: input,
                    input: nested.input,
                    runAgain: function (a) {
                        initial.accumulator = a;
                        return {
                            while: function () { }
                        };
                    }
                };

                return {
                    while: function (check) {
                        while (check(initial.accumulator)) {
                            f(initial);
                        }
                        nested.accumulator = initial.accumulator;
                    }
                };

            };
            f(nested);
            return nested.accumulator;
        };
        return resolve([m]);
    };
};
module.exports = {
    recurse: treerecurse,
    iterate: iterate
};