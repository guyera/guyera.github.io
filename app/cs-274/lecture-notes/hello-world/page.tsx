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
        <Item><Link href="#development-environment">Development environment</Link></Item>
        <Item><Link href="#hello-world">Hello, World!</Link></Item>
        <Item><Link href="#translation">Translation</Link></Item>
        <Item><Link href="#building-a-c-program">Building a C program</Link></Item>
        <Item><Link href="#executing-a-c-program">Executing a C program</Link></Item>
        <Item><Link href="#valgrind">Valgrind</Link></Item>
        <Item><Link href="#executable-file-permissions">Executable file permissions</Link></Item>
        <Item><Link href="#compiler-errors">Compiler errors</Link></Item>
      </Itemize>

      <SectionHeading id="development-environment">Development environment</SectionHeading>

      <P>Before you can write C programs, you'll need some sort of development environment in which to write them. In all my demonstrations, I'm going to use a very simple environment that will work for everyone in this class: I'm going to be writing all my code using Vim in a terminal, inside an SSH session connected to OSU's public-facing ENGR (flip) servers. Most of your are probably already familiar with this environment. If you aren't, Lab 1 will get you up to speed.</P>

      <P>There are many advantages to this development environment:</P>

      <Itemize>
        <Item>Consistency. Everyone with an ENGR account can connect to the ENGR servers over SSH. From there, everyone will be working with the same environment<Emdash/>the same operating system, the same compiler version, the same C standard library implementation, the same dynamic analysis tooling, and so on.</Item>
        <Item>Practice with terminals and shells. These are critical tools to any software engineer / programmer, so you should become an expert in using them. Doing all your development in a terminal will give you lots of valuable experience.</Item>
        <Item>Configurability. Vim is extremely configurable (e.g., via macros). Shells are also extremely configurable (e.g., via aliases, environment variables, user-local shell scripts, and so on).</Item>

        <Item>Development efficiency. Vim's text-processing capabilities are unparallelled if you know how to use it effectively.</Item>
      </Itemize>

      <P>While you don't have to use Vim for all your assignments and labs, terminal and shells are a critical part of this course's content, so you will be assessed on your ability to use them throughout the term.</P>

      <SectionHeading id="hello-world">Hello, World!</SectionHeading>

      <P>This course is meant to teach you the C programming language. What better way to start than with a "Hello, World!" program?</P>

      <P>Below is a typical "Hello, World!" program written in C (save one minor change that we'll make in a moment).</P>

      <CBlock fileName="hello.c">{
`#include <stdio.h>

int main() {
        printf("Hello, World!");
        return 0;
}
`
      }</CBlock>

      <P>Notice the filename: <Code>hello.c</Code>. The <Code>.c</Code> file extension indicates that this is a C source code file.</P>

      <P>We won't discuss how it works in this lecture. That's for a future lecture. For now, our goal is just to get it built and running.</P>

      <SectionHeading id="translation">Translation</SectionHeading>

      <P>Many students struggle to understand how computers interact with programming languages, so let me try to bring some clarity here. A given CPU (the "heart" of a computer) can only possibly understand a single language: its respective <Bold>machine code</Bold> language. Machine code is a very primitive sort of language that's expressed entirely in terms of the given CPU architecture's <Bold>instruction set</Bold>. An instruction set, in turn, is the set of low-level operations that the given CPU can understand. These operations are typically expressed in the form of opcodes (identifying numeric operation values) and operands.</P>

      <P>It's technically possible to write a program directly in a given CPU's machine code language (and, once upon a time, people had no other choice). Such programs are immediately understandable to the given CPU. However, there are several large problems with this strategy. For one, machine code is incredibly difficult for a person to understand. Writing an extremely large program in machine code would be unnecessarily difficult. Second, machine code is not <Bold>portable</Bold>. That's to say, a program written in one CPU's machine code may not be intrepretable to another CPU (particularly if the two CPUs have different architectures or are configured differently by their operating systems), so such programs would have to be written many times<Emdash/>once for each target platform.</P>

      <P>So instead, we write programs in "higher-level" programming languages like C. These languages offer <Bold>abstractions</Bold> over the underlying CPU architectures' instruction set(s). That is, when you're writing a C program, you don't have to think about CPU architectures or opcodes. Those details are abstracted away by the language.</P>

      <P>But as I said, a computer can only understand its machine code language; it can't understand programs written in C, or Python, or any other "high-level" language. So before a C program can be executed by a particular computer, it must be converted, or <Bold>translated</Bold>, into the respective computer's machine code language. Yes, "translation" means the same thing here as it does in natural language: to convert something written in one language to another language. But in this case, we're talking about programming languages<Emdash/>converting a program written in C into a program written in the target computer's machine code language.</P>

      <P>Of course, machine code is difficult for a person to understand, so program translation is typically done automatically by another computer program. Such programs are known as <Bold>translators</Bold>. For example, a translator might convert a C program into machine code. There are two primary kinds of translators:</P>

      <Itemize>
        <Item><Bold>Compilers</Bold>. These convert programs from one language to another <Ul>up front</Ul>. In other words, they perform the entire translation process all in one fell swoop. Assuming the target language is machine code, then after the compilation process is complete, the compiled machine code can be executed directly on the target platform.</Item>
        <Item><Bold>Interpreters</Bold>. These interpret (translate) programs <Ul>on the fly</Ul>, at runtime, sometimes one line / statement at a time.</Item>
      </Itemize>

      <P>The crucial difference is when the translation happens. Compilers translate programs before they're executed (before runtime). Interpreters translate (interpret) programs <It>as</It> they're being executed (at runtime).</P>

      <P>(There are also many compiler/interpreter hybrids. Take CPython for example. It's the standard Python implementation. It compiles Python code into an intermediary bytecode, which is easier for the interpreter to understand, and then it interprets that bytecode on the fly at runtime. Most Java implementations work in a similar manner.)</P>
      
        <SectionHeading id="building-a-c-program">Building a C program</SectionHeading>

      <P>So, we've written our "Hello, World!" program, but in order to execute it, we must translate it, or convert it, into our computer's machine code language. We can do this at runtime using an interpreter, or we can do it before runtime using a compiler.</P>

      <P>While there do exist some C interpreters, they're not very mainstream. One of C's main objectives is to support the development of high-performance applications. Translation is expensive, and interpreters bear that cost at runtime, which slows down the program. Compilers bear that cost up front, before runtime, which tends to produce faster programs. So, in line with C's objectives, C programs are almost always compiled rather than interpreted.</P>

      <P>There are various build tools that are capable of compiling C programs into machine code executables. We'll be using the GNU Compiler Collection's (GCC) build tool, <Code>gcc</Code>. It's installed on the ENGR servers, so if you're working in an SSH session onthe servers, it'll be available to you out of the box. It's also typically available on MacOS systems. If you're on Windows and want a local installation, you might look into <Link href="https://sourceforge.net/projects/mingw/">MinGW</Link>.</P>

      <P><Code>gcc</Code> has lots of neat options, but we'll be using it in a very limited capacity. To compile our <Code>hello.c</Code> program, execute the following shell command:</P>

      <ShellBlock>{
`gcc -g -o hello-world hello.c`
      }</ShellBlock>

      <P>Let's break this down:</P>

      <Itemize>
        <Item><Code>gcc</Code> is the shell command that invokes the GCC build tool to compile a C program into a machine code executable.</Item>
        <Item>The <Code>-g</Code> flag tells <Code>gcc</Code> to insert debugging symbols into the compiled machine code. These symbols can be used by static and dynamic analysis tools (e.g., debuggers like Valgrind). You should omit this flag when building a C program for a production environment, but you should usually include it whenever you're developing and / or debugging a C program.</Item>
        <Item><Code>-o hello-world</Code> specifies the name of the executable file that we want to create. <Code>gcc</Code> is a C compiler, so it compiles C programs into machine code programs. C programs are written in the form of C source code files (e.g., <Code>hello.c</Code>), but machine code programs, too, are stored in files. <Code>gcc</Code> needs to know what name to give the file that will contain the machine code version of our program. <Code>-o hello-world</Code> tells <Code>gcc</Code> to name that file <Code>hello-world</Code>. Notice that it has no extension. This is common; executable files often do not have an extension.</Item>

        <P>Note: If you leave out the <Code>-o hello-world</Code>, then it will automatically name the executable <Code>a.out</Code> by default (or <Code>a.exe</Code> on Windows).</P>

        <Item><Code>hello.c</Code> is the name of the C source code file containing the C program that we're trying to build / translate into machine code. If our program was spread across multiple C source code files, we would simply list all of them here, separated by spaces.</Item>
      </Itemize>

      <P>Here's what it might look like when you execute the above shell command:</P>

      <TerminalBlock copyable={false}>{
`$ ls
hello.c
$ gcc -g -o hello-world hello.c 
$ ls
hello.c  hello-world
`
      }</TerminalBlock>

      <P>(Ignore the dollar signs. They're simply my terminal prompt. That is, my shell automatically displays them at the beginning of every shell command.)</P>

      <P>I also executed <Code>ls</Code> a couple times to illustrate what's going on. Initially, my working directory only contains the file <Code>hello.c</Code>. But after running the build command, it contains an additional file named <Code>hello-world</Code>. To be clear, <Code>hello.c</Code> and <Code>hello-world</Code> contain the exact same program, but expressed in two different languages. <Code>hello.c</Code> is our program expressed in the C programming language, whereas <Code>hello-world</Code> is our program expressed in the ENGR servers' machine code language.</P>

      <P>In your terminal, <Code>ls</Code> may display <Code>hello-world</Code> in green text. This indicates that it's an executable file (more on <Link href="#executable-file-permissions">executable file permissions</Link> in a bit). In other words, it's 1) expressed in terms of the computer's machine code language, and 2) contains the necessary metadata and other information for the operating system's program loader to be able to load it and execute it (e.g., as in <Link href="https://en.wikipedia.org/wiki/Executable_and_Linkable_Format">ELF</Link>, in the case of *nix systems).</P>

      <P>Before we move on, I need to point out an extremely common and also extremely detrimental mistake. Suppose that, when writing my shell command, I accidentaly write it like so:</P>

      <ShellBlock>{
`gcc -g -o hello.c hello-world`
      }</ShellBlock>

      <P>Notice: I accidentally switched the placement of <Code>hello.c</Code> and <Code>hello-world</Code>. It's a seemingly small mistake, but it can have disastrous consequences: in some cases, it can overwrite your source code file (<Code>hello.c</Code>) with machine code. <Ul>Do not do this</Ul>. It's a very fast way to lose a whole lot of progress on an assignment.</P>

      <P>(If you ever accidentally do this, there are ways of recovering some of your work. If you frequently commit and push to GitHub, then you can recover it via Git. Otherwise, you <It>may</It> be able to partially recover it using the ENGR servers' snapshots. But really, just do yourself a favor and be really careful to avoid making this mistake altogether.)</P>

      <SectionHeading id="executing-a-c-program">Executing a C program</SectionHeading>

      <P>Executable programs (programs written in machine code) are stored as files, just like non-executable (source code) files. In our case, <Code>hello-world</Code> is a file containing an executable program. We sometimes refer to such files colloquially as <Bold>executables</Bold> (e.g., <Code>hello-world</Code> is an executable).</P>

      <P>Executables can be executed just like any other shell command. Simply type out the path to the executable and press enter. If the executable resides in your working directory (and it often does), then you may need to prefix the name of the executable with <Code>./</Code>. This explicitly tells the shell that you're trying to execute a file within your working directory rather than in some central system directory.</P>

      <P>For example, we can execute <Code>hello-world</Code> like so (assuming it's contained in our working directory):</P>

      <TerminalBlock copyable={false}>{
`$ ./hello-world
Hello, World!$
`
      }</TerminalBlock>

      <P>And it does as programmed: it prints the text "Hello, World!" to the terminal. However, there's one small issue: after printing the exclamation point, the program immediately ends and displays the next terminal prompt (a dollar sign). Typically, you'd want the program to put a new line between the exclamation point and the next dollar sign (as if simulating pressing the enter key after printing the exclamation point). To accomplish this, we'll need to update our program's source code like so:</P>

      <CBlock fileName="hello.c">{
`#include <stdio.h>

int main() {
        printf("Hello, World!\\n");
        return 0;
}
`
      }</CBlock>

      <P>Notice the addition of <Code>\n</Code> at the end of the print statement. <Code>\n</Code> is an escape sequence for a newline character sequence. In other words, by printing a <Code>\n</Code> sequence, we're telling the program to simulate pressing the enter key after printing the exclamation point. This pushes the subsequent terminal prompt down to its own line in the terminal.</P>

      <P>And yet, if I simply try to re-run the program again, the problem doesn't appear to be solved:</P>

      <TerminalBlock copyable={false}>{
`$ ./hello-world 
Hello, World!$ 
`
      }</TerminalBlock>

      <P>There's a simple reason for this: we updated <Code>hello.c</Code>, but we forgot to update the executable file, <Code>hello-world</Code>. These are two completely separate files; updating the former does not update the latter. To update <Code>hello-world</Code>, we simply have to rebuild from scratch using the same shell command that we did earlier:</P>

      <ShellBlock>{
`$ gcc -g -o hello-world hello.c 
`
      }</ShellBlock>

      <P>You must recompile your program every time you make any changes to any of its source code files, or else the executable will be outdated and unreflective of your recent changes.</P>

      <P>Now, running our program produces the following output:</P>

      <TerminalBlock copyable={false}>{
`$ ./hello-world 
Hello, World!
$
`
      }</TerminalBlock>

      <P>(Again, the dollar signs are just my terminal prompts. The dollar sign at the bottom of the output simply means that when I type my next shell command, it will be immediately to the right of that dollar sign.)</P>

      <SectionHeading id="valgrind">Valgrind</SectionHeading>

      {/*TODO*/}

      <P>Although you <It>can</It> execute programs by simply writing out their name (prefixed with <Code>./</Code> if they're in your working directory) and pressing enter, when developing and debugging a C program, you should almost always execute it through a debugger. The ENGR servers have a debugging tool suite known as Valgrind. It's already installed and available for use. (If you're develooping locally, you'll likely have to use an alternative debugger; most C IDEs have C debugging tools built into them).</P>

      <P>We'll talk more about Valgrind later. But for now, I just want you to know: in this course, you should basically always run all of your programs through Valgrind (or another debugger). Really, there's absolutely no reason <It>not</It> to use Valgrind (or another debugger) in this course, and it's vital for catching and diagnosing lots of sneaky bugs (e.g., memory errors). To run an executable through Valgrind, simply type <Code>valgrind </Code> before the path to the executable. For example:</P>

      <ShellBlock>{
`valgrind ./hello-world`
      }</ShellBlock>

      <P>Valgrind will print a bunch of additional information about the program as it runs. Just before running the program, it prints a header containing some information about Valgrind and the command that it's executing. As the program runs, if Valgrind detects any errors (e.g., certain kinds of memory management errors), it will print diagnostic information about them, including a stack trace pointing to the line of C source code in which the error occurred. Finally, after the program terminates, Valgrind prints some summary information about the final state of the process, including a heap summary that's vital for detecting memory leaks (more on this in a future lecture).</P>

      <P>Here's what it looks like when we run <Code>hello-world</Code> through Valgrind:</P>

      <TerminalBlock copyable={false}>{
`$ valgrind ./hello-world 
==1706140== Memcheck, a memory error detector
==1706140== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1706140== Using Valgrind-3.24.0 and LibVEX; rerun with -h for copyright info
==1706140== Command: ./hello-world
==1706140== 
Hello, World!
==1706140== 
==1706140== HEAP SUMMARY:
==1706140==     in use at exit: 0 bytes in 0 blocks
==1706140==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==1706140== 
==1706140== All heap blocks were freed -- no leaks are possible
==1706140== 
==1706140== For lists of detected and suppressed errors, rerun with: -s
==1706140== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Notice: the program's output, "Hello, World!", is sandwiched between Valgrind's debugging messages.</P>

      <SectionHeading id="executable-file-permissions">Executable file permissions</SectionHeading>

      {/*TODO*/}

      <SectionHeading id="compiler-errors">Compiler errors</SectionHeading>

      {/*TODO*/}
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
