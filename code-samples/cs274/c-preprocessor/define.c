#include <stdio.h>

// Define the PRINT macro, and give it the text value 'printf'.
#define PRINT printf

// If the word PRINT appears anywhere in the source code, the
// preprocessor will automatically replace it with printf.

// Define the NOTHING macro, giving it no value whatsoever
#define NOTHING

// If the word NOTHING appears anywhere in the source code,
// the preprocessor will automatically remove it.

int main() {
	// The preprocessor will "rewrite" the below line of code as
	// printf("Hello, World!\n");
	// before passing it off to the compiler. In other words,
	// it removes both instances of NOTHING, treating them
	// as if they weren't even there, and it replaces PRINT
	// with printf
	PRINT(NOTHING"Hello, World!\n"NOTHING);
}
