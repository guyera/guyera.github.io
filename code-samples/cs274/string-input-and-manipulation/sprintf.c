#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main() {
	printf("Enter a sentence: ");
	char* line = NULL;
	size_t n = 0;
	ssize_t len = getline(&line, &n, stdin);
	line[len - 1] = '\0';
	if (line[len - 2] == '\r') {
		line[len - 2] = '\0';
	}

	printf("Enter another sentence: ");
	char* line2 = NULL;
	n = 0;
	len = getline(&line2, &n, stdin);
	line2[len - 1] = '\0';
	if (line2[len - 2] == '\r') {
		line2[len - 2] = '\0';
	}

	// Create a character array that's big enough to store the
	// concatenated contents, plus a period and space between
	// them, plus one null terminator at the end
	size_t len1 = strlen(line);
	size_t len2 = strlen(line2);
	char* concatenated = malloc((len1 + len2 + 3) * sizeof(char));

	// Print the first line, then ". ", then the second line,
	// all into 'concatenated'
	sprintf(concatenated, "%s. %s", line, line2);

	printf("The concatenated result is: %s\n", concatenated);

	free(concatenated);
	free(line2);
	free(line);
}
