#include <stdio.h>

int main(void) {
	float some_numbers[100];

	// Initializes all elements to 3.14
	for (int i = 0; i < 100; ++i) {
		some_numbers[i] = 3.14f;
	}

	// Change the fifth element to 9.81
	some_numbers[4] = 9.81;

	// Print the fifth element in the array:
	printf("The fifth element is: %f\n", some_numbers[4]);

	// Print the 3rd element, then the 4th, then 5th, up through
	// the 9th
	for (int i = 2; i < 9; ++i) {
		printf("Element %d: %f\n", i + 1, some_numbers[i]);
	}

	// Add the fourth and fifth elements together and print the
	// sum
	printf(
		"%f + %f = %f\n",
		some_numbers[3],
		some_numbers[4],
		some_numbers[3] + some_numbers[4]
	);
}
