#include <string.h>
#include <stdlib.h>
#include <stdio.h>

// It's usually best to put structure type definitions in
// header files, but this is just a short demonstration
struct weird_structure {
	int* ptr;
};

int main(void) {
	struct weird_structure x;
	x.ptr = malloc(sizeof(int) * 10);
	if (!x.ptr) {
		printf("Error on malloc()\n");
		exit(1);
	}

	// x.ptr points to a buffer (e.g., array) the size of 
	// ten integers. That buffer is on the heap.
	
	struct weird_structure y = x;
	
	// y is a shallow copy of x. In other words,
	// y.ptr is a copy of x.ptr (i.e., y.ptr == x.ptr).
	// Hence, they store the exact same addresses. Changing
	// the elements of the array that y.ptr points to also
	// changes the elements of the array that x.ptr points
	// to.
	for (size_t i = 0; i < 10; ++i) {
		y.ptr[0] = 718;
	}

	printf("%d\n", x.ptr[0]); // Prints 718

	// Suppose we want a deep copy of x. We can do that
	// manually.
	struct weird_structure z;

	// We want z.ptr to point to its own array, but we
	// want that array's values to be copies of the values
	// in the array that x.ptr points to (i.e., a deep
	// copy).
	z.ptr = malloc(sizeof(int) * 10);
	if (!z.ptr) {
		printf("Error on malloc()\n");
		exit(1);
	}

	// To copy the elements of the array, we can either
	// use a for loop or memcpy. Let's go with memcpy.
	memcpy(z.ptr, x.ptr, sizeof(int) * 10);

	printf("%d\n", z.ptr[0]); // Prints 718
	
	// z is a DEEP COPY of x in that its pointer fields
	// point to their own, separate memory, but the values
	// in that memory are copies of the values in the
	// memory that x's pointer fields point to.
	// We can therefore change the values in the array
	// that z.ptr points to without changing the values in
	// the array that x.ptr and y.ptr point to.
	z.ptr[0] = 12;

	printf("%d\n", z.ptr[0]); // Prints 12
	printf("%d\n", x.ptr[0]); // Prints 178

	// Free the array that x.ptr points to (which is also
	// the array that y.ptr points to)
	free(x.ptr);
	
	// DO NOT call free(y.ptr) as well. That'd be a
	// double-free.
	
	// Free the completely separate array that z.ptr points
	// to
	free(z.ptr);
}
