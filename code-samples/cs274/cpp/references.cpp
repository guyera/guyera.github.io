int main() {
	int x;

	// p is a pointer. It stores the address of x.
	int* p = &x;

	// r is a reference. It references x ("stores the
	// address of x". Technically, it might reference x in
	// some other, non-address way. But, in practice, it's
	// usually just an address, just like a pointer.)
	// Notice: No & on the right-hand side. It's "implied".
	// However, there is a & on the left-hand side.
	// References use & instead of * in their type
	// signatures.
	int& r = x;

	// You cannot declare a reference without initializing
	// it to refer to some variable at that moment. For
	// example, this wouldn't be allowed:
	// int& my_reference;
	// However, you can obviously do this with pointers:
	// int* my_pointer;

	// This changes x to 10
	*p = 10;

	// This changes x to 20. Notice: no dereference
	// operator. Again, it's "implied".
	r = 20;

	// Because the dereference operator is "implied"
	// whenever a reference is used, the reference itself
	// cannot be changed. Consider:
	int y = 1;
	r = y;

	// The above, r = y, does NOT change r to make it
	// refer to y. Instead, it changes x to store the
	// value of y. Again, the dereference operator is
	// "implied", so r = y is equivalent to x = y.
	
	// This is what I meant when I said that "all references
	// are themselves constant". References cannot be
	// changed. Only the values of the things that they
	// refer to can be changed (unless you const-qualify
	// the reference, so that it's a
	// reference-to-a-constant).
}
