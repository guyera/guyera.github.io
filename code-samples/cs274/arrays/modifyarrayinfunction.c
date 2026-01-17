#include <stdio.h>

void change_values(int values[]) {
	// Change the 2nd element to 7 (requires the array to have
	// at least 2 elements in it, else a buffer overflow will occur)
	values[1] = 7;
}

int main() {
	int my_numbers[3] = {1, 12, -4};

	change_values(my_numbers);
	printf("%d\n", my_numbers[1]); // Prints 7
}
