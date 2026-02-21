#include <stdio.h>

int main(void) {
	int values[][2] = {
		{1, 7},
		{-4, 2},
		{9, 5}
	};

	// I put it to you that the elements are stored in a single
	// contiguous chunk of memory, organized in the order:
	// 1 7 -4 2 9 5
	
	// To prove it, I'll first retrieve the address of the element
	// in the first row and first column (1)
	int* base_address = &(values[0][0]);

	// As you know, putting 0 in the subscript operator on a pointer
	// is the same thing as dereferencing that pointer, so this
	// prints 1
	printf("%d\n", base_address[0]);
	// Equivalently:
	// printf("%d\n", *base_address);

	// Now, if we shift over 1 "space" from that address (via the
	// subscript operator, []), treating this as if it were a
	// one-dimensional array in memory, I put it to you that that
	// will retrieve the value in the first row and second column
	// (7):
	printf("%d\n", base_address[1]); // Prints 7

	// The NEXT value, base_address[2], will be the value in the
	// SECOND row, FIRST column (-4):
	printf("%d\n", base_address[2]); // Prints -4

	// And so on...
}
