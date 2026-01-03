#include <stdio.h>

int main() {
	const char* format = "%s, %s!\n";
	const char* first_word = "Hello";
	const char* second_word = "World";
	printf(format, first_word, second_word);
}
