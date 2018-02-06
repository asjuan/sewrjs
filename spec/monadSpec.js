var sewr = require("../src/sewr");
describe("maybe monad", function () {
    var f;
    var arr;
    beforeEach(function () {
        arr = [];
        f = function (value) {
            arr.push(value);
        };
    });
    it("ignores f when empty", function () {
        var o = sewr.toMaybe(null).stitch(f);
        expect(o.isEmpty).toBe(true);
        expect(arr.length).toBe(0);
    });
    it("pushes to arr when valid", function () {
        var maybe = sewr.toMaybe(1).stitch(f);
        expect(maybe.isEmpty).toBe(false);
        expect(arr.length).toBe(1);
    });
    it("push it twice because valid", function () {
        sewr.toMaybe(1).stitch(f).stitch(f);
        expect(arr.length).toBe(2);
    });
    it("accumulates if available", function () {
        var f = function (value) { return value * 2 };
        var g = function (value) { return value + 1; };
        var result = sewr.toMaybe(2).stitch(f).stitch(g);
        expect(result.value).toBe(5)
    });
});