#include <stdio.h>

// Prototype
void print_quadratic_equation(float a, float b, float c);

// Definition
void print_quadratic_equation(float a, float b, float c) {
	printf("%.1fx^2 + %.1fx + %.1f = 0\n", a, b, c);
}

int main(void) {
	print_quadratic_equation(2, 4, 7);
}
