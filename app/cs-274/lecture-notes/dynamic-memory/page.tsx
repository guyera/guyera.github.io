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
        <Item><Link href="#resizing-automatic-arrays">Resizing arrays?</Link></Item>
        <Item><Link href="#automatic-storage-duration-and-the-stack">Automatic storage duration and the stack</Link></Item>
        <Item><Link href="#how-the-stack-works">How the stack works</Link></Item>
        <Item><Link href="#dynamic-storage-duration-and-the-heap">Dynamic storage duration and the heap</Link></Item>
        <Item><Link href="#resizing-dynamic-arrays">Resizing arrays!</Link></Item>
        <Item><Link href="#returning-pointers-to-dynamic-memory">Returning pointers to dynamic memory</Link></Item>
        <Item><Link href="#calloc"><Code>calloc</Code></Link></Item>
        <Item><Link href="#common-dynamic-memory-mistakes">Common mistakes with dynamic memory</Link></Item>
      </Itemize>

      <SectionHeading id="resizing-automatic-arrays">Resizing arrays?</SectionHeading>

      <P>I've told you that, in the general case, arrays cannot simply be resized in memory. At least, they can't simply be expanded (shrinking is easier). For example, an array of 10 integers cannot simply be expanded to fit an 11th integer. There exist certain kinds of arrays that can <It>sort of</It> be expanded, but automatic arrays (the kinds of arrays we've discussed so far) can't be expanded (or shrunk) whatsoever.</P>

      <P>There are various reasons for this limitation, and they have to do with how arrays are stored in memory. In particular, arrays are contiguous by definition. There exist non-contiguous data structures (e.g., linked lists, graphs, trees, etc), but those structures simply aren't arrays. Contiguous structures such as arrays cannot simply be expanded in the general case because there might not be sufficient adjacent space in memory <It>to</It> expand them.</P>

      <P>For example, consider the following function:</P>

<CBlock showLineNumbers={false}>{
`void foo() {
        int array1[10];
        float array2[20];
        _Bool array3[5];
}`
}</CBlock>

      <P>Suppose a <Code>float</Code> is allocated 4 bytes of space in our platform. Then <Code>array2</Code> is backed by an 80-byte block of allocated memory. Suppose I want to add a 21st element to <Code>array2</Code>. I'd need to expand that 80-byte block into a 84-byte block. That is, I need to allocate 4 more bytes for it to fit the additional <Code>float</Code> element.</P>

      <P>But <It>where</It> should I acquire those 4 bytes? Well, an array is contiguous by definition, so those 4 bytes <Ul>must</Ul> be adjacent to the existing 80-byte block that makes up <Code>array2</Code>. Here in lies the problem: what if there are no free bytes adjacent to the current 80-byte block that constitutes <Code>array2</Code> in memory? Then we can't expand the array as-is.</P>

      <P>So, what can we do? Well, a clever solution might be to <It>move</It> the entire array to some other place in memory where there <It>is</It> sufficient unallocated space to dedicate an 84-byte block. To "move" an object essentially means to copy it to a new location in memory, and then free the original instance.</P>

      <P>Some kinds of objects can, actually, be moved around in memory. And this is precisely what I meant earlier when I said that certain kinds of arrays can <It>sort of</It> be resized<Emdash/>they can be moved to a new place with more available unallocated space, and then expanded in the process. However, automatic arrays<Emdash/>and automatic variables in general (i.e., regular function-local variables)<Emdash/>cannot be moved around in memory. Why is that?</P>

      <P>For one, any movement of an object through memory requires careful consideration because any existing pointers / references to that object will become invalid the moment it's moved. After all, those pointers refer to the <It>old</It> location of the object in memory, prior to it being moved elsewhere (that is, they'd essentially become dangling pointers). There could be countless such pointers spread throughout the entire application. Keeping track of all of them, let alone updating all of them appropriately, might be difficult from a program design perspective.</P>

      <P>But that's just difficult<Emdash/>not impossible. The fundamental reason why automatic variables cannot be moved in memory has to do with how and where they're stored (and when they're freed).</P>

      <SectionHeading id="automatic-storage-duration-and-the-stack">Automatic storage duration and the stack</SectionHeading>

      {/*TODO Many daigrams in this section, and really throughout the whole lecture*/}

      <P>Recall that an <Bold>automatic variable</Bold> is a variable with <Bold>automatic storage duration</Bold>. From a C syntax perspective, any regular, function-local variable is an automatic variable.</P>

      <P>Recall that automatic storage duration means the variable in question is freed from memory automatically by the program at a certain time. In particular, automatic variables are bound to the scopes in which they're declared. When an automatic variable's scope ends (not just temporarily pauses due to a function call, but rather when it <It>ends</It>, such as by encountering the closing curly brace, a return statement, a <Code>break</Code> statement, etc), the program will then free it from memory. Or perhaps the program will free it from memory slightly after that point (e.g., at the end of the function, as is actually the case in most C implementations)<Emdash/>but never before.</P>

      <P>Now, consider that scopes start and end in a <Bold>last-in-first-out (LIFO)</Bold> fashion. That is, the last scope to start will always be the first scope to end. For instance, the <Code>main</Code> function's scope is the very first [programmer-defined] function scope to start in a C program, but it's also the last one to end. When it ends, the program ends.</P>

      <P>Similarly, within a function scope, there may be a function call that temporarily jumps to another function scope. In such a case, that second function will eventually end, and <It>then</It> the first function will resume (and eventually end itself later on). Again: the last function scope to start is the first to end.</P>

      <P>Another example: within a function scope, you might encounter an if statement. Assuming the if statement's condition is true, then the if statement's scope will start, execute its body of code, and then end. Later on, the function scope (which has been running all along) will eventually end. Again: the last scope to start (the if statement scope) is the first to end.</P>

      <P>Since the lifetime (storage duration) of an automatic variable is bound to its scope<Emdash/>allocated when needed within the scope and freed at or slightly after the end of the scope<Emdash/>and since scopes start and end in a last-in-first-out fashion, automatic variables are allocated and freed in a last-in-first-out fashion.</P>

      <P>Because automatic variables are allocated and freed in a last-in-first-out fashion, they're stored in a special place in the process's memory that's specifically designed for allocating and freeing objects in a last-in-first-out fashion. This place in memory is <Bold>the stack</Bold>.</P>

      <P>(Technically, each <It>kernel thread</It> has its own stack. Some processes consist of many threads and therefore have many stacks. But this course focuses on single-threaded processes, so we can treat stacks and processes as one-to-one.)</P>

      <P>You can imagine a process's stack like a stack of plates. If you want to add a plate to the stack, you must put it on top. If you want to remove a plate from the stack, you must remove a plate from the top. Hence, the first plate to be removed is always the last plate that was added. It's not possible to remove a plate from the bottom or middle of the stack. A process's stack works the same way: an object (automatic variable) can be added to the top of the stack, and an object can be removed from the top of the stack, but that's it. It's not possible to remove an object (free an automatic variable) from the bottom or middle of the process's stack. (Yes, this is a slightly weak analogy; you <It>could</It> shimmy a plate out from the middle of a stack of plates, but you fundamentally <Ul>cannot</Ul>, by definition, free an object from the middle of a process's stack).</P>

      <P>These last-in-first-out constraints of the stack come with pros and cons. The pros are primarily compactness, performance, and simplicity for the programmer. However, a major con is that <Ul>it's effectively impossible to move an object from one part of the stack to another</Ul>. To understand these pros and cons, you must first understand exactly how the computer stores and accesses data on the stack.</P>

      <SectionHeading id="how-the-stack-works">How the stack works</SectionHeading>

      <P>Warning: lots of theory incoming.</P>

      <P>Automatic variables are specifically stored in <Bold>stack frames</Bold>. A stack frame is a block of bytes on the stack dedicated to storing all the automatic variables (and some other data, like function return addresses) associated with a single scope, or, as is the case in most C implementations, an entire function scope and all its nested scopes. That's to say, in most cases, whenever a function starts, an entire block of bytes (a stack frame) is allocated (<Bold>pushed</Bold>) on top of the stack, big enough to store all the automatic variables (and some other data) used in that function's scope and all its nested scopes. Similarly, whenever a function ends, its associated stack frame is freed (<Bold>popped</Bold>) from the top of the stack.</P>

      <P>The CPU constantly keeps track of the base address of the current stack frame (i.e., the memory address of the bottom edge of the stack frame that's at the top of the stack) by storing it in a special dedicated register. Whenever a new stack frame is pushed onto the stack (i.e., whenever a new function starts), or whenever a stack frame is popped from the stack (i.e., whenever a function ends), the CPU updates the base address stored in that register.</P>

      <P>With all that in mind, in order to access an object on the stack, the program only needs to know its offset relative to the base address of its stack frame, which is referred to as the object's <Bold>stack offset</Bold>. So long as it knows an object's stack offset, it can access the object by simply adding that offset to the base address of the stack frame (which is always stored in the special CPU register that I just mentioned) and dereferencing the resulting address. If that sounds similar to how a program accesses an element in an array<Emdash/>adding an offset to a base address and dereferencing the result<Emdash/>that's because it is. This is the general strategy for accessing data in basically <It>any</It> contiguous structure (yes, the stack is contiguous; more on this shortly).</P>

      <P>So, how does the program figure out the stack offset of a given automatic variable? Simple: in most cases, an automatic variable's stack offset is decided at compile time and embedded directly into the machine instructions of the compiled executable.</P>
      
      <P>Take this program for example:</P>

      <CBlock fileName="simpleprogram.c">{
`int main() {
        int a = 1;
        int b = a + 5;
        int c = b * 7;
}
`
      }</CBlock>

      <P>As it turns out, you can tell <Code>gcc</Code> to compile the above program into assembly code, but <It>not</It> assemble that assembly code into an executable, by supplying the <Code>-S</Code> flag. This produces <Code>simpleprogram.s</Code>, containing the compiled assembly code:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -S simpleprogram.c`
      }</TerminalBlock>

      <P>The produced assembly code file, <Code>simpleprogram.s</Code>, is quite long and complicated, but the part corresponding to the <Code>main</Code> function looks like this:</P>
      
      <Verbatim>{
`main:
.LFB0:
        .file 1 "simpleprogram.c"
        .loc 1 1 12
        .cfi_startproc
        pushq   %rbp
        .cfi_def_cfa_offset 16
        .cfi_offset 6, -16
        movq    %rsp, %rbp
        .cfi_def_cfa_register 6
        .loc 1 2 6
        movl    $1, -4(%rbp)
        .loc 1 3 6
        movl    -4(%rbp), %eax
        addl    $5, %eax
        movl    %eax, -8(%rbp)
        .loc 1 4 6
        movl    -8(%rbp), %edx
        movl    %edx, %eax
        sall    $3, %eax
        subl    %edx, %eax
        movl    %eax, -12(%rbp)
        movl    $0, %eax
        .loc 1 5 1
        popq    %rbp
        .cfi_def_cfa 7, 8
        ret
        .cfi_endproc
`
      }</Verbatim>

      <P>The <Code>.loc X Y Z</Code> lines, among several other lines prefixed by dots, are debugging symbols injected by GCC due to the <Code>-g</Code> flag. <Code>.loc X Y Z</Code> means "the below assembly instructions were generated from line Y, column Z, in source code file X". For example, <Code>.loc 1 2 6</Code> annotates assembly instructions that correspond to line 2 in source code file 1 (i.e., line 2 of <Code>simpleprogram.c</Code>).</P>

      <P>I recognize that most students in this class don't have experience reading or writing assembly code. That's okay; let me walk you through it. <Code>%rbp</Code> is the register base pointer. It's the special register that I was talking about that keeps track of the base address of the current function's stack frame (i.e., the top stack frame in the process's stack). Writing out the register in parentheses prefixed with a number will invoke some pointer arithmetic: it adds the prefixed number to the address stored in the register, and then it dereferences the result. For example, <Code>-4(%rbp)</Code> subtracts 4 from the base address of the current stack frame and then dereferences the result. <Code>-8(%rbp)</Code> subtracts 8 and dereferences the result. And so on. In other words, each number prefixing <Code>(%rbp)</Code> is likely a stack offset of some variable or another.</P>

      <P>With this in mind, by analyzing the above assembly code, one can infer that the stack offset of the variable <Code>a</Code>, accessed on lines 2 and 3 of <Code>simpleprogram.c</Code>, is <Code>-4</Code>; the stack offset of <Code>b</Code>, accessed on lines 3 and 4, is <Code>-8</Code>; and the stack offset of <Code>c</Code>, accessed on line 4, is <Code>-12</Code>. Apparently, that's where the compiler has decided that these three variables will be stored within the stack frame. Notice: these stack offsets are generated by the compiler and embedded directly into the assembly code instructions. Assembly code is one-to-one with machine code. That is, stack offsets are not stored as writable data in memory, but rather embedded directly into machine instructions.</P>

      <P>(The stack offsets are negative because the stack actually starts at the end of the process's virtual address space and grows backward. That's to say, larger memory addresses correspond to lower parts of the stack, and smaller memory addresses correspond to higher parts of the stack. <Code>%rbp</Code> stores the base address (address of the bottom) of the current stack frame. The variables in the stack frame are stored on top of that, meaning at smaller addresses. The first variable, <Code>a</Code>, has a stack offset of -4 since an <Code>int</Code> is 4 bytes on the ENGR servers.)</P>

      <P>An important result of this stack storage and access strategy is that it allows the stack to remain contiguous at all times. Indeed, the compiler decides exactly where all the automatic variables fit together within a given function's stack frame(s), and it leaves no gaps between them (except perhaps for performance reasons, such as byte alignment). When stack frames are actually created at runtime, they're pushed directly on top of the existing top stack frame, again with no gaps between them. No gaps means contiguity.</P>

      <P>This contiguity comes with several advantages. A small advantage is compactness: having no gaps between objects on the stack means little to no memory is wasted.</P>

      <P>But there are much bigger advantages. A major advantage is that the program only needs to dereference <It>one</It> memory address (besides those containing the machine instructions) to retrieve an object on the stack (that being the address computed by adding the object's stack offset with the stack frame's base address). That's just one layer of indirection. Most alternative strategies would require two. This is one reason why the stack is highly performant.</P>

      <P>Another major advantage of contiguity is <Bold>spacial locality</Bold>. Spacial locality is a measure of how closely together objects are stored, particularly objects that are accessed back-to-back / in near succession. If a program is going to be accessing a group of objects back-to-back, such as a group of automatic variables declared in the same scope, then it's extremely beneficial, from a performance standpoint, for those objects to be close together in memory (i.e., to have high spacial locality). The reasons for this are beyond the scope of this course; if you're curious, you should research <Link href="https://en.wikipedia.org/wiki/CPU_cache">CPU caches, cache lines</Link>, <Link href="https://en.wikipedia.org/wiki/Cache_prefetching">cache prefetching</Link>, and <Link href="https://en.wikipedia.org/wiki/Locality_of_reference">locality of reference</Link>.</P>

      <P>Yet another advantage of the stack's management is simplicity for the programmer. <It>You</It> don't have to think about freeing automatic variables from memory. Rather, all automatic variables are stored in stack frames, which are automatically freed from memory the moment their respective functions (or scopes) end.</P>

      <P>But what about the disadvantages of the stack? Well, as I said, a major disadvantage is that an object cannot be moved from one part of the stack to another. Maybe the reason is clear by now: the stack offset of each automatic variable is a compile-time constant. It's determined by the compiler, at compile time, and embedded directly into machine instructions in the compiled executable (e.g., -4, -8, and -12: the decided stack offsets of <Code>a</Code>, <Code>b</Code>, and <Code>c</Code> in <Code>simpleprogram.c</Code>). This means that stack offsets cannot be modified at runtime, hence objects cannot be moved around within their stack frames at runtime.</P>

      <P>Now, you might think that it's possible for the stack to simply be implemented in a slightly different way, such that it <It>is</It> possible for objects to be moved around on the stack. For example, perhaps the stack offsets could be stored as data in writable memory rather than being embedded into readonly machine instructions. Or perhaps objects could somehow be moved <It>between</It> stack frames when the programmer so chooses. But these ideas actually contradict the very definition of a stack: if a stack supported arbitrary object movement (without leveraging additional external data structures), then it's not really a stack to begin with. Think about it<Emdash/>moving an object in memory really means doing the following:</P>

      <Enumerate listStyleType="decimal">
        <Item>Allocate a new block in memory to which the object's bytes will be moved</Item>
        <Item>Copy the bytes of the object from its current block in memory to the new block</Item>
        <Item>Free the object's old block in memory</Item>
      </Enumerate>

      <P>These three steps clearly do <Ul>not</Ul> allocate and free data in a last-in-first-out (LIFO) fashion. They involve allocating a new block of memory, and then freeing an <It>older</It> block of memory shortly thereafter, without freeing the recently allocated new block first. Stacks are, by definition, LIFO structures, so the above operations cannot be supported by a lone stack. That is, <It>if</It> stack offsets (or equivalent) were stored as data in writable memory and modified throughout the duration of the program, therefore allowing data to be moved around the stack at runtime by modifying those stack offsets, then the stack would not actually be a stack by definition. It would be something else entirely.</P>

      <P>(It's theoretically possible to skip step 3: freeing the object's old block in memory. But this would cause the program to consume a large amount of memory unnecessarily, potentially more and more over time as the program runs. Not to mention, structuring your scopes so as to avoid step 3 would result in some pretty absurd code with lots of recursion and callbacks.)</P>

      <P>To summarize: the stack is compact, performant, and simple to use, but objects cannot be freely moved around within the stack. This is all a result of how the stack works.</P>

      <P>Now, recall what started this discussion: in the general case, expanding an array in memory might require moving it. This is why automatic (stack-allocated) arrays cannot be resized<Emdash/>resizing them would require moving them to some other place where they can fit post-resizing, but they can't be moved because they're stored on the stack.</P>

      <P>However, this doesn't mean that no array can <It>ever</It> be moved or resized. It only means that arrays <It>on the stack</It> can't be moved or resized.</P>

      <P>(Foreshadowing:) Perhaps there exists some other place in memory where arrays can be created as well. Perhaps that other place in memory isn't a stack at all, but rather has its own structure and follows its own ruleset. Perhaps that structure and ruleset support movement of objects, maybe at the cost of some of the stack's many advantages. If that were the case, then we could create arrays <It>there</It> instead, and move them around when needed to facilitate their resizing.</P>

      <SectionHeading id="dynamic-storage-duration-and-the-heap">Dynamic storage duration and the heap</SectionHeading>

      <P>Indeed, such a memory model exists, and it's called <Bold>the heap</Bold>. The heap is the direct counterpart to the stack.</P>

      <Itemize>
        <Item>The stack is contiguous. The heap is non-contiguous.</Item>

        <Itemize>
          <Item>Contiguity gives compactness. Hence, the stack is very compact. The heap is much less compact, or "wasteful" of memory. It's often <Bold>fragmented</Bold> (i.e., contains gaps / unallocated blocks of memory in between objects)</Item>
          <Item>Contiguity gives several performance advantages, like spacial locality and ease of access through a single layer of indirection. The heap often has much worse spacial locality, and two layers of indirection are required to access an object on the heap (as you'll see).</Item>
        </Itemize>
        <Item>The stack is simple to use. Stack frames are allocated and freed automatically according to function calls and scopes. The heap is much harder to use (at least in C). Heap allocations and frees are performed manually by calling certain functions (<Code>malloc</Code>, <Code>free</Code>, etc). That means it's possible for the programmer to mess up (e.g., forget to allocate something, or forget to free something).</Item>
      </Itemize>

      <P>Now, I've just said that allocating and freeing data on the heap must be done "manually" by calling certain functions. Let's start there. Memory that's allocated on the heap is referred to as <Bold>dynamic memory</Bold>, or <Bold>dynamically allocated memory</Bold>. Dynamic memory is allocated in individual contiguous blocks. In the simplest case, a block of dynamic memory can be allocated via the <Code>malloc</Code> function, which is provided by <Code>stdlib.h</Code>. In most cases, you should call it like so:</P>

      <SyntaxBlock>{
`<type>* <ptr_name> = malloc(<size>);`
      }</SyntaxBlock>

      <P>Replace <Code>{'<type>'}</Code> with the type of data that you'd like to store in this block of bytes on the heap (e.g., if you're allocating a single <Code>int</Code> on the heap, <Ul>or</Ul> an array of <Code>int</Code> elements on the heap, then replace <Code>{'<type>'}</Code> with <Code>int</Code>). Replace <Code>{'<ptr_name>'}</Code> with the name of a pointer (which is declared by this line of code; more on this in a moment). Replace <Code>{'<size>'}</Code> with the size in bytes that you'd like this dynamically allocated block to be. In basically all cases, you must use the <Code>sizeof</Code> operator, and perhaps a bit of arithmetic, to compute the appropriate size.</P>

      <P>So, what exactly does this do? Well, the <Code>malloc</Code> function accepts a size in bytes. It then attempts to find a contiguous unallocated block on the heap that's <It>at least</It> that big. If it succeeds in finding such a block, it will mark it (or part of it) as allocated, and then it will return the base address of that allocated block. If it fails to find a sufficiently large contiguous unallocated block on the heap, it will instead allocate nothing and return <Code>NULL</Code>. A robust C program will always check to see if the return value is <Code>NULL</Code> and, if so, attempt to handle the error accordingly (or, at the very least, log the error somewhere and force-terminate the program to support diagnostics and prevent would-be undefined behavior as a result of dereferencing the <Code>NULL</Code> pointer).</P>

      <P>The return type of <Code>malloc</Code> is <Code>void*</Code>: a <Code>void</Code> pointer. We'll discuss <Code>void</Code> pointers later in the term, but for now, just understand that a <Code>void</Code> pointer can be a pointer to <It>anything</It>. And maybe that makes sense; <Code>malloc</Code> can be used to allocate dynamic memory for any kind of data, hence when it returns the base address of that allocated block, it must be very loosely typed. <Code>void</Code> pointers are very flexible, but they can't really be used or dereferenced as-is. Before you can use them, you must cast them into the appropriate type. If you intend to store one or more <Code>int</Code> values in the dynamically allocated block of bytes, then you must cast it to an <Code>int*</Code>. If you intend to store <Code>float</Code> values in that block of bytes, then you must cast it to a <Code>float*</Code>. And so on.</P>

      <P>Here's a simple (but very silly) example:</P>

      <CBlock fileName="dynmem.c">{
`#include <stdio.h>
#include <stdlib.h>

int main() {
        // Allocate a block of dynamic memory that's just big enough to
        // store a single float. Store the base address of that block
        // of bytes in an float* variable, ptr.
        float* ptr = malloc(sizeof(float));

        // Check to see if malloc() failed to find a sufficiently large
        // block of unallocated memory on the heap
        if (!ptr) { // i.e., if (ptr == NULL)
                // If your program is truly capable of handling this error
                // somehow, (e.g., returning NULL or some sort of error code
                // back to the call site), now is when you'd do it.

                // Otherwise, log the error and force-terminate the entire
                // program, lest we encounter undefined behavior when we
                // attempt to dereference ptr later.
                printf("Error! Failed to allocate dynamic memory!\\n");

                // Provided by stdlib.h, exits the whole program with the
                // provided exit code (essentially returns out of the main
                // function, even if it's not called from within the main
                // function). Use a nonzero exit code to indicate an error.
                exit(1);
        }

        // If the program is still running, then it must have successfully
        // allocated the dynamic memory.

        // ptr now stores the memory address of a block of bytes on the
        // heap that's just big enough to contain a single float. We can
        // now dereference ptr to access those bytes and write a float
        // value into them
        *ptr = 3.14;

        // The memory is now allocated AND initialized. Now we can
        // proceed to read the value / use it
        printf("%f\\n", *ptr); // Prints 3.1400
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o dynmem dynmem.c 
$ valgrind ./dynmem 
==2074094== Memcheck, a memory error detector
==2074094== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2074094== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2074094== Command: ./dynmem
==2074094== 
3.140000
==2074094== 
==2074094== HEAP SUMMARY:
==2074094==     in use at exit: 4 bytes in 1 blocks
==2074094==   total heap usage: 2 allocs, 1 frees, 1,028 bytes allocated
==2074094== 
==2074094== LEAK SUMMARY:
==2074094==    definitely lost: 4 bytes in 1 blocks
==2074094==    indirectly lost: 0 bytes in 0 blocks
==2074094==      possibly lost: 0 bytes in 0 blocks
==2074094==    still reachable: 0 bytes in 0 blocks
==2074094==         suppressed: 0 bytes in 0 blocks
==2074094== 
==2074094== For lists of detected and suppressed errors, rerun with: -s
==2074094== ERROR SUMMARY: 1 errors from 1 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>(You might have noticed the heap summary, which says 4 bytes in 1 block are in use at exit. More on this in a moment.)</P>

      <P>This example is silly because there's no real reason to put this <Code>float</Code> value on the heap; we could just put it on the stack instead.</P>

      <P>But as I've explained, a major downside to the stack is that stack-allocated objects can't be moved around in memory, which makes it impossible to resize stack-allocated arrays. The heap doesn't have that constraint. Hence, an extremely common use case of the heap is to store resizable arrays (and / or arrays within structures whose sizes need to vary from one instance to another). Arrays allocated on the heap are referred to as <Bold>dynamic arrays</Bold>.</P>

      <P>Moreover, I've mentioned in the past that VLAs (variable-length [automatic] arrays) have lots of technical problems with them, even though they're technically supported by most C compilers. In contrast, there's absolutely no issue with using a variable as the size of a dynamic array. That is, the argument that's passed to the <Code>malloc</Code> function can be any arbitrary mathematical expression that resolves to a positive integer, even if it contains variables.</P>

      <P>These are perhaps the two most common use cases of dynamic memory in C: 1) creating resizable arrays, and 2) creating arrays whose sizes depend on one or more variables.</P>

      <P>With that in mind, here's a slightly more reasonable example that allocates a dynamic array of N <Code>float</Code>'s instead of just a single <Code>float</Code>, where N is decided by the user:</P>

      <CBlock fileName="dynarray.c">{
`#include <stdio.h>
#include <stdlib.h>

int main() {
        // Ask the user for how big the array should be
        printf("How many floats should the array have?: ");
        size_t n;
        scanf("%ld", &n);

        // Create a dynamic array of that many floats. This is done by
        // computing the size of such an array in bytes
        // (sizeof(float) * n), passing that size to
        // malloc(), and treating the returned address as the base
        // address of an array of floats.
        float* numbers = malloc(sizeof(float) * n);
        if (!numbers) {
                printf("Error on malloc()\\n");
                exit(1);
        }

        // numbers stores the base address of a block of bytes on the
        // heap that's big enough to store n floats. We can indeed treat
        // it as an array of n floats. Let's populate it with a bunch
        // of copies of 3.14
        for (int i = 0; i < n; ++i) {
                numbers[i] = 3.14;
        }

        // Print the last value in the array
        printf("%f\\n", numbers[n-1]);
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o dynarray dynarray.c 
$ valgrind ./dynarray 
==2120948== Memcheck, a memory error detector
==2120948== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2120948== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2120948== Command: ./dynarray
==2120948== 
How many floats should the array have?: 172
3.140000
==2120948== 
==2120948== HEAP SUMMARY:
==2120948==     in use at exit: 688 bytes in 1 blocks
==2120948==   total heap usage: 3 allocs, 2 frees, 2,736 bytes allocated
==2120948== 
==2120948== LEAK SUMMARY:
==2120948==    definitely lost: 688 bytes in 1 blocks
==2120948==    indirectly lost: 0 bytes in 0 blocks
==2120948==      possibly lost: 0 bytes in 0 blocks
==2120948==    still reachable: 0 bytes in 0 blocks
==2120948==         suppressed: 0 bytes in 0 blocks
==2120948== Rerun with --leak-check=full to see details of leaked memory
==2120948== 
==2120948== For lists of detected and suppressed errors, rerun with: -s
==2120948== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>While the above program can technically be done with a VLA, this solution avoids all the technical issues of VLAs. Moreover, I'll show you how to resize a dynamic array pretty soon<Emdash/>something that even VLAs can't do.</P>

      <P>But first, let's address the elephant in the room: freeing dynamic memory. Dynamic memory has <Bold>dynamic storage duration</Bold>, which means it must be freed manually by calling specific functions, namely <Code>free</Code>, at runtime. This is in contrast to the stack's automatic storage duration, wherein objects are freed automatically when they fall out of scope or when their functions end (and their stack frames are popped off the stack).</P>

      <P>Failing to call the <Code>free</Code> function (or similar) to free your dynamic memory results in a <Bold>memory leak</Bold>. A memory leak is simply any case where a program fails to free some memory after it's done using it. Dynamic memory isn't freed until you choose to free it via the <Code>free</Code> function, so if you don't call the <Code>free</Code> function to free it, then it won't be freed.</P>

      <P>On most modern operating systems, a process's lingering dynamic memory will be freed automatically by the OS when the entire process (program) ends. However, you shouldn't count on that. For one, some niche embedded operating systems do not free lingering dynamic memory at the end of the process. More importantly, though: even if lingering dynamic memory is freed when the process ends, that still means <It>it isn't freed until the process ends</It>. If your program builds up memory leaks over time (e.g., because it allocates dynamic memory in a loop but fails to free it properly in some or all iterations), it could eventually run out of available space to expand the heap. This is sometimes called a <Bold>heap overflow</Bold> (though this term can also refer to heap smashing, meaning a heap-based buffer overflow). Subsequent calls to <Code>malloc</Code> will return <Code>NULL</Code>. The program will almost surely be unable to handle that in the long term; it'll likely crash.</P>

      <P>(Note: Some people find it important to distinguish <It>unreachable</It> unfreed blocks from <It>reachable</It> unfreed blocks. The former is a block of dynamically allocated memory for which all pointers / references to it are lost before getting a chance to free it. The latter is a block of dynamically allocated memory that's never freed, but pointers / references to it still exist at the time the process terminates. Some people say that reachable blocks are not truly "leaked" since the process "could have" freed those blocks just before termination but simply didn't, relying on the OS to free them instead. Other people say that unreachable and reachable unfreed blocks are just two different <It>kinds</It> of memory leaks. Definitions are nebulous.)</P>

      <P>Technically, one-off memory leaks aren't a huge deal by themselves. In fact, leaving it up to the operating system to free such leaked memory may be a fast, legitimate deallocation strategy for some programs that allocate very large amounts of dynamic memory (the OS can free large amounts of dynamic memory extremely quickly upon process termination by simply unmapping the process's physical pages and deleting the process's page table (which it must do either way)).</P>

      <P>However, seemingly innocuous one-off memory leaks can make it more difficult to debug the more problematic iterative memory leaks that build up over time (e.g., Valgrind can't distinguish them from one another). Moreover, a one-off memory leak can become an iterative leak if the offending function is ever (one day) called inside a loop. As a general rule of thumb, you should make it your goal to avoid all memory leaks. Memory leaks of any kind may be penalized in some of this course's labs and assignments (always read the rubric!).</P>

      <P>Valgrind will tell you when you have memory leaks. When the program ends, Valgrind will print out a "HEAP SUMMARY". In the above Valgrind output, it says 688 bytes in 1 block were in use at exit. Anything other than "0 bytes in 0 blocks" means you have some kind of memory leak. (688 bytes in particular is 172 <Code>float</Code>'s * 4 bytes per <Code>float</Code>).</P>

      <P>(You might also notice that Valgrind says there were 3 allocations and 2 frees. This is because the C standard library and other internal tooling often allocates and frees some dynamic memory itself. It apparently allocated 2 blocks and freed both of those blocks. We then allocated a third block ourselves but never freed it.)</P>

      <P>So, we should fix our memory leak. In order to fix a memory leak, you must first <It>find</It> it. In this case, it's simple: the dynamic array that <Code>numbers</Code> points to was never freed. But in more complicated programs that allocate and free a lot of dynamic memory, it might not be obvious where the memory leak(s) are coming from. To locate memory leaks in a C program:</P>

      <Enumerate listStyleType="decimal">
        <Item>Make sure to compile the program with the <Code>-g</Code> flag</Item>
        <Item>When running the program through Valgrind, optionally supply <Code>--leak-check=full</Code> and <Code>--show-leak-kinds=all</Code>. For example:</Item>
        
        <P><Code>valgrind --leak-check=full --show-leak-kinds=all a.out</Code></P>

        <P>This will cause Valgrind to tell you not just <It>how much</It> memory was leaked, but <It>where that memory was allocated</It>. It also causes Valgrind to show information about various categories of memory leaks (which we won't discuss).</P>
      </Enumerate>

      <P>I strongly recommend that you put the following line of code at the bottom of your <Code>.bashrc</Code> file within your home directory on the ENGR servers:</P>

      <P><Code>alias valgrind='valgrind --leak-check=full --show-leak-kinds=all'</Code></P>

      <P>This causes the shell to automatically put in the <Code>--leak-check=full</Code> and <Code>--show-leak-kinds=all</Code> flags whenever you run the <Code>valgrind</Code> command. Note: You'll have to reset your SSH session or execute <Code>{'source ~/.bashrc'}</Code> for these changes to take effect.</P>

      <P>Once you've done that, run the above program through Valgrind again:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o dynarray dynarray.c 
$ valgrind ./dynarray 
==2086469== Memcheck, a memory error detector
==2086469== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2086469== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2086469== Command: ./dynarray
==2086469== 
How many floats should the array have?: 172
3.140000
==2086469== 
==2086469== HEAP SUMMARY:
==2086469==     in use at exit: 688 bytes in 1 blocks
==2086469==   total heap usage: 3 allocs, 2 frees, 2,736 bytes allocated
==2086469== 
==2086469== 688 bytes in 1 blocks are definitely lost in loss record 1 of 1
==2086469==    at 0x484682F: malloc (vg_replace_malloc.c:446)
==2086469==    by 0x401182: main (dynarray.c:15)
==2086469== 
==2086469== LEAK SUMMARY:
==2086469==    definitely lost: 688 bytes in 1 blocks
==2086469==    indirectly lost: 0 bytes in 0 blocks
==2086469==      possibly lost: 0 bytes in 0 blocks
==2086469==    still reachable: 0 bytes in 0 blocks
==2086469==         suppressed: 0 bytes in 0 blocks
==2086469== 
==2086469== For lists of detected and suppressed errors, rerun with: -s
==2086469== ERROR SUMMARY: 1 errors from 1 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Notice: immediately below the heap summary, it says <It>where</It> the leaked block of dynamic memory was allocated: <Code>dynarray.c</Code>, line <Code>15</Code>. Sure enough, that was this line of code, where we allocated the dynamic array of <Code>float</Code>'s:</P>

      <P><Code>{'float* numbers = malloc(sizeof(float) * n);'}</Code></P>

      <P>Now that we've found our leaked memory (not that we had any doubt as to where it was), we can free it. To free dynamic memory, call the <Code>free</Code> function, provided by <Code>stdlib.h</Code>. As the argument, provide a pointer storing the base address of the dynamically allocated block that you'd like to free. Yes, this is the exact same address that was returned by <Code>malloc</Code> and stored in <Code>numbers</Code> when the block was allocated. In other words:</P>

      <CBlock fileName="dynarray.c" highlightLines="{32-33}">{
`#include <stdio.h>
#include <stdlib.h>

int main() {
        // Ask the user for how big the array should be
        printf("How many floats should the array have?: ");
        size_t n;
        scanf("%ld", &n);

        // Create a dynamic array of that many floats. This is done by
        // computing the size of such an array in bytes
        // (sizeof(float) * n), passing that size to
        // malloc(), and treating the returned address as the base
        // address of an array of floats.
        float* numbers = malloc(sizeof(float) * n);
        if (!numbers) {
                printf("Error on malloc()\\n");
                exit(1);
        }

        // numbers stores the base address of a block of bytes on the
        // heap that's big enough to store n floats. We can indeed treat
        // it as an array of n floats. Let's populate it with a bunch
        // of copies of 3.14
        for (int i = 0; i < n; ++i) {
                numbers[i] = 3.14;
        }

        // Print the last value in the array
        printf("%f\\n", numbers[n-1]);

        // Free the dynamic array
        free(numbers);
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o dynarray dynarray.c 
$ valgrind ./dynarray 
==2093654== Memcheck, a memory error detector
==2093654== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2093654== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2093654== Command: ./dynarray
==2093654== 
How many floats should the array have?: 172
3.140000
==2093654== 
==2093654== HEAP SUMMARY:
==2093654==     in use at exit: 0 bytes in 0 blocks
==2093654==   total heap usage: 3 allocs, 3 frees, 2,736 bytes allocated
==2093654== 
==2093654== All heap blocks were freed -- no leaks are possible
==2093654== 
==2093654== For lists of detected and suppressed errors, rerun with: -s
==2093654== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>There, our memory leak is gone.</P>

      <P>Exactly when dynamic memory should be freed is largely up to the programmer. However, the timing of the free must follow these constraints:</P>

      <Enumerate listStyleType="decimal">
        <Item>Each block of allocated dynamic memory must be freed exactly once, <It>eventually</It>. Otherwise, you have a memory leak.</Item>
        <Item>A block of allocated dynamic memory must not be freed before the program is done using it. Otherwise, you have a use-after-free error, which invokes undefined behavior.</Item>
      </Enumerate>

      <P>Now, here's a critical point that often confuses students: in the above program, the pointer, <Code>numbers</Code>, is stored on the <Ul>stack</Ul>. It is <Ul>not</Ul> stored on the heap. However, the block of bytes that it <It>points</It> to is stored on the heap. This means that when the pointer falls out of scope (or, in most C implementations, when its function ends), the pointer itself will be freed from memory along with its stack frame. However, the block of memory on the heap that it points to will <Ul>not</Ul> be freed at that time. Moreover, if <Code>numbers</Code> falls out of scope before we get a chance to free the dynamic memory that it points to, and we don't create a copy of that pointer anywhere else, then it will become impossible to ever free the dynamic memory from that point on in the program. After all, the <Code>free</Code> function requires you to give it the base address of the block to be freed. If that base address is only stored in the <Code>numbers</Code> pointer, and that pointer falls out of scope, then you'll no longer have access to any pointers storing that address, so you won't be able to pass it to the <Code>free</Code> function.</P>

      <P>So, a block of dynamic memory must be freed before all of the pointers that point to it are lost (e.g., before the last one falls out of scope), but after the program is done using it. Sometimes, that's a very narrow window. Other times it's a very large window.</P>

      <SectionHeading id="resizing-dynamic-arrays">Resizing arrays!</SectionHeading>

      <P>Let's discuss a <It>real</It> use of dynamic memory: creating resizable arrays.</P>

      <P>The basic strategy to effectively resize an array is as follows:</P>

      <Enumerate listStyleType="decimal">
        <Item>Allocate a new block of dynamic memory to represent the array post-resizing (perhaps larger than the old array, or perhaps smaller, depending on your goals)</Item>
        <Item>Copy the elements that you want to keep from the old array to the new array</Item>
        <Item>Free the old array</Item>
      </Enumerate>

      <P>We can't do this on the stack since the stack allocates and frees memory in a very particular (LIFO) order. The heap has no such restrictions; we can allocate and free whatever dynamic memory we want, whenever we want. So let's implement this strategy:</P>

      <CBlock fileName="resizearray.c">{
`#include <stdlib.h>
#include <string.h> // For memcpy
#include <stdio.h>

int main() {
        // First, we create a pointer to store the base address of the
        // dynamic array. We'll modify this pointer as the program goes
        // on. For now, it'll be NULL, indicating that no array
        // exists yet.
        float* list = NULL;

        // We'll also have to keep track of its size, which will change
        // throughout the program.
        size_t list_size = 0;

        // Now, we ask the user for numbers, one at a time, until
        // they choose to stop, adding each number to the array.
        int keep_going = 1;
        do {
                printf("Enter a number: ");
                float new_number;
                scanf("%f", &new_number);

                // Expand the array.
                // Step 1: Allocate new, bigger array, big enough to
                // store all the current values AND the new value
                // (# elements = list_size + 1)
                float* new_array = malloc(
                        sizeof(float) * (list_size + 1)
                );
                if (!new_array) {
                    printf("Error on malloc()\\n");
                    exit(1);
                }

                // Step 2. Copy elements from old array to new array.
                // Could use a for loop. I'll use memcpy.
                memcpy(new_array, list, sizeof(float) * list_size);

                // Step 3. Free the old array, which list currently
                // points to
                free(list);

                // Step 4. The new array has an extra slot at the end
                // of it, currently uninitialized. Initialize it to the
                // new value entered by the user
                new_array[list_size] = new_number;

                // Step 5. Update the pointer (list) and size
                // (list_size) variables accordingly. The pointer
                // should now point to the new dynamic array, and the
                // size should be incremented by 1.
                list = new_array; // Copies just the address over
                ++list_size;

                // Done. Now just ask the user if they want to supply
                // another number.
                printf("Do you want to supply another number? Enter "
                        "1 for yes, 0 for no: ");
                scanf("%d", &keep_going);
        } while(keep_going);

        // Program is all done. Free the final array, which list
        // currently points to.
        free(list);
}
`
      }</CBlock>

      <P>Here's an example run:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o resizearray resizearray.c
$ valgrind ./resizearray 
==2153942== Memcheck, a memory error detector
==2153942== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2153942== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2153942== Command: ./resizearray
==2153942== 
Enter a number: 3.14
Do you want to supply another number? Enter 1 for yes, 0 for no: 1
Enter a number: -7.5
Do you want to supply another number? Enter 1 for yes, 0 for no: 1
Enter a number: 9.81
Do you want to supply another number? Enter 1 for yes, 0 for no: 0
==2153942== 
==2153942== HEAP SUMMARY:
==2153942==     in use at exit: 0 bytes in 0 blocks
==2153942==   total heap usage: 5 allocs, 5 frees, 2,072 bytes allocated
==2153942== 
==2153942== All heap blocks were freed -- no leaks are possible
==2153942== 
==2153942== For lists of detected and suppressed errors, rerun with: -s
==2153942== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>(Creating resizable arrays is perhaps one of the most fundamental use cases of dynamic memory. As an exercise, I encourage you to try reimplementing the above program using just the stack. Regardless of how you go about doing it, you'll run into some fundamental issue or another. Mainly, if <Code>new_array</Code> were an automatic / stack-allocated array, then it'd be automatically freed at the end of each loop iteration, causing <Code>list</Code> to become a dangling pointer and invoking use-after-free errors in the subsequent iteration. Using the heap allows us to control exactly when memory gets allocated and freed, avoiding that issue.)</P>

      <P>Now, there's a lot of steps involved in expanding our dynamic array in the above program. Luckily, the C standard library offers another function that does all of these steps for us in one fell swoop: <Code>realloc</Code>. The <Code>realloc</Code> function, which stands for "reallocate" and is provided by <Code>stdlib.h</Code>, accepts two arguments: 1) a pointer to the base address of the block of dyanmic memory that you want to resize (expand or shrink), and 2) the new size that you want it to have post-resizing. In general, it does the following: it creates a new block of dynamic memory of the size specified in the second argument; it copies the first N bytes over from the old block to the new block (where N is the smaller of the two blocks' sizes); it frees the old block; and finally it returns the base address of the new block (or <Code>NULL</Code> if it failed to allocate the new block). As a special case, you can pass a <Code>NULL</Code> pointer as the first argument, in which case it does the same thing as <Code>malloc(size)</Code>, where <Code>size</Code> is the second argument passed to <Code>realloc</Code>.</P>

      <P>Knowing that, we can rewrite the above program like so:</P>

      <CBlock fileName="resizearray.c" highlightLines="{24-43}">{
`#include <stdlib.h>
#include <string.h> // For memcpy
#include <stdio.h>

int main() {
        // First, we create a pointer to store the base address of the
        // dynamic array. We'll modify this pointer as the program goes
        // on. For now, it'll be NULL, indicating that no array
        // exists yet.
        float* list = NULL;

        // We'll also have to keep track of its size, which will change
        // throughout the program.
        size_t list_size = 0;

        // Now, we ask the user for numbers, one at a time, until
        // they choose to stop, adding each number to the array.
        int keep_going = 1;
        do {
                printf("Enter a number: ");
                float new_number;
                scanf("%f", &new_number);

                // Expand the array. This single statement consolidates
                // steps 1, 2, 3, and part of step 5 from the previous
                // implementation. It also means we don't need the
                // new_array pointer anymore; we can just reuse list
                list = realloc(
                        list,
                        sizeof(float) * (list_size + 1)
                );
                if (!list) {
                    printf("Error on realloc()\\n");
                    exit(1);
                }

                // The new array (which list now points to) has an
                // extra slot at the end of it, currently uninitialized.
                // Initialize it to the new value entered by the user
                list[list_size] = new_number;

                // Increment the size variable
                ++list_size;

                // Done. Now just ask the user if they want to supply
                // another number.
                printf("Do you want to supply another number? Enter "
                        "1 for yes, 0 for no: ");
                scanf("%d", &keep_going);
        } while(keep_going);

        // Program is all done. Free the final array, which list
        // currently points to.
        free(list);
}
`
      }</CBlock>

      <P>This program does the same thing as before, but the resizing logic is much simpler since <Code>realloc</Code> is doing most of the heavy lifting.</P>

      <P>So, I've explained what <Code>realloc</Code> does in the <It>general case</It>, but in some cases, it actually behaves a bit differently: when possible, <Code>realloc</Code> will actually avoid creating a new block of dynamic memory altogether. Particularly, the <Code>realloc</Code> function looks into the heap to see if there's some unallocated bytes of memory next to the existing block (the block whose base address is provided by the first argument). If there <It>is</It> some empty space there, and it's sufficiently large, <Code>realloc</Code> will simply expand the allocated block into that empty space (and return the same base address that was passed into it). This avoids allocating an entirely separate block of memory, copying bytes of data over, <It>and</It> freeing the original block. That is, it avoids the "move" operation. Moving blocks of memory around can be expensive, especially if those blocks are large, so this can yield big performance gains. Of course, <Code>realloc</Code> can only <It>sometimes</It> do this. If there isn't enough available space to simply expand the existing block, then it does, indeed, move the block elsewhere (i.e., allocate a new block, copy the bytes over, and free the original block).</P>

      <SectionHeading id="returning-pointers-to-dynamic-memory">Returning pointers to dynamic memory</SectionHeading>

      <P>Another thing that I should point out, though it might be obvious, is that it's perfectly valid for a function to return the base address of a block of dynamic memory that was allocated within said function. <Link href={`${PARENT_PATH}/${allPathData["pointers"].pathName}#undefined-behavior-with-pointers`}>As we've discussed</Link>, it's <Ul>not</Ul> okay to do this on the stack. This is because local variables allocated on the stack are freed when the scope / function ends, causing the returned address to become a dangling pointer. In contrast, heap-allocated memory will happily outlive the scope in which it was allocated<Emdash/>it survives until you free it via the <Code>free</Code> function.</P>

      <P>For example, you can write a function that allocates a dynamic array, populates it with a bunch of values, and returns its base address for subsequent access at the call site:</P>

      <CBlock fileName="returnarray.c">{
`#include<stdlib.h>

// If it fails to allocate an array via malloc(), it returns NULL
double* create_array_of_zeroes(size_t size) {
        double* array = malloc(sizeof(double) * size);
        if (!array) {
                return NULL;
        }
        for (int i = 0; i < size; ++i) {
                array[i] = 0.0;
        }
        return array;
}

int main() {
        // Creates an array of 100 doubles, each initialized to 0.0,
        // storing its base address in the 'array' pointer.
        double* array = create_array_of_zeroes(100);
        if (!array) {
                printf("Error! Failed to allocate array on the heap!\\n");
                exit(1);
        }

        // ...

        // Don't forget to free it when you're done with it!
        free(array);
}`
      }</CBlock>

      <P>In the past, I've said that you generally can't return arrays from functions. The above program demonstrates a sort of exception to this rule. Although we can't return arrays, we <It>can</It> return base addresses of arrays, so long as those arrays aren't freed when the function returns. Dynamic arrays aren't freed until you call the <Code>free</Code> function, so they satisfy this requirement.</P>

      <SectionHeading id="calloc"><Code>calloc</Code></SectionHeading>

      <P>In addition to <Code>malloc</Code> and <Code>realloc</Code>, there's a third low-level dynamic memory allocation function provided by <Code>stdlib.h</Code>: <Code>calloc</Code>. The <Code>calloc</Code> function is similar to <Code>malloc</Code>, except it automatically initializes all the bytes of allocated memory to a bunch of zeroes. This is useful for the same reasons that zero-initialization of automatic arrays is useful (e.g., <Code>{'char my_str[100] = {\'\\0\'};'}</Code>).</P>

      <P><Code>calloc</Code> also has a slightly different interface to <Code>malloc</Code>: it operates in terms of array element sizes and counts instead of raw byte counts. It takes two arguments: 1) the number of array elements to be stored in the newly allocated dynamic array, and 2) the size of a <Ul>single element</Ul> in that array. It then attempts to allocate a contiguous block of dynamic memory whose size (in bytes) is the product of those two values, initializes all of its bytes to zero, and returns its base address as a <Code>void*</Code>. If it fails to find a sufficiently large contiguous unallocated block, it returns <Code>NULL</Code>.</P>

      <P>For example:</P>

      <CBlock showLineNumbers={false}>{
`// Allocate a dynamic array of one million integers, initializing
// all of the bytes to zero
int* array = calloc(1000000, sizeof(int));
if (!array) {
    printf("Error on calloc()\\n");
    exit(1); // Or handle accordingly
}
`
      }</CBlock>

      <P>Importantly, <Code>calloc</Code> only initializes the <Ul>bytes</Ul> to zero, which is not necessarily the same thing as initializing the <Ul>values</Ul> of the array elements to 0. Well, for <Code>int</Code> values, these two ideas actually <It>are</It> the same. But for other numeric types, that might not be the case. For example, on some niche systems, it's possible that the <Code>float</Code> value <Code>0.0f</Code> isn't <It>actually</It> represented by a bitstring comprised entirely of zeroes. On such systems, a bitstring comprised entirely of zeroes might represent some other nonzero value when interpreted as a <Code>float</Code>. If <Code>calloc</Code> were to be used to create an array of <Code>float</Code> values on that system, the elements would all be initialized to that nonzero value, whatever it is.</P>

      <SectionHeading id="common-dynamic-memory-mistakes">Common mistakes with dynamic memory</SectionHeading>

      <P>There are many opportunities to make mistakes when working with dynamic memory.</P>

      <P>For one, you might forget to free it. That's a memory leak. We've already discussed that.</P>

      <P>Another mistake is a double-free. This is where you accidentally call the <Code>free</Code> function two or more times on the same address. This invokes undefined behavior. Double-frees most often occur when the programmer creates a copy of a pointer but forgets that it points to the same dynamic memory as another pointer. They might then proceed to call the <Code>free</Code> function on <It>both</It> of those pointers, resulting in a double-free:</P>

      <CBlock fileName="doublefree.c">{
`#include <stdlib.h>

int main() {
        double* array = malloc(sizeof(double) * 100);
        if (!array) {
                printf("Error on malloc()\\n");
                exit(1);
        }

        // Copies the POINTER array into the POINTER array2. This does
        // NOT copy the underlying array. We now have two pointers that
        // point to the same block of dynamic memory.
        double* array2 = array;

        // Free the block of dynamic memory
        free(array);

        // This would then attempt to free that same block of dynamic
        // memory AGAIN:
        free(array2); // Undefined behavior!

        // It's your responsibility to know when two pointers point to
        // the same dynamic memory! If they do, only call free() on one
        // of them.
}
`
      }</CBlock>

      <P>Here's the Valgrind output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o doublefree doublefree.c 
$ valgrind ./doublefree 
==2133524== Memcheck, a memory error detector
==2133524== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2133524== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2133524== Command: ./doublefree
==2133524== 
==2133524== Invalid free() / delete / delete[] / realloc()
==2133524==    at 0x4849B4C: free (vg_replace_malloc.c:989)
==2133524==    by 0x40116B: main (doublefree.c:16)
==2133524==  Address 0x4a84040 is 0 bytes inside a block of size 800 free'd
==2133524==    at 0x4849B4C: free (vg_replace_malloc.c:989)
==2133524==    by 0x40115F: main (doublefree.c:12)
==2133524==  Block was alloc'd at
==2133524==    at 0x484682F: malloc (vg_replace_malloc.c:446)
==2133524==    by 0x401147: main (doublefree.c:4)
==2133524== 
==2133524== 
==2133524== HEAP SUMMARY:
==2133524==     in use at exit: 0 bytes in 0 blocks
==2133524==   total heap usage: 1 allocs, 2 frees, 800 bytes allocated
==2133524== 
==2133524== All heap blocks were freed -- no leaks are possible
==2133524== 
==2133524== For lists of detected and suppressed errors, rerun with: -s
==2133524== ERROR SUMMARY: 1 errors from 1 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Notice: Valgrind is warning us of our mistake. The first error message says "Invalid free". If you read the message carefully, you'll notice that it even tells us that this memory was previously free'd (though it won't always be able to recognize this). This is a strong indicator of a double-free.</P>

      <P>Another issue has to do with dangling pointers and use-after-free errors. Recall: a dangling pointer is a pointer that points to old, deleted data. On the stack, this might happen if you return the address of a local variable from a function and store that address somewhere at the call site. But on the heap, a dangling pointer is created <Ul>whenever you call the <Code>free</Code> function</Ul>. After all, the <Code>free</Code> function simply frees the block of dynamic memory at the specified address. The given pointer will continue storing that address, though, making it a dangling pointer by definition. Dangling pointers are fine unless you dereference them. As we've discussed in a past lecture, this is known as a use-after-free error, at it invokes undefined behavior.</P>

      <P>That's to say: once you call <Code>free</Code> on a pointer, do <Ul>not</Ul> proceed to dereference that pointer. It's a dangling pointer until you reassign it to store a new (valid) address.</P>

      <CBlock fileName="useafterfree.c">{
`#include <stdlib.h>

int main() {
        // Allocate dynamic array of 5 booleans
        _Bool* array = malloc(sizeof(_Bool) * 5);
        if (!array) {
            printf("Error on malloc()\\n");
            exit(1);
        }

        // Free the dynamic array
        free(array);

        // Access the second element in the dynamic array (dereferences
        // the address of the second element, which no longer exists)
        array[1] = 0; // Use-after-free. Undefined behavior!
}
`
      }</CBlock>

      <P>Here's the Valgrind output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o useafterfree useafterfree.c 
$ valgrind ./useafterfree 
==2139738== Memcheck, a memory error detector
==2139738== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2139738== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2139738== Command: ./useafterfree
==2139738== 
==2139738== Invalid write of size 1
==2139738==    at 0x401160: main (useafterfree.c:12)
==2139738==  Address 0x4a84041 is 1 bytes inside a block of size 5 free'd
==2139738==    at 0x4849B4C: free (vg_replace_malloc.c:989)
==2139738==    by 0x401157: main (useafterfree.c:8)
==2139738==  Block was alloc'd at
==2139738==    at 0x484682F: malloc (vg_replace_malloc.c:446)
==2139738==    by 0x401147: main (useafterfree.c:5)
==2139738== 
==2139738== 
==2139738== HEAP SUMMARY:
==2139738==     in use at exit: 0 bytes in 0 blocks
==2139738==   total heap usage: 1 allocs, 1 frees, 5 bytes allocated
==2139738== 
==2139738== All heap blocks were freed -- no leaks are possible
==2139738== 
==2139738== For lists of detected and suppressed errors, rerun with: -s
==2139738== ERROR SUMMARY: 1 errors from 1 contexts (suppressed: 0 from 0)`
      }</TerminalBlock>

      <P>Similar to double-free errors, use-after-free errors are especially common when you start copying pointers around. It's easy to forget that two pointers point to the same place. If you free the memory at that place, both pointers will simultaneously become dangling pointers, and dereferencing either of them will invoke a use-after-free error:</P>

      <CBlock fileName="useafterfree.c">{
`#include <stdlib.h>

int main() {
        // Allocate dynamic array of 5 booleans
        _Bool* array = malloc(sizeof(_Bool) * 5);
        if (!array) {
            printf("Error on malloc()\\n");
            exit(1);
        }
        _Bool* array2 = array; // Copy of address stored in array

        // Free the dynamic array
        free(array);

        // array and array2 are BOTH dangling pointers. They both point
        // to an array that has since been deleted.

        // Access the second element in the dynamic array (dereferences
        // the address of the second element, which no longer exists)
        array2[1] = 0; // Use-after-free. Undefined behavior!
}
`
      }</CBlock>

      <P>The Valgrind output is essentially the same as before.</P>

      <P>Clearly, dealing with dynamic memory can be quite difficult. You'll find this to be especially true when writing large, complicated programs that allocate tons of dynamic memory at various times for various purposes. This is one reason why memory debugging tools like Valgrind are so important: to help you catch your dynamic memory mistakes.</P>

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
