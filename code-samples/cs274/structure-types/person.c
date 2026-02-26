#include <string.h>
#include <stdlib.h>
#include <stdio.h>

#include "person.h"

struct person create_person(const char* name, int birth_year) {
	// The name parameter points to a C string, but who
	// knows where that C string is stored? It might be
	// a string literal, stored in the readonly section
	// of the data segment. So, when we actually create the
	// person structure here, we should allocate a
	// completely separate char array and copy the name into
	// it. We'll put it on the heap (else it would fall out
	// of scope at the end of this function, and the
	// returned person structure would contain a dangling
	// pointer).
	char* name_on_heap =
		malloc(sizeof(char) * (strlen(name) + 1));
	strcpy(name_on_heap, name);

	// Now we create the person structure, copying the
	// address sstored in name_on_heap into their name
	// pointer field (and copying the birth_year parameter
	// value into their birth_year field).
	struct person p;
	p.name = name_on_heap;
	p.birth_year = birth_year;

	// Done. Return the person structure.
	return p;
}

void print_person(const struct person* p) {
	printf(
		"Name: %s | birth year: %d\n",
		p->name,
		p->birth_year
	);
}

void free_person(const struct person* p) {
	// Free the dynamic array that p.name points to.
	// Important: This REQUIRES that p.name point to
	// a heap-allocated array. The create_person() function
	// always allocates that array on the heap. But of
	// course, it's possible to go out of your way to break
	// this assumption, in which case the below line of code
	// would invoke undefined behavior.
	free(p->name);
}

struct person copy_person(const struct person* person_to_copy) {
        struct person copy;
        copy.birth_year = person_to_copy->birth_year;

        // For the dynamic array, allocate a new array and copy the
        // contents rather than just copying the pointer.
        copy.name = malloc(
                sizeof(char) * (strlen(person_to_copy->name) + 1)
        );
        strcpy(copy.name, person_to_copy->name);

        return copy;
}

_Bool people_are_equal(
		const struct person* p1,
		const struct person* p2) {
	if (strcmp(p1->name, p2->name) == 0) {
		return 1;
	}
	return 0;
}
