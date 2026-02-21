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

      <P>While you don't have to use Vim for all your assignments and labs, terminals and shells are a critical part of this course's content, so you will be assessed on your ability to use them throughout the term.</P>

      <SectionHeading id="hello-world">Hello, World!</SectionHeading>

      <P>This course is meant to teach you the C programming language. What better way to start than with a "Hello, World!" program?</P>

      <P>Below is a typical "Hello, World!" program written in C (save one minor change that we'll make in a moment).</P>

      <CBlock fileName="hello.c">{
`#include <stdio.h>

int main(void) {
        printf("Hello, World!");
        return 0;
}
`
      }</CBlock>

      <P>Notice the filename: <Code>hello.c</Code>. The <Code>.c</Code> file extension indicates that this is a C source code file.</P>

      <P>We won't discuss how it works in this lecture. That's for a future lecture. For now, our goal is just to get it built and running.</P>

      <SectionHeading id="translation">Translation</SectionHeading>

      <P>Many students struggle to understand how computers interact with programming languages, so let me try to bring some clarity here. A given CPU (the "brain" of a computer) can only possibly understand a single language: its respective <Bold>machine code</Bold> language. Machine code is a very primitive sort of language that's expressed entirely in terms of the given CPU architecture's <Bold>instruction set</Bold>. An instruction set, in turn, is the set of low-level operations that the CPUs of the given architecture can understand. These operations are typically expressed in the form of opcodes (identifying numeric operation values) and operands.</P>

      <P>It's technically possible to write a program directly in a given CPU's machine code language (and, once upon a time, people had no other choice). Such programs are immediately understandable to the given CPU. However, there are several large problems with this strategy. For one, machine code is incredibly difficult for a person to understand. Writing an extremely large program in machine code would be unnecessarily difficult. Second, machine code is not <Bold>portable</Bold>. That's to say, a program written in one CPU's machine code language may not be intrepretable to another CPU (particularly if the two CPUs have different architectures or are configured differently by their operating systems), so such programs would have to be written many times<Emdash/>once for each target platform.</P>

      <P>So instead, we write programs in "higher-level" programming languages like C. These languages offer <Bold>abstractions</Bold> over the underlying CPU architectures' instruction set(s). That is, when you're writing a C program, you don't have to think about CPU architectures or opcodes. Those details are abstracted away by the language.</P>

      <P>But as I said, a computer can only understand its machine code language; it can't understand programs written in C, or Python, or any other "high-level" language. So before a C program can be executed by a particular computer, it must be converted, or <Bold>translated</Bold>, into the respective computer's machine code language. Yes, "translation" means the same thing here as it does in natural language: to convert something written in one language to another language. But in this case, we're talking about programming languages<Emdash/>converting a program written in C into a program written in the target computer's machine code language.</P>

      <P>Of course, machine code is difficult for a person to understand, so program translation is typically done automatically by another computer program. Such programs are known as <Bold>translators</Bold>. For example, a translator might convert a C program into one of many machine code languages (depending on the target platform). There are two primary kinds of translators:</P>

      <Itemize>
        <Item><Bold>Compilers</Bold>. These convert programs from one language to another <Ul>up front</Ul>. In other words, they perform the entire translation process all in one fell swoop. Assuming the target language is machine code, then after the compilation process is complete, the compiled machine code can be executed directly on the target platform.</Item>
        <Item><Bold>Interpreters</Bold>. These interpret (translate) programs <Ul>on the fly</Ul>, at runtime, sometimes one line / statement at a time.</Item>
      </Itemize>

      <P>The crucial difference is when the translation happens. Compilers translate programs before they're executed (before runtime). Interpreters translate (interpret) programs <It>as</It> they're being executed (at runtime).</P>

      <P>(There are also many compiler/interpreter hybrids. Take CPython for example. It's the standard Python implementation. It compiles Python code into an intermediary bytecode, which is easier for the interpreter to parse, and then it interprets that bytecode on the fly at runtime. Most Java implementations work in a similar manner.)</P>
      
        <SectionHeading id="building-a-c-program">Building a C program</SectionHeading>

      <P>So, we've written our "Hello, World!" program, but in order to execute it, we must translate it, or convert it, into our computer's machine code language. We can do this at runtime using an interpreter, or we can do it before runtime using a compiler.</P>

      <P>While there do exist some C interpreters, they're not very mainstream. One of C's main objectives is to support the development of high-performance applications. Translation is expensive, and interpreters bear that cost at runtime, which slows down the program. Compilers bear that cost up front, before runtime, which tends to produce faster programs. So, in line with C's objectives, C programs are almost always compiled rather than interpreted.</P>

      <P>There are various build tools that are capable of compiling C programs into machine code executables. We'll be using the GNU Compiler Collection's (GCC) build tool, <Code>gcc</Code>. It's installed on the ENGR servers, so if you're working in an SSH session on the servers, it'll be available to you out of the box. It's also typically available on MacOS systems. If you're on Windows and want a local installation, you might look into <Link href="https://sourceforge.net/projects/mingw/">MinGW</Link>.</P>

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

      <P>I also executed <Code>ls</Code> a couple times to illustrate what's going on. Initially, my working directory only contains the file <Code>hello.c</Code>. But after running the build command, it contains an additional file named <Code>hello-world</Code>. To be clear, <Code>hello.c</Code> and <Code>hello-world</Code> contain the exact same program, but expressed in two different languages. <Code>hello.c</Code> is our program expressed in the C programming language (as shown previously), whereas <Code>hello-world</Code> is our program expressed in the ENGR servers' machine code language (as generated by <Code>gcc</Code> by compiling <Code>hello.c</Code>).</P>

      <P>In your terminal, <Code>ls</Code> may display <Code>hello-world</Code> in green text. This indicates that it's an executable file (more on <Link href="#executable-file-permissions">executable file permissions</Link> in a bit). In other words, it's 1) expressed in terms of the computer's machine code language, and 2) contains the necessary metadata and other information for the operating system's program loader to be able to load it and execute it (e.g., as in <Link href="https://en.wikipedia.org/wiki/Executable_and_Linkable_Format">ELF</Link>, in the case of *nix systems).</P>

      <P>(Technically, some executable files that are run through interpreters, like shell scripts, don't need to be written in the computer's machine code language).</P>

      <P>Before we move on, I need to point out an extremely common and also extremely detrimental mistake. Suppose that, when writing my shell command, I accidentaly write it like so:</P>

      <ShellBlock copyable={false}>{
`gcc -g -o hello.c hello-world`
      }</ShellBlock>

      <P>Notice: I accidentally switched the placement of <Code>hello.c</Code> and <Code>hello-world</Code>. It's a seemingly small mistake, but it can have disastrous consequences: in some cases, it can overwrite your source code file (<Code>hello.c</Code>) with machine code. <Ul>Do not do this</Ul>. It's a very fast way to lose a whole lot of progress on an assignment.</P>

      <P>(If you ever accidentally do this, there are ways of recovering some of your work, but they're not entirely reliable, and you'll almost always lose at least some progress. If you frequently commit and push to GitHub, then you can recover the most recently pushed commit via Git. Otherwise, you <It>may</It> be able to partially recover your lost work using the ENGR servers' snapshots. But really, just do yourself a favor and be really careful to avoid making this mistake altogether.)</P>

      <SectionHeading id="executing-a-c-program">Executing a C program</SectionHeading>

      <P>Executable programs (programs written in machine code) are stored as files, just like non-executable (source code) files. In our case, <Code>hello-world</Code> is a file containing an executable program. We sometimes refer to such files colloquially as <Bold>executables</Bold> (e.g., <Code>hello-world</Code> is an executable).</P>

      <P>Executables can be executed just like any other shell command. Simply type out the path to the executable and press enter. If the executable resides in your working directory (and it often does), then you may need to prefix the name of the executable with <Code>./</Code>. This explicitly tells the shell that you're trying to execute a file within your working directory rather than in some central system directory (e.g., within the system path).</P>

      <P>For example, we can execute <Code>hello-world</Code> like so (assuming it's contained in our working directory):</P>

      <TerminalBlock copyable={false}>{
`$ ./hello-world
Hello, World!$
`
      }</TerminalBlock>

      <P>And it does as programmed: it prints the text "Hello, World!" to the terminal. However, there's one small issue: after printing the exclamation point, the program immediately ends and displays the next terminal prompt (a dollar sign). Typically, you'd want the program to put a new line between the exclamation point and the next dollar sign (as if simulating pressing the enter key after printing the exclamation point). To accomplish this, we'll need to update our program's source code like so:</P>

      <CBlock fileName="hello.c">{
`#include <stdio.h>

int main(void) {
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

      <P>There's a simple reason for this: we updated <Code>hello.c</Code>, but we forgot to update the executable file, <Code>hello-world</Code>. These are two completely separate files; updating the former does not update the latter. To update <Code>hello-world</Code>, we have to rebuild it using the same shell command that we did earlier:</P>

      <ShellBlock>{
`$ gcc -g -o hello-world hello.c 
`
      }</ShellBlock>

      <P>You must recompile your program every time you make any changes to any of its source code files, or else the executable will be outdated and unreflective of your recent changes.</P>

      <P>Now, running our program produces the following output, with the subsequent terminal prompt on its own line:</P>

      <TerminalBlock copyable={false}>{
`$ ./hello-world 
Hello, World!
$
`
      }</TerminalBlock>

      <SectionHeading id="valgrind">Valgrind</SectionHeading>

      <P>Although you <It>can</It> execute programs by simply writing out their name (prefixed with <Code>./</Code> if they're in your working directory) and pressing enter, when developing and debugging a C program, you should almost always execute it through a debugger. The ENGR servers have a debugging tool suite known as Valgrind. It's already installed and available for use. (If you're develooping locally, you'll likely have to use an alternative debugger; most C IDEs have C debugging tools built into them).</P>

      <P>We'll talk more about Valgrind later. But for now, I just want you to know: in this course, you should basically always run all of your programs through Valgrind (or another debugger). Really, there's absolutely no reason <It>not</It> to use Valgrind (or another debugger) in this course, and it's vital for catching and diagnosing lots of sneaky bugs (e.g., memory errors). To run an executable through Valgrind, simply type <Code>valgrind</Code> before the path to the executable. For example:</P>

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

      <P>The program's output, "Hello, World!", is sandwiched between Valgrind's debugging messages. This is a very simple program, so the debugging messages aren't telling us anything very important. When we start writing more complicated programs, we'll discuss Valgrind's debugging messages in greater detail.</P>

      <SectionHeading id="executable-file-permissions">Executable file permissions</SectionHeading>

      <P>In order to execute a file, it must be executable. This usually means two things:</P>

      <Itemize>
        <Item>It must follow the target system's executable file format. Linux uses the Executable and Linkable Format (ELF). All executables generated by <Code>gcc</Code> targeting Linux systems will automatically follow this format.</Item>
        <Item>The user who intends to execute the file must have the proper permissions to do so. In most cases, all executables generated by <Code>gcc</Code> will have all executable permission bits enabled, meaning that all users will have the necessary permissions to execute them.</Item>
      </Itemize>

      <P>In some scenarios (e.g., when writing shell scripts), you might find yourself wanting to execute a file for which you do not have executable permissions. Even if you're the <It>owner</It> of the file (e.g., because you created it), you may still not have executable permissions for it by default.</P>

      <P>But if you're the owner of a file, you can change the permissions associated with that file, giving yourself executable permissions so that you can execute it.</P>

      <P>(You shouldn't need to do this for compiled C programs, but I'll show you how to do it anyways just in case.)</P>

      <P>Let's learn by example. Suppose you try to execute the <Code>hello-world</Code> file, but you're met with a permissions error:</P>

      <TerminalBlock copyable={false}>{
`$ valgrind ./hello-world
valgrind: ./hello-world: Permission denied
`
      }</TerminalBlock>

      <P>This error means that you don't have permissions to execute the <Code>hello-world</Code> file. Again, you shouldn't encounter errors like this in most cases since programs built by <Code>gcc</Code> are executable by default. Regardless, suppose that, somehow, you run into this situation. To see the permissions associated with a file, use the <Code>ls</Code> command, but supply the <Code>-l</Code> flag:</P>

      <TerminalBlock copyable={false}>{
`$ ls -l
total 120
-rw-r--r--. 1 guyera upg4546    74 Sep 24 10:41 hello.c
-rw-r--r--. 1 guyera upg4546 18640 Sep 24 10:42 hello-world
`
      }</TerminalBlock>

      <P>For each file, <Code>ls -l</Code> will display various information about it, including the permissions associated with it (i.e., who has permission to do what with it), the hard link reference count of the file, the owner of the file, the owning user group of the file, the file's size (in bytes), the date and time at which the file was last modified, and the name of the file. Notice that the output lines for <Code>hello.c</Code> and <Code>hello-world</Code> both say <Code>guyera</Code> in them. This means that the user <Code>guyera</Code> is the owner of the file (that's me).</P>

      <P>The permissions of a file are given in the first part of the output. See all those dashes, r's, and w's? Those reflect file permissions. In this case, both files have the same permissions: <Code>-rw-r--r--</Code>.</P>

      <P>The first character in the permission string actually just tells you what type of file it is. A dash (<Code>-</Code>) means that it's a regular file (or, more rigorously, a hard link). A <Code>d</Code> means that it's a directory (folder). There are other characters as well for other special kinds of files (e.g., symbolic links).</P>

      <P>The next three characters (<Code>rw-</Code>, in the case of both the above files) specify the permissions of the file's owning user. As stated, both of these files are owned by <Code>guyera</Code>, so they reflect what permissions the Linux user <Code>guyera</Code> has when working with the files. The first of these three characters specifies whether the owning user has permissions to read the file (i.e., to view its contents). If it's an <Code>r</Code>, then the owning user does have such permissions. If it's a dash (<Code>-</Code>), then they don't. In this case, it's an <Code>r</Code> for both files, so <Code>guyera</Code> does, indeed, have permissions to read (view the contents of) these files. The second of these three characters is similar, but it specifies whether the owning user has permissions to write the file (i.e., modify its contents). If it's a <Code>w</Code>, then they do. If it's a dash (<Code>-</Code>), then they don't. In this case, it's a <Code>w</Code> for both files, so <Code>guyera</Code> does, indeed, have permissions to write (modify) these files. Finally, the third of these three characters specifies whether the owning user has permissions to execute the file. If it's an <Code>x</Code>, then they do. If it's a dash (<Code>-</Code>), then they don't. In this case, it's a dash for both files, so <Code>guyera</Code> cannot execute either of them (hence the "permission denied" error).</P>

      <P>Before moving on, I should explain the remaining permission characters. The next three (<Code>r--</Code>) work the same way, but they specify the permissions for users who 1) aren't the owning user of the file, but 2) <It>do</It> belong to the owning user group of the file. In this case, that means users who are <It>not</It> <Code>guyera</Code>, but who <It>do</It> belong to the group <Code>upg4546</Code> (and, in this case, <Code>upg4546</Code> is actually my personal Linux user group, so <Code>guyera</Code> is the only user in it). The last three characters (also <Code>r--</Code>) work the same way, but they specify the permissions for all other users (users who aren't the owning user of the file <It>and</It> don't belong to the owning user group of the file).</P>

      <P>That's all to say, I (<Code>guyera</Code>) own the file <Code>hello-world</Code>, but I don't have executable permissions as signified by the fourth permission character being a dash instead of an <Code>x</Code>. Before I can execute it, I must give myself executable permissions for the file.</P>

      <P>The owner of a file can modify its permissions via the <Code>chmod</Code> shell command. In its simplest form, it can be used like so: <Code>{"chmod <users>+<permissions> <file>"}</Code>. Replace <Code>{"<users>"}</Code> with one or more characters signifying the users whose permissions you want to change with respect to the file. You can use <Code>a</Code> to change all users' permissions, <Code>u</Code> to change the owning user's permissions, <Code>g</Code> to change the owning user group's permissions, or <Code>o</Code> to change all other users' permissions. Replace <Code>{"<permissions>"}</Code> with one or more characters signifying the permissions you'd like to give to those users. You can use <Code>r</Code> to give them read permissions, <Code>w</Code> to give them write permissions, or <Code>x</Code> to give them executable permissions. Finally, replace <Code>{"<file>"}</Code> with the path to the file whose permissions you're modifying.</P>

      <P>For example, we can give ourselves executable permissions for <Code>hello-world</Code> like so:</P>

      <ShellBlock>{
`chmod u+x hello-world`
      }</ShellBlock>

      <P>The <Code>u+x</Code> means that we're trying to give the owning user (which is us, since we own the file) executable permissions (<Code>u</Code> means the owning user, and <Code>x</Code> means executable). After running the above command, we can execute the <Code>hello-world</Code> file once again:</P>

      <TerminalBlock copyable={false}>{
`$ chmod u+x hello-world 
$ ./hello-world 
Hello, World!
$ ls -l
total 120
-rw-r--r--. 1 guyera upg4546    74 Sep 24 10:41 hello.c
-rwxr--r--. 1 guyera upg4546 18640 Sep 24 10:42 hello-world
`
      }</TerminalBlock>

      <P>I've also run <Code>ls -l</Code> again so that you can see the updated permissions for <Code>hello-world</Code>: <Code>-rwxr--r--</Code>. The <Code>x</Code> indicates that the owning user (me) now has executable permissions.</P>

      <P>You can also use <Code>chmod</Code> to remove or set permissions. The <Code>+</Code> character means to add permissions. Replace it with a <Code>-</Code> character to remove permissions, or an <Code>=</Code> character to set permissions. We might revisit this in a future lecture, but that's enough on file permissions for now.</P>

      <SectionHeading id="compiler-errors">Compiler errors</SectionHeading>

      <P>Certain kinds of programming errors can be detected via <Bold>static analysis</Bold>. Static loosely means "before runtime" (whereas dynamic means "at runtime"), so static analysis refers to analysis of a program's code before actually running it. There are various static analysis tools for C programs, but the most common one is simply your compiler. Yes, compilers translate code from one language to another, but as they do so, they analyze the source code and make sure that it's valid. If a compiler detects that the source code isn't valid, it will fail to compile the program and print out a very useful diagnostic error message.</P>

      <P>For example, suppose we had forgotten one of the (very important) semicolons in our <Code>hello.c</Code> file:</P>

      <CBlock fileName="hello.c">{
`#include <stdio.h>

int main(void) {
        printf("Hello, World!\\n")
        return 0;
}
`
      }</CBlock>

      <P>(There's supposed to be a semicolon after the closing parenthesis of the <Code>printf()</Code> function call.)</P>

      <P>Then attempting to build the executable via <Code>gcc</Code> produces the following error message:</P>

      <TerminalBlock copyable={false}>{
`$ gcc hello.c 
hello.c: In function ‘main’:
hello.c:4:34: error: expected ‘;’ before ‘return’
    4 |         printf("Hello, World!\\n")
      |                                  ^
      |                                  ;
    5 |         return 0;
      |         ~~~~~~                    
`
      }</TerminalBlock>

      <P>Yes, that's literally what <Code>gcc</Code> displays in the terminal. Notice how helpful this message is. Not only does it say that it expected a semicolon before the word <Code>'return'</Code>, it even displays the line of code on which the semicolon was expected to appear, and it displays an arrow pointing to exactly where it expected to see that semicolon (and a semicolon character below that arrow, in case you've forgotten what a semicolon looks like).</P>

      <P>Not all error messages are quite <It>that</It> nice. Some of them are a little less clear. For example, in some cases, the compiler knows that something is wrong, but it doesn't necessarily know how to fix it. But even in those cases, compiler error messages are extremely helpful in diagnosing the problem.</P>

      <P>Every compiler error printed by <Code>gcc</Code> includes information that points you to the offending line of code. In the above error message, notice the part that says <Code>hello.c:4:34</Code>. This is saying that the error is occurring on line 4 of <Code>hello.c</Code> (specifically at the 34th character of that line). You should get used to interpreting these error messages; you'll do it a lot throughout the term.</P>

      <P>(Sometimes, the offending line of code is slightly off. For example, if a line of code is missing an important token from the end of it (such as a semicolon), the compiler can sometimes misinterpret the issue as missing a token from the beginning of the subsequent line. In such a case, if the error occurs in line N, it might instead point you to line N+1 or similar. Regardless, it will always get you extremely close to the issue.)</P>

      <P>Lastly, a pro tip: rather than making hundreds of complicated changes and then trying to recompile it all at once, prefer to work in small iterations. Make a single small change to the source code; try to recompile; and fix any compiler errors until compilation succeeds again. Rinse and repeat until the program is done and works as intended. You're less likely to encounter a large slew of error messages all at once that way (which can be much harder to diagnose since some of the errors can be interrelated in complicated ways). Still, even when making small changes, you can occasionally encounter multiple compiler errors at once. In such a case, always start at the very top<Emdash/>diagnose the first error, fix it, recompile, and, if the error is gone, move on to the next one. (Don't start with the bottom error message; the errors lower down in the printout can often be caused by errors higher up, so you should start at the top and work your way down).</P>
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
