#include <stdio.h>

int main() {
	// x has not been declared yet, so it can't be referenced.
	// This is a syntax error.
	printf("%d\n", x);

	int x;
	x = 5;
}
