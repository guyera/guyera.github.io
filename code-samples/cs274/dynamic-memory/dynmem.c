#include <stdio.h>
#include <stdlib.h>

int main() {
	// Allocate a block of dynamic memory that's just big enough to
	// store a single float. Store the base address of that block
	// of bytes in an float* variable, ptr.
	float* ptr = (float*) malloc(sizeof(float));

	// ptr now stores the memory address of a block of bytes on the
	// heap that's just big enough to contain a single float. We can
	// now dereference ptr to access those bytes and write a float
	// value into them
	*ptr = 3.14;

	// The memory is now allocated AND initialized. Now we can
	// proceed to read the value / use it
	printf("%f\n", *ptr); // Prints 3.1400
}
