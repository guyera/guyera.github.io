#include <stdlib.h>
#include <string.h> // For strlen
#include <stdio.h>

int main() {
	printf("Enter a line of text no more than 30 "
		"characters in length: ");
	
	// 30 characters of regular content, plus two characters for
	// a newline character sequence (\r\n on Windows; just \n on
	// Unix-like systems), plus one null terminator
	char line[33];

	// Read the line from the user (or as much of it as we can
	// fit in the array) and null-terminate it
	fgets(line, 33, stdin);

	// Like getline, fgets will read the newline character
	// sequence and store it in the character array. However, if
	// the user's line contained more than 32 characters
	// (including the newline character sequence), then the
	// newline character sequence wouldn't fit in the array, so
	// it'd be left in the input buffer. On Windows systems and
	// alike, it's even possible that fgets will read the
	// carriage return (\r) but NOT the subsequent line feed
	// (\n) if the character array is just barely big enough to
	// fit the former but not the latter. This means that the
	// character array can contain one of three things: 1. The
	// line, followed by a full newline character sequence,
	// followed by a null terminator 2. The line, followed by a
	// partial newline character sequence (only on Windows---\r
	// but not \r\n), followed by a null terminator. Only
	// happens if the character array is just barely big enough
	// to fit the \r but not the \n. 3. The line or PART of the
	// line, followed by a null terminator, but without the
	// newline character sequence since it didn't fit. Remaining
	// unread characters will be left in the input buffer.
	
	// Also, unlike getline, fgets does not return the string
	// length of the line, so we must compute it with strlen.
	
	// This all means that trimming \r and \n from the end of
	// the line is a bit more difficult:
	
	size_t len = strlen(line);

	// If the last character is \r OR \n, trim it
	if (line[len - 1] == '\n' || line[len-1] == '\r') {
		line[len - 1] = '\0';
	}

	// Repeat for the second-to-last character
	if (line[len - 2] == '\n' || line[len-2] == '\r') {
		line[len - 2] = '\0';
	}

	// Good. Now we can do whatever we want with the line.
	printf("You entered: %s\n", line);
	
	// Ask the user for another line
	printf("Enter another line of text no more than 30 "
		"characters in length: ");
	
	// We can reuse the same array
	char* fgets_result = fgets(line, 33, stdin);
	if (!fgets_result) {
		printf("Error on fgets()\n");
		exit(1);
	}



	// Trim it
	len = strlen(line);
	if (line[len - 1] == '\n' || line[len-1] == '\r') {
		line[len - 1] = '\0';
	}
	if (line[len - 2] == '\n' || line[len-2] == '\r') {
		line[len - 2] = '\0';
	}

	printf("You entered: %s\n", line);
}
