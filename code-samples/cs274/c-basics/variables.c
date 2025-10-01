#include <stdio.h>

int main() {
	// Declare an int variable named number_of_strawberries
	// and initialize it to 5 all in one statement
	int number_of_strawberries = 5;

	// Print the value of number_of_strawberries (5)
	printf("%d\n", number_of_strawberries);

	// Change the value stored in number_of_strawberries to 10
	number_of_strawberries = 10;

	// This now prints 10
	printf("%d\n", number_of_strawberries);

	// Increase number_of_strawberries by 1
	number_of_strawberries = number_of_strawberries + 1;
	
	// Prints 11
	printf("%d\n", number_of_strawberries);
}
