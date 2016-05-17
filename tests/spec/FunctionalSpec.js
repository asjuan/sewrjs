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
  it("should eagerly resolve, run curried function,  and return 12", function() {
    var gimme5 = Sewr.setup(5);
    var r = gimme5.compose(curriedSum(1)).stitch(times2).applyAll();
    expect(r).toEqual(12);
  });
  it("should use lazy one, run curried function, then return 20", function() {
    var c = Sewr.stitch(curriedSum(7)).stitch(times2);
    expect(c.applyAll(3)).toEqual(20);
  });
  it("should result be deferred, pass in parameters and return 10", function() {
    var lazied = Sewr.stitch(curriedSum).stitch(times2);
    var r = lazied.applyAll(1).applyAll(4);
    expect(r).toEqual(10);
  });
  it("should lazy compose and return 20", function() {
    var lazied = Sewr.stitch(curriedSum(7)).stitch(times2).applyAll;
    var c = Sewr.setup(3).compose(lazied);
    expect(c.applyAll()).toEqual(20);
  });
  it("should bind using lazyBinder one and return 20", function() {
    var lazied = Sewr.stitch(curriedSum).stitch(times2);
    var r = Sewr.lazyBinder(lazied)(3).applyAll(7);
    expect(r).toEqual(20);
  });
  it("should bind curried and return 6", function() {
    function identity(x) {
      return 1 * x;
    }
    function lazied(x, y) {
       return Sewr.stitch(curriedSum).stitch(times2).applyAll(x).stitch(identity).applyAll(y);
    }
    var r = lazied(1, 2);
    expect(r).toEqual(6);
  });  
  it("should compose curried and return 12", function() {
    function customBind(x , y) {
        var f = Sewr.setup(x).stitch(curriedSum).stitch(times2).applyAll;
        return f(y);
    }
    var r = customBind(3, 3);
    expect(r).toEqual(12);
  });
  it("should compose curried, default to lazy and return 4", function() {
    function customBind(x , y) {
        var f = Sewr.setup().stitch(curriedSum).stitch(times2).applyAll(x).applyAll;
        return f(y);
    }
    var r = customBind(1, 1);
    expect(r).toEqual(4);
  });
});
