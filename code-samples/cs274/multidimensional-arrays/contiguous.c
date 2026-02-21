#include <stdio.h>

int main(void) {
	// Create a table (2D array) of numbers. There are 2 "rows" and
	// 4 "columns".
	float my_table[2][4];

	// For each row...
	for (int i = 0; i < 2; ++i) {
		// Initialize all the values in the current row.
		// To do that, we need another for loop. Hence,
		// nested for loops.

		// The number of elements in a single row of the table
		// is simply the number of columns in the table. So,
		// for each column...
		for (int j = 0; j < 4; ++j) {
			// Notice that I used j instead of i for the
			// nested for loop. This prevents shadowing
			// the outer loop's counter.

			// Initialize the element in row i, column
			// j, to (i + 1) * (j + 1). We add 1 to each
			// index because, otherwise, the entire first
			// row and first column would be populated with
			// a bunch of zeros. We want to start at 1*1, 
			// not 0*0.
			my_table[i][j] = (i + 1) * (j + 1);
		}
	}

	// For each row...
	for (int i = 0; i < 2; ++i) {
		// Print the current row.
		
		// But to do that, we have to print all the values IN
		// the current row. We do that with a for loop (hence,
		// nested for loops).

		// The number of values in a given row is simply the
		// number of columns (4). So...
		// For each column...
		for (int j = 0; j < 4; ++j) {
			// The current row has row index i. Print
			// the value IN that row that has column index
			// j. In other words, print the element in the
			// table at row i, column j:
			printf("%f", my_table[i][j]);

			// Print a tab character between each value
			// within a row
			printf("\t");
		}

		// We've just finished printing all the values IN the
		// current row. Before moving on to the next row,
		// print a newline character sequence (so that each
		// row goes on its own line in the terminal)
		printf("\n");
	}
}
