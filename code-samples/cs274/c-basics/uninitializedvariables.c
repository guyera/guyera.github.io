#include <stdio.h>

int main() {
	// Declare an int variable named number_of_strawberries
	int number_of_strawberries;

	// Now that number_of_strawberries is declared, it's
	// syntactically legal to reference it. However, it hasn't
	// been initialized yet, so this is UNDEFINED BEHAVIOR
	printf("%d\n", number_of_strawberries);

	// Now we initialize it
	number_of_strawberries = 5;

	// Now it's syntactically legal AND well-defined to reference
	// number_of_strawberries
	printf("%d\n", number_of_strawberries);
}
