#include <stdio.h>

float foo(int x);

float foo(int x) {
	if (x == 1) {
		return 1.0;
	}
	if (x != 1) {
		return 2.0;
	}
}

int main() {
	foo(5);
}
