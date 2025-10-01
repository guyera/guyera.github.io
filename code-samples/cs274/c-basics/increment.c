#include <stdio.h>

int main() {
	int my_variable = 0;
	
	// Used on their own, my_variable++ and ++my_variable do the
	// same thing
	my_variable++; // Increments my_variable to 1
	++my_variable; // Increments my_variable to 2

	// But when used as expressions, they're different
	
	// This increments my_variable and THEN prints its (new) value.
	// So this increments my_variable to 3 and then prints 3.
	printf("%d\n", ++my_variable);

	// This evaluates to my_variable's old value (3) and THEN
	// increments it. So it increments my_variable to 4, but it
	// prints 3.
	printf("%d\n", my_variable++);
}
