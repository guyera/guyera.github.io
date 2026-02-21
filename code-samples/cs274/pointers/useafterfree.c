#include <stdio.h>

// Notice the return type of int* instead of int
int* add(int x, int y) {
	int sum = x + y;
	return &sum; // Notice we return &sum instead of sum
}

int main(void) {
	int* p = add(47, 52);
	printf("47 + 52 = %d\n", *p);
}
