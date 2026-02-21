#include <stdio.h>

int main(void) {
	int x;

	int* p = &x;

	// p is a pointer. It stores the memory address of x
	// (i.e., it "points to" x).
	
	int** p2 = &p;

	// p2 is a "double-pointer". It stores the memory address
	// of p (i.e., it "points to" p).
	
	// *p2 is the thing that p2 points to. In other words,
	// *p2 is simply p.

	int y;
	*p2 = &y; // Equivalently: p = &y;

	// p now stores the address of y (i.e., it "points to" y).
	
	*p = 8; // Equivalently: y = 8;

	// y is now 8.
	printf("%d\n", y); // Prints 8

	// **p2 is equivalent to *(*p2). In either case, this is
	// the thing that *p2 points to. *p2 is simply p. In
	// other words, **p2 (or *(*p2)) is the thing that p points
	// to. That's y.
	
	**p2 = 17; // Equivalently: y = 17

	// y is now 17.
	printf("%d\n", y); // Prints 17
}
