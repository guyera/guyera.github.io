#include <stdio.h>

int main(void) {
	// Notice: no size in the square brackets. Inferred to be 5.
	int numbers[] = {1, 4, 7, -9, 2};

	// Prints 7
	printf("%d\n", numbers[2]);
}
