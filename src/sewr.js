var checkEmpty = function (value) {
    return value == null || value == undefined;
};
var createMaybe = function (value) {
    'use strict';
    var outer = Object.create(null);
    outer.isEmpty = checkEmpty(value);
    outer.value = null;
    outer.stitch = function (gamma) {
        var nested = null;
        var result = null;
        if (outer.isEmpty) return createMaybe();
        result = gamma(value);
        if (checkEmpty(result)) {
            nested = createMaybe(value);
        }
        else {
            nested = createMaybe(result);
        }
        nested.value = result;
        return nested;
    };
    return outer;
};
var sewr = function functionalise() {
    'use strict';
    function getRemaining(v, stack, pos) {
        var todos = stack;
        todos[pos] = v;
        return todos;
    }
    function resolve(x, stack) {
        var i;
        var v = {
            value: x
        };
        for (i = 0; i < stack.length; i++) {
            v.value = stack[i].call(null, v.value);
            if (typeof v.value === 'function') {
                var todos = getRemaining(v.value, stack, i);
                return {
                    sequence: sequenceResolver(todos)
                };
            }
        }
        return v;
    }
    function recursiveResolver(pos, x, stack) {
        var r = stack[pos].call(null, x);
        if (typeof (r) === 'function' || pos === stack.length - 1) {
            return r;
        }
        return recursiveResolver(pos + 1, r, stack);
    }
    function resolveUncurried(curriedGamma, args) {
        if (args.length === 0) {
            return curriedGamma.call(null);
        }
        if (args.length == 1) {
            return curriedGamma.call(null, args[0]);
        }
        return curriedGamma.call(null, args[0]).apply(null, args.slice(1));
    }
    function sequenceResolver(stack) {
        var r = Object.create(null);
        r.stitch = function (gamma) {
            stack.push(gamma);
            return sequenceResolver(stack);
        };
        r.on = function (x) {
            var resolution = resolve(x, stack);
            if (resolution.value) return resolution.value;
            return resolution.sequence;
        };
        r.unFold = function () {
            var args = Array.prototype.slice.call(arguments),
                todos = stack.slice(1),
                f = recursiveResolver(0, args[0], stack),
                r;
            if (typeof (f) === 'function') {
                todos.unshift(f);
                r = recursiveResolver(0, f.apply(null, args.slice(1)), todos);
            }
            return r;
        };
        r.sth = function (gamma) {
            return r.stitch(gamma);
        };
        return r;
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
                return sequenceResolver([v]);
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
        return sequenceResolver([]).stitch(gamma);
    };
    o.sth = function (beta) {
        return sequenceResolver([]).stitch(beta);
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
            m = sequenceResolver([]);
        }
        return m;
    };
    o.toMaybe = createMaybe;
    return o;
};
if (!checkEmpty(module) && !checkEmpty(module.exports)) {
    module.exports = sewr();
}
