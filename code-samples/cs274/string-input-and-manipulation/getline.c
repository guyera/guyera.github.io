#include <stdlib.h> // For free()
#include <stdio.h>

int main() {
	char* line = NULL;
	size_t n = 0;
	printf("Give me a fun quote: ");
	
	ssize_t len = getline(&line, &n, stdin);

	// Replace the last character of the string's contents with a
	// null terminator, shortening it by one character:
	line[len - 1] = '\0';

	// But if this is Windows or a similar platform, then there will
	// additionally be a carriage return (\r) before the line feed
	// character. Let's check for that with an if statement and trim
	// it as well if necessary
	if (line[len - 2] == '\r') {
		line[len - 2] = '\0';
	}

	printf("Your quote was: %s\n", line);
	printf("%ld bytes were allocated to the character array to store "
		"the line of text\n", n);

	// The program is done with the line of text, so we should free
	// it
	free(line);

	// I know, this program is boring. We'll learn how to do more
	// interesting things with strings soon.
}
