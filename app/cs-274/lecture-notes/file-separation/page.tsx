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
        <Item><Link href="#the-linker">The linker</Link></Item>
        <Item><Link href="#separating-definitions">Separating definitions</Link></Item>
        <Item><Link href="#header-files-and-include">Header files and <Code>#include</Code></Link></Item>
        <Item><Link href="#header-guards">Header guards</Link></Item>
        <Item><Link href="#circular-dependencies">Circular dependencies</Link></Item>
        <Item><Link href="#and-more">And more!</Link></Item>
      </Itemize>

      <SectionHeading id="the-linker">The linker</SectionHeading>

      <P>As I said in <Link href={`${PARENT_PATH}/${allPathData["c-preprocessor"].pathName}`}>our lecture on the preprocessor</Link>, the full C build pipeline consists of at least the following steps:</P>

      <Enumerate listStyleType="decimal">
        <Item><Bold>Preprocessing</Bold>: The <Bold>C preprocessor</Bold> interprets <Bold>preprocessing directives</Bold> and modifies the C source code accordingly.</Item>
        <Item><Bold>Compilation</Bold>: The C compiler compiles the preprocessed C source code into object code. This is done in <Bold>translation units</Bold> (loosely, each <Code>.c</Code> file in a C program represents a distinct translation unit).</Item>
        <Item><Bold>Linking</Bold>: All the compiled translation units' object code, along with the object code of any libraries the program uses (including the C standard library), is <Bold>linked</Bold> together into a final product (e.g., an executable, or a library).</Item>
      </Enumerate>

      <P>We've discussed preprocessing and compilation at length, but what's linking?</P>

      <P>Believe it or not, a C program may, in fact, consist of several source code (e.g., <Code>.c</Code>) files. Indeed, you don't have to put all your code in one file like we've been doing throughout the term. Moreover, a C program may depend on one or more pre-built libraries (e.g., the C standard library, possibly a separate library for math functions prototyped by <Code>math.h</Code>, third-party libraries, and so on). All of the code spread across all of these files and libraries must be compiled, but, as it turns out, they're typically compiled separately / independently of one another.</P>

      <P>In particular, C code is compiled in independent units known as <Bold>translation units</Bold>. In most cases, each file ending in <Code>.c</Code> represents its own, independent translation unit.</P>

      <P>For example, suppose a C program consists of two source code files: <Code>a.c</Code> and <Code>b.c</Code>. When <Code>gcc</Code> compiles <Code>a.c</Code>, it doesn't even <It>look</It> at <Code>b.c</Code>. And when it compiles <Code>b.c</Code>, it doesn't even <It>look</It> at <Code>a.c</Code>.</P>

      <P>This is a good thing. Compilation takes time. Compiling an extremely large and complicated codebase with many large translation units can take a <It>lot</It> of time. Take the C standard library, for instance. Most implementations of it consist of hundreds or possibly even thousands of extremely complicated translation units, and it might take hours or even <It>days</It> to compile, depending on your machine. If the entire C standard library needed to be recompiled every time any C program is built, it could take hours or days to build even the smallest of C programs.</P>

      <P>But since each <Code>.c</Code> file is treated as a separate translation unit, compiled completely separately from one another, changes to one C source code file generally do not necessitate recompilation of other C source code files (unless one source code file is <Link href="#header-files-and-include">included in another</Link>). Similarly, changes to some application <Code>program.c</Code> do not necessitate recompilation of the entire C standard library. This means that the C standard library can be compiled <It>once</It> on a given machine (or even on another machine, and then the binaries transferred directly and installed on various consumer machines), separately from all the applications that use it.</P>

      <P>But I've skipped an important step: for a given application with many translation units and library dependencies, how is everything combined together into a single, final executable (or library)? Answer: <Bold>the linker</Bold>. The linker is part of GCC (or, rather, GCC invokes the linker as part of the build pipeline). Here's what the linker does:</P>

      <Enumerate listStyleType="decimal">
        <Item>(Object code collection) The linker collects the object code (compiled data and machine code) from all the necessary translation units, including those of the program's <Code>.c</Code> files as well as those of any libraries used by the program.</Item>

        <P>(<Code>gcc</Code> will link in the C standard library automatically, but linking the program with any other library at build time requires an explicit linker flag. For example, <Code>-lm</Code> links with the definitions of various math functions provided by <Code>math.h</Code>, <Code>-lpthread</Code> links with the POSIX threading library, and so on).</P>
        <Item>(Verification) The linker makes sure that there are no conflicts between the translation units (e.g., it verifies that each function and external global variable / constant is defined exactly once across all translation units)</Item>
        <Item>(Relocation, step 1) Given that the program will need to use functions, global variables, etc, that are defined across <It>all</It> of these translation units, it must somehow be decided how all of these things will be arranged in the program's memory. The linker makes these decisions.</Item>
        <Item>(Relocation, step 2) The linker modifies references (e.g., memory addresses) of various symbols (functions, global variables, etc) used across all the translation units' object code to match their new locations in the program's memory as decided by the linker in the previous step.</Item>
        <Item>(Concatenation, loosely) The linker combines / "concatenates" all the translation units' modified object code into a single file (e.g., an executable, or a library that can be further linked into other executables / libraries).</Item>
      </Enumerate>

      <P>In other words, once the preprocessor and compiler have preprocessed and then compiled each translation unit (e.g., each <Code>.c</Code> file) into object code, the linker is responsible for combining all that object code, along with the object code of library dependencies like the C standard library, into a final product.</P>

      {/*TODO Diagram of C build pipeline*/}

      <SectionHeading id="separating-definitions">Separating definitions</SectionHeading>

      <P>That was a lot of theory, but here's the takeaway that's most practically relevant for your purposes: it's possible to separate a C program into several <Code>.c</Code> files, compile them as independent translation units, and link them all together into a final executable. Yes, we're finally going to organize our code into separate C source code files rather than putting all of our code in one gigantic file.</P>

      <P>It's actually fairly easy to do so long as you understand a couple simple rules. Here's the first rule: each function used by the program must be defined <Ul>exactly once</Ul>, in <Ul>exactly one translation unit</Ul> (<Code>.c</Code> source code file) across the <Ul>entire program</Ul>.</P>

      <P>(Technically, <Code>inline</Code> functions can have multiple definitions across translation units. But regular functions cannot.).</P>

      <P>Take this program for example:</P>

      <CBlock fileName="hello_program.c">{
`#include <stdio.h>

void say_hello(void) {
        printf("Hello, World!\\n");
}

int main(void) {
        say_hello();
}
`
      }</CBlock>

      <P>We can move the <Code>say_hello</Code> function's definition to its own C source code file, <Code>say_hello.c</Code>. We'll also need to include <Code>stdio.h</Code> in this file so that we can use <Code>printf</Code> in it:</P>

      <CBlock fileName="say_hello.c">{
`#include <stdio.h>

void say_hello(void) {
        printf("Hello, World!\\n");
}
`
      }</CBlock>

      <P>To avoid violating our first rule, we must also remove the definition of <Code>say_hello</Code> from <Code>hello_program.c</Code>. While we're at it, let's remove the <Code>{'#include <stdio.h>'}</Code> directive as well since we're no longer going to be calling <Code>printf</Code> in it:</P>

      <CBlock fileName="hello_program.c">{
`int main(void) {
        say_hello();
}
`
      }</CBlock>

      <P>Now, how do we build all of this C source code into a single executable? Well, we need to 1) preprocess both C source code files / translation units; 2) compile both preprocessed C source code files / translation units into object code; and 3) link the compiled translation units' object code together along with that of the C standard library (which defines the <Code>printf</Code> function, etc). As I've mentioned, GCC is capable of doing all of these things. Indeed, people call it a "compiler", but it's much more than that.</P>

      <P>There are many ways to use GCC to accomplish all these tasks, but the simplest way is this: run <Code>gcc</Code> exactly as you normally would, demonstrated hundreds of times throughout this course, except when you get to the part of the command where you'd ordinarily write the name of a single <Code>.c</Code> file, instead write the name of <It>all</It> of your program's C source code files, separated by spaces. That is:</P>

      <ShellBlock>{
`gcc -g -Wall -o hello_program hello_program.c say_hello.c`
      }</ShellBlock>

      <P>However, if we try doing this now, we'll get a strange compiler warning:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o hello_program hello_program.c say_hello.c
hello_program.c: In function ‘main’:
hello_program.c:2:9: warning: implicit declaration of function ‘say_hello’ [-Wimplicit-function-declaration]
    2 |         say_hello();
      |         ^~~~~~~~~
`
      }</TerminalBlock>

      <P>Although this is technically only a warning, and although the program will probably <It>actually</It> work in this very particular case, officially, our program currently invokes undefined behavior.</P>

      <P>Why's that? Well, I said that every function must be defined exactly once in exactly one translation unit. But there's actually another rule. You're essentially already aware of this second rule, but now I have to bring it into context: a given function (or symbol in general) must be <Bold>declared</Bold> before it can be referenced. Specifically, this rule is enforced by the compiler<Emdash/>not the linker<Emdash/>which means that it's imposed on a per-translation-unit basis (because the compiler only looks at one translation unit at a time). That's to say, in any given C source code file, if that file references a function (or any symbol) anywhere within it, that symbol must be declared <Ul>within that file</Ul> before said reference.</P>

      <P>Be careful with the terminology. Declaration is not the same thing as definition. Here are our two rules side-by-side: 1) across all translation units, each referenced function must be <Ul>defined </Ul> exactly once; and 2) within a given translation unit, all functions must be <Ul>declared</Ul> before they're referenced.</P>

      <P>As it stands, our program satisfies rule 1 but not rule 2. Indeed, <Code>hello_program.c</Code> calls (and therefore references) the <Code>say_hello</Code> function but does not declare it prior to said reference.</P>

      <P>(The reason it's only a warning instead of an error is because, in older versions of C, the compiler is allowed attempt to <It>infer</It> missing function declarations. But it makes some very bold assumptions during this inference: it assumes that the function's return type is supposed to be <Code>int</Code>, and that it accepts any number of arguments. If this assumption is violated, which it often is, undefined behavior may ensue. This is known as an <Bold>implicit function declaration</Bold>. In newer versions of C, this produces an error instead of a warning.)</P>

      <P>Now, if we were to copy and paste the definition of the <Code>say_hello</Code> function back into <Code>hello_program.c</Code> above the <Code>main</Code> function, that would satisfy rule 2, but we would then be violating rule 1. Not to mention, it'd defeat the entire purpose of file separation. So, what do we do? How do we satisfy both rules simultaneously while still keeping our function definitions organized in separate files?</P>

      <P>Well, at the beginning of the term, we discussed these things called "function prototypes". Recall that they look exactly like function definitions, except the function body is replaced with a semicolon:</P>
      
      <CBlock showLineNumbers={false}>{
`void say_hello(void);`
      }</CBlock>

      <P>Recall that a function prototype serves as a function declaration but not a definition. In contrast, function definitions serve as both definitions <It>and</It> declarations.</P>

      <P>That's to say, function prototypes allow us to declare functions without defining them. This allows us to satisfy rule 2 (declaring symbols in each translation unit before reeferencing them) without violating rule 1 in the process:</P>

      <CBlock fileName="hello_program.c">{
`void say_hello(void);

int main(void) {
        say_hello();
}
`
      }</CBlock>
      
      <P>Crucially, the prototype's signature (return type, name, parameter type list, etc) must match the signature of the function's definition <Ul>exactly</Ul>. Otherwise, the linker will view the prototype as a declaration of a completely different function. What's worse, if the signature is <It>partially</It> correct (e.g., its name is correct, but its return type and / or parameter type list is incorrect), then the result is undefined behavior.</P>

      <P>We can now proceed to build all this code into an executable using the <Code>gcc</Code> command that I showed you earlier:</P>
      
      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o hello_program hello_program.c say_hello.c`
      }</TerminalBlock>

      <P>It runs as expected, printing <Code>Hello, World!</Code> to the terminal.</P>

      <P>Note that the C source code files do not need to be listed in any particular order in the <Code>gcc</Code> command, but they <It>must</It> all be listed. If you forget to list one of them, then the linker won't be aware of it, and it'll fail to locate the definitions of the functions defined in that missing translation unit. This will produce an "undefined reference" linker error. For example:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o hello_program hello_program.c
/usr/bin/ld: /tmp/ccJQSlNp.o: in function 'main':
/nfs/stak/users/guyera/instructor/static-content/guyera.github.io/code-samples/cs274/file-separation/hello_program.c:4: undefined reference to 'say_hello'
collect2: error: ld returned 1 exit status
`
      }</TerminalBlock>

      <P>Suppose all your <Code>.c</Code> files are in the same directory. Then there's a simple trick that you can use in any POSIX-compliant shell (and Bash, which is mostly POSIX-compliant, as well as many other shells) to avoid having to type out all the <Code>.c</Code> files one at a time: <Bold>globbing</Bold>. No, that's not a typo. Globbing is filename expansion within shell commands through the use of wildcards. In POSIX-compliant shells, the asterisk character (<Code>*</Code>) is the wildcard character used in globbing. It may be placed anywhere in a filename pattern, and it serves as a placeholder for any sequence of zero or more characters of any kind.</P>

      <P>When a POSIX-compliant shell encounters an asterisk within a would-be file path, it searches for all files that <It>could</It> match the given pattern by expanding the wildcard. It then expands the entire filename pattern (the "glob") into a list of all such files (sorted in lexicographical order).</P>

      <P>For example, consider this command:</P>

      <TerminalBlock copyable={false}>{
`gcc -g -Wall -o hello_program *.c`
      }</TerminalBlock>

      <P>When Bash is interpreting this shell command and it gets to the <Code>*.c</Code> argument, it searches for all files (in the working directory, in this case) that end in <Code>.c</Code>. It then expands <Code>*.c</Code> into a list of all of those files. Indeed, so long as <Code>hello_program.c</Code> and <Code>say_hello.c</Code> are the only two files in the working directory ending in <Code>.c</Code>, the above shell command is equivalent to this:</P>

      <TerminalBlock copyable={false}>{
`gcc -g -Wall -o hello_program hello_program.c say_hello.c`
      }</TerminalBlock>

      <P>This is a simple trick for compiling a C program consisting of many <Code>.c</Code> source code files all present in the working directory.</P>

      <P>(There are much better tools for simplifying the build process, though. For example, a GNU makefile is a configurable build tool that supports far more advanced wildcard expansion; skipping recompilation of translation units whose source code hasn't been modified since its last compilation; autodependency discovery to support said recompilation-skipping; and much more)</P>

      <SectionHeading id="header-files-and-include">Header files and <Code>include</Code></SectionHeading>

      <P>One annoying thing about our above program is that we had to explicitly write out the prototype of the <Code>say_hello</Code> function within <Code>hello_program.c</Code>. What's worse is that, if this were a larger program, we'd have to do this in <It>every</It> <Code>.c</Code> file that references (e.g., calls) the <Code>say_hello</Code> function. If this function is used many times throughout thousands of C source code files across a very large program, we'd have to prototype it in every one of those thousands of files.</P>

      <P>Maybe that's not a huge deal, but consider: if we ever want to change the signature (return type, parameter type list, etc) of <Code>say_hello</Code>, even if it's a fairly innocuous interface change, we'd have to make that change in its definition within <Code>say_hello.c</Code> but <It>also</It> in every single prototype of the <Code>say_hello</Code> function across <It>all</It> of our <Code>.c</Code> files that reference it. This is an instance of coupling: prototypes are coupled to definitions since their signatures must match, so changing one requires changing the other. Hence, changing a function's definition requires changing all the prototypes for that function.</P>

      <P>Coupling makes things hard to change. What if we could reduce that coupling? Indeed, we can, by making use of the preprocessor.</P>

      <P>You've used the <Code>#include</Code> preprocessor directive many times before, but perhaps you didn't know that, in reality, it's little more than an automatic copy-paste tool. When the preprocessor encounters an <Code>#include</Code> directive, all it does is 1) retrieve the contents of the specified file, 2) replace the <Code>#include</Code> directive itself with said contents, and 3) proceed to preprocess those contents recursively.</P>

      <P>As it stands, we find ourselves having to <It>manually</It> copy and paste the prototype of <Code>say_hello</Code> into each C source code file that references it (which is just <Code>hello_program.c</Code> in this case). But <Code>#include</Code> is an <It>automatic</It> copy-paste tool. So, can we use it to automate the work and resolve the coupling?</P>

      <P>Yes, we can. First, we'll move the prototype into its own <Bold>header file</Bold>. A header file is simply a C source code file, typically with the <Code>.h</Code> extension, whose purpose is to provide contents that will be included within <It>other</It> C source code files (e.g., <Code>.c</Code> files, or even other header files) via an <Code>#include</Code> directive. Let's do that:</P>

      <CBlock fileName="say_hello.h">{
`void say_hello(void);`
      }</CBlock>

      <P>Notice that I named the header file <Code>say_hello.h</Code>. It prototypes the <Code>say_hello</Code> function, which is in turn defined in <Code>say_hello.c</Code>. This is a very common practice: for each <Code>.c</Code> file that defines functions, provide a corresponding <Code>.h</Code> (header) file that prototypes those very same functions.</P>

      <P>Now, in any C source code file where we need to reference (e.g., call) the <Code>say_hello</Code> function, rather than <It>manually</It> copying and pasting its prototype into said file, we can simply use an <Code>#include</Code> directive to tell the preprocessor to <It>automatically</It> do the copying and pasting.</P>

      <P>So far, in all our <Code>#include</Code> directives, we've enclosed the header file's path in angle brackets (e.g., <Code>{'#include <stdio.h>'}</Code>). This time, we'll use <Ul>quotation marks</Ul> instead:</P>

      <CBlock fileName="hello_program.c">{
`// I no longer need the prototype here. Instead, I just include
// the header file, which provides the prototype
#include "say_hello.h"

int main(void) {
        say_hello();
}
`
      }</CBlock>

      <P>When the file path in an <Code>#include</Code> directive is enclosed in angle brackets, the preprocessor starts searching for the header file within special, dedicated directories on the system (e.g., <Code>/usr/include</Code>, among others). In contrast, when the file path is enclosed in quotation marks, the preprocessor starts searching for the header file within the directory containing the source code file being preprocessed. When <Code>gcc</Code> is preprocessing <Code>hello_program.c</Code>, it will search for <Code>say_hello.h</Code> in the same directory that contains <Code>hello_program.c</Code> (the working directory, in this case). Since <Code>say_hello.h</Code> is, indeed, in the same directory, it will find it, replacing the <Code>#include</Code> directive with its contents<Emdash/>the prototype of <Code>say_hello</Code>.</P>

      <P>(Technically, quotation marks can be used in <Code>#include</Code> directives to locate system-installed header files, and angle brackets can sometimes be used to locate project-local header files with some manual configuration, but the general convention is that quotation marks are used for including <It>your</It> project-local header files, and angle brackets are used for including <It>external</It> system-installed header files.)</P>

      <P>We can build the program exactly as we did before:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o hello_program hello_program.c say_hello.c`
      }</TerminalBlock>

      <P>(The program does the same thing as before.)</P>

      <P>Notice: I did <Ul>not</Ul> write out the name of the header file in my build command. This is <Ul>very important</Ul>: header file names should <Ul>not</Ul> be provided in build commands, unless you really know what you're doing. If a header file is provided directly to <Code>gcc</Code>, it will produce a <Bold>precompiled header file</Bold>. Usually, these files are hidden (their names start with a dot) and have <Code>.gch</Code> extensions. Precompiled headers can be useful in some cases to someone who really knows how to navigate the C build pipeline, but to a beginner, they cause problems. In particular, if a precompiled header file is present, GCC will ignore the <It>actual</It> header file in favor of the precompiled one. This means that if you make changes to the actual header file, GCC will act as if nothing was changed, and the program will keep doing the same thing as before. Many students have lost sleep over this.</P>

      <P>So, don't write the names of header files in your <Code>gcc</Code> build commands. Write the names of <Code>.c</Code> files, and use the <Code>#include</Code> directive to make sure the header files get included where they're needed.</P>

      <P>In our running example, our header file <Code>say_hello.h</Code> only has a single prototype in it, as the corresponding <Code>say_hello.c</Code> only defines a single function. In practice, each <Code>.c</Code> file will usually define several related functions, and the corresponding <Code>.h</Code> file will prototype all of them. Then, whenever the header file is included in a translation unit, that translation unit immediately gets <It>all</It> of those function prototypes. For example, <Code>stdio.h</Code> provides prototypes for <Code>printf</Code>, <Code>scanf</Code>, <Code>getline</Code>, and many other functions, hence why you can use all of those functions in a translation unit after including <Code>stdio.h</Code>.</P>

      <SectionHeading id="header-guards">Header guards</SectionHeading>

      <P>Suppose a given translation unit includes the same header file two or more times. This is actually very common, and often unavoidable. For example, <Code>a.c</Code> might include <Code>b.h</Code> and <Code>c.h</Code>, where <Code>b.h</Code> in turn <It>also</It> includes <Code>c.h</Code> (there are various reasons header files might include one another, the most common of which being to retrieve structure type definitions, which we'll cover in a future lecture).</P>

      <P>In some cases (such as when the doubly-included header file contains structure type definitions), this can cause compiler errors.</P>

      <P>The simplest solution to these issues is to protect <Ul>all</Ul> of your header files with <Bold>header guards</Bold>. In other words, whenever you write a header file, start by writing two preprocessor directives at the <Ul>very top</Ul> that look like this:</P>

      <SyntaxBlock>{
`#ifndef UNIQUE_MACRO_NAME
#define UNIQUE_MACRO_NAME`
      }</SyntaxBlock>

      <P>Replace both instances of <Code>UNIQUE_MACRO_NAME</Code> with a macro name of your choosing. Both of these directives must use the same macro name. Importantly, whatever macro name you choose, you must <Ul>not</Ul> define that macro anywhere else in your entire codebase, or else your header guards might not work in some cases. This means that each header file's respective header guards must use a unique macro.</P>

      <P>Commonly, the chosen macro name is derived from the path of the header file itself so as to ensure that these macro names are unique across header files. For example, in <Code>say_hello.h</Code>, I might use the macro name <Code>SAY_HELLO_H</Code>.</P>

      <P>But we're not done yet; that's just the <It>first</It> part of creating header guards. The <It>second</It> part is to write an <Code>#endif</Code> directive at the <Ul>very bottom</Ul> of the entire header file.</P>

      <P>So here's our updated <Code>say_hello.h</Code> file:</P>

      <CBlock fileName="say_hello.h">{
`#ifndef SAY_HELLO_H
#define SAY_HELLO_H

void say_hello(void);

#endif
`
      }</CBlock>

      <P>This is a use-case of conditional compilation. To fully understand it, you first must recognize that the preprocessor, like the compiler, deals with one translation unit at a time. This means that if a preprocessor macro is defined in one translation unit, that does <Ul>not</Ul> define it in another translation unit.</P>

      <P>Now, let's break it down. First, for illustration, suppose <Code>hello_program.c</Code> includes <Code>say_hello.h</Code> twice, for some reason (this is a crude example, but again, there are cases where this is unavoidable):</P>

      <CBlock fileName="hello_program.c" highlightLines="{4}">{
`// I no longer need the prototype here. Instead, I just include
// the header file, which provides the prototype
#include "say_hello.h"
#include "say_hello.h" // Second, unnecessary include

int main(void) {
        say_hello();
}
`
      }</CBlock>

      <P>When GCC is preprocessing <Code>hello_program.c</Code> it encounters the first <Code>#include "say_hello.h"</Code> directive and retrieves the contents of <Code>say_hello.h</Code>. It then begins recursively preprocessing those contents. It immediately encounters the <Code>#ifndef SAY_HELLO_H</Code> directive and determines its condition to be true since <Code>SAY_HELLO_H</Code> has not, in fact, been defined by this point. Because the preprocessor if statement's condition is true, its enclosing contents are <Ul>not</Ul> deleted by the preprocessor. It then begins preprocessing the contents of the preprocessor if statement body. It immediately encounters <Code>#define SAY_HELLO_H</Code> and proceeds to define the <Code>SAY_HELLO_H</Code> macro.</P>

      <P>When it's done preprocessing <Code>say_hello.h</Code>, it jumps back to <Code>hello_program.c</Code> and continues preprocessing it. It immediately encounters the <It>second</It> <Code>#include "say_hello.h"</Code> directive. Again, it retrieves the contents of <Code>say_hello.h</Code> and begins recursively preprocessing those contents. But this time, when it arrives at the <Code>#ifndef SAY_HELLO_H</Code> directive, it determines the condition to be <It>false</It>. Why? Because <Code>SAY_HELLO_H</Code> <It>has</It> been defined now<Emdash/>it was defined when <Code>say_hello.h</Code> was included in the translation unit for the <It>first</It> time. Since the preprocessor if statement's condition is false, the preprocessor deletes its body of code.</P>

      <P>The result? Even though <Code>hello_program.c</Code> includes <Code>say_hello.h</Code> twice, the contents of <Code>say_hello.h</Code> are only <It>actually</It> dumped into <Code>hello_program.c</Code> once.</P>

      <P>Again, the preprocessor deals with translation units independently. As such, if another, completely separate <Code>.c</Code> file wants to include <Code>say_hello.h</Code> as well, that's perfectly fine; the <Code>#ifndef</Code> directive will not prevent that. It only prevents the same contents from being included two or more times in the same translation unit.</P>

      <P>Again, this is important for avoiding compilation errors in certain cases. Any time you write a header file, you should <Ul>always</Ul> protect it with header guards.</P>

      <SectionHeading id="circular-dependencies">Circular dependencies</SectionHeading>

      <P>Suppose a header file <Code>a.h</Code> includes another header file <Code>b.h</Code>, and then <Code>b.h</Code> includes <Code>c.h</Code>, and then <Code>c.h</Code> includes <Code>a.h</Code>, all in one big cycle.</P>

      <Image src={CircularDependencyDiagram} alt="A dependency graph containing two nodes, a.h and b.h, with arrows running between them in both directions" srcDarkMode={CircularDependencyDiagramDarkMode} className="w-[17rem]"/>

      <P>This is known as a <Bold>circular dependency</Bold>, and it very often causes compilation errors that even header guards can't fix.</P>

      <P>You aren't likely to run into issues with circular dependencies yet, but once we've covered structue types, they become more common. For example, you might have one structure type <Code>a</Code> whose definition depends on that of another structure type <Code>b</Code>, but structure type <Code>b</Code>'s definition also depends on that of <Code>a</Code>. While header guards will prevent infinite preprocessing loops, they won't resolve the fundamental problem: dependencies must be defined before their dependents can use them, so if two symbols' definitions depend on <It>each other</It>, you run into a paradox. You cannot possibly define <Code>a</Code> before <Code>b</Code> while simultaneously defining <Code>b</Code> before <Code>a</Code>.</P>

      <P>In almost all cases, the solution to a circular dependency is simply refactoring. Ask yourself: does <Code>a</Code> actually need to depend on <Code>b</Code>? Or can <Code>a</Code> get away with depending on just a small <It>part</It> of <Code>b</Code>? If so, you can often extract that small part of <Code>b</Code> into a separate component (e.g., a separate structure type) <Code>c</Code>. <Code>a</Code> and <Code>b</Code> can then both depend on <Code>c</Code>, and <Code>b</Code> can continue to depend on <Code>a</Code>, but <Code>a</Code> no longer depends directly on <Code>b</Code> (and <Code>c</Code> is a small, standalone piece that depends on neither <Code>a</Code> nor <Code>b</Code>).  This breaks the include cycle. It's a more complicated organization, but there are no circular dependencies, and therefore no paradoxes.</P>

      <Image src={NonCircularDependencyDiagram} alt="A dependency graph containing three nodes, a.h, b.h, and c.h, with arrows running from a.h to c.h, from b.h to c.h, and from b.h to a.h" srcDarkMode={NonCircularDependencyDiagramDarkMode} className="w-[17rem]"/>
      
      <P>(Or, of course, you can do things the other way around<Emdash/>extract a small part of <Code>a</Code> into its own component that <Code>b</Code> depends on, instead of depending directly on <Code>a</Code>).</P>

      <P>Occasionally, though, you'll encounter a circular dependency that's fundamental to your domain model (or necessary for, say, performance gains via reverse lookups), in which case you might not be able refactor the circular dependency away. In that case, you might consider looking into forward declarations to break the include cycle while preserving the circular dependency itself. That's beyond the scope of this course, though.</P>

      <P>(Forward declarations can also be used in certain situations to speed up build times. That's actually their most common use case.)</P>

      <SectionHeading id="and-more">And more!</SectionHeading>

      <P>There's plenty more to be learned about the linker, header files, and the C build pipeline in general. We unfortunately don't have time to cover such details, though. For the curious reader, I recommend looking into internal vs external linkage (e.g., <Code>static</Code> and <Code>extern</Code>), GNU Make, CMake, and library loading (esp. dynamic loading, like through <Code>dlopen</Code> and <Code>dlsym</Code> on Unix-like systems).</P>

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
