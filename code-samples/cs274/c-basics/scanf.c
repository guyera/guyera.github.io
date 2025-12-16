#include <stdio.h>

int main() {
	// Prompt the user for some values
	printf("Enter your age, followed by a space, followed by your "
		"favorite number: ");

	// Create variables in which to store the user's provided
	// values
	int age;
	float favorite_number;

	// The user is expected to provide their age and THEN their
	// favorite number. The first is an int, and the second is a
	// float, so the format specifiers for these inputs are %d
	// followed by %f. Pause the program until the user enters
	// these two values, then store the supplied values in the
	// 'age' and 'favorite_number' variables, respectively:
	scanf("%d %f", &age, &favorite_number);
	// Notice the ampersands above (&age and &favorite_number)
	
	// Just to prove it worked, add the two numbers together and
	// print the result:
	printf("The sum is %f\n", age + favorite_number);
}
