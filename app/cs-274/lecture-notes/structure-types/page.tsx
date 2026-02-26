import CBlock from '../ui/cblock'
import SyntaxBlock from '../ui/syntaxblock'
import Verbatim from '../ui/verbatim'
import TerminalBlock from '../ui/terminalblock'
import ShellBlock from '../ui/shellblock'
import Image from '../ui/image'
import Code from '../ui/code'
import It from '../ui/italic'
import Bold from '../ui/bold'
import Ul from '../ui/underline'
import Term from '../ui/term'
import Link from '../ui/link'
import SectionHeading from '../ui/sectionheading'
import P from '../ui/paragraph'
import Emdash from '../ui/emdash'
import Itemize from '../ui/itemize'
import Enumerate from '../ui/enumerate'
import Item from '../ui/item'
import Caption from '../ui/caption'

import { inter } from '@/app/ui/fonts'
import { lusitana } from '@/app/ui/fonts'
import { garamond } from '@/app/ui/fonts'

import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

import CircularDependencyDiagram from './assets/circular-dependencies.png'
import CircularDependencyDiagramDarkMode from './assets/circular-dependencies-dark-mode.png'
import NonCircularDependencyDiagram from './assets/non-circular-dependencies.png'
import NonCircularDependencyDiagramDarkMode from './assets/non-circular-dependencies-dark-mode.png'

// @ts-ignore
import sourcesConfig from '../sources.yaml'
import TitleBlock from '../ui/titleblock'

let sourcesByPathName: {[key: string]: { pageTitle: string, namedIdentifier: string }} = {}
let sourcesByNamedIdentifier: {[key: string]: { pathName: string, pageTitle: string }} = {}
for (let page of sourcesConfig.pages) {
  sourcesByPathName[page.pathName] = {
    pageTitle: page.pageTitle,
    namedIdentifier: page.namedIdentifier
  }
  sourcesByNamedIdentifier[page.namedIdentifier] = {
    pathName: page.pathName,
    pageTitle: page.pageTitle
  }
}

let PATH_NAME = (() => {
  const filename = fileURLToPath(import.meta.url);
  return path.basename(path.dirname(filename))
})()

let PARENT_PATH = (() => {
  const filename = fileURLToPath(import.meta.url);
  return `/${path.dirname(path.dirname(filename)).split("app/")[1]}`
})()

export const dynamic = 'force-static'
export const dynamicParams = false

export async function generateMetadata({ params } : { params: Promise<any> }) {
  return {
    title: sourcesByPathName[PATH_NAME].pageTitle
  }
}

async function LectureNotes({ allPathData }: { allPathData: any }) {
  return (
    <>
      <P>Here's the outline for this lecture:</P>

      <Itemize>
        <Item><Link href="#structure-types">Structure types</Link></Item>
        <Item><Link href="#pointers-to-structures">Pointers to structures</Link></Item>
        <Item><Link href="#structures-on-the-heap">Structures on the heap</Link></Item>
        <Item><Link href="#copying-structures">Copying structures</Link></Item>
        <Item><Link href="#const-structures"><Code>const</Code>-qualified structures</Link></Item>
        <Item><Link href="#structures-and-functions">Structures and functions</Link></Item>
        <Item><Link href="#structures-of-arrays">Structures of arrays</Link></Item>
        <Item><Link href="#structure-equality">Structure equality</Link></Item>
        <Item><Link href="#arrays-of-structures">Arrays of structures</Link></Item>
        <Item><Link href="#and-so-on">And so on</Link></Item>
        <Item><Link href="#typedef"><Code>typedef</Code></Link></Item>
        <Item><Link href="#oop-vs-dod">(Optional content) OOP vs DoD</Link></Item>
      </Itemize>

      <SectionHeading id="structure-types">Structure types</SectionHeading>

      <P>C may be old, but it does support composite types (record types), meaning programmer-defined data types that contain other data (of potentially various types) inside them. In C, this is accomplished via <Bold>structure types</Bold>.</P>

      <P>You should be familiar with classes and object-oriented programming. A structure type is sort of like a class, save a few important differences:</P>

      <Itemize>
        <Item>In C, a structure type can't have methods / member functions (though they can in C++).</Item>
        <Item>In C, structure types do not support information-hiding / member access modifiers. That is, all fields are "public" (this is also not the case in C++).</Item>
        <Item>In C, structure types do not support inheritance<Emdash/>only composition (again, this is not the case in C++).</Item>
      </Itemize>

      <P>That's to say, structure types in C are not primarily an encapsulation mechanism. They're just a way of grouping related data via composition (e.g., establishing "has-a" relationships).</P>

      <P>A structure type can be defined in C via the following syntax:</P>

      <SyntaxBlock>{
`struct <name> {
    <field 1 declaration>
    <field 2 declaration>
    ...
    <field N declaration>
};`
      }</SyntaxBlock>

      <P>Replace <Code>{'<name>'}</Code> with the name of the structure type, and replace each <Code>{'<field X declaration>'}</Code> with a corresponding field (member variable) declaration. The syntax for a field declaration is the same as that of a declaration of any other variable, but you may <Ul>not</Ul> initialize fields within their declarations. For example, this is allowed:</P>

      <CBlock showLineNumbers={false}>{
`struct person {
    int age;
};`
      }</CBlock>

      <P>But this is <Ul>not</Ul> allowed (in C):</P>
      
      <CBlock showLineNumbers={false}>{
`struct person {
    int age = 21;
};`
      }</CBlock>

      <P>(The above syntax <It>is</It> allowed in C++; it establishes a default value of 21 for the <Code>age</Code> field of the <Code>person</Code> structure type. But in C++, structure type fields cannot have default values. They are simply uninitialized by default.)</P>

      <P>Importantly, the above syntax both declares <Ul>and</Ul> defines the structure type. It <It>is</It> possible to declare a structure type without defining it (e.g., <Code>struct person;</Code>). This is known as a <Bold>forward declaration</Bold>, and it creates an <Bold>incomplete type</Bold> (until the structure type is completed via a definition). Forward declarations can be useful (e.g., for speeding up build times in certain cases), but they're beyond the scope of this course.</P>

      <P>Now, <It>where</It> do we write the above code? After all, we just covered file separation, so you might be wondering how structure type definitions play into header files. First, let me remind you of the rules that we discussed previously:</P>

      <Itemize>
        <Item>Each function that's referenced within a program must be defined <Ul>exactly once</Ul> within <Ul>exactly one</Ul> translation unit across the program.</Item>
        <Item>Each function that's referenced within a translation unit must be declared within that translation unit before it's referenced.</Item>
      </Itemize>

      <P>Now, structure types have their own additional rules:</P>

      <Itemize>
        <Item>Each structure type that's referenced within a translation unit must be declared within that translation unit before it's referenced</Item>
        <Item>But also, with a few exceptions, in order to "use" a structure type within a translation unit, it generally must be <Ul>defined within that translation unit</Ul> before it's used. This means that if the structure type is used in multiple translation units, it must be declared <Ul>and</Ul> defined in all those translation units.</Item>
        <Item>If a structure type is defined in multiple translation units, all those definitions must be token-for-token identical, or else sharing structures of said type across translation units (e.g., passing them from one function to another, defined in two different translation units) may invoke undefined behavior.</Item>
      </Itemize>
        
      <P>(For the curious reader: if you use a forward declaration to declare a structure type without defining it within a translation unit, there are a <It>few</It> things that you can still do with that incomplete type. You can create pointers that point to structures of the incomplete type; you can use the incomplete type as a return type or parameter type in function <Ul>prototypes</Ul>; and perhaps you can do a few other minor things with them. But you <Ul>cannot</Ul> directly instantiate incomplete types, nor access members of their instances, nor pass them to the <Code>sizeof</Code> operator.)</P>

      <P>Notice that the rules for structure types are a bit different than the rules for functions. A function must be declared in each translation unit where it's referenced but defined in only one of them. Structure types, on the other hand, should generally be defined in every translation unit where they're used.</P>

      <P>This means that structure type definitions have a similar level of pervasiveness across translation units as function declarations. Perhaps it shouldn't surprise you, then, that <Ul>we tend to put structure type definitions in header files</Ul>:</P>

      <CBlock fileName="baseball_player.h">{
`#ifndef BASEBALL_PLAYER_H
#define BASEBALL_PLAYER_H

// Every baseball player "has a" birth year and a batting
// average
struct baseball_player {
        int birth_year;
        double batting_average;
};

#endif
`
      }</CBlock>

      <P>Now, in any translation unit where we want to use the <Code>baseball_player</Code> structure type, we simply have to include <Code>baseball_player.h</Code> via the <Code>#include</Code> preprocessing directive. That gives us access to its definition. Moreover, it guarantees that the definition will be token-for-token identical across all translation units that use it since <Code>#include</Code> is little more than a glorified copy-paste tool.</P>

      <P>To <Bold>instantiate</Bold> a structure type, meaning to declare a variable whose type is a structure type, declare the variable like any other variable, except you <Ul>must</Ul> prefix the name of the structure type with the keyword <Code>struct</Code> (this is required in C, but not C++). For example:</P>

      <CBlock fileName="play_baseball.c">{
`#include <stdio.h>

#include "baseball_player.h"

int main(void) {
        // Notice: the data type of samantha is
        // 'struct baseball_player', rather than simply
        // 'baseball_player'.
        struct baseball_player samantha;
}
`
      }</CBlock>

      <P>When a structure type is instantiated, the resulting object is often referred to as a <Bold>structure</Bold>. For example, <Code>baseball_player</Code> is a structure type, and the data type of <Code>samantha</Code> is <Code>baseball_player</Code>, so we might say that <Code>samantha</Code> is a structure.</P>

      <P><Code>samantha</Code>, being a structure of type <Code>struct baseball_player</Code>, has two fields / member variables inside it: <Code>birth_year</Code>, which is an <Code>int</Code>, and <Code>batting_average</Code>, which is a <Code>double</Code>. To access these fields, use the <Bold>member-access operator</Bold>, also known as the <Bold>dot operator</Bold>, just like in Python, C++, and many other programming languages:</P>

      <CBlock fileName="play_baseball.c">{
`#include <stdio.h>

#include "baseball_player.h"

int main(void) {
        // Notice: the data type of samantha is
        // 'struct baseball_player', rather than simply
        // 'baseball_player'.
        struct baseball_player samantha;

        // Access samantha's birth_year field and initialize it
        // to 1998
        samantha.birth_year = 1998;

        // Access samantha's batting_average field and
        // initialize it to 0.28
        samantha.batting_average = 0.28;

        // Print samantha's information to the terminal
        printf(
                "Player's birth year: %d | Player's batting "
                        "average: %.2f\\n",
                samantha.birth_year,
                samantha.batting_average
        );
}
`
      }</CBlock>

      <P>Here's the output so far:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o play_baseball play_baseball.c 
$ valgrind ./play_baseball 
==2838237== Memcheck, a memory error detector
==2838237== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2838237== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2838237== Command: ./play_baseball
==2838237== 
Player's birth year: 1998 | Player's batting average: 0.28
==2838237== 
==2838237== HEAP SUMMARY:
==2838237==     in use at exit: 0 bytes in 0 blocks
==2838237==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==2838237== 
==2838237== All heap blocks were freed -- no leaks are possible
==2838237== 
==2838237== For lists of detected and suppressed errors, rerun with: -s
==2838237== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>It's not possible to print an entire structure to the terminal all at once via <Code>printf</Code>. You must use the supported format specifiers (<Code>%d</Code>, <Code>%f</Code>, <Code>%ld</Code>, <Code>%p</Code>, etc) to print the primitive composed members one at a time.</P>

      <P>Importantly, the fields of a structure are uninitialized by default. After all, the moment a structure is declared, so too are its fields, and, as we know, primitive variables are uninitialized by default in C.</P>

      <P>However, there's a nifty syntax that you can use to <Bold>zero-initialize</Bold> a structure and all its fields the moment it's declared. It looks the same as zero-initialization of an array:</P>

      <CBlock fileName="play_baseball.c" highlightLines="{9-13}">{
`#include <stdio.h>

#include "baseball_player.h"

int main(void) {
        // Notice: the data type of samantha is
        // 'struct baseball_player', rather than simply
        // 'baseball_player'.
        // = {0} initializes all primitive fields to their
        // respective types' zero values (e.g., double fields
        // are initialized to 0.0, int fields to 0, char fields
        // to '\\0', and so on).
        struct baseball_player samantha = {0};

        // Access samantha's birth_year field and initialize it
        // to 1998
        samantha.birth_year = 1998;

        // Access samantha's batting_average field and
        // initialize it to 0.28
        samantha.batting_average = 0.28;

        // Print samantha's information to the terminal
        printf(
                "Player's birth year: %d | Player's batting "
                        "average: %.2f\\n",
                samantha.birth_year,
                samantha.batting_average
        );
}
`
      }</CBlock>

      <P>This is often useful when you want some or all of the fields of the structure to be set to zero, perhaps to be modified later (or perhaps permanently, as is common for option flag fields).</P>

      <P>It's also possible to initialize the fields of a structure using a full brace-enclosed initializer list, similar to initializing the elements of a small array. However, if you do this, you should use the C99-style designated initialization (as opposed to the simpler but less robust C89-style sequential initialization). The syntax is as follows:</P>

      <SyntaxBlock>{
`struct <type> <name> = {<initializer 1>, <initializer 2>, ..., <initializer N>}`
      }</SyntaxBlock>

      <P>Replace <Code>{'<type>'}</Code> with the name of the structure type, <Code>{'<name>'}</Code> with the name of the structure, and each <Code>{'<initializer X>'}</Code> with a designated field initializer. The syntax for a given designated field initializer is as follows:</P>

      <SyntaxBlock>{
`.<field> = <value>`
      }</SyntaxBlock>

      <P>Replace <Code>{'<field>'}</Code> with the name of the field and <Code>{'<value>'}</Code> with the value that you'd like to initialize the field to.</P>

      <P>Here's an example:</P>

      <CBlock fileName="play_baseball.c" highlightLines="{6-23}">{
`#include <stdio.h>

#include "baseball_player.h"

int main(void) {
        struct baseball_player samantha = {
                .birth_year = 1998,
                .batting_average = 0.28
        };

        // For the curious reader, the C89-style sequential
        // initialization would look like this:
        // struct baseball_player samantha = {
        //      1998,
        //      0.28
        // };
        // Sequential initialization maps the values in the
        // list to the fields of the structure type according
        // to the order in which they're declared in the
        // structure type definition. Hence, sequential
        // initialization is sensitive to field declaration
        // ordering. C99-style designated initialization is
        // not sensitive to field declaration ordering.

        // Print samantha's information to the terminal
        printf(
                "Player's birth year: %d | Player's batting "
                        "average: %.2f\\n",
                samantha.birth_year,
                samantha.batting_average
        );
}
`
      }</CBlock>

      <P>It prints the same thing as before.</P>

      <SectionHeading id="pointers-to-structures">Pointers to structures</SectionHeading>

      <P>You can create pointers that store address of structures. Just as a pointer of type <Code>int*</Code> can store the memory address of a variable of type <Code>int</Code>, a pointer of type <Code>struct baseball_player*</Code> can store the memory address of a variable of type <Code>struct baseball_player</Code>. For example:</P>

      <CBlock fileName="play_baseball.c" highlightLines="{11-14}">{
`#include <stdio.h>

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

        // Print samantha's information to the terminal
        printf(
                "Player's birth year: %d | Player's batting "
                        "average: %.2f\\n",
                samantha.birth_year,
                samantha.batting_average
        );
}
`
      }</CBlock>

      <P>Given the above program, suppose you want to access the <Code>batting_average</Code> field of the baseball player structure that <Code>ptr</Code> points to (currently <Code>samantha</Code>). To do that, you must 1) dereference <Code>ptr</Code> via the dereference operator (<Code>*</Code>) to access the underlying baseball player structure that it points to, and then 2) use the member access operator (<Code>.</Code>) on that dereferenced structure to access its contained <Code>batting_average</Code> field. However, the dereference operator has lower operator precedence than the member access operator, so you must put the dereference operation in parentheses so that the dereference occurs before the member access, else the compiler will issue an error.</P>

      <P>For example:</P>

      <CBlock fileName="play_baseball.c" highlightLines="{16-23}">{
`#include <stdio.h>

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

        // Print information about the baseball player that
        // ptr points to (samantha, in this case)
        printf(
                "Player's birth year: %d | Player's batting "
                        "average: %.2f\\n",
                (*ptr).birth_year, // dereference, THEN access
                (*ptr).batting_average
        );
}
`
      }</CBlock>

      <P>Evidently, Dennis Ritchie found this syntax to be too verbose, so he created another operator to make things simpler: the <Bold>arrow operator</Bold>. It's a minus sign followed by a greater than sign, with no spaces in between (<Code>{'->'}</Code>). To use it, put it in between a pointer to a structure on the left and the name of a field on the right. It will dereference the pointer on the left, and then access the contained field whose name is on the right. That is, we can rewrite the above code like so:</P>

      <CBlock fileName="play_baseball.c" highlightLines="{21-22}">{
`#include <stdio.h>

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

        // Print information about the baseball player that
        // ptr points to (samantha, in this case)
        printf(
                "Player's birth year: %d | Player's batting "
                        "average: %.2f\\n",
                ptr->birth_year, // dereferences, THEN accesses
                ptr->batting_average
        );
}
`
      }</CBlock>

      <P>No parentheses, no dots, no asterisks. Just an arrow. But it does the same thing as before.</P>

      <SectionHeading id="structures-on-the-heap">Structures on the heap</SectionHeading>

      <P>Structures can be allocated on the heap, be it individually or in an array. We'll cover arrays of structures in a bit, so let's just focus on allocating a <It>single</It> structure on the heap for now. It works exactly as you might expect:</P>

      <CBlock fileName="heap_structures.c">{
`#include <stdlib.h>
#include <stdio.h>

#include "baseball_player.h"

int main(void) {
        // Again, notice the 'struct' keyword before
        // 'baseball_player' each time we reference the
        // structure type, including in the sizeof() operator
        struct baseball_player* player = malloc(
                sizeof(struct baseball_player)
        );
        if (!player) {
                printf("Error on malloc()\\n");
                exit(1);
        }

        // 'player' is a pointer to an allocated block of bytes
        // on the heap that's big enough to fit a single
        // baseball_player structure. We can dereference it
        // and use it as if it were a baseball_player structure.
        // Let's initialize its fields:
        player->birth_year = 1998;
        player->batting_average = 0.28;

        // And perhaps print those field values
        printf(
                "Player's birth year: %d | Player's batting "
                        "average: %.2f\\n",
                player->birth_year,
                player->batting_average
        );

        // Now, suppose we want to free it from the heap.
        // We can free it just like we free anything else
        // from the heap: call the free function, and supply
        // the pointer that points to it.
        free(player);
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`(env) guyera@flip4:structure-types$ gcc -g -Wall -o heap_structure heap_structure.c 
(env) guyera@flip4:structure-types$ valgrind ./heap_structure 
==2873676== Memcheck, a memory error detector
==2873676== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2873676== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2873676== Command: ./heap_structure
==2873676== 
Player's birth year: 1998 | Player's batting average: 0.28
==2873676== 
==2873676== HEAP SUMMARY:
==2873676==     in use at exit: 0 bytes in 0 blocks
==2873676==   total heap usage: 2 allocs, 2 frees, 1,040 bytes allocated
==2873676== 
==2873676== All heap blocks were freed -- no leaks are possible
==2873676== 
==2873676== For lists of detected and suppressed errors, rerun with: -s
==2873676== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>In essence, if a structure is on the heap, so are its fields. Or, I guess another way of thinking about it is that a structure simply <It>is</It> a collection of fields, so allocating a structure on the heap essentially just means allocating a collection of related fields on the heap.</P>

      <P>However, it's of course possible to have a structure that's on the stack wherein one of its (stack-allocated) pointer fields stores the memory address of an object on the heap. In fact, you can even do it the other way around<Emdash/>you can have a structure on the heap wherein one of its (heap-allocated) pointer fields stores the memory address of an object on the stack. Ultimately, it's your responsibility to know where everything is stored in memory (and to free things from the heap when appropriate).</P>

      <SectionHeading id="copying-structures">Copying structures</SectionHeading>

      <P>It's possible to assign one entire structure to another. When you do this, the <Ul>entire structure</Ul> is copied. That is, the values of the structure's fields are copied into the new structure's corresponding fields, one by one.</P>

      <CBlock fileName="play_baseball.c">{
`#include <stdio.h>

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
                        "average: %.2f\\n",
                ptr->birth_year, // dereferences, THEN accesses
                ptr->batting_average
        );
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o play_baseball play_baseball.c 
$ valgrind ./play_baseball 
==2863568== Memcheck, a memory error detector
==2863568== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2863568== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2863568== Command: ./play_baseball
==2863568== 
Player's birth year: 1998 | Player's batting average: 0.28
==2863568== 
==2863568== HEAP SUMMARY:
==2863568==     in use at exit: 0 bytes in 0 blocks
==2863568==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==2863568== 
==2863568== All heap blocks were freed -- no leaks are possible
==2863568== 
==2863568== For lists of detected and suppressed errors, rerun with: -s
==2863568== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Indeed, <Code>joe</Code>'s birth year is 1998, and his batting average is 0.28, just like <Code>samantha</Code>'s.</P>

      <P>(Even with deep structural compositions, like structures within structures within structures, the same rule applies: copying the outer structure effectively copies all the inner structures via direct assignment, which effectively copies all <It>their</It> inner structures, and so on, until you get all the way down to the primitives).</P>

      <P>Importantly, if one of a structure's fields is a pointer that stores the memory address of some object, then when the structure is copied, that <Ul>pointer</Ul> (i.e., memory address) is copied into the corresponding field of the new structure. The object that the pointer <It>points to</It> is <Ul>not</Ul> copied. This idea of copying pointers but not the objects they point to is referred to as a <Bold>shallow copy</Bold>. The alternative is a <Bold>deep copy</Bold>. Deep copying must be facilitated manually in C.</P>

      <P>For example:</P>

      <CBlock fileName="copying_structures.c">{
`#include <string.h>
#include <stdlib.h>
#include <stdio.h>

// It's usually best to put structure type definitions in
// header files, but this is just a short demonstration
struct weird_structure {
        int* ptr;
};

int main(void) {
        struct weird_structure x;
        x.ptr = malloc(sizeof(int) * 10);
        if (!x.ptr) {
                printf("Error on malloc()\\n");
                exit(1);
        }

        // x.ptr points to a buffer (e.g., array) the size of 
        // ten integers. That buffer is on the heap.

        struct weird_structure y = x;

        // y is a shallow copy of x. In other words,
        // y.ptr is a copy of x.ptr (i.e., y.ptr == x.ptr).
        // Hence, they store the exact same addresses. Changing
        // the elements of the array that y.ptr points to also
        // changes the elements of the array that x.ptr points
        // to.
        for (size_t i = 0; i < 10; ++i) {
                y.ptr[0] = 718;
        }

        printf("%d\\n", x.ptr[0]); // Prints 718

        // Suppose we want a deep copy of x. We can do that
        // manually.
        struct weird_structure z;

        // We want z.ptr to point to its own array, but we
        // want that array's values to be copies of the values
        // in the array that x.ptr points to (i.e., a deep
        // copy).
        z.ptr = malloc(sizeof(int) * 10);
        if (!z.ptr) {
                printf("Error on malloc()\\n");
                exit(1);
        }

        // To copy the elements of the array, we can either
        // use a for loop or memcpy. Let's go with memcpy.
        memcpy(z.ptr, x.ptr, sizeof(int) * 10);

        printf("%d\\n", z.ptr[0]); // Prints 718

        // z is a DEEP COPY of x in that its pointer fields
        // point to their own, separate memory, but the values
        // in that memory are copies of the values in the
        // memory that x's pointer fields point to.
        // We can therefore change the values in the array
        // that z.ptr points to without changing the values in
        // the array that x.ptr and y.ptr point to.
        z.ptr[0] = 12;

        printf("%d\\n", z.ptr[0]); // Prints 12
        printf("%d\\n", x.ptr[0]); // Prints 178

        // Free the array that x.ptr points to (which is also
        // the array that y.ptr points to)
        free(x.ptr);

        // DO NOT call free(y.ptr) as well. That'd be a
        // double-free.

        // Free the completely separate array that z.ptr points
        // to
        free(z.ptr);
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o copying_structures copying_structures.c 
$ valgrind ./copying_structures 
==2867635== Memcheck, a memory error detector
==2867635== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2867635== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2867635== Command: ./copying_structures
==2867635== 
718
718
12
718
==2867635== 
==2867635== HEAP SUMMARY:
==2867635==     in use at exit: 0 bytes in 0 blocks
==2867635==   total heap usage: 3 allocs, 3 frees, 1,104 bytes allocated
==2867635== 
==2867635== All heap blocks were freed -- no leaks are possible
==2867635== 
==2867635== For lists of detected and suppressed errors, rerun with: -s
==2867635== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <SectionHeading id="const-structures"><Code>const</Code>-qualified structures</SectionHeading>

      <P>A structure can be qualified as <Code>const</Code>. Such structures' fields must be initialized when they're declared (e.g., via brace-enclosed initializers) since, once declared, the fields of a <Code>const</Code>-qualified structure may not be modified:</P>

      <CBlock showLineNumbers={false}>{
`const struct baseball_player samantha = {
        .birth_year = 1998,
        .batting_average = 0.28
};

// This would generate a compiler error
samantha.birth_year = 1999;`
      }</CBlock>

      <P>Alternatively, you could initialize the structure to the <Link href="#structures-and-functions">return value of a function call</Link> (e.g., <Code>const struct baseball_player samantha = create_baseball_player()</Code>).</P>

      <SectionHeading id="structures-and-functions">Structures and functions</SectionHeading>

      <P>It's possible to pass a structure as an argument to a function. It's also possible to return a structure from a function<Emdash/>even one that was declared as an automatic variable and therefore allocated in the function's stack frame. Structures are similar to arrays in some manners (e.g., they're both aggregate types), but structures do <Ul>not</Ul> decay to their base addresses. When a structure is passed as an argument to a function, or returned from a function, the entire structure is copied in the exact same manner as in direct assignment.</P>

      <P>(Technically, the compiler is often able to avoid copying structures when they're returned from functions. In C++, this is known as return-value optimization, or named return-value optimization, depending on the context. It's a form of copy elision. These terms are not official in the C standard, but they fall under C's "as-if" rule, so such optimizations are standards-compliant and indeed performed by many C compilers.)</P>

      <P>Before I show you an example, a note on code organization: if you have one or more functions that work closely with a particular structure type, it's common to prototype those functions in the same header file as the one containing the structure type's definition. That way, whenever you include that header file, you get access to the structure type definition and all the functions that work closely with that structure type.</P>

      <P>Now, here's an example. Let's start with an updated header file that provides some function prototypes:</P>

      <CBlock fileName="baseball_player.h">{
`#ifndef BASEBALL_PLAYER_H
#define BASEBALL_PLAYER_H

// Every baseball player "has a" birth year and a batting
// average
struct baseball_player {
        int birth_year;
        double batting_average;
};

// Below are prototypes of functions that work closely with
// baseball player structures. Notice that these prototypes
// are BELOW the structure type definition. That's because these
// prototypes reference the structure type definition, so its
// definition (or at least a forward declaration) must appear
// above these lines within the current translation unit.


// Structure type fields cannot be given default values, but
// you CAN simply create a function that allocates, initializes,
// and returns a "default instance" of a given structure
// type. (Don't worry about the cost of the return value's
// copy; it'll likely be elided by the compiler anyways.)
// Again, notice 'struct' before 'baseball_player'.
struct baseball_player create_default_baseball_player(void);

// You can also create functions to, say, print structures.
// That's nice since there's no format specifier for complex
// structures. (You MAY need to worry about the cost of the
// argument copy. More on that shortly.)
void print_baseball_player(struct baseball_player p);

#endif
`
      }</CBlock>

      <P>Next, we need to define those functions somewhere. As I've said in the past, a common pattern is to create a <Code>.c</Code> file for each corresponding <Code>.h</Code> file. In the <Code>.c</Code> file, you define the functions prototyped in the <Code>.h</Code> file. So let's create <Code>baseball_player.c</Code>, in which we'll define these functions:</P>

      <CBlock fileName="baseball_player.c">{
`#include <stdio.h> // Needed for printf

// This file will define the functions prototyped in
// baseball_player.h. Those functions work closely with the
// baseball_player structure type. Hence, this translation unit
// needs access to the definition of the baseball_player
// structure type. A simple way to achieve that is by including
// baseball_player.h directly here within baseball_player.c.
// This is a common pattern.
#include "baseball_player.h"

struct baseball_player create_default_baseball_player(void) {
        // The "default" baseball player will have a birth
        // year of 1970 and a batting average of 0.2
        struct baseball_player player = {
                .birth_year = 1970,
                .batting_average = 0.2
        };
        return player;
}

void print_baseball_player(struct baseball_player p) {
        printf(
                "Player's birth year: %d | Player's batting "
                        "average: %.2f\\n",
                p.birth_year,
                p.batting_average
        );
}
`
      }</CBlock>

      <P>Finally, here's a small <Code>main</Code> function to demonstrate the use of these functions:</P>

      <CBlock fileName="structures_and_functions.c">{
`#include "baseball_player.h"

int main(void) {
        // Create a default baseball player
        struct baseball_player my_player =
                create_default_baseball_player();

        // Print their information to the terminal
        print_baseball_player(my_player);
}
`
      }</CBlock>

      <P>This program consists of two <Code>.c</Code> files: <Code>structures_and_functions.c</Code>, and <Code>baseball_player.c</Code>. We must specify both of those files when building the executable. Here's the output:</P>

      <TerminalBlock copyable={false}>{
`(env) guyera@flip4:structure-types$ gcc -g -Wall -o structures_and_functions structures_and_functions.c baseball_player.c
(env) guyera@flip4:structure-types$ valgrind ./structures_and_functions 
==2882076== Memcheck, a memory error detector
==2882076== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2882076== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2882076== Command: ./structures_and_functions
==2882076== 
Player's birth year: 1970 | Player's batting average: 0.20
==2882076== 
==2882076== HEAP SUMMARY:
==2882076==     in use at exit: 0 bytes in 0 blocks
==2882076==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==2882076== 
==2882076== All heap blocks were freed -- no leaks are possible
==2882076== 
==2882076== For lists of detected and suppressed errors, rerun with: -s
==2882076== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>I glossed over something very important: although you usually don't need to worry about the performance cost of returned structures being copied (e.g., due to return-value optimization eliding such copies), you often <It>do</It> need to worry about the performance cost of argument structures being copied. Indeed, as I said a moment ago, when a structure is passed as an argument to a function, the entire structure is copied. If the structure is large (e.g., if it contains many fields, or a few large fields, such as other structures or entire arrays as fields), then copying the structure can take a lot of time and memory. And as we know, time and space are the two things that every programmer loves to optimize.</P>

      <P>An <It>extremely</It> common pattern to avoid this cost is to prevent the copy altogether by passing structures' memory addresses as arguments rather than passing the structures themselves. That is, although structures don't decay to their base addresses, we can <It>intentionally</It> pass their base addresses around to avoid the costs of copies.</P>

      <P>However, if done naively, this has one obvious downside, which is that the function receiving the structure's memory address as an argument is then capable of modifying the fields of the underlying structure that its parameter points to by dereferencing it (via <Code>*</Code>, or <Code>{'->'}</Code>, or <Code>[0]</Code>, etc). In most cases, you don't want that<Emdash/>the function is simply receiving the structure as an <It>input</It>, so it has no business modifying it. Hence, to forbid modifications of the underlying structure's fields (thereby preventing bugs and making the function's contract clearer), the parameter is often <Code>const</Code>-qualified. Specifically:</P>

      <Itemize>
        <Item>If a function receives a structure of type <Code>T</Code> as an argument and does <Ul>not</Ul> need to modify the structure, then the parameter is usually typed as <Code>const struct T*</Code> (a pointer to a constant structure of type <Code>T</Code>).</Item>
        <Item>If a function receives a structure of type <Code>T</Code> as an argument and <Ul>does</Ul> need to modify the structure, then the parameter is usually typed as <Code>struct T*</Code> (no <Code>const</Code> qualification).</Item>
      </Itemize>

      <P>Our <Code>print_baseball_player</Code> function accepts a baseball player as an argument and does <Ul>not</Ul> need to modify it. Hence, we should probably follow this conventional wisdom and declare the parameter as <Code>const struct baseball_player*</Code> (instead of simply <Code>baseball_player</Code>). This will prevent an entire baseball player structure argument from being copied whenever the function is called, saving time and space.</P>

      <P>Here's the updated header file:</P>

      <CBlock fileName="baseball_player.h" showLineNumbers={false} highlightLines="{7}" copyable={false}>{
`... // Some previous code omitted for brevity

// You can also create functions to, say, print structures.
// That's nice since there's no format specifier for complex
// structures. (You MAY need to worry about the cost of the
// argument copy. More on that shortly.)
void print_baseball_player(const struct baseball_player* p);

... // Some previous code omitted for brevity`
      }</CBlock>

      <P>Here's the updated <Code>baseball_player.c</Code> file:</P>

      <CBlock copyable={false} showLineNumbers={false} highlightLines="{3,7-8}">{
`... // Some previous code omitted for brevity

void print_baseball_player(const struct baseball_player* p) {
        printf(
                "Player's birth year: %d | Player's batting "
                        "average: %.2f\\n",
                p->birth_year,
                p->batting_average
        );
}

... // Some previous code omitted for brevity`
      }</CBlock>

      <P>And here's the updated <Code>structures_and_functions.c</Code>:</P>

      <CBlock fileName="structures_and_functions.c" highlightLines="{9}">{
`#include "baseball_player.h"

int main(void) {
        // Create a default baseball player
        struct baseball_player my_player =
                create_default_baseball_player();

        // Print their information to the terminal
        print_baseball_player(&my_player);
}
`
      }</CBlock>

      <P>The program does the same thing as before, but it's a bit more efficient. When calling <Code>print_baseball_player</Code>, only the <It>address</It> of <Code>my_player</Code> is copied, rather than copying the entire structure itself. Moreover, by <Code>const</Code>-qualifying the pointer parameter, the <Code>print_baseball_player</Code> function still isn't capable of modifying the <Code>my_player</Code> structure declared in the  <Code>main</Code> function (attempting to do so would invoke compiler errors, which is good<Emdash/>a simple printing function should not <It>be able</It> to modify the objects that it prints).</P>

      <P>(Technically, our <Code>baseball_player</Code> structure type is small enough that passing addresses rather than entire structures may not actually be more efficient. But structure types tend to grow over time as the application becomes more complex and needs to deal with more and more data, so it's a good idea to just design your functions right from the beginning to accept addresses rather than entire structures.)</P>

      <SectionHeading id="structures-of-arrays">Structures of arrays</SectionHeading>

      <P>Structures can contain arrays. There are two ways to accomplish this, and they have different tradeoffs: a) declare a field as an array, just like you would a stack-allocated automatic function-local array variable; or b) declare a field as a pointer, and explicitly initialize it to store the base address of a separately allocated array (usually a dynamic array).</P>

      <P>Let's start with option a). Here's an example:</P>

      <CBlock showLineNumbers={false}>{
`struct person {
        char name[256];
};`
      }</CBlock>

      <P>Now, the <Code>name</Code> field's declaration looks a lot like a stack-allocated array variable, but there's some nuance here. As I mentioned recently, whether the fields of a structure are stored on the stack versus the heap depends entirely on how the structure itself is allocated. If we allocate a <Code>person</Code> structure on the stack, then their <Code>name</Code> array will be on the stack. If we allocate it on the heap, then their <Code>name</Code> array will be on the heap. So while this field declaration syntax <It>looks</It> like stack allocation, it's not. It simply states that every <Code>person</Code> has an array of 256 characters called <Code>name</Code>. It does not state where that array will be located in memory. And maybe that makes sense; the above code doesn't allocate <It>anything</It>. It only defines a data type. No memory is allocated until that data type is instantiated, which will happen elsewhere.</P>

      <P>The major downside to this arrays-as-structure-fields strategy (option a) is that it doesn't support variable-length arrays in <It>any</It> way. That's to say, the value between the square brackets in the <Code>name</Code> field's declaration above <Ul>must</Ul> be a hardcoded, compile-time constant (e.g., <Code>256</Code>, as above). It can't be any sort of variable. At most, it can be a preprocessor macro. Indeed, even if we intend to strictly allocate <Code>person</Code> structures on the heap, and therefore the <Code>name</Code> arrays of these <Code>person</Code> structures will <It>also</It> be on the heap (which <It>famously</It> supports variably-sized arrays), we <It>still</It> can't decide those arrays' sizes dynamically. Option a) simply doesn't support this.</P>

      <P>There are a few reasons for this. Primarily, every instance of a given structure type must be of the same size (in bytes, in memory). That's to say, if you have two different <Code>person</Code> structures, those two structures must occupy the same amount of bytes in memory. This is a strict requirement imposed by the compiler; it needs to know the (fixed, static) sizes of structure types so that it can generate appropriate code to allocate them, access their elements, decide their instances' stack offsets, and so on, even when they cross function boundaries (e.g., when you pass them as arguments or return them to and from functions).</P>

      <P>So option a) isn't very flexible. It only really works when a fixed, static array size is appropriate. That often isn't the case.</P>

      <P>Now let's discuss option b). It's much more flexible, and it's honestly easier to explain, anyways: just let one of the structure type's fields be a pointer, and then when you create an actual structure of that type, create a separate array as well, and then initialize the pointer field within the structure to store the base address of that array. To avoid dangling pointers (especially in case the structure, and therefore its pointer field, is ever copied), the separately allocated array is often stored on the heap.</P>

      <P>Okay, I skipped one small detail: because this strategy allows different instances of the given structure type to contain pointers that point to different arrays of different sizes, it's important to keep track of the sizes of the arrays that these pointers point to. So, in the structure type definition, alongside the pointer field that stores the base address of an array, you'll usually <It>also</It> declare a <Code>size_t</Code> field that records the size of that array (e.g., its number of elements).</P>

      <P>Keep in mind: if you intend to strictly allocate the arrays that these pointer fields point to on the <It>heap</It> (as is often the case), then you must free them when you're done with them. This usually means freeing the arrays just before the structure containing the pointer that points to it falls out of scope.</P>

      <P>In general, whenever a structure type contains pointers to heap-allocated data, it's extremely common to create two functions to assist with the allocation and freeing of that data. For example, if the <Code>person</Code> structure type contains a pointer field <Code>char* name</Code> that stores the base address of the array storing the given person's name (e.g., as a C string), and you intend for those arrays to generally go on the heap, then it might make sense to define a <Code>create_person</Code> function as well as a <Code>free_person</Code> function that respectively manage the allocation and freeing of those arrays (and the initialization / teardown of <Code>person</Code> structures in general).</P>

      <P>The following is a complete example program that uses option b). First, a header file, <Code>person.h</Code>:</P>

      <CBlock fileName="person.h">{
`// Option b: In the structure type, store a pointer that points
// to the beginning of an array, which is allocated completely
// separately (probably on the heap somewhere)
struct person {
        // Base address of char array containing person's name
        // as a C string
        char* name;

        // Year in which person was born
        int birth_year;
};

// To complete the example, let's create a function that makes
// it easy to initialize a person structure given a name and
// birth year. This function will allocate a dynamic array of
// characters and copy the given name C string into it, and then
// store the base address of that dynamic array in the newly
// created person structure's name field. It will also copy the
// birth_year parameter value into the birth_year field of the
// person structure, and finally return the person structure.
struct person create_person(const char* name, int birth_year);

// And a function that prints a person's info to the terminal
void print_person(const struct person* p);

// And a function to free the dynamic memory backing the pointer
// fields (name, in this case)
void free_person(const struct person* p);
`
      }</CBlock>

      <P>Next, <Code>person.c</Code>, which implements the three functions prototyped in <Code>person.h</Code>:</P>

      <CBlock fileName="person.c">{
`#include <string.h>
#include <stdlib.h>
#include <stdio.h>

#include "person.h"

struct person create_person(const char* name, int birth_year) {
        // The name parameter points to a C string, but who
        // knows where that C string is stored? It might be
        // a string literal, stored in the readonly section
        // of the data segment. So, when we actually create the
        // person structure here, we should allocate a
        // completely separate char array and copy the name into
        // it. We'll put it on the heap (else it would fall out
        // of scope at the end of this function, and the
        // returned person structure would contain a dangling
        // pointer).
        char* name_on_heap =
                malloc(sizeof(char) * (strlen(name) + 1));
        strcpy(name_on_heap, name);

        // Now we create the person structure, copying the
        // address sstored in name_on_heap into their name
        // pointer field (and copying the birth_year parameter
        // value into their birth_year field).
        struct person p;
        p.name = name_on_heap;
        p.birth_year = birth_year;

        // Done. Return the person structure.
        return p;
}

void print_person(const struct person* p) {
        printf(
                "Name: %s | birth year: %d\\n",
                p->name,
                p->birth_year
        );
}

void free_person(const struct person* p) {
        // Free the dynamic array that p.name points to.
        // Important: This REQUIRES that p.name point to
        // a heap-allocated array. The create_person() function
        // always allocates that array on the heap. But of
        // course, it's possible to go out of your way to break
        // this assumption, in which case the below line of code
        // would invoke undefined behavior.
        free(p->name);
}`
      }</CBlock>

      <P>Finally, <Code>structures_of_arrays.c</Code>, which contains a small program to showcase these functions and the <Code>person</Code> structure type:</P>

      <CBlock fileName="structures_of_arrays.c">{
`#include "person.h"

int main() {
        struct person p = create_person("Aditya", 2001);
        print_person(&p);
        free_person(&p);
}
`
      }</CBlock>

      <P>And here's the output:</P>

      <TerminalBlock copyable={false}>{
`(env) guyera@flip1:structure-types$ gcc -g -Wall -o structures_of_arrays structures_of_arrays.c person.c 
(env) guyera@flip1:structure-types$ valgrind ./structures_of_arrays 
==3358191== Memcheck, a memory error detector
==3358191== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==3358191== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==3358191== Command: ./structures_of_arrays
==3358191== 
Name: Aditya | birth year: 2001
==3358191== 
==3358191== HEAP SUMMARY:
==3358191==     in use at exit: 0 bytes in 0 blocks
==3358191==   total heap usage: 2 allocs, 2 frees, 1,031 bytes allocated
==3358191== 
==3358191== All heap blocks were freed -- no leaks are possible
==3358191== 
==3358191== For lists of detected and suppressed errors, rerun with: -s
==3358191== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Now, suppose you want to create a copy of a <Code>person</Code> structure. As explained earlier, doing this via the assignment operator will yield a shallow copy<Emdash/>the new structure will contain a <Code>name</Code> field that stores the same address as that of the original structure's <Code>name</Code> field. If that's not what you want<Emdash/>if you would instead prefer a deep copy<Emdash/>then it'd probably be a good idea to create another function to facilitate that. For example, in addition to <Code>create_person</Code> and <Code>free_person</Code>, we could have <Code>copy_person</Code>:</P>

      <CBlock showLineNumbers={false}>{
`struct person copy_person(const struct person* person_to_copy) {
        struct person copy;
        copy.birth_year = person_to_copy->birth_year;
        
        // For the dynamic array, allocate a new array and copy the
        // contents rather than just copying the pointer.
        copy.name = malloc(
                sizeof(char) * (strlen(person_to_copy->name) + 1)
        );
        strcpy(copy.name, person_to_copy->name);

        return copy;
}`
      }</CBlock>

      <P>Calling this function (e.g., <Code>struct person p2 = copy_person(&p)</Code>) will facilitate a deep copy. The returned structure's <Code>name</Code> field will point to its own, completely separate dynamic array with a copy of the <It>contents</It> of the array that the original structure's <Code>name</Code> field points to. Since this is a deep copy, you must remember to free both the original structure's name <It>and</It> the newly copied structure's name (e.g., by additionally calling <Code>free_person(&p2)</Code> when the program is done using <Code>p2</Code>).</P>

      <SectionHeading id="structure-equality">Structure equality</SectionHeading>

      <P>Although the assignment operator can be used to assign one structure to another (which conducts direct member-wise copy operations), the equality operator (<Code>==</Code>) <Ul>cannot</Ul> be used to check if two structures are "equal". It's simply not syntactically legal in C to place the equality operator between two structures.</P>

      <P>So, if you want to be able to compare two structures for "equality", the typical strategy is:</P>

      <Enumerate listStyleType="decimal">
        <Item>Decide what exactly "equality" means for your use case.</Item>
        <Item>Create a function that accepts two structures (via pointers-to-constants) and manually checks for "equality", according to your previously decided definition.</Item>
      </Enumerate>

      <P>For example, perhaps I decide that two <Code>person</Code> structures should be considered "equal" if their <Code>name</Code> arrays contain the same contents. Then I might create a function to check that condition:</P>

      <CBlock showLineNumbers={false}>{
`_Bool people_are_equal(
                const struct person* p1,
                const struct person* p2) {
        if (strcmp(p1->name, p2->name) == 0) {
                return 1;
        }
        return 0;
}
`
      }</CBlock>

      <P>Then I could use it in, say, an if statement, such as <Code>{'if (people_are_equal(&joe, &samantha)) {...}'}</Code></P>

      <SectionHeading id="arrays-of-structures">Arrays of structures</SectionHeading>

      <P>Just as you can create structures that contain arrays, you can create arrays that contain structures. You can do this on the stack or the heap. There's absolutely nothing new about the relevant syntax. It works exactly as you'd expect.</P>

      <P>Below is an example program that creates two arrays of <Code>person</Code> structures, one on the stack and one on the heap. Keep in mind that these <Code>person</Code> structures, in turn, contain pointers to arrays of characters (their <Code>name</Code> fields), which in turn are on the heap. That is, this isn't just an array of structures<Emdash/>it's an "array of structures of arrays". You must keep track of where everything is stored in memory, and make sure to free everything that's allocated on the heap when appropriate. For instance, if you have an array of <Code>person</Code> structures on the heap, and some of those <Code>person</Code> structures have <Code>name</Code> fields that in turn point to arrays of characters on the heap, then all of that heap-allocated data must be freed carefully, one array at a time and in the proper order (this is a bit similar in organization to a dynamic multidimensional array, but there's a structure type in the middle ot serve as an abstraction layer).</P>

      <CBlock fileName="arrays_of_structures.c">{
`#include <stdlib.h>

#include "person.h"

int main() {
        // Create an array of ten person structures on the stack
        struct person stack_people[10];

        // Initialize the first person in the array
        stack_people[0] = create_person("Joseph", 49);

        // Create an array of ten person structures on the heap
        struct person* heap_people =
                malloc(sizeof(struct person) * 10);

        // Initialize the first person in the array
        heap_people[0] = create_person("Joselyn", 32);

        // Free the name of (or whatever dynamic memory is
        // owned by) the two people we just created
        free_person(&stack_people[0]);
        free_person(&heap_people[0]);

        // However, consider that the entire array that
        // heap_people points to is, itself, on the heap. It
        // must be freed in turn. That is, not only do you have
        // to free the name arrays of all the people, you also
        // have to free the people themselves if they were
        // allocated on the heap. Rule of thumb: for every call
        // to malloc, there should be a corresponding call to
        // free.
        free(heap_people);
}
`
      }</CBlock>

      <SectionHeading id="and-so-on">And so on</SectionHeading>

      <P>Structures can contain arrays as fields, and arrays can contain structures. But it goes deeper<Emdash/>as deep as you want it to. Structures can contain structures, or pointers to structures, or pointers to arrays of structures that contain arrays of structures, or <It>whatever you want</It>.</P>

      <P>As you create complex compositions of data types (e.g., structures within arrays within structures), you have to be disciplined in how you deal with all the structures and arrays in question. For example, in the example in the previous section, we had a dynamic array of <Code>person</Code> structures, each of which has a pointer field (<Code>name</Code>) that may in turn point to a dynamic array of characters. To allocate all the memory involved in this composition, we started by allocating the array of <Code>person</Code> structures, and then we used the <Code>create_person</Code> function to allocate all the memory associated with a given person in that array. To free all the involved memory, we did the reverse: we used the <Code>free_person</Code> function to free the memory associated with the individual person structure(s), and then we freed the dynamic array of <Code>person</Code> structures itself.</P>

      <P>In general, here are some tips for dealing with complex data compositions:</P>

      <Itemize>
        <Item>Allocate outside-in. For example, allocate the array of <Code>person</Code> structures, then allocate the arrays of characters for those structures' <Code>name</Code> fields.</Item>
        <Item>Free inside-out. For example, free the people's names before freeing the array of people.</Item>
        <Item>Single responsibility principle: A given function should not be responsible for allocating, freeing, copying, or otherwise processing the entire composition. It should only be responsible for its "layer" of the composition. For example, the <Code>main</Code> function allocates (and frees) the array of <Code>person</Code> structures, but it does <Ul>not</Ul> allocate nor free their names. It relies on <Code>create_person</Code> and <Code>free_person</Code> to do that. To take it further, suppose every person has an array of <Code>pet</Code> structures, each of which has an array of medical records. Then the <Code>create_person</Code> and <Code>free_person</Code> functions should be responsible for allocating and freeing the fields of the given <Code>person</Code> structure, but <Ul>not</Ul> the fields of the <Code>pet</Code> structures within that person's array of pets. Instead, those responsibilities should be delegated to separate functions (e.g., <Code>create_pet</Code> and <Code>free_pet</Code>). And so on.</Item>
        <Item>You have to keep track of what's on the heap and what's on the stack. In most cases, arrays within structures should be stored on the heap, and the structure should simply have a pointer field pointing to that array.</Item>

        <P>You also have to keep track of <Bold>object ownership</Bold>. For example, if a structure has a pointer field that points to an array, are there any <It>other</It> pointers in the program that point to that same array? If so, who's responsible for freeing that array? Does the array "belong" to the structure? Does the structure "own" it? Or does the structure simply "reference" it? In the former case, the array should be freed when the program's done using the structure (e.g., via a function like <Code>free_person</Code>). In the latter case, the array should not necessarily be freed when the structure is freed.</P>
      </Itemize>

      <SectionHeading id="typedef"><Code>typedef</Code></SectionHeading>
      
      <P>C has a keyword, <Code>typedef</Code>, that can be used to create type aliases. Its syntax is as follows:</P>

      <SyntaxBlock>{
`typedef <existing type> <alias name>;`
      }</SyntaxBlock>

      <P>Replace <Code>{'<existing type>'}</Code> with an existing data type, and replace <Code>{'<alias name>'}</Code> with a new name that you'd like to associate with that same type.</P>

      <P>As a simple example, suppose you have a structure type named <Code>person</Code>. Then suppose you write the following line of code:</P>

      <CBlock showLineNumbers={false}>{
`typedef struct person p;`
      }</CBlock>

      <P>From that point on, whenever you would ordinarily type out <Code>struct person</Code>, you can now instead simply type <Code>p</Code>. Indeed, you don't even need to prefix <Code>p</Code> with the <Code>struct</Code> keyword.</P>

      <P>Of course, <Code>p</Code> isn't a very descriptive alias. A more common pattern is to simply define the <Code>person</Code> structure type (e.g., in <Code>person.h</Code>) with a slightly modified syntax that makes use of the <Code>typedef</Code> keyword:</P>

      <CBlock>{
`typedef struct {
        char* name;
} person;`
      }</CBlock>

      <P>This modified syntax technically defines <Code>person</Code> as an alias for a (unnamed) structure type containing a <Code>char* name</Code> field. If you define your structure types like this, then you can simply write <Code>person</Code> instead of <Code>struct person</Code> whenever you'd like to reference the structure type.</P>

      <P>This is a common pattern, but many advise against it. For example, the <Link href="https://www.kernel.org/doc/html/v5.8/process/coding-style.html#:~:text=vps_t">Linux kernel coding style</Link> says that using <Code>typedef</Code> for structure types as above is a mistake since <Code>struct person</Code> is much more descriptive than <Code>person</Code> (the former is how you'd refer to the structure type if defined in the traditional way, whereas the latter is how you'd refer to it if you use the modified <Code>typedef</Code> syntax to define the structure type). That is, all it does it save you some keystrokes (<Code>person</Code> instead of <Code>struct person</Code>), but those keystrokes are <It>expressive</It>, so omitting them discards expressivity.</P>

      <P>(<Code>typedef</Code> can also be used to simplify function pointers and other complex data types.)</P>

      <SectionHeading id="oop-vs-dod">(Optional content) OOP vs DoD</SectionHeading>

      <P>You may have heard the terms "arrays of structures" and "structures of arrays" abbreviated as <Bold>AoS</Bold> and <Bold>SoA</Bold>, respectively. These two ideas are often contrasted with one another as competing methods of storing collections of structured data. For example, suppose you need to store the names and ages of 100 people. You could either a) create a single structure containing two arrays<Emdash/>one of names, and one of ages<Emdash/>or b) create an array containing 100 structures, each of which contains a single name and a single age. Option a) is a structure of arrays (SoA), whereas option b) is an array of structures (AoS).</P>

      <P>AoS is often associated with domain modeling typical of object-oriented programming (OOP) and perhaps even domain-driven design (DDD). For example, a "domain expert" might say that every customer in an ecomerce platform should be characterized by an email address, password, and shopping cart. The programmer (who may also be the domain expert) would then create a <Code>customer</Code> structure type (or class, or similar) that matches that characterization. That is, data that's related in the domain is grouped together in the source code within a common structure (and the behaviors that operate on that data are often organized close by<Emdash/>that's encapsulation). To keep track of all customers, the programmer might create an array of these <Code>customer</Code> structures / objects.</P>

      <P>In contrast, SoA is often associated with <Bold>data-oriented design (DoD)</Bold>. DoD is about organizing software according to the data's layout in memory (rather than its representation's layout in the source code), primarily to optimize cache usage. For example, suppose a physics engine needs to iterate over all the entities in a scene and determine which ones are colliding. The physics engine doesn't need to know anything about the entities except for their geometry information (e.g., where are the entities, how are they oriented, what are their shapes, etc). To optimize spatial locality of this geometry information, thereby improving the physics engine's cache usage when conducting collision detection, a simple idea would be to store all geometry information of all entities in a single contiguous array within the physics engine's structure (SoA). This is in contrast to the common alternative approach of storing the geometry information of each entity in a structure alongside the other information of that entity, and then storing all the entities' objects (or polymorphic pointers to their objects) in a big array (AoS). The primary goal of the former approach (SoA / DoD) is to organize data in memory to optimize cache usage, whereas the primary goal of the latter approach (AoS / OOP) is to organize source code (structure fields, methods, etc) in a way that aligns with the domain model and enables encapsulation (e.g., to control coupling).</P>

      <P>DoD is largely antithetical to OOP since it mostly precludes encapsulation and generally offers few mechanisms to control coupling. However, the performance benefits may be worth it for certain systems in certain applications. This is one reason why many game engines have introduced archetypal entity component systems (ECS)<Emdash/>a design pattern that implements SoA to store components (attributes) of game entities, improving spatial locality and enabling linear component access by various performance-critical systems of the game engine.</P>

      <P>(That said, the performance benefits of archetypal ECS are theoretical, and theory doesn't always map to reality. <Link href="https://moonside.games/posts/archetypal-ecs-considered-harmful/">Here's</Link> a relevant case study I enjoyed reading. As always, if you really want to optimize, the proper thing to do is profile and benchmark.)</P>

    </>
  )
}

export default async function Page({ params }: any) {
  return (
    <>
      <div className={`w-[55rem] max-w-[100%] mx-auto pt-20 pb-20 px-4 ${inter.className} text-[1.25rem] leading-9`}>
        <TitleBlock title={sourcesByPathName[PATH_NAME].pageTitle} author="Alex Guyer" email="guyera@oregonstate.edu"/>
        <LectureNotes allPathData={sourcesByNamedIdentifier}/>
      </div>
    </>
  )
}
