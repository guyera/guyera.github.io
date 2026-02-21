#include <stdio.h>
#include <ctype.h> // islower and isupper

int main(void) {
	if (islower('A')) {
		printf("'A' is a lowercase letter\n");
	}

	if (islower('a')) {
		printf("'a' is a lowercase letter\n");
	}
}
