#include <stdio.h>

int main() {
	printf("%d\n", 5 < 10); // Prints 1 for true
	printf("%d\n", 5 >= 10); // Prints 0 for false

	printf("%d\n", 5 == 5); // Prints 1 for true
	printf("%d\n", 5 != 5); // Prints 0 for false

	printf("%d\n", 5 == 6); // Prints 0 for false
	printf("%d\n", 5 != 6); // Prints 1 for true

	// Since relational operators just produce 0 or 1,
	// you can store their values in int variables
	int x;
	scanf("%d", &x);
	int x_is_less_than_10 = x < 10;

	// If the user entered a value less than 10, then
	// x_is_less_than_10 will be 1. Else, it'll be 0.
}
