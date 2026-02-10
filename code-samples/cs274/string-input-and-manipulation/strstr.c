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

	// Find the first occurrence of the word "pizza" in the
	// user's sentence
	char* ptr = strstr(line, "pizza");
	if (ptr) {
		// i.e., if (ptr != NULL)
		// The sentence does, indeed, contain the word pizza
		// AT LEAST once. ptr now points to the 'p' in the
		// FIRST occurrence of the word pizza within the
		// character array that line points to.
		
		// Replace "pizza" in the line with "tacos" (note:
		// they're both the same number of characters)
		const char* tacos = "tacos";
		for (size_t i = 0; i < strlen(tacos); ++i) {
			// Recall: if a pointer ptr points to a character in
			// the MIDDLE of a string, then ptr[0] will be that
			// character, ptr[1] will be the next character, and
			// so on. So ptr[0] is 'p', ptr[1] is 'i', ptr[2]
			// is 'z', ptr[3] is 'z', and ptr[4] is 'a'.
			// Replace those 5 characters with the 5 characters
			// of "tacos".
			ptr[i] = tacos[i];
		}

		// Tip: An easier way to do the above would be to
		// use the strncpy function (not strcpy, but strncpy),
		// which copies the first n characters of one string
		// into another string (possibly excluding the null
		// terminator if desired, as is the case here)
	}

	// Print the modified sentence back to the user:
	printf("%s\n", line);

	free(line);
}
