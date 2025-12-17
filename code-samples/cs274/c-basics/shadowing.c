#include <stdio.h>

int main() {
	int x = 1; // Shadowed x
	
	{
		// Nested scope
		
		// x is not yet shadowed, so this prints 1 (the value of
		// the outer-scope x declared above)
		printf("%d\n", x);

		int x = 2; // Shadowing x

		// The original x is now shadowed by the new x, so this
		// modifies the new x---the original x is left as value
		// 1.
		x = 100;

		// The original x is still shadowed, so this prints
		// the value of the new shadowing x (100)
		printf("%d\n", x);
	}

	// The shadowing x is no longer accessible, so the original
	// x (with value 1) is now unshadowed. This prints its value
	// (1).
	printf("%d\n", x);
}
