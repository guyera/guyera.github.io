#include<stdlib.h>

// If it fails to allocate an array via malloc(), it returns NULL
double* create_array_of_zeroes(size_t size) {
	double* array = malloc(sizeof(double) * size);
	if (!array) {
		return NULL;
	}
	for (int i = 0; i < size; ++i) {
		array[i] = 0.0;
	}
	return array;
}

int main() {
	// Creates an array of 100 doubles, each initialized to 0.0,
	// storing its base address in the 'array' pointer.
	double* array = create_array_of_zeroes(100);
	if (!array) {
		printf("Error! Failed to allocate array on the heap!\n");
		exit(1);
	}

	// ...

	// Don't forget to free it when you're done with it!
	free(array);
}
