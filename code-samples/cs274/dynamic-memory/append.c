#include <stdlib.h>
#include <stdio.h>

// Appends a new value to the end of the given dynamic array,
// expanding the array in the process
void append(int* array, size_t size, int new_value) {
	// Realloc array to contain (size + 1) elements. Note:
	// if array is NULL and size is 0 (i.e., if the array is
	// currently "empty" / nonexistent), then this is equivalent
	// to malloc((1) * sizeof(int)).
	array = realloc(array, (size + 1) * sizeof(int));
	
	// Increment size
	++size;

	// Append new_value to the end of it, in the extra unused
	// slot
	array[size - 1] = new_value;
}

int main(void) {
	// Create an int array, initially with a single element in
	// it (7) (Arguably, it's not even really an array; just
	// a pointer to a single integer on the heap. But you can
	// treat it like an array with 1 element).
	int* my_array = malloc(sizeof(int));
	my_array[0] = 7;
	
	size_t s = 1; // Keep track of my_array's size (number of
				  // elements)

	// Append the value -5 to the array
	append(my_array, s, -5);

	// Issue: the append function updates 'array' and 'size'
	// (its parameters), but it does NOT update 'my_array' nor
	// 's' (the arguments). Parameters are copies of arguments.
	// So 'my_array' still points to the old array, and 's' is
	// still 1. The old array that 'my_array' points to may
	// no longer exist (realloc may have freed it), making it
	// a dangling pointer.
	
	// If realloc moved the array (and so my_array is dangling),
	// then these will both invoke use-after-free errors.
	// Otherwise, they'll work fine. But there's no guarantee
	// as to which of those things will happen. This is
	// undefined behavior.
	printf("%d\n", my_array[0]);
	printf("%d\n", my_array[1]);

	// This may also be an issue. If realloc moved the array
	// (and so my_array is dangling), this will invoke a
	// double-free error (and the new array will be leaked).
	// Otherwise, it'll work fine. Again, this is undefined
	// behavior.
	free(my_array);
}
