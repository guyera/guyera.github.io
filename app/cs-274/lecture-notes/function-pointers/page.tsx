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
        <Item><Link href="#function-pointers">Function pointers</Link></Item>
        <Item><Link href="#spiral-rule">Spiral rule</Link></Item>
        <Item><Link href="#typedefs">(Optional content) <Code>typedef</Code> for function pointers</Link></Item>
        <Item><Link href="#casting-to-void-pointers">(Optional content) Casting to void pointers?</Link></Item>
        <Item><Link href="#polymorphism">(Optional content) Polymorphism?</Link></Item>
      </Itemize>

      <SectionHeading id="function-pointers">Function pointers</SectionHeading>

      <P><Code>void</Code> pointers are a special kind of pointer, but there's another special kind of pointer that we still haven't discussed: <Bold>function pointers</Bold>. A function pointer is a pointer that points to a function. Yes, functions have memory addresses, and therefore pointers can point to them.</P>

      <P>The syntax for declaring a function pointer is as follows:</P>

      <SyntaxBlock>{
`<return type> (*<pointer name>)(<parameter type list>)`
      }</SyntaxBlock>

      <P>Function pointers are very strictly typed. A given function pointer can only point to functions with a certain (pre-specified) return type and parameter type list. In the above syntax, replace <Code>{'<return type>'}</Code> with the return type of the function(s) that the pointer might point to. Replace <Code>{'<pointer name>'}</Code> with the name that you want the pointer itself to have (<Ul>not</Ul> the name of the function(s) that it might point to). Replace <Code>{'<parameter type list>'}</Code> with a comma-separated list of data types specifying the types of the parameters of the function(s) that the pointer might point to.</P>

      <P>For example:</P>

      <CBlock showLineNumbers={false}>{
`double (*my_pointer)(int, const char*, float);`
      }</CBlock>

      <P>Note: The parameters in the parameter type list <It>may</It> be named (e.g., <Code>int x</Code>), or you can just write out the types by themselves (e.g., <Code>int</Code>, as above).</P>

      <P>The above statement declares a pointer named <Code>my_pointer</Code>. This pointer is capable of pointing to functions, but <Ul>only</Ul> functions that have a return type of <Code>double</Code> and that take three parameters: first an <Code>int</Code>, then a <Code>const char*</Code>, then a <Code>float</Code>.</P>

      <P>To initialize a function pointer, simply use an assignment operator and, on the right hand side, write out the name of the function that you want the function pointer to point to:</P>

      <CBlock fileName="function_pointers.c">{
`#include <stdio.h>

double foo(int a, const char* some_string, float f) {
        // Divide the (first) integer parameter by the (third)
        // float parameter. Print the (second) string parameter,
        // followed by a colon, followed by the computed
        // quotient.
        float quotient = a / f;
        printf("%s: %f\\n", some_string, quotient);

        // Coerce the quotient to a double and return it (for
        // some reason...)
        return quotient;
}

int main(void) {
        double (*my_pointer)(int, const char*, float) = foo;

        // my_pointer points to the function foo.

        // Print out the memory address of foo, stored in the
        // pointer
        printf("%p\\n", my_pointer);

        // Print out the memory address of foo directly
        printf("%p\\n", foo);
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o function_pointers function_pointers.c
$ valgrind ./function_pointers 
==1108312== Memcheck, a memory error detector
==1108312== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1108312== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==1108312== Command: ./function_pointers
==1108312== 
0x401126
0x401126
==1108312== 
==1108312== HEAP SUMMARY:
==1108312==     in use at exit: 0 bytes in 0 blocks
==1108312==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==1108312== 
==1108312== All heap blocks were freed -- no leaks are possible
==1108312== 
==1108312== For lists of detected and suppressed errors, rerun with: -s
==1108312== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>(Technically, passing a function pointer to <Code>printf</Code> is not strictly portable according to the C standard. This is because all pointer arguments get casted to type <Code>void*</Code> (void pointers) by <Code>printf</Code> just before printing, and <Link href="#casting-to-void-pointers">casting a function pointer to a void pointer (and vice-versa) technically results in undefined behavior</Link>. Still, it works on most platforms, at least for temporary debugging purposes).</P>

      <P>Notice: you do <Ul>not</Ul> have to use the address-of operator (<Code>&</Code>) to explicitly retrieve the address of a function. Indeed, just like arrays, function names ("designators") <It>often</It> decay to their functions' addresses.</P>

      <P>That said, you <It>can</It> use the address-of operator on a function if you want. Funny enough, it does the same thing as <It>not</It> using the address-of operator on the function. For example, we could replace <Code>printf("%p\n", foo)</Code> with <Code>printf("%p\n", &foo)</Code>, and it would do the exact same thing.</P>

      <P>(However, keep in mind that <Code>&</Code> has very low precedence, so if the expression also does other operations with the function (e.g., if it calls the function), then the <Code>&</Code> might operate on the result of those operations rather than operating on the function itself. For example, <Code>&some_function()</Code> would call <Code>some_function()</Code> and <It>then</It> try to retrieve the address of the return value, since the <Code>&</Code> has lower precedence than the calling operator, <Code>()</Code>... And this would result in a compiler error since you can't retrieve the address of a return value directly).</P>

      <P>Now, once you have a function pointer that stores the address of a function, you can, perhaps unsurprisingly, dereference that function pointer to retrieve the function itself. You can then proceed to call that function through the dereferenced pointer:</P>
      
      <CBlock fileName="function_pointers.c" highlightLines="{28-36}">{
`#include <stdio.h>

double foo(int a, const char* some_string, float f) {
        // Divide the (first) integer parameter by the (third)
        // float parameter. Print the (second) string parameter,
        // followed by a colon, followed by the computed
        // quotient.
        float quotient = a / f;
        printf("%s: %f\\n", some_string, quotient);

        // Coerce the quotient to a double and return it (for
        // some reason...)
        return quotient;
}

int main(void) {
        double (*my_pointer)(int, const char*, float) = foo;

        // my_pointer points to the function foo.

        // Print out the memory address of foo, stored in the
        // pointer
        printf("%p\\n", my_pointer);

        // Print out the memory address of foo directly
        printf("%p\\n", foo);

        // Call the function that my_pointer points to, passing
        // 1, "1/2", and 2.0f as the arguments, and storing the
        // return value in quotient.
        float quotient = (*my_pointer)(1, "1/2", 2.0f);

        // Print the quotient as well (though it should've
        // already been printed by the foo function, which we
        // just called through my_pointer)
        printf("%.2lf\\n", quotient);
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o function_pointers function_pointers.c 
$ valgrind ./function_pointers 
==1148679== Memcheck, a memory error detector
==1148679== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1148679== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==1148679== Command: ./function_pointers
==1148679== 
0x401126
0x401126
1/2: 0.500000
0.50
==1148679== 
==1148679== HEAP SUMMARY:
==1148679==     in use at exit: 0 bytes in 0 blocks
==1148679==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==1148679== 
==1148679== All heap blocks were freed -- no leaks are possible
==1148679== 
==1148679== For lists of detected and suppressed errors, rerun with: -s
==1148679== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Actually, that's not the only syntax that you can use to call a function that a function pointer points to. There's another, more "implicit" syntax, which is to simply <It>not</It> dereference the function pointer:</P>

      <CBlock fileName="function_pointers.c" showLineNumbers={false} highlightLines="{2}">{
`... // Previous code omitted for brevity
    float quotient = my_pointer(1, "1/2", 2.0f);
... // Previous code omitted for brevity
`
      }</CBlock>

      <P>Indeed, this is technically allowed. Just as a function designator (name) often decays to the function's address, you can use the calling operator (<Code>()</Code>, with relevant arguments) on a function pointer as if it <It>were</It> the function itself. This should sound familiar: an array, too, often decays to the array's base addresses, and you can use the subscript operator (<Code>[]</Code>) on an array's base address as if it were the array itself.</P>

      <P>(Like with arrays, functions do <It>not</It> decay to their addresses when passed to the <Code>sizeof</Code> operator, nor when using the address-of operator on them. Passing a function directly to the <Code>sizeof</Code> operator is forbidden according to the C standard, though GCC allows it and simply produces the size <Code>1</Code> unless <Code>-pedantic</Code> is supplied. Using the address-of operator (<Code>&</Code>) on a function simply gives you the address of the function (i.e., a function pointer)<Emdash/><It>not</It> the address of a decayed function pointer.)</P>

      <P>However, unlike with arrays, the above implicit syntax is often not recommended when working with function pointers. That is, many programmers prefer the syntax that explicitly dereferences the function pointer before calling upon the result (e.g., <Code>(*my_pointer)(1, "1/2", 2.0f)</Code>). This syntax makes it clear that <Code>my_pointer</Code> is the name of a function pointer that points to a function<Emdash/><It>not</It> the name of the function itself. This is helpful for debugging; the implicit syntax alternative might mistakenly lead you to believe that <Code>my_pointer</Code> is the name of the function itself, causing you to go on a wild goose chase for a function named <Code>my_pointer</Code> (which doesn't exist).</P>

      <P>So, what's the point? Well, function pointers are incredibly useful since, in C, functions are not first-class objects. That's to say, functions themselves can't be passed around as arguments to other functions, returned from other functions, stored in structure fields, etc. However, function pointers <It>are</It> first-class objects, so you <It>can</It> do these things with them. This allows you to, say, create functions that receive other functions as parameters, delegating some of their work to them. That is, it allows you to parameterize entire blocks of code within functions rather than just parameterizing <It>data</It>. Indeed, function pointers enable various advanced programming techniques in C such as callbacks, hooks, a simulation of the template method pattern, and even <Link href="#polymorphism">a simulation of polymorphism</Link>.</P>

      <P>As a simple example, suppose you want to write a function that sorts an array of integers via bubble sort. However, you don't want it to <It>strictly</It> sort in ascending order, nor strictly in descending order. Rather, you want the caller of the function to be able to specify the ordering. To do this, the general <Code>bubble_sort</Code> function function might accept, as an argument, a pointer to <It>another</It> function that helps decide the ordering. For example, this other function might examine a pair of adjacent elements and determine whether they should be swapped (in ascending sorts, two elements should be swapped if the first is larger than the second, whereas in descending sorts, two elements should be swapped if the first is smaller than the second; the rule is different for other sort orderings). Here's the code:</P>

      <CBlock fileName="bubble_sort.c">{
`#include <stdio.h>

// The third argument is a pointer to a function that examines
// two elements and determines whether they're out-of-order.
// If so, it returns true. If not, it returns false. The
// bubble_sort function uses this other function to determine
// which elements need to be swapped and which don't.
void bubble_sort(
                int* arr,
                size_t size,
                _Bool (*should_swap)(int, int)) {
        // Bubble sort works by examining every adjacent pair
        // of elements and, if the two elements are out of
        // order, swapping them. It then restarts the process
        // from scratch. After N-1 full iterations of the
        // process, the array is sorted.

        // So, let's do the whole process N-1 times:
        for (size_t i = 0; i < size - 1; ++i) {
                // Look at each of the adjacent pairs of
                // elements (elements 0&1, then elements 1&2,
                // then elements 2&3, and so on, up through
                // elements N-1&N)
                for (size_t j = 0; j < size - 1; ++j) {
                        // Determine if element j should be
                        // swapped with its neighbor, element
                        // j+1. We delegate this responsibility
                        // to the function that should_swap
                        // points to.
                        if ((*should_swap)(arr[j], arr[j+1])) {
                                // They should be swapped.
                                // Swap them.
                                int temp = arr[j];
                                arr[j] = arr[j+1];
                                arr[j+1] = temp;
                        }
                }
        }
}

// This function determines whether two elements should be
// swapped in the case of an ascending sort order
_Bool should_swap_ascending(int a, int b) {
        // In ascending order, we want a < b (given element
        // smaller than the element after it). So if a > b,
        // they need to be swapped.
        if (a > b) {
                return 1;
        } else {
                return 0;
        }
}

// This function determines whether two elements should be
// swapped in the case of descending sort order
_Bool should_swap_descending(int a, int b) {
        // Just the opposite of should_swap_ascending
        if (a < b) {
                return 1;
        } else {
                return 0;
        }
}

int main(void) {
        int numbers[5] = {1, 5, -1, -2, 17};

        // Sort numbers in ascending order
        bubble_sort(numbers, 5, should_swap_ascending);

        // Print the array to prove it worked
        for (size_t i = 0; i < 5; ++i) {
                printf("%d\\t", numbers[i]);
        }
        printf("\\n");

        // Re-sort in descending order
        bubble_sort(numbers, 5, should_swap_descending);

        // Print the array to prove it worked
        for (size_t i = 0; i < 5; ++i) {
                printf("%d\\t", numbers[i]);
        }
        printf("\\n");
}
`
      }</CBlock>

      <P>And here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o bubble_sort bubble_sort.c 
$ valgrind ./bubble_sort 
==1176788== Memcheck, a memory error detector
==1176788== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1176788== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==1176788== Command: ./bubble_sort
==1176788== 
-2      -1      1       5       17
17      5       1       -1      -2
==1176788== 
==1176788== HEAP SUMMARY:
==1176788==     in use at exit: 0 bytes in 0 blocks
==1176788==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==1176788== 
==1176788== All heap blocks were freed -- no leaks are possible
==1176788== 
==1176788== For lists of detected and suppressed errors, rerun with: -s
==1176788== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>This was actually a very simple example of function pointers. You can do much more advanced things with them, especially if you combine them with void pointers. For example, suppose you want to generalize the above <Code>bubble_sort</Code> function so that it can sort <It>any</It> type of data rather than just integers. In that case:</P>

      <Itemize>
        <Item><P>Rather than receiving the array (<Code>arr</Code>) as an <Code>int*</Code> parameter, you could receive it as a <Code>void*</Code> parameter.</P></Item>
        <Item><P>However, recall that void pointers can't be dereferenced, so <Code>arr[j]</Code> and <Code>arr[j+1]</Code> would now generate compiler errors. To fix that, rather than passing the <It>elements</It> (<Code>arr[j]</Code> and <Code>arr[j+1]</Code>) to the function that <Code>should_swap</Code> points to, you'd instead have to pass the <It>addresses of the elements</It>.</P></Item>
        <Item><P>But how do you compute those addresses? You might think <Code>arr + j</Code> would give you the address of <Code>arr[j]</Code> (after all, that's usually how pointer arithmetic works). However, recall that pointer arithmetic doesn't quite work like that on void pointers since the compiler doesn't know the size of the elements within the array that the void pointer (<Code>arr</Code>) points to. In fact, pointer arithmetic officially isn't allowed on void pointers <It>at all</It> according to the C standard (though GCC provides an automatically-enabled extension that treats void pointers like <Code>char</Code> pointers for the purposes of pointer arithmetic). So, to compute the address of the <Code>j</Code>th and <Code>j+1</Code>st elements, you'd have to 1) cast the array from <Code>void*</Code> to <Code>char*</Code> (so that the compiler treats the underlying element size as 1 byte); 2) receive an additional (fourth) <Code>size_t</Code> argument in the <Code>bubble_sort</Code> function that specifies the size of a single element in the array; and 3) conduct the pointer arithmetic manually (e.g., to get the address of the <Code>j</Code>th element in the array, assuming <Code>arr</Code> is of type <Code>void*</Code>, you could do <Code>((char*) arr) + j * elem_size</Code>, where <Code>elem_size</Code> is a <Code>size_t</Code> parameter specifying the size of a single array element).</P></Item>
        <Item><P>Finally, the parameter type list of the function that <Code>should_swap</Code> points to should be <Code>(void*, void*)</Code> instead of <Code>(int, int)</Code>, and the actual functions that it might point to would have to type-cast their <Code>void*</Code> parameters into the underlying, <It>correct</It> dynamic type before dereferencing and parsing the objects that they point to.</P></Item>
      </Itemize>

      <P>That's a <It>lot</It> more complicated. But in real life, outside the academic examples you've seen throughout this course, C code <It>is</It> complicated. Here's a complete implementation of what I just described:</P>

      <CBlock fileName="bubble_sort_generic.c">{
`#include <string.h> // memcpy
#include <stdio.h>

// bubble_sort will need to be able to swap arbitrary objects.
// Swapping arbitrary objects that void pointers point to
// is a bit complicated, so let's create a dedicated function
// for it. It requires the two objects to swap (provided
// by void pointers) as well as their size, in bytes (requires
// that the two objects be of the same type and therefore the
// same size)
void swap(void* obj1, void* obj2, size_t obj_size) {
        // First, create an array of bytes (i.e., characters)
        // in which to store a temporary copy of obj1. We could
        // do this on the heap, but I'll use a stack-allocated
        // VLA to keep things simple and performant (not
        // necessarily supported in all versions of C, nor all C
        // compilers for a given version)
        char temp_byte_array[obj_size];

        // Copy the bytes from the object that obj1 points to
        // into the temporary byte array. Use memcpy for this
        memcpy(temp_byte_array, obj1, obj_size);

        // Copy the bytes from the object that obj2 points to
        // into the object that obj1 points to
        memcpy(obj1, obj2, obj_size);

        // Copy the bytes from the temporary byte array (old
        // obj1 object's value) into the object that obj2 points
        // to
        memcpy(obj2, temp_byte_array, obj_size);
}

// arr is now void* to work with an array of ANY data type.
// Additionally, we receive size_t elem_size for some necessary
// pointer arithmetic, allowing us to compute the addresses
// of elements at arbitrary indices in the array (the compiler
// can't do it since it doesn't know the size of each element).
// I also renamed "size" to "n". The function that should_swap
// points to now receives void* arguments instead of int
// arguments.
void bubble_sort(
                void* arr,
                size_t n,
                size_t elem_size,
                _Bool (*should_swap)(void*, void*)) {
        // Do the process n-1 times, as before
        for (size_t i = 0; i < n - 1; ++i) {
                // Look at each of the adjacent pairs of
                // elements (elements 0&1, then elements 1&2,
                // then elements 2&3, and so on, up through
                // elements N-1&N)
                for (size_t j = 0; j < n - 1; ++j) {
                        // Determine if element j should be
                        // swapped with its neighbor, element
                        // j+1. We delegate this responsibility
                        // to the function that should_swap
                        // points to.

                        // But first, we have to determine the
                        // addresses of arr[j] and arr[j+1],
                        // so that we can pass them to the
                        // function that should_swap points to.

                        // But remember: &arr[j] is invalid
                        // since void pointers can't be
                        // dereferenced, and arr + j is
                        // invalid since the compiler can't
                        // do the pointer arithmetic since it
                        // doesn't know the size of each
                        // element.

                        // However, if we cast arr to a char*,
                        // then the compiler will treat it
                        // as a pointer to an array of bytes
                        // (characters), i.e., each element's
                        // size is 1 (that's not really true,
                        // but we can exploit this to get the
                        // pointer arithmetic to work)
                        char* casted_arr = (char*) arr;

                        //  Now, casted_arr + Z, for some int
                        //  value Z, is literally the memory
                        //  address computed by shifting over
                        //  Z bytes (i.e., Z characters) from
                        //  the base address of the array.
                        //  To get the address of the jth
                        //  element, we need to shift over
                        //  j * elem_size bytes from the base
                        //  address (i.e., j FULL elements of
                        //  the actual array --- not just j
                        //  bytes / j characters)
                        char* elem1 = casted_arr + j * elem_size;

                        // Similarly, get address of j+1st
                        // element
                        char* elem2 = casted_arr + (j+1) * elem_size;

                        // Pass elem1 and elem2 to the function
                        // that should_swap points to, coercing
                        // them back to void pointers in the
                        // process, to determine whether they
                        // should be swapped
                        if ((*should_swap)(elem1, elem2)) {
                                // They should be swapped.
                                // Swap them using our swap
                                // function above.
                                swap(elem1, elem2, elem_size);
                        }
                }
        }
}

// This function determines whether two INTEGERS should be
// swapped in the case of an ascending sort order (requires
// the two arguments to ACTUALLY point to integers, or else
// undefined behavior ensues)
_Bool should_swap_ascending_int(void* a, void* b) {
        // Cast a and b to integer pointers, then dereference
        // them (remember: this is legal, so long as a and b
        // ACTUALLY point to integers)
        int a_val = *((int*) a);
        int b_val = *((int*) b);

        // In ascending order, we want a_val < b_val (given
        // element smaller than the element after it). So if
        // a_val > b_val, they need to be swapped.
        if (a_val > b_val) {
                return 1;
        } else {
                return 0;
        }
}

// This function determines whether two INTEGERS should be
// swapped in the case of descending sort order
_Bool should_swap_descending_int(void* a, void* b) {
        // Just the opposite of should_swap_ascending

        int a_val = *((int*) a);
        int b_val = *((int*) b);

        if (a_val < b_val) {
                return 1;
        } else {
                return 0;
        }
}

// This function determines whether two FLOATS should be
// swapped in the case of ascending sort order. Requires that
// a and b ACTUALLY point to floats, else undefined behavior
// ensues.
_Bool should_swap_ascending_float(void* a, void* b) {
        // Cast a and b to float pointers, then dereference
        // them (remember: this is legal, so long as a and b
        // ACTUALLY point to floats)
        float a_val = *((float*) a);
        float b_val = *((float*) b);

        // In ascending order, we want a_val < b_val (given
        // element smaller than the element after it). So if
        // a_val > b_val, they need to be swapped.
        if (a_val > b_val) {
                return 1;
        } else {
                return 0;
        }
}

// If you get tired of defining should_swap_ascending_T
// and should_swap_descending_T functions for each
// numeric data type T, see the preprocessing lecture notes for
// tricks that exploit the preprocessor to automatically
// generate entire (similar) function definitions for similar
// types (simulation of parametric polymorphism)

int main(void) {
        int numbers[5] = {1, 5, -1, -2, 17};

        // Sort numbers in ascending order
        bubble_sort(
                numbers,
                5,
                sizeof(int),
                should_swap_ascending_int
        );

        // Print the array to prove it worked
        for (size_t i = 0; i < 5; ++i) {
                printf("%d\\t", numbers[i]);
        }
        printf("\\n");

        // Re-sort in descending order
        bubble_sort(
                numbers,
                5,
                sizeof(int),
                should_swap_descending_int
        );

        // Print the array
        for (size_t i = 0; i < 5; ++i) {
                printf("%d\\t", numbers[i]);
        }
        printf("\\n");

        // Finally, sort an array of floats in ascending order
        float my_floats[5] = {3.14, 9.81, -1.45, 9.27, -100.3};
        bubble_sort(
                my_floats,
                5,
                sizeof(float),
                should_swap_ascending_float
        );

        // Print the array
        for (size_t i = 0; i < 5; ++i) {
                printf("%.2f\\t", my_floats[i]);
        }
        printf("\\n");
}
`
      }</CBlock>

      <SectionHeading id="spiral-rule">Spiral rule</SectionHeading>

      <P>There's a trick referred to as the <Bold>spiral rule</Bold>, or sometimes the <Bold>clockwise rule</Bold>, for reading declarations of complex-typed symbols in C. The rule says to start at the name of the symbol in question, then look immediately to its right, then read tokens in a spiral / "clockwise" order from there, respecting precedence set by parentheses.</P>

      <P>This might make more sense with an example. Consider this declaration:</P>

      <CBlock showLineNumbers={false}>{
`void (*fp)(int, double);`
      }</CBlock>

      <P>What <It>is</It> <Code>fp</Code>? Well, to read it, we start at <Code>fp</Code>, then we look to the token immediately to its right, then we proceed in spiral / clockwise order from there. The token immediately to its right is a closing parenthesis:</P>

      <CBlock showLineNumbers={false}>{
`
void (*fp)(int, double);
         ^
`
      }</CBlock>

      <P>This suggests that we must continue parsing what's inside the parenthesis pair containing <Code>fp</Code> before proceeding. So let's do that, working in a spiral / clockwise order. We move from that closing parenthesis to the <Code>*</Code> immediately to the left of <Code>fp</Code></P>
      
      <CBlock showLineNumbers={false}>{
`
void (*fp)(int, double);
      ^  |
      +--+
`
      }</CBlock>

      <P>This means that "<Code>fp</Code> is a pointer". We've finished parsing everything inside these parentheses, so now we continue in spiral / clockwise order <It>outside</It> these parentheses. That leads us to the next token group, <Code>(int, double)</Code>:</P>

      <CBlock showLineNumbers={false}>{
`
      +--------+
      |        ^
void (*fp)(int, double);
      |  |
      +--+
`
      }</CBlock>

      <P>Because this token group is in parentheses, it means that we should interpret them as parameters of a function. This gives us "<Code>fp</Code> is a pointer to a function with parameters of type <Code>int</Code> and <Code>double</Code>."</P>

      <P>We continue on, still in spiral / clockwise order, arriving at <Code>void</Code>:</P>

      <CBlock showLineNumbers={false}>{
`
      +--------+
      |        |
void (*fp)(int, double);
  ^   |  |     |
  |   +--+     |
  -------------+
`
      }</CBlock>

      <P>(Does it look like a clockwise spiral now?)</P>

      <P>This tells us that the return type of the function is <Code>void</Code>. In other words, reading the whole statement in spiral / clockwise order starting at <Code>fp</Code>, we get "<Code>fp</Code> is a pointer to a function with parameters of type <Code>int</Code> and <Code>double</Code> that returns a value of type <Code>void</Code>" (or, rather, "that returns nothing").</P>

      <P>This rule gets a bit messier for more complex declarations. Take this one, for example:</P>

      <CBlock showLineNumbers={false}>{
`void (*signal(int, void (*fp)(int)))(int);`
      }</CBlock>

      <P>Following the spiral rule, you might deduce that "<Code>signal</Code> is a function that accepts two parameters, the first being an <Code>int</Code> and the second being, itself, a function <It>pointer</It> (here named <Code>fp</Code>) that points to a function accepting an <Code>int</Code> as an argument and returning nothing. <Code>signal</Code> then returns a pointer to a function that accepts a single argument of type <Code>int</Code> (as specified by the very last <Code>(int)</Code> token) and returns nothing (as specified by the very first <Code>void</Code> token."</P>

      <P>Indeed, <Code>signal</Code> is not a function pointer, but rather a function <It>that returns a function pointer</It>. That is, the above declaration is actually a function prototype. Deducing this requires very careful application of the spiral rule.</P>

      <P>The above example was taken from <Link href="https://c-faq.com/decl/spiral.anderson.html">a 1994 post by David Anderson to the <Code>comp.lang.c</Code> Usenet newsgroup</Link>. It's a good resource for learning about the spiral rule.</P>

      <P>By the way, if you read the post, you might also realize that the right-to-left reading rule for constness (and volatility) is actually just a specific instance of the clockwise / spiral rule<Emdash/>since the identifier is at the very right of the declaration, working clockwise from the identifier is equivalent to working leftward:</P>

      <CBlock showLineNumbers={false}>{
`
       +---------------------+
       |                     |
       |  +----------------+ |
       |  |                | |
       |  |   +----------+ | |
       |  |   |          | | |
const int * const p; -+  | | |
  ^    |  |   |       |  | | |
  |    |  |   +-------+  | | |
  |    |  |              | | |
  |    |  +--------------+ | |
  |    |                   | |
  |    +-------------------+ |
  |                          |
  ---------------------------+
`
      }</CBlock>

      <P>"<Code>p</Code> is a constant pointer to an integer that is constant".</P>

      <P>(Or, if you switched the ordering to the equivalent <Code>int const * const p;</Code>, then the reading would be "<Code>p</Code> is a constant pointer to a constant integer".)</P>

      <SectionHeading id="typedefs">(Optional content) <Code>typedef</Code> for function pointers</SectionHeading>

      <P>Because function pointer types can be hard to write out and parse, some programmers like to use <Code>typedef</Code> for defining aliases for function pointer types. To do this, replace the function pointer name with the type alias that you want to create, and prefix the entire statement with the <Code>typedef</Code> operator. For example:</P>

      <CBlock fileName="bubble_sort.c" highlightLines="{3-12,22}">{
`#include <stdio.h>

// should_swap_fn_ptr is an alias for a data type. That data type
// is a pointer to a function that accepts two integers as
// arguments and returns a boolean.
typedef _Bool (*should_swap_fn_ptr)(int, int);

// Now, whenever we want to declare a variable as a function
// pointer that points to a function taking two integers as
// arguments and returning a boolean, we can simply declare
// its type as should_swap_fn_ptr. See the updated third parameter
// of bubble_sort below.

// The third argument is a pointer to a function that examines
// two elements and determines whether they're out-of-order.
// If so, it returns true. If not, it returns false. The
// bubble_sort function uses this other function to determine
// which elements need to be swapped and which don't.
void bubble_sort(
                int* arr,
                size_t size,
                should_swap_fn_ptr should_swap) {
        // Bubble sort works by examining every adjacent pair
        // of elements and, if the two elements are out of
        // order, swapping them. It then restarts the process
        // from scratch. After N-1 full iterations of the
        // process, the array is sorted.

        // So, let's do the whole process N-1 times:
        for (size_t i = 0; i < size - 1; ++i) {
                // Look at each of the adjacent pairs of
                // elements (elements 0&1, then elements 1&2,
                // then elements 2&3, and so on, up through
                // elements N-1&N)
                for (size_t j = 0; j < size - 1; ++j) {
                        // Determine if element j should be
                        // swapped with its neighbor, element
                        // j+1. We delegate this responsibility
                        // to the function that should_swap
                        // points to.
                        if ((*should_swap)(arr[j], arr[j+1])) {
                                // They should be swapped.
                                // Swap them.
                                int temp = arr[j];
                                arr[j] = arr[j+1];
                                arr[j+1] = temp;
                        }
                }
        }
}

// This function determines whether two elements should be
// swapped in the case of an ascending sort order
_Bool should_swap_ascending(int a, int b) {
        // In ascending order, we want a < b (given element
        // smaller than the element after it). So if a > b,
        // they need to be swapped.
        if (a > b) {
                return 1;
        } else {
                return 0;
        }
}

// This function determines whether two elements should be
// swapped in the case of descending sort order
_Bool should_swap_descending(int a, int b) {
        // Just the opposite of should_swap_ascending
        if (a < b) {
                return 1;
        } else {
                return 0;
        }
}

int main(void) {
        int numbers[5] = {1, 5, -1, -2, 17};

        // Sort numbers in ascending order
        bubble_sort(numbers, 5, should_swap_ascending);

        // Print the array to prove it worked
        for (size_t i = 0; i < 5; ++i) {
                printf("%d\\t", numbers[i]);
        }
        printf("\\n");

        // Re-sort in descending order
        bubble_sort(numbers, 5, should_swap_descending);

        // Print the array to prove it worked
        for (size_t i = 0; i < 5; ++i) {
                printf("%d\\t", numbers[i]);
        }
        printf("\\n");
}
`
      }</CBlock>

      <SectionHeading id="casting-to-void-pointers">(Optional content) Casting to void pointers?</SectionHeading>

      <P>A void pointer can store the address of <It>almost</It> anything. The one thing that it <It>can't</It> store the address of is a function. That's to say, a function pointer cannot be casted to a void pointer.</P>

      <P>Well, that's <It>technically</It> the case according to the C standard, anyways. In practice, most compilers have extensions that support casting function pointers to void pointers. But, officially, any C code that casts a function pointer to a void pointer is undefined behavior and therefore non-portable (i.e., it won't necessarily work as intended on every platform).</P>

      <P>For example, consider this simple program:</P>
      
      <CBlock fileName="function_pointers.c" highlightLines="{28-36}">{
`#include <stdio.h>

double foo(int a, const char* some_string, float f) {
        // Divide the (first) integer parameter by the (third)
        // float parameter. Print the (second) string parameter,
        // followed by a colon, followed by the computed
        // quotient.
        float quotient = a / f;
        printf("%s: %f\\n", some_string, quotient);

        // Coerce the quotient to a double and return it (for
        // some reason...)
        return quotient;
}

int main(void) {
        double (*my_pointer)(int, const char*, float) = foo;

        // my_pointer points to the function foo.

        // Print out the memory address of foo, stored in the
        // pointer
        printf("%p\\n", my_pointer);

        // Print out the memory address of foo directly
        printf("%p\\n", foo);

        // Call the function that my_pointer points to, passing
        // 1, "1/2", and 2.0f as the arguments, and storing the
        // return value in quotient.
        float quotient = (*my_pointer)(1, "1/2", 2.0f);

        // Print the quotient as well (though it should've
        // already been printed by the foo function, which we
        // just called through my_pointer)
        printf("%.2lf\\n", quotient);
}
`
      }</CBlock>

      <P>Look familiar? This program is from the beginning of this lecture. When I first showed you this program, I left a note below it stating that it technically isn't strictly portable according to the C standard. Indeed, it officially contains some undefined behavior.</P>

      <P>Internally, <Code>printf</Code> automatically casts all pointer arguments (besides the format string) to void pointers. For example, in the call <Code>printf("%p\n", my_pointer)</Code>, <Code>my_pointer</Code> is internally casted to a void pointer by <Code>printf</Code>. Similarly, in the call <Code>printf("%p\n", foo)</Code>, the function <Code>foo</Code> decays to a function pointer, and then that function pointer is, again, internally casted to a void pointer by <Code>printf</Code>. Because function pointers technically aren't supposed to be casted to void pointers, both of these function calls officially result in undefined behavior.</P>

      <P>But GCC has an extension that supports casting function pointers to void pointers, hence why the compiler and Valgrind didn't generate any warnings or errors. However, if we supply the <Code>-pedantic</Code> flag to <Code>gcc</Code>, which tells the compiler to adhere more closely to the C standard, it will warn us about these castings:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -pedantic -o function_pointers function_pointers.c 
function_pointers.c: In function ‘main’:
function_pointers.c:23:18: warning: format ‘%p’ expects argument of type ‘void *’, but argument 2 has type ‘double (*)(int,  const char *, float)’ [-Wformat=]
   23 |         printf("%p\\n", my_pointer);
      |                 ~^     ~~~~~~~~~~
      |                  |     |
      |                  |     double (*)(int,  const char *, float)
      |                  void *
function_pointers.c:26:18: warning: format ‘%p’ expects argument of type ‘void *’, but argument 2 has type ‘double (*)(int,  const char *, float)’ [-Wformat=]
   26 |         printf("%p\\n", foo);
      |                 ~^     ~~~
      |                  |     |
      |                  |     double (*)(int,  const char *, float)
      |                  void *
`
      }</TerminalBlock>

      <P>The program still <It>works</It>, but the warnings are telling us that, if we decided to, say, switch to a different C compiler, or perhaps compile for a different target platform, it might <It>not</It> work anymore.</P>

      <P>Luckily, there's very rarely any practical reason to cast a function pointer to a void pointer other than for debugging purposes (e.g., to print the memory address of a function via <Code>printf</Code>). Relying on a compiler extension just for some debugging trace statements probably isn't the worst thing in the world.</P>

      <P>(In theory, the ability to cast a function pointer to a void pointer would enable some <It>extremely</It> meta programming and / or dynamic control flow, like functions that accept pointers to other arbitrary functions, which are then re-casted to their appropriate function pointer types by <It>other</It> functions that are also passed by pointer. Or something to that effect. But such practices are uncommon in general, especially in C programs.)</P>

      <SectionHeading id="polymorphism">(Optional content) Polymorphism?</SectionHeading>

      <P>As you hopefully remember from CS 162 (or equivalent), polymorphism means "many forms". Officially, it refers to a function's ability to accept and operate on arguments of various types in different ways. But in many modern object-oriented languages, it's often implemented via interface inheritance and method overrides (i.e., subtype polymorphism<Emdash/>a specific kind of polymorphism).</P>

      <P>For example, a video game might consist of various kinds of monsters, each of which can attack the player. But different monsters might attack the player in different ways. Rather than storing an array of vampires and a separate array of zombies, and then iterating through <It>both</It> of those arrays one at a time, telling each vampire and zombie to attack the player, the polymorphic solution would be to simply store a single array of polymorphic monster handles. When iterating through the array of monster handles, the goal is to call a different attack function depending on the dynamic type of the monster (i.e, if the monster handle actually refers to a vampire, then call one attack function, but if it refers to a zombie, then call a different attack function).</P>

      <P>C doesn't support subtypes (inheritance) nor methods, and therefore it doesn't support subtype polymorphism. However, we can <It>simulate</It> polymorphism in C with function pointers and void pointers:</P>

      <CBlock fileName="polymorphism.c">{
`#include <stdlib.h>
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
        printf("z->sanity: %d\\n", z->sanity);
        printf("p.hp: %d\\n", p.hp);
        printf("v->strength: %d\\n", v->strength);

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
`
      }</CBlock>

      <P>And here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o polymorphism polymorphism.c 
$ valgrind ./polymorphism 
==2879485== Memcheck, a memory error detector
==2879485== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2879485== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2879485== Command: ./polymorphism
==2879485== 
z->sanity: 2
p.hp: 9
v->strength: 2
==2879485== 
==2879485== HEAP SUMMARY:
==2879485==     in use at exit: 0 bytes in 0 blocks
==2879485==   total heap usage: 3 allocs, 3 frees, 1,032 bytes allocated
==2879485== 
==2879485== All heap blocks were freed -- no leaks are possible
==2879485== 
==2879485== For lists of detected and suppressed errors, rerun with: -s
==2879485== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Just as I said, we've simulated polymorphism in that we can store handles of vampires <It>and</It> zombies in a single array of <Code>attacker</Code> structures. Each <Code>attacker</Code> has a void pointer (<Code>context</Code>) pointing to the actual entity doing the attacking (perhaps a <Code>zombie</Code>, or perhaps a <Code>vampire</Code>) as well as a pointer to an attack function. The attack function is given the context and the player. It casts the context to the appropriate dynamic type (e.g., <Code>zombie_attack</Code> casts the context to <Code>struct zombie*</Code>, whereas <Code>vampire_attack</Code> casts the context to <Code>struct vampire*</Code>) and then conducts the entity-specific attack logic, updating the player's and / or the attacking entity's state in the process. To make all the attacking entities attack the player, we simply iterate through the array of <Code>attacker</Code> structures, calling each of their attack functions, passing their respective contexts and the player as arguments.</P>

      <P>In fact, because the zombie and vampire themselves are on the heap, we could very well let their pointers fall out of scope after storing them in the respective <Code>attacker</Code> structures' context fields, and the program would still work just fine. We're even able to free their memory directly through said context fields. The pointers <Code>v</Code> and <Code>z</Code> in the <Code>main</Code> function aren't even really needed; they're just used as temporary storage for a moment before being casted to void pointers and copied into the <Code>attacker</Code> structures.</P>

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
