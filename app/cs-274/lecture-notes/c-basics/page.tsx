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
        <Item><Link href="#include-and-preprocessing-directives"><Code>#include</Code> and preprocessing directives</Link></Item>
        <Item><Link href="#main"><Code>main()</Code></Link></Item>
        <Item><Link href="#comments">Comments</Link></Item>
        <Item><Link href="#indentation">Indentation</Link></Item>
        <Item><Link href="#standard-output">Standard output</Link></Item>
        <Item><Link href="#breaking-up-lines">Breaking up lines</Link></Item>
        <Item><Link href="#types-expressions-and-operators">Types, expressions, and operators</Link></Item>
        <Item><Link href="#statements">Statements</Link></Item>
        <Item><Link href="#declaring-and-initializing-automatic-variables">Declaring and initializing automatic variables</Link></Item>
        <Item><Link href="#uninitialized-values">Uninitialized values</Link></Item>
        <Item><Link href="#more-on-variables">More on variables</Link></Item>
        <Item><Link href="#type-casting">Type casting</Link></Item>
        <Item><Link href="#const"><Code>const</Code></Link></Item>
        <Item><Link href="#basic-standard-input">Basic standard input</Link></Item>
        <Item><Link href="#if-statements">If statements</Link></Item>
      </Itemize>

      <SectionHeading id="include-and-preprocessing-directives"><Code>#include</Code> and preprocessing directives</SectionHeading>

      <P>This lecture will teach you the basics of C. We'll start with <Code>#include</Code> directives. You saw one such directive in the first line of <Code>hello.c</Code> in <Link href={`${PARENT_PATH}/${allPathData["hello-world"].pathName}`}>our previous lecture</Link>:</P>

      <CBlock fileName="hello.c" highlightLines="{1}">{
`#include <stdio.h>

int main() {
        printf("Hello, World!\\n");
        return 0;
}
`
      }</CBlock>

      <P>In C, lines of code starting with <Code>#</Code> are <Bold>preprocessing directives</Bold>. <Code>#include</Code> is one such directive. Loosely, the purpose of <Code>#include</Code> is to import code from another file so that you can use it (e.g., functions, type definitions, etc). But that's a bit oversimplified. Let's talk about how it really works.</P>

      <P>When building a C program into an executable via <Code>gcc</Code>, several build steps take place, including at least:</P>

      <Enumerate listStyleType="decimal">
        <Item><Bold>Preprocessing</Bold>. This step parses and executes preprocessing directives within a translation unit (e.g., a file ending in <Code>.c</Code>) to transform / manipulate the C code to produce new C code. This step does not produce any assembly code nor machine code. It simply takes C source code (with preprocessing directives) as input and produces new C code (without preprocessing directives) as output.</Item>

        <P>In some sense, preprocessing directives are a form of <Bold>metaprogramming</Bold>. They're lines of code that manipulate the surrounding code itself when executed by the preprocessor.</P>
        <Item><Bold>Compilation</Bold>. This step takes the preprocessed C code and translates it into either assembly or machine code (often using some other intermediate representation(s) in the middle, like LLVM or GIMPLE).</Item>
        <Item>(Sometimes) <Bold>Assembly</Bold>. If the compilation process produced assembly code instead of machine code, then that assembly code must further be "assembled" (translated) into machine code.</Item>
        <Item><Bold>Linking</Bold>. The previous three steps<Emdash/>preprocessing, compilation, and assembly<Emdash/>happen independently on each translation unit (e.g., each file ending in <Code>.c</Code>) that make up the whole project. Once all those translation units are compiled, they have to be linked together into a single library or executable. They also have to be linked against their dependencies, such as the C standard library. This is all done by the linking step.</Item>
      </Enumerate>

      <P>Preprocessing directives like <Code>#include</Code> are processed by <Code>gcc</Code> during step 1 above. That is, <Code>#include</Code>, and other directives starting with <Code>#</Code>, manipulate the surrounding C code in various ways.</P>

      <P>The <Code>#include</Code> directive specifically is used to load the entire contents of another file. On every system that has an installation of a C standard library implementation (including the ENGR servers), there is a file named <Code>stdio.h</Code> located in a special system directory. The preprocessing directive <Code>{"#include <stdio.h>"}</Code> literally finds that file, copies its entire contents, and effectively replaces the directive itself (<Code>{"#include <stdio.h>"}</Code>) with those contents. In other words, <Code>#include</Code> is essentially an automated copy/paste tool. This makes it useful for importing external code, but it can also (theoretically) be used for other niche purposes. We'll just use it for importing external code.</P>

      <P>(On the ENGR servers, you can find <Code>stdio.h</Code> at the path <Code>/usr/include/stdio.h</Code>).</P>

      <P><Code>stdio.h</Code> is a part of the C standard library, and it provides prototypes and definitions necessary to interface with standard input and output (standard I/O; more on this <Link href="#standard-output">in a bit</Link>). For example, the <Code>printf()</Code> function's prototype is provided by <Code>stdio.h</Code>. <Code>printf()</Code> is used within <Code>hello.c</Code>, so it must include <Code>stdio.h</Code> in order to get access to it.</P>

      <SectionHeading id="main"><Code>main()</Code></SectionHeading>

      <P>Every C program must provide exactly one function named <Code>main()</Code>. <Code>main()</Code> is said to be the <Bold>entry point</Bold> of a C program. In other words, when a C program is executed (after compiling it to an executable, of course), the control flow begins in the <Code>main()</Code> function. (Technically, there might be <It>some</It> code that executes before this, but the bulk of the program starts with <Code>main()</Code>).</P>

      <P>In C, arbitrary statements of code cannot be placed just anywhere. In most cases, they must be placed within some function body or another. This is in contrast to, say, Python, wherein arbitrary code statements can appear at module / global scope. Hopefully it makes sense, then, that there must be some special function in every C program that denotes the start of the program. That's what <Code>main()</Code> is.</P>

      <P>The typical syntax for defining a <Code>main()</Code> function is as follows:</P>

      <SyntaxBlock>{
`int main() {
    <Some code goes here>
}`
      }</SyntaxBlock>

      <P>This syntax will make more sense once we've covered functions. For now, just memorize it.</P>

      <P><Code>main()</Code> is also the exit point of a C program. That's to say, when the <Code>main()</Code> function ends, the program ends. To be clear, this does not mean that you should write your entire program's source code in the body of the <Code>main()</Code> function. Rather, the <Code>main()</Code> function should call other functions, which in turn call other functions, and so on. But, eventually, the <Code>main()</Code> function itself will end, and that denotes the end of the program.</P>

      <P>When an entire process (running program) ends, most operating systems require that the process provide an integer code to the OS that explains the cause of termination. This is referred to as a process's <Bold>exit code</Bold>. In a C program, the exit code is communicated by returning it from the <Code>main()</Code> function. This is why our <Code>main()</Code> function in <Code>hello.c</Code> returns 0:</P>

      <CBlock fileName="hello.c" highlightLines="{5}">{
`#include <stdio.h>

int main() {
        printf("Hello, World!\\n");
        return 0;
}
`
      }</CBlock>

      <P>(Again, we'll cover the exact syntax of functions, including return statements, later.)</P>

      <P>It's convention that an exit code of 0 indicates that the process (program) terminated normally. In other words, no errors occurred that caused the program to end prematurely<Emdash/>the program ran to completion as expected. Moreover, if an error <It>does</It> occur that causes the program to end prematurely, the convention is that the <Code>main()</Code> function should return some nonzero exit code. But there are no specific conventions beyond that. Exactly <It>what</It> nonzero exit code is returned by <Code>main()</Code> in case of an error is completely up to the programmer.</P>

      <P>(It's common to return different exit codes for different kinds of errors. For example, for a given program, perhaps an exit code of 1 means that it failed to open a certain data file that it needs to read data from, whereas an exit code of 2 means that it failed to connect to a server over the internet when it needed to. But for a different program, exit codes of 1 and 2 could mean completely different things.)</P>

      <P>Because the <Code>main()</Code> function is a special function, it also has a special rule: if the <Code>main()</Code> function terminates without ever returning a value, it automatically returns 0. To be clear, the <Code>main()</Code> function is the only function that has this rule. All other functions must be explicit about their return values.</P>

      <P>That's to say, the <Code>return 0;</Code> statement in <Code>hello.c</Code> is actually redundant, so we can optionally remove it:</P>

      <CBlock fileName="hello.c">{
`#include <stdio.h>

int main() {
        printf("Hello, World!\\n");
}
`
      }</CBlock>

      <P>This program still returns an exit code of 0 when it terminates. It just happens automatically.</P>

      <SectionHeading id="comments">Comments</SectionHeading>

      <P>Before moving on, let's talk about code comments. There are two kinds of code comments in C: <Bold>single-line comments</Bold>, and <Bold>multiline comments</Bold>. They mean exactly as they sound. A single-line comment is a code comment that spans a single line of code. A multiline comment is a code comment that spans multiple lines of code.</P>

      <P>To create a single-line comment, simply type <Code>//</Code> somewhere within a line of code. Everything in that line occuring <Ul>after</Ul> the <Code>//</Code> sequence is considered to be part of the code comment and is therefore ignored by <Code>gcc</Code> (in most cases). For example:</P>

      <CBlock fileName="hello.c" highlightLines="{4-7}">{
`#include <stdio.h>

int main() {
        // This is a single-line comment!
        // The purpose of a comment is to explain the adjacent code.
        // The below line of code prints "Hello, World!" to the terminal.
        printf("Hello, World!\\n"); // You can also put a comment here
}
`
      }</CBlock>

      <P>Notice that I wrote <Code>//</Code> at the beginning of each single-line comment. Again, this is because <Code>//</Code> only applies to the remainder of its respective line.</P>

      <P>Suppose I know that I'm going to be writing a very long comment and don't want to have to write <Code>//</Code> at the beginning of every line of code spanned by that comment. Then I might use a multiline comment instead. The syntax is as follows:</P>

      <CBlock copyable={false} showLineNumbers={false}>{
`/* This is a
multiline
comment */`
      }</CBlock>

      <P>That is, multiline comments start with <Code>/*</Code> and end in <Code>*/</Code>. Everything in between is considered to be part of the comment and is therefore ignored by <Code>gcc</Code> (in most cases). For example:</P>

      <CBlock fileName="hello.c" highlightLines="{4-7}">{
`#include <stdio.h>

int main() {
        /* This is a multiline comment!
        The purpose of a comment is to explain the adjacent code.
        The below line of code prints "Hello, World!" to the terminal. */
        printf("Hello, World!\\n"); /* You can also put a comment here */
}
`
      }</CBlock>

      <SectionHeading id="indentation">Indentation</SectionHeading>

      <P>C is not a whitespace-sensitive language. That's to say, there are cases where your code needs whitespace (spaces, tabs, newlines, etc), but in those cases, it mostly doesn't matter <It>what kind</It> of whitespace or <It>how much</It> whitespace you use.</P>

      <P>For example, notice the tabs that indent each line of code within our <Code>main()</Code> function:</P>

      <CBlock fileName="hello.c" highlightLines="{4-7}">{
`#include <stdio.h>

int main() {
        /* This is a multiline comment!
        The purpose of a comment is to explain the adjacent code.
        The below line of code prints "Hello, World!" to the terminal. */
        printf("Hello, World!\\n"); /* You can also put a comment here */
}
`
      }</CBlock>

      <P>If I wanted to, I could get rid of those tabs:</P>

      <CBlock fileName="hello.c" highlightLines="{4-7}">{
`#include <stdio.h>

int main() {
/* This is a multiline comment!
The purpose of a comment is to explain the adjacent code.
The below line of code prints "Hello, World!" to the terminal. */
printf("Hello, World!\\n"); /* You can also put a comment here */
}
`
      }</CBlock>

      <P>This program still works exactly the same as before. This is an example of whitespace that doesn't <It>technically</It> matter.</P>

      <P>However, whitespace matters very much in practice. Not to the computer, necessarily, but to people. Code is hard to read if it isn't properly indented and / or aligned. The above code is already hard to read, but it'd be especially hard to read if it had several other functions before and / or after the <Code>main()</Code> function. In such a case, it'd be extremely difficult to tell where one function ends and the next begins. Proper indentation makes these things visually obvious.</P>

      <SectionHeading id="standard-output">Standard output</SectionHeading>

      <P>Every process (running program) has a few special files associated with it, including its <Bold>standard input</Bold>, <Bold>standard output</Bold>, and <Bold>standard error</Bold> files. In most cases, these files are essentially linked to the terminal. This means that, for example, any text written into a process's standard output file (or its standard error file) is automatically displayed within the terminal (though it's possible to redirect a process's standard files to other locations; we might do that later in the term).</P>

      <P>So, to print text into the terminal, you just need to write that text into the process's standard output file. The <Code>printf()</Code> function does exactly that. It's provided by <Code>stdio.h</Code>, and it stands for "print formatted".</P>

      <P><Code>printf()</Code> is a <Bold>variadic function</Bold>, meaning it can accept an infinite number of arguments. But you must always pass it at least one. The first argument is the format string; it's a string of text that may include zero or more placeholders known as <Bold>format specifiers</Bold>. The remaining arguments are the values that should be inserted into those placeholders.</P>

      <P>In the simplest case, <Code>printf()</Code> is given a single string argument that contains no format specifiers. In such a case, it simply prints that string argument to the terminal. For example:</P>

      <CBlock fileName="hello.c" highlightLines="{4}">{
`#include <stdio.h>

int main() {
        printf("Hello, World!\\n");
}
`
      }</CBlock>

      <P>Important: in C, string literals are enclosed in quotation marks. Single quotes are reserved for <Code>char</Code> literals, which are different.</P>

      <P>The above print statement simply writes <Code>Hello, World!</Code>, followed by a newline character sequence (simulating a press of the enter key), to the process's standard output file (which typically displays it in the terminal).</P>

      <P>But suppose you want to print something other than a string. Perhaps you want to print the result of an arithmetic operation, or the value of a numeric variable. To do this, you must 1) embed format specifiers (placeholders) into the first string argument of <Code>printf()</Code>, and then 2) supply additional arguments to <Code>printf()</Code> to be substituted into those placeholders.</P>

      <P>Some common format specifiers include:</P>

      <Itemize>
        <Item><Code>%d</Code>. This stands for "deicmal", and it's used as a placeholder for values of type <Code>int</Code> (and similar). More on types shortly.</Item>
        <Item><Code>%f</Code>. This stands for "floating point number", and it's used as a placeholder for values of type <Code>float</Code> (and similar), such as <Code>3.14f</Code>.</Item>

        <P>If you want to print a floating point value to just two decimal places, for example, you can use the modified format specifier <Code>%.2f</Code> (and <Code>%.3f</Code> for three decimal places, and so on).</P>
        <Item><Code>%lf</Code>. This stands for "long floating point number", and it's used as a placeholder for values of type <Code>double</Code> (and similar), such as <Code>3.14</Code>.</Item>

        <P>Again, you can modify it to limit decimal places, such as <Code>%.2lf</Code>.</P>
        <Item><Code>%c</Code>. This stands for "character", and it's used as a placeholder for values of type <Code>char</Code>.</Item>
        <Item><Code>%s</Code>. This stands for "string", and it's used as a placeholder for other string values.</Item>
      </Itemize>

      <P>There plenty of others. We might cover some more later.</P>

      <P>Let's see a <Code>printf()</Code> example that uses format specifiers:</P>

      <CBlock fileName="printformatted.c">{
`#include <stdio.h>

int main() {
        printf("The value of 2+2 is: %d\\nThe value of 1.0 / 3.0, rounded to two decimal places, is: %.2lf\\n", 2 + 2, 1.0 / 3.0);
}
`
      }</CBlock>

      <P>Compiling and running the above program produces the following output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -o printformatted printformatted.c 
$ valgrind ./printformatted
==1740276== Memcheck, a memory error detector
==1740276== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1740276== Using Valgrind-3.24.0 and LibVEX; rerun with -h for copyright info
==1740276== Command: ./printformatted
==1740276== 
The value of 2+2 is: 4
The value of 1.0 / 3.0, rounded to two decimal places, is: 0.33
==1740276== 
==1740276== HEAP SUMMARY:
==1740276==     in use at exit: 0 bytes in 0 blocks
==1740276==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==1740276== 
==1740276== All heap blocks were freed -- no leaks are possible
==1740276== 
==1740276== For lists of detected and suppressed errors, rerun with: -s
==1740276== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>(I ran it through valgrind because I run <It>all</It> of my programs through Valgrind whenever I'm developing them.)</P>

      <P>Notice that I provided three arguments to <Code>printf()</Code> this time:</P>

      <Enumerate listStyleType="decimal">
        <Item><Code>"The value of 2+2 is: %d\nThe value of 1.0 / 3.0, rounded to two decimal places, is: %.2lf\n"</Code>. This is the format string. It has two placeholders (format specifiers): <Code>%d</Code>, and <Code>%.2lf</Code>.</Item>
        <Item><Code>2 + 2</Code></Item>
        <Item><Code>1.0 / 3.0</Code></Item>
      </Enumerate>

      <P>The format string has two format specifiers, which is why I also passed two additional arguments to <Code>printf()</Code><Emdash/>one to substitute into each of those format specifiers. The additional arguments to <Code>printf()</Code> are substituted into the format specifiers in left-to-right order. The first format specifier is <Code>%d</Code>, and the first argument after the format string is <Code>2 + 2</Code>, so <Code>2 + 2</Code> is evaluated as <Code>4</Code>, and <Code>4</Code> is substituted into the <Code>%d</Code> placeholder. This is why the program prints <Code>"The value of 2+2 is: 4"</Code>. Similarly, the second argument (<Code>1.0 / 3.0</Code>) is evaluated, and its value is substituted into the second format specifier (<Code>%.2lf</Code>, which rounds it to two decimal places). This is why the program prints <Code>"The value of 1.0 / 3.0, rounded to two decimal places, is: 0.33"</Code>.</P>

      <P>Because each argument after the format string corresponds to a format specifier within the format string, the number of arguments to <Code>printf()</Code> after the format string <Ul>must</Ul> match the number of format specifiers within the format string. Moreover, the types of the arguments must be compatible with their corresponding format specifiers. For example, the <Code>%d</Code> format specifier is a placeholder for an integer (as I explained earlier), which is why I used it as the format specifier for the integer argument <Code>2 + 2</Code>.</P>

      <P>If you use the wrong format specifiers, such as <Code>%f</Code> for an integer argument or <Code>%d</Code> for a floating point argument, it will likely print the wrong value to the terminal (technically, it results in <Bold>undefined behavior</Bold>, which we'll discuss later in the term).</P>

      <P><Code>printf()</Code> does not always <It>immediately</It> print the specified text to the terminal. Rather, it writes the specified text into C's internal standard output buffer. Only when that buffer is <Ul>flushed</Ul> will it be printed to the terminal.</P>

      <P>By default, standard output is line-buffered, meaning that whenever a newline character sequence (<Code>"\n"</Code>) is written to the standard output buffer (e.g., via <Code>printf()</Code>), all the text in the buffer leading up to it will be flushed and displayed in the terminal immediately.</P>

      <P>But sometimes you want to display text in the terminal without putting a newline character sequence at the end. In such a case, you may have to manually flush the buffer immediately after the <Code>prinf()</Code> call. You can do this like so:</P>

      <SyntaxBlock>{
`fflush(stdout);`
      }</SyntaxBlock>

      <P>For example:</P>

      <CBlock showLineNumbers={false}>{
`printf("This line of text does not have a newline sequence at the end.");
fflush(stdout); // Flush standard output to display the printed text immediately
`
      }</CBlock>

      <P>(The <Code>fflush()</Code> function and <Code>stdout</Code> macro are provided by <Code>stdio.h</Code>.)</P>

      <P>Note that the standard output buffer is also automatically flushed the moment the program terminates (and in some other cases). So if the very last thing your program does is write some text to standard output, you technically don't have to manually flush the buffer, even if there's no newline character sequence at the end of the printed text. It'll be flushed promptly when the program ends, one way or another.</P>

      <SectionHeading id="breaking-up-lines">Breaking up lines</SectionHeading>

      <P>Before moving on, I should mention that the previous example had a very long line of code:</P>

      <CBlock showLineNumbers={false}>{
`printf("The value of 2+2 is: %d\\nThe value of 1.0 / 3.0, rounded to two decimal places, is: %.2lf\\n", 2 + 2, 1.0 / 3.0);`
      }</CBlock>

      <P>You should avoid having very long lines of code in your C programs. They're quite hard to read.</P>

      <P>There are various ways to break up long lines of code. If it's a function call with many arguments, you can put each argument in its own line:</P>

      <CBlock showLineNumbers={false}>{
`printf(
        "The value of 2+2 is: %d\\nThe value of 1.0 / 3.0, rounded to two decimal places, is: %.2lf\\n",
        2 + 2,
        1.0 / 3.0
);`
      }</CBlock>

      <P>(Notice that I additionally indented the arguments over by one tab of indentation. This makes it clear that they're a part of an enclosing function call rather than their own, independent statements.)</P>

      <P>That helped a little bit, but the format string is quite long by itself. We can do better. In C, string literals (text written in quotation marks) can be broken up trivially: just write it as two or more string literals, each on their own adjacent lines of code (with no commas between them, nor any other special characters). The compiler automatically concatenates adjacent C string literals into one big literal:</P>

      <CBlock showLineNumbers={false}>{
`printf(
        "The value of 2+2 is: %d\\nThe value of 1.0 / 3.0, "
                "rounded to two decimal places, is: %.2lf\\n",
        2 + 2,
        1.0 / 3.0
);
`
      }</CBlock>

      <P>(Notice that I indented the second literal by an extra tab of indentation. This makes it clear that it's a continuation of a single string argument rather than its own, independent string argument. Also notice that there's still a comma after the second string literal, which separates it from the subsequent argument, <Code>2 + 2</Code>.)</P>

      <SectionHeading id="types-expressions-and-operators">Types, expressions, and operators</SectionHeading>

      <P>An <Bold>expression</Bold> is a piece of code with a <Bold>type</Bold> and a <Bold>value</Bold>. A type, or <Bold>data type</Bold>, is simply a kind of data. A value is simply the data itself (e.g., the number 3 is an integer value, and the word "Hello" is a string value).</P>

      <P>There are various <Bold>primitive types</Bold> in C. These types are very simple and built into the language. Some basic primitive types include:</P>

      <Itemize>
        <Item><Code>int</Code>. This data type represents integer values (whole numbers).</Item>
        <Item><Code>float</Code>. This data type represents floating point values (i.e., numbers with decimal points in them).</Item>
        <Item><Code>long int</Code>, or simply <Code>long</Code>. This data type is similar to <Code>int</Code>, but it's usually capable of representing larger (i.e., greater magnitude) values. The tradeoff is that it usually consumes more memory than the <Code>int</Code> data type.</Item>
        <Item><Code>double</Code>. This data type is similar to <Code>float</Code>, but it's usually capable of representing larger (i.e., greater magnitude) values and with greater precision (i.e., more decimal places).</Item>
        <Item><Code>char</Code>. This data type represents a single character.</Item>
      </Itemize>

      <P>The simplest kinds of expressions are <Bold>literals</Bold>. A literal is just a hard-coded value. You can create literals for each of the primitive types that I just mentioned:</P>

      <Itemize>
        <Item><Code>10</Code>, <Code>-142</Code>, and <Code>0</Code> are all literals of type <Code>int</Code>.</Item>
        <Item><Code>3.14</Code>, <Code>-4.5</Code>, <Code>0.0</Code>, <Code>.1</Code>, and even <Code>3.</Code> are all considered to be literals of type <Ul><Code>double</Code></Ul>. Basically, any plainly written number with a decimal point in it is a <Code>double</Code> literal.</Item>
        <Item><Code>long</Code> literals look the same as <Code>int</Code> literals, except they have an <Code>l</Code> (that's a lowercase L) at the end of them. For example: <Code>10l</Code>, <Code>-142l</Code>, and <Code>0l</Code> are all examples of <Code>long</Code> literals.</Item>
        <Item><Code>float</Code> literals look the same as <Code>double</Code> literals, except they have an <Code>f</Code> at the end of them. For example, <Code>3.14f</Code>, <Code>-4.5f</Code>, <Code>0.0f</Code>, <Code>.1f</Code>, and <Code>3.f</Code> are all examples of <Code>float</Code> literals.</Item>
        <Item><Code>char</Code> literals are enclosed in single quotes (apostrophes). For example: <Code>'a'</Code>, <Code>'D'</Code>, <Code>'4'</Code>, and <Code>'@'</Code> are all examples of <Code>char</Code> literals. Importantly, there must be exactly one character between the apostrophes (or a single-character escape sequence, like <Code>'\n'</Code>).</Item>
      </Itemize>

      <P>(There are some exceptions to the above, but this understanding is good enough.)</P>

      <P>You can also create string literals (i.e., hard-coded strings). As it turns out, there is no primitive "string" data type in C. C represents strings in rather complicated ways. We'll talk about that more later. But for now, just understand that a string literal is any sequence of zero or more characters enclosed in quotation marks, such as <Code>"Hello, World!"</Code>, or <Code>"pizza"</Code>, or <Code>"3.14"</Code>, or even <Code>""</Code> (the empty string).</P>

      <P>We've already seen several examples of literals. Let me jog your memory:</P>

      <CBlock fileName="printformatted.c" highlightLines="{5-8}">{
`#include <stdio.h>

int main() {
        printf(
                "The value of 2+2 is: %d\\nThe value of 1.0 / 3.0, "
                        "rounded to two decimal places, is: %.2lf\\n",
                2 + 2,
                1.0 / 3.0
        );
}
`
      }</CBlock>

      <P>In the above highlighed code, the first entire argument is one big string literal (or, in some sense, two string literals that the compiler automatically concatenates together). The second argument, <Code>2 + 2</Code>, is a larger expression that consists of two <Code>int</Code> literals: the first <Code>2</Code>, and the second <Code>2</Code>. The third argument, <Code>1.0 / 3.0</Code>, is a larger expression that consists of two <Code>double</Code> literals: <Code>1.0</Code>, and <Code>3.0</Code>.</P>

      <P>Of course, you can also print the values of literals by themselves:</P>

      <CBlock fileName="printliterals.c">{
`#include <stdio.h>

int main() {
        // Prints 3.140000 (passed as a float)
        printf("%f\\n", 3.14f);

        // Prints 3.14 (passed as a float) to just two decimal places
        printf("%.2f\\n", 3.14f);

        // Prints 3.140000 (passed as a double)
        // (doubles have more precision than floats, but it still only
        // prints six decimal places on the ENGR servers. This is just
        // the default printing behavior for both floats and doubles.)
        printf("%lf\\n", 3.14);

        // Prints -100 (passed as an int)
        printf("%d\\n", -100);

        // Prints 728 (passed as a long)
        printf("%ld\\n", 728l);
}
`
      }</CBlock>

      <P>Running the above program produces the following output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -o printliterals printliterals.c
$ valgrind ./printliterals 
==2159281== Memcheck, a memory error detector
==2159281== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2159281== Using Valgrind-3.24.0 and LibVEX; rerun with -h for copyright info
==2159281== Command: ./printliterals
==2159281== 
3.140000
3.14
3.140000
-100
728
==2159281== 
==2159281== HEAP SUMMARY:
==2159281==     in use at exit: 0 bytes in 0 blocks
==2159281==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==2159281== 
==2159281== All heap blocks were freed -- no leaks are possible
==2159281== 
==2159281== For lists of detected and suppressed errors, rerun with: -s
==2159281== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Let's talk about operators more formally. C supports many arithmetic operators, including:</P>

      <Itemize>
        <Item><Code>+</Code> (addition)</Item>
        <Item><Code>-</Code> (subtraction)</Item>
        <Item><Code>*</Code> (multiplication)</Item>
        <Item><Code>/</Code> (division)</Item>
        <Item><Code>%</Code> (modulo, which is essentially remainder after integer division)</Item>
      </Itemize>

      <P>There are some others as well that we won't talk about right now.</P>

      <P>Most of these operators work as you'd expect. However, here are some important notes:</P>

      <Itemize>
        <Item>PEMDAS applies as you'd expect. And yes, you can use parentheses to control order of operations. For example, <Code>printf("%d\n", 3 * 4 + 5)</Code> prints <Code>17</Code> to the terminal, but <Code>printf("%d\n", 3 * (4 + 5))</Code> prints <Code>27</Code>.</Item>
        <Item>Dividing two integers results in so-called <Bold>integer division</Bold>. Basically, the output is truncated (rounded toward zero). For example, <Code>3</Code> is an <Code>int</Code>, and <Code>4</Code> is an <Code>int</Code>, but <Code>3 / 4</Code> is also considered to be an <Code>int</Code> by the C compiler. Specifically, it's an <Code>int</Code> with value <Code>0</Code> (in "real life", 3 / 4 would be 0.75, but integer division means that C always truncates / rounds these quotients toward zero<Emdash/>positive quotients are rounded down, and negative quotients are rounded up). If you want to avoid this rounding / truncating behavior, just make sure that at least one of the two operands is a float or double (e.g., <Code>3.0 / 4</Code>, or <Code>3 / 4.0</Code>, or <Code>3.0 / 4.0</Code>).</Item>

        <P>(If you're dividing integer variables and want to avoid integer division, you can employ type casting.)</P>
      </Itemize>

      <P>Note that C does not have an operator for exponentiation. To raise a base to the power of an exponent, you must use the <Code>pow()</Code> function, which is provided by the standard library header file <Code>cmath.h</Code>. Importantly, this function's return type is <Code>double</Code>, so if you want to print its return value directly, you should use a <Code>%lf</Code> format specifier (using <Code>%d</Code> will not work, even if the arguments are integers):</P>

      <CBlock fileName="powexample.c">{
`#include <stdio.h>
#include <math.h> // Needed to use the pow() function

int main() {
        // Compute 2 to the power of 5 and print the result
        printf("%f\\n", pow(2, 5)); // Prints 32.000000
}
`
      }</CBlock>

      <P>Running the above program produces the following output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -o powexample powexample.c
$ valgrind ./powexample 
==2163896== Memcheck, a memory error detector
==2163896== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2163896== Using Valgrind-3.24.0 and LibVEX; rerun with -h for copyright info
==2163896== Command: ./powexample
==2163896== 
32.000000
==2163896== 
==2163896== HEAP SUMMARY:
==2163896==     in use at exit: 0 bytes in 0 blocks
==2163896==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==2163896== 
==2163896== All heap blocks were freed -- no leaks are possible
==2163896== 
==2163896== For lists of detected and suppressed errors, rerun with: -s
==2163896== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <SectionHeading id="statements">Statements and semicolons</SectionHeading>

      <P>A <Bold>statement</Bold> is, very loosely, a piece of code that <It>does something</It>. Every C program is made up of a series of statements.</P>

      <P>A single statement may be made up of many expressions (and each expression may be made up of many smaller expressions). For example, <Code>x = y + z;</Code> is a statement, and it contains many smaller expressions within it: <Code>x</Code>, <Code>y</Code>, <Code>z</Code>, and <Code>y + z</Code>.</P>

      <P>(Technically, the entire statement <Code>x = y + z</Code> is <It>also</It>, itself, an expression; it's a piece of code with a type and a value. More on that <Link href="#automatic-variables">shortly</Link>.)</P>

      <P>A statement may also be a function call, such as <Code>printf("Hello, World!\n");</Code>.</P>

      <P>In some cases, a group of several statements can be referred to as a statement as well. For example, an if statement is a group of statements that execute if and only if a certain condition is satisfied. More on if statements <Link href="#if-statements">later</Link>.</P>

      <P>In C, most statements must be terminated with a semicolon (<Code>;</Code>). If you think of statements in C as being like sentences in English, then semicolons in C are similar to periods in English.</P>

      <P>Because statements are terminated with semicolons, a single line of C code is technically allowed to contain multiple statements. So long as there's a semicolon between each statement, the compiler is capable of distinguishing them during parsing. For example: <Code>printf('Hi'); printf(' Bye\n');</Code>. However, it's typically considered bad code style to put multiple statements in a single line of code. In most cases, each line of code should contain at most one statement. But there are occasional exceptions to this rule of thumb, such as <Link href="#for-loops">for loop headers</Link>.</P>

      <SectionHeading id="declaring-and-initializing-automatic-variables">Declaring and initializing automatic variables</SectionHeading>

      <P>As you hopefully know, a <Bold>variable</Bold> is a named location in memory wherein a value can be stored. In C, variables can be stored in different sections of memory for different amounts of time depending on how and where they're created. In the most basic case, variables are stored on the stack and have automatic storage duration. We'll discuss what that means later in the term. For now, just know that I'll be referring to these basic variables as <Bold>automatic variables</Bold> (because of their automatic storage duration).</P>

      <P>Before a variable can be used, in must be <Bold>declared</Bold> (i.e., created). To declare an automatic variable, write out its data type followed by its name. A variable declaration is a kind of statement, so it must be terminated with a semicolon. For example:</P>

      <CBlock fileName="variables.c">{
`int main() {
        // Declare an int variable named number_of_strawberries
        int number_of_strawberries;

        // Declare a float variable named pi
        float pi;

        // More examples
        long int number_of_atoms;
        double more_precise_pi;
        char first_name_initial;
}
`
      }</CBlock>

      <P>Once a variable has been declared, it can be assigned a value. This is done with the assignment operator (<Code>=</Code>). Place the variable on the left, and an expression on the right. Most assignment operations are complete statements, so they must be terminated with a semicolon. When the program reaches the assignment operation, the computer will evaluate the entire expression on the right to produce a value, and then it will store that value in the variable on the left. Importantly, the type of the expression on the right must be compatible with the type of the variable on the left.</P>

      <P>For example:</P>

      <CBlock fileName="variables.c" highlightLines="{5-7,9-10,17,20,23}">{
`int main() {
        // Declare an int variable named number_of_strawberries
        int number_of_strawberries;

        // Now we can assign number_of_strawberries a value. It's
        // an int variable, so we assign it an int value.
        number_of_strawberries = 5;

        // Declare a float variable named pi
        float pi;

        // Assign pi a float value
        pi = 3.141592f;

        // More examples
        long int number_of_atoms;
        number_of_atoms = 99999999999l;

        double more_precise_pi;
        more_precise_pi = 3.141592653589;

        char first_name_initial;
        first_name_initial = 'A';
}
`
      }</CBlock>

      <P>To <Bold>initialize</Bold> a variable means to assign it a value for the first time. The above highlighted lines of code are examples of variable initializations.</P>

      <P>Once a variable has been assigned a value, it can be referenced (i.e., used) in expressions. For example:</P>

      <CBlock fileName="variables.c" highlightLines="{9-10,18-19}">{
`#include <stdio.h>

int main() {
        // Declare an int variable named number_of_strawberries
        int number_of_strawberries;

        // Now we can assign number_of_strawberries a value. It's
        // an int variable, so we assign it an int value.
        number_of_strawberries = 5;

        // Print the value of number_of_strawberries (5)
        printf("%d\\n", number_of_strawberries);

        // Declare a float variable named pi
        float pi;

        // Assign pi a float value
        pi = 3.141592f;

        // Print the value of pi (3.141592)
        printf("%f\\n", pi);

        // More examples
        long int number_of_atoms;
        number_of_atoms = 99999999999l;

        double more_precise_pi;
        more_precise_pi = 3.141592653589;

        char first_name_initial;
        first_name_initial = 'A';
}
`
      }</CBlock>

      <P>Running the above program produces the following output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -o variables variables.c 
$ valgrind ./variables 
==1634568== Memcheck, a memory error detector
==1634568== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1634568== Using Valgrind-3.24.0 and LibVEX; rerun with -h for copyright info
==1634568== Command: ./variables
==1634568== 
5
3.141592
==1634568== 
==1634568== HEAP SUMMARY:
==1634568==     in use at exit: 0 bytes in 0 blocks
==1634568==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==1634568== 
==1634568== All heap blocks were freed -- no leaks are possible
==1634568== 
==1634568== For lists of detected and suppressed errors, rerun with: -s
==1634568== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <SectionHeading id="uninitialized-values">Uninitialized values</SectionHeading>

      <P>Prior to declaring a variable, it cannot be referenced (used). Attempting to do so is a syntax error, and <Code>gcc</Code> will fail to build the program:</P>

      <CBlock fileName="undeclaredvariables.c">{
`#include <stdio.h>

int main() {
        // x has not been declared yet, so it can't be referenced.
        // This is a syntax error.
        printf("%d\\n", x);

        int x;
        x = 5;
}
`
      }</CBlock>

      <P>Attempting to build the above program produces the following error:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -o undeclaredvariables undeclaredvariables.c 
undeclaredvariables.c: In function ‘main’:
undeclaredvariables.c:6:24: error: ‘x’ undeclared (first use in this function)
    6 |         printf("%d\\n", x);
      |                        ^
undeclaredvariables.c:6:24: note: each undeclared identifier is reported only once for each function it appears in
`
      }</TerminalBlock>

      <P>Technically, it's syntactically valid to reference a variable anywhere within its scope below its point of declaration. However, there's an <Ul>extremely important</Ul> thing that you need to understand about variables in C: although it's <It>syntactically</It> valid to reference a variable once it has been declared, its value is <Bold>undefined</Bold> until you initialize it. And in most cases, using an uninitialized (but declared) variable invokes <Bold>undefined behavior</Bold>. For example:</P>

      <CBlock fileName="uninitializedvariables.c" highlightLines="{7-10}">{
`#include <stdio.h>

int main() {
        // Declare an int variable named number_of_strawberries
        int number_of_strawberries;

        // Now that number_of_strawberries is declared, it's
        // syntactically legal to reference it. However, it hasn't
        // been initialized yet, so this is UNDEFINED BEHAVIOR
        printf("%d\\n", number_of_strawberries);

        // Now we initialize it
        number_of_strawberries = 5;

        // Now it's syntactically legal AND well-defined to reference
        // number_of_strawberries
        printf("%d\\n", number_of_strawberries);
}
`
      }</CBlock>

      <P>Undefined behavior is extremely problematic. Officially, a program that invokes undefined behavior could do <Ul>anything</Ul> when you run it. That is, according to the C language standard, there's no guarantee as to what the above program will do. It may do different things depending on what operating system it's compiled and executed on, what version and implementation of the C standard library is installed, what bytes happen to exist in the program's allotted physical memory pages at the time that it's executed, and more. Moreover, certain kinds of undefined behavior can be incredibly dangerous, potentially exposing the program to serious security vulnerabilities like arbitrary code execution (this particular instance of undefined behavior typically isn't all that dangerous, but there's still no way of knowing for sure what it will do).</P>

      <P>What's worse, undefined behavior can be hard to detect and diagnose. Because the above code is syntactically legal, the compiler will not issue any warnings or errors about it:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -o uninitializedvariables uninitializedvariables.c 
$ 
`
      }</TerminalBlock>

      <P>Indeed, it compiles just fine.</P>

      <P>And in a lot of cases, a statement that invokes undefined behavior will <It>seem</It> to do something reasonable, perhaps even working as intended, when the program is executed:</P>

      <TerminalBlock copyable={false}>{
`$ ./uninitializedvariables
0
5
`
      }</TerminalBlock>

      <P>In this case, it printed <Code>0</Code> to the terminal (and <Code>5</Code> after initializing the variable as such). And perhaps my intention was to initialize <Code>number_of_strawberries</Code> to <Code>0</Code>. So it'd be very easy for me to fool myself into believing that this program is written correctly.</P>

      <P>But undefined behavior is exactly that<Emdash/>undefined. One day, I may run this program and find that it does something completely different. In the most likely scenario, <Code>number_of_strawberries</Code> might suddenly be something other than <Code>0</Code>, so it would print a different number to the terminal. That wouldn't be disastrous in this scenario, but suppose I used <Code>number_of_strawberries</Code> in various computations. If all those computations assumed that <Code>number_of_strawberries</Code> stored the value <Code>0</Code>, then they'd suddenly all be incorrect (despite being correct when I've run it in the past). These kinds of bugs can be very subtle.</P>

      <P>(Again, other kinds of undefined behavior, such as buffer overflows and use-after-free errors, can be much more dangerous.)</P>

      <P>So, how do you detect and diagnose undefined behavior? For this, Valgrind is your best friend. Dynamic analysis tools like Valgrind (and gdb, and others) can often detect undefined behavior at runtime when they occur:</P>

      <TerminalBlock copyable={false} highlightLines="{7-10}">{
`$ valgrind ./uninitializedvariables 
==1686268== Memcheck, a memory error detector
==1686268== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1686268== Using Valgrind-3.24.0 and LibVEX; rerun with -h for copyright info
==1686268== Command: ./uninitializedvariables
==1686268== 
==1686268== Conditional jump or move depends on uninitialised value(s)
==1686268==    at 0x48D5813: __vfprintf_internal (in /usr/lib64/libc.so.6)
==1686268==    by 0x48CAA5E: printf (in /usr/lib64/libc.so.6)
==1686268==    by 0x401141: main (uninitializedvariables.c:10)
==1686268== 
==1686268== Use of uninitialised value of size 8
==1686268==    at 0x48C9E6B: _itoa_word (in /usr/lib64/libc.so.6)
==1686268==    by 0x48D5132: __vfprintf_internal (in /usr/lib64/libc.so.6)
==1686268==    by 0x48CAA5E: printf (in /usr/lib64/libc.so.6)
==1686268==    by 0x401141: main (uninitializedvariables.c:10)
==1686268== 
==1686268== Conditional jump or move depends on uninitialised value(s)
==1686268==    at 0x48C9E7C: _itoa_word (in /usr/lib64/libc.so.6)
==1686268==    by 0x48D5132: __vfprintf_internal (in /usr/lib64/libc.so.6)
==1686268==    by 0x48CAA5E: printf (in /usr/lib64/libc.so.6)
==1686268==    by 0x401141: main (uninitializedvariables.c:10)
==1686268== 
==1686268== Conditional jump or move depends on uninitialised value(s)
==1686268==    at 0x48D5DFB: __vfprintf_internal (in /usr/lib64/libc.so.6)
==1686268==    by 0x48CAA5E: printf (in /usr/lib64/libc.so.6)
==1686268==    by 0x401141: main (uninitializedvariables.c:10)
==1686268== 
==1686268== Conditional jump or move depends on uninitialised value(s)
==1686268==    at 0x48D524C: __vfprintf_internal (in /usr/lib64/libc.so.6)
==1686268==    by 0x48CAA5E: printf (in /usr/lib64/libc.so.6)
==1686268==    by 0x401141: main (uninitializedvariables.c:10)
==1686268== 
0
5
==1686268== 
==1686268== HEAP SUMMARY:
==1686268==     in use at exit: 0 bytes in 0 blocks
==1686268==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==1686268== 
==1686268== All heap blocks were freed -- no leaks are possible
==1686268== 
==1686268== Use --track-origins=yes to see where uninitialised values come from
==1686268== For lists of detected and suppressed errors, rerun with: -s
==1686268== ERROR SUMMARY: 5 errors from 5 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Notice the error messages. When Valgrind prints multiple error messages, you should generally start your diagnosis with the top one. The lower-down error messages can often be caused by the higher-up ones, so starting anywhere other than at the top can send you on a wild goose chase.</P>

      <P>The top error message says "Conditional jump or move depends on uninitialised value(s)", followed by a <Bold>stack trace</Bold>. A stack trace is a trace of the call stack (i.e., the function that was being executed at the time of the error, as well as the function that called it, and the function that called <It>that</It> function, and so on, all the way down to <Code>main()</Code>). The error occurred in some function named <Code>__vfprintf_internal</Code> within the C standard library (<Code>/usr/lib64/libc.so.6</Code> is a shared object library for the C standard library implementation). That function was called by the <Code>printf()</Code>, also inside the C standard library. But <It>that</It> function was called by <Code>main()</Code>, as indicated by this part of the error message:</P>

      <P><Code>by 0x401141: main (uninitializedvariables.c:10)</Code></P>

      <P>Actually, that part of the error message gives us a whole lot of information. <Code>main</Code> is the name of the function that was being executed when the error occurred; <Code>uninitializedvariables.c</Code> is the name of the file that contains the <Code>main</Code> function; and line 10 (as indicated by the <Code>:10</Code> part of the message) is the exact line of code within <Code>main</Code> that was being executed when the error occurred. Indeed, if we look at line 10 of <Code>uninitializedvariables.c</Code>, we see the issue:</P>

      <CBlock fileName="uninitializedvariables.c" highlightLines="{10}">{
`#include <stdio.h>

int main() {
        // Declare an int variable named number_of_strawberries
        int number_of_strawberries;

        // Now that number_of_strawberries is declared, it's
        // syntactically legal to reference it. However, it hasn't
        // been initialized yet, so this is UNDEFINED BEHAVIOR
        printf("%d\\n", number_of_strawberries);

        // Now we initialize it
        number_of_strawberries = 5;

        // Now it's syntactically legal AND well-defined to reference
        // number_of_strawberries
        printf("%d\\n", number_of_strawberries);
}
`
      }</CBlock>

      <P>This is where we're trying to reference an uninitialized (but declared) variable. And this is precisely what the error message in Valgrind says (<Code>Conditional jump or move depends on uninitialized value(s)</Code>)</P>

      <P>This is why you should always run your programs through Valgrind or another dynamic analysis tool when you're developing and / or debugging them. They can detect and trace certain errors at runtime that the compiler can't catch at build time.</P>

      <P>But understand this: Valgrind can only detect undefined behavior <Ul>when it occurs</Ul> at runtime. For example, if the undefined behavior is invoked within an if statement's body, then Valgrind will only detect it if that if statement actually triggers during the program's execution. And, sometimes, Valgrind fails to detect undefined behavior even when it <It>does</It> occur. So whenever writing C programs, you should be extremely careful and follow good practices to avoid undefined behavior.</P>

      <P>Before moving on, let's add one more debugging tool to our arsenal. I said that <Code>gcc</Code> can't catch undefined behavior. That's not <It>always</It> true. In certain more "obvious" cases of it, <Code>gcc</Code> is capable of detecting it. In fact, this is one such case. In order to get <Code>gcc</Code> to detect our mistake and print a warning message about it, we have to supply the <Code>-Wall</Code> flag to <Code>gcc</Code> when we run it. This stands for "warn all" and enables more sensitive warning behavior:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o uninitializedvariables uninitializedvariables.c
uninitializedvariables.c: In function ‘main’:
uninitializedvariables.c:10:9: warning: ‘number_of_strawberries’ is used uninitialized [-Wuninitialized]
   10 |         printf("%d\\n", number_of_strawberries);
      |         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`
      }</TerminalBlock>

      <P>(<Code>gcc</Code> supports all sorts of other flags that can enable various kinds of warnings and error detection. But we'll just stick with <Code>-Wall</Code>.)</P>

      <P>This is an incredibly useful tool. As I said, dynamic analysis tools like Valgrind can only detect undefined behavior when they occur at runtime. But <Code>-Wall</Code> (and similar flags) provides a way of catching some instances of undefined behavior before running the program at all, regardless of where they're located.</P>

      <P>(If you get tired of typing <Code>-g</Code> and <Code>-Wall</Code> all the time, you could create an alias in your <Code>~/.bashrc</Code> file, such as <Code>alias gcc='gcc -g -Wall'</Code>, or <Code>alias gcc-debug='gcc -g -Wall'</Code> if you don't want to shadow <Code>gcc</Code>. Feel free to Google how to do this, or ask ChatGPT, or stop by office hours.)</P>

      <SectionHeading id="more-on-variables">More on variables</SectionHeading>

      <P>Variable declaration and initialization can be combined into a single compound statement, like so:</P>

      <CBlock fileName="variables.c" highlightLines="{4-6,11-13,18-21}">{
`#include <stdio.h>

int main() {
        // Declare an int variable named number_of_strawberries
        // and initialize it to 5 all in one statement
        int number_of_strawberries = 5;

        // Print the value of number_of_strawberries (5)
        printf("%d\\n", number_of_strawberries);

        // Declare a float variable named pi and initialize it to
        // 3.141592f all in one statement
        float pi = 3.141592f;

        // Print the value of pi (3.141592)
        printf("%f\\n", pi);

        // More examples
        long int number_of_atoms = 99999999999l;
        double more_precise_pi = 3.141592653589;
        char first_name_initial = 'A';
}
`
      }</CBlock>

      <P>Because use of declared but uninitialized variables invokes undefined behavior, it's good practice to minimize the duration for which variables are declared but uninitialized. By combining a variable's declaration with its initialization, you guarantee that the variable is <It>never</It> uninitialized. So a reasonable rule of thumb might be to prefer declaring and initializing a variable in a single statement instead of two. But there are plenty of exceptions to this rule of thumb.</P>

      <P>Variables can, of course, be modified after they're initialized. The syntax is the same as that of initialization: just use the assignment operator. For example:</P>

      <CBlock fileName="variables.c" highlightLines="{11-12,17-18}">{
`#include <stdio.h>

int main() {
        // Declare an int variable named number_of_strawberries
        // and initialize it to 5 all in one statement
        int number_of_strawberries = 5;

        // Print the value of number_of_strawberries (5)
        printf("%d\\n", number_of_strawberries);

        // Change the value stored in number_of_strawberries to 10
        number_of_strawberries = 10;

        // This now prints 10
        printf("%d\\n", number_of_strawberries);

        // Increase number_of_strawberries by 1
        number_of_strawberries = number_of_strawberries + 1;

        // Prints 11
        printf("%d\\n", number_of_strawberries);
}
`
      }</CBlock>

      <P>There are various shorthand operators for modifying the value of a variable.</P>

      <P>To increase the value of a numeric variable <Code>my_variable</Code>by some amount <Code>x</Code>, you can write <Code>my_variable += x</Code>. For example, <Code>number_of_strawberries += 1</Code> is equivalent to <Code>number_of_strawberries = number_of_strawberries + 1</Code>.</P>

      <P>There are also analogous <Code>-=</Code>, <Code>*=</Code>, <Code>/=</Code>, and <Code>%=</Code> shorthand operators for subtraction, multiplication, division, and modulo, respectively.</P>

      <P>There are also increment and decrement operators. Suppose you have a variable named <Code>x</Code>. Then <Code>++x;</Code> increments <Code>x</Code> by 1. That is, <Code>++x;</Code> is equivalent to <Code>x += 1;</Code>, which is equivalent to <Code>x = x + 1;</Code>.</P>

      <P>But there's a bit more nuance than that. There are actually two increment operators that can increment a variable <Code>x</Code> by 1: <Code>++x</Code>, and <Code>x++</Code>. The former is referred to as the "pre-increment" operator, and the latter is the "post-increment" operator. The difference is in how they're evaluated when used as expressions. In essence, a pre-increment operation increments the variable and <It>then</It> evaluates as an expression, whereas a post-increment operation evaluates as an expression and <It>then</It> increments the variable.</P>

      <P>For example:</P>

      <CBlock fileName="increment.c">{
`#include <stdio.h>

int main() {
        int my_variable = 0;

        // Used on their own, my_variable++ and ++my_variable do the
        // same thing
        my_variable++; // Increments my_variable to 1
        ++my_variable; // Increments my_variable to 2

        // But when used as expressions, they're different

        // This increments my_variable and THEN prints its (new) value.
        // So this increments my_variable to 3 and then prints 3.
        printf("%d\\n", ++my_variable);

        // This evaluates to my_variable's old value (3) and THEN
        // increments it. So it increments my_variable to 4, but it
        // prints 3.
        printf("%d\\n", my_variable++);
}
`
      }</CBlock>
      
      <P>Running the above program produces the following output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o increment increment.c 
$ valgrind ./increment 
==1715598== Memcheck, a memory error detector
==1715598== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1715598== Using Valgrind-3.24.0 and LibVEX; rerun with -h for copyright info
==1715598== Command: ./increment
==1715598== 
3
3
==1715598== 
==1715598== HEAP SUMMARY:
==1715598==     in use at exit: 0 bytes in 0 blocks
==1715598==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==1715598== 
==1715598== All heap blocks were freed -- no leaks are possible
==1715598== 
==1715598== For lists of detected and suppressed errors, rerun with: -s
==1715598== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Technically, the way the post-increment operator works is that it increments the variable and then "returns" (evaluates to) a <It>copy</It> of the variable's previous value. And technically, this means that the post-increment operator can theoretically be a tiny bit slower and use more memory than the pre-increment operator; it has to conduct some additional work and use some additional memory to create the copy of the old value.</P>

      <P>(In practice, the compiler can usually optimize post-increment operations to be just as fast, and use the same amount of memory, as pre-increment operations, especially in cases where the two are semantically equivalent. This discussion is a bigger deal (but still mostly bikeshedding) in languages like C++ where you can overload these operators and apply them to larger objects like iterators).</P>

      <P>And this might surprise you, but regular assignment operations can also be used as expressions. When used as an expression, an assignment operation assigns the specified value to the specified variable, and then it's evaluated as the value that was just assigned (or, more rigorously, it's evaluated as a reference to the variable to which the value was just assigned). For example:</P>

      <CBlock fileName="assignmentasexpression.c">{
`#include <stdio.h>

int main() {
        int x = 100;

        // This changes x to 20 and then prints 20
        printf("%d\\n", x = 20);
}
`
      }</CBlock>

      <P>Running the above program produces the following output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o assignmentasexpression assignmentasexpression.c
$ valgrind ./assignmentasexpression 
==1715984== Memcheck, a memory error detector
==1715984== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1715984== Using Valgrind-3.24.0 and LibVEX; rerun with -h for copyright info
==1715984== Command: ./assignmentasexpression
==1715984== 
20
==1715984== 
==1715984== HEAP SUMMARY:
==1715984==     in use at exit: 0 bytes in 0 blocks
==1715984==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==1715984== 
==1715984== All heap blocks were freed -- no leaks are possible
==1715984== 
==1715984== For lists of detected and suppressed errors, rerun with: -s
==1715984== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>This also allows you to chain assignment operations and modify multiple variables in one statement. For example:</P>

      <CBlock showLineNumbers={false}>{
`int x;
int y;

// Change y to 10, THEN change x to the value of y (10).
x = y = 10;

// x and y are now both 10`
      }</CBlock>

      <SectionHeading id="type-casting">Type casting</SectionHeading>

      <P><Bold>Type casting</Bold> means to convert an expression of one type into a new expression of another type. There are two kinds of type casting in C: <Bold>implicit type casting</Bold>, and <Bold>explicit type casting</Bold>.</P>

      <P><Bold>Implicit type casting</Bold> happens implicitly and automatically. Specifically, whenever the compiler expects you to provide a certain type of expression in a certain place within your code, but you provide a different type of expression instead, the compiler will attempt to implicitly type-cast the provided expression into the required type. For example, consider <Code>int x = 3.14;</Code>. The compiler expects an <Code>int</Code>-typed expression to appear on the right side of the assignment operator since you're assigning a value to an <Code>int</Code> variable. But a <Code>double</Code>-typed expression is provided instead. The compiler will implicitly convert <Code>3.14</Code> into an <Code>int</Code>-typed expression (more on conversion rules in a moment).</P>

      <P>Implicit type casting isn't always possible. There are cases where the compiler will refuse to implicitly type-cast an expression even when the conversion is technically possible (or, at the very least, there are cases where it will issue a warning, such as when type-casting a pointer-typed to another integral type).</P>

      <P>But more importantly, implicit type casting can sometimes be a bit awkward. Suppose you want to divide two integers, but you don't want the result to be truncated. As we've discussed, a simple solution is to make one of those integers a <Code>double</Code> or a <Code>float</Code> instead, such as <Code>1.0 / 2</Code>, or <Code>1 / 2.0</Code>. But what if the two integers that you're trying to divide are variables or some other complicated kind of expression? Then you can't simply append a <Code>.0</Code> to the end of it to make it a <Code>double</Code> or <Code>float</Code> (e.g., <Code>x.0 / y</Code> makes no sense). This problem <It>could</It> be solved with implicit type casting:</P>

      <CBlock copyable={false} showLineNumbers={false}>{
`double x_as_double = x; // Implicit type casting
// Now you can compute x_as_double / y to avoid truncation
printf("%lf\\n", x_as_double / y);`
      }</CBlock>

      <P>But that's a bit awkward. It requires creating an extra variable, <Code>x_as_double</Code>, just to implicitly cast <Code>x</Code>'s value to a <Code>double</Code>-typed expression to facilitate the division without truncation.</P>

      <P>This problem is better solved with <Bold>explicit type casting.</Bold> Any expression can be explicitly and manually casted to another type. Type write out the type that you want to cast the expression to in a pair of parentheses immediately before the expression itself:</P>

      <CBlock copyable={false} showLineNumbers={false}>{
`printf("%lf\\n", (double) x / y); // Prints 0.5`
      }</CBlock>

      <P><Code>(double) x</Code> casts <Code>x</Code> into a <Code>double</Code>-typed expression, which we then divide by <Code>y</Code>. Again, this avoids integer truncation if <Code>x</Code> and <Code>y</Code> are both <Code>int</Code>-typed variables.</P>

      <P>Importantly, only the expression immediately to the write of the parentheses-enclosed type is casted. In the above example, <Code>x</Code> is casted to a <Code>double</Code>, and <It>then</It> the result is divided by <Code>y</Code>. That's very different from the following:</P>

      <CBlock copyable={false} showLineNumbers={false}>{
`printf("%lf\\n", (double) (x / y)); // Prints 0.0`
      }</CBlock>

      <P>In this case, <Code>x / y</Code> is computed, and <It>then</It> the result is casted to a <Code>double</Code>. And in this case, because <Code>x / y</Code> happens before the type cast, integer division is performed, so the result is truncated to 0 (and then that 0 is casted to a <Code>double</Code> value, <Code>0.0</Code>).</P>

      
      <SectionHeading id="const"><Code>const</Code></SectionHeading>

      {/*TODO*/}

      <SectionHeading id="basic-standard-input">Basic standard input</SectionHeading>

      {/*TODO*/}

      <SectionHeading id="if-statements">If statements</SectionHeading>

      {/*TODO*/}

      <SectionHeading id="functions">Functions</SectionHeading>

      {/*TODO Perhaps this section doesn't go here. I've just put it here so I can create anchor links to it.*/}

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
