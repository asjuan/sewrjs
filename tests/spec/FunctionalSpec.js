function sum(a, b) {
    return a + b;
}
function times2(x) {
    return x * 2;
}
var curriedSum = Sewr.curry(sum);
describe("sewrLib", function() {
  it("should uncurry and return 3", function () {
    var oldSumAgain = Sewr.unCurry(curriedSum);
    var r = oldSumAgain(1,2);
    expect(r).toEqual(3);
  });
  it("should eagerly resolve, run curried function, and return 12", function() {
    var gimme5 = Sewr.setup(5);
    var r = gimme5.sth(curriedSum(1)).sth(times2).on();
    expect(r).toEqual(12);
  });
  it("should use lazy one, run curried function, then return 20", function() {
    var c = Sewr.stitch(curriedSum(7)).stitch(times2);
    expect(c.on(3)).toEqual(20);
  });
  it("should result be deferred, pass in parameters and return 10", function() {
    var lazied = Sewr.stitch(curriedSum).stitch(times2);
    var r = lazied.on(1).on(4);
    expect(r).toEqual(10);
  });
  it("should lazy compose and return 20", function() {
    var lazied = Sewr.sth(curriedSum(7)).sth(times2).on;
    var c = Sewr.setup(3).sth(lazied);
    expect(c.on()).toEqual(20);
  });
  it("should bind using lazyBinder one and return 20", function() {
    var lazied = Sewr.stitch(curriedSum).stitch(times2);
    var r = Sewr.lazyBinder(lazied)(3).on(7);
    expect(r).toEqual(20);
  });
  it("should bind curried and return 6", function() {
    var r = Sewr.stitch(curriedSum).stitch(times2).on(1).stitch(function (x){ return x;}).on(2);
    expect(r).toEqual(6);
  });  
  it("should compose curried and return 12", function() {
    var r = Sewr.setup(3).stitch(curriedSum).stitch(times2).on(3);
    expect(r).toEqual(12);
  });
  it("should compose curried, default to lazy and return 4", function() {
    r = Sewr.setup().stitch(curriedSum).stitch(times2).on(1).on(1);
    expect(r).toEqual(4);
  });
  it("should bind curried, then uncurry and return 12", function() {
    function identity(x) {
      return x;
    }
    var patchwork = Sewr.stitch(curriedSum).stitch(times2).stitch(identity).stitch(times2);    
    var r = patchwork.unFold(1, 2)
    expect(r).toEqual(12);
  });
});
