	
	>>> function F() { return function inner() { return "inner invoked"; }; }
	>>> F()
	inner()
	>>> F()()
	"inner invoked"
	>>> new F
	inner()
	>>> new F()
	inner()
	>>> (new F)
	inner()
	>>> (new F)()
	"inner invoked"
	>>> new (F())
	{ }
	>>> new ((F)())
	{ }
	>>> (new F())()
	"inner invoked"