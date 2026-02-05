#include <stdlib.h>

int main() {
	double* array = malloc(sizeof(double) * 100);
	if (!array) {
		printf("Error on malloc()\n");
		exit(1);
	}

	// Copies the POINTER array into the POINTER array2. This does
	// NOT copy the underlying array. We now have two pointers that
	// point to the same block of dynamic memory.
	double* array2 = array;
	
	// Free the block of dynamic memory
	free(array);

	// This would then attempt to free that same block of dynamic
	// memory AGAIN:
	free(array2); // Undefined behavior!

	// It's your responsibility to know when two pointers point to
	// the same dynamic memory! If they do, only call free() on one
	// of them.
}
