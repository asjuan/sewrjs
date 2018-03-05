var sewr = require("../lib/sewr");
describe("async", function () {
    it("waits and gets 1, 2, 3, 4", function (done) {
        var add4 = function (arr) {
            return arr.concat(4);
        };
        var p = new Promise(function (onOk, onErr) {
            setTimeout(function () {
                onOk([1, 2, 3]);
            }, 100);
        });
        p.then(function (arr) {
            var arr1To4 = sewr.sth(add4).on(arr);
            expect(arr1To4.length).toBe(4);
            expect(arr1To4[0]).toBe(1);
            expect(arr1To4[1]).toBe(2);
            expect(arr1To4[2]).toBe(3);
            expect(arr1To4[3]).toBe(4);
            done();
        });
    });
});
