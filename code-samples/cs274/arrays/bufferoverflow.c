#include <stdio.h>

int main(void) {
	float values[] = {5.7, -1.2, 41.5};

	// values has 3 elements. That means the valid indices are
	// 0, 1, and 2.
	
	// Hence, this is a buffer over-read
	printf("%f\n", values[3]); // values doesn't have a 4th element

	// These are also buffer over-reads
	printf("%f\n", values[4]);
	printf("%f\n", values[100]);
	printf("%f\n", values[-1]);

	// This is a buffer overflow
	values[3] = -12.7;
}
