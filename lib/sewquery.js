"use strict";
var checkEmpty = function (value) {
    return value == null || value == undefined;
};
var createQueriable = function () {
    return function queryOn(arr) {
        var simplefind = function (compare) {
            return function (criteriaObject) {
                var result = [];
                if (!checkEmpty(criteriaObject)) {
                    result = arr.filter(function (item) {
                        var isMatch = true;
                        if (typeof (criteriaObject) == "object") {
                            for (let p in criteriaObject) {
                                isMatch = isMatch && compare(criteriaObject[p], item[p]);
                            }
                        }
                        else {
                            isMatch = compare(criteriaObject, item);
                        }
                        return isMatch;
                    });
                }
                return queryOn(result);
            };
        };
        var o = Object.create(null);
        o._value = arr;
        o.find = function (criteriaObject) {
            return simplefind(function (a, b) {
                return a === b;
            })(criteriaObject);
        };
        o.but = function (criteriaObject) {
            return simplefind(function (a, b) {
                return a !== b;
            })(criteriaObject);
        };
        o.groupBy = function (propName) {
            var catalog = [];
            var instance = {};
            var matches;
            var groups = [];
            var cloneIt = function (o) {
                var c = Object.create(null);
                for (let p in o) {
                    if (p !== propName) {
                        c[p] = o[p];
                    }
                }
                return c;
            };
            if (arr.length > 0) {
                for (let i = 0; i < arr.length; i++) {
                    instance = arr[i][propName];
                    matches = catalog.some(function (item) {
                        return item === instance;
                    });
                    if (!matches) {
                        catalog.push(instance);
                    }
                }
                catalog.forEach(function (name) {
                    var details = [];
                    var group = Object.create(null);
                    for (let i = 0; i < arr.length; i++) {
                        instance = cloneIt(arr[i]);
                        if (arr[i][propName] === name) {
                            details.push(instance);
                        }
                    }
                    group[propName] = name;
                    group["grouped"] = details;
                    groups.push(group); 
                });
                return queryOn(groups);
            }
            return queryOn(arr);
        };
        o.all = function () {
            return o._value;
        };
        o.first = function () {
            return o._value[0];
        };
        o.last = function () {
            return o._value[o._value.length - 1];
        };
        return o;
    };
};
module.exports = createQueriable;