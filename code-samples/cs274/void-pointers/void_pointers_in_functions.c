#include <stdio.h>

// Constants for various type codes
const int TYPE_CODE_INT = 0;
const int TYPE_CODE_FLOAT = 1;
const int TYPE_CODE_POINTER = 2;

// A function that can print one of various kinds of values
// to the terminal, determining the correct format specifier
void print_value(void* value_ptr, int type_code) {
	// Check type_code to determine what type of value
	// value_ptr points to
	if (type_code == TYPE_CODE_INT) {
		// It's an int. Print it as such.
		printf("%d\n", *((int*) value_ptr));
	} else if (type_code == TYPE_CODE_FLOAT) {
		// It's a float. Print it as such.
		printf("%f\n", *((float*) value_ptr));
	} else if (type_code == TYPE_CODE_POINTER) {
		// It's a pointer of some sort. Print it as
		// such. To do this, we might cast the parameter
		// to a void** (to encode the fact that it
		// points to some kind of pointer). We can then
		// dereference it to retrieve the pointer that
		// it points to, but treated as a void*.
		// (You can, indeed, pass void* values to
		// printf with %p specifiers).
		printf("%p\n", *((void**) value_ptr));
	} else {
		printf("Error: Bad type_code\n");
	}
}

int main(void) {
	int a = 1;
	float b = 2.0;
	float* p = &b;

	print_value(&a, TYPE_CODE_INT);
	print_value(&b, TYPE_CODE_FLOAT);
	print_value(&p, TYPE_CODE_POINTER);
}
