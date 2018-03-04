var sewr = require("../lib/sewr");
describe("async", function () {
    var fasync;
    beforeEach(function () {
        fasync = setTimeout(function () {
            return [1, 2, 3];
        }, 100);
    });
    it("waits and gets 1, 2, 3, 4", function () {
        var add4 = function (arr) {
            return arr.concat(4);
        };
        var arr1To4 = sewr.toAsync(fasync).stitch(add4).on(null);
        expect(arr1To4.length).toBe(4);
        expect(arr1To4[0]).toBe(1);
        expect(arr1To4[1]).toBe(2);
        expect(arr1To4[2]).toBe(3);
        expect(arr1To4[3]).toBe(4);
    });
});
