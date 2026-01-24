#include <stdio.h>

int main() {
	// A table / matrix with 3 "rows" and 2 "columns".
	// Notice: the size of the second dimension ("columns"), 2, is
	// REQUIRED on the lefthand side of the assignment operator.
	// Zero-initialization applies here as well; the 2nd value of
	// the 3rd "row" is initialized to 0 since it was left out
	// of the initializer. 
	int matrix[][2] = {
		{3, 7},
		{4, 9},
		{-1}
	};

	// Print the 1st value of the 3rd row (prints -1)
	printf("%d\n", matrix[2][0]);

	// Print the 2nd value of the 3rd row (prints 0)
	printf("%d\n", matrix[2][1]);
}
