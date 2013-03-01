# Objective-C for JavaScript Programmers

/* intro here */

Potential Topics

* Looping, if, etc
* Types
* Objects/Classes
  * properties
  * methods
  * inheritance
* Scope
* Blocks
* Delegates
* Selectors
* Notifications
* Timers
* GUI programming
* Functions
* ARC
* CF, low-level stuff

* Header files


## Variable Scope

Objective-C uses *block-level* scoping, which means that any block of statements creates a new scope. In general, "block" means any structure between a pair of `{}`, such as the body of an `if` statement.  Confusing the matter, Objective-C also introduces a concept called blocks which are similar to JavaScript's anonymous functions.  Don't let this confuse you too much.

    NSInteger x = 1;
    if (YES) {
      NSInteger y = 2;
    }

    y = 3; // Compiler Error