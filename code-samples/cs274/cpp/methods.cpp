#include <memory>

#include "greeter.hpp"

int main() {
	// Create the greeter on the heap using a unique pointer
	std::unique_ptr<greeter> g =
		std::make_unique<greeter>("Joe");
	
	// Call the greet() method of the greeter on the heap
	// that's managed by the unique pointer g. Prints
	// "Hello, my name is Joe"
	g->greet();
}
