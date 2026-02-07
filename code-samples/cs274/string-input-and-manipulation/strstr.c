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


	free(line);
}
