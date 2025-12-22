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
        <Item><Link href="#relational-and-logical-operators">Relational and logical operators</Link></Item>
        <Item><Link href="#if-statements">If statements</Link></Item>
        <Item><Link href="#if-statement-mistakes">Common mistakes with if statements</Link></Item>
        <Item><Link href="#scopes">Scopes</Link></Item>
        <Item><Link href="#loops">Loops</Link></Item>
        <Item><Link href="#break-and-continue"><Code>break</Code> and <Code>continue</Code></Link></Item>
        <Item><Link href="#functions">Functions</Link></Item>
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

      <P>If you use the wrong format specifiers, such as <Code>%f</Code> for an integer argument or <Code>%d</Code> for a floating point argument, it will likely print the wrong value to the terminal (technically, it results in <Bold>undefined behavior</Bold>, which we'll discuss later).</P>

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
        <Item><Code>char</Code>. This data type represents a single character. Technically, a <Code>char</Code> value is just a whole number, usually between <Code>-128</Code> and <Code>127</Code>. However, the computer is capable of converting these numbers to and from character symbols (e.g., when printing them to the terminal). This works via a character encoding, specifically ASCII. We'll discuss this in greater detail later on in the term.</Item>
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

      <P>Note that C does not have an operator for exponentiation. To raise a base to the power of an exponent, you must use the <Code>pow()</Code> function, which is provided by the standard library header file <Code>math.h</Code>. Importantly, this function's return type is <Code>double</Code>, so if you want to print its return value directly, you should use a <Code>%lf</Code> format specifier (using <Code>%d</Code> will not work, even if the arguments are integers):</P>

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

      <P>Before I show you any syntax, it's important that you understand the difference between <Bold>declaration</Bold> and <Bold>definition</Bold>. A declaration states the existence of a <Bold>symbol</Bold>, meaning something with a name. Variables are symbols, for example, because they're named locations in memory. A definition, on the other hand, states the value associated with a declared symbol. Symbols must be declared before they can be defined or referenced (used) in any way.</P>

      <P>This means that before a variable can be defined (given a value) and / or used, in must first be declared. To declare an automatic variable, write out its data type followed by its name. A variable declaration is a kind of statement, so it must be terminated with a semicolon. For example:</P>

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

      <P>Once a variable has been declared, it can be defined (assigned a value). This is done with the assignment operator (<Code>=</Code>). Place the variable on the left, and an expression on the right. Most assignment operations are complete statements, so they must be terminated with a semicolon. When the program reaches the assignment operation, the computer will evaluate the entire expression on the right to produce a value, and then it will store that value in the variable on the left. Importantly, the type of the expression on the right must be compatible with the type of the variable on the left.</P>

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

      <P>Implicit type casting isn't always possible. There are cases where the compiler will refuse to implicitly type-cast an expression even when the conversion is technically possible (or, at the very least, there are cases where it will issue a warning, such as when type-casting a pointer-typed expression to another integral type).</P>

      <P>Implicit type casting can also sometimes be a bit awkward. Suppose you want to divide two integers, but you don't want the result to be truncated. As we've discussed, a simple solution is to make one of those integers a <Code>double</Code> or a <Code>float</Code> instead, such as <Code>1.0 / 2</Code>, or <Code>1 / 2.0</Code>. But what if the two integers that you're trying to divide are variables or some other complicated kind of expression? Then you can't simply append a <Code>.0</Code> to the end of it to make it a <Code>double</Code> or <Code>float</Code> (e.g., <Code>x.0 / y</Code> makes no sense). This problem <It>could</It> be solved with implicit type casting:</P>

      <CBlock copyable={false} showLineNumbers={false}>{
`double x_as_double = x; // Implicit type casting
// Now you can compute x_as_double / y to avoid truncation
printf("%lf\\n", x_as_double / y);`
      }</CBlock>

      <P>But that's a bit awkward. It requires creating an extra variable, <Code>x_as_double</Code>, just to implicitly cast <Code>x</Code>'s value to a <Code>double</Code>-typed expression to facilitate the division without truncation.</P>

      <P>This problem is better solved with <Bold>explicit type casting.</Bold> Any expression can be explicitly and manually casted to another type. Simply write out the type that you want to cast the expression to in a pair of parentheses immediately before the expression itself:</P>

      <CBlock copyable={false} showLineNumbers={false}>{
`printf("%lf\\n", (double) x / y); // Prints 0.5`
      }</CBlock>

      <P><Code>(double) x</Code> casts <Code>x</Code> into a <Code>double</Code>-typed expression, which we then divide by <Code>y</Code>. Again, this avoids integer truncation if <Code>x</Code> and <Code>y</Code> are both <Code>int</Code>-typed variables.</P>

      <P>Importantly, only the expression immediately to the write of the parentheses-enclosed type is casted. In the above example, <Code>x</Code> is casted to a <Code>double</Code>, and <It>then</It> the result is divided by <Code>y</Code>. That's very different from the following:</P>

      <CBlock copyable={false} showLineNumbers={false}>{
`printf("%lf\\n", (double) (x / y)); // Prints 0.0`
      }</CBlock>

      <P>In this case, <Code>x / y</Code> is computed, and <It>then</It> the result is casted to a <Code>double</Code>. And in this case, because <Code>x / y</Code> happens before the type cast, integer division is performed, so the result is truncated to 0 (and then that 0 is casted to a <Code>double</Code> value, <Code>0.0</Code>).</P>

      <P>Be careful when performing type-casting, especially explicit type-casting. In some cases, the compiler will let you type-cast an expression to another type even when the conversion doesn't make any sense. This can sometimes lead to undefined behavior, especially when casting between types of <Link href={`${PARENT_PATH}/${allPathData["pointers"].pathName}`}>pointers</Link>.</P>

      <P>To avoid issues, only cast between types for which you're aware of and understand the conversion rules. Here are some such rules:</P>

      <Itemize>
        <Item>Type-casting a floating-point-typed (e.g., <Code>float</Code> or <Code>double</Code>) expression into an integral type (e.g., <Code>int</Code> or <Code>long int</Code>) performs truncation: the decimal point and everything after it is dropped. You can also think of this as "rounding toward zero". For example, the value of <Code>(int) -3.99</Code> is <Code>-3</Code>; the value of <Code>(int) 3.99</Code> is <Code>3</Code>; and the value of <Code>(int) 3.01</Code> is <Code>3</Code>.</Item>
        <Item>Type-casting an integral-typed (e.g., <Code>int</Code> or <Code>long int</Code>) expression into a floating-point type (e.g., <Code>float</Code> or <Code>double</Code>) works by simply adding a <Code>.0</Code> to the end of the value. For example, the value of <Code>(float) 3</Code> is <Code>3.0f</Code>.</Item>
        <Item>When the converted value is too large to be represented by the newly casted type, then it's "shrunk" to a smaller value in an implementation-defined manner (this is similar to undefined behavior, but usually less dangerous). For example, the value of <Code>(int) 999999999999l</Code> is usually implementation-defined because such a large value usually cannot be represented by the <Code>int</Code> type.</Item>
        <Item>When casting from a high-precision floating-point type to a lower-precision floating-point type (e.g., <Code>double</Code> to <Code>float</Code>), even if the value is small enough to be represented by the new type, it may still lose some decimal places due to the reduced precision.</Item>
        <Item>Remember that <Code>char</Code> values are technically whole numbers that are converted to character symbols by the computer when necessary (e.g., when printing them to the terminal). This means that <Code>char</Code> is an integral type, similar to <Code>int</Code> and <Code>long</Code>, so they tend to follow similar casting / conversion rules.</Item>
      </Itemize>

      <SectionHeading id="const"><Code>const</Code></SectionHeading>

      <P>C supports several <Bold>type qualifiers</Bold>, which are keywords that can be used to modify a data type, instructing the compiler to treat it in a special way. The most common type qualifier is <Code>const</Code>, which can be used to create constants (similar to variables, but they can't be modified after they're declared).</P>

      <P>In the simplest case, a data type can be qualified as <Code>const</Code> by simply writing the <Code>const</Code> keyword immediately before the rest of the data type. For example:</P>

      <CBlock fileName="const.c">{
`int main() {
        float x = 5; // x is a variable of type 'float'
        const float pi = 3.14; // pi is a constant of type 'const float'
}`
      }</CBlock>

      <P>The <Code>const</Code> keyword can alternatively appear immediately <It>after</It> the rest of the type (e.g., <Code>float const pi = 3.14</Code>).</P>
      
      <P>If a value's type is <Code>const</Code>-qualified, then it cannot be changed at any point in the program. For example:</P>

      <CBlock fileName="const.c" highlightLines="{6}">{
`int main() {
        float x = 5; // x is a variable of type 'float'
        const float pi = 3.14; // pi is a constant of type 'const float'

        x = 10; // This is perfectly fine
        pi = 10; // This causes a compilation error
}`
      }</CBlock>

      <P>Attempting to compile the above program produces the following output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -o const const.c 
const.c: In function ‘main’:
const.c:6:11: error: assignment of read-only variable ‘pi’
    6 |         pi = 10; // This causes a compilation error
      |           ^`
      }</TerminalBlock>

      <P>Importantly, constants generally cannot be modified at any point after they're declared, so they must be initialized in the very same statement in which they're declared, or else they'll remain uninitialized forever. For example, this works just fine:</P>

      <CBlock>{
`const float pi = 3.14;`
      }</CBlock>

      <P>But this does <Ul>not</Ul> work (it fails to compile):</P>

      <CBlock>{
`const float pi;
pi = 3.14; // Cannot modify pi after declaration!`
      }</CBlock>

      <P>You might have noticed that <Code>const</Code>-qualified types are more restrictive, and so in some sense "less powerful", than types that aren't <Code>const</Code>-qualified. For example, anything that can be done with <Code>pi</Code> can also be done with <Code>x</Code>, but the vice-versa is <Ul>not</Ul> true because <Code>x</Code> can be modified whereas <Code>pi</Code> cannot.</P>

      <P>So, why use <Code>const</Code>-qualified types? Well, it's simple: suppose you have a value that should never be changed, but you (or the new intern / junior) accidentally change it anyways. That's a bug. If the value's type is <Code>const</Code>-qualified, then the mistake will be detected instantly by the compiler, the program will fail to build, and the compiler will generate a very nice message telling you what the error is and where in the code it can be found. However, if the value's type is not <Code>const</Code>-qualified, then the bug manifests as a logic error at runtime, which could propagate through thousands of lines of code before generating a fault or producing an incorrect value. Syntax errors at compile time are much easier to detect and diagnose than logic errors at runtime, so you should always prefer the former.</P>

      <P>A simple rule of thumb is: if you're certain that a value will never need to be changed throughout the program's runtime after it's declared / initialized, then you should qualify its type with <Code>const</Code>.</P>

      <SectionHeading id="basic-standard-input">Basic standard input</SectionHeading>

      <P>So far, I've only shown you how to write programs that <It>output</It> data to the terminal. But in most cases, programs also need to be able to receive data as <It>inputs</It> in order to be useful.</P>

      <P>Recall that every process has a special file known as its standard output, and that, by default, standard output is typically linked to the terminal. Hence, anything written to standard output is automatically displayed in the terminal, and that's what <Code>printf()</Code> does.</P>

      <P>Similarly, every process has a special file known as its <Bold>standard input</Bold>. Standard input files are also typically linked to the terminal by default, but they're input streams instead of output streams. That is, instead of writing data to standard input, processes <It>read</It> data <It>from</It> standard input. Assuming standard input is linked to the terminal, as it usually is, reading from standard input essentially reads whatever text the user types into the terminal.</P>

      <P>There are a few ways to read the user's inputs from standard input. In this lecture, we'll just cover a single basic way: the <Code>scanf()</Code> function.</P>

      <P>First, a disclaimer: using <Code>scanf()</Code> in a rigorously correct way is quite difficult. In most cases, a much better idea is to read entire lines of input using functions like <Code>fgets()</Code> or <Code>getline()</Code>, and then perform necessary conversions using functions like <Code>strtol()</Code>. However, using <Code>fgets()</Code>, <Code>getline()</Code>, and <Code>strtol()</Code> (and other similar functions) requires a deeper understanding C strings, which we aren't covering until later in the term. So we'll use <Code>scanf()</Code> for now, and we'll switch to those other functions later.</P>

      <P>The <Code>scanf()</Code> function is provided by <Code>{'<stdio.h>'}</Code>. It accepts one or more arguments, but there will usually be at least two. The first argument must be a C string (e.g., a string literal) specifying the expected format of the user's input by using format specifiers (e.g., <Code>%d</Code>, <Code>%f</Code>, etc). Each format specifier represents a placeholder for a value that the user is expected to provide. For each format specifier in the string passed as the first argument to <Code>scanf()</Code>, an additional argument is required to specify the variable in which the user's provided value will be stored. These additional arguments<Emdash/>the second argument to <Code>scanf()</Code> and on<Emdash/>must be provided in the form of non-constant pointers. We'll cover pointers in greater detail <Link href={`${PARENT_PATH}/${allPathData["pointers"].pathName}`}>later on</Link>, but for now, this basically means that the second argument to <Code>scanf()</Code> and on must variables (not constants) with ampersands (<Code>&</Code>) before their names. <Code>scanf()</Code> will then pause until the user types their inputs into the terminal (separated by whitespace) and presses the enter key, at which point it will read the user's inputs through the process's standard input and store their values in the variables that were passed by pointer as the second argument and on to <Code>scanf()</Code> in left-to-right order.</P>

      <P>That's a bit abstract, so here's an example:</P>

      <CBlock fileName="scanf.c">{
`#include <stdio.h>

int main() {
        // Prompt the user for some values
        printf("Enter your age, followed by a space, followed by your "
                "favorite number: ");

        // Create variables in which to store the user's provided
        // values
        int age;
        float favorite_number;

        // The user is expected to provide their age and THEN their
        // favorite number. The first is an int, and the second is a
        // float, so the format specifiers for these inputs are %d
        // followed by %f. Pause the program until the user enters
        // these two values, then store the supplied values in the
        // 'age' and 'favorite_number' variables, respectively:
        scanf("%d %f", &age, &favorite_number);
        // Notice the ampersands above (&age and &favorite_number)

        // Just to prove it worked, add the two numbers together and
        // print the result:
        printf("The sum is %f\\n", age + favorite_number);
}`
      }</CBlock>

      <P>Here's an example run of the above program:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o scanf scanf.c 
$ valgrind ./scanf 
==1127744== Memcheck, a memory error detector
==1127744== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1127744== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==1127744== Command: ./scanf
==1127744== 
Enter your age, followed by a space, followed by your favorite number: 27 9.81
The sum is 36.810001
==1127744== 
==1127744== HEAP SUMMARY:
==1127744==     in use at exit: 0 bytes in 0 blocks
==1127744==   total heap usage: 2 allocs, 2 frees, 2,048 bytes allocated
==1127744== 
==1127744== All heap blocks were freed -- no leaks are possible
==1127744== 
==1127744== For lists of detected and suppressed errors, rerun with: -s
==1127744== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)`
      }</TerminalBlock>

      <P>Let's break this down a bit. The first argument to <Code>scanf()</Code>, <Code>"%d %f"</Code>, states that we expect the user to enter a decimal integer (<Code>%d</Code>) followed by a floating point number (<Code>%f</Code>). The space between the two format specifiers is technically optional (i.e., the first argument to <Code>scanf()</Code> could equivalently be <Code>"%d%f"</Code>, with no spaces).</P>

      <P>Because the user is expected to provide two inputs, there are two additional arguments after the format string. The first of those two arguments must specify a pointer to a variable in which the user's first input (the decimal integer input) will be stored. <Code>age</Code> is an integer variable, so we supply a pointer to the <Code>age</Code> variable (i.e., <Code>&age</Code>) as the first argument after the format string. The second argument after the format string must specify a pointer to a variable in which the user's second input (the floating point input) will be stored. <Code>favorite_number</Code> is a floating-point variable, so we supply a pointer to the <Code>favorite_number</Code> variable (i.e., <Code>&favorite_number</Code>) as the second argument after the format string.</P>

      <P>(The ampersand is the "address-of" operator, and it's used to create pointers that point to variables. More on this in <Link href={`${PARENT_PATH}/${allPathData["pointers"].pathName}`}>a future lecture</Link>).</P>
      
      <P>When the program is executed and the control flow arrives at the <Code>scanf()</Code> function call, the program pauses until the user provides two inputs separated by whitespace (because the <Code>scanf()</Code> call's format string has two format specifiers and corresponding pointer arguments) and presses the enter key. It then stores the first input in the <Code>age</Code> variable and the second input in the <Code>favorite_number</Code> variable.</P>

      <P>The user's two inputs may be separated by <Ul>any</Ul> kind of whitespace. The program specifically tells the user to separate them with a space ("Enter your age, followed by a space, followed by your favorite number"), but if the user separates their inputs with, say, a tab character instead of a space character, the program will still work in the exact same way. This is because <Code>scanf()</Code> treates any and all whitespace as delimiters (separators) between actual input values. Even if the user supplies a whole <It>bunch</It> of whitespace (e.g., they separate their two input values with several spaces, tabs, and other whitespace), the program will still work in the same way. Technically, even newline character sequences are considered whitespace and treated the same way, so the user could even choose to supply the two inputs on separate lines if they want (e.g., they could type "27", followed by the enter key, followed by "9.81", followed by the enter key again; the program would still do the exact same thing).</P>

      <P>Now, what if the user's input doesn't match the expected format? In such a case, <Code>scanf()</Code> will stop scanning the user's input once it reaches the first incorrectly formatted value. For example, if the user enters "27 Hello", then it will store 27 inside the <Code>age</Code> variable and then immediately stop because "Hello" is not a valid floating-point value. The result is that <Code>age</Code> will be <Code>27</Code>, but <Code>favorite_number</Code> will still be uninitialized.</P>

      <P>Moreover, if <Code>scanf()</Code> stops scanning early due to the user supplying an incorrect type of input, it will leave the remaining characters in the input buffer. For example, if the user types "27 Hello", then it will store the 27 inside the <Code>age</Code> variable but leave the "Hello" in the buffer. This means that the <It>next</It> time the program tries to read from standard input (e.g., via another call to <Code>scanf()</Code>), it will again try to read the word "Hello" (and again leave it in the input buffer if it's still not the correct type of input).</P>

      <P>All of this means that it's very difficult to do proper error handling with <Code>scanf()</Code>. If you don't trust the user to supply values of the correct types (which, in most cases, you shouldn't), then you should not use <Code>scanf()</Code>. Again, a much better idea would be to use more advanced functions like <Code>fgets()</Code>, <Code>getline()</Code>, and <Code>strtol()</Code>. However, until we've covered those functions, we're going to use <Code>scanf()</Code> anyways, and we're just going to trust that the user will, indeed, supply values of valid types so that <Code>scanf()</Code> is capable of reading them.</P>

      <P>(There are many other details about <Code>scanf()</Code> that we won't discuss, such as its return value and special cases where the user's inputs do not have to be whitespace-separated.)</P>

      <P>Finally, you might have noticed that the sum of the age and favorite number in the previous example run is slightly off (36.810001 instead of 36.81). This is just a result of numerical imprecision. It actually has nothing to do with <Code>scanf()</Code>. Directly initializing <Code>favorite_number = 9.81</Code> without calling <Code>scanf()</Code> at all yields the same result on the ENGR servers.</P>

      <SectionHeading id="relational-and-logical-operators">Relational and logical operators</SectionHeading>

      <P>C has all the typical relational operators that you'd expect:</P>
      
      <Itemize>
        <Item><Code>{'<'}</Code>: The less-than operator</Item>
        <Item><Code>{'>'}</Code>: The greater-than operator</Item>
        <Item><Code>{'<='}</Code>: The less-than-or-equal-to operator</Item>
        <Item><Code>{'>='}</Code>: The greater-than-or-equal-to operator</Item>
        <Item><Code>{'=='}</Code>: The equal-to operator</Item>
        <Item><Code>{'!='}</Code>: The not-equal-to operator</Item>
      </Itemize>

      <P>To use a relational operator, simply place it between two values of comparable types, and it will produce a new value that's "true" if the relationship is true and "false" otherwise. For example, <Code>{'5 < 7'}</Code> will produce a "true" value since 5 is, indeed, less than 7.</P>

      <P>However, I write "true" and "false" in quotation marks for a reason: as strange as it may sound, C does not have a dedicated boolean data type. Instead, C uses integers to represent true and false values. Relational operations will produce a value of 1 when the relationship is true, and a value of 0 when the relationship is false.</P>

      <P>Here are some examples:</P>

      <CBlock fileName="relationaloperators.c">{
`#include <stdio.h>

int main() {
        printf("%d\\n", 5 < 10); // Prints 1 for true
        printf("%d\\n", 5 >= 10); // Prints 0 for false

        printf("%d\\n", 5 == 5); // Prints 1 for true
        printf("%d\\n", 5 != 5); // Prints 0 for false

        printf("%d\\n", 5 == 6); // Prints 0 for false
        printf("%d\\n", 5 != 6); // Prints 1 for true

        // Since relational operators just produce 0 or 1,
        // you can store their values in int variables
        int x;
        scanf("%d", &x);
        int x_is_less_than_10 = x < 10;

        // If the user entered a value less than 10, then
        // x_is_less_than_10 will be 1. Else, it'll be 0.
}`
      }</CBlock>

      <P>C also has all the typical logical operators that you'd expect:</P>

      <Itemize>
        <Item><Code>&&</Code>: The <Bold>logical-and</Bold> operator</Item>
        <Item><Code>||</Code>: The <Bold>logical-or</Bold> operator</Item>
        <Item><Code>!</Code>: The <Bold>logical-not</Bold> operator</Item>
      </Itemize>

      <P>To use any of the above logical operators other than logical-not, simply place the operator between two integers that are each either 0 or 1. In such a case, a logical-and operator will produce a value of 1 if and only if the operands to its left <Ul>and</Ul> right are both 1. If either operand is 0, the logical-and operator will produce a value of 0. A logical-or operator will produce a value of 1 if and only if the operand to its left <Ul>or</Ul> right is 1 (or both). If both operands are 0, the logical-or operator will produce a value of 0.</P>

      <P>To use the logical-not operator, simply place it to the left of an integer value that's either 0 or 1, and it will negate it. That is, if placed to the left of an integer with value 0, it will produce a value of 1. If placed to the left of an integer with value 1, it will produce a value of 0.</P>

      <P>Here are some examples:</P>

      <CBlock fileName="logicaloperators.c">{
`#include <stdio.h>

int main() {
        // Ask user for integer x
        int x;
        scanf("%d", &x);

        // Check if x is between 5 and 10.
        // The parentheses are technically optional in this case,
        // but they provide some clarity as to the order of operations.
        int within_range = (x >= 5) && (x <= 10);

        // If x is between 5 and 10 (inclusive), then
        // within_range will be 1 ("true"). Else, it'll be
        // 0 ("false").

        // Check if x is negative or greater than 100
        int negative_or_large = (x < 0) || (x > 100);

        // If x is negative or greater than 100, then
        // negative_or_large will be 1 ("true"). Else, it'll
        // be 0 ("false").
}`
      }</CBlock>

      <P>Technically, these logical operators can also be used with integer operands whose values are not 0 nor 1. Such values are treated as true, just as values of 1 are treated as true. However, these logical operators will always <It>produce</It> either 0 or 1 (that is, they will never produce, say, a value of 2 to represent true, even though a value of 2 is treated as true when supplied as an operand).</P>

      <SectionHeading id="if-statements">If statements</SectionHeading>

      <P>Unsurprisingly, C supports if statements. The syntax is as follows:</P>

      <SyntaxBlock>{
`if (<condition>) {
    <body>
}`
      }</SyntaxBlock>

      <P>Replace <Code>{'<condition>'}</Code> with an integer expression, and replace <Code>{'<body>'}</Code> with the if statement body. The if statement's body will be executed if and only if its condition is <Ul>any nonzero value</Ul>. If the condition's value is 0, then the body won't execute. Of course, this means that logical and relational operations, which produce integer values of either 0 or 1, can be used to construct if statement conditions.</P>

      <P>(You can sometimes omit the curly braces around the if statement's body. In such a case, the single statement immediately following the if statement condition's closing parenthesis is treated as the entire if statement body. This is true regardless of the code's whitespace / indentation (recall: C is not whitespace-sensitive). This means that if you want your if statement body to have multiple statements in it, then it <Ul>must</Ul> have curly braces around the body. And, in fact, some programmers say that it's a bad idea to ever omit the curly braces because it often leads to mistakes. <Link href="https://www.imperialviolet.org/2014/02/22/applebug.html">Here's</Link> an example of a bug caused by one such mistake. To be safe, I recommend just always including the curly braces; there's no good reason to omit them.)</P>

      <P>C also has "else if" and "else" statements. Here's an example of the syntax for an if-elseif-else chain:</P>

      <SyntaxBlock>{
`if (<condition 1>) {
    <body A>
} else if (<condition 2>) {
    <body B>
} else if (<condition 3>) {
    <body C>
} else {
    <body D>
}
// More code here...`
      }</SyntaxBlock>

      <P>(This is just an example. There doesn't have to be exactly two else-if statements.)</P>

      <P>Replace each <Code>{'<condition X>'}</Code> with a corresponding condition (i.e., integer expression, where 0 is treated as false and all nonzero values are treated as true), and replace each <Code>{'<body X>'}</Code> with a corresponding body of code.</P>

      <P>In the above example syntax, if <Code>{'<condition 1>'}</Code> is true (i.e., a nonzero value), then the program will execute <Code>{'<body A>'}</Code>, and then it will jump all the way to the end of the chain (to the <Code>{'// More code here...'}</Code> line) and proceed to execute whatever comes next. However, if <Code>{'<condition 1>'}</Code> is false (i.e., 0), then the computer will move on to evaluate <Code>{'<condition 2>'}</Code>. If <Code>{'<condition 1>'}</Code> is false but <Code>{'<condition 2>'}</Code> is true, then the program will execute <Code>{'<body B>'}</Code>, and then it will jump all the way to the end of the chain (again, to the <Code>{'// More code here...'}</Code> line) and proceed to execute whatever comes next. And so on. If all the if and else-if statements' conditions are false (i.e., if <Code>{'<condition 1>'}</Code>, condition <Code>{'<condition 2>'}</Code>, <Ul>and</Ul> condition <Code>{'<condition 3>'}</Code> are all 0), then the program will execute the else statement's body (<Code>{'<body D>'}</Code>) before proceeding to the <Code>{'// More code here...'}</Code> line.</P>

      <P>Remember that an else statement should not have any condition associated with it. It's just "else", followed by curly braces and a code body. This is because it appears at the very end of an if-elseif-else chain, and it represents the "catch all" scenario: it executes if and only if none of the previous bodies of code in the chain executed. Hence, its condition is implied.</P>

      <P>Again, an if-elseif-else chain does not have to have exactly two else-if statements, nor does it have to have an else statement at all. In general, an if-elseif-else chain must start with a regular if statement, it can have zero or more (potentially infinitely many) else-if statements, and it can have at most one else statement at the end.</P>

      <P>Here's a more concrete example:</P>

      <CBlock fileName="ifstatement.c">{
`#include <stdio.h>

int main() {
        printf("Enter your grade percentage: ");
        float percent;
        scanf("%f", &percent);

        if (percent >= 92.5) {
                printf("Your grade is an A\\n");
        } else if (percent >= 89.5) {
                printf("Your grade is an A-\\n");
        } else if (percent >= 86.5) {
                printf("Your grade is a B+\\n");
        } else if (percent >= 82.5) {
                printf("Your grade is a B\\n");
        } else if (percent >= 79.5) {
                printf("Your grade is a B-\\n");
        } else if (percent >= 76.5) {
                printf("Your grade is a C+\\n");
        } else if (percent >= 72.5) {
                printf("Your grade is a C\\n");
        } else if (percent >= 69.5) {
                printf("Your grade is a C-\\n");
        } else if (percent >= 66.5) {
                printf("Your grade is a D+\\n");
        } else if (percent >= 62.5) {
                printf("Your grade is a D\\n");
        } else if (percent >= 59.5) {
                printf("Your grade is a D-\\n");
        } else {
                printf("Your grade is an F\\n");
        }
}`
      }</CBlock>

      <P>And here's an example run:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o ifstatement ifstatement.c 
$ valgrind ./ifstatement 
==1162014== Memcheck, a memory error detector
==1162014== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1162014== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==1162014== Command: ./ifstatement
==1162014== 
Enter your grade percentage: 87.4
Your grade is a B+
==1162014== 
==1162014== HEAP SUMMARY:
==1162014==     in use at exit: 0 bytes in 0 blocks
==1162014==   total heap usage: 2 allocs, 2 frees, 2,048 bytes allocated
==1162014== 
==1162014== All heap blocks were freed -- no leaks are possible
==1162014== 
==1162014== For lists of detected and suppressed errors, rerun with: -s
==1162014== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)`
      }</TerminalBlock>

      <P>If statements can also be placed inside the bodies of other if statements (i.e., if statements can be <Bold>nested</Bold>).</P>

      <SectionHeading id="if-statement-mistakes">Common mistakes with if statements</SectionHeading>

      <P>Don't forget that a pair of successive if statements is not the same thing as an if statement followed by an else-if statement. Consider the following code:</P>

      <CBlock>{
`if (x < 5) {
    printf("Hello, ");
} else if (x > 0) {
    printf("World!");
}`
      }</CBlock>

      <P>Suppose <Code>x</Code> stores the value <Code>3</Code>. Then the above code will print "Hello, ", but it will not print "World!", even though 3 is greater than 0. This is because bodies of code in an if-elseif-else chain are mutually exclusive (at most one of them will execute).</P>

      <P>Now consider this alternative:</P>

      <CBlock>{
`if (x < 5) {
    printf("Hello, ");
} if (x > 0) {
    printf("World!");
}`
      }</CBlock>

      <P>Notice that the keyword "else" is missing before the second "if". This is now a sequence of two successive if statements rather than an if-elseif chain. That is, these two if statements are evaluated independently of one another. In this case, if <Code>x</Code> stores the value <Code>3</Code>, then the above code will print "Hello, World!" (3 is less than 5 but also greater than 0, so both if statements' bodies will execute).</P>

      <P>It's a common mistake to accidentally use <Code>if</Code> when you should've used <Code>else if</Code>, or vice-versa. Make sure you understand the difference.</P>

      <P>Another common mistake is to chain relational operators. For example, it's common mathematical notation to represent ranges with chained equalities, such as {'0 < x < 10'} to declare that x's value is between 0 and 10. However, such notation does not work as one might expect in C.</P>

      <P>Remember: relational operators compare values and produce integers. The C expression <Code>{'0 < x < 10'}</Code> is really two operations, and they're evaluated left-to-right. First, <Code>{'0 < x'}</Code> is evaluated. If 0 happens to be less than x, then it will evaluate to 1. Otherwise, it will evaluate to 0. Then, <It>that</It> value<Emdash/>which is either 0 or 1<Emdash/>will be compared to <Code>10</Code>. In other words, the C expression <Code>{'0 < x < 10'}</Code> is equivalent to <Code>{'(0 < x) < 10'}</Code>. And since the value of <Code>{'0 < x'}</Code> is always either 0 or 1, both of which are less than 10, the value of the entire C expression will always be 1 (for true). Indeed, even if x is 1000, the C expression <Code>{'0 < x < 10'}</Code> will evaluate to 1 (true).</P>

      <P>The correct way to check whether x is between 0 and 10 (exclusive) would be to combine relational operators with logical operators, such as <Code>{'(0 < x) && (x < 10)'}</Code>.</P>

      <P>Another common mistake is to forget that binary logical operators (i.e., logical-and and logical-or) must be placed between two complete boolean expressions. For example, if you want to check whether x is 1 or 2, you might mistakenly use the expression <Code>{'x == 1 || 2'}</Code>. But that doesn't work. Similar to the last mistake, this is equivalent to <Code>{'(x == 1) || 2'}</Code>. First, <Code>x == 1</Code> is evaluated. If x happens to be 1, then this expression will evaluate to 1. Otherwise, it will evaluate to 0. Then, that value will be passed as the left operand to the logical operator. In other words, if x is 1, then the whole expression is equivalent to <Code>{'1 || 2'}</Code>. But if x is anything other than 1, then the whole expression is equivalent to <Code>{'0 || 2'}</Code>. The issue occurs when the logical operation is performed: although logical operators are typically meant to be used on booleans (i.e., integers whose values are either 0 or 1), as stated earlier, they <It>can</It> be given integer operands whose values are not 0 nor 1. Such operands are treated as true (i.e., equivalently to 1). In other words, <Code>{'0 || 2'}</Code> is equivalent to <Code>{'0 || 1'}</Code>, and <Code>{'1 || 2'}</Code> is equivalent to <Code>{'1 || 1'}</Code>. Both of these expressions are clearly always 1 (true). Indeed, even if x is 1000, the C expression <Code>{'x == 1 || 2'}</Code> will evaluate to 1 (true).</P>

      <P>The correct way to check whether x is either 1 or 2 is to place complete relational expressions on both sides of the logical operator: <Code>{'x == 1 || x == 2'}</Code>.</P>

      <P>Finally, an infamous mistake with if statements is to accidentally use an assignment operator (<Code>=</Code>) when you intend to use an equality operator (<Code>==</Code>). For example, <Code>if (x = 2)</Code> instead of <Code>if (x == 2)</Code>. This mistake is particularly subtle because it's usually <Ul>not</Ul> treated as a syntax error, so it may not be detected by your compiler. Instead, it manifests as a logic error at runtime, which can be hard to detect and diagnose.</P>

      <P>Particularly, assignment operations are expressions, meaning they have values. The value of an assignment operation is simply the new value of the variable after the assignment operation has completed (including after any implicit type casting, if necessary). For example, if you've declared an integer variable <Code>x</Code>, then <Code>printf("%d\n", x = 12)</Code> will 1) assign the value 12 to <Code>x</Code>, and then 2) print <Code>12</Code> to the terminal.</P>

      <P>This means that <Code>if(x = 2)</Code> will assign the value 2 to <Code>x</Code>, and then the expression <Code>x = 2</Code> will evaluate to <Code>2</Code> (assuming <Code>x</Code> is an integral-typed variable, such as an <Code>int</Code> or <Code>long int</Code>). The program will then proceed to check <Code>if (2)</Code>. All nonzero values are treated as true when used as if statement conditions, so the if statement's body would then execute, regardless of the original value of <Code>x</Code>.</P>

      <P>That is, <Code>if (x == 2)</Code> checks whether <Code>x</Code> is equal to 2 and, if so, executes the associated if statement body. In contrast, <Code>if (x = 2)</Code> <It>changes</It> <Code>x</Code> to 2 and then executes the associated if statement body no matter what.</P>

      <P>So, make sure you understand the difference between the assignment operator (<Code>=</Code>) and the equality operator (<Code>==</Code>). A common trick to avoid these sorts of mistakes is to use "yoda notation": <Code>if (2 == x)</Code> instead of <Code>if (x == 2)</Code>. That way, if you accidentally use an assignment operator, you'll end up with <Code>if (2 = x)</Code>, which is a syntax error and fails to compile because only variables (not literals) may appear to the left of an assignment operator. This "yoda notation" trick only works when comparing variables to literals, though.</P>

      <SectionHeading id="scopes">Scopes</SectionHeading>

      <P>A <Bold>scope</Bold> is a body of code in which a <Bold>symbol</Bold> is accessible (can be used). A symbol, in turn, is anything with a name, be it a variable, a constant, a function, etc.</P>

      <P>In C, scopes are typically dictated by curly braces. For example, an if statement body is enclosed in curly braces, so an if statement body is also a scope. A function body is enclosed in curly braces, so a function body is also a scope. And so on.</P>

      <P>Sometimes, though, scopes can be less salient. For example, as I wrote earlier, you can sometimes omit the curly braces around an if statement body if that body only has a single statement. However, even in that case, that single statement is still considered to have its own scope.</P>

      <P>Whenever a symbol is declared, it's bound to the scope in which the declaration appears. From that point on, it's accessible (can be used), but only <Ul>within that scope, specifically in lines of code that appear <It>below</It> the line in which it was declared</Ul>. Here's some example code:</P>

      <CBlock fileName="scope.c">{
`#include <stdio.h>

int main() {
        int x; // Declaration. x is bound to the main function's scope

        // This line of code is inside the main function's scope and
        // appears below x's declaration, so x is accessible / can be
        // used here. Here, we "use" / "access" x to store user input
        // inside it
        scanf("%d", &x);

        // Check if the user entered 10. Again, we can do this because
        // we're still in the main function's scope, so x is still
        // accessible
        if (x == 10) {
                // Declaration. pi is bound to this if statement's scope
                float pi = 3.14;

                // This line of code is inside the if statement's scope
                // and appears below pi's declaration, so pi is
                // accessible / can be used here.
                printf("%f\\n", pi);
        }

        // This is outside the if statement's scope (notice: it's
        // outside the curly braces), so pi is not accessible here.
}

// This is outside the main function's scope, so x is not accessible /
// cannot be used down here. But it's also not in ANY function's scope,
// so there wouldn't be much sense in referencing x here anyways.
// (In C, most* code needs to be inside some function body or another.)`
      }</CBlock>

      <P>Note that scopes can be nested inside other scopes. Indeed, the if statement's scope in the above program is nested inside the <Code>main</Code> function's scope. Suppose a scope B is nested inside a larger scope A. Then any lines of code within scope B are <It>also</It> said to be within scope A (because B is nested inside A). This means that code inside the above program's if statement body are allowed to access variables declared within the <Code>main</Code> function <It>above</It> the if statement:</P>

      <CBlock fileName="scope.c" highlightLines="{24-29}">{
`#include <stdio.h>

int main() {
        int x; // Declaration. x is bound to the main function's scope

        // This line of code is inside the main function's scope and
        // appears below x's declaration, so x is accessible / can be
        // used here. Here, we "use" / "access" x to store user input
        // inside it
        scanf("%d", &x);

        // Check if the user entered 10. Again, we can do this because
        // we're still in the main function's scope, so x is still
        // accessible
        if (x == 10) {
                // Declaration. pi is bound to this if statement's scope
                float pi = 3.14;

                // This line of code is inside the if statement's scope
                // and appears below pi's declaration, so pi is
                // accessible / can be used here.
                printf("%f\\n", pi);

                // This is perfectly fine. Technically, we're still
                // inside the main function's scope (we're just inside
                // a smaller scope nested within it), so we can still
                // access all variables declared above this point within
                // the main function's scope. That includes x.
                printf("%d\\n", x);
        }

        // This is outside the if statement's scope (notice: it's
        // outside the curly braces), so pi is not accessible here.
}

// This is outside the main function's scope, so x is not accessible /
// cannot be used down here. But it's also not in ANY function's scope,
// so there wouldn't be much sense in referencing x here anyways.
// (In C, most* code needs to be inside some function body or another.)
`
      }</CBlock>

      <P>Notice: <Code>x</Code> is accessible within the if statement body, but <Code>pi</Code> is not accessible below the if statement body. This is because <Code>x</Code> is bound to the <Code>main</Code> function's scope, and the if statement body is inside that scope, whereas <Code>pi</Code> is bound to the if statement's scope, and the <Code>main</Code> function's body is <Ul>not</Ul> inside that scope.</P>

      <P>Suppose we attempt to access <Code>pi</Code> below the if statement body like so:</P>

      <CBlock fileName="scope.c" highlightLines="{34}">{
`#include <stdio.h>

int main() {
        int x; // Declaration. x is bound to the main function's scope

        // This line of code is inside the main function's scope and
        // appears below x's declaration, so x is accessible / can be
        // used here. Here, we "use" / "access" x to store user input
        // inside it
        scanf("%d", &x);

        // Check if the user entered 10. Again, we can do this because
        // we're still in the main function's scope, so x is still
        // accessible
        if (x == 10) {
                // Declaration. pi is bound to this if statement's scope
                float pi = 3.14;

                // This line of code is inside the if statement's scope
                // and appears below pi's declaration, so pi is
                // accessible / can be used here.
                printf("%f\\n", pi);

                // This is perfectly fine. Technically, we're still
                // inside the main function's scope (we're just inside
                // a smaller scope nested within it), so we can still
                // access all variables declared above this point within
                // the main function's scope. That includes x.
                printf("%d\\n", x);
        }

        // This is outside the if statement's scope (notice: it's
        // outside the curly braces), so pi is not accessible here.
        printf("%f\\n", pi);
}

// This is outside the main function's scope, so x is not accessible /
// cannot be used down here. But it's also not in ANY function's scope,
// so there wouldn't be much sense in referencing x here anyways.
// (In C, most* code needs to be inside some function body or another.)`
      }</CBlock>

      <P>The above program fails to compile because it attempts to access <Code>pi</Code> from outside the scope to which it was bound:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o scope scope.c 
scope.c: In function ‘main’:
scope.c:34:24: error: ‘pi’ undeclared (first use in this function)
   34 |         printf("%f\n", pi);
      |                        ^~
scope.c:34:24: note: each undeclared identifier is reported only once for each function it appears in
`
      }</TerminalBlock>

      <P>Suppose we <It>want</It> to be able to access <Code>pi</Code> from below the if statement but also from within the if statement. How could we accomplish that? Well, we simply have to move <Code>pi</Code>'s declaration to be above the if statement but still inside the <Code>main</Code> function's body. That way, much like <Code>x</Code>, it will be bound to the <Code>main</Code> function's scope, accessible everywhere within the <Code>main</Code> function below its point of declaration (including within the nested if statement body):</P>

      <CBlock fileName="scope.c" highlightLines="{30-33,19-20,12-13}">{
`#include <stdio.h>

int main() {
        int x; // Declaration. x is bound to the main function's scope

        // This line of code is inside the main function's scope and
        // appears below x's declaration, so x is accessible / can be
        // used here. Here, we "use" / "access" x to store user input
        // inside it
        scanf("%d", &x);

        // Declaration. pi is bound to the main function's scope
        float pi = 3.14;

        // Check if the user entered 10. Again, we can do this because
        // we're still in the main function's scope, so x is still
        // accessible
        if (x == 10) {
                // pi is still accessible here, much like x
                printf("%f\\n", pi);

                // This is perfectly fine. Technically, we're still
                // inside the main function's scope (we're just inside
                // a smaller scope nested within it), so we can still
                // access all variables declared above this point within
                // the main function's scope. That includes x.
                printf("%d\\n", x);
        }

        // pi is now accessible here as well since it's bound to the
        // main function's scope in general instead of the if statement
        // body.
        printf("%f\\n", pi);
}

// This is outside the main function's scope, so x is not accessible /
// cannot be used down here. But it's also not in ANY function's scope,
// so there wouldn't be much sense in referencing x here anyways.
// (In C, most* code needs to be inside some function body or another.)
`
      }</CBlock>

      <P>Importantly, variables are bound to scopes based on their <It>declarations</It>, not their <It>initializations</It>. However, you should often try to keep declarations and initializations together when possible since, as mentioned earlier, attempting to use uninitialized variables results in undefined behavior. To illustrate, the below program is still syntactically valid, but there's an opporunity for undefined behavior:</P>
      
      <CBlock fileName="scope.c" highlightLines="{12-13,19-22,37-43}">{
`#include <stdio.h>

int main() {
        int x; // Declaration. x is bound to the main function's scope

        // This line of code is inside the main function's scope and
        // appears below x's declaration, so x is accessible / can be
        // used here. Here, we "use" / "access" x to store user input
        // inside it
        scanf("%d", &x);

        // Declaration. pi is bound to the main function's scope
        float pi;

        // Check if the user entered 10. Again, we can do this because
        // we're still in the main function's scope, so x is still
        // accessible
        if (x == 10) {
                // Initialize pi, which is bound to the main function's
                // scope (not this if statement's scope) but is still
                // accessible here
                pi = 3.14;

                // pi is still accessible here, much like x
                printf("%f\\n", pi);

                // This is perfectly fine. Technically, we're still
                // inside the main function's scope (we're just inside
                // a smaller scope nested within it), so we can still
                // access all variables declared above this point within
                // the main function's scope. That includes x.
                printf("%d\\n", x);
        }

        // pi is now accessible here as well since it's bound to the
        // main function's scope in general instead of the if statement
        // body. However, IMPORTANT: If the user enters something other
        // than 10 for the value of x, then the above if statement
        // body will not be executed, and pi will be uninitialized.
        // In such a case, attempting to use its value, while
        // syntactically valid, will invoke undefined behavior.
        // This is a terrible idea, even though the compiler allows it.
        printf("%f\\n", pi);
}

// This is outside the main function's scope, so x is not accessible /
// cannot be used down here. But it's also not in ANY function's scope,
// so there wouldn't be much sense in referencing x here anyways.
// (In C, most* code needs to be inside some function body or another.)
`
      }</CBlock>

      <P>Scopes can also be created at will. That is, they don't <It>have</It> to be associated with if statements, functions, loops, etc. Whenever you want, you can just create a pair of curly braces, and that creates a new scope:</P>

      <CBlock showLineNumbers={false}>{
`
int x;
{
    // Nested / inner scope. x is accessible here.
    int y;
    // y is accessible here.
}
// y is not accessible here`
      }</CBlock>

      <P>Now, here's where things get a little tricky: although it's usually not legal to declare two variables with the exact same name in the exact same scope (attempting to do so is a syntax error, and the program will fail to compile), it <It>is</It> legal to declare a variable in a nested scope with the same name as another variable that was declared above it in a nesting (outer) scope. This is referred to as <Bold>shadowing</Bold>. The variable declared in the nested / inner scope is the <Bold>shadowing variable</Bold>, and the variable declared in the nesting / outer scope is the <Bold>shadowed variable</Bold>. For example:</P>

      <CBlock fileName="shadowing.c">{
`#include <stdio.h>

int main() {
        int x = 1; // Shadowed x

        {
                // Nested scope

                int x = 100; // Shadowing x
        }
}`
      }</CBlock>

      <P>When a shadowing variable is declared, the shadowed variable becomes <It>temporarily</It> inaccessible, in the sense that any references to the variable's name will instead refer to the shadowing (inner-scope) variable:</P>

      <CBlock fileName="shadowing.c">{
`#include <stdio.h>

int main() {
        int x = 1; // Shadowed x

        {
                // Nested scope

                // x is not yet shadowed, so this prints 1 (the value of
                // the outer-scope x declared above)
                printf("%d\\n", x);

                int x = 2; // Shadowing x

                // The original x is now shadowed by the new x, so this
                // modifies the new x---the original x is left as value
                // 1.
                x = 100;

                // The original x is still shadowed, so this prints
                // the value of the new shadowing x (100)
                printf("%d\\n", x);
        }
}
`
      }</CBlock>

      <P>However, the shadowing variable's scope will eventually end, at which point it becomes inaccessible. When that happens, the original variable will become unshadowed, at which point it can again be accessed by name:</P>

      <CBlock fileName="shadowing.c" highlightLines="{25-28}">{
`#include <stdio.h>

int main() {
        int x = 1; // Shadowed x

        {
                // Nested scope

                // x is not yet shadowed, so this prints 1 (the value of
                // the outer-scope x declared above)
                printf("%d\\n", x);

                int x = 2; // Shadowing x

                // The original x is now shadowed by the new x, so this
                // modifies the new x---the original x is left as value
                // 1.
                x = 100;

                // The original x is still shadowed, so this prints
                // the value of the new shadowing x (100)
                printf("%d\\n", x);
        }

        // The shadowing x is no longer accessible, so the original
        // x (with value 1) is now unshadowed. This prints its value
        // (1).
        printf("%d\\n", x);
}`
      }</CBlock>

      <P>So, scope dictates where a variable is accessible, but there's one other thing that it does: when a variable's scope ends<Emdash/>not just when the computer temporarily jumps to another scope before returning (e.g., due to a function call), but rather, when a scope actually completely ends, reaching the closing curly brace or equivalent<Emdash/>the variable is said to <Bold>fall out of scope</Bold>. If that variable is an <Ul>automatic</Ul> variable, then its associated memory may be released at that point, allowing the computer to reuse it for other purposes. That's to say, when an automatic variable falls out of scope, it doesn't just become inaccessible<Emdash/>it ceases to exist. This distinction doesn't matter a whole lot right now, but it will matter a ton when we discuss <Link href={`${PARENT_PATH}/${allPathData["pointers"].pathName}`}>pointers</Link>.</P>

      <P>(Technically, an automatic variable's memory is not necessarily released immediately when it falls out of scope, but it might be, and it certainly won't be released <It>before</It> that.)</P>

      {/*TODO Global scope */}

      <SectionHeading id="loops">Loops</SectionHeading>

      <P>There are three kinds of loops in C:</P>

      <Enumerate>
        <Item>While loops</Item>
        <Item>Do-while loops</Item>
        <Item>For loops</Item>
      </Enumerate>

      <P>We'll start with <Bold>while loops</Bold>. The syntax for a while loop is just like that of an if statement, except the keyword <Code>if</Code> is replaced with the keyword <Code>while</Code>:</P>

      <SyntaxBlock>{
`while (<condition>) {
    <body>
}`
      }</SyntaxBlock>

      <P>While loops also work exactly like if statements, except for one notable difference: whenever the program finishes executing the body of a while loop, it reevaluates the while loop's condition and, if it's still true (nonzero), executes the body again. This process repeats<Emdash/>evaluating the condition and executing the body<Emdash/>until, eventually, the program evaluates the while loop's condition and finds it to be false (i.e., 0). At that point, the program proceeds to execute whatever code appears below the while loop's body.</P>

      <P>Here's an example:</P>

      <CBlock fileName="while.c">{
`#include <stdio.h>

int main() {
        int counter = 1;
        while (counter <= 5) {
                printf("%d\\n", counter);
                ++counter;
        }
        // More code here...
}`
      }</CBlock>

      <P>When the control flow reaches the while loop, the computer checks whether <Code>counter</Code> is less than or equal to 5. At this point, <Code>counter</Code> is currently 1, so the condition passes. It then executes the while loop's body, printing the current value of <Code>counter</Code> (1) to the terminal before incrementing it to 2. It then reevaluates the condition, again checking whether <Code>counter</Code> is less than or equal to 5. This time, its value is 2 instead of 1, but that's still less than or equal to 5, so it again executes the while loop's body, printing 2 and incrementing <Code>counter</Code> to 3. And so on. Eventually, <Code>counter</Code> reaches 5. The program will then print 5 to the terminal, increment counter to 6, and reevaluate the condition one last time. At this point, <Code>counter</Code>, with value 6, is <It>not</It> less than or equal to 5, so the loop will terminate, and the program will proceed to the <Code>// More code here...</Code> line.</P>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o while while.c
$ valgrind ./while
==1535879== Memcheck, a memory error detector
==1535879== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1535879== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==1535879== Command: ./while
==1535879== 
1
2
3
4
5
==1535879== 
==1535879== HEAP SUMMARY:
==1535879==     in use at exit: 0 bytes in 0 blocks
==1535879==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==1535879== 
==1535879== All heap blocks were freed -- no leaks are possible
==1535879== 
==1535879== For lists of detected and suppressed errors, rerun with: -s
==1535879== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)`
      }</TerminalBlock>

      <P>A close sibling to the while loop is the <Bold>do-while loop</Bold>. A do-while loop is exactly like a while loop, except when the program reaches the do-while loop, <Ul>it starts by executing the body</Ul>, and <It>then</It> it evaluates the do-while loop's condition. If the condition is true (nonzero), then it executes the body again, and so on.</P>

      <P>This difference is reflected in the syntax:</P>

      <SyntaxBlock>{
`do {
    <body>
} while(<condition>);`
      }</SyntaxBlock>

      <P>(Heed the semicolon after the condition's closing parenthesis. It's required.)</P>

      <P>Notice that the body appears <It>before</It> the condition. Hopefully that serves to remind you that the body is executed before the condition is evaluated for the first time.</P>

      <P>Put another way, a do-while loop is essentially a while loop, except its body is always guaranteed to execute at least once. This is in contrast to a while loop where, if the condition is false (0) when it's first evaluated, then its body won't be executed even once. (This description is slightly wrong for pedantic reasons, but this is how many people like to think about do-while loops.)</P>

      <P>Because a do-while loop's condition isn't evaluated until <It>after</It> its body has been executed, they're particularly useful when the loop condition is determined <It>during</It> the loop body. Consider this example:</P>

      <CBlock fileName="dowhile.c">{
`#include <stdio.h>

int main() {
        int user_choice;
        do {
                printf("It's your turn. Choose an option.\\n");
                printf("1. Attack with your sword\\n");
                printf("2. Cast vicious mockery\\n");
                printf("3. Run away\\n");
                printf("Enter your choice: ");

                scanf("%d", &user_choice);

                if (user_choice < 1 || user_choice > 3) {
                        printf("\\nError: Your choice must be 1, 2, "
                                "or 3\\n\\n");
                }
        } while(user_choice < 1 || user_choice > 3);

        // ...Do something with the user's choice (e.g., check it with
        // an if statement to decide how to proceed)...
}`
      }</CBlock>

      <P>The goal of the above program is to repeatedly ask the user for an input until they provide a valid one (it assumes that they'll at least enter an integer, but it repeats the prompt until the provided integer is 1, 2, or 3). Hence, the loop's condition checks whether the user's last-supplied input was invalid (<Code>{'user_choice < 1 || user_choice > 3'}</Code>). However, this condition cannot possibly be evaluated until the user has supplied at least one input. Hence, the body of the loop must be executed before the condition can be evaluated. This is precisely how do-while loops work, hence why a do-while loop was chosen for this problem.</P>

      <P>You could accomplish the above by using a while loop instead (or even a for loop), but that's just not what they're designed for, so getting it to work would be slightly messier.</P>

      <P>Note that the condition of a do-while loop is <Ul>not</Ul> considered to be part of the scope of the do-while loop's body (perhaps that's obvious given that it's outside the curly braces of the body, but this is in contrast to how scope works with for loops, which we'll discuss in a moment). This means that any variables that you want to access within the condition of a do-while loop must be declared <Ul>before</Ul> (not within) that do-while loop. This is why I declared <Code>user_choice</Code> before the do-while loop in the above program<Emdash/>so that I could access it within the do-while loop's condition (and after the end of the do-while loop).</P>

      <P>Finally, C has <Bold>for loops</Bold>. If you're only familiar with range-based for loops (e.g., Pythonic for loops, or C++'s "enhanced" for loops), then C's more primitive style of for loops may be confusing. Let's start with the syntax:</P>

      <SyntaxBlock>{
`for (<initialization>; <condition>; <iteration>) {
    <body>
}`
      }</SyntaxBlock>

      <P>Notice that the header of the for loop (i.e., the first line in the above syntax) has three placeholders separated by <Ul>semicolons</Ul> (not commas). When the control flow reaches a for loop, here's what the program does:</P>

      <Enumerate listStyleType="decimal">
        <Item>The initialization statement (<Code>{'<initialization>'}</Code>) is executed. Commonly, this will initialize a counting / iterating variable (either a preexisting variable, or one that's declared on the spot).</Item>
        <Item>The loop condition (<Code>{'<condition>'}</Code>) is evaluated. If it's false (0), then the loop ends, proceeding to execute whatever code comes after the loop. But if it's true (nonzero), move on to step 3.</Item>
        <Item>The loop body (<Code>{'<body>'}</Code>) is executed.</Item>
        <Item>The iteration statement (<Code>{'<iteration>'}</Code>) is executed.</Item>
        <Item>Repeat from step 2.</Item>
      </Enumerate>

      <P>Notice that the initialization statement (<Code>{'<initialize>'}</Code>) is only executed once. Indeed, it's not really part of the "loop" insofar as it's never repeated. In many cases, placing the initialization statement immediately before the for loop produces the same result.</P>

      <P>After the initialization statement is executed, the program repeatedly evaluates the condition, executes the loop body, and then executes the iteration statement. It repeats these three steps in a cycle until it eventually evaluates the condition and finds it to be false (0), at which point the loop ends.</P>

      <P>For loops are a good choice for iterating through a sequence (e.g., an array or other list). Actually, that's why they're called for loops<Emdash/>they're used to execute a body of code <Ul>for each</Ul> item in a collection.</P>

      <P>We previously wrote a while loop that printed the values 1 through 5, but let's convert that to a for loop:</P>

      <CBlock fileName="for.c">{
`#include <stdio.h>

int main() {
        for (int counter = 1; counter <= 5; ++counter) {
                printf("%d\\n", counter);
        }
}`
      }</CBlock>

      <P>When the control flow encounters the for loop in the above program, it declares <Code>counter</Code> and initializes it to 1. It then checks the loop condition and finds that <Code>counter</Code> (currently 1) is indeed less than or equal to 5. So it proceeds to execute the body, printing the value of <Code>counter</Code> (1) to the terminal. It then executes the iteration statement, incrementing <Code>counter</Code> to 2. It then reevaluates the condition, finding that <Code>counter</Code> (now 2) is still less than or equal to 5, and so on. It repeats until it eventually prints 5 and then increments <Code>counter</Code> to 6. It then reevaluates the condition one last time and finds that <Code>counter</Code> (6) is <It>not</It> less than or equal to 5, at which point the loop terminates.</P>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o for for.c 
$ valgrind ./for
==1553378== Memcheck, a memory error detector
==1553378== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1553378== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==1553378== Command: ./for
==1553378== 
1
2
3
4
5
==1553378== 
==1553378== HEAP SUMMARY:
==1553378==     in use at exit: 0 bytes in 0 blocks
==1553378==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==1553378== 
==1553378== All heap blocks were freed -- no leaks are possible
==1553378== 
==1553378== For lists of detected and suppressed errors, rerun with: -s
==1553378== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)`
      }</TerminalBlock>

      <P>More generally, for loops are a good choice for count-based repetition. If you want to execute a body of code a certain number of times, then for loops can accomplish that. Here's an extremely common pattern for a for loop:</P>

      <SyntaxBlock>{
`for (int i = 0; i < N; ++i) {
    <body>
}`
      }</SyntaxBlock>

      <P>The above for loop will execute <Code>{'<body>'}</Code> a total of <Code>N</Code> times, where <Code>N</Code> can be replaced with whatever (non-negative) integer you'd like.</P>

      <P>(You might have to trace it carefully to convince yourself of this. Yes, the condition is <Code>{'i < N'}</Code> instead of <Code>{'i <= N'}</Code>, so it excludes <Code>N</Code>, but <Code>i</Code> is also initialized to 0 instead of 1, so everything adds up to a total of <Code>N</Code> iterations).</P>

      <P>And yes, the iterator variable in the above pattern is named <Code>i</Code>. Although it's usually frowned-upon to name a variable a single letter since that's not very explanatory, every experienced C programmer knows full well that a variable named <Code>i</Code> declared within a for loop header is simply meant to serve as an iterator for that for loop, so no further explanation is really necessary.</P>

      <P>Note that the iteration statement does not have to be an increment operation. You could very well put any valid C statement there, even a function call. Similarly, the condition does not have to be a less-than operation; it can be any valid condition (i.e., any expression with an integer value, where 0 is treated as false and all nonzero values are treated as true). For example, the following for loop prints the values from 10 to 1 in descending order:</P>

      <CBlock showLineNumbers={false}>{
`for (int i = 10; i > 0; --i) {
    printf("%d\\n", i);
}`
      }</CBlock>

      <P>Note that variables declared within the initialization statement of a for loop are accessible within the for loop's header and body, but <Ul>not</Ul> accessible outside the entire for loop. In some sense, these variables are scoped to the for loop as a whole. This is in contrast to variables declared within the for loop's body, which are accessible within the body but <It>not</It> within the header (nor outside the loop entirely, of course).</P>

      <P>Understand that all three kinds of loops<Emdash/>while, do-while, and for<Emdash/>are in some sense interchangeable. Any problem that can be solved with one of these kinds of loops can also be solved with the others. However, each kind of loop is designed with certain kinds of repetition tasks in mind, so you should prefer to use whichever one is most appropriate for the task at hand.</P>

      <P>Lastly, C supports nesting loops inside each other. If you nest for loops inside each other, it might be a good idea to give their iteration variables different names to avoid shadowing (e.g., the outer loop's variable might be named <Code>i</Code>, whereas the inner loop's variable might be named <Code>j</Code>). Nested for loops in particular are very useful for iterating through 2-dimensional structures (e.g., you have a list of people, each of which has a list of pets, and you need to print the names of all the pets across all people).</P>

      <SectionHeading id="break-and-continue"><Code>break</Code> and <Code>continue</Code></SectionHeading>

      <P>C has two special keywords that can be used to manipulate the control flow of loops: <Code>break</Code> and <Code>continue</Code>. These keywords can only be used within the scope of a loop, but they can be used in any kind of loop.</P>

      <P>The <Code>break</Code> keyword causes the program to immediately jump all the way past the end of the loop, terminating the loop instantly. In other words, it causes the program to jump to whatever comes immediately after the closing curly brace of the loop body.</P>

      <P>The <Code>continue</Code> keyword causes the program to immediately jump to the end of the loop body, but not <It>past</It> the end. In the case of a while loop or do-while loop, this means it jumps straight to the condition and reevaluates it. In the case of a for loop, this means it jumps to the iteration statement (and <It>then</It> the condition).</P>

      <P>These keywords are typically used inside if statements that are in turn nested within loops. For example, a <Code>break</Code> statement within an if statement within a loop can be used to cause the loop to terminate early when a certain event occurs:</P>

      <CBlock showLineNumbers={false}>{
`for (int i = 0; i < 10; ++i) {
    // ...
    // A bunch of code
    // ...
    
    if (some special thing has happened) {
        // End the loop immediately, even if it hasn't executed 10
        // times yet
        break;
    }
        
    // ...
    // A bunch more code
    // ...
}`
      }</CBlock>

      <P>However, some people say that these keywords should generally be avoided since they mess with loops' control flow in not-very-salient ways. When a programmer looks at the above for loop's header, they might be led to think that the for loop will execute exactly 10 times. However, if you dig very deeply into the loop's body, nestled between a bunch of potentially complicated code, there's a <Code>break</Code> statement that can cause the loop to terminate early. One philosophy says that control flow should be as obvious as possible<Emdash/>not buried within if statements within loop bodies, but rather displayed up front in an obvious way. <Code>continue</Code> and <Code>break</Code> violate this philsophy by allowing a loop's control flow to be modified at arbitrary points within its body, making it difficult to understand the full conditions under which the loop might terminate.</P>

      <P>But that's just one philosophy of many, and <Code>break</Code> and <Code>continue</Code> can be very useful in some cases. You may use these keywords in this course if you'd like.</P>

      <SectionHeading id="functions">Functions</SectionHeading>

      <P>To conclude our C Basics lecture content, let's talk functions. As you hopefully know, a <Bold>function</Bold> is a reusable block of code. Functions provide useful abstractions, allowing you to think about simple interfaces instead of complicated implementation details (e.g., raising one number to the power of another involves extremely complicated low-level instructions, but you don't have to think about that if you just call the <Code>pow()</Code> function). Functions also help modularize scopes and reduce code duplication, both of which can reduce coupling.</P>

      <P>To <Ul>declare</Ul> a function in C (i.e., to state its existence without fully defining it), write out the function's <Bold>prototype</Bold>. The syntax is as follows:</P>

      <SyntaxBlock>{
`<return type> <name>(<parameter 1>, <parameter 2>, ..., <parameter N>);`
      }</SyntaxBlock>

      <P>Some context: Functions are used by calling (invoking) them from within other functions, and when that happens, the two functions need to be able to communciate with one another. However, each function has its own scope (more on this in a moment), so they cannot directly access each others' automatic variables. Instead, functions pass values to each other in the form of <Bold>arguments</Bold>, <Bold>parameters</Bold>, and <Bold>return values </Bold>. Specifically, when a function A calls another function B, A supplies <Bold>arguments</Bold> (inputs) to B. These arguments are then substituted into B's pre-declared placeholders, which are called <Bold>parameters</Bold>. Finally, when B is done executing, it can send a value, known as a <Bold>return value</Bold>, back to A.</P>

      <P>In the above syntax, <Code>{'<return type>'}</Code> is the data type of the value that the function being declared will return. <Code>{'<name>'}</Code> is simply the name of the function being declared. Each <Code>{'<parameter X>'}</Code> is a parameter declaration. Parameters are simply variables that serve as placeholders for arguments (inputs) that the function being declared will receive by its caller (i.e., by another function that uses it). The parameter declarations look just like any other variable declaration, except they're separated with commas instead of being terminated with semicolons.</P>

      <P>For example, a prototype for the <Code>pow</Code> function might look something like this:</P>

      <CBlock showLineNumbers={false}>{
`double pow(double base, double exponent);`
      }</CBlock>

      <P>The return type is <Code>double</Code> because the <Code>pow()</Code> function produces a floating point number as an output. Its name is <Code>pow</Code>. Its parameters are <Code>double base</Code> and <Code>double exponent</Code> because, in order to be called (used), it needs to know what number (the base) should be raised to the power of what other number (the exponent). Hence, it has placeholders for these things (the <It>actual</It> base and exponent will be supplied as arguments by the caller).</P>

      <P>In order to use a function within a translation unit (a <Code>.c</Code> source code file), it must be accessible. Recall that symbol accessibility is dicated by scope rules. However, functions have an additional rule in standard C: <Ul>they can only be declared (and defined) in global scope</Ul>. Since all scopes are nested within global scope, this doesn't limit their accessibility in any way; so long as a function is declared in global scope above any lines of code that use it, then everything should work.</P>
      
      <P>However, functions must not only be declared, but also defined. In particular, a function must be declared above any lines of code that try to use it, but it must additionally be defined exactly once <It>somewhere</It> in the program's global scope (the exact location of the definition is not important, so long as it's in global scope; a function may even be defined below the lines of code that try to use it, or even in another <Code>.c</Code> file entirely if you know how file separation works).</P>

      <P>A function prototype, as in the above syntax, only declares a function<Emdash/>it does not define it. To define a function, use the following syntax:</P>

      <SyntaxBlock>{
`<return type> <name>(<parameter 1>, <parameter 2>, ..., <parameter N>) {
    <body>
}`
      }</SyntaxBlock>

      <P>Notice that this is the exact same syntax as that of a function prototype, except the semicolon has been replaced with curly braces containing <Code>{'<body>'}</Code>, which is the block of code that the function will execute when called. Critically, the return type, name, and parameter list in the header of a function definition <Ul>must</Ul> match the return type, name, and parameter list in the function's prototype. Otherwise, they may be considered to be two separate functions.</P>

      <P>Since a function body is enclosed in curly braces, it also has its own scope. Although the parameters (which are a kind of variable) are technically outside the curly braces of the function body, they are still considered to be scoped to the function body. That is, they're accessible within the function body and will be released from memory shortly after the function body ends (more on this in <Link href={`${PARENT_PATH}/${allPathData["pointers"].pathName}`}>a future lecture</Link>).</P>

      <P>With a few exceptions (e.g., <Code>void</Code> functions and <Code>main</Code>), every function body <Ul>must</Ul> return a value whose type matches the function's return type. To return a value, use a return statement like so:</P>

      <SyntaxBlock>{
`return <value>`
      }</SyntaxBlock>

      <P>Replace <Code>{'<value>'}</Code> with an expression whose value should be returned. When the program encounters a return statement within a function, the function <Ul>immediately</Ul> ends, and the computed return value is sent back to the function caller.</P>

      <P>Let's make this more concrete. Here's a definition for a (quite silly) function that adds two numbers together and returns the computed sum:</P>

      <CBlock showLineNumbers={false}>{
`float add(float first_number, float second_number) {
    return first_number + second_number;
}`
      }</CBlock>

      <P><Code>first_number</Code> is a placeholder for a floating point number that will be supplied to this function when it's (eventually) called / used. <Code>second_number</Code> is a placeholder for another such floating point number. The function then adds these two numbers together and returns the result.</P>

      <P>Remember: A return statement ends the function <Ul>immediately</Ul>. This means that any lines of code appearing directly below a return statement reflect <Bold>dead code</Bold> (or <Bold>unreachable code</Bold>; i.e., useless code that cannot possibly be executed). For example, the below function, if executed, would <Ul>not</Ul> print "Hello, World!" to the terminal because the function would terminate before reaching the <Code>printf()</Code> call:</P>

      <CBlock showLineNumbers={false}>{
`float add(float first_number, float second_number) {
    return first_number + second_number;
    printf("Hello, World!\\n"); // Useless / dead / unreachable code!
}`
      }</CBlock>

      <P>If a function has been declared and defined in a <Code>.c</Code> file, then it can be called (used) within any other function body anywhere below its declaration (or even within its own body, as in recursion). To call a function, use the following syntax:</P>

      <SyntaxBlock>{
`<name>(<argument 1>, <argument 2>, ..., <argument N>)`
      }</SyntaxBlock>

      <P><Code>{'<name>'}</Code> is the name of the function you'd like to call, and each <Code>{'<argument X>'}</Code> is an argument<Emdash/>an expression whose value will be copied into the corresponding function parameter. The number of arguments in the function call usually must match the number of parameters in function's prototype and definition header. Moreover, arguments are copied into parameters in left-to-right order, so the types of the arguments must be compatible with the types of the parameters in left-to-right order.</P>

      <P>For example, the above <Code>add</Code> function might be called (used) to add <Code>3.5</Code> to <Code>-8.1</Code> like so: <Code>add(3.5, -8.1)</Code>. In such a case, <Code>3.5</Code> will be copied into the <Code>first_number</Code> parameter, and <Code>-8.1</Code> will be copied into the <Code>second_number</Code> parameter.</P>

      <P>Some terminology: The place where a function is called is referred to as the <Bold>call site</Bold>. And, more generally, when a function is called, the function that <It>called</It> it is referred to as the <Bold>function caller</Bold>.</P>

      <P>When a program reaches a function call, the function caller effectively <It>pauses</It>, and the control flow jumps up to the body of the newly called function. At the same time, the arguments in the function call are evaluated, and their values are copied into the corresponding parameters. Again, this happens in left-to-right order. The newly called function body then begins executing. Eventually, it will reach a return statement, ending the function. When that happens, the return value is computed and sent back to the function caller. The function caller then resumes, and the entire function call itself is treated as an expression whose value is equal to the aforementioned return value. That's how functions communicate in C<Emdash/>when function A calls function B, arguments in the function call within A are copied into the parameters of function B, and the return value of function B is substituted into the entire function call as an expression within function A.</P>

      <P>Putting that all together, assuming the <Code>add</Code> function has been properly declared and defined, the following line of code would print (roughly) <Code>-4.6</Code> to the terminal:</P>

      <CBlock showLineNumbers={false}>{
`printf("%f\\n", add(3.5, -8.1));`
      }</CBlock>

      <P>Let's trace it to understand why: when the program reaches the above line of code (wherever it is), the function that contains it will pause, and the <Code>add</Code> function's body will begin. At that moment, <Code>3.5</Code> is copied into the <Code>first_number</Code> parameter, and <Code>-8.1</Code> is copied into the <Code>second_number</Code> parameter. The <Code>add</Code> function then computes <Code>first_number + second_number</Code>, which is <Code>-4.6</Code>, and returns it. When the <Code>add</Code> function returns, the original function containing the above <Code>printf</Code> call resumes, and <Code>add(3.5, -8.1)</Code> is substituted with the return value, which, in this case, is <Code>-4.6</Code>. That value is then passed into the <Code>printf</Code> function, substituted into the <Code>%f</Code> format specifier, and printed to the terminal.</P>

      <P>Of course, function call values do not have to be printed. You can do whatever you'd like with them. For example, you can store the value of a function call in a variable:</P>

      <CBlock showLineNumbers={false}>{
`float sum = add(3.5, -8.1);`
      }</CBlock>

      <P>Since function calls are expressions and therefore have values, they can also be used as arguments within other function calls. For example, <Code>add(add(3.5, -8.1), 5.2)</Code> will compute the inner call <Code>add(3.5, -8.1)</Code>, which is <Code>-4.6</Code> as we just discussed. It will then proceed to substitute in the <Code>-4.6</Code> and compute the outer call, <Code>add(-4.6, 5.2)</Code>. The final value would be (roughly) <Code>0.6</Code>.</P>

      <P>Here's a complete program that illustrates a more useful example of a function:</P>

      <CBlock fileName="functions.c">{
`#include <stdio.h>

// Prompts the user for an integer between two values, 'low' and
// 'high' (inclusive), reprompting if they provide an integer outside
// of this range.
// Prototype:
int prompt_for_integer_in_range(int low, int high);

// Definition:
int prompt_for_integer_in_range(int low, int high) {
        int user_input;
        do {
                // Prompt user
                printf(
                        "Enter an integer between %d and %d: \\n",
                        low,
                        high
                );

                // Receive input
                scanf("%d", &user_input);

                // Print error message if invalid
                if (user_input < low || user_input > high) {
                        printf("\\nError: Provided input outside of "
                                "specified range.\\n\\n");
                }
        } while (user_input < low || user_input > high);

        // Loop terminated, meaning user_input is valid. Return it.
        return user_input;
}

int main() {
        // Ask the user for an integer between 1 and 10
        int num_between_1_and_10 = prompt_for_integer_in_range(1, 10);

        // Ask the user for an integer between 5 and 57
        int num_between_5_and_57 = prompt_for_integer_in_range(5, 57);

        // And so on...
}`
      }</CBlock>

      <P>And here's an example output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -o functions functions.c 
$ valgrind ./functions 
==1691334== Memcheck, a memory error detector
==1691334== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1691334== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==1691334== Command: ./functions
==1691334== 
Enter an integer between 1 and 10: 
0

Error: Provided input outside of specified range.

Enter an integer between 1 and 10: 
11

Error: Provided input outside of specified range.

Enter an integer between 1 and 10: 
1
Enter an integer between 5 and 57: 
4

Error: Provided input outside of specified range.

Enter an integer between 5 and 57: 
58

Error: Provided input outside of specified range.

Enter an integer between 5 and 57: 
17
==1691334== 
==1691334== HEAP SUMMARY:
==1691334==     in use at exit: 0 bytes in 0 blocks
==1691334==   total heap usage: 2 allocs, 2 frees, 2,048 bytes allocated
==1691334== 
==1691334== All heap blocks were freed -- no leaks are possible
==1691334== 
==1691334== For lists of detected and suppressed errors, rerun with: -s
==1691334== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)`
      }</TerminalBlock>

      <P>In some cases, you'll find yourself wanting to create a function that doesn't return any value at all. For example, perhaps you want to create a function that just carefully formats and prints some data to the terminal; such a function does not compute any results, so it might not have anything useful to send back to the call site (or, put another way, the function sends its outputs to the terminal to be printed instead of sending them back to the function caller).</P>

      <P>This is fully possible. All you have to do is specify the function's return type as <Code>void</Code>. A function with a <Code>void</Code> return type does not necessarily need to have any return statements whatsoever. It will simply end when the body reaches its closing curly brace. For example:</P>

      <CBlock fileName="void.c">{
`#include <stdio.h>

// Prototype
void print_quadratic_equation(float a, float b, float c);

// Definition
void print_quadratic_equation(float a, float b, float c) {
        printf("%.1fx^2 + %.1fx + %.1f = 0\n", a, b, c);
}

int main() {
        print_quadratic_equation(2, 4, 7);
}
`
      }</CBlock>

      <P>Notice that <Code>print_quadratic_equation</Code> has no return statements, but that's okay since its return type is <Code>void</Code>.</P>

      <P>Running the above program produces the following output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o void void.c 
$ valgrind ./void
==1695612== Memcheck, a memory error detector
==1695612== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1695612== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==1695612== Command: ./void
==1695612== 
2.0x^2 + 4.0x + 7.0 = 0
==1695612== 
==1695612== HEAP SUMMARY:
==1695612==     in use at exit: 0 bytes in 0 blocks
==1695612==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==1695612== 
==1695612== All heap blocks were freed -- no leaks are possible
==1695612== 
==1695612== For lists of detected and suppressed errors, rerun with: -s
==1695612== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)`
      }</TerminalBlock>

      <P>Although <Code>void</Code> functions do not have to have any return statements, they <It>may</It> have return statements. However, if they do, those return statements should be not be accompanied by a return value (since <Code>void</Code> functions, by definition, do not return values). Instead, to use a return statement in a <Code>void</Code> function, simply write <Code>return;</Code>. The purpose of such a return statement is just to end the function early (recall that return statements immediately end the function). For example, you might write such a return statement inside an if statement to end the function early if some special event occurs.</P>

      <P>But keep in mind that this is a special property of <Code>void</Code> functions. Non-<Code>void</Code> functions usually must end by returning a value<Emdash/>not by reaching the closing curly brace. Similarly, non-<Code>void</Code> functions may not use return statements without return values (i.e., <Code>return;</Code>, with no value, is forbidden in non-<Code>void</Code> functions).</P>

      <P>In fact, if a non-<Code>void</Code> function terminates without returning a value, then undefined behavior will ensue, at least if the return value is used at the call site. To avoid this mistake, make sure to compile your programs with the <Code>-Wall</Code> flag or similar. One of the warnings enabled by this flag notifies you whenever you accidentally write a non-<Code>void</Code> function that's theoretically capable of terminating without returning a value. <Code>gcc</Code> is particularly stringent about these particular warnings; even this example invokes a warning:</P>

      <CBlock fileName="missingreturn.c">{
`#include <stdio.h>

float foo(int x);

float foo(int x) {
        if (x == 1) {
                return 1.0;
        }
        if (x != 1) {
                return 2.0;
        }
}

int main() {
        foo(5);
}`
      }</CBlock>

      <P>If we compile the above program using <Code>gcc</Code> with the <Code>-Wall</Code> flag, we get the following result:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o missingreturn missingreturn.c 
missingreturn.c: In function ‘foo’:
missingreturn.c:12:1: warning: control reaches end of non-void function [-Wreturn-type]
   12 | }
      | ^`
      }</TerminalBlock>

      <P>This warning is saying that it might be possible for the <Code>foo</Code> function body to, in some context, reach its closing curly brace without returning a value. Of course, that's not <It>actually</It> possible (for the most part) given that any integer <Code>x</Code> must either be equal to 1, in which case it will return <Code>1.0</Code>, or not equal to 1, in which case it will return <Code>2.0</Code>. However, the compiler isn't "smart" enough to apply this logical reasoning and deduce that <Code>foo()</Code> will always return a value. (And, technically, if <Code>x</Code> is modified asynchronously between the two if statements, such as by another thread or signal handler, then <Code>foo</Code> actually might <It>not</It> return a value).</P>

      <P>To make the compiler happy (and to be absolutely certain that our non-<Code>void</Code> function always returns a value, as it should), we could replace the second <Code>if</Code> statement with an <Code>else</Code> statement:</P>

      <CBlock fileName="elsereturn.c" highlightLines="{7}">{
`#include <stdio.h>

float foo(int x);

float foo(int x) {
        if (x == 1) {
                return 1.0;
        }
        else {
                return 2.0;
        }
}

int main() {
        foo(5);
}`
      }</CBlock>

      <P>Perhaps the compiler isn't <It>very</It> well informed, but even it knows that in an if-elseif-else chain, exactly one of the if / else-if / else statements will execute. If each one of them returns a value, then it can be certain that a value will always be returned by the function. And if the types of all those possible return values match the return type of the function, then the compiler will be happy.</P>

      <P>There are other solutions as well. For example, we could have done this:</P>

      <CBlock showLineNumbers={false}>{
`
float foo(int x) {
        if (x == 1) {
                return 1.0;
        }
        return 2.0;
}`
      }</CBlock>

      <P>Or even this:</P>

      <CBlock showLineNumbers={false}>{
`float foo(int x) {
        float result;
        if (x == 1) {
                result = 1.0;
        }
        else {
                result = 2.0;
        }
        return result;
}`
      }</CBlock>

      <P>Both are equivalent. In either of the above cases, the compiler sees an unconditional return statement at the end of the function, so it can be confident that the function will never terminate without returning a value.</P>

      <P>As you might have just noticed, it's okay for a function to have several return statements (e.g., spread across several if statement bodies). However, keep in mind that at most one of them will execute (and, in the case of a non-<Code>void</Code> function, hopefully <It>exactly</It> one of them will execute) since, when a return statement executes, the entire function immediately ends.</P>

      <P>Next, I should mention something that I glossed over earlier: a function prototype serves as declaration for a function, but not a definition. However, a function definition <It>also</It> serves as a form of declaration. That's to say, in some cases, function prototypes are unnecessary since the definition itself declares the function's existence. And maybe that doesn't surprise you; the headers in our function definitions are identical to the respective functions' prototypes, so it makes sense that the prototypes are sometimes redundant.</P>

      <P>For example, we could delete or comment out the prototype in the previous program, and the program would still compile and run just fine:</P>

      <CBlock fileName="elsereturn.c" highlightLines="{3,5}">{
`#include <stdio.h>

// float foo(int x); // Commented out the prototype; it's redundant.

// This definition itself serves as a valid form of declaration
float foo(int x) {
        if (x == 1) {
                return 1.0;
        }
        else {
                return 2.0;
        }
}

int main() {
        foo(5);
}`
      }</CBlock>

      <P>However, there are two important things to consider. First, since functions must be declared above any other lines of code that call / use them, omitting function prototypes requires <It>defining</It> functions in a very careful order (since the definitions are serving as your declarations, and the various defined functions will likely need to call / use each other). In contrast, if you write out prototypes explicitly, you can simply put <It>all</It> of your function prototypes at the very top of your <Code>.c</Code> file (in any order), and then the definitions can appear below that (again, in any order). So if you keep the function prototypes, you don't have to think too much about ordering<Emdash/>just put the prototypes at the top of the file, usually below all your <Code>#include</Code> directives, and put the definitions below that.</P>

      <P>Second, function prototypes are crucial for file separation. That is, if you want to write a C program that consists of many source code files instead of putting all your code in one gigantic source code file, then you have to make use of function prototypes to accomplish that. You'll learn how to do this in a future lecture.</P>

      <P>A couple more things. First, there's a minor detail I mentioned a while ago, but I should remind you since we're talking about functions: I said that non-<Code>void</Code> functions must terminate by returning a value instead of by reaching the closing curly brace, but what about <Code>main</Code>? <Code>main</Code> is the entry point to a C program, but it's still a function nonetheless, and its return type is <Code>int</Code>. Well, remember that the <Code>main</Code> function has a special rule: its return value indicates the program's exit code, and if it reaches its closing curly brace without returning a value, it automatically returns 0, indicating the program's successful completion. This is why <Code>gcc</Code> does not issue any warnings about <Code>main</Code> failing to return a value<Emdash/>it <It>does</It> return a value, just implicitly and automatically. Though, as discussed earlier, you can optionally have it return a different exit code explicitly to indicate various kinds of errors.</P>

      <P>Finally, there's an extremely important rule that you should <Ul>always</Ul> remember when writing functions in C (and I'll remind you of this in the <Link href={`${PARENT_PATH}/${allPathData["pointers"].pathName}`}>lecture on pointers</Link>): <Ul>parameters are copies of their arguments</Ul>. (And, similarly, a function call expression value should be treated as a copy of the called function's return value... But that doesn't roll of the tongue as easily, and it's usually less important than the fact that <Ul>parameters are copies of their arguments</Ul>). Seriously, please remember this: <Ul>parameters are copies of their arguments.</Ul> Say it ten more times and let it sink in. Somehow, someone will forget this, and I'll have to remind them in office hours several weeks from now when their functions aren't working properly. Don't let that be you. Remember: <Ul>parameters are copies of their arguments</Ul>.</P>

      <P>What does this mean? Well, let me show you:</P>

      <CBlock fileName="parametersarecopiesofarguments.c">{
`#include <stdio.h>

void change_to_100(int x) {
        x = 100;
}

int main() {
        int x = 5;
        change_to_100(x);
        printf("The value of x is: %d\\n", x);
}
`
      }</CBlock>

      <P>What do you think will be printed when the above program is executed? Think about it for a moment, and as you do, remember: parameters are copies of their arguments.</P>

      <P>Now, here's the output:</P>

      <TerminalBlock copyable={false}>{
`(env) guyera@flip1:c-basics$ gcc -Wall -g -o parametersarecopiesofarguments parametersarecopiesofarguments.c 
(env) guyera@flip1:c-basics$ valgrind ./parametersarecopiesofarguments 
==2468868== Memcheck, a memory error detector
==2468868== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2468868== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2468868== Command: ./parametersarecopiesofarguments
==2468868== 
The value of x is: 5
==2468868== 
==2468868== HEAP SUMMARY:
==2468868==     in use at exit: 0 bytes in 0 blocks
==2468868==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==2468868== 
==2468868== All heap blocks were freed -- no leaks are possible
==2468868== 
==2468868== For lists of detected and suppressed errors, rerun with: -s
==2468868== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)`
      }</TerminalBlock>

      <P>It prints 5, not 100! There's a very simple reason for this. The parameter of the <Code>change_to_100</Code> function, <Code>x</Code>, is <Ul>not</Ul> the same thing as the argument that's supplied to it in the function call within <Code>main</Code>. The argument that's supplied to it is also coincidentally named <Code>x</Code>, but critically, these are two separate variables. Yes, they have the same name, but they're separate variables nonetheless. In fact, they're declared in two completely different scopes, so they must be separate variables.</P>

      <P>Then what's the relationship between the parameter <Code>x</Code> and the argument <Code>x</Code>? Well, I already told you: <Ul>parameters are copies of their arguments</Ul>. The parameter <Code>x</Code> is a <Ul>copy</Ul> of the argument <Code>x</Code>. The argument <Code>x</Code> has value <Code>5</Code>, so the parameter <Code>x</Code> also has value <Code>5</Code><Emdash/>it's a copy. The value of the parameter <Code>x</Code> is then changed to <Code>100</Code>. But it's not the same variable as the argument; it's a <Ul>copy</Ul> of that variable. Hence, when the parameter <Code>x</Code> is changed to <Code>100</Code>, the argument <Code>x</Code>, which exists within the <Code>main</Code> function's scope, is left unchanged. It's still <Code>5</Code>. Back in <Code>main</Code>, we finish by printing the value of that original <Code>x</Code> variable. It's still <Code>5</Code>, so it prints <Code>5</Code> accordingly.</P>

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
