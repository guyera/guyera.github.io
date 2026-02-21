#include <stdio.h>

int main(void) {
	// Allocate an array of 1000 null terminators
	// (an "empty string")
	char my_string[1000] = {0};

	// Replace the first element with 'H'. The array is now an 'H'
	// followed by 999 null terminators. That is, it represents the
	// string "H".
	my_string[0] = 'H';

	// This prints an H to the terminal, followed by \n
	printf("%s\n", my_string);

	// Add an 'e' after the 'H'
	my_string[1] = 'e';

	// This prints He to the terminal, followed by \n
	printf("%s\n", my_string);

	// And so on...
	
	// my_string can be extended to up to 999 characters of content
	// (the 1000th character must be reserved for a null terminator
	// since every C string must have at least one null terminator)
}
