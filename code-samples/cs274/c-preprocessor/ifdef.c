#include <stdio.h>

// Note the \ characters at the end of each line, just before
// the line break
#define DEF_SQUARE(t) t square_##t(t x) {\
	return x * x;\
}

// Defines the square_int function
DEF_SQUARE(int)

// Defines the square_float function
DEF_SQUARE(float)

#undef DEF_SQUARE

// Checks whether DEF_SQUARE is defined. It isn't, since it
// was just undefined via #undef. As such, lines 22-24 will
// be "deleted" by the preprocessor. From the compiler's
// perspective, the below lines of code simply aren't part
// of the program.
#ifdef DEF_SQUARE
DEF_SQUARE(double)
#endif

// ... And so on

int main(void) {
	printf("2^2 = %d\n", square_int(2));
	printf("3.14^2 = %f\n", square_float(3.14f));

	// Also, just for further demonstration, let's define the
	// HELLO macro here
#define HELLO

	// Now we'll check if it's defined. It is, so the
	// contained code will be included in what's passed to
	// the compiler. Hence, this will, indeed, print
	// "Hello, World!".
#ifdef HELLO
	printf("Hello, World!\n");
#endif

	// However, GOODBYE is NOT defined, so the below printf
	// statement will be "deleted" by the preprocessor, and
	// the compiler will never see it.
#ifdef GOODBYE
	printf("Goodbye, World!\n");
#endif

	// In fact, consider the following code, which is riddled
	// with syntax errors. Ordinarily, the compiler would
	// print out all sorts of error messages. But the compiler
	// never even gets a chance to SEE this code since GODOBYE
	// is not defined. Hence, no errors are generated.
#ifdef GOODBYE
	jfdsajfsd(hello!)
			this() _is_ a bogus!! line of code()()()
	int x = int x = int int int; Woo hoo!
#endif
	
	// Checks if HELLO is NOT defined. But it is, so the
	// printf("ABC\n") statement will be "deleted" by the
	// preprocessor. However, there's an attached #else
	// directive; its body of code WILL be passed to the
	// compiler. Hence, the program will print "XYZ"
#ifndef HELLO
	printf("ABC\n");
#else
	printf("XYZ\n");
#endif
}
