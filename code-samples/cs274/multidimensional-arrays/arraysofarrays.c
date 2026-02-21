#include <stdio.h>

void print_1d_array(int array[], size_t size) {
	for (int i = 0; i < size; ++i) {
		printf("%d ", array[i]);
	}
	printf("\n");
}
// Or, equivalently
// void print_1d_array(int* array, size_t size)...

int main(void) {
	int values[][2] = {
		{1, 7},
		{-4, 2},
		{9, 5}
	};

	// Print the first row of values (which has 2 elements, since
	// there are 2 columns)
	print_1d_array(values[0], 2);

	// Print the second row of values (which has 2 elements, since
	// there are 2 columns)
	print_1d_array(values[1], 2);

	// And so on...
}
