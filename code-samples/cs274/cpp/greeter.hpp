#ifndef GREETER_HPP
#define GREETER_HPP

#include <string>

class greeter {
private:
	std::string name;
public:
	// Define a constructor for the greeter structure type
	// accepting a name string as the only argument. We
	// accept it by constant reference (similar to constant
	// pointer) since we don't intend to modify it but
	// also don't want it to be copied twice---just once
	// (into the object field, but not into the parameter).
	greeter(const std::string& name);

	// Prototype methods in structure type definitions
	// (could be in a .hpp file)
	void greet();
};

#endif
