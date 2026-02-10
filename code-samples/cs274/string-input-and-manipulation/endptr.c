#include <stdlib.h>
#include <stdio.h>

int main() {
	char* endptr = NULL;
	
	// Note: Passing the address of a pointer storing NULL is
	// NOT the same thing as simply passing NULL for the
	// second argument.
	double val = strtod("3.14 Hello, World!", &endptr);

	// The above call is perfectly valid. It extracts the
	// 3.14 from the beginning of the string. It returns that
	// value (now stored in val), but just before that, it
	// updates endptr to store the address of the space
	// character (' ') immediately after the "3.14" in the
	// string (just before the H in Hello)
	
	printf("%lf\n", val); // Prints 3.14

	// Prints the memory address of the ' ' between "3.14" and
	// "Hello" in the string literal (which is in the readonly
	// section of the data segment, since that's where literals
	// are stored)
	printf("%p\n", endptr);

	// Prints the space character that endptr points to (with
	// apostrophes on either side to make it visually clear)
	printf("'%c'\n", *endptr);
}
