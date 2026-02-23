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

import ArrayDiagram from './assets/array-diagram.png'
import ArrayDiagramDarkMode from './assets/array-diagram-dark-mode.png'
import JaggedArrayDiagram from './assets/jagged-array-diagram.png'
import JaggedArrayDiagramDarkMode from './assets/jagged-array-diagram-dark-mode.png'

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
        <Item><Link href="#double-pointers">Double-pointers</Link></Item>
        <Item><Link href="#dynamic-multidimensional-arrays">Dynamic, noncontiguous multidimensional arrays</Link></Item>
        <Item><Link href="#freeing">Freeing dynamic noncontiguous multidimensional arrays</Link></Item>
        <Item><Link href="#passing-to-functions">Passing noncontiguous multidimensional arrays to functions</Link></Item>
        <Item><Link href="#jagged-arrays">Jagged arrays</Link></Item>
        <Item><Link href="#performance-implications">Performance implications</Link></Item>
      </Itemize>

      <SectionHeading id="double-pointers">Double-pointers</SectionHeading>
        
      <P>As you've seen many times by now, it's possible to create pointers that point to pointers. That is, pointers that store addresses of other pointers. An example would be a <Code>char**</Code> value, which possibly stores the address of a <Code>char*</Code> variable (which, in turn, possibly stores the address of a <Code>char</Code> variable). Such pointers are sometimes referred to as "double-pointers", not to be confused with pointers of type <Code>double*</Code> (i.e., pointers to values of type <Code>double</Code>).</P>

      <P>For example, the first argument to <Code>getline</Code> is the address of a <Code>char*</Code> variable. <Code>getline</Code> then updates the underlying <Code>char*</Code> variable to store the base address of an array of characters containing a line of text represented as a C string that was read from the target input stream. That's to say, the data type of the first parameter of <Code>getline</Code> is <Code>char**</Code> (the address of a <Code>char*</Code> variable). That's a double-pointer.</P>

      <P>But, more generally, you can create double-pointers whenever you want by simply using the address-of operator (<Code>&</Code>) on a pointer:</P>

      <CBlock fileName="doublepointers.c">{
`#include <stdio.h>

int main(void) {
        int x;

        int* p = &x;

        // p is a pointer. It stores the memory address of x
        // (i.e., it "points to" x).

        int** p2 = &p;

        // p2 is a "double-pointer". It stores the memory address
        // of p (i.e., it "points to" p).

        // *p2 is the thing that p2 points to. In other words,
        // *p2 is simply p.

        int y;
        *p2 = &y; // Equivalently: p = &y;

        // p now stores the address of y (i.e., it "points to" y).

        *p = 8; // Equivalently: y = 8;

        // y is now 8.
        printf("%d\\n", y); // Prints 8

        // **p2 is equivalent to *(*p2). In either case, this is
        // the thing that *p2 points to. *p2 is simply p. In
        // other words, **p2 (or *(*p2)) is the thing that p points
        // to. That's y.

        **p2 = 17; // Equivalently: y = 17

        // y is now 17.
        printf("%d\\n", y); // Prints 17
}`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`(env) guyera@flip1:dynamic-multidimensional-arrays$ gcc -g -Wall -o doublepointers doublepointers.c 
(env) guyera@flip1:dynamic-multidimensional-arrays$ valgrind ./doublepointers 
==1809060== Memcheck, a memory error detector
==1809060== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1809060== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==1809060== Command: ./doublepointers
==1809060== 
8
17
==1809060== 
  ==1809060== HEAP SUMMARY:
==1809060==     in use at exit: 0 bytes in 0 blocks
==1809060==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==1809060== 
==1809060== All heap blocks were freed -- no leaks are possible
==1809060== 
==1809060== For lists of detected and suppressed errors, rerun with: -s
==1809060== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Recall that one use case of pointers is to allow one function to modify a variable declared in another function. Hence, one use case of double-pointers is to allow one function to modify a <Ul>pointer variable</Ul> declared in another function. This is precisely what <Code>getline</Code> does<Emdash/>you declare a <Code>char*</Code> variable at the call site, and then you pass its address (of type <Code>char**</Code>) as the first argument. <Code>getline</Code> dereferences that double-pointer to access the underlying <Code>char*</Code> variable declared at the call site. It then modifies that pointer, setting it up to point to a dynamic array of characters containing the line of text read from the target input stream.</P>

      <P>But that's not the only use case of double-pointers. Another very common use case is for representing dynamic, noncontiguous multidimensional arrays.</P>

      <SectionHeading id="dynamic-multidimensional-arrays">Dynamic, noncontiguous multidimensional arrays</SectionHeading>

      <P><Link href={`${PARENT_PATH}/${allPathData["multidimensional-arrays"].pathName}`}>In a past lecture</Link>, we discussed <Ul>contiguous</Ul> multidimensional arrays. Recall that such arrays are flattened into one-dimensional memory according to "row-major" order (i.e., the first dimension has the largest stride; the second dimension has the second-largest stride; ...; the last dimension has a stride equal to the size of a single element).</P>

      <P>But there's another, noncontiguous way to represent multidimensional structures, and that's with <It>arrays of pointers</It>. Like last time, let's just focus on the two-dimensional case, but understand that all the concepts in this whole lecture can be extended to higher dimensions.</P>

      <P>First, you construct a <Ul>one-dimensional</Ul> array of pointers. Then, perhaps in a for loop, you initialize each of the pointers in that array to point to its own, completely separate, one-dimensional array of objects. Finally, perhaps in another, nested for loop, you initialize each of the objects in each of those arrays accordingly.</P>

      <P>That is, the structure looks a bit like this:</P>

      <Image src={ArrayDiagram} alt="A 1D array of pointers, each of which points to a separate 1D array of float values" srcDarkMode={ArrayDiagramDarkMode} className="w-[47rem]"/>

      <P>In essence, all the one-dimensional arrays of objects are like "rows", and the one-dimensional array of pointers that <It>point</It> to those rows ties everything together into a sort of 2D construct. (However, keep in mind that such a structure is only <It>conceptually</It> two-dimensional; in practice, all the individual arrays making up the structure are one-dimensional, as you can see above).</P>

      <P>In most cases, all of these one-dimensional arrays are stored on the heap. Here's a demonstration of how to allocate them:</P>

      <CBlock fileName="2darray.c">{
`#include <stdlib.h>
#include <string.h>
#include <stdio.h>

// Function that simply asks the user for an integer, receiving
// it via getline, and converting it to a long via strtol (can
// be extended with some basic error handling if desired)
long prompt_for_integer(const char* prompt) {
        printf("%s", prompt);
        char* line = NULL;
        size_t n = 0;
        ssize_t len = getline(&line, &n, stdin);
        if (len == -1) {
                printf("Error on getline()\\n");
        }
        if (len >= 1 && line[len - 1] == '\\n') {
                line[len - 1] = '\\0';
        }
        if (len >= 2 && line[len - 2] == '\\r') {
                line[len - 2] = '\\0';
        }
        long res = strtol(line, NULL, 10);
        free(line);
        return res;
}

int main(void) {
        // Ask the user for an integer m and an integer n
        size_t m = prompt_for_integer("Enter an integer m: ");
        size_t n = prompt_for_integer("Enter an integer n: ");

        // Create an array of m float pointers
        float** table = malloc(sizeof(float*) * m);

        // For each pointer in the array...
        for (size_t i = 0; i < m; ++i) {
                // Initialize the ith pointer in the array of float
                // pointers to point to an array of n floats
                table[i] = malloc(sizeof(float) * n);
        }
}`
      }</CBlock>

      <P>It's fully possible to store all of the one-dimensional arrays, or even just some of them, on the stack, but the inner "rows" would have to each be declared as their own, separate automatic array variables. If there were many such rows, and you wanted to store them all on the stack, then you'd need many automatic array variables. Doing things on the heap makes things simpler; you can simply allocate all of the rows in a loop. Since they're on the heap, they'll continue to exist in memory even after the loop iteration (and even the entire loop) ends.</P>

      <P>I'll refer to these constructs as <Bold>noncontiguous multidimensional arrays</Bold>. Let's break that down.</P>

      <P>First of all, <Code>table</Code>, the pointer in the above program that points to the array of pointers (each of which points to a separate array of <Code>float</Code> values), can be indexed similarly to a contiguous multidimensional array:</P>

      <CBlock fileName="2darray.c" highlightLines="{42-62}">{
`#include <stdlib.h>
#include <string.h>
#include <stdio.h>

// Function that simply asks the user for an integer, receiving
// it via getline, and converting it to a long via strtol (can
// be extended with some basic error handling if desired)
long prompt_for_integer(const char* prompt) {
        printf("%s", prompt);
        char* line = NULL;
        size_t n = 0;
        ssize_t len = getline(&line, &n, stdin);
        if (len == -1) {
                printf("Error on getline()\\n");
        }
        if (len >= 1 && line[len - 1] == '\\n') {
                line[len - 1] = '\\0';
        }
        if (len >= 2 && line[len - 2] == '\\r') {
                line[len - 2] = '\\0';
        }
        long res = strtol(line, NULL, 10);
        free(line);
        return res;
}

int main(void) {
        // Ask the user for an integer m and an integer n
        size_t m = prompt_for_integer("Enter an integer m: ");
        size_t n = prompt_for_integer("Enter an integer n: ");

        // Create an array of m float pointers
        float** table = malloc(sizeof(float*) * m);

        // For each pointer in the array...
        for (size_t i = 0; i < m; ++i) {
                // Initialize the ith pointer in the array of float
                // pointers to point to an array of n floats
                table[i] = malloc(sizeof(float) * n);
        }

        // For each pointer in the array...
        for (size_t i = 0; i < m; ++i) {
                // For each value in the array that table[i] points
                // to...
                for (size_t j = 0; j < n; ++j) {
                        // Initialize the value (the jth value in the array
                        // that table[i] points to)
                        table[i][j] = (i+1) * (j+1);

                        // Note: This initialization logic creates an MxN
                        // multiplication table.
                }
        }

        // Print the table:
        for (size_t i = 0; i < m; ++i) {
                for (size_t j = 0; j < n; ++j) {
                        printf("%.2f\\t", table[i][j]);
                }
                printf("\\n");
        }
}
`
      }</CBlock>

      <P>Here's an example output:</P>

      <TerminalBlock copyable={false}>{
`(env) guyera@flip1:dynamic-multidimensional-arrays$ gcc -g -Wall -o 2darray 2darray.c 
(env) guyera@flip1:dynamic-multidimensional-arrays$ valgrind ./2darray 
==1886875== Memcheck, a memory error detector
==1886875== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1886875== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==1886875== Command: ./2darray
==1886875== 
Enter an integer m: 12
Enter an integer n: 7
1.00    2.00    3.00    4.00    5.00    6.00    7.00
2.00    4.00    6.00    8.00    10.00   12.00   14.00
3.00    6.00    9.00    12.00   15.00   18.00   21.00
4.00    8.00    12.00   16.00   20.00   24.00   28.00
5.00    10.00   15.00   20.00   25.00   30.00   35.00
6.00    12.00   18.00   24.00   30.00   36.00   42.00
7.00    14.00   21.00   28.00   35.00   42.00   49.00
8.00    16.00   24.00   32.00   40.00   48.00   56.00
9.00    18.00   27.00   36.00   45.00   54.00   63.00
10.00   20.00   30.00   40.00   50.00   60.00   70.00
11.00   22.00   33.00   44.00   55.00   66.00   77.00
12.00   24.00   36.00   48.00   60.00   72.00   84.00
==1886875== 
==1886875== HEAP SUMMARY:
==1886875==     in use at exit: 432 bytes in 13 blocks
==1886875==   total heap usage: 17 allocs, 4 frees, 2,720 bytes allocated
==1886875== 
==1886875== 336 bytes in 12 blocks are indirectly lost in loss record 1 of 2
==1886875==    at 0x484682F: malloc (vg_replace_malloc.c:446)
==1886875==    by 0x4012D7: main (2darray.c:39)
==1886875== 
==1886875== 432 (96 direct, 336 indirect) bytes in 1 blocks are definitely lost in loss record 2 of 2
==1886875==    at 0x484682F: malloc (vg_replace_malloc.c:446)
==1886875==    by 0x4012A5: main (2darray.c:33)
==1886875== 
==1886875== LEAK SUMMARY:
==1886875==    definitely lost: 96 bytes in 1 blocks
==1886875==    indirectly lost: 336 bytes in 12 blocks
==1886875==      possibly lost: 0 bytes in 0 blocks
==1886875==    still reachable: 0 bytes in 0 blocks
==1886875==         suppressed: 0 bytes in 0 blocks
==1886875== 
==1886875== For lists of detected and suppressed errors, rerun with: -s
==1886875== ERROR SUMMARY: 1 errors from 1 contexts (suppressed: 0 from 0)`
      }</TerminalBlock>

      <P>(Ignore the heap summary for now; we'll get to it.)</P>

      <P>Perhaps it makes sense why such indexing is possible. <Code>table[i]</Code> is the <Code>i</Code>'th pointer in the array of pointers that <Code>table</Code> points to. Similarly, <Code>table[i][j]</Code> (or, equivalently, <Code>(table[i])[j]</Code>) is the <Code>j</Code>'th element in the array that <Code>table[i]</Code> points to. Putting those two statements together, <Code>table[i]</Code> is a pointer to the <Code>i</Code>'th array of many arrays, and <Code>table[i][j]</Code> is the <Code>j</Code>'th element <It>of</It> that array.</P>

      <P>If this sounds a lot like a multidimensional array, that's because it is. However, I also said that it's <It>noncontiguous</It>. What did I mean by that?</P>

      <P>Well, the array of pointers, <Code>table</Code>, is of course contiguous because 1D arrays are contiguous by definition. Moreover, each of the 1D arrays that those pointers point to are also contiguous by definition (e.g., <Code>table[0]</Code> points to a contiguous array; <Code>table[1]</Code> points to a contiguous array; and so on). However, the entire group of <It>all</It> of these arrays is not, itself, a contiguous structure. In other words, although <Code>table[0]</Code> is immediately adjacent in memory to <Code>table[1]</Code>, and although <Code>table[0][0]</Code> is immediately adjacent in memory to <Code>table[0][1]</Code>, the same <Ul>cannot</Ul> be said of <Code>table[0][n-1]</Code> and <Code>table[1][0]</Code>. In contrast, if this were a contiguous multidimensional array, then these last two elements <It>would</It> be adjacent in memory (because of the row-major ordering).</P>

      <P>Take another look at the diagram from earlier:</P>

      <Image src={ArrayDiagram} alt="A 1D array of pointers, each of which points to a separate 1D array of float values" srcDarkMode={ArrayDiagramDarkMode} className="w-[47rem]"/>

      <P>The pointers in the "outer" array of pointers are contiguous, and the elements within a given "row" are contiguous, but the rows <It>themselves</It> are not necessarily contiguous with (adjacent to) one another (nor are they contiguous with / adjacent to the outer array of pointers). This shouldn't be too surprising. Each of these arrays<Emdash/>the outer array of pointers, and each of the inner arrays of objects<Emdash/>was allocated through a completely separate call to the <Code>malloc</Code> function. This function simply searches for <It>some place</It> on the heap where the requested block of bytes can fit. If you call it many times, it may allocate many respective blocks of bytes that are <It>nowhere near each other</It>.</P>

      <P>(Given that an "array" in C is traditionally defined to be a contiguous structure, perhaps it seems a bit confusing to call this a "noncontiguous multidimensional array". But keep in mind that the <It>formal</It> definition of an array does not require contiguity. It's just that C in particular (along with many other languages) represents arrays as contiguous structures.)</P>

      <P>There are a lot of implications to such a noncontiguous structure, including some unique capabilities but also some potential performance issues. We'll discuss these implications momentarily. But first, we must discuss how to free dynamic noncontiguous multidimensional arrays from the heap.</P>

      <SectionHeading id="freeing">Freeing dynamic noncontiguous multidimensional arrays</SectionHeading>

      <P>Anything allocated on the heap must be freed via the <Code>free</Code> function. If you dynamically allocate a noncontiguous multidimensional array with M "rows" and N "columns", then that essentially means you've allocated M+1 one-dimensional arrays on the heap to represent that structure: M 1D arrays of objects, each representing a respective row, and one additional array of pointers to tie it all together. <Ul>All</Ul> of these one-dimensional arrays must be freed via a corresponding call to the <Code>free</Code> function.</P>

      <P>However, we must be careful about the order in which we free these arrays. The <Code>free</Code> function requires us to provide the base address of the block of bytes that we want to free. Suppose we want to free the first "row" in our noncontiguous 2D array from the previous program. That is, suppose we want to free the array that <Code>table[0]</Code> points to. Then we must pass <Code>table[0]</Code> as the argument to the <Code>free</Code> function. When we do that, it's absolutely critical that <Code>table[0]</Code>, the pointer, still <It>exist</It> to begin with. In other words, we have to make sure that we free the array that <Code>table[0]</Code> points to before freeing <Code>table[0]</Code> <It>itself</It>. <Code>table[0]</Code> itself is contained within the outer array of pointers that ties the whole structure together. Hence, we must free the array that <Code>table[0]</Code> points to before we free the array of pointers that <Code>table</Code> points to. More generally: we must free <Ul>all</Ul> of the "rows" one at a time (i.e., the "inner" arrays of objects) before we free the outer array of pointers that point to those rows:</P>
      
      <CBlock fileName="2darray.c">{
`#include <stdlib.h>
#include <string.h>
#include <stdio.h>

// Function that simply asks the user for an integer, receiving
// it via getline, and converting it to a long via strtol (can
// be extended with some basic error handling if desired)
long prompt_for_integer(const char* prompt) {
        printf("%s", prompt);
        char* line = NULL;
        size_t n = 0;
        ssize_t len = getline(&line, &n, stdin);
        if (len == -1) {
                printf("Error on getline()\\n");
        }
        if (len >= 1 && line[len - 1] == '\\n') {
                line[len - 1] = '\\0';
        }
        if (len >= 2 && line[len - 2] == '\\r') {
                line[len - 2] = '\\0';
        }
        long res = strtol(line, NULL, 10);
        free(line);
        return res;
}

int main(void) {
        // Ask the user for an integer m and an integer n
        size_t m = prompt_for_integer("Enter an integer m: ");
        size_t n = prompt_for_integer("Enter an integer n: ");

        // Create an array of m float pointers
        float** table = malloc(sizeof(float*) * m);

        // For each pointer in the array...
        for (size_t i = 0; i < m; ++i) {
                // Initialize the ith pointer in the array of float
                // pointers to point to an array of n floats
                table[i] = malloc(sizeof(float) * n);
        }

        // For each pointer in the array...
        for (size_t i = 0; i < m; ++i) {
                // For each value in the array that table[i] points
                // to...
                for (size_t j = 0; j < n; ++j) {
                        // Initialize the value (the jth value in the array
                        // that table[i] points to)
                        table[i][j] = (i+1) * (j+1);

                        // Note: This initialization logic creates an MxN
                        // multiplication table.
                }
        }

        // Print the table:
        for (size_t i = 0; i < m; ++i) {
                for (size_t j = 0; j < n; ++j) {
                        printf("%.2f\\t", table[i][j]);
                }
                printf("\\n");
        }

        // Free the "inner" arrays of floats (i.e., the arrays that
        // each table[i] pointer points to)
        for (size_t i = 0; i < m; ++i) {
                free(table[i]);
        }

        // Free the "outer" array of pointers.
        free(table);
}`
      }</CBlock>

      <P>Here's a new output with a clean heap summary:</P>

      <TerminalBlock copyable={false}>{
`(env) guyera@flip1:dynamic-multidimensional-arrays$ gcc -g -Wall -o 2darray 2darray.c 
(env) guyera@flip1:dynamic-multidimensional-arrays$ valgrind ./2darray 
==1889695== Memcheck, a memory error detector
==1889695== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1889695== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==1889695== Command: ./2darray
==1889695== 
Enter an integer m: 12
Enter an integer n: 7
1.00    2.00    3.00    4.00    5.00    6.00    7.00
2.00    4.00    6.00    8.00    10.00   12.00   14.00
3.00    6.00    9.00    12.00   15.00   18.00   21.00
4.00    8.00    12.00   16.00   20.00   24.00   28.00
5.00    10.00   15.00   20.00   25.00   30.00   35.00
6.00    12.00   18.00   24.00   30.00   36.00   42.00
7.00    14.00   21.00   28.00   35.00   42.00   49.00
8.00    16.00   24.00   32.00   40.00   48.00   56.00
9.00    18.00   27.00   36.00   45.00   54.00   63.00
10.00   20.00   30.00   40.00   50.00   60.00   70.00
11.00   22.00   33.00   44.00   55.00   66.00   77.00
12.00   24.00   36.00   48.00   60.00   72.00   84.00
==1889695== 
==1889695== HEAP SUMMARY:
==1889695==     in use at exit: 0 bytes in 0 blocks
==1889695==   total heap usage: 17 allocs, 17 frees, 2,720 bytes allocated
==1889695== 
==1889695== All heap blocks were freed -- no leaks are possible
==1889695== 
==1889695== For lists of detected and suppressed errors, rerun with: -s
==1889695== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>(Note: the element initialization logic requires a nested loop, but the allocation and freeing logic do <It>not</It> require nested loops. That's because each call to <Code>malloc</Code> and <Code>free</Code> allocates or frees an entire array at a time. If we were working with a dynamic 3D array, then the element initialization logic would require a triply-nested loop, and the allocation and freeing logic would each require a doubly-nested loop.)</P>

      <P>If we were to free the "outer" array of pointers first, and <It>then</It> try to free the "inner" arrays of objects that those pointers point to, we'd end up with a use-after-free error. For example, if we were to move <Code>free(table);</Code> to be <It>above</It> the adjacent for loop in above program, then the subsequent <Code>free(table[i]);</Code> statements would invoke use-after-free errors since they would dereference <Code>table</Code>, which would be a dangling pointer by that point. Valgrind would likely report invalid reads (and possibly invalid frees).</P>

      <SectionHeading id="passing-to-functions">Passing noncontiguous multidimensional arrays to functions</SectionHeading>

      <P>Recall that one major limitation of <It>contiguous</It> multidimensional arrays is that the compiler must always be aware of the strides of all the array's dimensions so that it can generate proper indexing instructions. Computing the stride of a dimension in a contiguous multidimensional array requires knowing the <It>sizes</It> of the subsequent dimensions. The consequence is that, when declaring a contiguous multidimensional array as a parameter in a function, the sizes of all the dimensions except for the first must be specified as hardecoded, compile-time constants directly in the parameter declaration:</P>
      
      <CBlock showLineNumbers={false}>{
`void print_table(int table[][10], size_t rows) {...}`
      }</CBlock>

      <P>Such functions are not very modular / reusable. The above function in particular is only capable of printing tables that have exactly 10 columns (but any number of rows).</P>

      <P>There's a hacky way around this issue, which is to simply <It>not use multidimensional arrays at all</It>. Rather, if you want to store a 10x10 table of values, you could simply store it in a 1D array of 100 elements. You could then handcode the indexing logic yourself so as to <It>simulate</It> a multidimensional structure. For instance, you could decide that the first N elements belong to the first "row", and the next N elements belong to the second "row", and so on (where N is the number of columns in the table). To access the element at "row" <Code>i</Code>, "column" <Code>j</Code>, you could write <Code>table[i * N + j]</Code>, where <Code>table</Code> is really just a 1D array of objects. This is the exact same indexing logic that the compiler performs under the hood when indexing multidimensional arrays (multiply row index by row size, then add column index). You can also extend this to higher dimensions, though the indexing logic gets to be a bit complicated. Either way, by handcoding this indexing logic rather than relying on the compiler to generate it, you can make the dimension sizes (e.g., <Code>N</Code>) variables rather than hardcoded, compile-time constants.</P>

      <P>To be clear, that hacky solution is perfectly fine. There are cases that warrant it (see <Link href="#performance-implications">performance implications</Link>). However, this particular issue is simply nonexistent for <It>noncontiguous</It> multidimensional arrays. To create a function that accepts a noncontiguous multidimensional array as an argument, simply declare the corresponding parameter as a double-pointer. To pass the dynamic noncontiguous multidimensional array as an argument, simply pass the base address of the "outer" array of pointers. Of course, such a function will probably also need to know the number of columns in the multidimensional array, but that can be specified as an additional argument (like the number of rows) rather than hardcoding it as a compile-time constant in the array parameter declaration.</P>

      <P>Here's a demonstration:</P>

      <CBlock fileName="2darray.c" highlightLines="{5-13,66-67}">{
`#include <stdlib.h>
#include <string.h>
#include <stdio.h>

// Prints noncontiguous 2D array of floats as a table
void print_table(float** table, size_t rows, size_t columns) {
        for (size_t i = 0; i < rows; ++i) {
                for (size_t j = 0; j < columns; ++j) {
                        printf("%.2f\\t", table[i][j]);
                }
                printf("\\n");
        }
}

// Function that simply asks the user for an integer, receiving
// it via getline, and converting it to a long via strtol (can
// be extended with some basic error handling if desired)
long prompt_for_integer(const char* prompt) {
        printf("%s", prompt);
        char* line = NULL;
        size_t n = 0;
        ssize_t len = getline(&line, &n, stdin);
        if (len == -1) {
                printf("Error on getline()\\n");
        }
        if (len >= 1 && line[len - 1] == '\\n') {
                line[len - 1] = '\\0';
        }
        if (len >= 2 && line[len - 2] == '\\r') {
                line[len - 2] = '\\0';
        }
        long res = strtol(line, NULL, 10);
        free(line);
        return res;
}

int main(void) {
        // Ask the user for an integer m and an integer n
        size_t m = prompt_for_integer("Enter an integer m: ");
        size_t n = prompt_for_integer("Enter an integer n: ");

        // Create an array of m float pointers
        float** table = malloc(sizeof(float*) * m);

        // For each pointer in the array...
        for (size_t i = 0; i < m; ++i) {
                // Initialize the ith pointer in the array of float
                // pointers to point to an array of n floats
                table[i] = malloc(sizeof(float) * n);
        }

        // For each pointer in the array...
        for (size_t i = 0; i < m; ++i) {
                // For each value in the array that table[i] points
                // to...
                for (size_t j = 0; j < n; ++j) {
                        // Initialize the value (the jth value in the array
                        // that table[i] points to)
                        table[i][j] = (i+1) * (j+1);

                        // Note: This initialization logic creates an MxN
                        // multiplication table.
                }
        }

        // Print the table:
        print_table(table, m, n);

        // Free the "inner" arrays of floats (i.e., the arrays that
        // each table[i] pointer points to)
        for (size_t i = 0; i < m; ++i) {
                free(table[i]);
        }

        // Free the "outer" array of pointers.
        free(table);
}`
      }</CBlock>

      <P>(The program does the same thing as before.)</P>

      <P>Notice that <Code>print_table</Code> can work with any 2D array of <Code>float</Code>'s, regardless of the number of rows or columns, because the sizes of the dimensions do not have to be hardcoded into the array parameter declaration. And maybe it's obvious why that's the case: noncontiguous multidimensional arrays are really just <It>one-dimensional arrays of pointers</It>. Those pointers, in turn, point to <It>other</It> one-dimensional arrays. (In the case of noncontiguous arrays with 3+ dimensions, those arrays will <It>also</It> contain pointers, which point to <It>other</It> arrays, and so on, until you eventually reach the final dimension containing the actual non-pointer objects). Since everything is <It>technically</It> one-dimensional, strides aren't really relevant. Or, rather, the strides are "obvious": the stride of any one of these dimensions is simply the size of a single element contained within one of the 1D arrays in that dimension, which is either just a pointer or, in the case of the final dimension, a single non-pointer object. The compiler can determine the size of a <It>single thing</It> very easily. It's only when the compiler needs to determine the combined size of <It>many things</It> (e.g., the size of an entire row in a contiguous multidimensional array) that it needs additional information (e.g., sizes of the non-first dimensions in contiguous multidimensional array parameters).</P>

      <P>Let me frame it from another perspective. When you index a contiguous multidimensional array via <Code>matrix[i][j]</Code>, the compiler has to compute some complicated indexing arithmetic to figure out exactly where in the flattened one-dimensional memory the element <Code>matrix[i][j]</Code> is located. That arithmetic requires additional information, such as the size (stride) of each row in memory (which in turn requires knowing the number of columns in the multidimensional array). None of that arithmetic is necessary when indexing a noncontiguous multidimensional array, such as <Code>some_array[i][j]</Code>. Instead, the program deals with one dimension at a time. First, it retrieves the <Code>i</Code>'th pointer in the array of pointers whose base address is stored in <Code>some_array</Code>. It then dereferences that pointer to access the array that it <It>points</It> to. This other array<Emdash/>a "row"<Emdash/>is a completely independent array; it could be stored anywhere in memory, not necessarily adjacent to / contiguous with the other rows (hence why we call these multidimensional arrays "noncontiguous"). However, the row, itself, is still a one-dimensional structure. The program then simply locates the <Code>j</Code>th element <It>in</It> that one-dimensional row. Since all indexing is technically happening on 1D arrays, the compiler doesn't need to generate any complicated multidimensional indexing logic (which would require the compiler to know the sizes of the rows).</P>

      <SectionHeading id="jagged-arrays">Jagged arrays</SectionHeading>

      <P>Given that each of the "rows" in a noncontiguous multidimensional array is allocated separately from one another (e.g., via its own <Code>malloc</Code> call), it's possible for each of these rows to be of a different size. That is, it's possible for a noncontiguous multidimensional array to contain rows of varying sizes. Simply pass a different size to the <Code>malloc</Code> function for each row allocation.</P>

      <P>Noncontiguous multidimensional arrays with rows of varying sizes are often referred to as <Bold>jagged arrays</Bold> because, if you were to visualize them as a table, some rows would be shorter than others, giving its edge a sort of jagged look:</P>

      <Image src={JaggedArrayDiagram} alt="A 1D array of pointers, each of which points to a separate 1D array of float values. Those separate arrays are of varying lengths." srcDarkMode={JaggedArrayDiagramDarkMode} className="w-[47rem]"/>

      <P>Keep in mind, though, that you have to keep track of the sizes of each row (i.e., the number of columns in each row). When all rows are the same size, that's easy; it's just a single number to keep track of. But when the rows are of varying sizes, you have to keep track of <It>all</It> of those rows' sizes. You might store those sizes in a separate, lower-dimensional array. For example, if you have a 2D jagged array with M rows (each with varying numbers of columns), you might keep track of the sizes of each of those rows in a separate 1D array of M integers. If the number of rows (M) varies throughout the program, or, more generally, is decided at runtime, then this separate 1D array-of-sizes will likely need to be dynamically allocated as well (and therefore freed when you're done with it).</P>

      <P>Here's a demonstration (it's a modification of our previous program; I've highlighed the interesting changes):</P>

      <CBlock fileName="jaggedarray.c" highlightLines="{5-8,10,43-56,63-65,72,83,94-95}">{
`#include <stdlib.h>
#include <string.h>
#include <stdio.h>

// Prints jagged array of floats as a table. Notice:
// columns is a pointer to an ARRAY of size_t values, rather
// than a SINGLE size_t value.
void print_table(float** table, size_t rows, size_t* columns) {
        for (size_t i = 0; i < rows; ++i) {
                for (size_t j = 0; j < columns[i]; ++j) {
                        printf("%.2f\\t", table[i][j]);
                }
                printf("\\n");
        }
}

// Function that simply asks the user for an integer, receiving
// it via getline, and converting it to a long via strtol (can
// be extended with some basic error handling if desired)
long prompt_for_integer(const char* prompt) {
        printf("%s", prompt);
        char* line = NULL;
        size_t n = 0;
        ssize_t len = getline(&line, &n, stdin);
        if (len == -1) {
                printf("Error on getline()\\n");
        }
        if (len >= 1 && line[len - 1] == '\\n') {
                line[len - 1] = '\\0';
        }
        if (len >= 2 && line[len - 2] == '\\r') {
                line[len - 2] = '\\0';
        }
        long res = strtol(line, NULL, 10);
        free(line);
        return res;
}

int main(void) {
        // Ask the user for an integer m and an integer n
        size_t m = prompt_for_integer("Enter an integer m: ");

        // Each of the rows will have a different size. Prompt the
        // user for the size of EACH row (i.e., # of columns in
        // each row), storing those sizes in an array of m size_t
        // values
        size_t* ns = malloc(sizeof(size_t) * m);
        for (size_t i = 0; i < m; ++i) {
                char prompt[256];
                sprintf(
                        prompt,
                        "Enter the number of columns in row %ld: ",
                        i + 1
                );
                ns[i] = prompt_for_integer(prompt);
        }

        // Create an array of m float pointers
        float** table = malloc(sizeof(float*) * m);

        // For each pointer in the array...
        for (size_t i = 0; i < m; ++i) {
                // Initialize the ith pointer in the array of float
                // pointers to point to an array of ns[i] floats
                table[i] = malloc(sizeof(float) * ns[i]);
        }

        // For each pointer in the array...
        for (size_t i = 0; i < m; ++i) {
                // For each value in the array that table[i] points
                // to...
                for (size_t j = 0; j < ns[i]; ++j) {
                        // Initialize the value (the jth value in the array
                        // that table[i] points to)
                        table[i][j] = (i+1) * (j+1);

                        // Note: This initialization logic creates an MxN
                        // multiplication table.
                }
        }

        // Print the table:
        print_table(table, m, ns);

        // Free the "inner" arrays of floats (i.e., the arrays that
        // each table[i] pointer points to)
        for (size_t i = 0; i < m; ++i) {
                free(table[i]);
        }

        // Free the "outer" array of pointers.
        free(table);

        // Free the array of row sizes (ns)
        free(ns);
}`
      }</CBlock>

      <P>And here's an example output:</P>

      <TerminalBlock copyable={false}>{
`(env) guyera@flip1:dynamic-multidimensional-arrays$ gcc -g -Wall -o jaggedarray jaggedarray.c 
(env) guyera@flip1:dynamic-multidimensional-arrays$ valgrind ./jaggedarray 
==1896196== Memcheck, a memory error detector
==1896196== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1896196== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==1896196== Command: ./jaggedarray
==1896196== 
Enter an integer m: 12
Enter the number of columns in row 1: 7
Enter the number of columns in row 2: 4
Enter the number of columns in row 3: 5
Enter the number of columns in row 4: 1
Enter the number of columns in row 5: 2
Enter the number of columns in row 6: 5
Enter the number of columns in row 7: 4
Enter the number of columns in row 8: 6
Enter the number of columns in row 9: 6
Enter the number of columns in row 10: 7
Enter the number of columns in row 11: 3
Enter the number of columns in row 12: 3
1.00    2.00    3.00    4.00    5.00    6.00    7.00
2.00    4.00    6.00    8.00
3.00    6.00    9.00    12.00   15.00
4.00
5.00    10.00
6.00    12.00   18.00   24.00   30.00
7.00    14.00   21.00   28.00
8.00    16.00   24.00   32.00   40.00   48.00
9.00    18.00   27.00   36.00   45.00   54.00
10.00   20.00   30.00   40.00   50.00   60.00   70.00
11.00   22.00   33.00
12.00   24.00   36.00
==1896196== 
==1896196== HEAP SUMMARY:
==1896196==     in use at exit: 0 bytes in 0 blocks
==1896196==   total heap usage: 29 allocs, 29 frees, 4,012 bytes allocated
==1896196== 
==1896196== All heap blocks were freed -- no leaks are possible
==1896196== 
==1896196== For lists of detected and suppressed errors, rerun with: -s
==1896196== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <SectionHeading id="performance-implications">Performance implications</SectionHeading>

      <P>The indexing strategy for noncontiguous multidimensional arrays requires a layer of indirection (i.e., a dereference operation) for each dimension. For example, in the case of <Code>some_array[i][j]</Code>: 1) the program has to dereference the address of the <Code>i</Code>'th element of the array that <Code>some_array</Code> to; and then 2) the program has to dereference the address of the <Code>j</Code>'th element of the array that <Code>some_array[i]</Code> points to. This is in contrast to the compiler's indexing strategy for a contiguous multidimensional array, wherein a single address is computed via some complicated indexing logic according to the row-major flattening scheme (which requires knowing dimension strides), and then dereferencing that single computed address.</P>

      <P>Dereference operations can be slow, often much slower than indexing arithmetic. Moreover, conducting several dereference operations back-to-back is not very cache-friendly since it requires the CPU to jump around a lot of memory (noncontiguous structures are, <It>in general</It>, less cache-friendly than contiguous ones). The result is that accessing elements in a noncontiguous multidimensional array may be slower (potentially much slower, depending on the significance of the cache here) than accessing elements in a contiguous multidimensional array.</P>

      <P>These performance implications probably don't matter in most cases. But if you're trying to optimize an application, and after some careful profiling you've determined that a lot of time is spent traversing noncontiguous multidimensional arrays, you might consider replacing them with a contiguous alternative that requires less indirection and is more cache-friendly. You might even opt for the "hacky" solution mentioned earlier: simply store everything in a gigantic 1D array (perhaps on the stack, or perhaps on the heap<Emdash/>whatever makes sense), and handcode the necessary indexing logic to <It>simulate</It> a multidimensional structure (e.g., <Code>some_array[i * N + j]</Code>, where <Code>N</Code> is the number of columns, as opposed to <Code>some_array[i][j]</Code>).</P>

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
