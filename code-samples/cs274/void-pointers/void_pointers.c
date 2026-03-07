#include <time.h>
#include <stdlib.h>
#include <stdio.h>

int main(void) {
	srand(time(NULL));
	int x = 10;
	
	// ptr is a void pointer and can store the address of
	// anything, including integers like x.
	void* ptr = &x;

	double y = 3.14;

	// But it can also store the addresses of doubles, and
	// so on.
	ptr = &y;
	
	// Both of these print the address of y
	printf("%p\n", ptr);
	printf("%p\n", &y);

	// Perhaps the compiler could theoretically analyze
	// the code and determine that, currently, ptr stores
	// the address of a double.
	
	// But what if we do this?
	if (rand() % 2 == 0) {
		ptr = &x;
	}

	// At this point, there's a 50% chance that ptr
	// points to an int, and a 50% chance that it points
	// to a double. The compiler can't predict which of
	// these two things will happen.
	
	// So, if the compiler doesn't know whether ptr
	// points to an integer or a double, how could it
	// generate the correct machine instructions to compute
	// this value?
	double quotient = *ptr / 2;

	// Answer: it can't. The machine instructions required
	// to divide a double by an int are very different from
	// those required to divide an int by an int.
}
