# sewrjs

[logo]: https://github.com/asjuan/sewrjs/blob/master/src/images/sewr.png "Logo"

Yet another javascript library that provides basic funcional operators.

Functions can be stitched together to produce a new function, that is the composition of both of them. 

This tiny library is unintrusive, so it won't interfere with existing libraries.

## Examples

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

fXg.applyAll(1); //will return 3
```
In real life scenarios, not all functions have just one parameter, to compose them we can curry them
```
function sum(a, b) {
    return a + b;
}
var curriedSum = sewr.curry(sum);
```

Once the function has been curried now on it can be stitched!
