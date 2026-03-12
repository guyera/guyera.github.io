#include <string>
#include <iostream>

// Include the header file defining the greeter structure type
#include "greeter.hpp"

// Now define the functions and methods prototyped in
// greeter.hpp

greeter::greeter(const std::string& name) {
	// Copy the name parameter into this greeter's
	// name field. Yes, std::string objects can be
	// deep-copied simply via the assignment operator.
	// No need for strcpy, nor memcpy, etc.
	this->name = name;
}

// Must prefix the method's name with the name of
// the structure type (greeter) and the scope resolution
// operator (::) to make it clear that this isn't a global
// function, but rather a method of the greeter type.
void greeter::greet() {
	// "this" is a pointer to the greeter on which this
	// method is currently being called. Access this
	// greeter's name and include it in the printout
	std::cout << "Hello, my name is " << this->name <<
		std::endl;
}
