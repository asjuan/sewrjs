Yet another javascript library that provides basic funcional operators.

Functions can be stitched together to produce a new function, that is refered as the composition of both of them. 

Latest version 0.2.0

New feature: query operators on arrays

## Composition

Let f and g be unary functions, both of them take in a numeric parameter and return numbers as well. 
```
function f(x) {
    return x + 1;
}

function g(y) {
    return y * 2;
}
```
One alternative to compose without sewr,
```
function fXg(x) {
    return f(g(x));
}

fXg(1);  //this will result in 3
```
One problem, is about adding more functions to such a composition. More and more parenthesis will be required and sometimes is confusing.

In sewr the same can be accomplished by
```
var fXg = sewr.stitch(f).stitch(g);

fXg.on(1); //will return 3
```

## Basic composition
To compose two unary functions
```
var sewr = require("sewrjs");
var f = function (v) { return v + 2 };
var g = function (v) { return v / 3 };
var fXg = sewr.stitch(f).stitch(g);
fXg.on(10); // equals to 4, because (10 + 2)/3  
```

## Curry multiple params
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
foo === bar // true
```
## Maybe and recurse

Maybe monad example
```
// Given
 var f = function (m) {
     // m is an object come with two properties:
     // isEmpty
     // value
     if (m.isEmpty) return m.value;
     return m.value + 2;
 };
// Following sequence 
 var result = sewr.toMaybe(0).sth(f).on(null);
// will produce
// result === 0
```
## Recursing a tree structure

In the example below an object literal is read. But some property names start with a capital letter. So, a function is created to fix all property names.
```
var brokenobj = {
    name: "me",
    phones: [
        {
            Number: "1111111",
            Type: "mobile"
        },
        {
            Number: "2222222",
            Type: "work",
            Notes: ["bar", "foo", null]
        }
    ],
    Flag: true
};
var fix = function (m) {
    // the m object will expose property:
    // value
    // and methods:
    // hasLeavesOn
    // recurseOn
    var fixed = {};
    for (let propertyName in m.value) {
        if (m.hasLeavesOn(propertyName)) {
            fixed[propertyName.toLowerCase()] = m.recurseOn(propertyName);
        }
        else {
            fixed[propertyName.toLowerCase()] = m.value[propertyName];
        }
    }
    return fixed;
};
var fixed = sewr.toRecursive(fix).on(brokenobj);
```

## Operators on arrays

filter, map, some, reduce among others are great built in methods, and provide ways to deal with arrays in a functional way. The extension sewr provides are not intended to replace them to improve legibility and simplify some tasks. Examples,

```
 var arr = [{ a: 1, t: "A", q: "M" }, 
         { a: 2, t: "B", q: "H" }, 
         { a: 5, t: "A", q: "H" }
     ];
// simple find
var filtered = q.find({ t: "A" }).all();
// brings a: 1 and a: 5

// composed queries
var all = q.find({q: "H"}).find({t: "B"}).all();
var last = q.find({q: "H"}).find({t: "B"}).last();
var except = q.but({ t: "B" }).all();
```

It is also possible to group items by given property
```
var result = q.groupBy('q').all();
```

The example above, result will be as follows 
```
[
	{
		"q": "M",
		"grouped": [
			{
				"a": 1,
				"t": "A"
			}
		]
	},
	{
		"q": "H",
		"grouped": [
			{
				"a": 2,
				"t": "B"
			},
			{
				"a": 5,
				"t": "A"
			}
		]
	}
]
```