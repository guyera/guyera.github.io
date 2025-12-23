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
        <Item><Link href="#memory">Memory</Link></Item>
        <Item><Link href="#memory-addresses">Memory addresses</Link></Item>
        <Item><Link href="#memory-addresses-of-variables">Memory addresses of variables</Link></Item>
        <Item><Link href="#pointers">Pointers</Link></Item>
        <Item><Link href="#dereferencing-pointers">Dereferencing pointers</Link></Item>
        <Item><Link href="#undefined-behavior-with-pointers">Undefined behavior with pointers</Link></Item>
        <Item><Link href="#null"><Code>NULL</Code></Link></Item>
        <Item><Link href="#constness-with-pointers">Constness with pointers</Link></Item>
      </Itemize>

      <SectionHeading id="memory">Memory</SectionHeading>

      <P>As you likely know, computers represent data in terms of binary encodings<Emdash/>a series of bits, meaning zeros and ones, "ons" and "offs", or however you choose to think about it. Those bits must be stored somewhere, somehow.</P>

      <P>A computer can store bits of data in various kinds of storage media. Different storage media have different tradeoffs. For example, a hard drive or solid state drive offers persistent storage, meaning that even if the computer loses power, the data will still exist when power is restored and the computer is rebooted. Hence, such storage media can be used to store operating systems, files, and so on. However, data stored on hard drives and solid state drives are relatively slow to read (access) and write (modify).</P>

      <P>And then there's non-persistent, or <Bold>volatile</Bold>, storage, the most common of which being general computing <Bold>memory</Bold>, particularly <Bold>random-access memory (RAM)</Bold>. Data stored in a volatile storage medium such as RAM is lost when the computer is shutdown or otherwise loses power. RAM is also typically more expensive (byte for byte) than persistent storage alternatives like hard drives or solid state drives (e.g., a 1TiB solid state drive is at least one order of magnitude cheaper than 1TiB of DDR5 or even DDR4 RAM). However, data stored in RAM is much faster to read and write than data stored on a hard drive or solid state drive.</P>

      <P>You can think of a computer's RAM (and memory in general) as a place for <It>temporary</It> storage of data that does not need to persist (or <It>shouldn't</It> persist) when the computer loses power. For example, when a program is executed, it may create several variables to represent inputs, outputs, and intermediate values in between. Those variables often do not need to continue existing when the process terminates, let alone when the entire computer is shutdown. Hence, the volatility of RAM is not a problem when storing such temporary data, but its speed offers significant advantages over persistent storage media.</P>

      <P>(In fact, volatility can be a major advantage in such cases. If a program's variables are somehow corrupted, perhaps because of a bug, rebooting the program will reinitialize those variables. This usually fixes the problem. Same goes for the operating system's memory. This is the reason for the classic question in IT: "Did you try turning it off and back on again?")</P>

      <SectionHeading id="memory-addresses">Memory addresses</SectionHeading>

      <P>So, a computer's RAM is a place where it can store temporary data, such as variables used within a program. But how does it work?</P>

      <P>Well, you can loosely think of RAM as a gigantic array (sequence) of bytes. Indeed, there is a byte 0, a byte 1, a byte 2, and so on. If your computer has 8Gb of RAM, then that means its RAM is effectively an array of 8 billion bytes.</P>

      <P>When a process is started (i.e., when a program is executed), it begins allocating memory for various purposes. As mentioned, processes need memory to store variables, but also to store certain constants, the program's instructions before loading them into the CPU for execution, references to external services and resources, and more. Everything that a process / program stores in memory goes <It>somewhere</It> within that gigantic "array of bytes".</P>

      <P>Take this program for example:</P>

      <CBlock>{
`#include <stdio.h>

int main() {
        int x;
        int y;
        scanf("%d", &x);
        y = 2 * x;
        printf("2 * %d = %d\\n", x, y);
}
`
      }</CBlock>

      <P>When the above C program is executed, several things need to be stored in memory. The integers <Code>x</Code> and <Code>y</Code> each need some space in memory (an <Code>int</Code> often takes up 4 bytes of memory, but it depends on the platform), but that's not all. All the compiled machine instructions of the program need to be loaded into memory so that the CPU can readily access them and execute them. The string literals, <Code>"%d"</Code> and <Code>"2 * %d = %d\n"</Code>, both need to be stored some place in memory where they can be referenced by the <Code>scanf()</Code> and <Code>printf()</Code> calls and accessed within their implementations. In addition, <Code>{'stdio.h'}</Code> may provide all sorts of functions and constants that need to be stored in the process's memory.</P>

      <P>While it's true that all of these things are stored in memory, let's just focus on the variables <Code>x</Code> and <Code>y</Code>. That will make our analysis a bit simpler. The computer's RAM is essentially a gigantic array of bytes, and while the program is executing, <It>somewhere</It> in that array, you'll find the values of <Code>x</Code> and <Code>y</Code>. Suppose that the <Code>scanf()</Code> call in the above program has executed, and the user entered <Code>5</Code> for the value of <Code>x</Code>, but the subsequent computation for <Code>y</Code> hasn't yet finished. At that point, the program's memory (the "array of bytes") might look something like this:</P>

      {/*TODO diagram showing x=5 and y=????*/}

      <P>It's largely up to the compiler (and operating system) to decide exactly how to arrange <Code>x</Code> and <Code>y</Code> in memory, though we'll discuss some general memory models, such as the stack and the heap, in a future lecture.</P>

      <P>Notice the <Code>???</Code> representation for <Code>y</Code>. Since <Code>y</Code> is still uninitialized, in practice, there will be some completely arbitrary bits / bytes stored in <Code>y</Code>'s allocated location in memory, hence why using it at this point would invoke undefined behavior. But after the next instruction is executed, and <Code>y</Code> is initialized to the value of <Code>2 * x</Code>, the program's memory will be updated to look like this:</P>

      {/*TODO updated diagram*/}

      <P>Whenever the program needs to access one of these variables, such as for the above write operation, or to read their values for the upcoming <Code>printf()</Code> call, it needs to be able to locate them. Because RAM is essentially one gigantic array of bytes, each byte can be identified, or located, by its <Bold>index</Bold>: the first byte in RAM has index 0, the second byte has index 1, the third byte has index 2, and so on. These indices are referred to as <Bold>memory addresses</Bold>. To put it another way, a memory address is a non-negative integer (whole number) that represents the location of a single byte of data somewhere in RAM.</P>

      <P>Every byte in RAM has its own unique memory address. After all, every element in an array has a unique index, and RAM is just a gigantic array of bytes, with the indices of those bytes being their memory addresses.</P>

      <SectionHeading id="memory-addresses-of-variables">Memory addresses of variables</SectionHeading>

      <P>Next, understand that, with some exceptions, a single object (e.g., a single <Code>int</Code> value, or a <Code>float</Code>, or a <Code>double</Code>, or a more complex structure) will generally occupy a single contiguous chunk of (virtual) memory. For example, although <Code>x</Code> might occupy 4 bytes of memory in the previous example, those 4 bytes are necessarily <It>right next to each other</It> (at least within the process's virtual address space).</P>

      <P>This is very important because it means that if the computer knows the memory address of, say, the <It>first</It> byte of <Code>x</Code>, then it can easily figure out the memory addresses of <It>all</It> the bytes of <Code>x</Code>. After all, the bytes of <Code>x</Code> are all right next to each other. If the memory address of the first byte of <Code>x</Code> is some integer <Code>b</Code>, then the memory address of the second byte of <Code>x</Code> is simply <Code>b+1</Code>, and the memory address of the third byte of <Code>x</Code> is <Code>b+2</Code>, and so on.</P>

      <P>Indeed, all the bytes of memory that make up a given variable can be identified by the memory address of the first of those bytes. This is often referred to as the "memory address of the variable".</P>

      <P>As it turns out, C allows you to operate on memory addresses directly through special syntax. The simplest such operation is to retrieve the memory address of an existing variable. You can do this with the <Bold>address-of operator</Bold>: simply write out an ampersand (<Code>&</Code>) immediately to the left of the name of an existing variable, and it will retrieve the memory address of that variable. You can then, for example, print that memory address using a <Code>%p</Code> format specifier like so:</P>

      <CBlock fileName="addressof.c">{
`#include <stdio.h>

int main() {
        int x = 10;
        int y = 20;
        printf("The memory address of x is: %p\\n", &x);
        printf("The memory address of y is: %p\\n", &y);
}`
      }</CBlock>

      <P>Here's an example output of the above program:</P>

      <TerminalBlock copyable={false}>{
`(env) guyera@flip1:pointers$ gcc -Wall -g -o addressof addressof.c 
(env) guyera@flip1:pointers$ valgrind ./addressof 
==2454238== Memcheck, a memory error detector
==2454238== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2454238== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2454238== Command: ./addressof
==2454238== 
The memory address of x is: 0x1ffefff9ec
The memory address of y is: 0x1ffefff9e8
==2454238== 
==2454238== HEAP SUMMARY:
==2454238==     in use at exit: 0 bytes in 0 blocks
==2454238==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==2454238== 
==2454238== All heap blocks were freed -- no leaks are possible
==2454238== 
==2454238== For lists of detected and suppressed errors, rerun with: -s
==2454238== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)`
      }</TerminalBlock>
      
      <P>Now, I said that memory addresses are just integers, so why are there a bunch of letters in the printed outputs? Well, that's just because <Code>printf()</Code> formats memory addresses in hexadecimal form. Hexadecimal is just a numbering system with 16 symbols (like how decimal is a numbering system with 10 symbols, and binary is a numbering system with 2 symbols). The 16 symbols are 0-9 and A-F. Either way, these are just numbers.</P>

      <P>Understand that the values of <Code>x</Code> and <Code>y</Code> might change throughout the program, but their memory addresses will not:</P>

      <CBlock fileName="addressof.c" highlightLines="{9-13}">{
`#include <stdio.h>

int main() {
        int x = 10;
        int y = 20;
        printf("The memory address of x is: %p\\n", &x);
        printf("The memory address of y is: %p\\n", &y);

        y = 10; // Now they're both 10

        // But their memory addresses are still what they were before
        printf("The memory address of x is: %p\\n", &x);
        printf("The memory address of y is: %p\\n", &y);
}`
      }</CBlock>

      <P>And here's an example output:</P>

      <TerminalBlock copyable={false}>{
`(env) guyera@flip1:pointers$ gcc -Wall -g -o addressof addressof.c 
(env) guyera@flip1:pointers$ valgrind ./addressof 
==2455085== Memcheck, a memory error detector
==2455085== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2455085== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2455085== Command: ./addressof
==2455085== 
The memory address of x is: 0x1ffefff9ec
The memory address of y is: 0x1ffefff9e8
The memory address of x is: 0x1ffefff9ec
The memory address of y is: 0x1ffefff9e8
==2455085== 
==2455085== HEAP SUMMARY:
==2455085==     in use at exit: 0 bytes in 0 blocks
==2455085==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==2455085== 
==2455085== All heap blocks were freed -- no leaks are possible
==2455085== 
==2455085== For lists of detected and suppressed errors, rerun with: -s
==2455085== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Recall from an earlier lecture that an automatic variable is a named location in memory (i.e., a named memory address). When you declare an automatic variable, all you're really doing is assigning a name to a memory address. When you write <Code>y = 10</Code>, you're not actually changing <Code>y</Code>; rather, you're going to the location in memory that <Code>y</Code> refers to, and then changing the bytes in memory at that location to match the new value of <Code>10</Code>. <Code>y</Code> itself remains the same<Emdash/>a constant name for a constant location in memory (this is very different from Python's object model, if you're familiar with that).</P>

      <P>Think of the variable <Code>y</Code> as a metal box that's bolted down some place in memory. You can open the box to see what's inside it or replace its contents with something else. But the box is bolted down, so you can't move / change the box itself.</P>

      <P>This model is fairly powerful but sometimes limiting. Pointers help overcome the limitations.</P>

      <SectionHeading id="pointers">Pointers</SectionHeading>

      <P>A <Bold>pointer</Bold> is simply a variable that stores the memory address of another variable. It shouldn't be surprising that this is possible. Memory addresses are simply numbers, and numbers can clearly be stored inside variables. Hence, it stands to reason that memory addresses <It>of variables</It> can be stored inside <It>other variables</It>. Those <It>other variables</It> are called pointers. We call them pointers because they're variables that "point" to other variables by storing their memory addresses.</P>

      <P>In C, pointers are strongly and statically typed. Whenever you declare a pointer, you must specify what kind of pointer it is, meaning what kind of other variable it points to. That's to say, if you want to store the memory address of an <Code>int</Code> variable inside a pointer, that pointer must be an "<Code>int</Code> pointer". And if you want to store the memory address of a <Code>double</Code> variable inside a pointer, that pointer must be a "<Code>double</Code> pointer".</P>

      <P>Pointers are a kind of variable, so they must be declared. And to declare a variable, you must specify its type. To specify the type of a pointer, write out the type of variable that it will point to (i.e., the type of variable whose memory address it will store) followed by an asterisk (<Code>*</Code>). For example:</P>

      <CBlock fileName="pointers.c">{
`#include <stdio.h>

int main() {
        // Declare a "double pointer", capable of storing the memory
        // address of a variable of type double
        double* p1; // Notice the asterisk!

        // Declare an "int pointer", capable of storing the memory
        // address of a variable of type int
        int* p2;

        // Declare an int variable, capable of storing integers
        int x = 10; // Notice: no asterisk here since it's not a pointer!
}`
      }</CBlock>

      <P>When you want to assign a value to a pointer (e.g., via the assignment operator), that value must be the memory address of another variable of the appropriate type. For example, the variable <Code>p2</Code> in the above code is an "<Code>int</Code> pointer", meaning it's capable of storing the memory address of an <Code>int</Code> variable. Hence, if we wanted to assign a value to it, that value must be the memory address of an <Code>int</Code> variable. We can retrieve the memory address of an <Code>int</Code> variable via the address-of operator:</P>

      <CBlock fileName="pointers.c" highlightLines="{15-21}">{
`#include <stdio.h>

int main() {
        // Declare a "double pointer", capable of storing the memory
        // address of a variable of type double
        double* p1; // Notice the asterisk!

        // Declare an "int pointer", capable of storing the memory
        // address of a variable of type int
        int* p2;

        // Declare an int variable, capable of storing integers
        int x = 10; // Notice: no asterisk here since it's not a pointer!

        // Store the address of x inside p2, which works because
        // x is an int and p2 is an int pointer
        p2 = &x;

        // Of course, you can also declare and initialize a pointer
        // in one statement:
        int* p3 = &x;
}
`
      }</CBlock>

      <P>Note: Attempting to store the address of a variable in the wrong type of pointer results in a compiler warning, and usually undefined behavior.</P>

      <P>So, <Code>p2</Code> stores the address of <Code>x</Code>, which in turn stores the integer value <Code>10</Code>. In memory, this might look something like the following:</P>

      {/*TODO diagram*/}

      <P>We could print out the value of <Code>p2</Code>, meaning the address of <Code>x</Code>, like so:</P>

      <CBlock showLineNumbers={false}>{
`printf("%p\\n", p2);`
      }</CBlock>

      <P>The above is equivalent to the following:</P>

      <CBlock showLineNumbers={false}>{
`printf("%p\\n", &x);`
      }</CBlock>

      <P>One thing that's perhaps useful about pointers is that, like all other variables, their values can change. That's to say, <Code>p2</Code> currently points to <Code>x</Code> (stores the memory address of <Code>x</Code>), but that doesn't have to remain the case forever. We can change <Code>p2</Code> to point elsewhere whenever we want:</P>

      <CBlock fileName="pointers.c" highlightLines="{23-38}">{
`#include <stdio.h>

int main() {
        // Declare a "double pointer", capable of storing the memory
        // address of a variable of type double
        double* p1; // Notice the asterisk!

        // Declare an "int pointer", capable of storing the memory
        // address of a variable of type int
        int* p2;

        // Declare an int variable, capable of storing integers
        int x; // Notice: no asterisk here since it's not a pointer!

        // Store the address of x inside p2, which works because
        // x is an int and p2 is an int pointer
        p2 = &x;

        // Of course, you can also declare and initialize a pointer
        // in one statement:
        int* p3 = &x;

        // These two lines print the same thing
        printf("%p\\n", p2);
        printf("%p\\n", &x);

        // But we can change p2 to point elsewhere if we want!
        int y; // Create a new integer y, in a separate place in memory
        p2 = &y; // Change p2 to store the address of y instead of x

        // These two lines print the same thing, which is different
        // from the address printed previously
        printf("%p\\n", p2);
        printf("%p\\n", &y);

        // Importantly, x has not moved. It's still in the same location
        // in memory. p2 is just pointing elsewhere now.
        printf("%p\\n", &x); // Prints the same address as earlier
}
`
      }</CBlock>

      <P>Here's an example output:</P>

      <TerminalBlock copyable={false}>{
`(env) guyera@flip1:pointers$ gcc -g -o pointers pointers.c 
(env) guyera@flip1:pointers$ valgrind ./pointers 
==2465686== Memcheck, a memory error detector
==2465686== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2465686== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2465686== Command: ./pointers
==2465686== 
0x1ffefff9dc
0x1ffefff9dc
0x1ffefff9d8
0x1ffefff9d8
0x1ffefff9dc
==2465686== 
==2465686== HEAP SUMMARY:
==2465686==     in use at exit: 0 bytes in 0 blocks
==2465686==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==2465686== 
==2465686== All heap blocks were freed -- no leaks are possible
==2465686== 
==2465686== For lists of detected and suppressed errors, rerun with: -s
==2465686== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <SectionHeading id="dereferencing-pointers">Dereferencing pointers</SectionHeading>

      <P>So far, pointers probably seem pretty useless, but that's because I haven't told you the most important thing that you can do with them yet: <Bold>indirection</Bold>. Indirection means to indirectly access a value in memory.</P>

      <P>Particularly, suppose you have a pointer <Code>p</Code> that points to some sort of variable <Code>x</Code>. You can of course use <Code>x</Code> to access its underlying value directly, but you can also <It>indirectly</It> access that same exact value through <Code>p</Code>. This is done by <Bold>dereferencing</Bold> <Code>p</Code>. To dereference a pointer, simply write out an asterisk (<Code>*</Code>) immediately to the left of the pointer variable. For example, if you have a pointer <Code>p</Code>, then you can dereference it via <Code>*p</Code>.</P>

      <P>(Notice that I've mentioned two different use cases of the asterisk (<Code>*</Code>) symbol: 1) it's used in the type specifier of a new pointer when declaring it, and 2) it can be placed to the left of an existing pointer to dereference it. Yes, that's one symbol with two different use cases. For a given asterisk, you have to analyze the context of the surrounding code to figure out what it's being used for.)</P>

      <P>Dereferencing a pointer gives you access to the value of the variable that the pointer points to. So if <Code>p</Code> points to <Code>x</Code>, and <Code>x</Code> stores the value <Code>3.14</Code>, then <Code>printf("%f\n", *p)</Code> would print <Code>3.14</Code> to the terminal:</P>

      <CBlock fileName="dereference.c">{
`#include <stdio.h>

int main() {
        float x = 3.14;
        float* p = &x;

        // These two lines print the same thing:
        printf("%f\\n", x);
        printf("%f\\n", *p);
}`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`(env) guyera@flip1:pointers$ gcc -Wall -g -o dereference dereference.c 
(env) guyera@flip1:pointers$ valgrind ./dereference 
==2467620== Memcheck, a memory error detector
==2467620== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2467620== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2467620== Command: ./dereference
==2467620== 
3.140000
3.140000
==2467620== 
==2467620== HEAP SUMMARY:
==2467620==     in use at exit: 0 bytes in 0 blocks
==2467620==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==2467620== 
==2467620== All heap blocks were freed -- no leaks are possible
==2467620== 
==2467620== For lists of detected and suppressed errors, rerun with: -s
==2467620== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)`
      }</TerminalBlock>

      <P>Okay, maybe that still seems useless, but there's at least one practical use case. Recall that I told you something very important about functions in a previous lecture: parameters are copies of their arguments. This means that functions are typically incapable of accessing and modifying each others' variables. If a function changes the value of one of its parameters, that doesn't modify the value of the variable that was supplied as an argument at the call site.</P>

      <P>In reality, though, it's not that functions can't modify each others' variables. It's only that they can't do so <It>directly</It>. But with indirection, this is fully possible. Consider:</P>

      <CBlock fileName="accessingarguments.c">{
`#include <stdio.h>

void change_to_100(int* p) {
        *p = 100;
}

int main() {
        int x = 5;
        change_to_100(&x);
        printf("The value of x is: %d\\n", x);
}`
      }</CBlock>

      <P>What do you think will be printed when the above program is executed? Is it <Code>5</Code>, or is it <Code>100</Code>? (I know, this is a leading question).</P>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`(env) guyera@flip1:pointers$ gcc -Wall -g -o accessingarguments accessingarguments.c
(env) guyera@flip1:pointers$ valgrind ./accessingarguments 
==2470618== Memcheck, a memory error detector
==2470618== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2470618== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2470618== Command: ./accessingarguments
==2470618== 
The value of x is: 100
==2470618== 
==2470618== HEAP SUMMARY:
==2470618==     in use at exit: 0 bytes in 0 blocks
==2470618==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==2470618== 
==2470618== All heap blocks were freed -- no leaks are possible
==2470618== 
==2470618== For lists of detected and suppressed errors, rerun with: -s
==2470618== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)`
      }</TerminalBlock>

      <P>Indeed, it prints <Code>100</Code><Emdash/>not <Code>5</Code>.</P>

      <P>Yes, parameters are copies of their arguments. But in this case, the parameter is not an integer; it's a pointer to an integer. And the argument is not an integer; it's the memory address of an integer. So in this case, the thing being copied is not the integer value of <Code>x</Code>, but rather the memory address of <Code>x</Code>. This copied memory address is stored inside the parameter <Code>p</Code>. The operation <Code>*p = 100</Code> dereferences <Code>p</Code>, meaning it goes to the location referenced by the memory address stored within <Code>p</Code>, and it changes the value at that location to <Code>100</Code>. Yes, the memory address stored inside <Code>p</Code> is a copy of <Code>&x</Code>, but that doesn't mean that it doesn't still point to the <It>actual, original</It> variable <Code>x</Code>.</P>

      <P>Here's a fun analogy: suppose I create an identical copy of my entire house and all my belongings. You then go into that copy of my house and rob it. That's fine with me<Emdash/>that wasn't <It>my</It> house, after all. It was only a copy of my house.</P>

      <P>Now consider this alternative: I write down my address on a sheet of paper. I then run that sheet of paper through a copier. I hand it to you. You go to the house whose address is written on that copied piece of paper, and when you get to that house, you rob it. That's <It>not</It> fine with me. That's <It>my</It> house!</P>

      <P>This is the difference between <Code>change_to_100(x)</Code>, as we saw in the previous lecture, and <Code>change_to_100(&x)</Code>, as you saw in the above example. The former copies <Code>x</Code>'s value and stores the copy in the parameter. Modifications to the parameter do not affect the original argument <Code>x</Code>. But the latter copies the <It>address</It> of <Code>x</Code> into the parameter. If the function then chooses to go to the variable at that address, that will indeed be the original variable <Code>x</Code>. Hence, indirection allows the <Code>change_to_100</Code> function to modify the original <Code>x</Code> variable declared within <Code>main</Code>.</P>

      <P>There are plenty of examples where it's useful for functions to be able to modify each others' variables. A common example is when a single function needs to be able to produce potentially many outputs. A given function can only return a single value, but it can have as many parameters as it wants. Hence, if a function has several outputs, it can possibly return one of them, and for the rest of them, it can require the caller to supply memory addresses of pre-existing variables as arguments. The function can then dereference the corresponding pointer parameters and modify those underlying variables to store the outputs back at the call site.</P>

      <P>In fact, you've seen this in action. The <Code>scanf()</Code> function reads inputs from the user and stores them in a bunch of variables. But in order for it to be useful, those variables have to be accessible to the rest of the program. Hence, the interface of the <Code>scanf()</Code> function requires the program to declare the variables and then pass their addresses in as arguments, which get stored inside pointer parameters. The <Code>scanf()</Code> function then dereferences those pointer parameters and modifies the underlying variables' values to store the user's supplied inputs. That's why you have to put ampersands next to the arguments in your <Code>scanf()</Code> calls; you're retrieving their addresses so that the <Code>scanf()</Code> function can access the variables themselves, rather than just copies of their values, via indirection.</P>

      <P>There are plenty of other very practical use cases involving pointers as well, particularly when dealing with data structures and heap-allocated memory. But we'll save that for future lectures.</P>

      <SectionHeading id="undefined-behavior-with-pointers">Undefined behavior with pointers</SectionHeading>

      <P>Now that I've introduced pointers, I have to tell you an unfortunate truth about them: if you're not extremely careful when using pointers, it's very easy to use them incorrectly, and that will almost always result in undefined behavior. As you hopefully remember, undefined behavior often can't be caught by the compiler or other static analysis tools, and it causes the program to do undefined things at runtime. But what's worse is that the things that programs tend to <It>actually</It> do in the face of undefined behavior invoked by incorrect pointer usage is particularly bad. In some of the worst cases, undefined behavior resulting from incorrect pointer usage can even lead to extremely dangerous security vulnerabilities, such as arbitrary code execution (ACE) exploits. And since static analysis tools like compilers often can't catch these mistakes, you should 1) be extremely cautious whenever using pointers, especially in safety- and security-critical applications (if you can, you should probably avoid using C in new safety- and security-critical applications entirely<Emdash/>consider using a memory-safe language instead); and 2) <Ul>always</Ul> run your C programs through dynamic analysis tools like Valgrind, which won't catch all undefined behavior but might help catch the common cases.</P>

      <P>So that's my disclaimer. To qualify it, let's consider some cases where incorrect pointer usage can invoke undefined behavior.</P>

      <P>The simplest case is dereferencing an uninitialized pointer:</P>

      <CBlock fileName="uninitializedpointer.c">{
`#include <stdio.h>

int main() {
        double* p;

        printf("p points to a double with the value: %lf\\n", *p);
}`
      }</CBlock>

      <P>Hopefully it's clear why the above program makes no sense. It attempts to access the value of the variable that <Code>p</Code> points to (<Code>*p</Code>) and print it to the terminal. But of course, <Code>p</Code> doesn't point to any actual variables because it was never initialized to store a variable's memory address. Since <Code>p</Code> is uninitialized, it most likely stores a "garbage" address<Emdash/>a totally arbitrary sequence of bits and bytes that are interpreted as if they're a real memory address. The computer will then go and look at that completely arbitrary place in memory and attempt to interpret the bytes at that location as if they represent a <Code>double</Code>. It'll then try to print that <Code>double</Code> to the terminal.</P>
      
      <P>Luckily, the compiler is capable of detecting and warning us about this particular mistake when <Code>-Wall</Code> is supplied:</P>

      <TerminalBlock copyable={false}>{
`(env) guyera@flip1:pointers$ gcc -Wall -g -o uninitializedpointer uninitializedpointer.c 
uninitializedpointer.c: In function ‘main’:
uninitializedpointer.c:6:9: warning: ‘p’ is used uninitialized [-Wuninitialized]
    6 |         printf("p points to a double with the value: %lf\\n", *p);
      |         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`
      }</TerminalBlock>

      <P>Just for fun, let's see what happens when we run the program through valgrind anyways:</P>

      <TerminalBlock copyable={false}>{
`(env) guyera@flip1:pointers$ valgrind ./uninitializedpointer 
==2473902== Memcheck, a memory error detector
==2473902== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2473902== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2473902== Command: ./uninitializedpointer
==2473902== 
==2473902== Use of uninitialised value of size 8
==2473902==    at 0x401132: main (uninitializedpointer.c:6)
==2473902== 
==2473902== Invalid read of size 8
==2473902==    at 0x401132: main (uninitializedpointer.c:6)
==2473902==  Address 0x0 is not stack'd, malloc'd or (recently) free'd
==2473902== 
==2473902== 
==2473902== Process terminating with default action of signal 11 (SIGSEGV): dumping core
==2473902==  Access not within mapped region at address 0x0
==2473902==    at 0x401132: main (uninitializedpointer.c:6)
==2473902==  If you believe this happened as a result of a stack
==2473902==  overflow in your program's main thread (unlikely but
==2473902==  possible), you can try to increase the size of the
==2473902==  main thread stack using the --main-stacksize= flag.
==2473902==  The main thread stack size used in this run was 8388608.
==2473902== 
==2473902== HEAP SUMMARY:
==2473902==     in use at exit: 0 bytes in 0 blocks
==2473902==   total heap usage: 0 allocs, 0 frees, 0 bytes allocated
==2473902== 
==2473902== All heap blocks were freed -- no leaks are possible
==2473902== 
==2473902== Use --track-origins=yes to see where uninitialised values come from
==2473902== For lists of detected and suppressed errors, rerun with: -s
==2473902== ERROR SUMMARY: 2 errors from 2 contexts (suppressed: 0 from 0)
Segmentation fault (core dumped)`
      }</TerminalBlock>

      <P>Notice: the program failed to print an actual value to the terminal. Instead, it suddenly crashed with the error message: <Code>==2473902== Process terminating with default action of signal 11 (SIGSEGV): dumping core</Code>.</P>

      <P>This kind of error is referred to as a <Bold>segmentation fault</Bold>. It means that the process (program) attempted to access an invalid location in memory (e.g., outside all the mapped pages in the process's virtual address space). The operating system then sent the process a signal (signal 11, SIGSEGV) notifying it of its mistake. The process was not equipped to handle that signal, so it terminated / crashed immediately.</P>

      <P>Also notice: just before all that happened, Valgrind printed out some nice error messages to help us diagnose the issue. First, it says <Code>Use of uninitialized value of size 8</Code>, followed by <Code>Invalid read of size 8</Code>. These both occured on line 6 of our source code file (<Code>uninitializedpointer.c:6</Code>). The first error is referring to the fact that we're trying to use an uninitialized pointer. The second error is referring to the fact that we're trying to read the (invalid) data that that pointer coincidentally points to. In this particular case, <Code>p</Code>'s garbage value happens to be 0 (as it turns out, 0 is a fairly common garbage value), and nothing is stored at memory address 0. In fact, 0 is a protected memory address; <Link href="#NULL">nothing may <It>ever</It> be stored there</Link>.</P>

      <P>To be clear, this is often one of the best things that can possibly happen as a result of undefined behavior: the program crashes immediately, and Valgrind tells us exactly where the error occurred and why. In much worse cases, the program may <It>appear</It> to work just fine, and Valgrind may fail to notice any issues whatsoever, despite the fact that the program does, in fact, contain undefined behavior. If that undefined behavior can be exploited for malicious purposes (e.g., ACE exploits), and we have no way of knowing about it, that can often be far worse than a crash with nice diagnostics. (But of course, it depends on the context. If this program is running the flight computer in an airplane or rocket, then a sudden crash could be catastrophic.)</P>

      <P>Besides dereferencing uninitialized pointers, another common mistake is <Bold>use-after-free errors</Bold>. These errors occur when you dereference a <Bold>dangling pointer</Bold>, meaning a pointer that points to data that has since been deleted. These errors are sometimes more dangerous than dereferencing an uninitialized pointer. Here's a somewhat contrived example:</P>

      <CBlock fileName="useafterfree.c">{
`#include <stdio.h>

// Notice the return type of int* instead of int
int* add(int x, int y) {
        int sum = x + y;
        return &sum; // Notice we return &sum instead of sum
}

int main() {
        int* p = add(47, 52);
        printf("47 + 52 = %d\\n", *p);
}
`
      }</CBlock>

      <P>Do you see the issue? Hint: It has to do with scope.</P>

      <P>When the <Code>add</Code> function starts, it declares a new variable <Code>sum</Code> to store the value of <Code>x + y</Code>. But remember: 1) scope dictates where a variable is accessible, but also 2) automatic variables are freed from memory automatically (hence the name) shortly after their scope ends. Since the <Code>sum</Code> variable is scoped to the <Code>add</Code> function, it'll be freed from memory shortly after the <Code>add</Code> function ends.</P>

      <P>But at the end of the <Code>add</Code> function, it takes the address of the <Code>sum</Code> variable and returns it (or, rather, it returns a copy of that address). Back in the <Code>main</Code> function, that address is then stored inside <Code>p</Code>. Here's the issue: by the time that address is stored inside <Code>p</Code>, the original variable that it pointed to<Emdash/><Code>sum</Code><Emdash/>no longer exists. Its scope has ended, so it's been freed from memory. This means that <Code>p</Code> is a dangling pointer. It points to data that has since been freed from memory.</P>

      <P>Once a variable is freed from memory, the program is allowed to reuse that memory for other purposes (e.g., other variables). When <Code>*p</Code> is printed to the terminal, the program is printing whatever data happens to exist in memory at the location that <It>used</It> to belong to the <Code>sum</Code> variable. But at this point, the <Code>sum</Code> variable no longer exists, so either a) that location in memory is unallocated / not in use, or b) it has been reallocated for other purposes. That's why it's called a "use-after-free error"; you're trying to use the data, <Code>sum</Code>, via indirection after it has already been freed. This is undefined behavior, and it can be particularly dangerous (it's often exploitable in malicious ways).</P>

      <P>To be clear, simply having a dangling pointer does not inherently invoke undefined behavior. However, dereferencing a dangling pointer (<Code>*p</Code>)<Emdash/>a use-after-free error<Emdash/>always invokes undefined behavior.</P>

      <P>Again, we're lucky in that <Code>gcc</Code> and <Code>valgrind</Code> are both capable of catching this particular mistake on this particular platform:</P>

      <TerminalBlock copyable={false}>{
`(env) guyera@flip1:pointers$ gcc -Wall -g -o useafterfree useafterfree.c 
useafterfree.c: In function ‘add’:
useafterfree.c:6:16: warning: function returns address of local variable [-Wreturn-local-addr]
    6 |         return &sum; // Notice we return &sum instead of sum
      |                ^~~~
(env) guyera@flip1:pointers$ valgrind ./useafterfree 
==2479083== Memcheck, a memory error detector
==2479083== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2479083== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2479083== Command: ./useafterfree
==2479083== 
==2479083== Invalid read of size 4
==2479083==    at 0x401161: main (useafterfree.c:11)
==2479083==  Address 0x0 is not stack'd, malloc'd or (recently) free'd
==2479083== 
==2479083== 
==2479083== Process terminating with default action of signal 11 (SIGSEGV): dumping core
==2479083==  Access not within mapped region at address 0x0
==2479083==    at 0x401161: main (useafterfree.c:11)
==2479083==  If you believe this happened as a result of a stack
==2479083==  overflow in your program's main thread (unlikely but
==2479083==  possible), you can try to increase the size of the
==2479083==  main thread stack using the --main-stacksize= flag.
==2479083==  The main thread stack size used in this run was 8388608.
==2479083== 
==2479083== HEAP SUMMARY:
==2479083==     in use at exit: 0 bytes in 0 blocks
==2479083==   total heap usage: 0 allocs, 0 frees, 0 bytes allocated
==2479083== 
==2479083== All heap blocks were freed -- no leaks are possible
==2479083== 
==2479083== For lists of detected and suppressed errors, rerun with: -s
==2479083== ERROR SUMMARY: 1 errors from 1 contexts (suppressed: 0 from 0)
Segmentation fault (core dumped)`
      }</TerminalBlock>

      <P>Notice the compiler warning: <Code>function returns address of local variable [-Wreturn-local-addr]</Code>. This error message is very clear; the function attempts to return the memory address of a local (automatic) variable. That's always a bad sign; local (automatic) variables are generally freed when the function ends (i.e., when it returns), so any pointers that point to them will immediately become dangling at that moment. Hence, there's never a good reason to return the address of a local (automatic) variable. In fact, this mistake is so egregious that <Code>gcc</Code> typically issues this warning message even without the <Code>-Wall</Code> flag.</P>

      <P>If we ignore <Code>gcc</Code>'s warnings (which you should never do!), Valgrind also detects the error in this case. It prints <Code>Invalid read of size 4</Code>. The program then crashes due to a segmentation fault.</P>

      <P>(Funny enough, analyzing the accompanying details reveals that <Code>p</Code> stores memory address 0 rather than the old address of <Code>sum</Code>. This is because <Code>gcc</Code> embedded an instruction in the program that force-sets the return value to 0 automatically. This is likely a security feature; it prevents the undefined behavior from being exploited. And if it hadn't done that, the program likely wouldn't have crashed due to a segmentation fault.)</P>

      <P>Although <Code>gcc</Code> and Valgrind have been able to detect the undefined behavior in these examples, do not rely on them to always do so. There are more complicated examples where these tools will fail to detect the issue.</P>

      <P>There are other ways of invoking undefined behavior with improper pointer usage as well, but they're less common and typically easier to catch. For example, attempting to store the address of a <Code>float</Code> inside a pointer of type <Code>int*</Code> (or any other non-float pointer) will typically lead to undefined behavior. But the compiler is basically always capable of detecting such a mistake, and it will usually at least issue a warning.</P>

      <SectionHeading id="NULL"><Code>NULL</Code></SectionHeading>

      {/*TODO*/}
      {/*TODO DON'T FORGET ABOUT THE DIAGRAMS FROM EARLIER. THERE ARE TODO ITEMS FOR THEM.*/}

      <SectionHeading id="constness-with-pointers">Constness with pointers</SectionHeading>

      {/*TODO*/}
      {/*TODO DON'T FORGET ABOUT THE DIAGRAMS FROM EARLIER. THERE ARE TODO ITEMS FOR THEM.*/}

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
