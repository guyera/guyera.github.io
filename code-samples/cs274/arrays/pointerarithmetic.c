#include <stdio.h>

int main(void) {
	int my_array[] = {27, 7, -9};

	int* ptr = my_array;

	printf("%p\n", ptr);
	printf("%p\n", ptr + 1);
	printf("%p\n", ptr + 2);

	// These three lines of code are equivalent. They all print 7
	printf("%d\n", my_array[1]);
	printf("%d\n", ptr[1]);
	printf("%d\n", *(ptr + 1));
}
