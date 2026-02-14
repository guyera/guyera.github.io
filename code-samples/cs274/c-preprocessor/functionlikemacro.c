#include <stdio.h>

// Defines macro PRINT_INTEGER with a parameter x. Expands to
// printf("%d\n", <x>), where <x> is the value of the argument
// given to it. This is kind of like a function (but not
// exactly).
#define PRINT_INTEGER(x) printf("%d\n", x)

int main() {
	// The preprocessor rewrites the below line as
	// printf("%d\n", 2);
	PRINT_INTEGER(2);
}
