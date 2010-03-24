
	@@@js
	function population(country, pop) {
		return {
			country: country,
			pop: pop
		};
	}
	
	var america_pop = population("USA", 350e6);
	var mexico_pop = population("Mexico", 200e6);
	var canada_pop = population("Canada", 200e6);
	
	alert(america_pop); // [Object object]
	
	var north_america_pop = america_pop + mexico_pop + canada_pop;
	
	alert(north_america_pop); // [Object object][Object object][Object object]
	
What we really want here is the first `{@class=js}alert` to show `[Population "USA" 350000000]` and the second to show `750000000`.  Luckily, JavaScript _does_ provide a handy way of accomplishing this.  All objects inherit the property `toString` from `Object.prototype`, which returns `[Object object]`.  However, we can easily override this by providing it as a method of our object, or its prototype.

	@@@js
	function population(country, pop) {
		return {
			country: country,
			pop: pop,
			
			toString: function () {
				return "[Population " + 
					"\"" + country + "\" " +
					pop +
				"]";
			}
		}
	}
	
	var america_pop = population("USA", 350e6);
	alert(america_pop); // [Population "USA" 350000000]

<span class="note">Note that I'm using __closure__ on the `country` parameter, rather than using `{@class=js}this.country`.  This only works due to how the constructor is set up.  If you placed `toString` on the prototype, you would need to use `{@class=js}this.country`.</span>

So that gets us through the first `alert`, but we still need to make the second one work.  All JavaScript objects also inherit the method `valueOf` from `Object.prototype`.  This method is generally used to convert an object to a `Number`, which the `+` operator will do (more on that later).  We can do the same thing as above to complete our basic example.

	@@@js
	function population(country, pop) {
		return {
			country: country,
			pop: pop,
			
			toString: function () {
				return "[Population " + 
					"\"" + country + "\" " +
					pop +
				"]";
			},
			
			valueOf: function () {
				return pop;
			}
		};
	}

	var america_pop = population("USA", 350e6);
	var mexico_pop = population("Mexico", 200e6);
	var canada_pop = population("Canada", 200e6);

	alert(america_pop); // [Population "USA" 350000000

	var north_america_pop = america_pop + mexico_pop + canada_pop;

	alert(north_america_pop); // 750000000
