#include <stdio.h>

int main() {
	// sentence1's characters are NOT modifiable!
	const char* sentence1 = "Hello, World!";

	// However, sentence2's characters ARE modifiable!
	//char sentence2[] = "Hello, World!";

	// The number of characters in the sentence2 array is AT LEAST
	// 14---large enough to store the characters of "Hello, World!"
	// followed by a null terminator. It may be larger than that,
	// but don't count on it. Attempting to access an element of the
	// array at an index greater than or equal to 14 may invoke
	// undefined behavior.

	// You may optionally put a size in between the square brackets
	// above, but it MUST be at least 14. e.g.:
	// char sentence2[14] = "Hello, World!";
	// 
	// If you want, you can make sentence2 bigger than necessary.
	// This will give it extra "buffer" characters, making it easy
	// to expand its contents to represent longer strings later on.
	// char sentence2[100] = "Hello, World!";
	
	// sentence2, being a regular automatic stack-allocated array,
	// is modifiable:
	sentence2[0] = 'J';
	sentence2[5] = ' ';
	printf("%s\n", sentence2); // Prints "Jello  World!"
}
