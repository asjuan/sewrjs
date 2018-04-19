Yet another javascript library aimed to ease composition of functions.

Functions can be stitched together to produce a new function, that is refered as the composition of both of them.

Sewr does not modify current prototype chains, so it should not interfere with existing objects.

Latest version 0.3.1

# Arrays

This section will help to understand composition, using operations on arrays as first use case scenario.

Note: following operators are not intended to replace Array.prototype members like filter, map, reduce among others. 

Operators are a set of extensions that improve legibility and simplify some tasks. 

Examples,

```
// Let
var arr = [
         { a: 1, t: "A", q: "M" }, 
         { a: 2, t: "B", q: "H" }, 
         { a: 5, t: "A", q: "H" }
     ];

```
Sewr provide querydef method, that can be used as follows. 

```
var sewr = require("sewrjs");
var f = sewr.querydef(function (d) {
    return d.groupBy('q').all();
});

```
Now, _f_ becomes an array processing pipeline. If the variable _arr_ is passed in as an argument
```
var result = f(arr);
```
It will produce following grouped array
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

## Operators

sewr.querydef needs a function to be passed in, the argument of that function is the definition object. 

|  Method    | Example                 | Comment                         |
|------------|-------------------------|---------------------------------|
| groupBy    | d.groupBy('q').all();   | group by property then show all |
| find       | d.find({q: "H"}).all(); | find will match criteria        |
| last       | d.find({q: "H"}).last();| after query, get last member    |
| first      | d.find({q: "H"}).first()| similar, get first member (it is not ideal because ) |
| first      | d.first({q: "H"});      | find first method (better performance)  |
| last       | d.last({q: "H"});       | find last method (better performance)  |
| but        | d.but({t: "B"}).all();  | finds all but when _t_ equals B |
| count      | d.count({r: "B"});      | number of times r equals B      |
| hasAny (deprecated) | d.hasAny();             | checks valid arrays, but will be replaced in future releases by method below this line |
| hasArray   | d.hasArray();           | true if valid non empty array   |
| has        | d.has({q: "H"})         | true if one element matches criteria (ideal to deal with big datasets) |
| orderBy    | d.orderBy('q').all();   | orders by property _q_          |
| descBy     | d.descBy('q').all();    | descending order                |
| thenAsc    | ...d').thenAsc('a')...  | syntactic sugar to chain order by|
| thenDes    | ...d').thenDes('a')...  | syntactic sugar to chain order by|

Note:

It is also possible to chain methods 

```
function (d) {
    return return d.find({q: "H"}).find({t: "B"}).all(); // apply two filters, then get all
    // return d.orderBy('q').orderBy('t').all(); // orders by first criteria then by property t. 
};
```

# Theory

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

Maybe object example
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
## Reducing

ToReduce gets two arguments, a seed and a function. That function gets access to the m object.
This object is a container that has following properties

* input
* accumulator
* runAgain

Example below shows one possible way to implement fibonacci sequence.

```
function fibo(m) {
    var calculated, last;
    last = m.accumulator.length;
    calculated = m.accumulator[last - 1] + m.accumulator[last - 2];
    m.runAgain(m.accumulator.concat(calculated)).while(function (acc) {
        return acc.length < m.input;
    });
}
var sequence = sewr.toReduce([1, 1],fibo).on(5); 
// this will produce [1, 1, 2, 3, 5]
```