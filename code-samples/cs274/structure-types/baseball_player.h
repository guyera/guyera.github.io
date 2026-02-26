#ifndef BASEBALL_PLAYER_H
#define BASEBALL_PLAYER_H

// Every baseball player "has a" birth year and a batting
// average
struct baseball_player {
	int birth_year;
	double batting_average;
};

// Below are prototypes of functions that work closely with
// baseball player structures. Notice that these prototypes
// are BELOW the structure type definition. That's because these
// prototypes reference the structure type definition, so its
// definition (or at least a forward declaration) must appear
// above these lines within the current translation unit.


// Structure type fields cannot be given default values, but
// you CAN simply create a function that allocates, initializes,
// and returns a "default instance" of a given structure
// type. (Don't worry about the cost of the return value's
// copy; it'll likely be elided by the compiler anyways.)
// Again, notice 'struct' before 'baseball_player'.
struct baseball_player create_default_baseball_player(void);

// You can also create functions to, say, print structures.
// That's nice since there's no format specifier for complex
// structures. (You MAY need to worry about the cost of the
// argument copy. More on that shortly.)
void print_baseball_player(const struct baseball_player* p);

#endif
