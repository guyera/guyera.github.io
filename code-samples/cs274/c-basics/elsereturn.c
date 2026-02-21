#include <stdio.h>

// float foo(int x); // Commented out the prototype; it's redundant.

// This definition itself serves as a valid form of declaration
float foo(int x) {
	if (x == 1) {
		return 1.0;
	}
	else {
		return 2.0;
	}
}

int main(void) {
	foo(5);
}
