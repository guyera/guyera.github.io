#include <stdio.h>

// Notice: the size of the first dimension may be omitted in the
// array parameter, but the sizes of all other dimensions MUST be
// specified directly in the parameter declaration. The function still
// needs to know the size of the first dimension in order to terminate
// its outer loop properly, so we pass it as a separate argument.
void print_table(int array[][2], size_t rows) {
	for (int i = 0; i < rows; ++i) {
		for (int j = 0; j < 2; ++j) {
			printf("%d\t", array[i][j]);
		}
		printf("\n");
	}
}

// It would NOT be correct to write the array parameter using pointer
// syntax, such as int* array, or int** array, or even int* array[].
// While these are all valid declarations in some context, they don't
// represent contiguous 2D arrays.

int main() {
	// Recall: We also have to put the size of the non-first
	// dimensions here as well.
	int values[][2] = {
		{1, 7},
		{-4, 2},
		{9, 5}
	};

	print_table(values, 3);
}
