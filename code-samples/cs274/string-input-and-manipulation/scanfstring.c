#include <stdio.h>

int main() {
	printf("Enter your two favorite words, separated "
		"by any whitespace: ");

	// These character arrays can each store 255 characters of string
	// content, plus a null terminator
	char first_word[256];
	char second_word[256];

	scanf("%s", first_word);
	scanf("%s", second_word);

	printf("Your first word was: %s\n", first_word);
	printf("Your second word was: %s\n", second_word);
}
