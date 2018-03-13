"use strict";
var resolve = require("./sewrcore");
var checkEmpty = function (value) {
    return value == null || value == undefined;
};
var createMaybe = function () {
    return function (fallback) {
        var o = Object.create(null);
        var m = function (value) {
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
var createRecurse = function () {
    return function (f) {
        var isNotAnObject = function (e) {
            var isOther = typeof (e) !== "object";
            return isOther;
        };
        var m = function (value) {
            var nested = Object.create(null);
            nested.hasLeavesOn = function (name) {
                if (!Array.isArray(nested.value[name])) return false;
                if (nested.value[name].some(isNotAnObject)) return false;
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
var sewr = function functionalise() {
    function resolveUncurried(curriedGamma, args) {
        if (args.length === 0) {
            return curriedGamma.call(null);
        }
        if (args.length == 1) {
            return curriedGamma.call(null, args[0]);
        }
        return curriedGamma.call(null, args[0]).apply(null, args.slice(1));
    }
    function eagerResolver(current, original) {
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
    }
    var o = Object.create(null);
    o.curry = function (gamma) {
        return function (x) {
            var list = [];
            list.push(x);
            function feedList(element) {
                list.push(element);
            }
            return function () {
                var args = Array.prototype.slice.call(arguments);
                args.forEach(feedList);
                return gamma.apply(null, list);
            };
        };
    };
    o.unCurry = function (curriedGamma) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return resolveUncurried(curriedGamma, args);
        };
    };
    o.stitch = function (gamma) {
        return resolve([]).stitch(gamma);
    };
    o.sth = function (beta) {
        return resolve([]).stitch(beta);
    };
    o.lazyBinder = function (lazyObj) {
        var f = lazyObj.on;
        return function (x) {
            return f.call(null, x);
        };
    };
    o.setup = function (value) {
        var m;
        if (value) {
            m = eagerResolver(value, value);
        }
        else {
            m = resolve([]);
        }
        return m;
    };
    o.toMaybe = createMaybe();
    o.toRecursive = createRecurse();
    return o;
};
module.exports = sewr();
