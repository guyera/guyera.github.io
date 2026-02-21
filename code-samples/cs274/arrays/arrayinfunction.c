#include <stdio.h>

// Notice: The size is omitted in the square brackets and instead
// received as an additional size_t parameter.
void print_numbers(double numbers[], size_t array_size) {
	for (int i = 0; i < array_size; ++i) {
		printf("%.2f", numbers[i]);
		if (i < array_size - 1) {
			// Print a comma between each value
			printf(", ");
		}
	}
	printf("\n");
}

int main(void) {
	double my_numbers[] = {3.14, 9.81, -7.2};
	print_numbers(my_numbers, 3);

	// Print just the first two values from the array
	print_numbers(my_numbers, 2);

	// This would cause a buffer over-read. DON'T do this!!!
	// print_numbers(my_numbers, 4);

	// Print just 2 values, starting from the second element
	// (9.81, -7.2)
	double* ptr = my_numbers + 1; // Points to the 2nd element, 9.81
	print_numbers(ptr, 2);

	// This would cause a buffer over-read. DON'T do this!!!
	// print_numbers(ptr, 3);
}
