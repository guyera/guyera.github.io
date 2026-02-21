int main(void) {
	int x = 1;
	int y = 2;

	// A constant pointer. It points to x.
	int* const p = &x;

	// p may not be modified. This would be a syntax error
	// p = &y; // NOT ALLOWED! p CANNOT BE CHANGED!
	
	// However, x can be modified THROUGH p:
	*p = 3; // x is now 3. This is allowed.

	// A pointer-to-constant-data. It points to x.
	int const * p2 = &x;
	// Or, equivalently:
	// const int* p2 = &x;

	// p2 is not a constant, so it may be modified.
	p2 = &y; // p2 now points to y. This is allowed.

	// However, when p2 is dereferenced, the underlying value is
	// treated as a constant, so this would be a syntax error
	// *p2 = 4; // NOT ALLOWED! *p2 CANNOT BE CHANGED!
	
	// Constant pointer to constant data. It points to x.
	int const * const p3 = &x;
	// Or, equivalently:
	// const int * const p3 = &x;

	// p3 may not be modified. This would be a syntax error
	// p3 = &y; // NOT ALLOWED! p3 CANNOT BE CHANGED!
	
	// In addition, when p3 is dereferenced, the underlying value is
	// treated as a constant, so this would be a syntax error as
	// well
	// *p3 = 4; // NOT ALLOWED! *p3 CANNOT BE CHANGED!
}
