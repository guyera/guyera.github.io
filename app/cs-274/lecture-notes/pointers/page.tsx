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

import MemoryArrangement1 from './assets/memory-arrangement-1.png'
import MemoryArrangement2 from './assets/memory-arrangement-2.png'
import PointerArrangement from './assets/pointer-arrangement.png'

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

int main(void) {
        int x;
        int y;
        scanf("%d", &x);
        y = 2 * x;
        printf("2 * %d = %d\\n", x, y);
}
`
      }</CBlock>

      <P>When the above C program is executed, several things need to be stored in memory. The integers <Code>x</Code> and <Code>y</Code> each need some space in memory, but that's not all. All the compiled machine instructions of the program need to be loaded into memory so that the CPU can readily access them and execute them. The string literals, <Code>"%d"</Code> and <Code>"2 * %d = %d\n"</Code>, both need to be stored some place in memory where they can be referenced by the <Code>scanf()</Code> and <Code>printf()</Code> calls and accessed within their implementations. In addition, <Code>{'stdio.h'}</Code> may provide all sorts of functions and constants that need to be stored in the process's memory.</P>

      <P>While it's true that all of these things are stored in memory, let's just focus on the variables <Code>x</Code> and <Code>y</Code>. That will make our analysis a bit simpler. The computer's RAM is essentially a gigantic array of bytes, and while the program is executing, <It>somewhere</It> in that array, you'll find the values of <Code>x</Code> and <Code>y</Code>. Suppose that the <Code>scanf()</Code> call in the above program has executed, and the user entered <Code>5</Code> for the value of <Code>x</Code>, but the subsequent computation for <Code>y</Code> hasn't yet finished. At that point, the program's memory (the "array of bytes") might look something like this:</P>

      <Image src={MemoryArrangement1} alt="x occupies 4 bytes of memory, has value 5, and is located in memory starting at memory address 2. y occupies 4 bytes of memory, has an undefined value, and is located in memory starting at memory address 9." className="w-full"/>

      <P>The numbers underneath the "array of bytes" represent the indices of those bytes. I've only depicted 16 total bytes of memory, but keep in mind that most modern PCs have several billion bytes of memory (larger servers may even have trillions). I've depicted <Code>x</Code> and <Code>y</Code> as each taking up 4 bytes of memory because <Code>int</Code> values <It>often</It> take up 4 bytes (but that's not always the case; it depends on the platform). Also notice that I've depicted <Code>x</Code> and <Code>y</Code> as having some bytes of space between them. Perhaps those bytes are being used by the program for other purposes. This may or may not happen in practice; it's largely up to the compiler (and operating system) to decide exactly how to arrange these variables in memory. That said, we will discuss some memory models that programs use to generally arrange data in a future lecture.</P>

      <P>Notice the <Code>???</Code> representation for <Code>y</Code>. Since <Code>y</Code> is still uninitialized, its value is undefined. Of course, each bit that occupies <Code>y</Code>'s allocated space in memory must either be a 0 or a 1, and the sequence of all 32 bits (4 bytes) in that space can surely be interpreted as a single integer value one way or another. However, since no specific integer value has been explicitly assigned to <Code>y</Code>, the exact values of those bits are currently arbitrary (i.e., unpredictable; perhaps those bits of memory were previously used by another program, in which case they might still store some leftover bits of data from that program).</P>

      <P>But after the next instruction is executed, and <Code>y</Code> is initialized to the value of <Code>2 * x</Code>, the program's memory will be updated to look like this:</P>

      <Image src={MemoryArrangement2} alt="x and y are in the same places in memory and take up the same amount of space, but y now has defined value 10" className="w-full"/>

      <P>Whenever the program needs to access one of these variables, such as for the above write operation, or to read their values for the upcoming <Code>printf()</Code> call, it needs to be able to locate them. Because RAM is essentially one gigantic array of bytes, each byte can be identified, or located, by its index. The first byte in RAM has index 0, the second byte has index 1, the third byte has index 2, and so on, as depicted in the above diagrams.</P>

      <P>The index of a byte in memory actually has a special name: it's referred to as a <Bold>memory address</Bold>. Memory addresses aren't often described as indices of bytes in a gigantic array of memory, but that's essentially all they are. More formally, a memory address is a non-negative integer (whole number) that represents the location of a single byte of data somewhere in RAM. Every byte in RAM has its own unique memory address.</P>

      <SectionHeading id="memory-addresses-of-variables">Memory addresses of variables</SectionHeading>

      <P>Next, understand that, with some exceptions, a single object (e.g., a single <Code>int</Code> value, or a <Code>float</Code>, or a <Code>double</Code>, or a more complex structure) will often occupy a single contiguous chunk of memory. For example, although <Code>x</Code> might occupy 4 bytes of memory in the previous example, those 4 bytes are <It>right next to each other</It>, at least within the process's virtual address space.</P>

      <P>This is very important because it means that if the computer knows the memory address of, say, the <It>first</It> byte of <Code>x</Code>, then it can easily figure out the memory addresses of <It>all</It> the bytes of <Code>x</Code>. After all, the bytes of <Code>x</Code> are all right next to each other. If the memory address of the first byte of <Code>x</Code> is some integer <Code>b</Code>, then the memory address of the second byte of <Code>x</Code> is simply <Code>b+1</Code>, and the memory address of the third byte of <Code>x</Code> is <Code>b+2</Code>, and so on.</P>

      <P>Indeed, all the bytes of memory that make up a given variable can be identified by the memory address of the first of those bytes. This is often referred to as the "memory address of the variable". In the previous diagrams, the memory address of <Code>x</Code> is 2, and the memory address of <Code>y</Code> is 9. In practice, real variables' memory address values tend to be much larger, say, in the millions or billions.</P>

      <P>As it turns out, C allows you to operate on memory addresses directly through special syntax. The simplest such operation is to retrieve the memory address of an existing variable. You can do this with the <Bold>address-of operator</Bold>: simply write out an ampersand (<Code>&</Code>) immediately to the left of the name of an existing variable, and it will retrieve the memory address of that variable. You can then, for example, print that memory address using a <Code>%p</Code> format specifier like so:</P>

      <CBlock fileName="addressof.c">{
`#include <stdio.h>

int main(void) {
        int x = 10;
        int y = 20;
        printf("The memory address of x is: %p\\n", &x);
        printf("The memory address of y is: %p\\n", &y);
}`
      }</CBlock>

      <P>Here's an example output of the above program:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o addressof addressof.c 
$ valgrind ./addressof 
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

int main(void) {
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
`$ gcc -Wall -g -o addressof addressof.c 
$ valgrind ./addressof 
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

      <P>Recall from an earlier lecture that an automatic variable is a named location in memory (i.e., a named memory address). When you declare an automatic variable, all you're really doing is associating a name with a fixed memory address. When you write <Code>y = 10</Code>, you're essentially going to the location in memory that <Code>y</Code> is associated with, and then changing the bytes in memory at that location to match the new value of <Code>10</Code>. <Code>y</Code> itself does not move around; it continues to be associated with the same location in memory. This is very different from Python's object model, if you're familiar with that.</P>

      <P>Think of the variable <Code>y</Code> as a metal box that's bolted down some place in memory. You can open the box to see what's inside it or replace its contents with something else. But the box is bolted down, so you can't move / change the box itself.</P>

      <P>This model is fairly powerful but sometimes limiting. Pointers help overcome the limitations.</P>

      <SectionHeading id="pointers">Pointers</SectionHeading>

      <P>A <Bold>pointer</Bold> is simply a variable that stores the memory address of another variable. It shouldn't be surprising that this is possible. Memory addresses are simply numbers, and numbers can clearly be stored inside variables. Hence, it stands to reason that memory addresses <It>of variables</It> can be stored inside <It>other variables</It>. Those <It>other variables</It> are called pointers. We call them pointers because they're variables that "point" to other variables by storing their memory addresses.</P>

      <P>In C, pointers are strongly and statically typed. Whenever you declare a pointer, you must specify what kind of pointer it is, meaning what kind of other variable it points to. That's to say, if you want to store the memory address of an <Code>int</Code> variable inside a pointer, that pointer must be an "<Code>int</Code> pointer". And if you want to store the memory address of a <Code>double</Code> variable inside a pointer, that pointer must be a "<Code>double</Code> pointer".</P>

      <P>Pointers are a kind of variable, so they must be declared. And to declare a variable, you must specify its type. To specify the type of a pointer, write out the type of variable that it will point to (i.e., the type of variable whose memory address it will store) followed by an asterisk (<Code>*</Code>). For example:</P>

      <CBlock fileName="pointers.c">{
`#include <stdio.h>

int main(void) {
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

int main(void) {
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

      <Image src={PointerArrangement} alt="x occupies 4 bytes of memory, has value 10, and is located in memory starting at memory address 2. p occupies 8 bytes of memory, has value 2, and is located in memory starting at memory address 7." className="w-full"/>

      <P>In the above diagram, <Code>p</Code> stores the value <Code>2</Code> since that's the memory address ("byte index") at which <Code>x</Code> is located. If you follow the blue arrow to memory address 2, you'll find the start of <Code>x</Code>, which in turn stores the integer value <Code>10</Code>.</P>

      <P>Notice that <Code>p</Code> itself also takes up some memory (indeed, it even has its own memory address, which is 7 in the above diagram). After all, pointers store memory addresses, which are just numbers, and those numbers have to be stored somewhere. I've specifically depicted <Code>p</Code> as having 8 bytes of memory. The reason is that on a 64-bit operating system running on a 64-bit CPU, memory addresses are typically represented as 64-bit (8-byte) values. This allows them to represent fairly large numbers, which is important since they're meant to represent memory addresses, and a modern computer can have a <It>ton</It> of bytes of memory (e.g., trillions), meaning some bytes will have very large memory addresses.</P>

      <P>(On a 32-bit platform, memory addresses are represented as 32-bit, meaning 4-byte, values. That's problematic since the largest number that can be stored in a 4-byte unsigned space is just a little over 4 billion. This means that if a computer has more than 4GiB of memory (which many do), a 32-bit platform would not be capable of accessing all its memory).</P>

      <P>Moving on. We could print out the value of <Code>p2</Code>, meaning the address of <Code>x</Code>, like so:</P>

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

int main(void) {
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
`$ gcc -g -o pointers pointers.c 
$ valgrind ./pointers 
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

      <P>Remember the diagram from earlier with <Code>p</Code>, <Code>x</Code>, and the blue arrow? Here it is again for your convenience:</P>

      <Image src={PointerArrangement} alt="x occupies 4 bytes of memory, has value 10, and is located in memory starting at memory address 2. p occupies 8 bytes of memory, has value 2, and is located in memory starting at memory address 7." className="w-full"/>

      <P>Considering the above diagram, dereferencing <Code>p</Code> (i.e., <Code>*p</Code>) essentially means to follow the blue arrow to find the thing that <Code>p</Code> is pointing to. In this case, that thing is <Code>x</Code>, which stores the value <Code>10</Code>. Indeed, dereferencing <Code>p</Code> gives you indirect access to that value of <Code>10</Code>.</P>

      <P>(Keep in mind that I've mentioned two different use cases of the asterisk (<Code>*</Code>) symbol: 1) it's used in the type specifier of a new pointer when declaring it, and 2) it can be placed to the left of an existing pointer to dereference it. Yes, that's one symbol with two different use cases. For a given asterisk, you have to analyze the context of the surrounding code to figure out what it's being used for.)</P>

      <P>Let's illustrate dereferencing with an example:</P>

      <CBlock fileName="dereference.c">{
`#include <stdio.h>

int main(void) {
        float x = 3.14;
        float* p = &x;

        // These two lines print the same thing:
        printf("%f\\n", x);
        printf("%f\\n", *p);
}`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o dereference dereference.c 
$ valgrind ./dereference 
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

int main(void) {
        int x = 5;
        change_to_100(&x);
        printf("The value of x is: %d\\n", x);
}`
      }</CBlock>

      <P>What do you think will be printed when the above program is executed? Is it <Code>5</Code>, or is it <Code>100</Code>? (I know, this is a leading question).</P>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o accessingarguments accessingarguments.c
$ valgrind ./accessingarguments 
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

      <P>Here's a fun analogy: suppose I create an identical copy of my entire house and all my belongings. You then go into that copy of my house and rob it. That's fine with me<Emdash/>that's not <It>my</It> house, after all. It's only a copy of my house.</P>

      <P>Now consider this alternative: I write down my address on a sheet of paper. I then run that sheet of paper through a copier. I hand the copy to you. You go to the house whose address is written on that copied piece of paper, and when you get to that house, you rob it. That's <It>not</It> fine with me. That's <It>my</It> house!</P>

      <P>This is the difference between <Code>change_to_100(x)</Code>, as we saw in the previous lecture, and <Code>change_to_100(&x)</Code>, as you saw in the above example. The former copies <Code>x</Code>'s value and stores the copy in the parameter. Modifications to the parameter do not affect the original argument <Code>x</Code>. But the latter copies the <It>address</It> of <Code>x</Code> into the parameter. If the function then chooses to go to the variable at that address, that will indeed be the original variable <Code>x</Code>. Hence, indirection allows the <Code>change_to_100</Code> function to modify the original <Code>x</Code> variable declared within <Code>main</Code>.</P>

      <P>There are plenty of examples where it's useful for functions to be able to modify each others' variables. A common example is when a single function needs to be able to produce potentially many outputs. A given function can only return a single value, but it can have as many parameters as it wants. Hence, if a function has several outputs, it can possibly return one of them, and for the rest of them, it can require the caller to supply memory addresses of pre-existing variables as arguments. The function can then dereference the corresponding pointer parameters and modify those underlying variables to store the outputs back at the call site.</P>

      <P>In fact, you've seen this in action. The <Code>scanf()</Code> function reads inputs from the user and stores them in a bunch of variables. But in order for it to be useful, those variables have to be accessible to the rest of the program. Hence, the interface of the <Code>scanf()</Code> function requires the program to declare the variables beforehand and pass their addresses in as arguments, which get stored inside pointer parameters. The <Code>scanf()</Code> function then dereferences those pointer parameters and modifies the underlying variables' values to store the user's supplied inputs. That's why you have to put ampersands next to the arguments in your <Code>scanf()</Code> calls; you're retrieving their addresses so that the <Code>scanf()</Code> function can access the variables themselves, rather than just copies of their values, via indirection.</P>

      <P>There are plenty of other very practical use cases involving pointers as well, particularly when dealing with data structures and heap-allocated memory. But we'll save that for future lectures.</P>

      <SectionHeading id="undefined-behavior-with-pointers">Undefined behavior with pointers</SectionHeading>

      <P>Now that I've introduced pointers, I have to tell you an unfortunate truth about them: if you're not extremely careful when using pointers, it's very easy to use them incorrectly, and that will almost always result in undefined behavior. As you hopefully remember, undefined behavior sometimes can't be caught by the compiler or other static analysis tools, and it causes the program to do undefined things at runtime. But what's worse is that the things that programs tend to <It>actually</It> do in the face of undefined behavior invoked by incorrect pointer usage is particularly bad. In some of the worst cases, undefined behavior resulting from incorrect pointer usage can even lead to extremely dangerous security vulnerabilities, such as arbitrary code execution (ACE) exploits. And since static analysis tools like compilers sometimes can't catch these mistakes, you should 1) be extremely cautious whenever using pointers, especially in safety- and security-critical applications (if you can, you should probably avoid using C in new safety- and security-critical applications entirely<Emdash/>consider using a memory-safe language instead); and 2) <Ul>always</Ul> run your C programs through dynamic analysis tools like Valgrind, which won't catch all undefined behavior but might help catch the common cases.</P>

      <P>So that's my disclaimer. To qualify it, let's consider some cases where incorrect pointer usage can invoke undefined behavior.</P>

      <P>The simplest case is dereferencing an uninitialized pointer:</P>

      <CBlock fileName="uninitializedpointer.c">{
`#include <stdio.h>

int main(void) {
        double* p;

        printf("p points to a double with the value: %lf\\n", *p);
}`
      }</CBlock>

      <P>Hopefully it's clear why the above program makes no sense. It attempts to access the value of the variable that <Code>p</Code> points to (<Code>*p</Code>) and print it to the terminal. But of course, <Code>p</Code> doesn't point to any actual variables because it was never initialized to store a variable's memory address. Since <Code>p</Code> is uninitialized, it most likely stores a "garbage" address<Emdash/>a totally arbitrary sequence of bits and bytes that are interpreted as if they're a real memory address. The computer will then go and look at that completely arbitrary place in memory and attempt to interpret the bytes at that location as if they represent a <Code>double</Code>. It'll then try to print that <Code>double</Code> to the terminal.</P>
      
      <P>Luckily, the compiler is capable of detecting and warning us about this particular mistake when <Code>-Wall</Code> is supplied:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o uninitializedpointer uninitializedpointer.c 
uninitializedpointer.c: In function ‘main’:
uninitializedpointer.c:6:9: warning: ‘p’ is used uninitialized [-Wuninitialized]
    6 |         printf("p points to a double with the value: %lf\\n", *p);
      |         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`
      }</TerminalBlock>

      <P>Just for fun, let's see what happens when we run the program through valgrind anyways:</P>

      <TerminalBlock copyable={false}>{
`$ valgrind ./uninitializedpointer 
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

      <P>Also notice: just before all that happened, Valgrind printed out some nice error messages to help us diagnose the issue. First, it says <Code>Use of uninitialized value of size 8</Code>, followed by <Code>Invalid read of size 8</Code>. These both occured on line 6 of our source code file (<Code>uninitializedpointer.c:6</Code>). The first error is referring to the fact that we're trying to use an uninitialized pointer. The second error is referring to the fact that we're trying to read the (invalid) data that that pointer coincidentally points to. In this particular case, <Code>p</Code>'s garbage value happens to be 0 (as it turns out, 0 is a fairly common garbage value), and nothing is stored at memory address 0. In fact, 0 is usually a protected memory address, meaning <Link href="#null">nothing may <It>ever</It> be stored there</Link>.</P>

      <P>To be clear, this is often one of the best things that can happen as a result of undefined behavior: the program crashes immediately, and Valgrind tells us exactly where the error occurred and why. In much worse cases, the program may <It>appear</It> to work just fine, and Valgrind may fail to notice any issues whatsoever, despite the fact that the program does, in fact, contain undefined behavior. If that undefined behavior can be exploited for malicious purposes (e.g., ACE exploits), and we have no way of knowing about it, that can often be far worse than a crash with nice diagnostics. Or perhaps the undefined behavior simply propagates to a logic error that causes the program to work incorrectly in subtle ways, which could also be a massive issue, especially if this is a safety-critical application.</P>

      <P>Besides dereferencing uninitialized pointers, another common mistake is <Bold>use-after-free errors</Bold>. These errors occur when you dereference a <Bold>dangling pointer</Bold>, meaning a pointer that points to data that has since been deleted. These errors are sometimes more dangerous than dereferencing an uninitialized pointer. Here's a somewhat contrived example:</P>

      <CBlock fileName="useafterfree.c">{
`#include <stdio.h>

// Notice the return type of int* instead of int
int* add(int x, int y) {
        int sum = x + y;
        return &sum; // Notice we return &sum instead of sum
}

int main(void) {
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
`$ gcc -Wall -g -o useafterfree useafterfree.c 
useafterfree.c: In function ‘add’:
useafterfree.c:6:16: warning: function returns address of local variable [-Wreturn-local-addr]
    6 |         return &sum; // Notice we return &sum instead of sum
      |                ^~~~
$ valgrind ./useafterfree 
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

      <P>(Funny enough, analyzing the error message more carefully reveals that <Code>p</Code> stores memory address 0 rather than the old address of <Code>sum</Code>. This is because <Code>gcc</Code> embedded an instruction in the program that force-sets the return value to 0 automatically. This may be a security feature; it prevents the undefined behavior from being exploited. It also ensures that dereferencing it will reliably produce a segmentation fault, since that's what generally happens when dereferencing <Link href="#null">memory address 0</Link>, rather than some other more subtle, unpredictable incorrect behavior.)</P>

      <P>Although <Code>gcc</Code> and Valgrind have been able to detect the undefined behavior in these examples, do not rely on them to always do so. There are more complicated examples where these tools will fail to detect the undefined behavior. We'll explore such exmaples in future lectures.</P>

      <P>There are a few other ways of invoking undefined behavior with improper pointer usage as well. For example, attempting to store the address of a <Code>float</Code> inside a non-float pointer (e.g., a pointer of type <Code>int*</Code>) will often lead to undefined behavior. To avoid issues with pointers:</P>

      <Enumerate listStyleType="decimal">
        <Item>Never dereference an uninitialized pointer</Item>
        <Item>Never dereference a dangling pointer</Item>
        <Item>Only store addresses in the appropriate types of pointers</Item>
        <Item>Avoid type-casting pointers except when absolutely necessary. Upcasting in C++ is fine, and casting to <Code>void*</Code> is often necessary in C since it doesn't support proper subtype polymorphism. But never type-cast, say, an int pointer to a float pointer.</Item>
        <Item>Make sure to never dereference <Link href="#null">a <Code>NULL</Code> pointer</Link></Item>
        <Item>Be careful when conducting pointer arithmetic (i.e., when computing memory addresses by performing arithmetic on other memory addresses; we'll discuss this more when we cover arrays in a future lecture)</Item>
      </Enumerate>

      <SectionHeading id="null"><Code>NULL</Code></SectionHeading>

      <P>Memory addresses are just numbers that represent locations of bytes within memory, and one particular memory address is special: 0. On most platforms, no actual data is ever allowed be stored at memory address 0. Its entire purpose is to represent an "empty" place in memory<Emdash/>a sort of "dummy" memory address. This provides a way of explicitly defining a pointer that doesn't point to anything: simply initialize the pointer to memory address 0 instead of the actual address of an existing variable.</P>

      <P>This is so common that there's a special constant called <Code>NULL</Code> that simply evaluates to 0 (or, at least, it usually does). When a pointer stores the value of <Code>NULL</Code> (i.e., the memory address 0), that indicates that the pointer does not currently point to anything.</P>

      <P>This is particularly helpful when writing functions with "optional" inputs. For example, suppose I want to write a function that can optionally be supplied a floating point number as an argument, but if you want, you can choose not to supply it (e.g., because some data might be missing / unavailable at the time the function is called). I might give that function a parameter of type <Code>float*</Code>. When the function's called, the corresponding argument can either be a) an actual adress of an existing <Code>float</Code> variable, or b) <Code>NULL</Code> . Inside the function, I can use an if statement to check whether the pointer parameter is <Code>NULL</Code>. If so, that indicates that the caller opted out of supplying the optional input. Otherwise<Emdash/>if the pointer isn't <Code>NULL</Code><Emdash/>it must point to an actual <Code>float</Code> variable, in which case I can dereference the pointer to access the underlying <Code>float</Code> value and use it.</P>

      <P>Below is a fairly contrived example of this. More realistic examples abound, but they're usually a bit more complicated, so it's too early to discuss them now.</P>

      <CBlock fileName="nullexample.c">{
`#include <stdio.h>

void print_info_about_person(int* age, float* favorite_number) {
        if (age != NULL) {
                printf("Age: %d. ", *age);
        } else {
                printf("Age: Unknown. ");
        }

        if (favorite_number != NULL) {
                // (Recall: %.2f rounds float to 2 decimal places for
                // printing)
                printf("Favorite #: %.2f.\\n", *favorite_number);
        } else {
                printf("Favorite #: Unknown.\\n");
        }
}

int main(void) {
        int age = 27;
        float favorite_number = 3.14;

        // If you know the person's age and favorite number, you can
        // provide both of them.
        // Prints Age: 27. Favorite #: 3.14
        print_info_about_person(&age, &favorite_number);

        // Suppose you know their favorite number but not their age:
        // Prints Age: Unknown. Favorite #: 3.14
        print_info_about_person(NULL, &favorite_number);

        // Or maybe the other way around:
        // Prints Age: 27. Favorite #: Unknown
        print_info_about_person(&age, NULL);

        // Or maybe you know nothing about the person:
        // Prints Age: Unknown. Favorite #: Unknown
        print_info_about_person(NULL, NULL);
}`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o nullexample nullexample.c 
$ valgrind ./nullexample 
==1019813== Memcheck, a memory error detector
==1019813== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1019813== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==1019813== Command: ./nullexample
==1019813== 
Age: 27. Favorite #: 3.14.
Age: Unknown. Favorite #: 3.14.
Age: 27. Favorite #: Unknown.
Age: Unknown. Favorite #: Unknown.
==1019813== 
==1019813== HEAP SUMMARY:
==1019813==     in use at exit: 0 bytes in 0 blocks
==1019813==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==1019813== 
==1019813== All heap blocks were freed -- no leaks are possible
==1019813== 
==1019813== For lists of detected and suppressed errors, rerun with: -s
==1019813== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)`
      }</TerminalBlock>

      <P>By the way, because <Code>NULL</Code> generally evaluates to 0, the C standard guarantees that a pointer with value <Code>NULL</Code> will always be treated as "false" when used as a condition in an if statement or loop. In contrast, a pointer that stores an actual memory address will always be treated as "true". This means that the <Code>print_info_about_person</Code> function in the above program can be rewritten like so:</P>

      <CBlock fileName="nullexample.c" showLineNumbers={false} highlightLines="{2,8}">{
`void print_info_about_person(int* age, float* favorite_number) {
        if (age) {
                printf("Age: %d. ", *age);
        } else {
                printf("Age: Unknown. ");
        }

        if (favorite_number) {
                // (Recall: %.2f rounds float to 2 decimal places for
                // printing)
                printf("Favorite #: %.2f.\\n", *favorite_number);
        } else {
                printf("Favorite #: Unknown.\\n");
        }
}
`
      }</CBlock>

      <P>Three more notes about <Code>NULL:</Code></P>

      <Enumerate listStyleType="decimal">
        <Item>A pointer will only ever be <Code>NULL</Code> if you explicitly assign it the value of <Code>NULL</Code> (e.g., <Code>int* p = NULL</Code>, or by explicitly supplying a <Code>NULL</Code> argument to a pointer parameter). Dangling pointers and uninitialized pointers are <Ul>not</Ul> the same thing as <Code>NULL</Code> pointers. While it's possible to use an if statement to check if a pointer is <Code>NULL</Code> (as above), it's <Ul>not</Ul> possible to use an if statement to check if a pointer is dangling or uninitialized.</Item>
        <Item>You should <Ul>never</Ul> dereference a pointer that might be <Code>NULL</Code>. Since memory address 0 (or however <Code>NULL</Code> is represented) is never allowed to store any actual data, dereferencing it invokes undefined behavior. In most cases, it will trigger a segmentation fault and crash the program. This is important; <Code>NULL</Code> is an extremely common value for pointers (any pointer can be set to <Code>NULL</Code>, and programmers set pointers to <Code>NULL</Code> all the time), so if there's <Ul>any</Ul> chance that a given pointer might be <Code>NULL</Code>, check it with an if statement before trying to dereference it.</Item>
      </Enumerate>

      <SectionHeading id="constness-with-pointers">Constness with pointers</SectionHeading>

      <P>Remember how the <Code>const</Code> keyword can be used to create constants? It can be used to create constant pointers as well, but you have to be congizant about how you use it.</P>

      <P>In particular, there are two different notions of constness with respect to pointers:</P>

      <Enumerate listStyleType="decimal">
        <Item>Constant pointers</Item>
        <Item>Pointers to constant data</Item>
      </Enumerate>

      <P>If a pointer itself is qualified constant (case 1), then that means the pointer itself must be initialized when it's declared, and it can't be changed after the fact. That's to say, you can't change "where it points to". You must immediately store a memory address inside it, and you cannot change that memory address afterward.</P>

      <P>If a pointer is qualified as a pointer-to-constant-data (case 2), then the pointer itself can be modified whenever you want, but when you dereference it, the underlying value is retrieved in the form of a constant. That's to say, you can't change "the value of the thing that it points to". Or, at least, you can't change the value of that thing <It>through the pointer</It> (you might be able to change it through other pointers, or through the original variable storing its value).</P>

      <P>To create a constant pointer (case 1), use the following syntax:</P>

      <SyntaxBlock>{
`<type>* const <name> = &<variable>`
      }</SyntaxBlock>

      <P>Replace <Code>{'<type>'}</Code> with the type of variable that the pointer will point to, replace <Code>{'<name>'}</Code> with the name of the pointer, and replace <Code>{'<variable>'}</Code> with the variable that you want the pointer to point to. Importantly, since this is a constant pointer, it must be initialized the moment that it's declared, hence the assignment operator.</P>

      <P>To declare a pointer-to-constant-data (case 2), use either of the following syntaxes:</P>

      <SyntaxBlock>{
`const <type>* <name>;
OR
<type> const * <name>;`
      }</SyntaxBlock>

      <P>In this case, the pointer itself is not constant, so it can be initialized later. Or, if you want, you can initialize it as you're declaring it. However, whenever such a pointer is dereferenced, the retrieved value is treated as a constant, so it cannot be modified through the dereferenced pointer.</P>

      <P>Here's an example to illustrate:</P>

      <CBlock fileName="constpointers.c">{
`int main(void) {
        int x = 1;
        int y = 2;

        // A constant pointer. It points to x.
        int* const p = &x;

        // p may not be modified. This would be a syntax error
        // p = &y; // NOT ALLOWED! p CANNOT BE CHANGED!

        // However, x can be modified THROUGH p:
        *p = 3; // x is now 3. This is allowed.

        // A pointer-to-constant-data. It points to x.
        int const * p2 = &x;
        // Or, equivalently:
        // const int* p2 = &x;

        // p2 is not a constant, so it may be modified.
        p2 = &y; // p2 now points to y. This is allowed.

        // However, when p2 is dereferenced, the underlying value is
        // treated as a constant, so this would be a syntax error
        // *p2 = 4; // NOT ALLOWED! *p2 CANNOT BE CHANGED!
}`
      }</CBlock>
      
      <P>To be clear, if you have a pointer-to-constant-data, that only means the underlying data cannot be modified <It>through the pointer</It>. In the above program, <Code>*p2</Code> cannot be modified, but <Code>y</Code> <It>can</It> be modified directly. For example, <Code>*p2 = 4</Code> is not allowed, but <Code>y = 4</Code> is allowed. This might seem unintuitive given that <Code>p2</Code> points to <Code>y</Code>, so <Code>*p2</Code> is, essentially, <Code>y</Code>. But the <Code>const</Code> qualifier on <Code>p2</Code> states that, even if <Code>p2</Code> does point to a non-constant integer, it may not be modified <It>through</It> <Code>p2</Code> in any way (basically, the type of <Code>y</Code> is simply <Code>int</Code>, but the type of <Code>*p2</Code> is treated as <Code>const int</Code>).</P>

      <P>A neat way to remember the difference between the syntax for constant-pointer and pointer-to-constant-data is as follows:</P>

      <Enumerate listStyleType="decimal">
        <Item>If the keyword <Code>const</Code> appears at the very left of the type specifier, move it to the right of the data type (but before the first asterisk). For example, if the full declaration is <Code>const int* p;</Code>, then change it to <Code>int const * p;</Code>. These syntaxes are equivalent, so this doesn't affect the meaning of the type.</Item>
        <Item>From there, read the fully qualified type from right to left. For example, <Code>int const * p</Code> would be read as "<Code>p</Code> is a pointer to a constant integer". Hence, <Code>p</Code> is a pointer-to-constant-data. In contrast, <Code>int* const p</Code> would be read as "<Code>p</Code> is a constant pointer to an integer". Hence, <Code>p</Code> is a constant pointer.</Item>
      </Enumerate>

      <P>Let's take it one step further. Suppose you want to create a <It>constant pointer to constant data</It>. You can do that by combining the above syntaxes:</P>

      <SyntaxBlock>{
`const <type>* const <name> = &<variable>
OR
<type> const * const <name> = &<variable>`
      }</SyntaxBlock>

      <P>Since such pointers are constant pointers, they must be initialized the moment they're declared and cannot be modified afterward. But in addition, dereferencing them retrieves the underlying value as a constant, so the values that they point to also cannot be modified through them. For example:</P>

      <CBlock fileName="constpointers.c" highlightLines="{26-37}">{
`int main(void) {
        int x = 1;
        int y = 2;

        // A constant pointer. It points to x.
        int* const p = &x;

        // p may not be modified. This would be a syntax error
        // p = &y; // NOT ALLOWED! p CANNOT BE CHANGED!

        // However, x can be modified THROUGH p:
        *p = 3; // x is now 3. This is allowed.

        // A pointer-to-constant-data. It points to x.
        int const * p2 = &x;
        // Or, equivalently:
        // const int* p2 = &x;

        // p2 is not a constant, so it may be modified.
        p2 = &y; // p2 now points to y. This is allowed.

        // However, when p2 is dereferenced, the underlying value is
        // treated as a constant, so this would be a syntax error
        // *p2 = 4; // NOT ALLOWED! *p2 CANNOT BE CHANGED!

        // Constant pointer to constant data. It points to x.
        int const * const p3 = &x;
        // Or, equivalently:
        // const int * const p3 = &x;

        // p3 may not be modified. This would be a syntax error
        // p3 = &y; // NOT ALLOWED! p3 CANNOT BE CHANGED!

        // In addition, when p3 is dereferenced, the underlying value is
        // treated as a constant, so this would be a syntax error as
        // well
        // *p3 = 4; // NOT ALLOWED! *p3 CANNOT BE CHANGED!
}`
      }</CBlock>

      <P>Again, we can parse this syntax using the right-to-left logic. <Code>int const * const p3</Code> can be read as "<Code>p3</Code> is a constant pointer to a constant integer". Hence, it's a constant-pointer-to-constant-data.</P>

      <P>In a future lecture, we'll introduce higher-dimensional pointers (i.e., pointers that point to pointers, and so on). But as it turns out, everything you've learned in this lecture applies directly to higher-dimensional pointers as well, including the above right-to-left parsing rule for constness.</P>

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
