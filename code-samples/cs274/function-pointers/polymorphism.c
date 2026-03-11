#include <stdlib.h>
#include <stdio.h>

// Player, zombie, and vampire structure types. These should
// really be in their own header files, but I've put them
// here for brevity of the demonstration.
struct player {
	int hp;
};

struct zombie {
	int sanity;
};

struct vampire {
	int strength;
};

// "Polymorphic" handle on some kind of entity that can attack
// the player
struct attacker {
	// Every attacker contains a "context". This context
	// contains the state of the attacker (i.e., the entity
	// "doing" the attacking). For example, it
	// might be a zombie structure, or it might be a
	// vampire structure. It depends on who the attacker is.
	// So we use a void pointer to represent it.
	void* context;

	// Every attacker has an attack function. But different
	// attackers can have different attack functions to
	// attack the player in different ways. So we use a
	// function pointer, which will point to the given
	// attacker's particular attack function. It will
	// accept the player AND the context (i.e., the state
	// of the attacker) via pointers.
	void (*attack)(void* context, struct player* p);
};

// Zombies attack the player via this function. Notice that its
// signature aligns with that of the attack function pointer
// of the attacker structure type. This allows us to store its
// address in said field.
void zombie_attack(void* context, struct player* p) {
	// context is a void pointer so as to align with
	// the signature of the attack function pointer field
	// in the attacker structure type, but it must ACTUALLY
	// point to a zombie (since this is the zombie_attack
	// function). Cast it to a struct zombie*.
	struct zombie* z = context;

	// If the zombie is still sane, it loses sanity.
	// Otherwise, it attacks the player.
	if (z->sanity > 0) {
		--(z->sanity);
	} else {
		p->hp -= 2; // Zombies do 2 damage
	}
}

// Similarly, vampires attack the player via this function.
void vampire_attack(void* context, struct player* p) {
	// context is a void pointer so as to align with
	// the signature of the attack function pointer field
	// in the attacker structure type, but it must ACTUALLY
	// point to a vampire (since this is the vampire_attack
	// function). Cast it to a struct vampire*.
	struct vampire* v = context;

	// The amount of damage dealt to the player should match
	// the vampire's current strength
	p->hp -= v->strength;

	// The vampire sucks the player's blood and gets
	// stronger, up to a maximum strength of 3.
	if (v->strength < 3) {
		++(v->strength);
	}
}

// Creates a zombie on the heap and returns its address.
// Using the heap allows us to store its address in various
// places (e.g., in the context field of an attacker structure)
// without worrying about those pointers becoming dangling due
// to the object falling out of scope before we're done with
// it.
struct zombie* create_zombie() {
	struct zombie* z = malloc(sizeof(struct zombie));
	z->sanity = 3; // Zombies start with 3 sanity
	return z;
}

// Similarly, creates a vampire on the heap
struct vampire* create_vampire() {
	struct vampire* v = malloc(sizeof(struct vampire));
	v->strength = 1; // Vampires start with 1 strength
	return v;
}

int main(void) {
	// The player starts with 10 hp
	struct player p = {.hp = 10};

	// Create an array of attackers (could be on the heap;
	// I used the stack for simplicity of the demo).
	struct attacker attackers[2];
	
	// The first attacker will be a zombie
	struct zombie* z = create_zombie();
	
	// We want the first attacker to refer to z. That is,
	// attackers[0].context should point to z, and
	// attackers[0].attack should point to the zombie_attack
	// function. That way, when we call
	// (*attackers[0].attack)(attackers[0].context, &p),
	// it will call the zombie_attack function to attack
	// the player, passing the zombie (z) as the context.
	attackers[0].context = z; // Casts to void pointer
	attackers[0].attack = zombie_attack;

	// The second attacker is a vampire
	struct vampire* v = create_vampire();
	attackers[1].context = v; // Casts to void pointer
	attackers[1].attack = vampire_attack;

	// Now, in order to tell ALL the attackers to attack
	// the players, we just need to iterate once, through
	// a single array (attackers), like so:
	for (size_t i = 0; i < 2; ++i) {
		// Each attacker has a pointer pointing to its
		// own special attack function, as well as
		// a void pointer that points to the context
		// storing the attacker's state to be passed
		// to said attack function. Call the attack
		// function, passing it the context (and the
		// address of the player to be attacked)
		(*attackers[i].attack)(
			attackers[i].context,
			&p
		);
	}

	// Just to prove it worked... The zombie should have
	// lost 1 sanity, the player should have lost 1 HP
	// (from the vampire), and the vampire should have
	// gained 1 strength. That is, z->sanity should be 2,
	// p->hp should be 9, and v->strength should be 2.
	printf("z->sanity: %d\n", z->sanity);
	printf("p.hp: %d\n", p.hp);
	printf("v->strength: %d\n", v->strength);

	// Free the zombie and vampire. We can actually
	// do that through their context void pointers stored
	// in the attackers array in this case, if we want
	// (free() technically always casts the given pointer to
	// a void pointer anyways; that's its parameter type)
	for (size_t i = 0; i < 2; ++i) {
		free(attackers[i].context);
	}

	// Of course, if the attackers array were on the heap
	// instead of the stack, we'd have to free it too
	// (free(attackers)). But that's not the case in this
	// simple demo
}
