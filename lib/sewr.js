"use strict";
var resolve = require("./sewrcore");
var createQueriable = require("./sewquery");
var eagerResolver = require("./eager");
var createMaybe = require("./sewmaybe");
var createRecurse = require("./sewrecurse");
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
    o.toRecursive = createRecurse.recurse();
    o.toReduce = createRecurse.iterate();
    o.querydef = function (def) {
        var query = function (arr) {
            return createQueriable()(arr);
        };
        var applyDef = function (o) {
            return def(o);
        };
        return function (arr) {
            return resolve([]).sth(query).sth(applyDef).on(arr);
        };
    };
    return o;
};
module.exports = sewr();
