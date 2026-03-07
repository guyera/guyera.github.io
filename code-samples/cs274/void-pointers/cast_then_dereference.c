#include <stdio.h>

int main(void) {
	int x = 10;
	
	// ptr is a void pointer and can store the address of
	// anything, including integers like x.
	void* ptr = &x;

	double y = 3.14;

	// But it can also store the addresses of doubles, and
	// so on.
	ptr = &y;

	// This would NOT be allowed
	// printf("%lf\n", *ptr);
	
	// But this IS allowed
	printf("%lf\n", *((double*) ptr));

	// Or, equivalently:
	double* casted_ptr = ptr;
	printf("%lf\n", *casted_ptr);
}
