One of JavaScript's most convenient features is the object syntax.  Objects are so easy to work with.  You've got a lot of ways to make them, although the object literal syntax in particular kicks ass. You can access and assign them with either the dot operator or dictionary syntax.  Missing properties just return `{@class=js}undefined`.  This is just a really fantastic object model.

So, today, I sat down to write my first serious Python code in a while, and found myself trying use a dictionary like a JavaScript object.  This was a total failure, obviously.  Python simply does not have that.  Luckily, it's an incredibly malleable language, if you're willing to do the legwork.  So, in about 30 min, I implemented JavaScript-style objects.

To make a JavaScript-style object, you use `{@class=python}js.JsObject()`.

	@@@python
	import js
	foo = js.JsObject()

You can assign properties with either dictionary syntax or the dot operator.

	@@@python
	foo.bar = 1
	foo['baz'] = 2

Reading properties works the same, and properties that don't exist simply return `{@class=python}None`.
	
	@@@python
	foo['bar'] # 1
	foo.baz # 2
	foo.spam # None
	foo['spam'] # None

It just prints out as a dictionary when you convert it to a string, as is done by the `{@class=python}print` operator.  It also does the same when viewed in the interpreter.

	@@@python
	print foo # {'baz': 2, 'bar': 1}

The properties are iterable just as in JavaScript.  This is different than normal Python dictionaries, where you iterate on a tuple of `(key, value)`.  Here we just get the keys.

	@@@python
	for prop in foo:
		print prop, foo[prop] # bar 1, baz 2

You can also delete properties, using either the dot operator or dictionary syntax.  It won't `{@class=python}raise` if the property doesn't exist, either.

	@@@python
	del foo.bar
	del foo['spam']
	
You can also easily check if properties exist using the `{@class=python}in` operator.

	@@@python
	'baz' in foo # True
	'bar' in foo # False

And object comparison works as in JavaScript.  Two will never be the same, even if they have the same properties and values.

	@@@python
	js.JsObject() == js.JsObject() # False
	js.JsObject() is js.JsObject() # False

And, finally, the constructor function is more flexible than I let on initially.  You can pass in keyword arguments, which will end up as properties.  You can also pass a dictionary to initialize it with.  Or, you can pass both!

	@@@python
	foo = js.JsObject(a=1, b=2)
	print foo # {'a': 1, 'b': 2}
	
	foo = js.JsObject({'a': 1, 'b': 2})
	print foo # {'a': 1, 'b': 2}
	
	foo = js.JsObject({'a': 1}, b=2)
	print foo # {'a': 1, 'b': 2}
	

So yeah, that's pretty awesome.  I thought about handling prototypal inheritance too, but I just don't see the need.  I almost never use prototypes in JavaScript, I'm positive I would never use them in Python.  I'm also not crazy about the creation syntax, but I couldn't find a way to re-purpose the dictionary literal `{}`, and didn't want to override built-in names like `{@class=python}dict` or `{@class=python}object`.  I also wanted to keep with Python conventions and UpperCamelCase the class name, so `{@class=python}js.JsObject()` is what I settled on.

You're probably curious about the implementation, so here's the full source code.  I'm probably missing some useful things, but this is what I have so far.  It's quite simple; for the most part it just overrides everything to some form of dictionary method on `{@class=python}self.___dict__`.  You can also find [js.py on GitHub](http://github.com/bcherry/js-py/blob/master/js.py).

	@@@python
	class JsObject(object):
		def __init__(self, *args, **kwargs):
			for arg in args:
				self.__dict__.update(arg)

			self.__dict__.update(kwargs)

		def __getitem__(self, name):
			return self.__dict__.get(name, None)

		def __setitem__(self, name, val):
			return self.__dict__.__setitem__(name, val)

		def __delitem__(self, name):
			if self.__dict__.has_key(name):
				del self.__dict__[name]

		def __getattr__(self, name):
			return self.__getitem__(name)

		def __setattr__(self, name, val):
			return self.__setitem__(name, val)

		def __delattr__(self, name):
			return self.__delitem__(name)

		def __iter__(self):
			return self.__dict__.__iter__()

		def __repr__(self):
			return self.__dict__.__repr__()

		def __str__(self):
			return self.__dict__.__str__()
	
So, there you go.  I'd love to hear what you think, leave a comment!