#include <stdio.h>

void foo1(int arr[]) {
	printf("%ld\n", sizeof(arr)); // Prints 8 on the ENGR servers
}

void foo2(int arr[20]) {
	// Prints 8 on the ENGR servers, even though the size is
	// explicitly specified as 20 in the parameter (remember:
	// this size is largely ignored by the compiler; the parameter
	// is really just treated as a pointer)
	printf("%ld\n", sizeof(arr));
}

int main() {
	// Note: %ld is used as format specifier for size_t values
	// (similar to long int values), which is the type of value
	// returned by sizeof
	printf("%ld\n", sizeof(int)); // Prints 4 on the ENGR servers
	printf("%ld\n", sizeof(1000)); // Prints 4 on the ENGR servers

	int values[20] = {0};
	// Prints 80 on the ENGR servers (20 integers, each with 4 bytes
	// of storage)
	printf("%ld\n", sizeof(values));

	int* array = values;
	printf("%ld\n", sizeof(array)); // Prints 8 on the ENGR servers

	const char* str = "Hello";
	printf("%ld\n", sizeof(str)); // Prints 8 on the ENGR servers

	foo1(values); // Prints 8 on the ENGR servers
	foo2(values); // Prints 8 on the ENGR servers
}
