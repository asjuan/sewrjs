var sewr = require("../lib/sewr");
var query = require("../lib/sewquery");
var arr = [{ a: 1, t: "A", q: "M" }, { a: 2, t: "B", q: "H" }, { a: 5, t: "A", q: "H" }];
var bigarr = [];
for (let index = 0; index < 100000; index += 1) {
    bigarr.push({ pos: index });
}
describe("low level API", function () {
    it("gets empty array when no criteria", function () {
        var filtered = query()(arr).find().all();
        expect(filtered.length).toBe(0);
    });
    it("gets 2 elements when t = A", function () {
        var filtered = query()(arr).find({ t: "A" }).all();
        expect(filtered.length).toBe(2);
        expect(filtered[0].a).toBe(1);
        expect(filtered[1].a).toBe(5);
    });
    it("gets 1 elements when pear", function () {
        var filtered = query()(["pear", "banana"]).find("pear").all();
        expect(filtered.length).toBe(1);
        expect(filtered[0]).toBe("pear");
    });
    it("returns a:1 when t = A then first", function () {
        var found = query()(arr).find({ t: "A" }).first();
        expect(found.a).toBe(1);
    });
    it("returns a:5 when t = A then last", function () {
        var found = query()(arr).find({ t: "A" }).last();
        expect(found.a).toBe(5);
    });
    it("returns undefined when t = D ", function () {
        var first = query()(arr).find({ t: "D" }).first();
        var last = query()(arr).find({ t: "D" }).last();
        expect(first).toBeFalsy();
        expect(last).toBeFalsy();
    });
    it("gets a:2 when q = H then t = B", function () {
        var filtered = query()(arr).find({ q: "H" }).find({ t: "B" }).all();
        expect(filtered.length).toBe(1);
        expect(filtered[0].a).toBe(2);
    });
    it("gets 2 elements quen t <> B", function () {
        var filtered = query()(arr).but({ t: "B" }).all();
        expect(filtered.length).toBe(2);
        expect(filtered[0].a).toBe(1);
        expect(filtered[1].a).toBe(5);
    });
    it("groups by q on empty gets empty", function () {
        var filtered = query()([]).groupBy('q').all();
        expect(filtered.length).toBe(0);
    });
    it("groups by q on arr gets two groups M and H", function () {
        var result = query()(arr).groupBy('q').all();
        expect(result.length).toBe(2);
        expect(result[0].q).toBe("M");
        expect(result[1].q).toBe("H");
        expect(result[0].grouped.length).toBe(1);
        expect(result[1].grouped.length).toBe(2);
    });
    it("stresses first", function () {
        var found = query()(bigarr).first({ pos: 10000 });
        expect(found.pos).toBe(10000);
    });
    it("stresses last", function () {
        var found = query()(bigarr).last({ pos: 90000});
        expect(found.pos).toBe(90000);
    });
});
describe("query pipelines", function () {
    it("group by parameter", function () {
        var f = sewr.querydef(function (d) {
            return d.groupBy('q').all();
        });
        var result = f(arr);
        expect(result.length).toBe(2);
        expect(result[0].q).toBe("M");
        expect(result[1].q).toBe("H");
        expect(result[0].grouped.length).toBe(1);
        expect(result[1].grouped.length).toBe(2);
    });
    it("counts 3 when no criteria", function () {
        var times = sewr.querydef(function (d) {
            return d.count();
        });
        var result = times(arr);
        expect(result).toBe(3);
    });
    it("counts times instances in which q: H", function () {
        var timesH = sewr.querydef(function (d) {
            return d.count({ q: "H" });
        });
        var result = timesH(arr);
        expect(result).toBe(2);
    });
    it("order by q then by t", function () {
        var f = sewr.querydef(function (d) {
            return d.orderBy('q').thenAsc('t').all();
        });
        var result = f(arr);
        expect(result[0].a).toBe(5);
        expect(result[1].a).toBe(2);
        expect(result[2].a).toBe(1);
    });
    it("order by q then descending by t", function () {
        var f = sewr.querydef(function (d) {
            var single = d.orderBy('q').all(); 
            return d.orderBy('q').thenDes('t').all();
        });
        var result = f(arr);
        expect(result[0].a).toBe(1);
        expect(result[1].a).toBe(2);
        expect(result[2].a).toBe(5);
    });
    it("order descending by a", function () {
        var f = sewr.querydef(function (d) {
            return d.descBy('a').all();
        });
        var result = f(arr);
        expect(result[0].a).toBe(5);
        expect(result[1].a).toBe(2);
        expect(result[2].a).toBe(1);
    });
    it("detects not valid array", function () {
        var f = sewr.querydef(function (d) {
            if (d.hasArray()) {
                return d.all();
            }
            return [];
        });
        var result = f("wow");
        expect(result.length).toBe(0);
    });
    it("uses first and last shorthand when t = B", function () {
        var getFirst = sewr.querydef(function (d) {
            return d.first({ t: "B" });
        });
        var getLast = sewr.querydef(function (d) {
            return d.last({ t: "B" });
        });
        var one = getFirst(arr);
        var two = getLast(arr);
        expect(one.a).toBe(2);
        expect(two.a).toBe(2);
    });
    it("uses has to determine if criteria is matched", function () {
        var checkHappy = sewr.querydef(function (d) {
            return d.has({ a: 2, t: "B" });
        });
        var checkSad = sewr.querydef(function (d) {
            return d.has({ t: "X" });
        });
        expect(checkHappy(arr)).toBe(true);
        expect(checkSad(arr)).toBe(false);
    });
});