#include <stdio.h>

void change_to_100(int x) {
	x = 100;
}

int main(void) {
	int x = 5;
	change_to_100(x);
	printf("The value of x is: %d\n", x);
}
