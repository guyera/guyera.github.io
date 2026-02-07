#include <stdio.h>

int main() {
	int x;

	// Read the user's first integer input
	scanf("%d", &x);
	printf("%d\n", x); // Print the user's input value back to them
	
	// Perhaps there are 1 million lines of code here
	
	int y;
	// This will pick up where the previous scanf call left off in the
	// standard input buffer, reading the user's second integer input
	scanf("%d", &y);
	printf("%d\n", y); // Print the user's input value back to them
}
