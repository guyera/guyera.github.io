#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main() {
	printf("Enter a sentence: ");
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

	printf("Enter another sentence: ");
	char* line2 = NULL;
	n = 0;
	len = getline(&line2, &n, stdin);
	if (len == -1) {
		printf("Error on getline()\n");
		exit(1);
	}
	if (len >= 1 && line2[len - 1] == '\n') {
		line2[len - 1] = '\0';
	}
	if (len >= 2 && line2[len - 2] == '\r') {
		line2[len - 2] = '\0';
	}

	// Create a character array that's big enough to store the
	// concatenated contents, plus a period and space between
	// them, plus one null terminator at the end
	size_t len1 = strlen(line);
	size_t len2 = strlen(line2);
	char* concatenated = malloc((len1 + len2 + 3) * sizeof(char));
	if (!concatenated) {
		printf("Error on malloc()\n");
		exit(1);
	}

	// Copy the first line into it
	strcpy(concatenated, line);

	// Concatenate ". " onto the end of it
	strcat(concatenated, ". ");

	// Concatenate the second line onto the end of it
	strcat(concatenated, line2);

	printf("The concatenated result is: %s\n", concatenated);

	free(concatenated);
	free(line2);
	free(line);
}
