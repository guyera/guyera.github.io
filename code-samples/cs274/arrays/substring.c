#include <stdio.h>

int main() {
	// An array of 6 characters
	char str[] = {'H', 'e', 'l', 'l', 'o', '\0'};

	// ptr points to the fourth character (the second 'l' in Hello)
	char* ptr = str + 3;

	// Hence, ptr[0] is l (by the way, %c is the format specifier
	// for individual characters)
	printf("%c\n", ptr[0]); // prints l
	// Or, equivalently:
	printf("%c\n", *ptr);

	// But also, ptr[1] is whatever comes after that, which in
	// this case is the 'o' in hello
	printf("%c\n", ptr[1]); // prints o

	// To be clear, ptr is not an array of characters. It's just
	// a pointer. However, it can be TREATED like an array of
	// characters. It points to an 'l'. Immediately after that is an
	// 'o', followed by a null terminator. That is, you can think of
	// it as if it were an array of three characters:
	// 'l', 'o', '\0'
	// You can think of it like that, but you can also USE it like
	// that. Indeed, ptr itself can be used as a valid C string.
	printf("%s\n", ptr); // Prints lo
	
	// Suppose I want to print out the 2nd through 4th characters
	// in str (which would be "ell"). First, overwrite the 5th
	// character with a null terminator so that the string's content
	// ends with the 4th character:
	str[4] = '\0';

	// Now, simply print out all the content starting with the 2nd
	// character
	printf("%s\n", str + 1);
}
