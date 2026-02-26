#include <stdio.h> // Needed for printf

// This file will define the functions prototyped in
// baseball_player.h. Those functions work closely with the
// baseball_player structure type. Hence, this translation unit
// needs access to the definition of the baseball_player
// structure type. A simple way to achieve that is by including
// baseball_player.h directly here within baseball_player.c.
// This is a common pattern.
#include "baseball_player.h"

struct baseball_player create_default_baseball_player(void) {
	// The "default" baseball player will have a birth
	// year of 1970 and a batting average of 0.2
	struct baseball_player player = {
		.birth_year = 1970,
		.batting_average = 0.2
	};
	return player;
}

void print_baseball_player(const struct baseball_player* p) {
	printf(
		"Player's birth year: %d | Player's batting "
			"average: %.2f\n",
		p->birth_year,
		p->batting_average
	);
}
