#include <stdio.h>

int main() {
	int x; // Declaration. x is bound to the main function's scope

	// This line of code is inside the main function's scope and
	// appears below x's declaration, so x is accessible / can be
	// used here. Here, we "use" / "access" x to store user input
	// inside it
	scanf("%d", &x);

	// Declaration. pi is bound to the main function's scope
	float pi;

	// Check if the user entered 10. Again, we can do this because
	// we're still in the main function's scope, so x is still
	// accessible
	if (x == 10) {
		// Initialize pi, which is bound to the main function's
		// scope (not this if statement's scope) but is still
		// accessible here
		pi = 3.14;

		// pi is still accessible here, much like x
		printf("%f\n", pi);

		// This is perfectly fine. Technically, we're still
		// inside the main function's scope (we're just inside
		// a smaller scope nested within it), so we can still
		// access all variables declared above this point within
		// the main function's scope. That includes x.
		printf("%d\n", x);
	}

	// pi is now accessible here as well since it's bound to the
	// main function's scope in general instead of the if statement
	// body. However, IMPORTANT: If the user enters something other
	// than 10 for the value of x, then the above if statement
	// body will not be executed, and pi will be uninitialized.
	// In such a case, attempting to use its value, while
	// syntactically valid, will invoke undefined behavior.
	// This is a terrible idea, even though the compiler allows it.
	printf("%f\n", pi);
}

// This is outside the main function's scope, so x is not accessible /
// cannot be used down here. But it's also not in ANY function's scope,
// so there wouldn't be much sense in referencing x here anyways.
// (In C, most* code needs to be inside some function body or another.)
