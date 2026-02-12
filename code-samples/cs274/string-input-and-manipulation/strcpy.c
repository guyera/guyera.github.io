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

	// Create a copy of the sentence. First, create an array
	// that's big enough to store the copy (strlen(line), plus
	// one for a null terminator).
	len = strlen(line);
	char* copy = malloc((len + 1) * sizeof(char));
	if (!copy) {
		printf("Error on malloc()\n");
		exit(1);
	}

	// Now use strcpy
	strcpy(copy, line);

	// Modifying the copy does NOT modify the original line,
	// nor vice-versa. They're two separate arrays.
	copy[0] = 'Z';

	printf("Your sentence was: %s\n", line);
	printf("Your modified sentence is: %s\n", copy);

	// Don't forget to delete both the original line AND the
	// copy, since both were dynamically allocated
	free(copy);
	free(line);
}
