#include <stdlib.h>
#include <string.h>
#include <stdio.h>

// Prints noncontiguous 2D array of floats as a table
void print_table(float** table, size_t rows, size_t columns) {
	for (size_t i = 0; i < rows; ++i) {
		for (size_t j = 0; j < columns; ++j) {
			printf("%.2f\t", table[i][j]);
		}
		printf("\n");
	}
}

// Function that simply asks the user for an integer, receiving
// it via getline, and converting it to a long via strtol (can
// be extended with some basic error handling if desired)
long prompt_for_integer(const char* prompt) {
	printf("%s", prompt);
	char* line = NULL;
	size_t n = 0;
	ssize_t len = getline(&line, &n, stdin);
	if (len == -1) {
		printf("Error on getline()\n");
	}
	if (len >= 1 && line[len - 1] == '\n') {
		line[len - 1] = '\0';
	}
	if (len >= 2 && line[len - 2] == '\r') {
		line[len - 2] = '\0';
	}
	long res = strtol(line, NULL, 10);
	free(line);
	return res;
}

int main(void) {
	// Ask the user for an integer m and an integer n
	size_t m = prompt_for_integer("Enter an integer m: ");
	size_t n = prompt_for_integer("Enter an integer n: ");

	// Create an array of m float pointers
	float** table = malloc(sizeof(float*) * m);

	// For each pointer in the array...
	for (size_t i = 0; i < m; ++i) {
		// Initialize the ith pointer in the array of float
		// pointers to point to an array of n floats
		table[i] = malloc(sizeof(float) * n);
	}

	// For each pointer in the array...
	for (size_t i = 0; i < m; ++i) {
		// For each value in the array that table[i] points
		// to...
		for (size_t j = 0; j < n; ++j) {
			// Initialize the value (the jth value in the array
			// that table[i] points to)
			table[i][j] = (i+1) * (j+1);

			// Note: This initialization logic creates an MxN
			// multiplication table.
		}
	}

	// Print the table:
	print_table(table, m, n);

	// Free the "inner" arrays of floats (i.e., the arrays that
	// each table[i] pointer points to)
	for (size_t i = 0; i < m; ++i) {
		free(table[i]);
	}

	// Free the "outer" array of pointers.
	free(table);
}
