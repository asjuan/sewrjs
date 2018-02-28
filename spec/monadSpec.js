var sewr = require("../lib/sewr");
describe("maybe monad", function () {
    var curriedf;
    var initial = [];
    beforeEach(function () {
        var f = function (acc, curr) {
            if (curr.isEmpty) return curr;
            acc.value.push(curr.value);
            return acc;
        };
        curriedf = sewr.curry(f);
    });
    it("ignores f when empty", function () {
        var maybe = sewr.toMaybe([]).stitch(curriedf).on(initial).on(null);
        expect(maybe.isEmpty).toBe(true);
        expect(maybe.value.length).toBe(0);
    });
    it("pushes to arr when valid", function () {
        var maybe = sewr.toMaybe([]).stitch(curriedf).on(initial).on(2);
        expect(maybe.isEmpty).toBe(false);
        expect(maybe.value.length).toBe(1);
        expect(maybe.value[0]).toBe(2);
    });
    it("5 when 2 is passed in", function () {
        var f = function (m) {
            var o = Object.create(null);
            o.value = m.value * 2;
            o.isEmpty = m.isEmpty;
            return o;
        };
        var g = function (m) {
            var o = Object.create(null);
            o.value = m.value + 1;
            o.isEmpty = m.isEmpty;
            return o;
        };
        var result = sewr.toMaybe(0).stitch(f).stitch(g).on(2);
        expect(result.value).toBe(5);
    });
    it("gets 4 using shorthand", function () {
        var f = function (m) {
            var o = Object.create(null);
            o.value = m.value + 2;
            o.isEmpty = m.isEmpty;
            return o;
        };
        var result = sewr.toMaybe(0).sth(f).on(2);
        expect(result.value).toBe(4);
    });
    it("is both empty and zero because of null", function () {
        var f = function (m) {
            var o = { isEmpty: false, value: 0 };
            if (m.isEmpty) return m;
            o.value = m.value + 2;
            o.isEmpty = m.isEmpty;
            return o;
        };
        var maybe = sewr.toMaybe(0).sth(f).on(null);
        expect(maybe.value).toBe(0);
        expect(maybe.isEmpty).toBe(true);
    });
    it("fixes Upper case properties ", function () {
        var brokentree = {
            name: "me",
            phones: [
                {
                    Number: "1111111",
                    Type: "mobile"
                },
                {
                    Number: "2222222",
                    Type: "work"
                }
            ],
            Flag: true
        };
        var fixer = function (m) {
            var fixed = {};
            for (let propertyName in m.value) {
                if (m.hasLeavesOn(propertyName)) {
                    fixed[propertyName.toLowerCase()] = m.recurseOn(propertyName);
                }
                else {
                    fixed[propertyName.toLowerCase()] = m.value[propertyName];
                }
            }
            return fixed;
        };
        var tree = sewr.toRecursive(fixer).on(brokentree);
        expect(tree.flag).toBeTruthy();
        expect(tree.phones[0].type).toBe("mobile");
    });
});