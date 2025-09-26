#include <stdio.h>

int main() {
	// Prints 3.140000 (passed as a float)
	printf("%f\n", 3.14f);

	// Prints 3.14 (passed as a float) to just two decimal places
	printf("%.2f\n", 3.14f);
	
	// Prints 3.140000 (passed as a double)
	// (doubles have more precision than floats, but it still only
	// prints six decimal places on the ENGR servers. This is just
	// the default printing behavior for both floats and doubles.)
	printf("%lf\n", 3.14);
	
	// Prints -100 (passed as an int)
	printf("%d\n", -100);
	
	// Prints 728 (passed as a long)
	printf("%ld\n", 728l);
}
