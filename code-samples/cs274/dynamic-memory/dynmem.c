#include <stdio.h>
#include <stdlib.h>

int main(void) {
	// Allocate a block of dynamic memory that's just big enough to
	// store a single float. Store the base address of that block
	// of bytes in an float* variable, ptr.
	float* ptr = malloc(sizeof(float));

	// Check to see if malloc() failed to find a sufficiently large
	// block of unallocated memory on the heap
	if (!ptr) { // i.e., if (ptr == NULL)
		// If your program is truly capable of handling this error
		// somehow, (e.g., returning NULL or some sort of error code
		// back to the call site), now is when you'd do it.

		// Otherwise, log the error and force-terminate the entire
		// program, lest we encounter undefined behavior when we
		// attempt to dereference ptr later.
		printf("Error! Failed to allocate dynamic memory!\n");
		
		// Provided by stdlib.h, exits the whole program with the
		// provided exit code (essentially returns out of the main
		// function, even if it's not called from within the main
		// function). Use a nonzero exit code to indicate an error.
		exit(1);
	}

	// If the program is still running, then it must have successfully
	// allocated the dynamic memory.

	// ptr now stores the memory address of a block of bytes on the
	// heap that's just big enough to contain a single float. We can
	// now dereference ptr to access those bytes and write a float
	// value into them
	*ptr = 3.14;

	// The memory is now allocated AND initialized. Now we can
	// proceed to read the value / use it
	printf("%f\n", *ptr); // Prints 3.1400
}
