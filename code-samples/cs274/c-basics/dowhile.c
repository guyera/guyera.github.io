#include <stdio.h>

int main() {
	int user_choice;
	do {
		printf("It's your turn. Choose an option.\n");
		printf("1. Attack with your sword\n");
		printf("2. Cast vicious mockery\n");
		printf("3. Run away\n");
		printf("Enter your choice: ");

		scanf("%d", &user_choice);
		
		if (user_choice < 1 || user_choice > 3) {
			printf("\nError: Your choice must be 1, 2, "
				"or 3\n\n");
		}
	} while(user_choice < 1 || user_choice > 3);

	// ...Do something with the user's choice (e.g., check it with
	// an if statement to decide how to proceed)...
}
