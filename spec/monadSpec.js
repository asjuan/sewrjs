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
            if (m.isEmpty) return m.value;
            return m.value + 2;
        };
        var result = sewr.toMaybe(0).sth(f).on(null);
        expect(result).toBe(0);
    });
    it("fixes properties coming in upper case", function () {
        var brokentree = {
            name: "me",
            phones: [
                {
                    Number: "1111111",
                    Type: "mobile"
                },
                {
                    Number: "2222222",
                    Type: "work",
                    Notes: ["bar", "foo", null]
                }
            ],
            Flag: true
        };
        var fix = function (m) {
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
        var tree = sewr.toRecursive(fix).on(brokentree);
        expect(tree.flag).toBeTruthy();
        expect(tree.phones[0].type).toBe("mobile");
        expect(tree.phones[1].notes[0]).toBe("bar");
        expect(tree.phones[1].notes[1]).toBe("foo");
        expect(tree.phones[1].notes[2]).toBeNull();
    });
    it("produces fibo sequence to 5", function () {
        function fibo(m) {
            var calculated, last;
            m.initAccumulator([1, 1]);
            last = m.accumulator.length;
            calculated = m.accumulator[last - 1] + m.accumulator[last - 2];
            m.runAgain(m.accumulator.concat(calculated))
                .until(function (acc) {
                    return acc.length < m.input;
                });
        }
        var sequence = sewr.toIterable(fibo).on(5);
        expect(sequence[0]).toBe(1);
        expect(sequence[1]).toBe(1);
        expect(sequence[2]).toBe(2);
        expect(sequence[3]).toBe(3);
        expect(sequence[4]).toBe(5);
    });
});