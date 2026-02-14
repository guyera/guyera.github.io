#include <math.h>
#include <stdio.h>

int main() {
	printf("Enter a, b, and c, the coefficients of a quadratic formula: ");
	double a;
	double b;
	double c;
	scanf("%lf", &a);
	scanf("%lf", &b);
	scanf("%lf", &c);

#ifdef FIRST_ROOT
	// Compute the first root of the quadratic formula
	double root = (-b - sqrt(b*b - 4*a*c)) / (2*a);
#else
	// Compute the second root
	double root = (-b + sqrt(b*b - 4*a*c)) / (2*a);
#endif
	
	// One of the two above statements will be "deleted"
	// by the preprocessor. If FIRST_ROOT is defined, then
	// the second statement will be deleted, and root will
	// store the first root. Otherwise, the first statement
	// will be deleted, and root will store the second root.
	
	// Print whichever root was computed
	printf("Root: %lf\n", root);
}
