// Option b: In the structure type, store a pointer that points
// to the beginning of an array, which is allocated completely
// separately (probably on the heap somewhere)
struct person {
        // Base address of char array containing person's name
        // as a C string
        char* name;

        // Year in which person was born
        int birth_year;
};

// To complete the example, let's create a function that makes
// it easy to initialize a person structure given a name and
// birth year. This function will allocate a dynamic array of
// characters and copy the given name C string into it, and then
// store the base address of that dynamic array in the newly
// created person structure's name field. It will also copy the
// birth_year parameter value into the birth_year field of the
// person structure, and finally return the person structure.
struct person create_person(const char* name, int birth_year);

// And a function that prints a person's info to the terminal
void print_person(const struct person* p);

// And a function to free the dynamic memory backing the pointer
// fields (name, in this case)
void free_person(const struct person* p);

struct person copy_person(const struct person* person_to_copy);

_Bool people_are_equal(
	const struct person* p1,
	const struct person* p2
);
