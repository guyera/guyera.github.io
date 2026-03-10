#include <stdio.h>

// should_swap_fn_ptr is an alias for a data type. That data type
// is a pointer to a function that accepts two integers as
// arguments and returns a boolean.
typedef _Bool (*should_swap_fn_ptr)(int, int);

// Now, whenever we want to declare a variable as a function
// pointer that points to a function taking two integers as
// arguments and returning a boolean, we can simply declare
// its type as should_swap_fn_ptr. See the updated third parameter
// of bubble_sort below.

// The third argument is a pointer to a function that examines
// two elements and determines whether they're out-of-order.
// If so, it returns true. If not, it returns false. The
// bubble_sort function uses this other function to determine
// which elements need to be swapped and which don't.
void bubble_sort(
		int* arr,
		size_t size,
		should_swap_fn_ptr should_swap) {
	// Bubble sort works by examining every adjacent pair
	// of elements and, if the two elements are out of
	// order, swapping them. It then restarts the process
	// from scratch. After N-1 full iterations of the
	// process, the array is sorted.
	
	// So, let's do the whole process N-1 times:
	for (size_t i = 0; i < size - 1; ++i) {
		// Look at each of the adjacent pairs of
		// elements (elements 0&1, then elements 1&2,
		// then elements 2&3, and so on, up through
		// elements N-1&N)
		for (size_t j = 0; j < size - 1; ++j) {
			// Determine if element j should be
			// swapped with its neighbor, element
			// j+1. We delegate this responsibility
			// to the function that should_swap
			// points to.
			if ((*should_swap)(arr[j], arr[j+1])) {
				// They should be swapped.
				// Swap them.
				int temp = arr[j];
				arr[j] = arr[j+1];
				arr[j+1] = temp;
			}
		}
	}
}

// This function determines whether two elements should be
// swapped in the case of an ascending sort order
_Bool should_swap_ascending(int a, int b) {
	// In ascending order, we want a < b (given element
	// smaller than the element after it). So if a > b,
	// they need to be swapped.
	if (a > b) {
		return 1;
	} else {
		return 0;
	}
}

// This function determines whether two elements should be
// swapped in the case of descending sort order
_Bool should_swap_descending(int a, int b) {
	// Just the opposite of should_swap_ascending
	if (a < b) {
		return 1;
	} else {
		return 0;
	}
}

int main(void) {
	int numbers[5] = {1, 5, -1, -2, 17};

	// Sort numbers in ascending order
	bubble_sort(numbers, 5, should_swap_ascending);

	// Print the array to prove it worked
	for (size_t i = 0; i < 5; ++i) {
		printf("%d\t", numbers[i]);
	}
	printf("\n");

	// Re-sort in descending order
	bubble_sort(numbers, 5, should_swap_descending);

	// Print the array to prove it worked
	for (size_t i = 0; i < 5; ++i) {
		printf("%d\t", numbers[i]);
	}
	printf("\n");
}
