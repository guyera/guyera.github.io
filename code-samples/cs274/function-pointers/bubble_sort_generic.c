#include <string.h> // memcpy
#include <stdio.h>

// bubble_sort will need to be able to swap arbitrary objects.
// Swapping arbitrary objects that void pointers point to
// is a bit complicated, so let's create a dedicated function
// for it. It requires the two objects to swap (provided
// by void pointers) as well as their size, in bytes (requires
// that the two objects be of the same type and therefore the
// same size)
void swap(void* obj1, void* obj2, size_t obj_size) {
	// First, create an array of bytes (i.e., characters)
	// in which to store a temporary copy of obj1. We could
	// do this on the heap, but I'll use a stack-allocated
	// VLA to keep things simple and performant (not
	// necessarily supported in all versions of C, nor all C
	// compilers for a given version)
	char temp_byte_array[obj_size];

	// Copy the bytes from the object that obj1 points to
	// into the temporary byte array. Use memcpy for this
	memcpy(temp_byte_array, obj1, obj_size);

	// Copy the bytes from the object that obj2 points to
	// into the object that obj1 points to
	memcpy(obj1, obj2, obj_size);

	// Copy the bytes from the temporary byte array (old
	// obj1 object's value) into the object that obj2 points
	// to
	memcpy(obj2, temp_byte_array, obj_size);
}

// arr is now void* to work with an array of ANY data type.
// Additionally, we receive size_t elem_size for some necessary
// pointer arithmetic, allowing us to compute the addresses
// of elements at arbitrary indices in the array (the compiler
// can't do it since it doesn't know the size of each element).
// I also renamed "size" to "n". The function that should_swap
// points to now receives void* arguments instead of int
// arguments.
void bubble_sort(
		void* arr,
		size_t n,
		size_t elem_size,
		_Bool (*should_swap)(void*, void*)) {
	// Do the process n-1 times, as before
	for (size_t i = 0; i < n - 1; ++i) {
		// Look at each of the adjacent pairs of
		// elements (elements 0&1, then elements 1&2,
		// then elements 2&3, and so on, up through
		// elements N-1&N)
		for (size_t j = 0; j < n - 1; ++j) {
			// Determine if element j should be
			// swapped with its neighbor, element
			// j+1. We delegate this responsibility
			// to the function that should_swap
			// points to.

			// But first, we have to determine the
			// addresses of arr[j] and arr[j+1],
			// so that we can pass them to the
			// function that should_swap points to.

			// But remember: &arr[j] is invalid
			// since void pointers can't be
			// dereferenced, and arr + j is
			// invalid since the compiler can't
			// do the pointer arithmetic since it
			// doesn't know the size of each
			// element.

			// However, if we cast arr to a char*,
			// then the compiler will treat it
			// as a pointer to an array of bytes
			// (characters), i.e., each element's
			// size is 1 (that's not really true,
			// but we can exploit this to get the
			// pointer arithmetic to work)
			char* casted_arr = (char*) arr;

			//  Now, casted_arr + Z, for some int
			//  value Z, is literally the memory
			//  address computed by shifting over
			//  Z bytes (i.e., Z characters) from
			//  the base address of the array.
			//  To get the address of the jth
			//  element, we need to shift over
			//  j * elem_size bytes from the base
			//  address (i.e., j FULL elements of
			//  the actual array --- not just j
			//  bytes / j characters)
			char* elem1 = casted_arr + j * elem_size;

			// Similarly, get address of j+1st
			// element
			char* elem2 = casted_arr + (j+1) * elem_size;

			// Pass elem1 and elem2 to the function
			// that should_swap points to, coercing
			// them back to void pointers in the
			// process, to determine whether they
			// should be swapped
			if ((*should_swap)(elem1, elem2)) {
				// They should be swapped.
				// Swap them using our swap
				// function above.
				swap(elem1, elem2, elem_size);
			}
		}
	}
}

// This function determines whether two INTEGERS should be
// swapped in the case of an ascending sort order (requires
// the two arguments to ACTUALLY point to integers, or else
// undefined behavior ensues)
_Bool should_swap_ascending_int(void* a, void* b) {
	// Cast a and b to integer pointers, then dereference
	// them (remember: this is legal, so long as a and b
	// ACTUALLY point to integers)
	int a_val = *((int*) a);
	int b_val = *((int*) b);

	// In ascending order, we want a_val < b_val (given
	// element smaller than the element after it). So if
	// a_val > b_val, they need to be swapped.
	if (a_val > b_val) {
		return 1;
	} else {
		return 0;
	}
}

// This function determines whether two INTEGERS should be
// swapped in the case of descending sort order
_Bool should_swap_descending_int(void* a, void* b) {
	// Just the opposite of should_swap_ascending
	
	int a_val = *((int*) a);
	int b_val = *((int*) b);

	if (a_val < b_val) {
		return 1;
	} else {
		return 0;
	}
}

// This function determines whether two FLOATS should be
// swapped in the case of ascending sort order. Requires that
// a and b ACTUALLY point to floats, else undefined behavior
// ensues.
_Bool should_swap_ascending_float(void* a, void* b) {
	// Cast a and b to float pointers, then dereference
	// them (remember: this is legal, so long as a and b
	// ACTUALLY point to floats)
	float a_val = *((float*) a);
	float b_val = *((float*) b);

	// In ascending order, we want a_val < b_val (given
	// element smaller than the element after it). So if
	// a_val > b_val, they need to be swapped.
	if (a_val > b_val) {
		return 1;
	} else {
		return 0;
	}
}

// If you get tired of defining should_swap_ascending_T
// and should_swap_descending_T functions for each
// numeric data type T, see the preprocessing lecture notes for
// tricks that exploit the preprocessor to automatically
// generate entire (similar) function definitions for similar
// types (simulation of parametric polymorphism)

int main(void) {
	int numbers[5] = {1, 5, -1, -2, 17};

	// Sort numbers in ascending order
	bubble_sort(
		numbers,
		5,
		sizeof(int),
		should_swap_ascending_int
	);

	// Print the array to prove it worked
	for (size_t i = 0; i < 5; ++i) {
		printf("%d\t", numbers[i]);
	}
	printf("\n");

	// Re-sort in descending order
	bubble_sort(
		numbers,
		5,
		sizeof(int),
		should_swap_descending_int
	);

	// Print the array
	for (size_t i = 0; i < 5; ++i) {
		printf("%d\t", numbers[i]);
	}
	printf("\n");

	// Finally, sort an array of floats in ascending order
	float my_floats[5] = {3.14, 9.81, -1.45, 9.27, -100.3};
	bubble_sort(
		my_floats,
		5,
		sizeof(float),
		should_swap_ascending_float
	);

	// Print the array
	for (size_t i = 0; i < 5; ++i) {
		printf("%.2f\t", my_floats[i]);
	}
	printf("\n");
}
