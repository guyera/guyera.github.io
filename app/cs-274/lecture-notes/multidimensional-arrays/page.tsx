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
        <Item><Link href="#basics-of-multidimensional-arrays">Basics of multidimensional arrays</Link></Item>
        <Item><Link href="#contiguous-multidimensional-arrays">Contiguous multidimensional arrays</Link></Item>
        <Item><Link href="#stride-and-multidimensional-array-parameters">Stride, and multidimensional array parameters</Link></Item>
        <Item><Link href="#arrays-of-arrays">Arrays of arrays</Link></Item>
        <Item><Link href="#non-contiguous-multidimensional-arrays">Non-contiguous multidimensional arrays (arrays of pointers to arrays)</Link></Item>
      </Itemize>

      <SectionHeading id="basics-of-multidimensional-arrays">Basics of multidimensional arrays</SectionHeading>

      <P>The arrays that we've discussed so far have all been <Bold>single-dimensional</Bold> arrays. That is, they can be visualized as a single linear sequence of values, which you index using a single integer (e.g., <Code>my_array[5]</Code>). In contrast, a <Bold>multidimensional array</Bold> is an array that has more than one indexable dimension. For example, a [non-jagged] two-dimensional (2D) array can be visualized as a <It>table</It> of values, which you can index using <It>two</It> integers to specify the "row" and "column", respectively (e.g., <Code>my_2d_array[5][3]</Code>).</P>

      <P>It can go far beyond two dimensions, though. An array can have three dimensions, or four, or five, and so on. In practice, it's very rare to see more than two or three dimensions, though. 2D arrays in particular are common since they're a simple way to represent tables of data.</P>

      <P>We'll focus on 2D arrays as a case study, but understand that everything that I say with respect to 2D arrays also applies to 3D arrays, 4D arrays, and so on.</P>

      <SectionHeading id="contiguous-multidimensional-arrays">Contiguous multidimensional arrays</SectionHeading>

      <P>There are two ways that a multidimensional array can be structured in memory: 1) contiguously, similar to a single-dimensional array, or 2) non-contiguously, via arrays of pointers to arrays. We'll focus on the contiguous option in this lecture. The non-contiguous option will become more relevant after we've covered dynamic memory.</P>

      <P>To create an automatic (stack-allocated) contiguous 2D array in C, use the following syntax:</P>

      <SyntaxBlock>{
`<type> <name>[<size1>][<size2>];`
      }</SyntaxBlock>

      <P>Replace <Code>{'<type>'}</Code> with the type of values you'd like to store in the 2D array, <Code>{'<name>'}</Code> with the name of the 2D array variable, <Code>{'<size1>'}</Code> with the size of the array's first dimension, and <Code>{'<size2>'}</Code> with the size of the array's second dimension.</P>

      <P>The first dimension of a 2D array is often referred to as the "row dimension", and the second dimension is often referred to as the "column dimension". For example, the following code creates a automatic contiguous 2D <Code>float</Code> array with 2 "rows" and 4 "columns":</P>

      <CBlock fileName="contiguous.c">{
`#include <stdio.h>

int main(void) {
        // Create a table (2D array) of numbers. There are 2 "rows" and
        // 4 "columns".
        float my_table[2][4];
}
`
      }</CBlock>

      <P>I write "rows" and "columns" in quotation marks for a reason. We'll discuss that reason in a moment.</P>

      <P>First, let me show you how to access the elements in an automatic contiguous 2D array:</P>

      <SyntaxBlock>{
`<name>[<index1>][<index2>]`
      }</SyntaxBlock>

      <P>Replace <Code>{'<name>'}</Code> with the name of the 2D array, <Code>{'<index1>'}</Code> with the "row" index, and <Code>{'<index2>'}</Code> with the "column" index. For example, you could initialize the element in the second row and third column of <Code>my_table</Code> to the value <Code>3.14f</Code> like so:</P>

      <CBlock showLineNumbers={false}>{
`my_table[1][2] = 3.14f;`
      }</CBlock>

      <P>Suppose you want to initialize all the values in the entire table to <Code>3.14f</Code>, one at a time. We could do that with a nested for loop:</P>

      <CBlock fileName="contiguous.c">{
`#include <stdio.h>

int main(void) {
        // Create a table (2D array) of numbers. There are 2 "rows" and
        // 4 "columns".
        float my_table[2][4];

        // For each row...
        for (int i = 0; i < 2; ++i) {
                // Initialize all the values in the current row.
                // To do that, we need another for loop. Hence,
                // nested for loops.

                // The number of elements in a single row of the table
                // is simply the number of columns in the table. So,
                // for each column...
                for (int j = 0; j < 4; ++j) {
                        // Notice that I used j instead of i for the
                        // nested for loop. This prevents shadowing
                        // the outer loop's counter.

                        // Initialize the element in row i, column
                        // j, to 3.14f
                        my_table[i][j] = 3.14f;
                }
        }
}`
      }</CBlock>

      <P>Now suppose we want to print all the values in the table. As we print the values, perhaps we want to print each row on its own line in the terminal (i.e., with <Code>\n</Code> between each row), and perhaps we want to separate the values <It>within</It> a row using tab characters (<Code>\t</Code>). We could do this with another nested for loop:</P>

      <CBlock fileName="contiguous.c" highlightLines="{28-56}">{
`#include <stdio.h>

int main(void) {
        // Create a table (2D array) of numbers. There are 2 "rows" and
        // 4 "columns".
        float my_table[2][4];

        // For each row...
        for (int i = 0; i < 2; ++i) {
                // Initialize all the values in the current row.
                // To do that, we need another for loop. Hence,
                // nested for loops.

                // The number of elements in a single row of the table
                // is simply the number of columns in the table. So,
                // for each column...
                for (int j = 0; j < 4; ++j) {
                        // Notice that I used j instead of i for the
                        // nested for loop. This prevents shadowing
                        // the outer loop's counter.

                        // Initialize the element in row i, column
                        // j, to 3.14f
                        my_table[i][j] = 3.14f;
                }
        }

        // For each row...
        for (int i = 0; i < 2; ++i) {
                // Print the current row.

                // But to do that, we have to print all the values IN
                // the current row. We do that with a for loop (hence,
                // nested for loops).

                // The number of values in a given row is simply the
                // number of columns (4). So...
                // For each column...
                for (int j = 0; j < 4; ++j) {
                        // The current row has row index i. Print
                        // the value IN that row that has column index
                        // j. In other words, print the element in the
                        // table at row i, column j:
                        printf("%f", my_table[i][j]);

                        // Print a tab character between each value
                        // within a row
                        printf("\\t");
                }

                // We've just finished printing all the values IN the
                // current row. Before moving on to the next row,
                // print a newline character sequence (so that each
                // row goes on its own line in the terminal)
                printf("\\n");
        }
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o contiguous contiguous.c 
$ valgrind ./contiguous 
==3914174== Memcheck, a memory error detector
==3914174== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==3914174== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==3914174== Command: ./contiguous
==3914174== 
3.140000        3.140000        3.140000        3.140000
3.140000        3.140000        3.140000        3.140000
==3914174== 
==3914174== HEAP SUMMARY:
==3914174==     in use at exit: 0 bytes in 0 blocks
==3914174==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==3914174== 
==3914174== All heap blocks were freed -- no leaks are possible
==3914174== 
==3914174== For lists of detected and suppressed errors, rerun with: -s
==3914174== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Let's make it a little more interesting. Instead of initializing all the elements to the same value, let's initialize the elements such that the table represents a multiplication table. That is, for a given element in the Mth row and Nth column, we'll initialize it to M * N:</P>

      <CBlock fileName="contiguous.c" highlightLines="{22-28}">{
`#include <stdio.h>

int main(void) {
        // Create a table (2D array) of numbers. There are 2 "rows" and
        // 4 "columns".
        float my_table[2][4];

        // For each row...
        for (int i = 0; i < 2; ++i) {
                // Initialize all the values in the current row.
                // To do that, we need another for loop. Hence,
                // nested for loops.

                // The number of elements in a single row of the table
                // is simply the number of columns in the table. So,
                // for each column...
                for (int j = 0; j < 4; ++j) {
                        // Notice that I used j instead of i for the
                        // nested for loop. This prevents shadowing
                        // the outer loop's counter.

                        // Initialize the element in row i, column
                        // j, to (i + 1) * (j + 1). We add 1 to each
                        // index because, otherwise, the entire first
                        // row and first column would be populated with
                        // a bunch of zeros. We want to start at 1*1, 
                        // not 0*0.
                        my_table[i][j] = (i + 1) * (j + 1);
                }
        }

        // For each row...
        for (int i = 0; i < 2; ++i) {
                // Print the current row.

                // But to do that, we have to print all the values IN
                // the current row. We do that with a for loop (hence,
                // nested for loops).

                // The number of values in a given row is simply the
                // number of columns (4). So...
                // For each column...
                for (int j = 0; j < 4; ++j) {
                        // The current row has row index i. Print
                        // the value IN that row that has column index
                        // j. In other words, print the element in the
                        // table at row i, column j:
                        printf("%f", my_table[i][j]);

                        // Print a tab character between each value
                        // within a row
                        printf("\\t");
                }

                // We've just finished printing all the values IN the
                // current row. Before moving on to the next row,
                // print a newline character sequence (so that each
                // row goes on its own line in the terminal)
                printf("\\n");
        }
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o contiguous contiguous.c 
$ valgrind ./contiguous 
==3915203== Memcheck, a memory error detector
==3915203== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==3915203== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==3915203== Command: ./contiguous
==3915203== 
1.000000        2.000000        3.000000        4.000000
2.000000        4.000000        6.000000        8.000000
==3915203== 
==3915203== HEAP SUMMARY:
==3915203==     in use at exit: 0 bytes in 0 blocks
==3915203==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==3915203== 
==3915203== All heap blocks were freed -- no leaks are possible
==3915203== 
==3915203== For lists of detected and suppressed errors, rerun with: -s
==3915203== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Perhaps you're wondering: is it possible to create a 2D array where some of the "rows" have different numbers of "columns" (e.g., where the first row has three elements, but the second row has seven elements)? Indeed, this is possible, but <Ul>not</Ul> with contiguous multidimensional arrays. You have to use <It>non-contiguous</It> multidimensional arrays for that. Again, that's not the focus of this lecture.</P>

      <P>Now, why do I keep writing "rows" and "columns" in quotation marks? Well, for one, our <Code>contiguous.c</Code> program only prints out a table with 2 rows and 4 columns because that's what I told it to do. With an extremely small change to the printing logic alone, I could easily transpose the rows and columns in the printout:</P>

      <CBlock fileName="transposed.c" highlightLines="{33,43,48}">{
`#include <stdio.h>

int main(void) {
        // Create a table (2D array) of numbers. There are 2 "rows" and
        // 4 "columns".
        float my_table[2][4];

        // For each row...
        for (int i = 0; i < 2; ++i) {
                // Initialize all the values in the current row.
                // To do that, we need another for loop. Hence,
                // nested for loops.

                // The number of elements in a single row of the table
                // is simply the number of columns in the table. So,
                // for each column...
                for (int j = 0; j < 4; ++j) {
                        // Notice that I used j instead of i for the
                        // nested for loop. This prevents shadowing
                        // the outer loop's counter.

                        // Initialize the element in row i, column
                        // j, to (i + 1) * (j + 1). We add 1 to each
                        // index because, otherwise, the entire first
                        // row and first column would be populated with
                        // a bunch of zeros. We want to start at 1*1, 
                        // not 0*0.
                        my_table[i][j] = (i + 1) * (j + 1);
                }
        }

        // For each row...
        for (int i = 0; i < 4; ++i) {
                // Print the current row.

                // But to do that, we have to print all the values IN
                // the current row. We do that with a for loop (hence,
                // nested for loops).

                // The number of values in a given row is simply the
                // number of columns (4). So...
                // For each column...
                for (int j = 0; j < 2; ++j) {
                        // The current row has row index i. Print
                        // the value IN that row that has column index
                        // j. In other words, print the element in the
                        // table at row i, column j:
                        printf("%f", my_table[j][i]);

                        // Print a tab character between each value
                        // within a row
                        printf("\\t");
                }

                // We've just finished printing all the values IN the
                // current row. Before moving on to the next row,
                // print a newline character sequence (so that each
                // row goes on its own line in the terminal)
                printf("\\n");
        }
}
`
      }</CBlock>

      <P>In the printing logic (and <Ul>only</Ul> in the printing logic), I swapped the row count with the column count, and I swapped <Code>i</Code> with <Code>j</Code> when indexing the 2D array. Here's the result:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o transposed transposed.c 
$ valgrind ./transposed 
==3917571== Memcheck, a memory error detector
==3917571== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==3917571== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==3917571== Command: ./transposed
==3917571== 
1.000000        2.000000
2.000000        4.000000
3.000000        6.000000
4.000000        8.000000
==3917571== 
==3917571== HEAP SUMMARY:
==3917571==     in use at exit: 0 bytes in 0 blocks
==3917571==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==3917571== 
==3917571== All heap blocks were freed -- no leaks are possible
==3917571== 
==3917571== For lists of detected and suppressed errors, rerun with: -s
==3917571== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>In the above printout, there are 4 rows and 2 columns instead of 2 rows and 4 columns. And yet, I made no changes whatsoever to the array's declaration: <Code>float my_table[2][4];</Code>.</P>

      <P>That's to say, <Code>my_table</Code> does not <It>really</It> have 2 rows and 4 columns. Rather, it's just a 2D structure with a first-dimension size of 2 and a second-dimension size of 4. Whether that means 2 rows and 4 columns, or 4 rows and 2 columns, completely depends on how you choose to visualize / print it.</P>

      <P>For whatever reason, many programmers like to <It>think</It> of the first dimension as the number of "rows" and the second dimension as the number of "columns". Such a programmer would probably look at the above code and say "Hey, you've accidentally transposed your array!" But of course, that's just their mental model. Maybe I intended to do it this way. This mental model is arbitrary and loses its intuition when the number of dimensions is greater than 2.</P>

      <P>(Moreover, there are occasionally very good reasons, perhaps related to cache coherency, to store a table of values with the first dimension representing the columns instead of the rows).</P>

      <P>By the way, before we move on, note that you can use brace-enclosed initializer lists to initialize 2D arrays as well. In the comma-separated list on the righthand side of the assignment operator, you must specify a comma-separated list <It>of</It> comma-separated lists. Each inner list is enclosed in curly braces, and they contain the actual values of the elements. The number of inner lists is the size of the first dimension (the number of "rows"), and the number of values <It>in</It> the inner lists is the size of the second dimension (the number of "columns"). However, there's a caveat: you must specify size of the second dimension in the square brackets in the declaration (generalizing to higher-dimensional arrays, you must specify the sizes of <Ul>all dimensions except for the first</Ul>). For example:</P>

      <CBlock fileName="innitializerlist.c">{
`#include <stdio.h>

int main(void) {
        // A table / matrix with 3 "rows" and 2 "columns".
        // Notice: the size of the second dimension ("columns"), 2, is
        // REQUIRED on the lefthand side of the assignment operator.
        // Zero-initialization applies here as well; the 2nd value of
        // the 3rd "row" is initialized to 0 since it was left out
        // of the initializer.
        int matrix[][2] = {
                {3, 7},
                {4, 9},
                {-1}
        };

        // Print the 1st value of the 3rd row (prints -1)
        printf("%d\\n", matrix[2][0]);

        // Print the 2nd value of the 3rd row (prints 0)
        printf("%d\\n", matrix[2][1]);
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o innitializerlist innitializerlist.c 
$ valgrind ./innitializerlist 
==3927392== Memcheck, a memory error detector
==3927392== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==3927392== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==3927392== Command: ./innitializerlist
==3927392== 
-1
0
==3927392== 
==3927392== HEAP SUMMARY:
==3927392==     in use at exit: 0 bytes in 0 blocks
==3927392==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==3927392== 
==3927392== All heap blocks were freed -- no leaks are possible
==3927392== 
==3927392== For lists of detected and suppressed errors, rerun with: -s
==3927392== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>This extends to higher dimensions as well. For example, you can put comma-separated lists inside of comma-separated lists, which in turn are inside of a larger comma-separated list, to initialize a 3D array.</P>

      <P>Moving on. You might be thinking, "Sure, you can print a table however you'd like, but what does a contiguous 2D array actually look like in memory? Perhaps the first dimension really <It>is</It> the number of rows." Well, memory is inherently one-dimensional; it has no "rows" or "columns". This means that all multidimensional constructs must <It>somehow</It> be converted into a one-dimensional representation in order to be stored in memory.</P>

      <P>Think about it: a memory address is a single number. It might be a very large number, but it's still a single number. This means that, in memory, there's a byte 0, a byte 1, a byte 2, and so on. By definition, this makes memory a linear sequence of bytes<Emdash/>a one-dimensional construct.</P>

      <P>How a multidimensional array is represented in one-dimensional memory depends on whether it's a contiguous or non-contiguous multidimensional array. Contiguous multidimensional arrays (the kind that we've been talking about so far) are automatically <Bold>flattened</Bold> into a one-dimensional representation. This is done under the hood by the compiler, and it involves some pointer arithmetic trickery.</P>

      <P>In particular, this flattening happens in <Bold>row-major order</Bold>. In other words, if you think of the first dimension of a 2D array as the number of "rows", then the flattening of the elements happens in the same order that we read words in English: left-to-right, then top-down.</P>

      <P>For example, consider the following 2D array:</P>

      <CBlock showLineNumbers={false}>{
`int values[][2] = {
        {1, 7},
        {-4, 2},
        {9, 5}
};`
      }</CBlock>

      <P>If we think of the first dimension as the row dimension, then the above 2D array is essentially a table with 3 rows and 2 columns:</P>

      <Verbatim>{
` 1   7
-4   2
 9   5`
      }</Verbatim>
      
      <P>When this 2D array is stored in memory, it's flattened with the elements arranged in the following order:</P>

      <Verbatim>{
`1 7 -4 2 9 5`
      }</Verbatim>

      <P>Importantly, this is a <It>contiguous</It> multidimensional array, so these values are right next to each other in memory, one after the other. That's all to say, even though this is a 2D array, it's actually stored in memory in the exact same way as a 1D array with values <Code>{'{1, 7, -4, 2, 9, 5}'}</Code> (in that order). In fact, I can prove it to you:</P>

      <CBlock fileName="flattening.c">{
`#include <stdio.h>

int main(void) {
        int values[][2] = {
                {1, 7},
                {-4, 2},
                {9, 5}
        };

        // I put it to you that the elements are stored in a single
        // contiguous chunk of memory, organized in the order:
        // 1 7 -4 2 9 5

        // To prove it, I'll first retrieve the address of the element
        // in the first row and first column (1)
        int* base_address = &(values[0][0]);

        // As you know, putting 0 in the subscript operator on a pointer
        // is the same thing as dereferencing that pointer, so this
        // prints 1
        printf("%d\\n", base_address[0]);
        // Equivalently:
        // printf("%d\\n", *base_address);

        // Now, if we shift over 1 "space" from that address (via the
        // subscript operator, []), treating this as if it were a
        // one-dimensional array in memory, I put it to you that that
        // will retrieve the value in the first row and second column
        // (7):
        printf("%d\\n", base_address[1]); // Prints 7

        // The NEXT value, base_address[2], will be the value in the
        // SECOND row, FIRST column (-4):
        printf("%d\\n", base_address[2]); // Prints -4

        // And so on...
}
`
      }</CBlock>

      <P>And here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o flattening flattening.c
$ valgrind ./flattening 
==3936648== Memcheck, a memory error detector
==3936648== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==3936648== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==3936648== Command: ./flattening
==3936648== 
1
7
-4
==3936648== 
==3936648== HEAP SUMMARY:
==3936648==     in use at exit: 0 bytes in 0 blocks
==3936648==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==3936648== 
==3936648== All heap blocks were freed -- no leaks are possible
==3936648== 
==3936648== For lists of detected and suppressed errors, rerun with: -s
==3936648== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Consider: If you were to replace the initialization of <Code>values</Code> with <Code>{'int values[] = {1, 7, -4, 2, 9, 5}'}</Code>, and replace the initialization of <Code>base_address</Code> with <Code>int* base_address = &(values[0])</Code>, the result would be exactly the same. Indeed, contiguous 2D arrays are simply flattened into one dimension in row-major order and then stored in memory as if they were 1D arrays.</P>

      <SectionHeading id="stride-and-multidimensional-array-parameters">Stride, and multidimensional array parameters</SectionHeading>

      <P>We say that the first dimension of a multidimensional array is the "major" dimension (and that 2D arrays are stored in "row-major order") because shifting the first-dimension index results in the largest shift in terms of memory addresses.</P>

      <P>Let's look at <Code>values</Code> again:</P>

      <CBlock>{
`int values[][2] = {
        {1, 7},
        {-4, 2},
        {9, 5}
};
`
      }</CBlock>

      <P>Again, in memory, the elements are ordered as <Code>1 7 -4 2 9 5</Code> (row-major order). Notice that the 1 and the 7 (same row, adjacent columns) are immediately adjacent to each other in memory, whereas the 1 and the -4 (same column, adjacent rows) are further apart in memory. This is the opposite of column-major order (<Code>1 -4 9 7 2 5</Code>), wherein the 1 and the -4 would be immediately adjacent in memory, and the 1 and the 7 would be further apart (C doesn't use column-major order, but thinking about it can be enlightening).</P>

      <P>This means that shifting from <Code>values[0][0]</Code> to <Code>values[0][1]</Code> (shifting from the 1 to the 7) corresponds to a <Ul>small shift</Ul> in memory. That is, incrementing the second-dimension index from 0 to 1 corresponds to a <Ul>small shift</Ul> in memory.</P>

      <P>In contrast, shifting from <Code>values[0][0]</Code> to <Code>values[1][0]</Code> (shifting from the 1 to the -4) corresponds to a <Ul>large shift</Ul> in memory. That is, incrementing the first-dimension index from 0 to 1 corresponds to a <Ul>large shift</Ul> in memory.</P>

      <P>A relevant term here is <Bold>stride</Bold>. The stride of a dimension of a multidimensional array refers to the amount of bytes in memory that are "shifted over" by incrementing that dimension's index. Suppose a <Code>int</Code> consists of 4 bytes (which is true on the ENGR servers). Then the stride of the second dimension of <Code>values</Code> is simply 4 bytes: shifting over from <Code>values[0][0]</Code> to <Code>values[0][1]</Code> means shifting over a single <Code>int</Code> value in memory (from the 1 to the immediately adjacent 7), which is 4 bytes. In contrast, the stride of the first dimension of <Code>values</Code> is <Ul>8 bytes</Ul>: shifting over from <Code>values[0][0]</Code> to <Code>values[1][0]</Code> means shifting over <It>two</It> <Code>int</Code> values in memory (from the 1 all the way to the -4<Emdash/>two spaces over in the row-major ordering <Code>1 7 -4 2 9 5</Code>), which is 8 bytes.</P>

      <P>Hence, the first dimension is the "major" dimension because it has the largest stride, and the second dimension is the "minor" dimension because it has the smallest stride.</P>

      <P>The stride of the first dimension of <Code>values</Code> is 8 bytes because, in order to shift "down a row", one must essentially shift "across all the columns in that row" (because that's the order in which elements are arranged in memory<Emdash/>like reading a book). There are two "columns" (i.e., two <Code>int</Code> values in each "row"), so the stride is equal to the number of bytes in two <Code>int</Code> values, which is 8 bytes on the ENGR servers.</P>

      <P>More generally, the stride of the second dimension of a 2D array is alwqys simply equal to the number of bytes in a single element, whereas the stride of the first dimension of a 2D array can be computed as N * S, where N is the size of the <It>second</It> dimension, and S is the size of a single element.</P>

      <P>Generalizing to higher-dimensional arrays, the stride of the <Ul>last</Ul> dimension is always simply equal to the number of bytes in a single element. From there, to compute the stride of another dimension, simply compute the stride of the dimension that comes <It>after</It> it, and then multilply it by that same dimension's size (number of valid indices). For example, the stride of the second-to-last dimension is equal to the stride of the last dimension multiplied by the size of the last dimension. Applying this to <Code>values</Code>, the stride of the first dimension is equal to the stride of the second dimension (4 bytes) multiplied by the size of the second dimension (2): 4 * 2 = 8 bytes.</P>

      <P>Stride is important in indexing logic. When you index a contiguous multidimensional array, such as <Code>values[i][j]</Code>, here's what really happens:</P>

      <Enumerate listStyleType="decimal">
        <Item>The program retrieves the base address of the array in memory (the first byte of the first element, in row-major order)</Item>
        <Item>The program takes the row index, <Code>i</Code>, and multiplies it by the stride of the first dimension. Let A denote this computed value.</Item>
        <Item>The program takes the column index, <Code>j</Code>, and multiplies it by the stride of the second dimension. Let B denote this computed value.</Item>
        <Item>The program computes the sum of all three values: the array's base address + A + B. This sum is the memory address of the element being accessed. It then dereferences that memory address, retrieving the underlying value.</Item>
      </Enumerate>

      <P>Let's consider an example. First, here's the definition of <Code>values</Code> again for your convenience:</P>

      <CBlock>{
`int values[][2] = {
        {1, 7},
        {-4, 2},
        {9, 5}
};
`
      }</CBlock>

      <P>Now, suppose we execute <Code>printf("%d\n", values[1][1]);</Code>. We know that this will print the element in the second "row" and second "column", which is <Code>2</Code>. But how does the computer find that value in memory? First, it retrieves the base address of the array. This is the memory address of the first element in row-major order, meaning the memory address of the element <Code>1</Code>. Next, it computes value A by multiplying 1 (<Code>i</Code>) by 8 bytes (the stride of the first dimension). So A = 1 * 8 bytes = 8 bytes. It then computes value B by multiplying 1 (<Code>j</Code>) by 4 bytes (the stride of the second dimension). So B = 1 * 4 bytes = 4 bytes. It finally adds these three values together. When A (8 bytes) is added to the base address, that effectively shifts over 2 elements in memory (since each <Code>int</Code> element occupies 4 bytes of memory). When B (4 bytes) is added to <It>that</It>, that effectively shifts over 1 more element in memory. That is, the computer has determined that it should shift over 3 total elements from the start of the array in memory. Recall that the row-major ordering (the order in which elements are stored in memory) is <Code>1 7 -4 2 9 5</Code>. Indeed, starting at the beginning of the array (the element <Code>1</Code>), shifting over three elements arrives at the fourth element in memory: <Code>2</Code>. Hence, <Code>printf("%d\n", values[1][1]);</Code> prints <Code>2</Code> to the terminal.</P>

      <P>Why does this all matter? Well, it matters greatly when contiguous multidimensional arrays are passed to functions. Indeed, functions can have contiguous multidimensional array parameters. For the most part, these work very similarly to 1D array parameters, meaning they're really just pointers, and contiguous multidimensional array arguments really just decay to their base addresses. However, there are a couple additional constraints:</P>

      <Enumerate listStyleType="decimal">
        <Item>When declaring a contiguous multidimensional array parameter, you must use the "array-style" declaration syntax; you cannot explicitly declare the parameter as a pointer (even though it <It>essentially is</It> a pointer).</Item>
        <Item>Moreover, when using this array-style declaration syntax, you must write out a pair of square brackets for each dimension (just like when declaring any other contiguous multidimensional array variable), but <Ul>the sizes of all the dimensions except for the first must be explicitly specified</Ul>. Recall that this is the same rule that we discussed with respect to initializing a multidimensional array with an initializer list.</Item>
      </Enumerate>

      <P>Here's an example to demonstrate these rules:</P>

      <CBlock fileName="2darrayinfunction.c">{
`#include <stdio.h>

// Notice: the size of the first dimension may be omitted in the
// array parameter, but the sizes of all other dimensions MUST be
// specified directly in the parameter declaration. The function still
// needs to know the size of the first dimension in order to terminate
// its outer loop properly, so we pass it as a separate argument.
void print_table(int array[][2], size_t rows) {
        for (int i = 0; i < rows; ++i) {
                for (int j = 0; j < 2; ++j) {
                        printf("%d\\t", array[i][j]);
                }
                printf("\\n");
        }
}

// It would NOT be correct to write the array parameter using pointer
// syntax, such as int* array, or int** array, or even int* array[].
// While these are all valid declarations in some context, they don't
// represent contiguous 2D arrays.

int main(void) {
        // Recall: We also have to put the size of the non-first
        // dimensions here as well.
        int values[][2] = {
                {1, 7},
                {-4, 2},
                {9, 5}
        };

        print_table(values, 3);
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o 2darrayinfunction 2darrayinfunction.c 
$ valgrind ./2darrayinfunction 
==3957889== Memcheck, a memory error detector
==3957889== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==3957889== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==3957889== Command: ./2darrayinfunction
==3957889== 
1       7
-4      2
9       5
==3957889== 
==3957889== HEAP SUMMARY:
==3957889==     in use at exit: 0 bytes in 0 blocks
==3957889==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==3957889== 
==3957889== All heap blocks were freed -- no leaks are possible
==3957889== 
==3957889== For lists of detected and suppressed errors, rerun with: -s
==3957889== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>So, why do these rules exist? Well, just a moment ago, we discussed how in order for the computer to correctly locate the element <Code>values[1][1]</Code>, it needs to know the strides of both dimensions. This is true in general; the computer needs to know the strides of all dimensions in order to properly index a contiguous multidimensional array. The stride of the last dimension in a contiguous multidimensional array is always simply equal to the size of a single element. The computer can figure that much out very easily. However, the stride of the second-to-last dimension (i.e., the first dimension, in the case of a 2D array) is computed as the stride of the last dimension multiplied by the <Ul>size of the last dimension</Ul>. Hence, in order to compute the stride of the second-to-last dimension, the computer needs to know the size of the last dimension. Similarly, to compute the stride of the third-to-last dimension, the computer needs to know the size of the second-to-last dimension. And so on. The conclusion is that, in order to compute all the strides of all the dimensions, the computer needs to know the sizes of all dimensions except for the first. Hence, they must be specified in the code.</P>
      

      <SectionHeading id="arrays-of-arrays">Arrays of arrays</SectionHeading>

      <P>Another way of thinking about contiguous multidimensional arrays is to think of them as arrays <It>of</It> arrays. For example, the 2D array <Code>values</Code> in the previous examples is essentially an array that contains three smaller <It>one-dimensional</It> arrays inside it. Each of those three inner 1D arrays contains two <Code>int</Code> values inside it.</P>

      <P>Put another way, <Code>values</Code> (a 2D array) is an array of 1D arrays; <Code>values[0]</Code> is the first (1D) array contained inside of <Code>values</Code>; <Code>values[1]</Code> is the second (1D) array contained inside of <Code>values</Code>; and so on.</P>

      <P>There's even some syntax that aligns with this way of thinking. Indeed, C supports treating partially indexed multidimensional arrays as lower-dimensional arrays<Emdash/><Code>values[0]</Code> really <It>can</It> be used, syntactically, as if it were a 1D array representing the first "row" of <Code>values</Code>. In fact, you can even pass <Code>values[0]</Code> to a function that has a 1D array parameter (i.e., a single-pointer parameter):</P>

      <CBlock fileName="arraysofarrays.c">{
`#include <stdio.h>

void print_1d_array(int array[], size_t size) {
        for (int i = 0; i < size; ++i) {
                printf("%d ", array[i]);
        }
        printf("\\n");
}
// Or, equivalently
// void print_1d_array(int* array, size_t size)...

int main(void) {
        int values[][2] = {
                {1, 7},
                {-4, 2},
                {9, 5}
        };

        // Print the first row of values (which has 2 elements, since
        // there are 2 columns)
        print_1d_array(values[0], 2);

        // Print the second row of values (which has 2 elements, since
        // there are 2 columns)
        print_1d_array(values[1], 2);

        // And so on...
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o arraysofarrays arraysofarrays.c 
$ valgrind ./arraysofarrays 
==3941533== Memcheck, a memory error detector
==3941533== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==3941533== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==3941533== Command: ./arraysofarrays
==3941533== 
1 7 
-4 2 
==3941533== 
==3941533== HEAP SUMMARY:
==3941533==     in use at exit: 0 bytes in 0 blocks
==3941533==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==3941533== 
==3941533== All heap blocks were freed -- no leaks are possible
==3941533== 
==3941533== For lists of detected and suppressed errors, rerun with: -s
==3941533== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <SectionHeading id="non-contiguous-multidimensional-arrays">Non-contiguous multidimensional arrays (arrays of pointers to arrays)</SectionHeading>

      <P>This lecture has been about contiguous multidimensional arrays. I also alluded to non-contiguous multidimensional arrays. These are essentially an alternative way of representing multidimensional arrays in memory where, rather than using the special multidimensional array syntax (multiple successive pairs of square brackets in an array declaration) and allowing the compiler to just flatten everything into a row-major-ordered contiguous buffer, you instead create a 1D <Ul>array of pointers</Ul>. You then initialize each of the pointers in that 1D array point to a <Ul>1D array of values</Ul>. Those "inner" arrays can be thought of as rows, and the 1D array of pointers ties those "rows" together into a "table".</P>

      <P>In this structure, the rows themselves can be scattered all over the place in memory. They don't have to be contiguous; it's the responsibility of the final array of pointers to tie them all together. In fact, the rows don't even have to all be allocated at the same time.</P>

      <P>There are tradeoffs to such a structure. For example, it supports jagged multidimensional arrays (the rows don't have to all have the same number of columns), and you don't have to worry about strides (e.g., you don't have to specify the sizes of the non-first dimensions in non-contiguous multidimensional array parameters). On the other hand, a non-contiguous multidimensional array typically has worse spacial locality and cache coherence than a contiguous multidimensional array, slower access times due to an extra layer of indirection, and (potentially) more opportunities to mess up and invoke undefined behavior.</P>

      <P>I'd give you an example, but non-contiguous multidimensional <It>automatic</It> (stack-allocated) arrays are extremely uncommon. Much more common are non-contiguous multidimensional <It>dynamic</It> arrays. We haven't covered dynamic memory yet, so we can't discuss such things at this point in time. We'll revisit this topic later.</P>

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
