#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main() {
	const char* my_string = "3.7,4.2,1.5"; // The string to tokenize

	char* saveptr = NULL; // To keep track of where strtok_r left off

	// Create a writable copy of the string to tokenize (add 1 to the
	// string length to account for the null terminator)
	char* copy = malloc((strlen(my_string) + 1) * sizeof(char));
	strcpy(copy, my_string);

	// I'm going to store the three tokens in an array of three char*
	// values (yes, an array of three character POINTERS, each of
	// which will point to one of the three tokens in the string
	// being tokenized):
	char* tokens[3];

	// Now we call strtok_r for the first time, storing the first
	// token in tokens[0]
	tokens[0] = strtok_r(copy, ",", &saveptr);

	// Call strtok_r for the second time, storing the token in
	// tokens[1]. But this time, we pass NULL as the first argument.
	tokens[1] = strtok_r(NULL, ",", &saveptr);

	// And the third time:
	tokens[2] = strtok_r(NULL, ",", &saveptr);

	printf("%s\n", tokens[0]);
	printf("%s\n", tokens[1]);
	printf("%s\n", tokens[2]);

	printf("%p\n", saveptr);
	printf("%p\n", copy + 11);

	free(copy);
}
