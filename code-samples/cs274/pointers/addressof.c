#include <stdio.h>

int main() {
	int x = 10;
	int y = 20;
	printf("The memory address of x is: %p\n", &x);
	printf("The memory address of y is: %p\n", &y);

	y = 10; // Now they're both 10

	// But their memory addresses are still what they were before
	printf("The memory address of x is: %p\n", &x);
	printf("The memory address of y is: %p\n", &y);
}
