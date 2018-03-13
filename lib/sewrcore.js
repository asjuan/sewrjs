"use strict";

var getRemaining = function (v, stack, pos) {
    var todos = stack;
    todos[pos] = v;
    return todos;
};
var checkEmpty = function (value) {
    return value == null || value == undefined;
};
var resolve = function (x, stack) {
    var i;
    var v = {
        value: x
    };
    for (i = 0; i < stack.length; i++) {
        v.value = stack[i].call(null, v.value);
        if (typeof v.value === "function") {
            var todos = getRemaining(v.value, stack, i);
            return {
                sequence: sequenceResolver(todos)
            };
        }
    }
    return v;
};
var recursiveResolver = function recursiveResolver(pos, x, stack) {
    var r = stack[pos].call(null, x);
    if (typeof (r) === 'function' || pos === stack.length - 1) {
        return r;
    }
    return recursiveResolver(pos + 1, r, stack);
}
var sequenceResolver = function (stack) {
    var r = Object.create(null);
    r.stitch = function (gamma) {
        stack.push(gamma);
        return sequenceResolver(stack);
    };
    r.on = function (x) {
        var resolution = resolve(x, stack);
        if (!checkEmpty(resolution.value)) return resolution.value;
        return resolution.sequence;
    };
    r.unFold = function () {
        var args = Array.prototype.slice.call(arguments),
            todos = stack.slice(1),
            f = recursiveResolver(0, args[0], stack),
            r;
        if (typeof (f) === "function") {
            todos.unshift(f);
            r = recursiveResolver(0, f.apply(null, args.slice(1)), todos);
        }
        return r;
    };
    r.sth = function (gamma) {
        return r.stitch(gamma);
    };
    return r;
};

module.exports = sequenceResolver;