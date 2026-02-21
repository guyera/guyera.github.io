#include <stdio.h>

void print_info_about_person(int* age, float* favorite_number) {
	if (age) {
		printf("Age: %d. ", *age);
	} else {
		printf("Age: Unknown. ");
	}

	if (favorite_number) {
		// (Recall: %.2f rounds float to 2 decimal places for
		// printing)
		printf("Favorite #: %.2f.\n", *favorite_number);
	} else {
		printf("Favorite #: Unknown.\n");
	}
}

int main(void) {
	int age = 27;
	float favorite_number = 3.14;

	// If you know the person's age and favorite number, you can
	// provide both of them.
	// Prints Age: 27. Favorite #: 3.14
	print_info_about_person(&age, &favorite_number);

	// Suppose you know their favorite number but not their age:
	// Prints Age: Unknown. Favorite #: 3.14
	print_info_about_person(NULL, &favorite_number);

	// Or maybe the other way around:
	// Prints Age: 27. Favorite #: Unknown
	print_info_about_person(&age, NULL);

	// Or maybe you know nothing about the person:
	// Prints Age: Unknown. Favorite #: Unknown
	print_info_about_person(NULL, NULL);
}
