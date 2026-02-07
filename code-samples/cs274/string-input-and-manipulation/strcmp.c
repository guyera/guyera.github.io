#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main() {
	printf("Enter the password: ");
	char* line = NULL;
	size_t n = 0;
	ssize_t len = getline(&line, &n, stdin);
	line[len - 1] = '\0';
	if (line[len - 2] == '\r') {
		line[len - 2] = '\0';
	}

	if (strcmp(line, "the password") == 0) {
		printf("Correct!\n");
	} else {
		printf("Wrong password!\n");
	}

	free(line);
}
