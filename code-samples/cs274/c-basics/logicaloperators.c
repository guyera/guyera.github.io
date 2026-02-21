#include <stdio.h>

int main(void) {
	// Ask user for integer x
	int x;
	scanf("%d", &x);

	// Check if x is between 5 and 10.
	// The parentheses are technically optional in this case,
	// but they provide some clarity as to the order of operations.
	int within_range = (x >= 5) && (x <= 10);

	// If x is between 5 and 10 (inclusive), then
	// within_range will be 1 ("true"). Else, it'll be
	// 0 ("false").
	
	// Check if x is negative or greater than 100
	int negative_or_large = (x < 0) || (x > 100);

	// If x is negative or greater than 100, then
	// negative_or_large will be 1 ("true"). Else, it'll
	// be 0 ("false").
}
