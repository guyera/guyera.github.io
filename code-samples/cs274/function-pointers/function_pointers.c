#include <stdio.h>

double foo(int a, const char* some_string, float f) {
	// Divide the (first) integer parameter by the (third)
	// float parameter. Print the (second) string parameter,
	// followed by a colon, followed by the computed
	// quotient.
	float quotient = a / f;
	printf("%s: %f\n", some_string, quotient);

	// Coerce the quotient to a double and return it (for
	// some reason...)
	return quotient;
}

int main(void) {
	double (*my_pointer)(int, const char*, float) = foo;

	// my_pointer points to the function foo.
	
	// Print out the memory address of foo, stored in the
	// pointer
	printf("%p\n", my_pointer);

	// Print out the memory address of foo directly
	printf("%p\n", foo);

	// Call the function that my_pointer points to, passing
	// 1, "1/2", and 2.0f as the arguments, and storing the
	// return value in quotient.
	float quotient = (*my_pointer)(1, "1/2", 2.0f);

	// Print the quotient as well (though it should've
	// already been printed by the foo function, which we
	// just called through my_pointer)
	printf("%.2lf\n", quotient);

	int arr[10];
}
