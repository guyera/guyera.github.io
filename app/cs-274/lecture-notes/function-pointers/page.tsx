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

      <P>(Technically, passing a function pointer to <Code>printf</Code> is not strictly portable according to the C standard. This is because all pointer arguments get casted to type <Code>void*</Code> (void pointers) by <Code>printf</Code> just before printing, and casting a function pointer to a void pointer (and vice-versa) <Link href="#casting-to-void-pointers">technically results in undefined behavior</Link>. Still, it works on most platforms, at least for temporary debugging purposes).</P>

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
        <Item>Rather than receiving the array (<Code>arr</Code>) as an <Code>int*</Code> parameter, you could receive it as a <Code>void*</Code> parameter.</Item>
        <Item>However, recall that void pointers can't be dereferenced, so <Code>arr[j]</Code> and <Code>arr[j+1]</Code> would now generate compiler errors. To fix that, rather than passing the <It>elements</It> (<Code>arr[j]</Code> and <Code>arr[j+1]</Code>) to the function that <Code>should_swap</Code> points to, you'd instead have to pass the <It>addresses of the elements</It>.</Item>
        <Item>But how do you compute those addresses? You might think <Code>arr + j</Code> would give you the address of <Code>arr[j]</Code> (after all, that's usually how pointer arithmetic works). However, recall that pointer arithmetic doesn't quite work like that on void pointers since the compiler doesn't know the size of the elements within the array that the void pointer (<Code>arr</Code>) points to. In fact, pointer arithmetic officially isn't allowed on void pointers <It>at all</It> according to the C standard (though GCC provides an automatically-enabled extension that treats void pointers like <Code>char</Code> pointers for the purposes of pointer arithmetic). So, to compute the address of the <Code>j</Code>th and <Code>j+1</Code>st elements, you'd have to 1) cast the array from <Code>void*</Code> to <Code>char*</Code> (so that the compiler treats the underlying element size as 1); 2) receive an additional (fourth) <Code>size_t</Code> argument in the <Code>bubble_sort</Code> function that specifies the size of a single element in the array; and 3) conduct the pointer arithmetic manually (e.g., to get the address of the <Code>j</Code>th element in the array, assuming <Code>arr</Code> is of type <Code>void*</Code>, you could do <Code>((char*) arr) + j * elem_size</Code>, where <Code>elem_size</Code> is a <Code>size_t</Code> parameter specifying the size of a single array element).</Item>
        <Item>Finally, the parameter type list of the function that <Code>should_swap</Code> points to should be <Code>(void*, void*)</Code> instead of <Code>(int, int)</Code>, and the actual functions that it might point to would have to type-cast their <Code>void*</Code> parameters into the underlying, <It>correct</It> dynamic type before dereferencing and parsing the objects that they point to.</Item>
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

        // Print the array to prove it worked
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
        for (size_t i = 0; i < 5; ++i) {
                printf("%.2f\\t", my_floats[i]);
        }
        printf("\\n");
}
`
      }</CBlock>

      <SectionHeading id="spiral-rule">Spiral rule</SectionHeading>

      <P>There's a trick referred to as the <Bold>spiral rule</Bold>, or sometimes the <Bold>clockwise rule</Bold>, for reading declarations of complex-typed symbols in C. The rule says to start at the name of the symbol in question, then look immediately to its right, then read tokens in a spiral / "clockwise" order from there.</P>

      <P>For example, consider this declaration:</P>

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

      <P>This tells us the that the return type of the function is <Code>void</Code>. In other words, reading the whole statement in spiral / clockwise order starting at <Code>fp</Code>, we get "<Code>fp</Code> is a pointer to a function with parameters of type <Code>int</Code> and <Code>double</Code> that returns a value of type <Code>void</Code>" (or, rather, "that returns nothing").</P>

      <P>This rule gets a bit messier for more complex declarations. Take this one, for example:</P>

      <CBlock showLineNumbers={false}>{
`void (*signal(int, void (*fp)(int)))(int);`
      }</CBlock>

      <P>Following the spiral rule, you might deduce that "<Code>signal</Code> is a function that accepts two parameters, the first being an <Code>int</Code> and the second being, itself, a function <It>pointer</It> (here named <Code>fp</Code>) that points to a function accepting an <Code>int</Code> as a parameter and returning nothing. <Code>signal</Code> then returns a pointer to a function that accepts a single parameter of type <Code>int</Code> (as specified by the very last <Code>(int)</Code> token) and returns nothing."</P>

      <P>Indeed, <Code>signal</Code> is not a function pointer, but rather a function <It>that returns a function pointer</It>. Deducing this requires very careful application of the spiral rule.</P>

      <P><Link href="https://c-faq.com/decl/spiral.anderson.html">Here's</Link> a good resource for a deeper explanation of the spiral rule.</P>

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

      {/*TODO Typedefs for function pointers*/}

      <SectionHeading id="casting-to-void-pointers">(Optional content) Casting to void pointers?</SectionHeading>

      <P>Uh oh! Alex is behind on lecture notes!</P>

      {/*TODO function pointers can't technically be casted to void pointers w/o UB. But works fine on most systems, so it's USUALLY safe to print function pointers with %p (just not guaranteed to work on all systems).*/}

      <SectionHeading id="polymorphism">(Optional content) Polymorphism?</SectionHeading>

      <P>Uh oh! Alex is behind on lecture notes!</P>

      {/*TODO Polymorphism as separate optional content section*/}

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
