var Sewr = (function functionalise () {
    'use strict';
    function createLazyObj(stack) {
        var r = Object.create(null);
        r.stitch = function (gamma) {
            stack.push(gamma);
            return createLazyObj(stack);
        };
        r.applyAll = function (x) {
            var i;
            var v = x;
            var isCurried = false;
            var restack = [];
            for (i = 0; i < stack.length; i++) {
                if (isCurried) {
                    restack.push(stack[i]);
                }
                else {
                    v = stack[i].call(null, v);    
                    if (typeof v === 'function') {
                        isCurried = true;
                        restack.push(v);
                    }
                }
            }
            if (isCurried) {                       
                return createLazyObj(restack);
            }
            else {
                return v;
            }
        };
        r.sth = function (gamma) {
            return r.stitch(gamma);
        };
        return r;
    }
    function createBindObj(current, original) {
        var r = Object.create(null);
        r.applyAll = function () {
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
                return createLazyObj([v]);
            }
            if (typeof v === 'undefined') {
                v = current;
            }
            return createBindObj(v, original);
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
            if (args.length === 0) {
                return curriedGamma.call(null);
            }
            if (args.length == 1) {
                return curriedGamma.call(null, args[0]); 
            }
            return curriedGamma.call(null, args[0]).apply(null, args.slice(1));
        };
    };
    o.stitch = function (gamma) {
        return createLazyObj([]).stitch(gamma);
    };
    o.sth = function (beta) {
        return createLazyObj([]).stitch(beta);
    };
    o.lazyBinder = function (lazyObj) {
        var f = lazyObj.applyAll;
        return function (x) {
            return f.call(null, x);
        };
    };
    o.setup = function (value) {   
        var m;
        if (value) {
            m = createBindObj(value, value);
        }    
        else {            
            m = createLazyObj([]);
        } 
        return m;
    };
    return o;
})();
