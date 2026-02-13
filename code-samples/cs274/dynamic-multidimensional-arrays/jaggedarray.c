#include <stdlib.h>
#include <string.h>
#include <stdio.h>

// Prints jagged array of floats as a table. Notice:
// columns is a pointer to an ARRAY of size_t values, rather
// than a SINGLE size_t value.
void print_table(float** table, size_t rows, size_t* columns) {
	for (size_t i = 0; i < rows; ++i) {
		for (size_t j = 0; j < columns[i]; ++j) {
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

int main() {
	// Ask the user for an integer m and an integer n
	size_t m = prompt_for_integer("Enter an integer m: ");

	// Each of the rows will have a different size. Prompt the
	// user for the size of EACH row (i.e., # of columns in
	// each row), storing those sizes in an array of m size_t
	// values
	size_t* ns = malloc(sizeof(size_t) * m);
	for (size_t i = 0; i < m; ++i) {
		char prompt[256];
		sprintf(
			prompt,
			"Enter the number of columns in row %ld: ",
			i + 1
		);
		ns[i] = prompt_for_integer(prompt);
	}

	// Create an array of m float pointers
	float** table = malloc(sizeof(float*) * m);

	// For each pointer in the array...
	for (size_t i = 0; i < m; ++i) {
		// Initialize the ith pointer in the array of float
		// pointers to point to an array of ns[i] floats
		table[i] = malloc(sizeof(float) * ns[i]);
	}

	// For each pointer in the array...
	for (size_t i = 0; i < m; ++i) {
		// For each value in the array that table[i] points
		// to...
		for (size_t j = 0; j < ns[i]; ++j) {
			// Initialize the value (the jth value in the array
			// that table[i] points to)
			table[i][j] = (i+1) * (j+1);

			// Note: This initialization logic creates an MxN
			// multiplication table.
		}
	}

	// Print the table:
	print_table(table, m, ns);

	// Free the "inner" arrays of floats (i.e., the arrays that
	// each table[i] pointer points to)
	for (size_t i = 0; i < m; ++i) {
		free(table[i]);
	}

	// Free the "outer" array of pointers.
	free(table);

	// Free the array of row sizes (ns)
	free(ns);
}
