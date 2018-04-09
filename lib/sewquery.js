"use strict";
var checkEmpty = function (value) {
    return value === null || (value === undefined);
};
var clasify = function (arr, propName) {
    function check(instance) {
        return function (item) {
            return item === instance;
        };
    }
    var catalog = [], instance = {}, matches, i;
    for (i = 0; i < arr.length; i += 1) {
        instance = arr[i][propName];
        matches = catalog.some(check(instance));
        if (!matches) {
            catalog.push(instance);
        }
    }
    return catalog;
};
var createQueriable = function () {
    return function queryOn(arr, sortCriterias) {
        var simplefind = function (compare) {
            return function (criteriaObject) {
                var found = [];
                if (!checkEmpty(criteriaObject)) {
                    found = arr.filter(function (item) {
                        var p, isMatch = true;
                        if (typeof criteriaObject === "object") {
                            for (p in criteriaObject) {
                                isMatch = isMatch && compare(criteriaObject[p], item[p]);
                            }
                        } else {
                            isMatch = compare(criteriaObject, item);
                        }
                        return isMatch;
                    });
                }
                return queryOn(found);
            };
        }, simpleorder = function (propName, compare) {
            var found = [], sorted = [], catalog = [];
            if (sortCriterias) {
                sortCriterias.forEach(function (sc) {
                    catalog = clasify(arr, sc);
                    sorted = catalog.sort(compare);
                    sorted.forEach(function (cur) {
                        var matches = [];
                        arr.forEach(function (item) {
                            if (item[sc] === cur) {
                                matches = matches.concat([item]);
                            }
                        });
                        clasify(matches, propName).sort(compare).forEach(function (classified) {
                            matches.filter(function (i) {
                                return i[propName] === classified;
                            }).forEach(function (m) {
                                found.push(m);
                            });
                        });
                    });
                });
            } else {
                clasify(arr, propName).sort(compare).forEach(function (c) {
                    var matches = arr.filter(function (i) {
                        return i[propName] === c;
                    });
                    matches.forEach(function (m) {
                        found.push(m);
                    });
                });
            }

            if (sortCriterias) {
                return queryOn(found, sortCriterias.concat([propName]));
            }
            return queryOn(found, [propName]);
        }, matchfirst = function (criteria, col, initialValue, checkEnd, increment) {
            var i = initialValue, j, name, ismatch = false, countMatches, countProperties = 0, props = [], foundat;
            for (name in criteria) {
                countProperties += 1;
                props.push(name);
            }
            while (checkEnd(i, col) && !ismatch) {
                countMatches = 0;
                for (j = 0; j < props.length; j += 1) {
                    if (col[i].hasOwnProperty(props[j]) && criteria[props[j]] === col[i][props[j]]) {
                        countMatches += 1;
                    }
                }
                ismatch = countProperties === countMatches;
                foundat = i;
                i = increment(i);
            }
            if (ismatch) {
                return col[foundat];
            }
            return undefined;
        }, o = Object.create(null);
        o._value = arr;
        o.find = function (criteriaObject) {
            return simplefind(function (a, b) {
                return a === b;
            })(criteriaObject);
        };
        o.count = function (criteriaObject) {
            if (checkEmpty(criteriaObject)) {
                return arr.length;
            }
            var filtered = simplefind(function (a, b) {
                return a === b;
            })(criteriaObject)._value;
            return filtered.length;
        };
        o.but = function (criteriaObject) {
            return simplefind(function (a, b) {
                return a !== b;
            })(criteriaObject);
        };
        o.groupBy = function (propName) {
            function cloneIt(o) {
                var c = Object.create(null), p;
                for (p in o) {
                    if (p !== propName) {
                        c[p] = o[p];
                    }
                }
                return c;
            }
            var catalog = clasify(arr, propName), instance = {}, groups = [];
            if (arr.length > 0) {
                catalog.forEach(function (name) {
                    var details = [], group = Object.create(null), i;
                    for (i = 0; i < arr.length; i += 1) {
                        instance = cloneIt(arr[i]);
                        if (arr[i][propName] === name) {
                            details.push(instance);
                        }
                    }
                    group[propName] = name;
                    group.grouped = details;
                    groups.push(group);
                });
                return queryOn(groups);
            }
            return queryOn(arr);
        };
        o.all = function () {
            return o._value;
        };
        o.first = function (criteria) {
            function check(i, col) {
                return i < col.length;
            }
            if (criteria) {
                return matchfirst(criteria, o._value, 0, check, function (i) { return i + 1; });
            }
            return o._value[0];
        };
        o.last = function (criteria) {
            function check(i, col) {
                return i > 0 && col.length > 0;
            }
            if (criteria) {
                return matchfirst(criteria, o._value, o._value.length - 1, check, function (i) { return i - 1; });
            }
            return o._value[o._value.length - 1];
        };
        o.orderBy = simpleorder;
        o.thenAsc = simpleorder;
        o.descBy = function (propName) {
            return simpleorder(propName, function (a, b) {
                if (a < b) { return 1; }
                if (b > a) { return -1; }
                return 0;
            });
        };
        o.thenDes = o.descBy;
        o.hasArray = function () {
            return Array.isArray(arr) && arr.length > 0;
        };
        o.hasAny = o.hasArray; // to do: remove in next version
        o.has = function (criteria) {
            var found = o.first(criteria);
            return found !== undefined;
        };
        return o;
    };
};
module.exports = createQueriable;