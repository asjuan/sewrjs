Yet another javascript library that provides basic funcional operators.

Functions can be stitched together to produce a new function, that is refered as the composition of both of them. 

## Basic composition
To compose two unary functions
```
var sewr = require("sewrjs");
var f = function (v) { return v + 2 };
var g = function (v) { return v / 3 };
var fXg = sewr.stitch(f).stitch(g);
fXg.on(10); // this resolvea (10 + 2)/3 == 4 
```

Latest version 1.6

Maybe monad intruduced
```
//Given
arr = [];
f = function (value) {
    arr.push(value);
};
// Following sequence will produce arr = [1, 1]
sewr.toMaybe(1).stitch(f).stitch(f);
// but if null is passed, same will get arr = []
```

## Other examples

Let f and g be unary functions, both of them take in a numeric parameter and return numbers as well. 
```
function f(x) {
    return x + 1;
}

function g(y) {
    return y * 2;
}
```
To create a composition and get something useful,
```
function fXg(x) {
    return f(g(x));
}

fXg(1);  //this will result in 3
```
In sewr the same can be accomplished by
```
var fXg = sewr.stitch(f).stitch(g);

fXg.on(1); //will return 3
```
In real life scenarios, not all functions require one parameter. In order to compose, we must curry it as shown below 
```
function sum(a, b) {
    return a + b;
}
var curriedSum = sewr.curry(sum);
```

Once the function has been curried, now on it can be stitched
```
function identity(x) {
    return x;
}
var composed = sewr.stitch(curriedSum).stitch(times2).stitch(identity).stitch(times2);
```
Supose it is needed to pass in parameters 1 and 2. To do that, there are two possibilities.

First, it is possible to pass one parameter at a time as follows:
``` 
var foo = composed.on(1).on(2);
```
Alternatively, composed function could be unfolded: 
```
var bar = composed.unFold(1, 2);
foo === bar //true
```
