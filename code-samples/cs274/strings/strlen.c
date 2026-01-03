#include <stdio.h>
#include <string.h> // Necessary for strlen()!

int main() {
	size_t length_of_hello_world = strlen("Hello, World!");
	printf("%ld\n", length_of_hello_world);
	// Notice: %ld for size_t since it supports very large numbers
	// (similar to unsigned long long int on many platforms)

	// Of course, strlen can also operate on string variables
	const char* str = "The epic highs and lows of "
		"high school football";
	size_t length_of_str = strlen(str);
	printf("%ld\n", length_of_str);
	
}
