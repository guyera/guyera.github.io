#include <stdio.h>

int main(void) {
	float x = 3.14;
	float* p = &x;

	// These two lines print the same thing:
	printf("%f\n", x);
	printf("%f\n", *p);
}
