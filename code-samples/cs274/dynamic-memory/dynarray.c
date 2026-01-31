#include <stdio.h>
#include <stdlib.h>

int main() {
	// Ask the user for how big the array should be
	printf("How many floats should the array have?: ");
	size_t n;
	scanf("%ld", &n);

	// Create a dynamic array of that many floats. This is done by
	// computing the size of such an array in bytes
	// (sizeof(float) * n), passing that size to
	// malloc(), and treating the returned address as the base
	// address of an array of floats.
	float* numbers = (float*) malloc(sizeof(float) * n);

	// numbers stores the base address of a block of bytes on the
	// heap that's big enough to store n floats. We can indeed treat
	// it as an array of n floats. Let's populate it with a bunch
	// of copies of 3.14
	for (int i = 0; i < n; ++i) {
		numbers[i] = 3.14;
	}

	// Print the last value in the array
	printf("%f\n", numbers[n-1]);

	// Free the dynamic array
	free(numbers);
}
