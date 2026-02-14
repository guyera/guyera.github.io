#include <stdio.h>

int main() {
	// The preprocessor evaluates the expression 1 + 2 == 4
	// and finds it to be false (0). So printf("123\n"); is
	// "deleted" by the preprocessor. It then evaluates
	// 2 + 7 == 9 and finds it to be true (nonzero). So
	// printf("456\n"); is NOT deleted. Any subsequent #elif and
	// #else blocks will not be evaluated; their contained
	// code will immediately be "deleted" by the preprocessor.
	// That's all to say, this program prints "456"
#if 1 + 2 == 4
	printf("123\n");
#elif 2 + 7 == 9
	printf("456\n");
#else
	printf("789\n");
#endif
}
