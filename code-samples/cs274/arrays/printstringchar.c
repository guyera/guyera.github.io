#include <stdio.h>

int main(void) {
	const char* sentence = "Hello, World!";

	// Print the first character of the string (%c is the format
	// specifier for a single character)
	printf("%c\n", sentence[0]);

	// Print the fifth character
	printf("%c\n", sentence[4]);

	// Print every character until the null terminator (equivalent
	// to printf("%s", sentence))
	int i = 0;
	while (sentence[i] != '\0') {
		printf("%c", sentence[i]);
		++i;
	}
	printf("\n");
}
