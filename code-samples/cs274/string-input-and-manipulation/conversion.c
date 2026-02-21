#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main(void) {
	printf("Enter any decimal number: ");
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

	double as_double = strtod(line, NULL);
	printf("Your value multiplied by 2 is: %lf\n", as_double * 2);
	// Free the line immediately so that we can reuse the
	// pointer
	free(line);

	printf("Enter a WHOLE number: ");
	line = NULL;
	n = 0;
	len = getline(&line, &n, stdin);
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
	
	long as_long = strtol(line, NULL, 10);
	printf(
		"The remainder after dividing your value by 7 is: %ld\n",
		as_long % 7
	);
	// Free the line immediately so that we can reuse the
	// pointer
	free(line);

	printf("Enter a bitstring: ");
	line = NULL;
	n = 0;
	len = getline(&line, &n, stdin);
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
	
	// Base 2 = interpret string as binary expression (bitstring)
	as_long = strtol(line, NULL, 2);
	printf(
		"The value of your bitstring converted to the "
			"decimal system is: %ld\n",
		as_long
	);
	// Free the final line
	free(line);
}
