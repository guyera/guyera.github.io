#include <stdlib.h>

int main() {
	// Allocate dynamic array of 5 booleans
	_Bool* array = malloc(sizeof(_Bool) * 5);
	if (!array) {
		printf("Error on malloc()\n");
		exit(1);
	}
	_Bool* array2 = array; // Copy of address stored in array

	// Free the dynamic array
	free(array);

	// array and array2 are BOTH dangling pointers. They both point
	// to an array that has since been deleted.

	// Access the second element in the dynamic array (dereferences
	// the address of the second element, which no longer exists)
	array2[1] = 0; // Use-after-free. Undefined behavior!
}
