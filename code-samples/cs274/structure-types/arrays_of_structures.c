#include <stdlib.h>

#include "person.h"

int main() {
	// Create an array of ten person structures on the stack
	struct person stack_people[10];

	// Initialize the first person in the array
	stack_people[0] = create_person("Joseph", 49);

	// Create an array of ten person structures on the heap
	struct person* heap_people =
		malloc(sizeof(struct person) * 10);

	// Initialize the first person in the array
	heap_people[0] = create_person("Joselyn", 32);

	// Free the name of (or whatever dynamic memory is
	// owned by) the two people we just created
	free_person(&stack_people[0]);
	free_person(&heap_people[0]);

	// However, consider that the entire array that
	// heap_people points to is, itself, on the heap. It
	// must be freed in turn. That is, not only do you have
	// to free the name arrays of all the people, you also
	// have to free the people themselves if they were
	// allocated on the heap. Rule of thumb: for every call
	// to malloc, there should be a corresponding call to
	// free.
	free(heap_people);
}
