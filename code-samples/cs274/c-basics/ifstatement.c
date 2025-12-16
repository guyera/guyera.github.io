#include <stdio.h>

int main() {
	printf("Enter your grade percentage: ");
	float percent;
	scanf("%f", &percent);

	if (percent >= 92.5) {
		printf("Your grade is an A\n");
	} else if (percent >= 89.5) {
		printf("Your grade is an A-\n");
	} else if (percent >= 86.5) {
		printf("Your grade is a B+\n");
	} else if (percent >= 82.5) {
		printf("Your grade is a B\n");
	} else if (percent >= 79.5) {
		printf("Your grade is a B-\n");
	} else if (percent >= 76.5) {
		printf("Your grade is a C+\n");
	} else if (percent >= 72.5) {
		printf("Your grade is a C\n");
	} else if (percent >= 69.5) {
		printf("Your grade is a C-\n");
	} else if (percent >= 66.5) {
		printf("Your grade is a D+\n");
	} else if (percent >= 62.5) {
		printf("Your grade is a D\n");
	} else if (percent >= 59.5) {
		printf("Your grade is a D-\n");
	} else {
		printf("Your grade is an F\n");
	}
}
