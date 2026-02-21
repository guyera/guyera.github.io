#include <stdlib.h>
#include <string.h> // For memcpy
#include <stdio.h>

int main(void) {
	// First, we create a pointer to store the base address of the
	// dynamic array. We'll modify this pointer as the program goes
	// on. For now, it'll be NULL, indicating that no array
	// exists yet.
	float* list = NULL;

	// We'll also have to keep track of its size, which will change
	// throughout the program.
	size_t list_size = 0;

	// Now, we ask the user for numbers, one at a time, until
	// they choose to stop, adding each number to the array.
	int keep_going = 1;
	do {
		printf("Enter a number: ");
		float new_number;
		scanf("%f", &new_number);

		// Expand the array. This single statement consolidates
		// steps 1, 2, 3, and part of step 5 from the previous
		// implementation. It also means we don't need the
		// new_array pointer anymore; we can just reuse list
		list = realloc(
			list,
			sizeof(float) * (list_size + 1)
		);
		if (!list) {
			printf("Error on realloc()\n");
			exit(1);
		}
		
		// The new array (which list now points to) has an
		// extra slot at the end of it, currently uninitialized.
		// Initialize it to the new value entered by the user
		list[list_size] = new_number;

		// Increment the size variable
		++list_size;

		// Done. Now just ask the user if they want to supply
		// another number.
		printf("Do you want to supply another number? Enter "
			"1 for yes, 0 for no: ");
		scanf("%d", &keep_going);
	} while(keep_going);

	// Program is all done. Free the final array, which list
	// currently points to.
	free(list);
}
