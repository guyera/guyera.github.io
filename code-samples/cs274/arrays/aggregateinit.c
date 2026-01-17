#include <stdio.h>

int main() {
	// Note: \0 is an escape sequence for a null terminator.
	// Notice: no size in the square brackets. Inferred to be 8.
	char hello[] = {'H', 'e', 'l', 'l', 'o', '\0', '\0', 'z'};

	// Print the above C string, followed by \n
	printf("%s\n", hello);

	int test[3] = {1, 2, 3, 4};
}
