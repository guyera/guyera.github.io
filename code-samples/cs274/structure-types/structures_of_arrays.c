#include "person.h"

int main() {
	struct person p = create_person("Aditya", 2001);
	print_person(&p);

	struct person p2 = copy_person(&p);

	free_person(&p);
	free_person(&p2);
}
