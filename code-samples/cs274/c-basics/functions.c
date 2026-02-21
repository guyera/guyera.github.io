#include <stdio.h>

// Prompts the user for an integer between two values, 'low' and
// 'high' (inclusive), reprompting if they provide an integer outside
// of this range.
// Prototype:
int prompt_for_integer_in_range(int low, int high);

// Definition:
int prompt_for_integer_in_range(int low, int high) {
	int user_input;
	do {
		// Prompt user
		printf(
			"Enter an integer between %d and %d: \n",
			low,
			high
		);

		// Receive input
		scanf("%d", &user_input);

		// Print error message if invalid
		if (user_input < low || user_input > high) {
			printf("\nError: Provided input outside of "
				"specified range.\n\n");
		}
	} while (user_input < low || user_input > high);

	// Loop terminated, meaning user_input is valid. Return it.
	return user_input;
}

int main(void) {
	// Ask the user for an integer between 1 and 10
	int num_between_1_and_10 = prompt_for_integer_in_range(1, 10);
	
	// Ask the user for an integer between 5 and 57
	int num_between_5_and_57 = prompt_for_integer_in_range(5, 57);

	// And so on...
}
