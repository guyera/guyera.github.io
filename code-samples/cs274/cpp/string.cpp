#include <iostream>
#include <string>

int main() {
	// C strings can be casted into std::string objects
	// implicitly
	std::string hello = "Hello, World!";
	std::cout << hello << std::endl;

	// This program may allocate some dynamic memory to
	// store the "Hello, World" contents in the std::string
	// object. But it also frees that dynamic memory
	// automatically. (Technically, it can sometimes avoid
	// using the heap via an optimization technique known
	// as small-string optimization. And that might happen
	// here since "Hello, World" is a pretty small string.)
}
