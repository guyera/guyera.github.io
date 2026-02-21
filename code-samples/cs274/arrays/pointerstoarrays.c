#include <stdio.h>

int main(void) {
	int my_array[] = {27, 7, -9};

	// Store the array's base address in an integer pointer
	// (the array's name dissolves to the base address, so this
	// syntax works just fine)
	int* ptr = my_array;
	// Or, equivalently:
	// int* ptr = &(my_array[0]);
	
	// ptr, storing the base address of the array, points to the
	// first element in the array. Hence, dereferencing ptr gives
	// us the first element, 27
	printf("%d\n", *ptr); // Prints 27

	// And, as stated, you can even use square brackets on ptr
	// as if it were my_array
	printf("%d\n", ptr[0]); // Prints 27
	printf("%d\n", ptr[1]); // Prints 7
	printf("%d\n", ptr[2]); // Prints -9
}
