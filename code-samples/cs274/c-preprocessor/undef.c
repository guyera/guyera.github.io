#include <stdio.h>

// Note the \ characters at the end of each line, just before
// the line break
#define DEF_SQUARE(t) t square_##t(t x) {\
	return x * x;\
}

// Defines the square_int function
DEF_SQUARE(int)

// Defines the square_float function
DEF_SQUARE(float)

#undef DEF_SQUARE

// Defines the square_double function
DEF_SQUARE(double)

// ... And so on

int main(void) {
	printf("2^2 = %d\n", square_int(2));
	printf("3.14^2 = %f\n", square_float(3.14f));
}
