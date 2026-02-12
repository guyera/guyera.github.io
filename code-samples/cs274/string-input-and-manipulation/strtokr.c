#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main() {
	printf("Enter a comma-separated list of numbers: ");
	char* line = NULL;
	size_t n = 0;
	ssize_t len = getline(&line, &n, stdin);
	if (len == -1) {
		printf("Error on getline()\n");
		exit(1);
	}
	if (len >= 1 && line[len - 1] == '\n') {
		line[len - 1] = '\0';
	}
	if (len >= 2 && line[len - 2] == '\r') {
		line[len - 2] = '\0';
	}

	// We'll compute the sum of all the values the user entered
	// (e.g., if they entered 3.7,4.2,1.5 then we'll compute
	// 3.7 + 4.2 + 1.5 = 9.4)
	
	char* saveptr = NULL; // For third argument to strtok_r
	double sum = 0.0;
	char* current_token;
	
	// Call strtok_r, passing line as the first argument since
	// this is the first call. Second argument is "," since
	// it's a comma-separated list of numbers. Third argument
	// is &saveptr, so saveptr will keep track of where the
	// most recent call to strtok_r left off (so that the next
	// call can pick up from there).
	current_token = strtok_r(line, ",", &saveptr);
	
	// While the most recent call to strtok_r returned an
	// actual token (not NULL)
	while (current_token) {
		// Extract double value with strtod and add to sum
		double value = strtod(current_token, NULL);
		sum += value;

		// Call strtok_r again. This time, pass NULL as the
		// first argument. Signals that strtok_r should pick
		// up where it left off in a previous call (and that
		// location where it left off is stored in saveptr,
		// whose address we again pass as the third argument).
		current_token = strtok_r(NULL, ",", &saveptr);
	}

	// Once the final token has been extracted, the subsequent
	// call to strtok_r returns NULL, and the loop ends.
	// That has now happened. Print the computed sum.
	printf("The sum is %lf\n", sum);

	// Remember: every call to strtok_r actually MODIFIES the
	// string that it's currently tokenizing (i.e., the string
	// that was passed as the first argument to the FIRST call
	// to strtok_r, which started the tokenization process).
	// Specifically, it replaces token separators (commas, in
	// this case) with null terminators (and updates the char*
	// that saveptr points to) as it goes. To prove it, I'll
	// print the line string again. But now, the first comma
	// has been replaced with a null terminator, so this will
	// just print the first token in the user's entered string.
	printf("%s\n", line);

	free(line);
}
