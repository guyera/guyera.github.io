#include <iostream>
#include <memory>

int main() {
	std::unique_ptr<int> heap_integer =
		std::make_unique<int>(42);

	// Prints 42
	std::cout << *heap_integer << std::endl;
}
