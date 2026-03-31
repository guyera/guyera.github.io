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
        <Item><Link href="#void-pointers"><Code>void</Code> pointers (<Code>void*</Code>)</Link></Item>
      </Itemize>

      <SectionHeading id="void-pointers"><Code>void</Code> pointers (<Code>void*</Code>)</SectionHeading>

      <P>Here's a new type of variable for you: <Code>void*</Code>. A variable of type <Code>void*</Code> is often referred to as a "<Code>void</Code> pointer".</P>

      <P><Code>void</Code> pointers are actually quite simple: they're just pointers that are allowed to store addresses of <It>anything</It> (except perhaps <Link href={`${PARENT_PATH}/${allPathData["function-pointers"].pathName}`}>addresses of functions</Link>). This is in contrast to, say, an <Code>int</Code> pointer (<Code>int*</Code>), which is <It>only</It> allowed to store the address of an <Code>int</Code> object.</P>

      <P>Here's an example:</P>

      <CBlock fileName="void_pointers.c">{
`#include <stdio.h>

int main(void) {
        int x = 10;

        // ptr is a void pointer and can store the address of
        // anything, including integers like x.
        void* ptr = &x;

        double y = 3.14;

        // But it can also store the addresses of doubles, and
        // so on.
        ptr = &y;

        // Both of these print the address of y
        printf("%p\\n", ptr);
        printf("%p\\n", &y);
}
`
      }</CBlock>

      <P>And the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o void_pointers void_pointers.c 
$ valgrind ./void_pointers 
==3388554== Memcheck, a memory error detector
==3388554== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==3388554== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==3388554== Command: ./void_pointers
==3388554== 
0x1ffefff9f8
0x1ffefff9f8
==3388554== 
==3388554== HEAP SUMMARY:
==3388554==     in use at exit: 0 bytes in 0 blocks
==3388554==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==3388554== 
==3388554== All heap blocks were freed -- no leaks are possible
==3388554== 
==3388554== For lists of detected and suppressed errors, rerun with: -s
==3388554== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>You might ask, "If <Code>void</Code> pointers can store addresses of anything, why do we need other kinds of pointers at all? Why can't we just always use <Code>void</Code> pointers?" Good question. <Code>void</Code> pointers are <Ul>extremely</Ul> limited in terms of what you can do with them:</P>

      <Itemize>
        <Item><P>You can't conduct pointer arithmetic on a <Code>void</Code> pointer (e.g., <Code>ptr + 1</Code> is not allowed if <Code>ptr</Code> is a <Code>void</Code> pointer)</P>

        <P>(Okay, it <It>is</It> allowed in that GCC and other popular C compilers provide extensions that support it, treating <Code>sizeof(void)</Code> as <Code>1</Code> in such a context. But it's not technically standard C, so it's not portable.)</P></Item>
        <Item><P><Ul>More importantly, you can't dereference a <Code>void</Code> pointer</Ul>. That is, you can't access the data that a <Code>void</Code> pointer points to, at least not through the <Code>void</Code> pointer itself. That means no <Code>*</Code> operators, no <Code>[]</Code> operators, and no <Code>{'->'}</Code> operators. None of these can be used on a <Code>void</Code> pointer.</P></Item>
      </Itemize>

      <P>Both of these limitations are due to the same fundamental reason: the compiler needs to be able to determine what type of data a pointer points to in order to support the above operations, but the compiler has no way of knowing what type of data a given <Code>void</Code> pointer might point to at a given point in time.</P>

      <P>Let's consider the case of pointer arithmetic first. If <Code>ptr</Code> is of type <Code>int*</Code>, and an <Code>int</Code> object occupies 4 bytes of memory (i.e., <Code>sizeof(int) == 4</Code>, as is the case on the ENGR servers), then <Code>ptr + 1</Code> represents the memory address that's 4 greater than the address stored in <Code>ptr</Code>. This is because adding an integer to a pointer shifts over by that many <It>element-width spaces</It>, where an <It>element width</It> is the size of a single object of the data type that the pointer points to. It's the compiler's responsibility to conduct this arithmetic. Indeed, the compiler will recognize that <Code>ptr</Code> is declared to be of type <Code>int*</Code>, and that <Code>sizeof(int) == 4</Code>. It will then multiply the <Code>1</Code> (in <Code>ptr + 1</Code>) by <Code>4</Code>, and then add the result to the memory address stored inside <Code>ptr</Code>. Notice that this arithmetic, which is conducted by the compiler, requires knowing the size of the data type that <Code>ptr</Code> points to (which requires knowing the data type to begin with). Hence, if <Code>ptr</Code> was instead of type <Code>void*</Code>, then the compiler, not knowing what type of data it points to, would be unable to compute this arithmetic.</P>

      <P>The argument for dereferencing is simpler. It's the complier's job to determine the (static) types of all expressions and make sure that they're used where appropriate. For example, you can't store an <Code>int</Code> value inside a <Code>char*</Code> variable. That wouldn't be appropriate. Similarly, suppose <Code>p</Code> is of type <Code>struct person</Code>, and you try to access <Code>p.weird_field</Code>, where <Code>weird_field</Code> is <It>not</It> the name of an actual field of the <Code>person</Code> structure type. That also wouldn't be appropriate. It's the compiler's job to catch these mistakes. Moreover, when you <It>do</It> use the appropriate type of value in the appropriate place, the compiler's responsible for generating the machine instructions to interpret / operate on that value in the right way. For example, consider the statement <Code>double x = 3;</Code>. It's the compiler's responsibility to generate some machine instructions that properly convert the <Code>int</Code> value <Code>3</Code> into the <Code>double</Code> value <Code>3.0</Code> (with the proper binary representation) for storage in <Code>x</Code>.</P>

      <P>The compiler can't do <It>any</It> of these things<Emdash/>it can't verify that expressions' types make sense, nor can it generate machine instructions that interpret / operate on those expressions' values<Emdash/>if it doesn't know the (static) types of all expressions.</P>

      <P>Now, you might still have a lingering question: "Why can't the compiler figure out what type of data a given <Code>void</Code> pointer points to at a given point in time?". Well, it's because the type of value that a given <Code>void</Code> pointer points to <It>can change at runtime</It>, and the compiler, which operates (definitionally) at compile time, cannot predict exactly what will happen at runtime.</P>

      <P>Let me demonstrate with an example:</P>

      <CBlock fileName="void_pointers.c" highlightLines="{23-45}">{
`#include <time.h>
#include <stdlib.h>
#include <stdio.h>

int main(void) {
        srand(time(NULL));
        int x = 10;

        // ptr is a void pointer and can store the address of
        // anything, including integers like x.
        void* ptr = &x;

        double y = 3.14;

        // But it can also store the addresses of doubles, and
        // so on.
        ptr = &y;
        
        // Both of these print the address of y
        printf("%p\\n", ptr);
        printf("%p\\n", &y);

        // Perhaps the compiler could theoretically analyze
        // the code and determine that, currently, ptr stores
        // the address of a double.

        // But what if we do this?
        if (rand() % 2 == 0) {
                ptr = &x;
        }

        // At this point, there's a 50% chance that ptr
        // points to an int, and a 50% chance that it points
        // to a double. The compiler can't predict which of
        // these two things will happen.

        // So, if the compiler doesn't know whether ptr
        // points to an integer or a double, how could it
        // generate the correct machine instructions to compute
        // this value?
        double quotient = *ptr / 2;

        // Answer: it can't. The machine instructions required
        // to divide a double by an int are very different from
        // those required to divide an int by an int.
}
`
      }</CBlock>

      <P>The above program fails to compile because <Code>void</Code> pointers can't be dereferenced:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o void_pointers void_pointers.c 
void_pointers.c: In function ‘main’:
void_pointers.c:37:27: warning: dereferencing ‘void *’ pointer
   37 |         double quotient = *ptr / 2;
      |                           ^~~~
void_pointers.c:37:27: error: void value not ignored as it ought to be`
      }</TerminalBlock>

      <P>Moreover, keep in mind that the compiler always deals with one function at a time, in one translation unit at a time. Suppose, then, that a function has a <Code>void</Code> pointer as a parameter (this is common). When the compiler is compiling said function, it has no way of knowing what type of object that <Code>void</Code> pointer might point to; it depends on what's supplied to it as an <It>argument</It>, which will likely happen in a completely different function, perhaps even in a completely different translation unit (or, even worse, the function could be called from several difference places, with addresses of several different types of objects supplied as arguments in different contexts).</P>

      <P>But even in cases where the compiler could maybe, possibly, feasibly determine the type of variable that a given <Code>void</Code> pointer might point to, you <It>still</It> aren't allowed to dereference said <Code>void</Code> pointer (nor do pointer arithmetic on it). Indeed, since it's not <It>always</It> possible for the compiler to determine the type of variable that a <Code>void</Code> pointer might point to, it refuses to even try, <It>ever</It>.</P>

      <P>So, what the heck is the purpose of a <Code>void</Code> pointer? Well, you can't dereference them directly, but you <It>can</It> type-cast them into a more specific (appropriate) pointer type, and then dereference <It>that</It>. For example:</P>

      <CBlock fileName="cast_then_dereference.c" highlightLines="{16-24}">{
`#include <stdio.h>

int main(void) {
        int x = 10;

        // ptr is a void pointer and can store the address of
        // anything, including integers like x.
        void* ptr = &x;

        double y = 3.14;

        // But it can also store the addresses of doubles, and
        // so on.
        ptr = &y;

        // This would NOT be allowed
        // printf("%lf\\n", *ptr);

        // But this IS allowed
        printf("%lf\\n", *((double*) ptr));

        // Or, equivalently:
        double* casted_ptr = ptr;
        printf("%lf\\n", *casted_ptr);
}
`
      }</CBlock>

      <P>And here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o cast_then_dereference cast_then_dereference.c 
$ valgrind ./cast_then_dereference 
==3421780== Memcheck, a memory error detector
==3421780== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==3421780== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==3421780== Command: ./cast_then_dereference
==3421780== 
3.140000
3.140000
==3421780== 
==3421780== HEAP SUMMARY:
==3421780==     in use at exit: 0 bytes in 0 blocks
==3421780==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==3421780== 
==3421780== All heap blocks were freed -- no leaks are possible
==3421780== 
==3421780== For lists of detected and suppressed errors, rerun with: -s
==3421780== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>However, there's a very important detail: when you cast a <Code>void</Code> pointer back into a more specific type, it's <Ul>your responsibility</Ul> to make sure that you cast it to the <It>correct</It> type. In the above program, if <Code>ptr</Code> happened to point to <Code>x</Code> instead of <Code>y</Code>, then casting it to a <Code>double*</Code> expression and then proceeding to dereference it would invoke undefined behavior. (Basically, the compiler would try to interpret the underlying bytes as a <Code>double</Code> even though they'd actually represent an <Code>int</Code> value.)</P>

      <P><Code>void</Code> pointers are particularly useful when used as parameters in functions. Since a <Code>void</Code> pointer can point to various kinds of data, a function with a <Code>void</Code> pointer as a parameter is capable of receiving various types of data as an input. However, said function must have some way of determining (at runtime) what types of variable its <Code>void</Code> pointer parameters <It>actually</It> point to, so that it can cast them to pointers of those types prior to dereferencing them.</P>

      <P>Here's a somewhat academic example:</P>

      <CBlock fileName="void_pointers_in_functions.c">{
`#include <stdio.h>

// Constants for various type codes
const int TYPE_CODE_INT = 0;
const int TYPE_CODE_FLOAT = 1;
const int TYPE_CODE_POINTER = 2;

// A function that can print one of various kinds of values
// to the terminal, determining the correct format specifier
void print_value(void* value_ptr, int type_code) {
        // Check type_code to determine what type of value
        // value_ptr points to
        if (type_code == TYPE_CODE_INT) {
                // It's an int. Print it as such.
                printf("%d\\n", *((int*) value_ptr));
        } else if (type_code == TYPE_CODE_FLOAT) {
                // It's a float. Print it as such.
                printf("%f\\n", *((float*) value_ptr));
        } else if (type_code == TYPE_CODE_POINTER) {
                // It's a pointer of some sort. Print it as
                // such. To do this, we might cast the parameter
                // to a void** (to encode the fact that it
                // points to some kind of pointer). We can then
                // dereference it to retrieve the pointer that
                // it points to, but treated as a void*.
                // (You can, indeed, pass void* values to
                // printf with %p specifiers).
                printf("%p\\n", *((void**) value_ptr));
        } else {
                printf("Error: Bad type_code\\n");
        }
}

int main(void) {
        int a = 1;
        float b = 2.0;
        float* p = &b;

        print_value(&a, TYPE_CODE_INT);
        print_value(&b, TYPE_CODE_FLOAT);
        print_value(&p, TYPE_CODE_POINTER);
}
`
      }</CBlock>

      <P>Indeed, we call <Code>print_value</Code> three times, but each time we pass the address of a different kind of variable. These addresses are implicitly casted into <Code>void</Code> pointers when received by the <Code>value_ptr</Code> parameter. In each case, we additionally supply an appropriate constant as a second argument that the function can check to determine what type of value <Code>value_ptr</Code> points to, enabling proper type casting prior to dereferencing (and enabling selection of the correct format specifier).</P>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`(env) guyera@flip3:void-pointers$ gcc -g -Wall -o void_pointers_in_functions void_pointers_in_functions.c 
(env) guyera@flip3:void-pointers$ valgrind ./void_pointers_in_functions 
==3432117== Memcheck, a memory error detector
==3432117== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==3432117== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==3432117== Command: ./void_pointers_in_functions
==3432117== 
1
2.000000
0x1ffefff9f8
==3432117== 
==3432117== HEAP SUMMARY:
==3432117==     in use at exit: 0 bytes in 0 blocks
==3432117==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==3432117== 
==3432117== All heap blocks were freed -- no leaks are possible
==3432117== 
==3432117== For lists of detected and suppressed errors, rerun with: -s
==3432117== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>To be honest, that's not the <It>best</It> example of <Code>void</Code> pointer usage. In reality, <Code>void</Code> pointers are far more useful when used in combination with <Link href={`${PARENT_PATH}/${allPathData["function-pointers"].pathName}`}>function pointers</Link>. But that's the next lecture.</P>

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
