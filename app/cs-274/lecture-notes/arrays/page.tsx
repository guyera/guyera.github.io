import CBlock from '../ui/cblock'
import SyntaxBlock from '../ui/syntaxblock'
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

import ArrayMemoryDiagram from './assets/array-memory-diagram.png'
import ArrayMemoryDiagramDarkMode from './assets/array-memory-diagram-dark-mode.png'

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
        <Item><Link href="#arrays">Arrays</Link></Item>
        <Item><Link href="#aggregate-initialization">Aggregate initialization</Link></Item>
        <Item><Link href="#arrays-in-memory">Arrays in memory</Link></Item>
        <Item><Link href="#pointers-to-arrays">Pointers to arrays</Link></Item>
        <Item><Link href="#more-on-c-strings">More on C strings</Link></Item>
        <Item><Link href="#buffer-overflows">Buffer over-reads and overflows</Link></Item>
        <Item><Link href="#passing-arrays-to-functions">Passing arrays to functions</Link></Item>
        <Item><Link href="#sizeof"><Code>sizeof</Code></Link></Item>
        <Item><Link href="#copying-arrays">Copying arrays</Link></Item>
        <Item><Link href="#returning-arrays">Returning arrays?</Link></Item>
      </Itemize>

      <SectionHeading id="arrays">Arrays</SectionHeading>

      <P>An <Bold>array</Bold> is a <Bold>contiguous</Bold>, <Bold>homogeneous</Bold>, <Bold>sequence</Bold> of <Bold>elements</Bold> (values). Let's unpack that jargon.</P>

      <Itemize>
        <Item><Bold>Contiguous</Bold>: This means that all the elements (values) in an array are arranged right next to each other in memory. For example, the first element of an array is right next to the second element in memory.</Item>
        <Item><Bold>Homogeneous</Bold>: This means that all elements in a single array must be of the same [static] type.</Item>
        <Item><Bold>Sequence</Bold>: This means that the elements in an array are ordered, and it's up to the programmer to decide the ordering. There's a first element, a second element, a third element, and so on, and you have to decide what values are stored in each position.</Item>
      </Itemize>

      <P>If you're familiar with lists in Python, arrays are a bit similar, except Python lists are heterogeneous (not homogeneous), though static analysis tools like Mypy often enforce homogeneity.</P>

      <P>Moreover, the kind of arrays that we're going to discuss in this lecture are <Bold>automatic arrays </Bold>(i.e., regular local array variables that are allocated on the stack). These arrays are <Bold>fixed-size</Bold>, meaning that you must specify how many elements the array will have when you first create it, and it cannot be resized (expanded or shrunk) later.</P>

      <P>You can declare an automatic array in C like so:</P>

      <SyntaxBlock>{
`<type> <name>[<size>];`
      }</SyntaxBlock>

      <P>Replace <Code>{'<type>'}</Code> with the type of elements that you want the array to store; replace <Code>{'<name>'}</Code> with the array's name; and replace <Code>{'<size>'}</Code> with the number of elements that you want the array to store. For example, you might declare an array of 100 floating point numbers like so:</P>

      <CBlock fileName="arrays.c">{
`#include <stdio.h>

int main() {
        float some_numbers[100];
}
`
      }</CBlock>
      
      <P><Ul>Important</Ul>: In many cases, the size of an automatic array is technically allowed be an integral variable with a positive value (e.g., <Code>float some_numbers[x]</Code>, where <Code>x</Code> is an <Code>int</Code> variable storing some positive integer). Arrays declared with a variable size are referred to as <Bold>variable-length arrays (VLAs)</Bold>. <Ul>However</Ul>, although VLAs are technically allowed in many cases, using them is often discouraged. They have a lot of peculiarities to them that make them quite bug-prone (e.g., they can overflows the stack if the stack is too small to store the potentially large number of elements; they can (perhaps surprisingly) evoke side effects of the <Code>sizeof()</Code> operator; they behave differently when they decay into pointers; etc). Moreover, there are portability issues with VLAs: some C compilers don't support them at all (e.g., MSVC); they weren't introduced in the C standard until C99; and they were officially treated as an optional language feature in C11 and C17 (then made mandatory again in C23).</P>

      <P>That's all to say, you should avoid VLAs. Instead, make sure that the sizes of your automatic arrays are <Ul>hardcoded constants</Ul> (e.g., <Code>100</Code>) instead of variables. Of course, being able to use a variable to specify the size of an array can be quite useful. But there's a way to do that <It>without</It> VLAs, which is by using dynamic arrays instead. We'll cover dynamic arrays in a future lecture. For now, your arrays will all be of hardcoded sizes.</P>

      <P>An array is a variable like any other variable (though they do behave a bit differently in some contexts, as we'll see). When an array is first declared as above, the elements of the array are uninitialized (garbage) by default. That is, the above array contains 100 floating point numbers, but each of those floating point numbers is uninitialized. Attempting to do anything with them (other than initialize them) would invoke undefined behavior.</P>

      <P>So, we must initialize them. But to do that, you must first know how to access array elements in general. Here's how:</P>

      <SyntaxBlock>{
`<name>[<index>]`
      }</SyntaxBlock>

      <P>Replace <Code>{'<name>'}</Code> with the array's name and <Code>{'<index>'}</Code> with the <Bold>index</Bold> of the element that you want to access. An index is an integer specifying an element position. Arrays in C follow <Bold>zero-based indexing</Bold>, meaning that the index of the first element in an array is 0; the index of the second element in an array is 1; and so on.</P>

      <P>When you access an element as above, the expression resolves to a sort of reference in the sense that you're allowed to put it on the left hand side of an assignment operator. Indeed, that's precisely how you initialize and modify array element values:</P>

      <SyntaxBlock>{
`<name>[<index>] = <value>`
      }</SyntaxBlock>

      <P>As you'd probably guess, the value (<Code>{'<value>'}</Code>) must be compatible with (implicitly castible to) the type of elements stored within the array. For example, we could initialize the first element in <Code>some_numbers</Code> to the value of <Code>3.14f</Code> like so:</P>

      <CBlock fileName="arrays.c" highlightLines="{5}">{
`#include <stdio.h>

int main() {
        float some_numbers[100];
        some_numbers[0] = 3.14f;
}
`
      }</CBlock>

      <P>Of course, there are 100 elements in the array. We've only initialized the first element. Initializing all of them one line of code at a time would take forever. Luckily, there are some tricks that make it easier to initialize several elements in an array. One idea is to just use a for loop:</P>

      <CBlock fileName="arrays.c" highlightLines="{6-10}">{
`#include <stdio.h>

int main() {
        float some_numbers[100];

        // Initialize each element to a value matching its
        // index (0.0, 1.0, 2.0, ...)
        for (int i = 0; i < 100; ++i) {
                some_numbers[i] = i;
        }
}
`
      }</CBlock>

      <P>Suppose you need all the elements in the array to be initialized to the same value, say <Code>3.14f</Code>. A for loop could accomplish that as well:</P>

      <CBlock fileName="arrays.c" highlightLines="{8}">{
`#include <stdio.h>

int main() {
        float some_numbers[100];

        // Initializes all elements to 3.14
        for (int i = 0; i < 100; ++i) {
                some_numbers[i] = 3.14f;
        }
}
`
      }</CBlock>

      <P>We'll cover <Link href="#aggregate-initialization">another initialization trick</Link> shortly.</P>

      <P>Once an array element has been initialized, it can be used however you'd like. Simply access it by indexing the array:</P>

      <CBlock fileName="arrays.c">{
`#include <stdio.h>

int main() {
        float some_numbers[100];

        // Initializes all elements to 3.14
        for (int i = 0; i < 100; ++i) {
                some_numbers[i] = 3.14f;
        }

        // Change the fifth element to 9.81
        some_numbers[4] = 9.81;

        // Print the fifth element in the array:
        printf("The fifth element is: %f\\n", some_numbers[4]);

        // Print the 3rd element, then the 4th, then 5th, up through
        // the 9th
        for (int i = 2; i < 9; ++i) {
                printf("Element %d: %f\\n", i + 1, some_numbers[i]);
        }

        // Add the fourth and fifth elements together and print the
        // sum
        printf(
                "%f + %f = %f\\n",
                some_numbers[3],
                some_numbers[4],
                some_numbers[3] + some_numbers[4]
        );
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o arrays arrays.c 
$ valgrind ./arrays 
==2015329== Memcheck, a memory error detector
==2015329== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2015329== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2015329== Command: ./arrays
==2015329== 
The fifth element is: 9.810000
Element 3: 3.140000
Element 4: 3.140000
Element 5: 9.810000
Element 6: 3.140000
Element 7: 3.140000
Element 8: 3.140000
Element 9: 3.140000
3.140000 + 9.810000 = 12.950001
==2015329== 
==2015329== HEAP SUMMARY:
==2015329==     in use at exit: 0 bytes in 0 blocks
==2015329==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==2015329== 
==2015329== All heap blocks were freed -- no leaks are possible
==2015329== 
==2015329== For lists of detected and suppressed errors, rerun with: -s
==2015329== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>As I mentioned, automatic arrays such as these are fixed-size. The array in the above program has exactly 100 elements in it, and that will always be the case. If you want to put a 101st element in it, you simply can't do that. Attempting to do that would result in a <Link href="#buffer-overflows">buffer overflow</Link>.</P>

      <P>Automatic arrays cannot be resized because they're allocated on the stack. The stack is the special place in memory where all automatic local variables go. It's very carefully structured, which makes it efficient, but resizing data on the stack would require breaking that structure, hence it's generally not possible.</P>

      <P>To be clear, the stack isn't the only place where you can allocate arrays. Arrays can be allocated on the heap as well, and heap-allocated arrays are (sort of) resizable. But we'll talk about the stack and the heap in a future lecture.</P>
      
      <SectionHeading id="aggregate-initialization">Aggregate initialization</SectionHeading>

      <P>Suppose you want to create a fairly small array, say 5 elements. In such a case, you can initialize all the elements in the array at once via <Bold>aggregate initialization</Bold>, which is done at the time the array is declared. The syntax looks like this:</P>

      <SyntaxBlock>{
`<type> <name>[<size>] = {<values>};`
      }</SyntaxBlock>

      <P>Replace <Code>{'<type>'}</Code> with the type of elements stored in the array, <Code>{'<name>'}</Code> with the name of the array, <Code>{'<size>'}</Code> with the number of elements in the array, and <Code>{'<values>'}</Code> with a <Ul>comma-separated list</Ul> of values to be contained within the array. The elements of the array will be initialized to the specified values in left-to-right order. For example:</P>

      <CBlock fileName="aggregateinit.c">{
`#include <stdio.h>

int main() {
        int numbers[5] = {1, 4, 7, -9, 2};

        // Prints 7
        printf("%d\\n", numbers[2]);
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o aggregateinit aggregateinit.c 
$ valgrind ./aggregateinit 
==3844558== Memcheck, a memory error detector
==3844558== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==3844558== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==3844558== Command: ./aggregateinit
==3844558== 
7
==3844558== 
==3844558== HEAP SUMMARY:
==3844558==     in use at exit: 0 bytes in 0 blocks
==3844558==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==3844558== 
==3844558== All heap blocks were freed -- no leaks are possible
==3844558== 
==3844558== For lists of detected and suppressed errors, rerun with: -s
==3844558== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>A neat thing about aggregate initialization is that you can optionally omit the array's size. The compiler will infer the size of the array based on the number of values in the comma-separated list:</P>

      <CBlock fileName="aggregateinit.c" highlightLines="{4-5}">{
`#include <stdio.h>

int main() {
        // Notice: no size in the square brackets. Inferred to be 5.
        int numbers[] = {1, 4, 7, -9, 2};

        // Prints 7
        printf("%d\\n", numbers[2]);
}
`
      }</CBlock>

      <P>It does the same thing as before.</P>

      <P>Now, suppose the size in the square brackets doesn't match the number of values in the comma-separated list in an aggregate initialization of an array. What happens? Well, the rule might surprise you:</P>

      <Itemize>
        <Item>If the number of values in the comma-separated list is <Ul>greater</Ul> than the size specified in the square brackets, then the program is ill-formed. Some compilers may issue an error. Many will just issue a warning, and undefined behavior will ensue when the array is initialized.</Item>
        <Item>However, if the number of values in the comma-separated list is <Ul>less</Ul> than the size specified in the square brackets, then the remaining elements are <Bold>zero-initialized</Bold>. That is, the bytes that make up their memory are initialized to a bunch of zeros.</Item>
      </Itemize>

      <P>The second bullet point is helpful. It means that, if you <It>want</It> to create an array and initialize it with a bunch of zeros, aggregate initialization provides a simple way of doing that:</P>

      <CBlock fileName="zeroinitialization.c">{
`#include <stdio.h>

int main() {
        // Allocate an array of 1000 integers. Initialize the first
        // element to 0. The remaining 999 elements are then ALSO
        // initialized to zero because their values aren't specified
        // in the array initializer (the comma-separated list).
        int my_integers[1000] = {0};
}
`
      }</CBlock>

      <P>This works for more than just integers. If you replace <Code>int</Code> with <Code>float</Code> in the above program, it will create an array of 1000 floats, each with value <Code>0.0f</Code>.</P>

      <P>Even cooler: if you replace <Code>int</Code> with <Code>char</Code>, it will create an array of 1000 null terminators (remember: a null terminator is just a character whose encoded integral value is 0), which is particularly useful for creating an oversized buffer to represent a C string whose content might be decided, and even <It>extended</It>, later on. I'll show you an example of this in a bit.</P>

      <SectionHeading id="arrays-in-memory">Arrays in memory</SectionHeading>

      <P>As I said, arrays are contiguous in memory, meaning the elements are all packed tightly together, one after the other. More specifically, the elements of an array are arranged in memory in the order given by their indices.</P>

      <P>For example, suppose you have an array containing the integer values 27, 7, and -9. Suppose an single <Code>int</Code> occupies 4 bytes of memory (it does on the ENGR servers). Suppose the first element (27) has a memory address of <Code>0x00000004</Code>. In that case, the second element (7) will have a memory address of <Code>0x00000008</Code>. That is, the second element starts in memory immediately after the first element ends:</P>

      <Image src={ArrayMemoryDiagram} alt="27, 7, and -9 are arranged into an array. Their memory addresses are depicted." srcDarkMode={ArrayMemoryDiagramDarkMode} width={300}/>

      <P>Note: <Code>0x0000000C</Code> is 12, expressed in hexadecimal notation.</P>

      <P>The memory address of the very first element in an array has a special name: it's referred to as the array's <Bold>base address</Bold>. Moreover, the distance in bytes between a given element and the array's base address is referred to as the element's <Bold>offset</Bold>. For example, the third element in the above array (-9) has an offset of 8 because its memory address is exactly 8 greater than that of the array's base address (i.e., its starting point in memory is 8 bytes after the start of the array itself). By definition, this means that the offset of the first element in an array is always 0.</P>

      <P>Consider how you index an array to access its elements. To access the first element in an array named <Code>my_array</Code>, you'd write <Code>my_array[0]</Code>. To access the second element, you'd write <Code>my_array[1]</Code>. The index<Emdash/>the number between the square brackets<Emdash/>is actually the offset of the element that want you to access divided by the size of a single element in bytes. For example, the offset of the third element (-9) in the above diagram is 8, and its index is 2<Emdash/>that's 8 (the offset) divided by 4 (the size of a single <Code>int</Code> element in bytes).</P>

      <P>Indeed, when you write <Code>my_array[i]</Code> for some index <Code>i</Code>, the computer just conducts some very simple pointer arithemtic: it computes an offset by multiplying <Code>i</Code> by the size of a single element, and then it adds that offset to the base address. This produces a new memory address. It then dereferences that memory address (i.e., it goes to the place in memory located at that address) to retrieve (or modify) the value stored there.</P>

      <P>If all this talk of memory addresses reminds you of our lecture on <Link href={`${PARENT_PATH}/${allPathData["pointers"].pathName}`}>pointers</Link>, that's because it should. Arrays work entirely by pointer arithmetic.</P>

      <P>In fact, in many contexts, the name of an array will <It>decay</It> into a pointer. For example, an automatic array variable can be directly printed using a <Code>%p</Code> format specifier, just like a pointer. When you do that, it prints out the array's base address:</P>

      <CBlock fileName="baseaddress.c">{
`#include <stdio.h>

int main() {
        int my_array[] = {27, 7, -9};

        printf("%p\\n", my_array);
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o baseaddress baseaddress.c 
$ valgrind ./baseaddress 
==2091930== Memcheck, a memory error detector
==2091930== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2091930== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2091930== Command: ./baseaddress
==2091930== 
0x1ffefff9d4
==2091930== 
==2091930== HEAP SUMMARY:
==2091930==     in use at exit: 0 bytes in 0 blocks
==2091930==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==2091930== 
==2091930== All heap blocks were freed -- no leaks are possible
==2091930== 
==2091930== For lists of detected and suppressed errors, rerun with: -s
==2091930== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Apparently, the base address is <Code>0x1ffefff9d4</Code><Emdash/>not <Code>0x00000004</Code> as in the previous diagram (that was just an academic illustration). Let's additionally print out the memory addresses of the individual elements in the array just to explore the memory arrangement some more:</P>

      <CBlock fileName="baseaddress.c">{
`#include <stdio.h>

int main() {
        int my_array[] = {27, 7, -9};

        printf("%p\\n", my_array);

        // Print the memory addresses of each of the three elements.
        // Retreive these addresses using the address-of operator (&)
        printf("%p\\n", &(my_array[0]));
        printf("%p\\n", &(my_array[1]));
        printf("%p\\n", &(my_array[2]));
}`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o baseaddress baseaddress.c 
$ valgrind ./baseaddress 
==2095148== Memcheck, a memory error detector
==2095148== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2095148== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2095148== Command: ./baseaddress
==2095148== 
0x1ffefff9d4
0x1ffefff9d4
0x1ffefff9d8
0x1ffefff9dc
==2095148== 
==2095148== HEAP SUMMARY:
==2095148==     in use at exit: 0 bytes in 0 blocks
==2095148==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==2095148== 
==2095148== All heap blocks were freed -- no leaks are possible
==2095148== 
==2095148== For lists of detected and suppressed errors, rerun with: -s
==2095148== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Exactly as I said, the base address of the array is exactly equal to the memory address of the first element. Moreover, the memory address of the second element is exactly 4 greater than the base address (because each <Code>int</Code> is 4 bytes wide on the ENGR servers), and the memory address of the third element is 8 bytes greater than the base address.</P>

      <SectionHeading id="pointers-to-arrays">Pointers to arrays</SectionHeading>

      <P>Because an array often decays into its base address, and because array indexing is ultimately just a bunch of pointer arithmetic, C supports a very useful feature: if you have an explicit pointer variable that happens to store the base address of an array, you can index that pointer with square brackets <It>as if it were the array</It>.</P>

      <P>Here's your proof:</P>

      <CBlock fileName="pointerstoarrays.c">{
`#include <stdio.h>

int main() {
        int my_array[] = {27, 7, -9};

        // Store the array's base address in an integer pointer
        // (the array's name decays into the base address, so this
        // syntax works just fine)
        int* ptr = my_array;
        // Or, equivalently:
        // int* ptr = &(my_array[0]);

        // ptr, storing the base address of the array, points to the
        // first element in the array. Hence, dereferencing ptr gives
        // us the first element, 27
        printf("%d\\n", *ptr); // Prints 27

        // And, as stated, you can even use square brackets on ptr
        // as if it were my_array
        printf("%d\\n", ptr[0]); // Prints 27
        printf("%d\\n", ptr[1]); // Prints 7
        printf("%d\\n", ptr[2]); // Prints -9
}
`
      }</CBlock>

      <P>And here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o pointerstoarrays pointerstoarrays.c 
$ valgrind ./pointerstoarrays 
==2103072== Memcheck, a memory error detector
==2103072== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2103072== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2103072== Command: ./pointerstoarrays
==2103072== 
27
27
7
-9
==2103072== 
==2103072== HEAP SUMMARY:
==2103072==     in use at exit: 0 bytes in 0 blocks
==2103072==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==2103072== 
==2103072== All heap blocks were freed -- no leaks are possible
==2103072== 
==2103072== For lists of detected and suppressed errors, rerun with: -s
==2103072== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Let's go a step further. If you have a pointer in C, you can explicitly conduct pointer arithmetic on it. That's to say, you can add and subtract integers to and from pointers. There are some niche details in how it works, though. Suppose <Code>ptr</Code> is a pointer to a value of some type <Code>T</Code>, and suppose <Code>n</Code> is an integer. Then suppose you write the expression <Code>ptr + n</Code>. When the program arrives at that expression, you might <It>think</It> that it just adds the value of <Code>n</Code> to the memory address stored in <Code>ptr</Code>, but that's not quite right. Instead, it first multiplies the integer <Code>n</Code> by the size of a single <Code>T</Code> value. For example, if <Code>ptr</Code> is of type <Code>int*</Code>, then the program will multiply <Code>n</Code> by the size of a single <Code>int</Code> value (which is 4 on the ENGR servers). It then takes that product and adds <It>it</It> to the memory address stored in <Code>ptr</Code>.</P>

      <P>For example, suppose <Code>ptr</Code> stores the memory address <Code>0x00000004</Code>, and suppose it's specifically of type <Code>int*</Code> (i.e., it points to an integer). Since <Code>int</Code> values are allocated 4 bytes each on the ENGR servers, the expression <Code>ptr + 1</Code> would evaluate to <Code>0x00000004 + (1 * 4) = 0x00000008</Code>.</P>

      <P>That's to say, adding <Code>n</Code> to a pointer essentially shifts over by <Code>n</Code> "spaces" in memory, where a "space" is the size in bytes of the type of object that the pointer points to. Hence, if the pointer points to an <Code>int</Code>, and an <Code>int</Code> is 4 bytes, then adding 1 to the pointer will shift over by 4 bytes. Similarly, adding 2 to the pointer will shift over by 8 bytes. And so on.</P>

      <P>Here's a program to demonstrate:</P>

      <CBlock fileName="pointerarithmetic.c">{
`#include <stdio.h>

int main() {
        int my_array[] = {27, 7, -9};

        int* ptr = my_array;

        printf("%p\\n", ptr);
        printf("%p\\n", ptr + 1);
        printf("%p\\n", ptr + 2);
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o pointerarithmetic pointerarithmetic.c 
$ valgrind ./pointerarithmetic 
==2109857== Memcheck, a memory error detector
==2109857== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2109857== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2109857== Command: ./pointerarithmetic
==2109857== 
0x1ffefff9cc
0x1ffefff9d0
0x1ffefff9d4
==2109857== 
==2109857== HEAP SUMMARY:
==2109857==     in use at exit: 0 bytes in 0 blocks
==2109857==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==2109857== 
==2109857== All heap blocks were freed -- no leaks are possible
==2109857== 
==2109857== For lists of detected and suppressed errors, rerun with: -s
==2109857== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>(For context, <Code>0x1ffefff9cc</Code> is exactly 4 less than <Code>0x1ffefff9d0</Code>, which is 4 less than <Code>0x1ffefff9d4</Code>).</P>

      <P>What does this have to do with arrays? Well, if you think very carefully about everything I've just told you, you might realize something: if you have an array called <Code>my_array</Code>, then the memory address computed from the expression <Code>my_array + n</Code> is exactly equal to memory address computed from the expression <Code>&(my_array[n])</Code>. That's to say, <Code>my_array + n</Code> is the memory address of the element in the array at index <Code>n</Code>. Hence, dereferencing that memory address will give you the element at index <Code>n</Code>:</P>

      <CBlock fileName="pointerarithmetic.c">{
`#include <stdio.h>

int main() {
        int my_array[] = {27, 7, -9};

        int* ptr = my_array;

        printf("%p\\n", ptr);
        printf("%p\\n", ptr + 1);
        printf("%p\\n", ptr + 2);

        // These three lines of code are equivalent. They all print 7
        printf("%d\\n", my_array[1]);
        printf("%d\\n", ptr[1]);
        printf("%d\\n", *(ptr + 1));
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o pointerarithmetic pointerarithmetic.c
$ valgrind ./pointerarithmetic 
==2113426== Memcheck, a memory error detector
==2113426== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2113426== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2113426== Command: ./pointerarithmetic
==2113426== 
0x1ffefff9cc
0x1ffefff9d0
0x1ffefff9d4
7
7
7
==2113426== 
==2113426== HEAP SUMMARY:
==2113426==     in use at exit: 0 bytes in 0 blocks
==2113426==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==2113426== 
==2113426== All heap blocks were freed -- no leaks are possible
==2113426== 
==2113426== For lists of detected and suppressed errors, rerun with: -s
==2113426== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>
      
      <P>Earlier, I said that if a pointer points to an array, then you can index it with square brackets as if it were that array. But actually, you can index <It>any</It> pointer with square brackets as if it were an array. Indeed, all the subscript operator (<Code>[]</Code>) does when used on a pointer is this: it multiplies the given index by the size of the type of object that the pointer points to, and then it adds that product to the memory address stored in the pointer. Finally, it dereferences the computed address to retrieve the underlying value.</P>

      <P>This is useful. For example, suppose you have an array of 10 characters named <Code>str</Code>. Then suppose you initialize <Code>char* ptr = str + 3</Code><Emdash/>a pointer to the fourth character in the array. If you were to index <Code>ptr</Code> with square brackets, supplying an index of 0 would give you the fourth element in the array (because <Code>ptr[0]</Code> is equivalent to <Code>*ptr</Code>). Supplying an index of 1 would give you the fifth element in the array (because <Code>ptr[1]</Code> is equivalent to <Code>*(ptr + 1)</Code>). And so on. This can be used for, say, extracting substrings from a larger C string (among other things). Here's a demonstration:</P>

      <CBlock fileName="substring.c">{
`#include <stdio.h>

int main() {
        // An array of 6 characters
        char str[] = {'H', 'e', 'l', 'l', 'o', '\\0'};

        // ptr points to the fourth character (the second 'l' in Hello)
        char* ptr = str + 3;

        // Hence, ptr[0] is l (by the way, %c is the format specifier
        // for individual characters)
        printf("%c\\n", ptr[0]); // prints l
        // Or, equivalently:
        // printf("%c\\n", *ptr);

        // But also, ptr[1] is whatever comes after that, which in
        // this case is the 'o' in hello
        printf("%c\\n", ptr[1]); // prints o

        // To be clear, ptr is not an array of characters. It's just
        // a pointer. However, it can be TREATED like an array of
        // characters. It points to an 'l'. Immediately after that is an
        // 'o', followed by a null terminator. That is, you can think of
        // it as if it were an array of three characters:
        // 'l', 'o', '\\0'
        // You can think of it like that, but you can also USE it like
        // that. Indeed, ptr itself can be used as a valid C string.
        printf("%s\\n", ptr); // Prints lo

        // Suppose I want to print out the 2nd through 4th characters
        // in str (which would be "ell"). First, overwrite the 5th
        // character with a null terminator so that the string's content
        // ends with the 4th character:
        str[4] = '\\0';

        // Now, simply print out all the content starting with the 2nd
        // character
        printf("%s\\n", str + 1);
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o substring substring.c 
$ valgrind ./substring 
==2129586== Memcheck, a memory error detector
==2129586== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2129586== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2129586== Command: ./substring
==2129586== 
l
o
lo
ell
==2129586== 
==2129586== HEAP SUMMARY:
==2129586==     in use at exit: 0 bytes in 0 blocks
==2129586==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==2129586== 
==2129586== All heap blocks were freed -- no leaks are possible
==2129586== 
==2129586== For lists of detected and suppressed errors, rerun with: -s
==2129586== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>This trick<Emdash/>adding an index to a C string's base address to "skip past" the first few characters and extract a substring<Emdash/>is extremely common.</P>

      <P>Make sure you have a good grasp on pointer arithmetic, base addresses, and offsets. These things are fundamental when working with arrays in C.</P>

      <SectionHeading id="more-on-c-strings">More on C strings</SectionHeading>

      <P>Consider the following line of code:</P>

      <CBlock showLineNumbers={false}>{
`const char* sentence = "Hello, World!";`
      }</CBlock>

      <P>Recall that when the program first starts, it will create and populate a null-terminated character array in the read-only section of the process's data segment to represent each string literal used throughout the entire program. Then, when the above line of code is encountered, <Code>sentence</Code> is simply initialized to store the base address of that character array.</P>

      <P>As we just discussed, if you have a pointer that stores the base address of an array, then you can generally treat that pointer as if it were the array. For example, you could access and print a single character from the above C string like so:</P>

      <CBlock fileName="printstringchar.c">{
`#include <stdio.h>

int main() {
        const char* sentence = "Hello, World!";

        // Print the first character of the string (%c is the format
        // specifier for a single character)
        printf("%c\\n", sentence[0]);

        // Print the fifth character
        printf("%c\\n", sentence[4]);

        // Print every character until the null terminator (equivalent
        // to printf("%s", sentence))
        int i = 0;
        while (sentence[i] != '\\0') {
                printf("%c", sentence[i]);
                ++i;
        }
        printf("\\n");
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o printstringchar printstringchar.c 
$ valgrind ./printstringchar
==3835973== Memcheck, a memory error detector
==3835973== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==3835973== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==3835973== Command: ./printstringchar
==3835973== 
H
o
Hello, World!
==3835973== 
==3835973== HEAP SUMMARY:
==3835973==     in use at exit: 0 bytes in 0 blocks
==3835973==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==3835973== 
==3835973== All heap blocks were freed -- no leaks are possible
==3835973== 
==3835973== For lists of detected and suppressed errors, rerun with: -s
==3835973== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Importantly, remember that character arrays representing C strings such as the above are stored in the <Ul>read-only</Ul> section of the data segment of the process's memory, meaning that attempting to modify any of the characters contained within them results in undefined behavior (hence why we use <Code>const char*</Code> instead of <Code>char*</Code>, turning that undefined behavior into a syntax error instead).</P>

      <P>Suppose you want to create a C string whose characters <It>can</It> be modified. To do that, simply create an array of characters directly (e.g., <Code>char sentence[128]</Code>). You can then proceed to modify the contained characters however you'd like.</P>

      <P>Of course, modifying characters in an array one at a time just to construct a C string sounds like a lot of work. It's also error-prone; if you forget to manually put in a null terminator, your character array won't be a valid C string, and passing it to various string functions (e.g., <Code>strlen</Code>) will invoke undefined behavior. Luckily, C provides a special syntax that makes it easy to initialize the elements of an automatic (stack-allocated, modifiable) character array to the contents of a string literal, complete with a null terminator:</P>

      <SyntaxBlock>{
`char <name>[<size>] = "<contents>";`
      }</SyntaxBlock>

      <P>The <Code>{'<size>'}</Code> is actually optional, just as with aggregate initialization. If the size is omitted, the program will automatically make the array large enough to store the contents of the string literal followed by at least one null terminator (and it will indeed populate it with those characters, including the null terminator). Otherwise, the size of the array will match the specified size, in which case the specified size <Ul>must</Ul> be large enough to store the contents of the specified C string plus at least one null terminator. If the size is specified, but it's too small to store the contents of the C string plus at least one null terminator, undefined behavior ensues.</P>

      <P>(Technically, if <Code>{'<size>'}</Code> is exactly equal to the length of the string's contents, meaning there just <It>barely</It> isn't enough room to fit a null terminator, the behavior is still well-defined: it simply creates a character array containing the contents of the string <Ul>without</Ul> a null terminator at the end. Such a character array is <Ul>not</Ul> a proper C string, so proceeding to treat it like a C string (e.g., pass it to various functions provided by <Code>string.h</Code> will typically invoke undefined behavior due to a buffer over-read / overflow.)</P>

      <P>Here's an example program:</P>

      <CBlock fileName="modifiablecstring.c">{
`#include <stdio.h>

int main() {
        // sentence1's characters are NOT modifiable!
        const char* sentence1 = "Hello, World!";

        // However, sentence2's characters ARE modifiable!
        //char sentence2[] = "Hello, World!";

        // The number of characters in the sentence2 array is AT LEAST
        // 14---large enough to store the characters of "Hello, World!"
        // followed by a null terminator. It may be larger than that,
        // but don't count on it. Attempting to access an element of the
        // array at an index greater than or equal to 14 may invoke
        // undefined behavior.

        // You may optionally put a size in between the square brackets
        // above, but it MUST be at least 14. e.g.:
        // char sentence2[14] = "Hello, World!";
        // 
        // If you want, you can make sentence2 bigger than necessary.
        // This will give it extra "buffer" characters, making it easy
        // to expand its contents to represent longer strings later on.
        // char sentence2[100] = "Hello, World!";

        // sentence2, being a regular automatic stack-allocated array,
        // is modifiable:
        sentence2[0] = 'J';
        sentence2[5] = ' ';
        printf("%s\\n", sentence2); // Prints "Jello  World!"
}`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -o modifiablecstring modifiablecstring.c 
$ valgrind ./modifiablecstring 
==3837892== Memcheck, a memory error detector
==3837892== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==3837892== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==3837892== Command: ./modifiablecstring
==3837892== 
Jello  World!
==3837892== 
==3837892== HEAP SUMMARY:
==3837892==     in use at exit: 0 bytes in 0 blocks
==3837892==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==3837892== 
==3837892== All heap blocks were freed -- no leaks are possible
==3837892== 
==3837892== For lists of detected and suppressed errors, rerun with: -s
==3837892== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Now, I said earlier that zero-initialization can be used to create an array of null terminators<Emdash/>an empty C string that can be "extended" later on. Here's a simple example of that:</P>

      <CBlock fileName="zeroinitialization.c">{
`#include <stdio.h>

int main() {
        // Allocate an array of 1000 null terminators
        // (an "empty string")
        char my_string[1000] = {0};

        // Replace the first element with 'H'. The array is now an 'H'
        // followed by 999 null terminators. That is, it represents the
        // string "H".
        my_string[0] = 'H';

        // This prints an H to the terminal, followed by \\n
        printf("%s\\n", my_string);

        // Add an 'e' after the 'H'
        my_string[1] = 'e';

        // This prints He to the terminal, followed by \\n
        printf("%s\\n", my_string);

        // And so on...

        // my_string can be extended to up to 999 characters of content
        // (the 1000th character must be reserved for a null terminator
        // since every C string must have at least one null terminator)
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o zeroinitialization zeroinitialization.c 
$ valgrind ./zeroinitialization 
==2037308== Memcheck, a memory error detector
==2037308== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2037308== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2037308== Command: ./zeroinitialization
==2037308== 
H
He
==2037308== 
==2037308== HEAP SUMMARY:
==2037308==     in use at exit: 0 bytes in 0 blocks
==2037308==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==2037308== 
==2037308== All heap blocks were freed -- no leaks are possible
==2037308== 
==2037308== For lists of detected and suppressed errors, rerun with: -s
==2037308== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Indeed, if you know how to work with arrays, you can do just about anything you want with C strings. That said, there are lots of powerful functions provided by <Code>{'<string.h>'}</Code> that can do all sorts of things with C strings with very little effort on your part, so no need to reinvent the wheel. We'll cover these functions later.</P>

      <SectionHeading id="buffer-overflows">Buffer over-reads and overflows</SectionHeading>

      <P>A <Bold>buffer over-read</Bold> is the name of the error that occurs when you attempt to read (use) a value from an array at an out-of-bounds index. Similarly, a <Bold>buffer overflow</Bold> is the name of the error that occurs when you attempt to write (modify) a value in an array at an out-of-bounds index. Both buffer over-reads and buffer overflows invoke undefined behavior.</P>

      <P>Here's an illustration:</P>

      <CBlock fileName="bufferoverflow.c">{
`#include <stdio.h>

int main() {
        float values[] = {5.7, -1.2, 41.5};

        // values has 3 elements. That means the valid indices are
        // 0, 1, and 2.

        // Hence, this is a buffer over-read
        printf("%f\\n", values[3]); // values doesn't have a 4th element

        // These are also buffer over-reads
        printf("%f\\n", values[4]);
        printf("%f\\n", values[100]);
        printf("%f\\n", values[-1]);

        // This is a buffer overflow
        values[3] = -12.7;
}
`
      }</CBlock>

      <P>The above program invokes all sorts of undefined behavior, so it's hard to predict what it'll do when you run it. Valgrind will (hopefully) print out many error messages. Here's what it did for me (it might be different for you):</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o bufferoverflow bufferoverflow.c 
$ valgrind ./bufferoverflow 
==2146148== Memcheck, a memory error detector
==2146148== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2146148== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2146148== Command: ./bufferoverflow
==2146148== 
0.000000
0.000000
0.000000
==2146148== Conditional jump or move depends on uninitialised value(s)
==2146148==    at 0x48CE1C8: __printf_fp_l (in /usr/lib64/libc.so.6)
==2146148==    by 0x48D904F: __vfprintf_internal (in /usr/lib64/libc.so.6)
==2146148==    by 0x48CD86E: printf (in /usr/lib64/libc.so.6)
==2146148==    by 0x4011EF: main (bufferoverflow.c:15)
==2146148== 
==2146148== Conditional jump or move depends on uninitialised value(s)
==2146148==    at 0x48CE1E2: __printf_fp_l (in /usr/lib64/libc.so.6)
==2146148==    by 0x48D904F: __vfprintf_internal (in /usr/lib64/libc.so.6)
==2146148==    by 0x48CD86E: printf (in /usr/lib64/libc.so.6)
==2146148==    by 0x4011EF: main (bufferoverflow.c:15)
==2146148== 
==2146148== Conditional jump or move depends on uninitialised value(s)
==2146148==    at 0x48C95AA: __mpn_extract_double (in /usr/lib64/libc.so.6)
==2146148==    by 0x48CE486: __printf_fp_l (in /usr/lib64/libc.so.6)
==2146148==    by 0x48D904F: __vfprintf_internal (in /usr/lib64/libc.so.6)
==2146148==    by 0x48CD86E: printf (in /usr/lib64/libc.so.6)
==2146148==    by 0x4011EF: main (bufferoverflow.c:15)
==2146148== 
==2146148== Conditional jump or move depends on uninitialised value(s)
==2146148==    at 0x48CE4D6: __printf_fp_l (in /usr/lib64/libc.so.6)
==2146148==    by 0x48D904F: __vfprintf_internal (in /usr/lib64/libc.so.6)
==2146148==    by 0x48CD86E: printf (in /usr/lib64/libc.so.6)
==2146148==    by 0x4011EF: main (bufferoverflow.c:15)

[Hundreds of more errors omitted for brevity]
`
      }</TerminalBlock>

      <P>Notice that <Code>gcc</Code> didn't detect <It>any</It> issues, even with <Code>-Wall</Code>. However, Valgrind detected all sorts of errors. Valgrind's error messages are useful. For some of them, it might be a bit hard to figure out exactly what they're trying to tell you. But at the very least, they tell you that you've committed some sort of egregious memory safety error, and they provide a line number pointing you to the line of code in which it occurred. <Ul>Never</Ul> ignore these error messages.</P>

      <P>Keep in mind that this is an instance of undefined behavior. If you run the program again, it might do something slightly different. In this case, the program just printed out a bunch of 0's and error messages. But next time (especially if I run it on a different platform, or in a different environment such as outside of Valgrind's context), it might crash due to a <Bold>segmentation fault</Bold>. Recall that a segmentation fault can occur whenever you try to access memory at an invalid location. It shouldn't be surprising that accessing memory beyond the bounds of your allocated array can cause such an error.</P>

      <P>You have to be especially careful when conducting pointer arithmetic. In the above program, <Code>values</Code> is an array of 3 elements, and <Code>values + 2</Code> would point to the third element. However, <Code>values + 3</Code> would point to the non-existent fourth element; attempting to dereference such a pointer would invoke undefined behavior. Similarly, if <Code>ptr</Code> stores the memory address <Code>values + 2</Code>, then <Code>ptr[0]</Code> would be valid (it'd be the third and final element of <Code>values</Code>), but <Code>ptr[1]</Code> would be invalid.</P>

      <P>Not only do buffer over-reads and overflows invoke undefined behavior, but they're a particularly dangerous sort of undefined behavior. In most cases, a buffer overflow causes your program to reach beyond the bounds of the array and mess with other values in memory. Those other values could belong to other variables, or they might be used by the program for other purposes. If a malicious actor knows about your program's buffer overflow issue, they might be able to exploit it to coerce your program to mess with memory in ways that it shouldn't. In a particularly bad case, the attacker might be able to get your program to write arbitrary bytecode into memory, and then jump to that bytecode and begin executing it as a sequence of instructions (i.e., the attacker might be able to get your program to do whatever they want it to do). This is known as an <Bold>arbitrary code execution (ACE) exploit</Bold>, and it's a massive security issue.</P>

      <P>(If you're a gamer and remember the Dark Souls franchise going offline for quite some time back in 2022, it was due to a stack-smashing buffer overflow that introduced an ACE exploit in the matchmaking service. The whole franchise of games was taken offline until the bug could be patched, to prevent a malicious actor from exploiting it and causing serious harm to players).</P>

      <P>Buffer over-reads can also be massively problematic. Generally, they cause the program to reach beyond the bounds of the array and retrieve other values in memory, possibly belonging to other variables. In some cases, an attacker might be able to exploit one to get your program to print out or otherwise expose some private information that's stored in the program's memory.</P>

      <P>(If you're familiar with the infamous <Link href="https://www.heartbleed.com/">HeartBleed Bug</Link>, or the more recent <Link href="https://en.wikipedia.org/wiki/MongoDB#:~:text=MongoBleed">MongoBleed bug</Link>, they were both due to buffer over-reads).</P>

      <SectionHeading id="passing-arrays-to-functions">Passing arrays to functions</SectionHeading>
      
      <P>Arrays can be passed to functions (sort of... there's a caveat to that statement, as we'll soon learn). The common syntax for declaring an array parameter is the same as the syntax for declaring a regular automatic array variable, except the array's size can optionally be omitted, leaving the square brackets empty. Actually, if a size <It>is</It> a specified in the array parameter declaration, it's largely <Ul>ignored</Ul> by the compiler. Maybe this makes sense. A function that operates on arrays should be able to work with arrays of various sizes; the size should not have to be specified in the parameter declaration.</P>

      <P>That said, a function that receives an array as an input will most likely still need to know the size of that array <It>somehow</It> (e.g., in order to iterate through the elements and stop when it reaches the end), so it's usually received as an additional parameter. The type of that additional parameter should be <Code>size_t</Code>, which is similar to <Code>int</Code> and <Code>long</Code> (etc) except it's specifically designed to store sizes of objects and arrays (and is guaranteed to be capable of storing the size of any possible object).</P>

      <P>Here's an example:</P>

      <CBlock fileName="arrayinfunction.c">{
`#include <stdio.h>

// Notice: The size is omitted in the square brackets and instead
// received as an additional size_t parameter.
void print_numbers(double numbers[], size_t array_size) {
        for (int i = 0; i < array_size; ++i) {
                printf("%.2f", numbers[i]);
                if (i < array_size - 1) {
                        // Print a comma between each value
                        printf(", ");
                }
        }
        printf("\\n");
}
`
      }</CBlock>

      <P>To call this function, simply provide an array of <Code>double</Code> values as the first argument, and the number of elements in that array as the second argument:</P>

      <CBlock fileName="arrayinfunction.c" highlightLines="{16-19}">{
`#include <stdio.h>

// Notice: The size is omitted in the square brackets and instead
// received as an additional size_t parameter.
void print_numbers(double numbers[], size_t array_size) {
        for (int i = 0; i < array_size; ++i) {
                printf("%.2f", numbers[i]);
                if (i < array_size - 1) {
                        // Print a comma between each value
                        printf(", ");
                }
        }
        printf("\\n");
}

int main() {
        double my_numbers[] = {3.14, 9.81, -7.2};
        print_numbers(my_numbers, 3);
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o arrayinfunction arrayinfunction.c
$ valgrind ./arrayinfunction
==360780== Memcheck, a memory error detector
==360780== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==360780== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==360780== Command: ./arrayinfunction
==360780== 
3.14, 9.81, -7.20
==360780== 
==360780== HEAP SUMMARY:
==360780==     in use at exit: 0 bytes in 0 blocks
==360780==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==360780== 
==360780== All heap blocks were freed -- no leaks are possible
==360780== 
==360780== For lists of detected and suppressed errors, rerun with: -s
==360780== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>The size that's passed as the second argument doesn't technically need to <It>actually</It> be the array's size. If you want, it could be smaller than the array's size. For example, we could pass <Code>2</Code> instead of <Code>3</Code>. That would cause the program to just print the first two values in the array. However, the size passed as the second argument cannot be <It>larger</It> than the actual size of the array, as that would cause a buffer over-read in the <Code>for</Code> loop within the <Code>print_numbers</Code> function, invoking undefined behavior.</P>

      <CBlock fileName="arrayinfunction.c" highlightLines="{20-24}">{
`#include <stdio.h>

// Notice: The size is omitted in the square brackets and instead
// received as an additional size_t parameter.
void print_numbers(double numbers[], size_t array_size) {
        for (int i = 0; i < array_size; ++i) {
                printf("%.2f", numbers[i]);
                if (i < array_size - 1) {
                        // Print a comma between each value
                        printf(", ");
                }
        }
        printf("\\n");
}

int main() {
        double my_numbers[] = {3.14, 9.81, -7.2};
        print_numbers(my_numbers, 3);

        // Print just the first two values from the array
        print_numbers(my_numbers, 2);

        // This would cause a buffer over-read. DON'T do this!!!
        // print_numbers(my_numbers, 4);
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o arrayinfunction arrayinfunction.c
$ valgrind ./arrayinfunction
==360780== Memcheck, a memory error detector
==360780== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==360780== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==360780== Command: ./arrayinfunction
==360780== 
3.14, 9.81, -7.20
3.14, 9.81
==360780== 
==360780== HEAP SUMMARY:
==360780==     in use at exit: 0 bytes in 0 blocks
==360780==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==360780== 
==360780== All heap blocks were freed -- no leaks are possible
==360780== 
==360780== For lists of detected and suppressed errors, rerun with: -s
==360780== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Recall that an array's name often decays into the array's base address. Perhaps it doesn't surprise you, then, that when calling the <Code>print_numbers</Code> function above, it's legal to pass a <Code>double</Code> <It>pointer</It> for the first argument instead of a <Code>double</Code> <It>array</It>. For example, if you had a pointer <Code>ptr</Code> that stored the base address of <Code>my_numbers</Code>, then you could pass it as an alternative to <Code>my_numbers</Code>. Moreover, we could pass a pointer that points to some element in the <It>middle</It> of the array and adjust the size argument accordingly, allowing us to print just a "slice" of the array:</P>

      <CBlock fileName="arrayinfunction.c" highlightLines="{26-32}">{
`#include <stdio.h>

// Notice: The size is omitted in the square brackets and instead
// received as an additional size_t parameter.
void print_numbers(double numbers[], size_t array_size) {
        for (int i = 0; i < array_size; ++i) {
                printf("%.2f", numbers[i]);
                if (i < array_size - 1) {
                        // Print a comma between each value
                        printf(", ");
                }
        }
        printf("\\n");
}

int main() {
        double my_numbers[] = {3.14, 9.81, -7.2};
        print_numbers(my_numbers, 3);

        // Print just the first two values from the array
        print_numbers(my_numbers, 2);

        // This would cause a buffer over-read. DON'T do this!!!
        // print_numbers(my_numbers, 4);

        // Print just 2 values, starting from the second element
        // (9.81, -7.2)
        double* ptr = my_numbers + 1; // Points to the 2nd element, 9.81
        print_numbers(ptr, 2);

        // This would cause a buffer over-read. DON'T do this!!!
        // print_numbers(ptr, 3);
}`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o arrayinfunction arrayinfunction.c
$ valgrind ./arrayinfunction
==360780== Memcheck, a memory error detector
==360780== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==360780== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==360780== Command: ./arrayinfunction
==360780== 
3.14, 9.81, -7.20
3.14, 9.81
9.81, -7.20
==360780== 
==360780== HEAP SUMMARY:
==360780==     in use at exit: 0 bytes in 0 blocks
==360780==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==360780== 
==360780== All heap blocks were freed -- no leaks are possible
==360780== 
==360780== For lists of detected and suppressed errors, rerun with: -s
==360780== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>But actually, the reverse is also true. If a function has a pointer parameter, it's legal to pass an appropriately typed array as the corresponding argument. For example, we could change the above function's signature to the following:</P>

      <CBlock showLineNumbers={false}>{
`void print_numbers(double* numbers, size_t array_size)`
      }</CBlock>

      <P>When calling the function, we could then pass <Code>ptr</Code> as above, or we could pass <Code>my_numbers</Code> as we originally did. This would not modify the behavior of the function, nor the program in general, whatsoever. When the function starts, it simply assumes that <Code>numbers</Code> stores the base address of an array and treats it accordingly.</P>

      <P>That's to say, it doesn't matter whether a parameter is declared using the array-style syntax (e.g., <Code>double numbers[]</Code>) or pointer syntax (e.g., <Code>double* numbers</Code>), and when calling a function, it doesn't matter whether you pass an array directly (such as <Code>my_numbers</Code>) or a pointer that stores the base address of an array (such as <Code>ptr</Code>). All of these things make no difference; they all produce the same result.</P>

      <P>The reason for this is quite simple: array parameters do not <It>really</It> exist, and arrays cannot <It>really</It> be passed to functions. Rather, an array-style parameter, such as <Code>double numbers[]</Code>, is <It>actually</It> just an alternative syntax for a pointer parameter. When you supply an array as a corresponding argument in a function call, that array itself is not <It>actually</It> passed to the function. Rather, it decays into its base address, which is then stored inside the parameter.</P>

      <P>To be clear, arrays are not pointers, and pointers are not arrays. Rather, array <It>parameters</It> simply do not exist; attempting to create an array parameter actually just results in a pointer parameter; and attempting to pass an array to a function actually just passes the array's base address to the function.</P>

      <P>This has very important implications. Recall that a function can dereference a pointer parameter so as to access the underlying value that that pointer points to, which could potentially be a variable in a different function:</P>

      <CBlock fileName="accessingarguments.c">{
`#include <stdio.h>

void change_to_100(int* p) {
        *p = 100;
}

int main() {
        int x = 5;
        change_to_100(&x);
        printf("The value of x is: %d\\n", x);
}
`
      }</CBlock>

      <P>The above <Code>main</Code> function passes the memory address of <Code>x</Code> to the <Code>change_to_100</Code> function. That memory address is copied and stored inside <Code>p</Code>, which is then dereferenced to change the underlying value (that of <Code>x</Code>) to 100. The program then prints 100.</P>

      <P>Because array parameters are really just pointers, and because array arguments always decay into their base addresses, <Ul>the same principle applies when passing arrays to functions</Ul>. That is, when a function reaches inside its array parameter and modifies the values of its elements, that also modifies the corresponding elements in the array that was provided as the corresponding argument:</P>

      <CBlock fileName="modifyarrayinfunction.c">{
`#include <stdio.h>

void change_values(int values[]) {
        // Change the 2nd element to 7 (requires the array to have
        // at least 2 elements in it, else a buffer overflow will occur)
        values[1] = 7;
}

int main() {
        int my_numbers[3] = {1, 12, -4};

        change_values(my_numbers);
        printf("%d\\n", my_numbers[1]); // Prints 7
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o modifyarrayinfunction modifyarrayinfunction.c 
$ valgrind ./modifyarrayinfunction 
==363694== Memcheck, a memory error detector
==363694== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==363694== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==363694== Command: ./modifyarrayinfunction
==363694== 
7
==363694== 
==363694== HEAP SUMMARY:
==363694==     in use at exit: 0 bytes in 0 blocks
==363694==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==363694== 
==363694== All heap blocks were freed -- no leaks are possible
==363694== 
==363694== For lists of detected and suppressed errors, rerun with: -s
==363694== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>As we discussed, the subscript operator (i.e., square brackets) simply goes to an array's base address (or the address stored in a pointer), shifts over by a number of "spaces" equal to the specified index (where a "space" is the size of a single element in bytes), and accesses whatever data is stored there. That's to say, the subscript operator dereferences memory addresses, just like the dereference operator<Emdash/>it goes to a place in memory specified by some address, and it accesses the underlying data stored there. This is why modifying an element of <Code>values</Code> also modifies the corresponding element of <Code>my_numbers</Code> in the above program. There's really only one arrayin the above program: <Code>my_numbers</Code>. The parameter, <Code>values</Code>, is not an array, but rather a pointer to <Code>my_numbers</Code>.</P>

      <SectionHeading id="sizeof"><Code>sizeof</Code></SectionHeading>

      <P>In C, the builtin <Code>sizeof()</Code> operator can be used to determine the size of something in bytes. In between the parentheses, you may write either a) a type, or b) an expression. If a type is provided, then <Code>sizeof</Code> will simply return the size of a single object of that type, in bytes (e.g., <Code>sizeof(int)</Code> yields 4 on the ENGR servers since, on the ENGR servers, each <Code>int</Code> is allocated 4 bytes of space). If an expression is provided, then <Code>sizeof</Code> will determine the type of that expression, and then it will yield the size of that type, in bytes (e.g., <Code>sizeof(1000 * 7)</Code> also yields 4 on the ENGR servers since <Code>1000 * 7</Code> is an <Code>int</Code> value, and <Code>int</Code> objects occupy 4 bytes each on the ENGR servers).</P>

      <P>Note: when the <Code>sizeof</Code> operator is given an expression, it usually doesn't actually evaluate that expression. Rather, it only determines the expression's <It>type</It>, and it does this at compile time<Emdash/>not runtime. This means that expressions given to the <Code>sizeof</Code> operator will never produce side effects (e.g., <Code>sizeof(++i)</Code> doesn't actually increment <Code>i</Code>). There are some niche exceptions to this rule, though, such as when the expression contains VLAs.</P>

      <P>When an automatic array is provided directly to the <Code>sizeof</Code> operator, it will return the size of the <Ul>entire array</Ul>, in bytes. <Ul>However</Ul>, when a pointer storing the base address of an array (even an automatic array) is provided to the <Code>sizeof</Code> operator, it will simply return the size of a pointer, which is always 8 on the ENGR servers (and on basically any other 64-bit system):</P>

      <CBlock fileName="sizeof.c">{
`#include <stdio.h>

int main() {
        // Note: %ld is used as format specifier for size_t values
        // (similar to long int values), which is the type of value
        // returned by sizeof
        printf("%ld\\n", sizeof(int)); // Prints 4 on the ENGR servers
        printf("%ld\\n", sizeof(1000)); // Prints 4 on the ENGR servers

        int values[20] = {0};
        // Prints 80 on the ENGR servers (20 integers, each with 4 bytes
        // of storage)
        printf("%ld\\n", sizeof(values));

        int* array = values;
        printf("%ld\\n", sizeof(array)); // Prints 8 on the ENGR servers

        const char* str = "Hello";
        printf("%ld\\n", sizeof(str)); // Prints 8 on the ENGR servers
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o sizeof sizeof.c 
$ valgrind ./sizeof 
==3864231== Memcheck, a memory error detector
==3864231== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==3864231== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==3864231== Command: ./sizeof
==3864231== 
4
4
80
8
8
==3864231== 
==3864231== HEAP SUMMARY:
==3864231==     in use at exit: 0 bytes in 0 blocks
==3864231==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==3864231== 
==3864231== All heap blocks were freed -- no leaks are possible
==3864231== 
==3864231== For lists of detected and suppressed errors, rerun with: -s
==3864231== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Moreover, because an array parameter is <It>really</It> just a pointer that stores the base address of its given array argument, array parameters are treated exactly like pointers when supplied to the <Code>sizeof</Code> operator. That is, if <Code>arr</Code> is an array parameter, then <Code>sizeof(arr)</Code> will always return 8 on the ENGR servers. This is even the case when a hardcoded size is specified in the array parameter's declaration (as I said, such sizes are largely ignored by the compiler):</P>

      <CBlock fileName="sizeof.c" highlightLines="{2-13}">{
`#include <stdio.h>

void foo1(int arr[]) {
        printf("%ld\\n", sizeof(arr)); // Prints 8 on the ENGR servers
}

void foo2(int arr[20]) {
        // Prints 8 on the ENGR servers, even though the size is
        // explicitly specified as 20 in the parameter (remember:
        // this size is largely ignored by the compiler; the parameter
        // is really just treated as a pointer)
        printf("%ld\\n", sizeof(arr));
}

int main() {
        // Note: %ld is used as format specifier for size_t values
        // (similar to long int values), which is the type of value
        // returned by sizeof
        printf("%ld\\n", sizeof(int)); // Prints 4 on the ENGR servers
        printf("%ld\\n", sizeof(1000)); // Prints 4 on the ENGR servers

        int values[20] = {0};
        // Prints 80 on the ENGR servers (20 integers, each with 4 bytes
        // of storage)
        printf("%ld\\n", sizeof(values));

        int* array = values;
        printf("%ld\\n", sizeof(array)); // Prints 8 on the ENGR servers

        const char* str = "Hello";
        printf("%ld\\n", sizeof(str)); // Prints 8 on the ENGR servers

        foo1(values); // Prints 8 on the ENGR servers
        foo2(values); // Prints 8 on the ENGR servers
}
`
      }</CBlock>

      <P>Because many programmers often forget that using <Code>sizeof</Code> on an array parameter always just retrieves the size of a pointer, the compiler will even issue a warning to remind you. Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o sizeof sizeof.c 
sizeof.c: In function ‘foo1’:
sizeof.c:4:31: warning: ‘sizeof’ on array function parameter ‘arr’ will return size of ‘int *’ [-Wsizeof-array-argument]
    4 |         printf("%ld\\n", sizeof(arr)); // Prints 8 on the ENGR servers
      |                               ^
sizeof.c:3:15: note: declared here
    3 | void foo1(int arr[]) {
      |           ~~~~^~~~~
sizeof.c: In function ‘foo2’:
sizeof.c:12:31: warning: ‘sizeof’ on array function parameter ‘arr’ will return size of ‘int *’ [-Wsizeof-array-argument]
   12 |         printf("%ld\\n", sizeof(arr));
      |                               ^
sizeof.c:7:15: note: declared here
    7 | void foo2(int arr[20]) {
      |           ~~~~^~~~~~~
$ valgrind ./sizeof 
==3867918== Memcheck, a memory error detector
==3867918== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==3867918== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==3867918== Command: ./sizeof
==3867918== 
4
4
80
8
8
8
8
==3867918== 
==3867918== HEAP SUMMARY:
==3867918==     in use at exit: 0 bytes in 0 blocks
==3867918==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==3867918== 
==3867918== All heap blocks were freed -- no leaks are possible
==3867918== 
==3867918== For lists of detected and suppressed errors, rerun with: -s
==3867918== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>One takeaway of all this is that it's technically possible to determine the number of elements in an array with a little bit of arithmetic: <Code>{'sizeof(my_array) / sizeof(<type>)'}</Code>, where <Code>{'<type>'}</Code> is the type of elements stored in the array. Perhaps this seems like a neat trick. However, it only works when <Code>my_array</Code> is actually an array. It does <Ul>not</Ul> work when <Code>my_array</Code> is a pointer that stores the base address of an array. Hence, this trick does <Ul>not</Ul> work when <Code>my_array</Code> is a parameter in a function (since array parameters are really just pointers, and array arguments always decay into their base addresses). Yes, that means this trick is rarely useful; you still have to pass array sizes into functions as separate arguments.</P>

      <P>This is why it's very important to understand that arrays are not pointers. Rather, arrays often <It>decay</It> into pointers (their base addresses), but the two types themselves are not strictly the same. There are some cases where they behave slightly differently, and the <Code>sizeof</Code> operator is one such case.</P>

      <SectionHeading id="copying-arrays">Copying arrays</SectionHeading>

      <P>Given that arrays often decay into their base addresses, it's not possible to copy an array via direct assignment (nor by passing it as an argument to a function, as we just discussed). For example, this is not legal C code:</P>

      <CBlock showLineNumbers={false}>{
`float cool_values[] = {3.14, 9.81, 2.71};
float copy[] = cool_values;`
      }</CBlock>

      <P>To create a copy of an array, you have two options:</P>

      <Itemize listStyleType="lower-alpha">
        <Item>Create a new array that's big enough to store all the values from the original array. Then copy each value from the original array into the new array one at a time using a loop (e.g., a for loop).</Item>

        <CBlock fileName="copyarray.c">{
`int main() {
        float cool_values[] = {3.14, 9.81, 2.71};
        float copy[3];
        for (int i = 0; i < 3; ++i) {
                copy[i] = cool_values[i];
        }

        printf("%f\\n", copy[2]); // Prints 2.71
}
`
        }</CBlock>

        <Item>Include <Code>string.h</Code>. Create a new array that's big enough to store all the values from the original array. Then, use the <Code>memcpy</Code> function, provided by <Code>string.h</Code>, to copy all the bytes from the original array's buffer into the new array's buffer.</Item>

        <P><Code>memcpy</Code> accepts three arguments: 1) a pointer to the base address of the buffer into which you're trying to copy data; 2) a pointer to the base address of the buffer from which you're trying to copy data; and 3) the number of <Ul>bytes</Ul> that you want to be copied. When using <Code>memcpy</Code> to copy an array, the first argument is typically the base address of the new array, the second argument is typically the base address of the original array (being copied).</P>
        
        <CBlock fileName="copyarray.c">{
`#include <stdio.h>
#include <string.h>

int main() {
        float cool_values[] = {3.14, 9.81, 2.71};
        float copy[3];

        // Copy using memcpy
        memcpy(copy, cool_values, 3 * sizeof(float));

        printf("%f\\n", copy[2]); // Prints 2.71
}
`
        }</CBlock>
      </Itemize>

      <P>(By the way, if <Code>cool_values</Code> had many more than just 3 elements in its initializer (comma-separated value list), and you didn't want to count them all, then this is actually one of those rare cases where the <Code>sizeof</Code> trick to compute an array's number of elements could be helpful. The new array could be declared via <Code>float copy[sizeof(cool_values) / sizeof(float)]</Code>, and the last argument to <Code>memcpy</Code> could simply be written as <Code>sizeof(cool_values)</Code>. But be careful to only do this with arrays<Emdash/>not pointers to arrays.)</P>
        
      <SectionHeading id="returning-arrays">Returning arrays?</SectionHeading>

      <P>It's not really possible to return an entire automatic array from a function.</P>

      <P>You can of course return pointers from functions, so it stands to reason that it's possible to return an array's base address from a function. However, you must be extremely careful when doing so. In particular, do not create an automatic (stack-allocated) array within a function, and then proceed to return that array's base address from that function. This results in a dangling pointer for <Link href={`${PARENT_PATH}/${allPathData["pointers"].pathName}#undefined-behavior-with-pointers`}>a reason that we've already discussed</Link>.</P>

      <P>If you need some function <Code>foo</Code> to effectively "output" an automatic array of values, consider this simple strategy:</P>

      <Enumerate listStyleType="decimal">
        <Item>Wherever it is that you <It>call</It> the <Code>foo</Code> function, declare an automatic array just before doing so</Item>
        <Item>Then, when you call the <Code>foo</Code> function, pass in that pre-declared array and its size as arguments</Item>
        <Item>Within the <Code>foo</Code> function, modify the elements of that provided array</Item>
      </Enumerate>

      <P>This strategy allows the <Code>foo</Code> function to effectively output an automatic array, but it does so by populating the values of a given pre-declared array rather than by returning an array.</P>

      <P>Soon, we'll discuss dynamic memory. If you create a dynamically allocated array in a function, you <It>can</It> return its base address from that function without creating a dangling pointer.</P>

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
