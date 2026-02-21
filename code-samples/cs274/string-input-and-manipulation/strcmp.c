#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main(void) {
	printf("Enter the password: ");
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

	if (strcmp(line, "the password") == 0) {
		printf("Correct!\n");
	} else {
		printf("Wrong password!\n");
	}

	free(line);
}
