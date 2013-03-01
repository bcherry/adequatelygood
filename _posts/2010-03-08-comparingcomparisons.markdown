---
title: Performance of === vs. ==
layout: base
tags: [javascript, performance]
permalink: 2010/3/Performance-of-vs-
---

One particular weirdness and unpleasantry in JavaScript is the set of equality operators.  Like virtually every language, JavaScript has the standard `==`, `!=`, `<`, `>`, `<=`, and `>=` operators.  However, `==` and `!=` are NOT the operators most would think they are.  These operators do __type coercion__, which is why `[0] == 0` and `"\n0\t " == 0` both evaluate to `true`.  This is considered, by sane people, to be a __bad thing__.  Luckily, JavaScript does provide a normal set of equality operators, which do what you expect: `===` and `!==`.  It sucks that we need these at all, and `===` is a pain to type, but at least `[0] !== 0`.

So, that's all well and good, but when making the decision to use `===` instead of `==` it's important to understand if there are any performance implications.  Reasonable people, like myself, would expect the strict equality operators to be faster than their type-coercing counterparts, because the type coercion must take time.  But, being [a scientist](http://xkcd.com/242/), I had to set up an experiment to test this hypothesis.

## For Science!

[My experiment](http://www.bcherry.net/playground/comparisons) times the execution time of 24 different tests, in the browser you view it in.  These tests represent every permutation of the following factors:

 1. __Use__: Whether the result is computed and thrown away, or assigned into a local variable.
 2. __Comparison__: Comparing integers vs. integers, strings vs. strings, and integers vs. strings.
 3. __Operands__: Whether the operands are actually equal or unequal (with forced type coercion in the case of `===`).
 4. __Operator__: Using either `==` or `===`.

Note that I am specifically __not__ testing the relative performance when comparing against values like `null`, `undefined`, or `false`.  This is because those are falsy values which have even worse type coercion characteristics.  Some integers and strings can, of course, also be falsy, such as `0` or `""`, but these are normal values which occur during arithmetic or string comparison, so I've tested with them.

The tests were run over two million iterations, except in Internet Explorer, where it produced a long-running script error, so I cut it to 500,000 iterations.  Here are the browser configurations I tested:

 1. Mozilla Firefox 3.6 (Mac)
 2. Google Chrome 5 (Mac dev channel)
 3. Internet Explorer 8 (iterations reduced by 4x)
 4. Safari 4 (Mac)
 5. Opera 10.5 beta (Mac)
 6. Mozilla Firefox 3.6 (Mac) with Firebug open

## Results

My results are [available as a Google spreadsheet here](http://spreadsheets.google.com/pub?key=taW8f6kvj3kUVObtg4p9vqQ&output=html).  It turns out that there is little practical performance difference between `==` and `===`.  While the strict operator is marginally faster (roughly 10%) in most browsers when combined with explicit type conversion, such as `a === +b`, the only real performance gains will come from avoiding type conversion entirely.  __Converting a string to an integer for comparison with another integer is significantly slower (up to 10x) than simple comparing two integers__.  You should never allow integers to be stored as strings internally, as the type conversion will incur a performance penalty.

While that was the basic takeaway from the numbers, I did find one interesting outlier when testing with Firefox.  In Firefox, the comparison `a === +b` is about 20x slower than the equivalent `a == b` when `a` is an integer and `b` is a string integer.  This result seems suspicious to me, and nothing similar occurred in any other browser.  Oddly, when the Firebug script debugger is turned on, this result changes, and `a === +b` becomes about 10% faster than the other.  I'm not sure what to make of this result, but it does serve as a reminder that integers should always be stored in numbers, not in strings.

## Conclusion

Not much surprise in these results, other than the Firefox result.  But, it did help me avoid a nagging worry that I'm silently slowing down my code whenever I use `===` instead of `==` in my JavaScript.

Again, find the test [here](http://www.bcherry.net/playground/comparisons) and my results [here](http://spreadsheets.google.com/pub?key=taW8f6kvj3kUVObtg4p9vqQ&output=html).  I hope you found this information interesting.  Let me know in the comments if you see different results than I got.
