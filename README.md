![alt text][logo]
[logo]: https://github.com/asjuan/sewrjs/blob/master/src/images/sewr.png "Logo"

Yet another javascript library that provides basic funcional operators.

Functions can be stitched together to produce a new function, that is the composition of both of them. 

This tiny library won't interfere with other libraries.

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
var fXg = Sewr.stitch(f).stitch(g);

fXg.on(1); //will return 3
```
In real life scenarios, not all functions require one parameter. In order to compose, we must curry it as shown below 
```
function sum(a, b) {
    return a + b;
}
var curriedSum = Sewr.curry(sum);
```

Once the function has been curried now on it can be stitched!
```
function identity(x) {
    return x;
}
var patchwork = Sewr.stitch(curriedSum).stitch(times2).stitch(identity).stitch(times2);    
var r = patchwork.unFold(1, 2)    
```
