var sewr = require("../lib/sewr");
describe("query", function () {
    var arr = [{ a: 1, t: "A", q: "M" }, { a: 2, t: "B", q: "H" }, { a: 5, t: "A", q: "H" }];
    it("gets empty array when no criteria", function () {
        var q = sewr.query(arr);
        var filtered = q.find().all();
        expect(filtered.length).toBe(0);
    });
    it("gets 2 elements when t = A", function () {
        var q = sewr.query(arr);
        var filtered = q.find({ t: "A" }).all();
        expect(filtered.length).toBe(2);
        expect(filtered[0].a).toBe(1);
        expect(filtered[1].a).toBe(5);
    });
    it("gets 1 elements when pear", function () {
        var q = sewr.query(["pear", "banana"]);
        var filtered = q.find("pear").all();
        expect(filtered.length).toBe(1);
        expect(filtered[0]).toBe("pear");
    });
    it("returns a:1 when t = A then first", function () {
        var q = sewr.query(arr);
        var found = q.find({ t: "A" }).first();
        expect(found.a).toBe(1);
    });
    it("returns a:5 when t = A then last", function () {
        var q = sewr.query(arr);
        var found = q.find({ t: "A" }).last();
        expect(found.a).toBe(5);
    });
    it("returns undefined when t = D ", function () {
        var q = sewr.query(arr);
        var first = q.find({ t: "D" }).first();
        var last = q.find({ t: "D" }).last();
        expect(first).toBeFalsy();
        expect(last).toBeFalsy();
    });
    it("gets a:2 when q = H then t = B", function () {
        var q = sewr.query(arr);
        var filtered = q.find({q: "H"}).find({t: "B"}).all();
        expect(filtered.length).toBe(1);
        expect(filtered[0].a).toBe(2);
    });
    it("gets 2 elements quen t <> B", function () {
        var q = sewr.query(arr);
        var filtered = q.but({ t: "B" }).all();
        expect(filtered.length).toBe(2);
        expect(filtered[0].a).toBe(1);
        expect(filtered[1].a).toBe(5);
    });
    it("groups by q on empty gets empty", function () {
        var q = sewr.query([]);
        var filtered = q.groupBy('q').all();
        expect(filtered.length).toBe(0);
    });
    it("groups by q on arr gets two groups M and H", function () {
        var q = sewr.query(arr);
        var result = q.groupBy('q').all();
        expect(result.length).toBe(2);
        expect(result[0].q).toBe("M");
        expect(result[1].q).toBe("H");
        expect(result[0].grouped.length).toBe(1);
        expect(result[1].grouped.length).toBe(2);
    });
});
