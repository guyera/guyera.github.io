#include <stdio.h>
#include <string.h>

int main() {
	float cool_values[] = {3.14, 9.81, 2.71};
	float copy[3];
	
	// Copy using memcpy
	memcpy(copy, cool_values, 3 * sizeof(float));

	printf("%f\n", copy[2]); // Prints 2.71
}
