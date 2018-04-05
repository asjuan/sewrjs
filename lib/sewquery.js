"use strict";
var checkEmpty = function (value) {
    return value == null || value == undefined;
};
var clasify = function (arr, propName) {
    let catalog = [];
    let instance = {};
    let matches;
    for (let i = 0; i < arr.length; i++) {
        instance = arr[i][propName];
        matches = catalog.some(function (item) {
            return item === instance;
        });
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
                return queryOn(found);
            };
        };
        var simpleorder = function (propName, compare) {
            var found = [];
            var sorted = [];
            var catalog = [];
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
            }
            else {
                catalog = clasify(arr, propName);
                sorted = catalog.sort(compare);
                sorted.forEach(function (c) {
                    let matches = arr.filter(function (i) {
                        return i[propName] === c;
                    });
                    matches.forEach(function (m) {
                        found.push(m);
                    });
                });
            }

            if (sortCriterias) return queryOn(found, sortCriterias.concat([propName]));
            return queryOn(found, [propName]);
        };
        var o = Object.create(null);
        o._value = arr;
        o.find = function (criteriaObject) {
            return simplefind(function (a, b) {
                return a === b;
            })(criteriaObject);
        };
        o.count = function (criteriaObject) {
            if (checkEmpty(criteriaObject)) return arr.length;
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
            var catalog = clasify(arr, propName);
            var instance = {};
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
        o.first = function (criteria) {
            var i = 0, name, ismatch = false, countMatches, countProperties = 0, props = [];
            if (criteria) {
                for (name in criteria) {
                    countProperties += 1;
                    props.push(name);
                }
                while (i < o._value.length && !ismatch) {
                    countMatches = 0;
                    props.forEach(function (name) {
                        if (o._value[i].hasOwnProperty(name) && criteria[name] === o._value[i][name]) {
                            countMatches += 1;
                        }
                    });
                    ismatch = countProperties === countMatches;
                    i += 1;
                }
                if (ismatch) {
                    return o._value[i - 1];
                }
                return undefined;
            }
            return o._value[0];
        };
        o.last = function (criteria) {
            var handle;
            if (criteria) {
                handle = o.find(criteria);
                return handle.last();
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
            return typeof(found) !== "undefined";
        };
        return o;
    };
};
module.exports = createQueriable;