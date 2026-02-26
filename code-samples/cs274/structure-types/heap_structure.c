#include <stdlib.h>
#include <stdio.h>

#include "baseball_player.h"

int main(void) {
	// Again, notice the 'struct' keyword before
	// 'baseball_player' each time we reference the
	// structure type, including in the sizeof() operator
	struct baseball_player* player = malloc(
		sizeof(struct baseball_player)
	);
	if (!player) {
		printf("Error on malloc()\n");
		exit(1);
	}

	// 'player' is a pointer to an allocated block of bytes
	// on the heap that's big enough to fit a single
	// baseball_player structure. We can dereference it
	// and use it as if it were a baseball_player structure.
	// Let's initialize its fields:
	player->birth_year = 1998;
	player->batting_average = 0.28;

	// And perhaps print those field values
	printf(
		"Player's birth year: %d | Player's batting "
			"average: %.2f\n",
		player->birth_year,
		player->batting_average
	);
	
	// Now, suppose we want to free it from the heap.
	// We can free it just like we free anything else
	// from the heap: call the free function, and supply
	// the pointer that points to it.
	free(player);
}
