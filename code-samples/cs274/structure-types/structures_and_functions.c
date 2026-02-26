#include "baseball_player.h"

int main(void) {
	// Create a default baseball player
	struct baseball_player my_player =
		create_default_baseball_player();

	// Print their information to the terminal
	print_baseball_player(&my_player);
}
