#include <stdio.h>

int main() {
	// Declare a "double pointer", capable of storing the memory
	// address of a variable of type double
	double* p1; // Notice the asterisk!

	// Declare an "int pointer", capable of storing the memory
	// address of a variable of type int
	int* p2;

	// Declare an int variable, capable of storing integers
	int x; // Notice: no asterisk here since it's not a pointer!

	// Store the address of x inside p2, which works because
	// x is an int and p2 is an int pointer
	p2 = &x;

	// Of course, you can also declare and initialize a pointer
	// in one statement:
	int* p3 = &x;

	// These two lines print the same thing
	printf("%p\n", p2);
	printf("%p\n", &x);

	// But we can change p2 to point elsewhere if we want!
	int y; // Create a new integer y, in a separate place in memory
	p2 = &y; // Change p2 to store the address of y instead of x

	// These two lines print the same thing, which is different
	// from the address printed previously
	printf("%p\n", p2);
	printf("%p\n", &y);

	// Importantly, x has not moved. It's still in the same location
	// in memory. p2 is just pointing elsewhere now.
	printf("%p\n", &x); // Prints the same address as earlier
}
