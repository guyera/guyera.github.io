#include <stdio.h>

int main() {
	float some_numbers[100];

	// Initializes all elements to 3.14
	for (int i = 0; i < 100; ++i) {
		some_numbers[i] = 3.14f;
	}

	// Print the fifth element in the array:
	printf("The fifth element is: %f\n", some_numbers[4]);

	// Print the 11th element, then the 12th, then 13th, up through
	// the 27th
	for (int i = 10; i < 27; ++i) {
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
