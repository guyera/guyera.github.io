#include <stdio.h>

int main() {
	int my_array[] = {27, 7, -9};
	
	printf("%p\n", my_array);

	// Print the memory addresses of each of the three elements.
	// Retreive these addresses using the address-of operator (&)
	printf("%p\n", &(my_array[0]));
	printf("%p\n", &(my_array[1]));
	printf("%p\n", &(my_array[2]));
}
