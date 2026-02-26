#include <stdio.h>

#include "baseball_player.h"

int main(void) {
        struct baseball_player samantha = {
                .birth_year = 1998,
                .batting_average = 0.28
        };

        // ptr is a pointer to a baseball player structure.
        // Specifically, it's initialized to store the memory
        // address of samantha (a baseball player structure).
        struct baseball_player* ptr = &samantha;

        // joe is a copy of samantha.
        struct baseball_player joe = samantha;

        // The above is effectively equivalent to:
        // struct baseball_player joe;
        // joe.birth_year = samantha.birth_year;
        // joe.batting_average = samantha.batting_average;

        // Let's change ptr to point to joe, just to prove
        // that joe's fields' values are the same as samantha's.
        ptr = &joe;

        // Print information about the baseball player that
        // ptr points to (samantha, in this case)
        printf(
                "Player's birth year: %d | Player's batting "
                        "average: %.2f\n",
                ptr->birth_year, // dereferences, THEN accesses
                ptr->batting_average
        );
}
