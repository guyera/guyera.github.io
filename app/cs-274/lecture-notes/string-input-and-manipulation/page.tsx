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
        <Item><Link href="#the-standard-input-buffer">The standard input buffer</Link></Item>
        <Item><Link href="#scanf">String user input with <Code>scanf</Code></Link></Item>
        <Item><Link href="#getline"><Code>getline</Code></Link></Item>
        <Item><Link href="#fgets"><Code>fgets</Code></Link></Item>
        <Item><Link href="#string-h"><Code>string.h</Code></Link></Item>
        <Item><Link href="#strcmp"><Code>strcmp</Code></Link></Item>
        <Item><Link href="#strcpy"><Code>strcpy</Code></Link></Item>
        <Item><Link href="#strcat"><Code>strcat</Code></Link></Item>
        <Item><Link href="#sprintf"><Code>sprintf</Code></Link></Item>
        <Item><Link href="#strstr"><Code>strstr</Code></Link></Item>
        <Item><Link href="#strtol-strtod"><Code>strtol</Code> and <Code>strtod</Code></Link></Item>
        <Item><Link href="#islower-and-isupper"><Code>islower</Code> and <Code>isupper</Code></Link></Item>
        <Item><Link href="#strtok_r"><Code>strtok_r</Code></Link></Item>
        <Item><Link href="#pointer-to-middle">Pointer to the middle of a string</Link></Item>
        <Item><Link href="#and-more">And more!</Link></Item>
      </Itemize>

      <SectionHeading id="the-standard-input-buffer">The standard input buffer</SectionHeading>

      <P>When a process (running program) first starts, it's given a standard input stream, standard output stream, and standard error stream. We've talked about these streams before. They're usually hooked up to the terminal by default. Standard input is where user input is read from when you use <Code>scanf</Code>, for example.</P>

      <P>Every open file description, including those for the three standard streams, contains an integer known as a <Bold>file offset</Bold>. This integer keeps track of where in the file (or file stream) the file description is currently pointing to. Whenever bytes are written to or read from the file through the file description, they're read from / written to the location that the file offset refers to, and the file offset is incremented by the number of bytes written or read accordingly.</P>

      <P>That's to say, there's essentially an imaginary little "cursor" that traverses the file (or file stream) as the process reads from it or writes to it.</P>

      <P>Whenever the user types something into the terminal and presses enter, that text gets stored in a buffer associated with the process's standard input file stream. <Code>scanf</Code> (and similar functions) simply reads from that buffer starting at the character that the standard input stream's file offset currently points to, and then traverses the file offset forward accordingly.</P>

      <P>At the start of the program, the process's file offset for its standard input file stream simply points to the very beginning of the user's inputs. Hence, the first time the program calls <Code>scanf</Code>, it will read the first input provided by the user. But when it does so, the file offset (the imaginary "cursor") traverses forward by the amount of bytes that were read. That way, when the program calls <Code>scanf</Code> a second time, it reads the user's <It>second</It> input. And when it calls <Code>scanf</Code> a third time, it reads the user's <It>third</It> input. And so on.</P>

      <P>Knowing all that, suppose a program uses <Code>scanf("%d", &x)</Code> to read a single input from the user, but the user (for some reason) provides several inputs all in one line (e.g., perhaps they type in <Code>7 12 -2 3.14 hello</Code>). The <Code>scanf</Code> call will read the first of the user's many inputs and traverse the standard input file offset accordingly, but the remaining inputs (<Code> 12 -2 3.14 hello</Code>, in the previous example) remain in the standard input buffer. If <Code>scanf</Code> is called again, it will pick up where it left off, reading the second of the user's many supplied inputs from earlier (<Code>12</Code>, in the running example) and traversing the file offset further forward.</P>

      <P>This is often a source of confusion. There could be thousands of lines of code between the first <Code>scanf</Code> call and the secone. Even so, the second call will always pick up in the standard input buffer where the first call left off. (There are ways of forcibly clearing the buffer to discard extraneous contents, but we won't discuss that.)</P>

      <P>Here's an example program to demonstrate:</P>

      <CBlock fileName="inputbuffer.c">{
`#include <stdio.h>

int main(void) {
        int x;

        // Read the user's first integer input
        scanf("%d", &x);
        printf("%d\\n", x); // Print the user's input value back to them

        // Perhaps there are 1 million lines of code here

        int y;
        // This will pick up where the previous scanf call left off in the
        // standard input buffer, reading the user's second integer input
        scanf("%d", &y);
        printf("%d\\n", y); // Print the user's input value back to them
}
`
      }</CBlock>

      <P>Here's a possible output (the user typed in <Code>7 12 -2 3.14 hello</Code> in this output example):</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o inputbuffer inputbuffer.c 
$ valgrind ./inputbuffer
==2468765== Memcheck, a memory error detector
==2468765== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2468765== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2468765== Command: ./inputbuffer
==2468765== 
7 12 -2 3.14 hello
7
12
==2468765== 
==2468765== HEAP SUMMARY:
==2468765==     in use at exit: 0 bytes in 0 blocks
==2468765==   total heap usage: 2 allocs, 2 frees, 2,048 bytes allocated
==2468765== 
==2468765== All heap blocks were freed -- no leaks are possible
==2468765== 
==2468765== For lists of detected and suppressed errors, rerun with: -s
==2468765== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <SectionHeading id="scanf">String user input with <Code>scanf</Code></SectionHeading>

      <P>Suppose you want to write a program that reads and processes arbitrary string inputs provided by the user.</P>

      <P>It's possible, though generally a terrible idea, to use <Code>scanf</Code> to read string inputs from the user. I'm going to show you how to do it for the sake of completeness, but you have to promise me that you'll never actually do it in practice (unless it's some special circumstance, like wherein standard input is redirected to a file with a guaranteed format, and you really know what you're doing).</P>

      <P>To do it, call <Code>scanf</Code> and provide <Code>%s</Code> as a format specifier in the format string. For the second argument, supply a pointer to the base address of a (writable) character array. <Code>scanf</Code> will then read a <Ul>single word</Ul> from the user and store it in the array whose base address was provided. <Code>scanf</Code> will automatically null-terminate the character array for you, forming a proper C string.</P>

      <P>When I say that it reads a "single word", I mean as delimited by whitespace. In most cases, when <Code>scanf</Code> is told to read a single input, it starts by skipping past / ignoring any leading whitespace (spaces, tabs, newline character sequences, etc) in the input buffer. It will then start reading non-whitespace characters until it encounters an invalid character for the given format specifier (e.g., a decimal point for a <Code>%d</Code> format specifier) or more whitespace characters. Once it encounters an invalid or whitespace character, it simply stops reading from the buffer, and it leaves that invalid / whitespace character in the buffer with the file offset pointing to it. Finally, it parses whatever characters it consumed, converting them to the appropriate data type and storing them in the variable pointed to by the corresponding pointer argument.</P>

      <P>Hence, if the program executes <Code>scanf("%s", some_char_array)</Code> and the user types in <Code>Hello, World!</Code>, <Code>scanf</Code> will read the <Code>Hello,</Code> part (storing it in <Code>some_char_array</Code> as a C string) and leave the rest in the standard input buffer. A subsequent <Code>scanf("%s", some_other_char_array)</Code> call will skip the leading space character, and then read <Code>World!</Code> (storing it in <Code>some_other_char_array</Code>).</P>

      <P>Crucially, if the character array supplied to <Code>scanf</Code> is not large enough to store the word entered by the user, <Ul>it will simply invoke a buffer overflow</Ul>, storing characters of user input beyond the bounds of the character array. This is one of many reasons why using <Code>scanf</Code> to read string inputs is a terrible idea (honestly, <Code>scanf</Code> should usually be avoided even when reading non-string inputs due to its poor error-handling interface).</P>

      <P>(If that character array is on the stack, a malicious user may be able to exploit the buffer overflow to manipulate function return addresses and cause the process to execute carefully injected machine instructions<Emdash/>an ACE exploit, which is a massive security vulnerability.)</P>

      <P>Here's a demonstration, but please don't do this:</P>

      <CBlock fileName="scanfstring.c">{
`#include <stdio.h>

int main(void) {
        printf("Enter your two favorite words, separated "
                "by any whitespace: ");

        // These character arrays can each store 255 characters of string
        // content, plus a null terminator
        char first_word[256];
        char second_word[256];

        scanf("%s", first_word);
        scanf("%s", second_word);

        printf("Your first word was: %s\\n", first_word);
        printf("Your second word was: %s\\n", second_word);
}
`
      }</CBlock>

      <P>Here's an example output:</P>
      
      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o scanfstring scanfstring.c 
$ valgrind ./scanfstring 
==2520779== Memcheck, a memory error detector
==2520779== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2520779== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2520779== Command: ./scanfstring
==2520779== 
Enter your two favorite words, separated by any whitespace: Hello, World!
Your first word was: Hello,
Your second word was: World!
==2520779== 
==2520779== HEAP SUMMARY:
==2520779==     in use at exit: 0 bytes in 0 blocks
==2520779==   total heap usage: 2 allocs, 2 frees, 2,048 bytes allocated
==2520779== 
==2520779== All heap blocks were freed -- no leaks are possible
==2520779== 
==2520779== For lists of detected and suppressed errors, rerun with: -s
==2520779== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <SectionHeading id="getline"><Code>getline</Code></SectionHeading>

      <P>A much better way<Emdash/>perhaps the best way<Emdash/>to read string user inputs is via the <Code>getline</Code> function, provided by <Code>stdio.h</Code>. It reads an entire line of text from a specified file stream (e.g., standard input). It accepts three arguments: 1) A pointer that stores the address <It>of a character pointer</It> (yes, a <Code>char**</Code> value); 2) A pointer that stores the address of a <Code>size_t</Code> variable (i.e., a <Code>size_t*</Code> value); and 3) a pointer to a file stream from which you'd like to read a line of text. In most cases, when the goal is to read from standard input (the terminal), the character pointer <It>that the first argument points to</It> should be initialized to <Code>NULL</Code>; the <Code>size_t</Code> variable that the second argument points to should be initialized to 0, and the third argument should simply be the builtin constant <Code>stdin</Code> (it's a file stream pointer that refers to the process's standard input). Finally, its return type is <Code>ssize_t</Code> (which stands for "signed size type").</P>

      <P>(The <Code>ssize_t</Code> type is provided indirectly by <Code>stdio.h</Code>, but you may need to additionally include <Code>sys/types.h</Code> in order to make LSP systems (e.g., intellisense) happy in Windows development environments).</P>

      <P>In other words, you can call <Code>getline</Code> to read a line of text from the user like so (for example):</P>

      <CBlock showLineNumbers={false}>{
`#include <stdio.h>
#include <sys/types.h>

// We will pass the ADDRESS of this as the first arg to getline
char* line = NULL;

// We will pass the ADDRESS of this as the second arg to getline
size_t n = 0;

// Now we call getline, passing stdin (standard input) as the third arg,
// storing its return value in a variable of type ssize_t (called len here,
// which will be explained shortly).
ssize_t len = getline(&line, &n, stdin);`
      }</CBlock>

      <P>As you might've guessed, the reason that <Code>line</Code> and <Code>n</Code> are passed by pointer is so that the <Code>getline</Code> function can <Ul>modify</Ul> them (this is a very common reason for passing things around by pointer). And, indeed, <Code>getline</Code> will do precisely that. On success, when the above <Code>getline</Code> call is done executing:</P>

      <Enumerate listStyleType="decimal">
        <Item><Code>line</Code> will store the base address of a brand new <Ul>dynamically allocated</Ul> character array containing a (null-terminated) C string representing an entire line of text that was read from standard input (e.g., supplied by the user).</Item>
        <Item><Code>n</Code> will store the size (number of bytes; equivalently, number of characters) of the dynamically allocated character array that <Code>line</Code> now points to.</Item>
        <Item><Code>len</Code> (the stored return value) will store the length of the <Ul>contents</Ul> of the C string that <Code>line</Code> now points to (i.e., the number of characters in the line of text entered by the user, not including the injected null terminator). This will always be strictly less than <Code>n</Code>. This saves you a call to <Code>strlen</Code> if you subsequently need to know the length of the string (and you often do).</Item>
      </Enumerate>

      <P><Code>getline</Code> is a very clever function. It determines the amount of characters contained in the line of text entered by the user, and it dynamically allocates a character array that's big enough to store all of those characters as well as at least one null terminator. It stores said characters in the array, and then it then updates the character pointer whose address was supplied as the first argument, causing to point to that dynamically allocated array. The dynamic sizing of the character array according to the length of the line of text means that there's no chance of a buffer overflow occurring as a result of the user typing in a large number of characters (unlike with <Code>scanf</Code>).</P>

      <P>However, there's a convenience tradeoff: any call to <Code>getline</Code> can allocate dynamic memory, and <Ul>you're responsible for freeing it</Ul>. That's to say, once the program is done with the C string containing the user's supplied line of text, it must use the <Code>free()</Code> function to free it, or else your program will have a memory leak.</P>

      <P>Here's an example:</P>

      <CBlock fileName="getline.c">{
`#include <stdlib.h> // For free()
#include <stdio.h>
#include <sys/types.h>

int main(void) {
        char* line = NULL;
        size_t n = 0;
        printf("Give me a fun quote: ");

        ssize_t len = getline(&line, &n, stdin);

        printf("Your quote was: %s\\n", line);
        printf("%ld bytes were allocated to the character array to store "
                "the line of text\\n", n);

        // The program is done with the line of text, so we should free
        // it
        free(line);

        // I know, this program is boring. We'll learn how to do more
        // interesting things with strings soon.
}
`
      }</CBlock>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o getline getline.c 
$ valgrind ./getline 
==2594795== Memcheck, a memory error detector
==2594795== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2594795== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2594795== Command: ./getline
==2594795== 
Give me a fun quote: The epic highs and lows of high school football
Your quote was: The epic highs and lows of high school football

120 bytes were allocated to the character array to store the line of text
==2594795== 
==2594795== HEAP SUMMARY:
==2594795==     in use at exit: 0 bytes in 0 blocks
==2594795==   total heap usage: 3 allocs, 3 frees, 2,168 bytes allocated
==2594795== 
==2594795== All heap blocks were freed -- no leaks are possible
==2594795== 
==2594795== For lists of detected and suppressed errors, rerun with: -s
==2594795== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Before we move on, we should discuss error handling. <Code>getline</Code> can fail. And maybe that's obvious; for one, it allocates dynamic memory, which can fail if there isn't a sufficiently large contiguous unallocated block on the heap. There are other reasons that it can fail as well (which we won't get into right now). In any case, <Code>getline</Code> will return <Code>-1</Code> and leave the input stream as-is if it fails to read a line of text from it. This is why the return type is <Code>ssize_t</Code> instead of just <Code>size_t</Code>; the former can represent negative values, but the latter can't. It's a good idea to always check the return value for errors:</P>

      <CBlock fileName="getline.c" highlightLines="{11-18}">{
`#include <stdlib.h> // For free()
#include <stdio.h>
#include <sys/types.h>

int main(void) {
        char* line = NULL;
        size_t n = 0;
        printf("Give me a fun quote: ");

        ssize_t len = getline(&line, &n, stdin);
        if (len == -1) {
                printf("Error on getline()\\n");
                // Provided by stdlib.h; ends the entire program with
                // exit status 1. Obviously, this isn't what you should
                // ALWAYS do when getline() fails, but this is just a
                // demo.
                exit(1);
        }

        printf("Your quote was: %s\\n", line);
        printf("%ld bytes were allocated to the character array to store "
                "the line of text\\n", n);

        // The program is done with the line of text, so we should free
        // it
        free(line);

        // I know, this program is boring. We'll learn how to do more
        // interesting things with strings soon.
}
`
      }</CBlock>

      <P>Now, you might have noticed a couple funny things about the above program's output. First of all, the quote <Code>The epic highs and lows of high school football</Code> has a total of 47 characters (including the letters and spaces), and a single <Code>char</Code> always occupies a single byte of space, and yet a whopping 120 bytes were allocated for the array. Indeed, <Code>getline</Code> can, and often does, allocate more memory than is technically necessary to store the user's provided line of text. There are good reasons for this (e.g., to prioritize runtime efficiency over memory efficiency in its dynamic allocation strategy), but we won't get into the details.</P>

      <P>More importantly, take a close look at the program's output:</P>

      <TerminalBlock copyable={false}>{
`Give me a fun quote: The epic highs and lows of high school football
Your quote was: The epic highs and lows of high school football

120 bytes were allocated to the character array to store the line of text`
      }</TerminalBlock>

      <P>Notice: There's an extra empty line between the printed quote and the subsequent printout about the number of allocated bytes. There's a good reason for this. Earlier, I mentioned that <Code>scanf</Code> skips leading whitespace and leaves trailing whitespace in the buffer. <Code>getline</Code>, in contrast, reads and retrieves all whitespace that it encounters, <Ul>including the newline character sequence (<Code>\n</Code>) at the end of the user's line of text.</Ul></P>

      <P>The result? In the above program run, the dynamic array that <Code>line</Code> points to actually has 48 characters of string content: the 47 characters of letters and spaces in the user's provided quote, and a single <Code>\n</Code> character. Indeed, if we were to print the value of <Code>len</Code> (e.g., <Code>printf("%ld\n", len)</Code>, it would print <Code>48</Code>. There's also a null terminator, <Code>\0</Code>, in the character array following the <Code>\n</Code>, but that's not part of the string's "contents" by definition.</P>

      <P>(Windows and other platforms that use DOS-style line endings, the string would actually have 49 characters of string content. More on this in a moment.)</P>

      <P>When the program then calls <Code>printf("Your quote was: %s\n", line)</Code>, it ends up printing <Ul>two</Ul> newline character sequences: 1) the one stored in the C string that <Code>line</Code> points to, and 2) the one at the end of the format string supplied as the first argument to <Code>printf</Code>.</P>

      <P>Of course, if we just wanted to get rid of the extra empty line in the program's output, we could just omit the <Code>\n</Code> from the end of our format string in the <Code>printf</Code> call. But often times, the program needs to do more to the user's input than just print it back out to them. For instance, programs often need to parse the user's input and respond accordingly. In such a case, the newline character sequence at the end of the C string can confuse the parsing code.</P>

      <P>Hence, it's often a good idea to trim the newline character sequence at the end of the C string by replacing it with a null terminator. The trouble, though, is that different platforms represent newline character sequences in different ways. On Unix-like systems, a newline character sequence is simply a single line feed character. But on Windows, which uses DOS-style line endings, a newline character sequence is a sequence of two characters: a carriage return character, followed by a line feed character.</P>

      <P>So, to properly trim the newline character sequence at the end of the C string in a platform-independent way, you have to be a bit clever:</P>

      <CBlock fileName="getline.c" highlightLines="{20-32}">{
`#include <stdlib.h> // For free()
#include <stdio.h>
#include <sys/types.h>

int main(void) {
        char* line = NULL;
        size_t n = 0;
        printf("Give me a fun quote: ");

        ssize_t len = getline(&line, &n, stdin);
        if (len == -1) {
                printf("Error on getline()\\n");
                // Provided by stdlib.h; ends the entire program with
                // exit status 1. Obviously, this isn't what you should
                // ALWAYS do when getline() fails, but this is just a
                // demo.
                exit(1);
        }

        // Double-check that the last character is a line feed
        // ('\\n'). If so, replace it with a null terminator.
        if (len >= 1 && line[len - 1] == '\\n') {
                line[len - 1] = '\\0';
        }

        // But if this is Windows or a similar platform, then there will
        // additionally be a carriage return (\\r) before the line feed
        // character. Let's check for that with an if statement and trim
        // it as well if necessary
        if (len >= 2 && line[len - 2] == '\\r') {
                line[len - 2] = '\\0';
        }

        printf("Your quote was: %s\\n", line);
        printf("%ld bytes were allocated to the character array to store "
                "the line of text\\n", n);

        // The program is done with the line of text, so we should free
        // it
        free(line);

        // I know, this program is boring. We'll learn how to do more
        // interesting things with strings soon.
}`
      }</CBlock>

      <P>And here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o getline getline.c 
$ valgrind ./getline 
==2669129== Memcheck, a memory error detector
==2669129== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2669129== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2669129== Command: ./getline
==2669129== 
Give me a fun quote: The epic highs and lows of high school football
Your quote was: The epic highs and lows of high school football
120 bytes were allocated to the character array to store the line of text
==2669129== 
==2669129== HEAP SUMMARY:
==2669129==     in use at exit: 0 bytes in 0 blocks
==2669129==   total heap usage: 3 allocs, 3 frees, 2,168 bytes allocated
==2669129== 
==2669129== All heap blocks were freed -- no leaks are possible
==2669129== 
==2669129== For lists of detected and suppressed errors, rerun with: -s
==2669129== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Much better.</P>

      <P>There are other clever ways of trimming <It>all</It> whitespace characters from the end of a C string (e.g., by using a loop and <Link href="https://man7.org/linux/man-pages/man3/isspace.3p.html">the <Code>isspace</Code> function</Link>), but that's beyond the scope of this course.</P>

      <P>I mentioned that, when reading from standard input, the character pointer and <Code>size_t</Code> value that are both passed by pointer as the first two arguments to <Code>getline</Code> should typically be initialized to <Code>NULL</Code> and 0, respectively, prior to the call. This is actually very important. If the character pointer whose address is passed as the first arugment to <Code>getline</Code> (i.e., <Code>line</Code>, in the above program) <It>isn't</It> <Code>NULL</Code>, then it <Ul>must</Ul> store the base address of a pre-allocated dynamic array of characters, and the <Code>size_t</Code> value passed by pointer as the second argument (i.e., <Code>n</Code>, in the above program) <Ul>must</Ul> store the size (in bytes) of that character array. In such a case, <Code>getline</Code> will attempt to use that pre-allocated character array to store the user's entered line of text. If the line of text doesn't fit in that character array, it will reallocate the character array via <Code>realloc</Code>.</P>

      <P>(Technically, it doesn't matter what the <Code>size_t</Code> value is initialized to if the character pointer is initialized to <Code>NULL</Code>, but initializing it to 0 in such a case is conventional.)</P>

      <P>This feature can be useful for performance reasons. If you already have a pre-allocated dynamic array, and you think that there's a good chance that the user's line of text will fit in it, you can have <Code>getline</Code> simply use that character array rather than allocating a new one.</P>

      <P>However, it also means that you must be extremely careful when calling getline<Emdash/>if the character pointer whose address is passed as the first argument to <Code>getline</Code> isn't <Code>NULL</Code>, then <Code>getline</Code> will dereference it and try to store characters inside it. If it's <It>uninitialized</It>, then <Code>getline</Code> will end up dereferencing an uninitialized pointer, and undefined behavior will ensue. Similarly, if the <Code>size_t</Code> value that the second argument points to is uninitialized (and the character pointer that the first argument points to isn't <Code>NULL</Code>), then <Code>getline</Code> will dereference the second argument and read the uninitialized <Code>size_t</Code> value, also invoking undefined behavior.</P>

      <P>To be safe, I strongly recommend just building a habit of initializing the character pointer to <Code>NULL</Code> and the <Code>size_t</Code> value to 0 before passing them each by pointer as the first two arguments to <Code>getline</Code>. Only go against this advice when you're looking to improve performance (and, in that case, make sure you know what you're doing).</P>

      <P>Finally, you might be thinking: <Code>getline</Code> seems nice, but it's only capable of reading an entire line of text from the user. In contrast, <Code>scanf</Code> can read a single value at a time, even if the user types in multiple values. So, what if you really just want to read the first value that the user types in? Is <Code>getline</Code> not an option in that case? Well, I'm going to stick to my guns here: <Code>getline</Code> is probably the best tool for reading <It>any</It> kind of user input, in general, be it a line of text, a word, an integer, a floating point value, or anything else. If you just want to read the first value (word, integer, float, etc) that the user types in, the typical strategy is: 1) read an entire line of text using <Code>getline</Code>; 2) <Bold>tokenize</Bold> that line of text using <Code>strtok_r</Code>, and extract the tokens that you're interested in; 3) parse the tokens and conduct error handling, verifying that each token is valid; and 4) convert the tokens to the desired types using conversion functions like <Code>strotol</Code> and <Code>strtod</Code>. This strategy supports much more robust error handling than <Code>scanf</Code> ever could. We'll talk more about tokenization and conversion later.</P>


      <SectionHeading id="fgets"><Code>fgets</Code></SectionHeading>

      <P><Code>getline</Code> is perhaps the best way to user input, but there is another somewhat decent alternative: <Code>fgets</Code>. The fundamental difference between these two functions is that <Code>getline</Code> allocates a dynamic array that's big enough to store the user's line of text, regardless of how big it is, whereas <Code>fgets</Code> accepts a pre-allocated array that can be in <It>any</It> writable location in memory (stack, heap, read-write data section, etc), and if that array isn't big enough to store and stores the user's line of text inside it, it simply stores as much of the line of text as it can, leaving the rest in the buffer. This means that, when using <Code>fgets</Code>, you have to make an assumption about the maximum length of the line of text that the user might input. If they input something longer than that, the extra characters will be left in the standard input buffer (with the file offset pointing to them) for the next time the program reads from standard input.</P>

      <P>This is a big limitation of <Code>fgets</Code>, but it's not quite as bad as <Code>scanf</Code> in that it knows the size of the pre-allocated array (the size is passed as an additional argument), so it can avoid overflowing it. Moreoever, like <Code>getline</Code>, <Code>fgets</Code> can be used to read from arbitrary file streams<Emdash/>not <It>just</It> standard input. If you find yourself reading from a data file, and you're certain that a line of text within the data file will never exceed a certain length (e.g., due to requirements of the data file format), then using <Code>fgets</Code> might give you some slight performance gains over using <Code>getline</Code>.</P>

      <P><Code>fgets</Code> is provided by <Code>stdio.h</Code> and accepts three arguments: 1) the base address of a pre-allocated character array in which to store the user's line of text (and a null terminator); 2) the total number of characters in that pre-allocated character array; and 3) a pointer to a file stream from which you'd like to read a line of text. Here's how you'd usually call it to read from standard input:</P>

      <SyntaxBlock>{
`// First, preallocate the character array in which to store the line of
// text (or the first part of the line of text, if the entire line
// doesn't fit in this array). No need to fill it with null terminators;
// fgets will null-terminate it for us.
char line[256];

// Now read the line (or the first 255 characters of it), storing its
// contents followed by a null terminator in the pre-allocated array
fgets(line, 256, stdin);`
      }</SyntaxBlock>

      <P>Notice: the second argument is the size of the character array, <Ul>not</Ul> the maximum number of characters of <It>content</It> that can be stored in the character array. The line of text will be stored as a C string, meaning it must be null-terminated. Hence, in the above example, the character array is size 256, but only 255 characters of string <It>contents</It> can be stored inside it. The second argument is 256<Emdash/>not 255.</P>

      <P>Here's a more complete example:</P>

      <CBlock fileName="fgets.c">{
`#include <string.h> // For strlen
#include <stdio.h>

int main(void) {
        printf("Enter a line of text no more than 30 "
                "characters in length: ");

        // 30 characters of regular content, plus two characters for
        // a newline character sequence (\\r\\n on Windows; just \\n on
        // Unix-like systems), plus one null terminator
        char line[33];

        // Read the line from the user (or as much of it as we can
        // fit in the array) and null-terminate it
        fgets(line, 33, stdin);

        // Like getline, fgets will read the newline character
        // sequence and store it in the character array. However, if
        // the user's line contained more than 32 characters
        // (including the newline character sequence), then the
        // newline character sequence wouldn't fit in the array, so
        // it'd be left in the input buffer. On Windows systems and
        // alike, it's even possible that fgets will read the
        // carriage return (\\r) but NOT the subsequent line feed
        // (\\n) if the character array is just barely big enough to
        // fit the former but not the latter. This means that the
        // character array can contain one of three things: 1. The
        // line, followed by a full newline character sequence,
        // followed by a null terminator 2. The line, followed by a
        // partial newline character sequence (only on Windows---\\r
        // but not \\r\\n), followed by a null terminator. Only
        // happens if the character array is just barely big enough
        // to fit the \\r but not the \\n. 3. The line or PART of the
        // line, followed by a null terminator, but without the
        // newline character sequence since it didn't fit. Remaining
        // unread characters will be left in the input buffer.

        // Also, unlike getline, fgets does not return the string
        // length of the line, so we must compute it with strlen.

        // This all means that trimming \\r and \\n from the end of
        // the line is a bit more difficult:

        size_t len = strlen(line);

        // If the last character is \\r OR \\n, trim it
        if (line[len - 1] == '\\n' || line[len-1] == '\\r') {
                line[len - 1] = '\\0';
        }

        // Repeat for the second-to-last character
        if (line[len - 2] == '\\n' || line[len-2] == '\\r') {
                line[len - 2] = '\\0';
        }

        // Good. Now we can do whatever we want with the line.
        printf("You entered: %s\\n", line);

        // Ask the user for another line
        printf("Enter another line of text no more than 30 "
                "characters in length: ");
        fgets(line, 33, stdin); // We can reuse the same array

        // Trim it
        len = strlen(line);
        if (line[len - 1] == '\\n' || line[len-1] == '\\r') {
                line[len - 1] = '\\0';
        }
        if (line[len - 2] == '\\n' || line[len-2] == '\\r') {
                line[len - 2] = '\\0';
        }

        printf("You entered: %s\\n", line);
}
`
      }</CBlock>

      <P>Here's an example run where the user obeys the prompt and provides lines of text each no more than 30 characters in length:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o fgets fgets.c 
$ valgrind ./fgets 
==476957== Memcheck, a memory error detector
==476957== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==476957== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==476957== Command: ./fgets
==476957== 
Enter a line of text no more than 30 characters in length: Hello, World!
You entered: Hello, World!
Enter another line of text no more than 30 characters in length: Goodbye!
You entered: Goodbye!
==476957== 
==476957== HEAP SUMMARY:
==476957==     in use at exit: 0 bytes in 0 blocks
==476957==   total heap usage: 2 allocs, 2 frees, 2,048 bytes allocated
==476957== 
==476957== All heap blocks were freed -- no leaks are possible
==476957== 
==476957== For lists of detected and suppressed errors, rerun with: -s
==476957== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>But here's what happens when the user is less kind:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o fgets fgets.c 
$ valgrind ./fgets 
==479012== Memcheck, a memory error detector
==479012== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==479012== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==479012== Command: ./fgets
==479012== 
Enter a line of text no more than 30 characters in length: The epic highs and lows of high school football
You entered: The epic highs and lows of high 
Enter another line of text no more than 30 characters in length: You entered: school football
==479012== 
==479012== HEAP SUMMARY:
==479012==     in use at exit: 0 bytes in 0 blocks
==479012==   total heap usage: 2 allocs, 2 frees, 2,048 bytes allocated
==479012== 
==479012== All heap blocks were freed -- no leaks are possible
==479012== 
==479012== For lists of detected and suppressed errors, rerun with: -s
==479012== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>The user entered a line of text that was 47 characters long (48 including the <Code>\n</Code> at the end; there's no carriage return since I'm running this on the ENGR servers, which run on Linux). The first 32 characters fit inside the character array, plus a null terminator; <Code>fgets</Code> will <Ul>always</Ul> save room for a null terminator. Those 32 characters were <Code>The epic highs and lows of high </Code> (including the space between "high" and "school"). The remaining characters, <Code>school football\n</Code>, remained in the input buffer.</P>

      <P>Later, when <Code>fgets</Code> was called for the second time, the remaining characters from the user's previous input (<Code>school football\n</Code>) were <It>still</It> in the input buffer. Since they end in a newline character sequence (<Code>\n</Code>), <Code>fgets</Code> treats it as a complete line of text and reads it <It>immediately</It>. Hence, it didn't even give the user a chance to supply another line of text; it just immediately picked up from where it left off in the input buffer from the previous call.</P>

      <P>Notice: Both inputs were properly trimmed, even though the first input didn't contain a line feed (<Code>\n</Code>) but the second input did. Yes, all of those if statements are really necessary to handle the trimming in a robust way.</P>

      <P>As with <Code>getline</Code>, <Code>fgets</Code> can fail for various reasons, and it communicates errors through its return value. However, its return type is not <Code>ssize_t</Code>. Rather, its return type is <Code>char*</Code>. On success, it simply returns whatever memory address was passed to it as the first argument. On failure, it returns <Code>NULL</Code>. It's a good idea to always check the return value of <Code>fgets</Code> for errors:</P>

      <CBlock showLineNumbers={false} fileName="fgets.c" highlightLines="{5-9}">{
`// ...

printf("Enter another line of text no more than 30 "
        "characters in length: ");
char* fgets_result = fgets(line, 33, stdin); // We can reuse the same array
if (!fgets_result) {
        printf("Error on fgets()\\n");
        exit(1); // Or some other appropriate error handling
}

// ...`
      }</CBlock>

      <P>To reiterate, you should usually just use <Code>getline</Code> to read text inputs, especially when those inputs are coming from the user. But again, <Code>fgets</Code> can yield some performance advantages over <Code>getline</Code> in contexts where it's safe to make assumptions about the maximum length of a line.</P>

      <SectionHeading id="string-h"><Code>string.h</Code></SectionHeading>

      <P>Now that you know how to read string inputs in robust ways, you might want to know how to <It>do</It> things with those inputs. As you know, a C string is just a null-terminated array of characters, so anything that you could want to do with them can generally be accomplished with some for loops and if statements. However, there are certain tasks that are extremely common when it comes to string parsing and manipulation. For this reason, the C standard library offers some functions that are specially curated for those tasks. Most of these functions are provided by <Code>string.h</Code>.</P>

      <P>You've actually learned about one of them already: <Code>strlen</Code>. We'll spend the rest of this lecture discussing several others.</P>

      <P>Importantly, all the functions we're about to discuss accept one or more C strings as arguments. If the function needs to read from those C strings, then they <Ul>must</Ul> be proper C strings, null terminator and all. If you provide a character array that <It>isn't</It> properly null-terminated, then many of these functions can over-read the array and invoke undefined behavior. This is an extremely common mistake. You have been warned.</P>

      <P>(Always run through Valgrind or another memory checker when developing and debugging!)</P>

      <P>Similarly, some of the functions that we'll discuss also <It>produce</It> C strings (e.g., <Code>strcpy</Code>, <Code>strcat</Code>, etc). Such functions will <Ul>always</Ul> properly null-terminate the C strings that they produce. However, they typically write the produced C string(s) into character arrays that <It>you</It> provide. It's your responsibility to make sure those character arrays are big enough to store the produced C string(s), including the null terminator. Failure to do so will result in a buffer overflow and undefined behavior.</P>

      <SectionHeading id="strcmp"><Code>strcmp</Code></SectionHeading>

      <P>Suppose you have two C strings and you want to compare them to see if they contain the same string contents. You might mistakenly do this:</P>

      <SyntaxBlock>{
`if (first_string == second_string)`
      }</SyntaxBlock>

      <P>That doesn't work. C strings are just null-terminated character arrays, and arrays tend to decay to their base addresses. Indeed, the above if statement would compare the <It>base addresses</It> of the two C strings' character arrays<Emdash/>not the <It>contents</It> of the two C strings.</P>

      <P>To compare the strings' contents, you'd have to iterate through them both simultaneously (e.g., with a for loop) and compare their characters one at a time. Luckily, the <Code>strcmp</Code> function (provided by <Code>string.h</Code>) is already implemented for you, and it does exactly that. It accepts two C strings as inputs and returns an <Code>int</Code> value. If the two C strings contain the exact same contents (case-sensitive), it returns 0. Otherwise, it returns a nonzero value. Specifically, it returns a positive value if the first string comes after the second string in lexicographical order (like alphabetical order, but based on the characters' integer encodings (e.g., ASCII values)), and it returns a negative value if the first string comes before the second string in lexicographical order.</P>

      <P>Here's an example:</P>

      <CBlock fileName="strcmp.c">{
`#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main(void) {
        printf("Enter the password: ");
        char* line = NULL;
        size_t n = 0;
        ssize_t len = getline(&line, &n, stdin);
        if (len == -1) {
                printf("Error on getline()\\n");
                exit(1);
        }
        if (len >= 1 && line[len - 1] == '\\n') {
                line[len - 1] = '\\0';
        }
        if (len >= 2 && line[len - 2] == '\\r') {
                line[len - 2] = '\\0';
        }

        if (strcmp(line, "the password") == 0) {
                printf("Correct!\\n");
        } else {
                printf("Wrong password!\\n");
        }

        free(line);
}
`
      }</CBlock>

      <P>And here are some example outputs:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o strcmp strcmp.c
$ valgrind ./strcmp
==533501== Memcheck, a memory error detector
==533501== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==533501== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==533501== Command: ./strcmp
==533501== 
Enter the password: the password
Correct!
==533501== 
==533501== HEAP SUMMARY:
==533501==     in use at exit: 0 bytes in 0 blocks
==533501==   total heap usage: 3 allocs, 3 frees, 2,168 bytes allocated
==533501== 
==533501== All heap blocks were freed -- no leaks are possible
==533501== 
==533501== For lists of detected and suppressed errors, rerun with: -s
==533501== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
$ valgrind ./strcmp
==533602== Memcheck, a memory error detector
==533602== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==533602== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==533602== Command: ./strcmp
==533602== 
Enter the password: open sesame!
Wrong password!
==533602== 
==533602== HEAP SUMMARY:
==533602==     in use at exit: 0 bytes in 0 blocks
==533602==   total heap usage: 3 allocs, 3 frees, 2,168 bytes allocated
==533602== 
==533602== All heap blocks were freed -- no leaks are possible
==533602== 
==533602== For lists of detected and suppressed errors, rerun with: -s
==533602== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <SectionHeading id="strcpy"><Code>strcpy</Code></SectionHeading>

      <P>Suppose you want to copy the entire C string contained in one character array into another character array. You might mistakenly do this:</P>

      <SyntaxBlock>{
`char copy[] = old_string;`
      }</SyntaxBlock>

      <P>Again, this doesn't work because arrays tend to decay to their base addresses. In fact, the above syntax isn't even legal. If <Code>old_string</Code> were replaced with a string <It>literal</It>, then it would be perfectly valid, and it would, in fact, copy the contents of the string literal into the new automatic array <Code>copy</Code>. But it doesn't work with pre-existing string <It>variables</It> (null-terminated arrays or their base addresses).</P>

      <P>Perhaps a more dangerous mistake would be this:</P>

      <SyntaxBlock>{
`char* copy = old_string;`
      }</SyntaxBlock>

      <P>This <It>is</It> syntactically legal, but it doesn't achieve the goal of copying the contents of <Code>old_string</Code>. Rather, it copies the <It>base address</It> of <Code>old_string</Code> and stores it in the newly declared pointer named <Code>copy</Code>.</P>

      <P>Again, if you want to copy the <It>contents</It> of a C string, in the general case, you'd have to use a loop and copy one character at a time until you encounter a null terminator. The <Code>strcpy</Code> function, provided by <Code>string.h</Code>, does exactly that. It accepts two arguments: 1) the base address of a character array into which you would like to store a copy of an existing C string; and 2) the existing C string that you would like to copy. That is, the argument order is 1) the <It>destination</It>, then 2) the <It>source</It>.</P>

      <P>The second argument <Ul>must</Ul> be a properly null-terminated character array. Moreover, the first argument <Ul>must</Ul> point to a character array that is sufficiently large enough to store the copied contents. If either of these conditions is violated, undefined behavior will ensue.</P>

      <P>Here's an example:</P>

      <CBlock fileName="strcpy.c">{
`#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main(void) {
        printf("Enter a sentence: ");
        char* line = NULL;
        size_t n = 0;
        ssize_t len = getline(&line, &n, stdin);
        if (len == -1) {
                printf("Error on getline()\\n");
                exit(1);
        }
        if (len >= 1 && line[len - 1] == '\\n') {
                line[len - 1] = '\\0';
        }
        if (len >= 2 && line[len - 2] == '\\r') {
                line[len - 2] = '\\0';
        }

        // Create a copy of the sentence. First, create an array
        // that's big enough to store the copy (strlen(line), plus
        // one for a null terminator).
        len = strlen(line);
        char* copy = malloc((len + 1) * sizeof(char));
        if (!copy) {
                printf("Error on malloc()\\n");
                exit(1);
        }

        // Now use strcpy
        strcpy(copy, line);

        // Modifying the copy does NOT modify the original line,
        // nor vice-versa. They're two separate arrays.
        copy[0] = 'Z';

        printf("Your sentence was: %s\\n", line);
        printf("Your modified sentence is: %s\\n", copy);

        // Don't forget to delete both the original line AND the
        // copy, since both were dynamically allocated
        free(copy);
        free(line);
}`
      }</CBlock>

      <P>Here's an example output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o strcpy strcpy.c 
$ valgrind ./strcpy 
==581251== Memcheck, a memory error detector
==581251== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==581251== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==581251== Command: ./strcpy
==581251== 
Enter a sentence: The epic highs and lows of high school football
Your sentence was: The epic highs and lows of high school football
Your modified sentence is: Zhe epic highs and lows of high school football
==581251== 
==581251== HEAP SUMMARY:
==581251==     in use at exit: 0 bytes in 0 blocks
==581251==   total heap usage: 4 allocs, 4 frees, 2,216 bytes allocated
==581251== 
==581251== All heap blocks were freed -- no leaks are possible
==581251== 
==581251== For lists of detected and suppressed errors, rerun with: -s
==581251== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>There's also a function named <Code>strncpy</Code>. It works exactly like <Code>strcpy</Code>, except it accepts a third argument <Code>n</Code>, and it only copies up to the first <Code>n</Code> characters from the source into the destination. If the first <Code>n</Code> characters in the source string does not include a null terminator, then no null terminator is copied (be careful of that<Emdash/>you may need to null-terminate the destination string yourself).</P>

      <SectionHeading id="strcat"><Code>strcat</Code></SectionHeading>

      <P>Suppose you want to concatenate two C strings together (i.e., "glue" their contents together, one after another). It's actually possible to do this by using <Code>strcpy</Code> with a little bit of pointer arithmetic. For example:</P>

      <SyntaxBlock>{
`strcpy(string_1 + strlen(string_1), string_2);`
      }</SyntaxBlock>

      <P>Recall: Adding an integer to a pointer essentially shifts over that many "spaces" in memory, where a "space" is the size of the data type (in bytes) that the pointer points to. Hence, <Code>string_1 + strlen(1)</Code> evaluates to a pointer that points to the null terminator at the end of the first string. Since we're using that address as the destination address of <Code>strcpy</Code>, that null terminator will be modified, along with many characters following it in memory, to contain a copy of the contents of <Code>string_2</Code>.</P>

      <P>Of course, this only works if the array underlying <Code>string_1</Code> is big enough to store the current contents of <Code>string_1</Code> as well as the contents of <Code>string_2</Code> (plus a null terminator). You're responsible for making sure that's the case. Otherwise, you'll get a buffer overflow and undefined behavior.</P>

      <P>The above works perfectly fine, but <Code>string.h</Code> provides another function that does the pointer arithmetic for you: <Code>strcat</Code>. It accepts two C strings as arguments. It then concatenates ("glues") the contents of the second argument onto the end of the contents of the first argument (and appends a null terminator). Again, this requires that the first string's underlying array be big enough to store the concatenated contents, plus one null terminator.</P>

      <P>Here's a complete example:</P>

      <CBlock fileName="strcat.c">{
`#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main(void) {
        printf("Enter a sentence: ");
        char* line = NULL;
        size_t n = 0;
        ssize_t len = getline(&line, &n, stdin);
        if (len == -1) {
                printf("Error on getline()\\n");
                exit(1);
        }
        if (len >= 1 && line[len - 1] == '\\n') {
                line[len - 1] = '\\0';
        }
        if (len >= 2 && line[len - 2] == '\\r') {
                line[len - 2] = '\\0';
        }

        printf("Enter another sentence: ");
        char* line2 = NULL;
        n = 0;
        len = getline(&line2, &n, stdin);
        if (len == -1) {
                printf("Error on getline()\\n");
                exit(1);
        }
        if (len >= 1 && line2[len - 1] == '\\n') {
                line2[len - 1] = '\\0';
        }
        if (len >= 2 && line2[len - 2] == '\\r') {
                line2[len - 2] = '\\0';
        }

        // Create a character array that's big enough to store the
        // concatenated contents, plus a period and space between
        // them, plus one null terminator at the end
        size_t len1 = strlen(line);
        size_t len2 = strlen(line2);
        char* concatenated = malloc((len1 + len2 + 3) * sizeof(char));
        if (!concatenated) {
                printf("Error on malloc()\\n");
                exit(1);
        }

        // Copy the first line into it
        strcpy(concatenated, line);

        // Concatenate ". " onto the end of it
        strcat(concatenated, ". ");

        // Concatenate the second line onto the end of it
        strcat(concatenated, line2);

        printf("The concatenated result is: %s\\n", concatenated);

        free(concatenated);
        free(line2);
        free(line);
}
`
      }</CBlock>

      <P>Here's an example output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o strcat strcat.c 
$ valgrind ./strcat 
==614860== Memcheck, a memory error detector
==614860== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==614860== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==614860== Command: ./strcat
==614860== 
Enter a sentence: Hello
Enter another sentence: World!
The concatenated result is: Hello. World!
==614860== 
==614860== HEAP SUMMARY:
==614860==     in use at exit: 0 bytes in 0 blocks
==614860==   total heap usage: 5 allocs, 5 frees, 2,302 bytes allocated
==614860== 
==614860== All heap blocks were freed -- no leaks are possible
==614860== 
==614860== For lists of detected and suppressed errors, rerun with: -s
==614860== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <SectionHeading id="sprintf"><Code>sprintf</Code></SectionHeading>

      <P>The previous program worked fine, but we can do a bit better. Consider that when printing text to the terminal via <Code>printf</Code>, you can write out a format string with as many placeholders (format specifiers) as you'd like, and then supply additional arguments to inject into those placeholders. This is a very nice way of combining lots of data together into a single string and printing it to the terminal.</P>

      <P>But what if you want to combine lots of data together into a single string but <It>not</It> print it to the terminal? For example, what if you want to combine the contents of a bunch of pre-existing strings in some carefully formatted way, and simply store the result in another string? In the previous program, we hacked our way through this by calling <Code>strcpy</Code> and <Code>strcat</Code> a bunch of times. But as it turns out, <Code>string.h</Code> provides another function, <Code>sprintf</Code>, that makes these tasks much easier. It's exactly like <Code>printf</Code>, except instead of printing formatted string contents to standard output, it prints formated string contents <It>into a character array</It> as a C string (and properly null-terminates it).</P>

      <P><Code>sprintf</Code> accepts two or more arguments. The first argument is the base address of the character array (or the middle of the character array, etc) where you'd like to store the formatted C string. The second argument and on follow the same semantics as the arguments of <Code>printf</Code>. That is, the second argument of <Code>sprintf</Code> is the format string, and the third argument and on are the values that you'd like to substitute into the format specifiers within the format string.</P>
      
      <P>As with <Code>strcpy</Code> and <Code>strcat</Code>, there must be sufficient allocated space in the destination character array to store the produced C string, or else a buffer overflow and undefined behavior will ensue.</P>

      <P>Let's rewrite our previous program using <Code>sprintf</Code> instead of <Code>strcpy</Code> and <Code>strcat</Code>:</P>

      <CBlock fileName="sprintf.c" highlightLines="{47-49}">{
`#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main(void) {
        printf("Enter a sentence: ");
        char* line = NULL;
        size_t n = 0;
        ssize_t len = getline(&line, &n, stdin);
        if (len == -1) {
                printf("Error on getline()\\n");
                exit(1);
        }
        if (len >= 1 && line[len - 1] == '\\n') {
                line[len - 1] = '\\0';
        }
        if (len >= 2 && line[len - 2] == '\\r') {
                line[len - 2] = '\\0';
        }

        printf("Enter another sentence: ");
        char* line2 = NULL;
        n = 0;
        len = getline(&line2, &n, stdin);
        if (len == -1) {
                printf("Error on getline()\\n");
                exit(1);
        }
        if (len >= 1 && line2[len - 1] == '\\n') {
                line2[len - 1] = '\\0';
        }
        if (len >= 2 && line2[len - 2] == '\\r') {
                line2[len - 2] = '\\0';
        }

        // Create a character array that's big enough to store the
        // concatenated contents, plus a period and space between
        // them, plus one null terminator at the end
        size_t len1 = strlen(line);
        size_t len2 = strlen(line2);
        char* concatenated = malloc((len1 + len2 + 3) * sizeof(char));
        if (!concatenated) {
                printf("Error on malloc()\\n");
                exit(1);
        }

        // Print the first line, then ". ", then the second line,
        // all into 'concatenated'
        sprintf(concatenated, "%s. %s", line, line2);

        printf("The concatenated result is: %s\\n", concatenated);

        free(concatenated);
        free(line2);
        free(line);
}`
      }</CBlock>

      <P>It does exactly the same thing as <Code>strcat.c</Code>, but the code is a bit simpler.</P>

      <P>Of course, <Code>sprintf</Code> can do more than just string concatenation. As with <Code>printf</Code>, it can be used to format various kinds of data together into a string. That's to say, the format string passed to <Code>sprintf</Code> can contain <Code>%d</Code>, <Code>%f</Code>, <Code>%ld</Code>, <Code>%.3f</Code>, and any other format specifiers (and length modifiers, precision modifiers, etc) that might be used with <Code>printf</Code>.</P>

      <P>For example, <Code>sprintf</Code> can be used to convert an integer to a string like so:</P>

      <SyntaxBlock>{
`int x = 100;
char x_as_string[256];
sprintf(x_as_string, "%d", x);`
      }</SyntaxBlock>

      <P>That being said, you must be very careful when formatting non-string data with <Code>sprintf</Code>. It's not always obvious exactly how large your character array will need to be to store the formatted result. If it isn't large enough, you'll get a buffer overflow and undefined behavior.</P>

      <SectionHeading id="strstr"><Code>strstr</Code></SectionHeading>

      <P>Another useful function provided by <Code>string.h</Code> is <Code>strstr</Code>. It accepts two C strings as arguments. It then checks to see if the second string is a substring of the first. If so, it returns a <Code>char*</Code> that points to the first character of the first occurrence of the substring within the larger string. If not, it returns <Code>NULL</Code>.</P>

      <P>For example:</P>

      <CBlock fileName="strstr.c">{
`#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main(void) {
        printf("Enter a sentence: ");
        char* line = NULL;
        size_t n = 0;
        ssize_t len = getline(&line, &n, stdin);
        if (len == -1) {
                printf("Error on getline()\\n");
                exit(1);
        }
        if (len >= 1 && line[len - 1] == '\\n') {
                line[len - 1] = '\\0';
        }
        if (len >= 2 && line[len - 2] == '\\r') {
                line[len - 2] = '\\0';
        }

        // Find the first occurrence of the word "pizza" in the
        // user's sentence
        char* ptr = strstr(line, "pizza");
        if (ptr) {
                // i.e., if (ptr != NULL)
                // The sentence does, indeed, contain the word pizza
                // AT LEAST once. ptr now points to the 'p' in the
                // FIRST occurrence of the word pizza within the
                // character array that line points to.

                // Replace "pizza" in the line with "tacos" (note:
                // they're both the same number of characters)
                const char* tacos = "tacos";
                for (size_t i = 0; i < strlen(tacos); ++i) {
                        // Recall: if a pointer ptr points to a character in
                        // the MIDDLE of a string, then ptr[0] will be that
                        // character, ptr[1] will be the next character, and
                        // so on. So ptr[0] is 'p', ptr[1] is 'i', ptr[2]
                        // is 'z', ptr[3] is 'z', and ptr[4] is 'a'.
                        // Replace those 5 characters with the 5 characters
                        // of "tacos".
                        ptr[i] = tacos[i];
                }

                // Tip: An easier way to do the above would be to
                // use the strncpy function (not strcpy, but strncpy),
                // which copies the first n characters of one string
                // into another string (possibly excluding the null
                // terminator if desired, as is the case here)
        }

        // Print the modified sentence back to the user:
        printf("%s\\n", line);

        free(line);
}`
      }</CBlock>

      <P>Here's an example output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o strstr strstr.c 
$ valgrind ./strstr
==3860135== Memcheck, a memory error detector
==3860135== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==3860135== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==3860135== Command: ./strstr
==3860135== 
Enter a sentence: I like pineapple on my pizza 
I like pineapple on my tacos
==3860135== 
==3860135== HEAP SUMMARY:
==3860135==     in use at exit: 0 bytes in 0 blocks
==3860135==   total heap usage: 3 allocs, 3 frees, 2,168 bytes allocated
==3860135== 
==3860135== All heap blocks were freed -- no leaks are possible
==3860135== 
==3860135== For lists of detected and suppressed errors, rerun with: -s
==3860135== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Importantly, <Code>strstr</Code> returns a pointer to the first character of the <Ul>first</Ul> occurrence of the given substring (second argument) within the given string (first argument). The above program only replaces the <Ul>first</Ul> occurrence of the word "pizza" in the line with the word "tacos". If you wanted to replace all occurrences, you'd have to call <Code>strstr</Code> in a loop (or do something more clever).</P>

      <P>Also, <Code>strstr</Code> is case-sensitive, just like <Code>strcmp</Code>.</P>
      
      <SectionHeading id="strtol-strtod"><Code>strtol</Code> and <Code>strtod</Code></SectionHeading>

      <P>We discussed how <Code>sprintf</Code> can convert numeric data into strings (and, more generally, can construct formatted strings from various kinds of data). But what about the other way around? What if you have a string containing the characters "172.5", and you want to convert it to a <Code>double</Code> with value <Code>172.5</Code>?</P>

      <P>If a string's contents contain a valid floating point number, you can convert it to a <Code>double</Code> value by passing it as the first argument to the <Code>strtod</Code> function and passing <Code>NULL</Code> as the second argument. <Code>strtod</Code> stands for "string to double". It parses the string given by the first argument, extracts a <Code>double</Code> value from it, and returns said value. Importantly, <Code>strtod()</Code> is provided by <Code>stdlib.h</Code><Emdash/>not <Code>string.h</Code>.</P>

      <P>I said to pass <Code>NULL</Code> as the second argument to <Code>strtod</Code>. It actually doesn't <It>have</It> to be <Code>NULL</Code>. The second parameter is referred to as the <Code>endptr</Code>. If its value is <Code>NULL</Code>, it's effectively ignored. If it isn't <Code>NULL</Code>, then the <Code>strtod</Code> function will use it in a very specific way. It's a bit complicated, so we'll circle back to it.</P>

      <P>Similarly, <Code>stdlib.h</Code> provides a <Code>strtol</Code> function, which stands for "string to long". It accepts three arguments, though<Emdash/>not two. The first is the C string from which a <Code>long</Code> (i.e., potentially large integer value) should be extracted. The second is the <Code>endptr</Code> argument, similar to <Code>strtod</Code> (again, we'll circle back to it; just leave it <Code>NULL</Code> for now). The third argument is the <Code>base</Code>; it specifies the base (i.e., the numbering system) in which the integer value is represented inside the C string. For example, using <Code>strtol</Code> on the string <Code>"11"</Code> with a base of <Code>10</Code> (i.e., the decimal numbering system) will return a <Code>long</Code> with the value <Code>11</Code>. However, using <Code>strtol</Code> on the string <Code>"11"</Code> with a base of <Code>2</Code> (i.e., the binary numbering system) will return a <Code>long</Code> with the value <Code>3</Code> (because <Code>11</Code> is the number three represented in binary).</P>

      <P>Here's an extended example:</P>

      <CBlock fileName="conversion.c">{
`#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main(void) {
        printf("Enter any decimal number: ");
        char* line = NULL;
        size_t n = 0;
        ssize_t len = getline(&line, &n, stdin);
        if (len == -1) {
                printf("Error on getline()\\n");
                exit(1);
        }
        if (len >= 1 && line[len - 1] == '\\n') {
                line[len - 1] = '\\0';
        }
        if (len >= 2 && line[len - 2] == '\\r') {
                line[len - 2] = '\\0';
        }

        double as_double = strtod(line, NULL);
        printf("Your value multiplied by 2 is: %lf\\n", as_double * 2);
        // Free the line immediately so that we can reuse the
        // pointer
        free(line);

        printf("Enter a WHOLE number: ");
        line = NULL;
        n = 0;
        len = getline(&line, &n, stdin);
        if (len == -1) {
                printf("Error on getline()\\n");
                exit(1);
        }
        if (len >= 1 && line[len - 1] == '\\n') {
                line[len - 1] = '\\0';
        }
        if (len >= 2 && line[len - 2] == '\\r') {
                line[len - 2] = '\\0';
        }

        long as_long = strtol(line, NULL, 10);
        printf(
                "The remainder after dividing your value by 7 is: %ld\\n",
                as_long % 7
        );
        // Free the line immediately so that we can reuse the
        // pointer
        free(line);

        printf("Enter a bitstring: ");
        line = NULL;
        n = 0;
        len = getline(&line, &n, stdin);
        if (len == -1) {
                printf("Error on getline()\\n");
                exit(1);
        }
        if (len >= 1 && line[len - 1] == '\\n') {
                line[len - 1] = '\\0';
        }
        if (len >= 2 && line[len - 2] == '\\r') {
                line[len - 2] = '\\0';
        }

        // Base 2 = interpret string as binary expression (bitstring)
        as_long = strtol(line, NULL, 2);
        printf(
                "The value of your bitstring converted to the "
                        "decimal system is: %ld\\n",
                as_long
        );
        // Free the final line
        free(line);
}`
      }</CBlock>

      <P>Here's an example output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o conversion conversion.c 
$ valgrind ./conversion 
==3879286== Memcheck, a memory error detector
==3879286== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==3879286== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==3879286== Command: ./conversion
==3879286== 
Enter any decimal number: 3.14
Your value multiplied by 2 is: 6.280000
Enter a WHOLE number: 12
The remainder after dividing your value by 7 is: 5
Enter a bitstring: 0110
The value of your bitstring converted to the decimal system is: 6
==3879286== 
==3879286== HEAP SUMMARY:
==3879286==     in use at exit: 0 bytes in 0 blocks
==3879286==   total heap usage: 5 allocs, 5 frees, 2,408 bytes allocated
==3879286== 
==3879286== All heap blocks were freed -- no leaks are possible
==3879286== 
==3879286== For lists of detected and suppressed errors, rerun with: -s
==3879286== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Now, about the second parameter in these functions (i.e., the <Code>endptr</Code>). Its actual type is <Code>char**</Code>; it stores the address of a pre-declared <Code>char*</Code> variable, similar to how the first parameter of <Code>getline</Code> works. <Code>strtol</Code> and <Code>strtod</Code> can then modify that <Code>char*</Code> variable by dereferencing the <Code>char**</Code> parameter (<Code>endptr</Code>). Specifically, when <Code>strtol</Code> or <Code>strtod</Code> extract a <Code>long</Code> or <Code>double</Code> from a string, they actually extract it from the <It>beginning</It> of the string. The string may very well contain additional characters after the value being extracted. After the extraction, these functions will then modify the <Code>char*</Code> that <Code>endptr</Code> (the <Code>char**</Code> argument) points to, storing the address of the first character <It>not</It> involved in the extraction inside it.</P>

      <P>For instance:</P>

      <CBlock fileName="endptr.c">{
`#include <stdlib.h>
#include <stdio.h>

int main(void) {
        char* endptr = NULL;

        // Note: Passing the address of a pointer storing NULL is
        // NOT the same thing as simply passing NULL for the
        // second argument.
        double val = strtod("3.14 Hello, World!", &endptr);

        // The above call is perfectly valid. It extracts the
        // 3.14 from the beginning of the string. It returns that
        // value (now stored in val), but just before that, it
        // updates endptr to store the address of the space
        // character (' ') immediately after the "3.14" in the
        // string (just before the H in Hello)

        printf("%lf\\n", val); // Prints 3.14

        // Prints the memory address of the ' ' between "3.14" and
        // "Hello" in the string literal (which is in the readonly
        // section of the data segment, since that's where literals
        // are stored)
        printf("%p\\n", endptr);

        // Prints the space character that endptr points to (with
        // apostrophes on either side to make it visually clear)
        printf("'%c'\\n", *endptr);
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o endptr endptr.c
$ valgrind ./endptr 
==3915273== Memcheck, a memory error detector
==3915273== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==3915273== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==3915273== Command: ./endptr
==3915273== 
3.140000
0x402014
' '
==3915273== 
==3915273== HEAP SUMMARY:
==3915273==     in use at exit: 0 bytes in 0 blocks
==3915273==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==3915273== 
==3915273== All heap blocks were freed -- no leaks are possible
==3915273== 
==3915273== For lists of detected and suppressed errors, rerun with: -s
==3915273== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>This can be useful if you want to extract several values out of the string in a left-to-right order; you can use <Code>endptr</Code> to figure out where the previous extraction left off, and then pick up from there in a subsequent call. <Code>endptr</Code> can also be useful for (a weak form of) error-handling. If the entire string contains a valid value that can be extracted given the target conversion, then afterward, <Code>endptr</Code> will point to the null terminator at the end of the string. Otherwise, it will point to some character in the middle of the string. If <It>none</It> of the characters in the string are valid given the target conversion, <Code>endptr</Code> will end up pointing to the very first character in the string (i.e., the character array's base address). You can use if statements to check the memory address stored in <Code>endptr</Code>, and / or check the value of the character at that address, to verify the extent to which the conversion succeeded.</P>

      <P>You must be very cognizant about where <Code>endptr</Code> points to. In this case, it points to the space between "3.14" and "Hello" in the string literal, which is stored in the readonly section of the data segment and is therefore <Ul>not</Ul> writable. If the above program attempted to modify the contents pointed to by <Code>endptr</Code>, it would invoke undefined behavior. Unfortunately, <Code>endptr</Code> can't simply be qualified as <Code>const char*</Code> (or, equivalently, <Code>char const *</Code>) because the type of the second parameter of <Code>strtol</Code> and <Code>strtod</Code> is <Ul>not</Ul> const-qualified, and constness can't be implicitly casted away. That is, if <Code>endptr</Code> was declared as <Code>const char* endptr</Code>, then the compiler would issue warnings (and possibly errors) when trying to pass its address to <Code>strtod</Code>.</P>

      <P>(There's a complicated but interesting reason why the <Code>endptr</Code> parameter isn't const-qualified. See <Link href="https://stackoverflow.com/questions/3874196/why-is-the-endptr-parameter-to-strtof-and-strtod-a-pointer-to-a-non-const-char-p">here</Link> if you're curious.)</P>

      <SectionHeading id="islower-and-isupper"><Code>islower</Code> and <Code>isupper</Code></SectionHeading>

      <P>The <Code>islower</Code> and <Code>isupper</Code> functions, which are actually provided by <Code>ctype.h</Code>, can be used to check whether a given character is a lowercase or uppercase letter (respectively) in the current <Link href="https://man7.org/linux/man-pages/man7/locale.7.html">locale</Link>. To check if a character is a lowercase letter, simply pass it as the one only argument to the <Code>islower</Code> function. If the character is indeed a lowercase letter, <Code>islower</Code> will return a nonzero integer (i.e., true). Otherwise, it will return zero (i.e., false). The <Code>isupper</Code> function works the same way, but it checks if the character is an uppercase letter instead.</P>

      <P>Here's a simple example:</P>

      <CBlock fileName="islower.c">{
`#include <stdio.h>
#include <ctype.h> // islower and isupper

int main(void) {
        if (islower('A')) {
                printf("'A' is a lowercase letter\\n");
        }

        if (islower('a')) {
                printf("'a' is a lowercase letter\\n");
        }
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o islower islower.c 
$ valgrind ./islower 
==1323101== Memcheck, a memory error detector
==1323101== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1323101== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==1323101== Command: ./islower
==1323101== 
'a' is a lowercase letter
==1323101== 
==1323101== HEAP SUMMARY:
==1323101==     in use at exit: 0 bytes in 0 blocks
==1323101==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==1323101== 
==1323101== All heap blocks were freed -- no leaks are possible
==1323101== 
==1323101== For lists of detected and suppressed errors, rerun with: -s
==1323101== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <SectionHeading id="strtok_r"><Code>strtok_r</Code></SectionHeading>

      <P>Let's discuss one final string function: <Code>strtok_r</Code>, provided by <Code>string.h</Code>. This one's much more complicated than the ones we've discussed so far, so strap in.</P>

      <P>The purpose of <Code>strtok_r</Code> is to <Bold>tokenize</Bold> a string. To tokenize a string means to break it up into individual parts, known as <Bold>tokens</Bold>, and extract them.</P>

      <P>For example, consider the string <Code>"3.7,4.2,1.5"</Code>. If we interpret the commas as token separators, then this string has three tokens: <Code>3.7</Code>, <Code>4.2</Code>, and <Code>1.5</Code>. Imagine if we could extract those three tokens and store them in three separate C string variables (or in an array of character pointers, each element of which will point to one of the respective tokens). This is what <Code>strtok_r</Code> is designed to do.</P>

      <P>Before you can use it, you must first declare a <Code>char*</Code> variable. Let's call it <Code>saveptr</Code>. Conventionally, you should initialize it to <Code>NULL</Code>. We will be passing its address (i.e., a <Code>char**</Code>) as the <Ul>third</Ul> argument to <Code>strtok_r</Code>, which will then update it. The purpose of this pointer is to keep track of where the most recent call to <Code>strtok_r</Code> left off in the tokenization process. That way, when we call <Code>strtok_r</Code> again, it can refer to <Code>saveptr</Code> to pick up where it left off at the end of the previous call, extracting one token per call. That will make more sense in a moment.</P>

      <P>Second, before you can call <Code>strtok_r</Code>, you must have a <Ul>writable copy</Ul> of the string that you want to tokenize. This means that if you want to tokenize a string represented via a <Code>const char*</Code> variable, or a string that's stored in the readonly section of the data segment, you must first create a writable character array (on the stack or the heap, whatever makes sense for your use case) and copy the contents of the target string into it. You might use <Code>strcpy</Code> to do this. This is necessary since, as we'll see, <Code>strtok_r</Code> actually <Ul>modifies</Ul> the string that it's tokenizing. (Even if the string that you want to tokenize is already writable, you may still want to tokenize a copy of it given the fact that <Code>strtok_r</Code> will modify it).</P>

      <P>You can then begin tokenizing the [writable copy of the] string. On the first call to <Code>strtok_r</Code>, to kick off the tokenization process, pass three arguments: 1) the [writable copy of the] string that you want to tokenize, 2) a separate string (often a literal) representing a list of the valid token separators (e.g., <Code>","</Code> if you're tokenizing a comma-separated list of values, such as <Code>"3.7,4.2,1.5"</Code>), and 3) the address of <Code>saveptr</Code> (the <Code>char*</Code> variable that you pre-declared). It will return a <Code>char*</Code> value representing the <Ul>first</Ul> token of the string.</P>

      <P>So, this is what we have so far:</P>

      <CBlock showLineNumbers={false}>{
`const char* my_string = "3.7,4.2,1.5"; // The string to tokenize

char* saveptr = NULL; // To keep track of where strtok_r left off

// Create a writable copy of the string to tokenize (add 1 to the
// string length to account for the null terminator)
char* copy = malloc((strlen(my_string) + 1) * sizeof(char));
if (!copy) {
        printf("Error on malloc()\\n");
        exit(1);
}
strcpy(copy, my_string);

// I'm going to store the three tokens in an array of three char*
// values (yes, an array of three character POINTERS, each of
// which will point to one of the three tokens in the string
// being tokenized):
char* tokens[3];

// Now we call strtok_r for the first time, storing the first
// token in tokens[0]
tokens[0] = strtok_r(copy, ",", &saveptr);`
      }</CBlock>

      <P>I'll explain more about how <Code>strtok_r</Code> works in a moment. Let's complete this demo first.</P>

      <P>To extract the two remaining tokens from the string (<Code>copy</Code>), we have to call <Code>strtok_r</Code> two more times. That is, it extracts one token per call. However, the remaining calls will be slightly different: rather than passing <Code>copy</Code> for the first argument, we're going to pass <Code>NULL</Code> for the first argument. Indeed, to <Ul>start</Ul> tokenizing a string, you must supply that string as the first argument, but to <Ul>continue</Ul> tokenizing a string, you must instead supply <Code>NULL</Code> as the first argument.</P>

      <P>So, here's the completed demo:</P>

      <CBlock showLineNumbers={false} highlightLines="{24-1000}">{
`const char* my_string = "3.7,4.2,1.5"; // The string to tokenize

char* saveptr = NULL; // To keep track of where strtok_r left off

// Create a writable copy of the string to tokenize (add 1 to the
// string length to account for the null terminator)
char* copy = malloc((strlen(my_string) + 1) * sizeof(char));
if (!copy) {
        printf("Error on malloc()\\n");
        exit(1);
}
strcpy(copy, my_string);

// I'm going to store the three tokens in an array of three char*
// values (yes, an array of three character POINTERS, each of
// which will point to one of the three tokens in the string
// being tokenized):
char* tokens[3];

// Now we call strtok_r for the first time, storing the first
// token in tokens[0]
tokens[0] = strtok_r(copy, ",", &saveptr);

// Call strtok_r for the second time, storing the token in
// tokens[1]. But this time, we pass NULL as the first argument.
tokens[1] = strtok_r(NULL, ",", &saveptr);

// And the third time:
tokens[2] = strtok_r(NULL, ",", &saveptr);

// At this point, tokens[0] represents the string "3.7",
// tokens[1] represents "4.2", and tokens[2] represents "1.5".
// You can now do whatever you want with those tokens (e.g.,
// iterate through them with a loop, using strtod to convert
// them to doubles and add them up, or whatever...)

// Don't forget to free the copy (but be careful about when
// you free it. Read on!)
free(copy);`
      }</CBlock>

      <P>Now, how exactly does <Code>strtok_r</Code> work? Well, here's what it does in the simplest cases:</P>

      <Enumerate listStyleType="decimal">
        <Item>If the first argument is not <Code>NULL</Code>, then it must point to the beginning of a C string to be tokenized. In such a case, the token extraction process will start from the beginning of said string. Otherwise, if it <It>is</It> <Code>NULL</Code>, then the token extraction process will pick up from the character where it left off in the previous call to <Code>strtok_r</Code>. The address of this character must be stored in <Code>saveptr</Code> (i.e., the <Code>char*</Code> variable that the third argument points to).</Item>
        <Item>It searches the string (starting from the beginning, or from where it left off in a previous call, depending on the values of the first and third arguments) for a token separator. The list of token separators to be considered is specified as a C string via the second argument to <Code>strtok_r</Code> (<Code>","</Code> in the above demo).</Item>
        <Item>If it finds a token separator, it <Ul>modifies</Ul> it, changing it into a null terminator. It then updates <Code>saveptr</Code> (the <Code>char*</Code> variable that the third argument points to) to store the address of the character that appears immediately <It>after</It> that token separator.</Item>
        <Item>It returns the address of the character from where it started the token extraction process (i.e., the beginning of the extracted token).</Item>
      </Enumerate>

      <P>For example, let's again consider the string <Code>"3.7,4.2,1.5\0"</Code> (I've denoted the null terminator with <Code>\0</Code>). The first call, <Code>tokens[0] = strtok_r(copy, ",", &saveptr)</Code>, specifies the string to be tokenized, replaces the first token separator in the string with a null terminator, updates <Code>saveptr</Code> to point to the character immediately <It>following</It> that first token separator, and returns the base address of the entire string, storing it in <Code>tokens[0]</Code>. That is, after the first call to <Code>strtok_r</Code>, the string being tokenized (<Code>copy</Code>) now looks like <Code>"3.7\04.2,1.5\0"</Code> because the first token separator (comma) has been replaced with a null terminator. Moreover, after the first call to <Code>strtok_r</Code>, <Code>saveptr</Code> has been updated to point to the character <Code>'4'</Code> immediately following the token separator that was just replaced with a null terminator.</P>

      {/*TODO Diagram here, and after each of the next couple paragraphs, to show how strtok_r modifies the 'copy' string, and how the elements of 'tokens' point to the various parts of the modified string.*/}

      <P>(There's an implication here: If you were to execute <Code>printf("%s\n", copy);</Code> after the first call to <Code>strtok_r</Code>, it would simply print <Code>3.7</Code> to the terminal since there's now a null terminator immediatley after the <Code>'7'</Code> character. This is why it's important to tokenize a writable copy of the string<Emdash/>the string is modified as it's tokenized.)</P>

      <P>The second call, <Code>tokens[1] = strtok_r(NULL, ",", &saveptr)</Code>, picks up where the first call left off. The <Code>NULL</Code> value for the first argument simply tells it to do exactly that (pick up where it left off, rather than starting from the beginning of some string). At the start of the call, <Code>saveptr</Code> stores the address of the <Code>'4'</Code> character (since the first call to <Code>strtok_r</Code> updated it to store that address), which tells it where to start the token extraction process from. It then searches through the string, starting from the <Code>'4'</Code>, until it finds the next token separator (comma). It replaces that token separator with another null terminator, updates <Code>saveptr</Code> to point to the character immediately <It>following</It> that token separator, and returns the address of the <Code>'4'</Code> character (from where it started the token extraction process), storing it in <Code>tokens[1]</Code>. The string being tokenized (<Code>copy</Code>) now looks like <Code>"3.7\04.2\01.5\0"</Code>, and <Code>saveptr</Code> now stores the address of the <Code>'1'</Code> character immediately following the second token separator (which is now a null terminator).</P>

      <P>Now, there's a detail I left out in my previous description of <Code>strtok_r</Code>: as you call it over and over again, eventually it will reach the last token, and that token might <It>not</It> end in a token separator. Instead, that token will often be the very last thing in the string, meaning it will end in a null terminator. That's actually fine. In the third call, <Code>tokens[2] = strtok_r(NULL, ",", &saveptr)</Code>, <Code>strtok_r</Code> picks up where it left off (at the <Code>'1'</Code> character) and searches for a token separator. But it doesn't find one. Instead, it finds the null terminator denoting the end of the entire string being tokenized. When that happens, it does something slightly special: 1) updates <Code>saveptr</Code> to <It>somehow</It> record the fact that the tokenization process has concluded (on the ENGR servers, it seems to update it to just store the address of the null terminator at the end of the string, but other reasonable implementations might exist), and then 2) it returns the address of the character where it started the last token extraction process, as per usual (the address of the <Code>'1'</Code> character, in this case).</P>

      <P>So, by the time all three calls are done, <Code>copy</Code> looks like <Code>"3.7\04.2\01.5\0"</Code>, <Code>tokens[0]</Code> stores the address of the <Code>'3'</Code> character, <Code>tokens[1]</Code> stores the address of the <Code>'4'</Code> character, and <Code>tokens[2]</Code> stores the address of the <Code>'1'</Code> character. Since the token separators were replaced with null terminators, each element of <Code>tokens</Code> is essentially like a pointer to its own small null-terminated C string. Lastly, <Code>saveptr</Code> was updated to somehow record the fact that the tokenization process has concluded (e.g., by storing the address of the null terminator at the very end of the string being tokenized).</P>

      <P>Importantly, <Code>strtok_r</Code> is capable of recognizing when you call it too many times. In such a case, it simply does nothing and returns <Code>NULL</Code>. For example, if we tried to call it a fourth time even though there were only three tokens in the string, it'd return <Code>NULL</Code> on the fourth call:</P>

      <CBlock showLineNumbers={false} highlightLines="{37-43}">{
`const char* my_string = "3.7,4.2,1.5"; // The string to tokenize

char* saveptr = NULL; // To keep track of where strtok_r left off

// Create a writable copy of the string to tokenize (add 1 to the
// string length to account for the null terminator)
char* copy = malloc((strlen(my_string) + 1) * sizeof(char));
if (!copy) {
        printf("Error on malloc()\\n");
        exit(1);
}
strcpy(copy, my_string);

// I'm going to store the three tokens in an array of three char*
// values (yes, an array of three character POINTERS, each of
// which will point to one of the three tokens in the string
// being tokenized):
char* tokens[3];

// Now we call strtok_r for the first time, storing the first
// token in tokens[0]
tokens[0] = strtok_r(copy, ",", &saveptr);

// Call strtok_r for the second time, storing the token in
// tokens[1]. But this time, we pass NULL as the first argument.
tokens[1] = strtok_r(NULL, ",", &saveptr);

// And the third time:
tokens[2] = strtok_r(NULL, ",", &saveptr);

// At this point, tokens[0] represents the string "3.7",
// tokens[1] represents "4.2", and tokens[2] represents "1.5".
// You can now do whatever you want with those tokens (e.g.,
// iterate through them with a loop, using strtod to convert
// them to doubles and add them up, or whatever...)

// If we called it a fourth time, it would analyze saveptr and
// notice that it (somehow) indicates that the tokenization
// process has already concluded. It simply returns NULL in
// such a case.
char* fourth_token = strtok_r(NULL, ",", &save_ptr);

// fourth_token is now NULL. saveptr is unmodified.

// Don't forget to free the copy (but be careful about when
// you free it. Read on!)
free(copy);`
      }</CBlock>

      <P>Of course, if you want to start a <It>fresh</It> tokenization process to tokenize an entirely different string, you can do that<Emdash/>just pass said string as the first argument to <Code>strtok_r</Code> to kick off the new tokenization process. (You can even tokenize two or more strings concurrently by keeping track of separate save pointers for each of the tokenization processes.)</P>

      <P>Now, I should bring something to your attention: <Code>strtok_r</Code> does <Ul>not</Ul> allocate any memory in which to store the extracted tokens. That's to say, it doesn't create <It>new</It> strings and copy the tokens into them. Rather, it simply modifies the string being tokenized, replacing its token separators with null terminators, and returns pointers that point to the beginnings of the tokens within said string.</P>

      <P>This strategy is very efficient. However, if you don't understand it, there can be disastrous consequences. Consider the above demo. <Code>tokens[0]</Code> stores the address of the <Code>'3'</Code> character at the beginning of the tokenized string. <Code>copy</Code> also points to that <Code>'3'</Code> (i.e., <Code>tokens[0]</Code> and <Code>copy</Code> store the exact same address). That character is part of a heap-allocated character array (see the <Code>malloc</Code> call where <Code>copy</Code> was initialized). This means that once that character array is freed, <Code>tokens[0]</Code> will become a dangling pointer<Emdash/>it will point to a character in an array that has been freed from memory. But it's not just <Code>tokens[0]</Code>; it's also <Code>tokens[1]</Code> and <Code>tokens[2]</Code>. None of these character pointers point to their own separate arrays in memory. Rather, they all point to various <It>parts</It> of the tokenized string's character array, after replacing the token separators with null terminators.</P>

      <P>Indeed, when <Code>free(copy)</Code> is called at the end of the above demo, thereby freeing the underlying dynamic character array, <Ul>all</Ul> of the character pointers in <Code>tokens</Code> become dangling pointers. If you don't want that to happen, then it's absolutely critical that you create additional, separate character arrays (e.g., on the heap) in which to store each of the tokens, and then use, say, <Code>strcpy</Code> to copy the tokens into them. For example:</P>

      <CBlock showLineNumbers={false}>{
`char* token = strtok_r(copy, ",", &saveptr);
tokens[0] = malloc((strlen(token) + 1) * sizeof(char));
if (!tokens[0]) {
        printf("Error on malloc()\\n");
        exit(1);
}
strcpy(tokens[0], token);`
      }</CBlock>

      <P>You'd have to do this for each of the tokens. This strategy<Emdash/>copying the tokens into their own separate character arrays on the heap<Emdash/>separates the "ownership" of the tokens from that of the string being tokenized. That is, it allows you to free the string that you tokenized (<Code>copy</Code>) without freeing the tokens that were extracted from it.</P>

      <P>In such a case, you'd have to call <Code>free(copy)</Code> once you're done tokenizing it (as we did), but you'd <It>also</It> have to free each of the tokens one at a time when you're done using them later on in the program (e.g., <Code>free(tokens[i])</Code> in a for loop that runs three times).</P>

      <P>I mentioned that the second argument to <Code>strtok_r</Code> specifies a <It>list</It> of viable token separators. In the previous example, there was just a single token separator (commas). But if a given token separator is allowed to be one of <It>several</It> characters, then you can specify all those characters in the C string passed as the second argument. For example, if a string contains some tokens each separated by <It>either</It> a comma or a semicolon, then you could pass <Code>",;"</Code> as the second argument to <Code>strtok_r</Code>. Importantly, this does not mean that <Code>",;"</Code> is a token separator. Rather, it means that commans <It>and</It> semicolons are each viable token separators in their own right. Unfortunately, <Code>strtok_r</Code> is not capable of handling multi-character token separators (e.g., if each token truly is separated by a comma followed by a semicolon, <Code>strtok_r</Code> can't handle that out of the box).</P>

      <P>Finally, there were exactly three tokens in the previous example, but what if you don't know how many tokens there are in the string that you want to tokenize? In that case, you can call <Code>strtok_r</Code> in a while loop until it returns <Code>NULL</Code>, indicating that the tokenization process has concluded and that there are no more tokens to extract. In a particularly complex program, you might even need to create a dynamic array of character pointers (handled by a <Code>char**</Code> variable) in which to store pointers to all those tokens, expanding it with <Code>realloc</Code> over and over again as necessary. However, this would essentially be a non-contiguous dynamic multidimensional character array, and we'll be covering such things in a future lecture.</P>

      <P>I do want to give you an example of a program that can deal with an arbitrary number of tokens, though, so here's one where the tokens aren't stored in an array at all, but rather they're converted to <Code>double</Code> values via <Code>strtod</Code> on-the-fly and added up to compute a running sum:</P>

      <CBlock fileName="strtokr.c">{
`#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main(void) {
        printf("Enter a comma-separated list of numbers: ");
        char* line = NULL;
        size_t n = 0;
        ssize_t len = getline(&line, &n, stdin);
        if (len == -1) {
                printf("Error on getline()\\n");
                exit(1);
        }
        if (len >= 1 && line[len - 1] == '\\n') {
                line[len - 1] = '\\0';
        }
        if (len >= 2 && line[len - 2] == '\\r') {
                line[len - 2] = '\\0';
        }

        // We'll compute the sum of all the values the user entered
        // (e.g., if they entered 3.7,4.2,1.5 then we'll compute
        // 3.7 + 4.2 + 1.5 = 9.4)

        char* saveptr = NULL; // For third argument to strtok_r
        double sum = 0.0;
        char* current_token;

        // Call strtok_r, passing line as the first argument since
        // this is the first call. Second argument is "," since
        // it's a comma-separated list of numbers. Third argument
        // is &saveptr, so saveptr will keep track of where the
        // most recent call to strtok_r left off (so that the next
        // call can pick up from there).
        current_token = strtok_r(line, ",", &saveptr);

        // While the most recent call to strtok_r returned an
        // actual token (not NULL)
        while (current_token) {
                // Extract double value with strtod and add to sum
                double value = strtod(current_token, NULL);
                sum += value;

                // Call strtok_r again. This time, pass NULL as the
                // first argument. Signals that strtok_r should pick
                // up where it left off in a previous call (and that
                // location where it left off is stored in saveptr,
                // whose address we again pass as the third argument).
                current_token = strtok_r(NULL, ",", &saveptr);
        }

        // Once the final token has been extracted, the subsequent
        // call to strtok_r returns NULL, and the loop ends.
        // That has now happened. Print the computed sum.
        printf("The sum is %lf\\n", sum);

        // Remember: every call to strtok_r actually MODIFIES the
        // string that it's currently tokenizing (i.e., the string
        // that was passed as the first argument to the FIRST call
        // to strtok_r, which started the tokenization process).
        // Specifically, it replaces token separators (commas, in
        // this case) with null terminators (and updates the char*
        // that saveptr points to) as it goes. To prove it, I'll
        // print the line string again. But now, the first comma
        // has been replaced with a null terminator, so this will
        // just print the first token in the user's entered string.
        printf("%s\\n", line);

        free(line);
}
`
      }</CBlock>

      <P>And here's an example output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o strtokr strtokr.c 
$ valgrind ./strtokr 
==3966429== Memcheck, a memory error detector
==3966429== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==3966429== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==3966429== Command: ./strtokr
==3966429== 
Enter a comma-separated list of numbers: 3.7,4.2,1.5
The sum is 9.400000
3.7
==3966429== 
==3966429== HEAP SUMMARY:
==3966429==     in use at exit: 0 bytes in 0 blocks
==3966429==   total heap usage: 3 allocs, 3 frees, 2,168 bytes allocated
==3966429== 
==3966429== All heap blocks were freed -- no leaks are possible
==3966429== 
==3966429== For lists of detected and suppressed errors, rerun with: -s
==3966429== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>This program works with an arbitrarily long list of comma-separated values<Emdash/>not just three.</P>

      <SectionHeading id="pointer-to-middle">Pointer to the middle of a string</SectionHeading>

      <P>I've mentioned in the past that if you have a pointer that points to an element somewhere in the middle of an array, you can treat it as if it were the base address of an array whose first element is the value that the pointer points to. For example:</P>

      <CBlock showLineNumbers={false}>{
`int vals[] = {1, 7, 2, 4, 6};
int* ptr = vals + 1; // Points to the 7
printf("%d\\n", ptr[0]); // Prints 7
printf("%d\\n", ptr[1]); // Prints 2
printf("%d\\n", ptr[2]); // Prints 4
printf("%d\\n", ptr[3]); // Prints 6`
      }</CBlock>

      <P>Similarly, a <Code>char*</Code> that points to a character in the middle of a C string's contents can be treated as if it were the base address of a C string whose contents started at that character. You can combine this idea with many of the functions that we've discussed throughout this lecture to do lots of useful things. For example:</P>

      <CBlock showLineNumbers={false}>{
`// Find the first occurrence of the substring "cat" within
// my_string that starts ON OR AFTER the 13th character of
// my_string (i.e., skip the first 12 characters of my_string
// when searching for "cat")
char* ptr = strstr(my_string + 12, "cat");

// Check if the last 4 characters of my_string is ".csv"
if (strcmp(my_string + strlen(my_string) - 4, ".csv") == 0) {
    // ...
}

// Extract the substring from my_string starting at the 7th character
// and going through the 10th character, storing it in the dest array
// (uses strncpy, mentioned earlier). In case this substring doesn't
// contain a null terminator, we should prefill dest with a bunch of
// null terminators.
char dest[256] = {0};
strncpy(dest, my_string + 6, 4);
`
      }</CBlock>

      <P>As always, you must be very careful when doing pointer arithmetic like this. If <Code>my_string</Code> contains a bunch of contents followed by a single null terminator, and <Code>my_string + N</Code> (for some value <Code>N</Code>) points to some character that comes <It>after</It> the null terminator (even if it's still a valid element in the underlying character array), then passing <Code>my_string + N</Code> to any of these string functions will invoke undefined behavior. That's because these functions will interpret <Code>my_string + N</Code> as the base address of a C string, but such a C string wouldn't be properly null-terminated (and therefore not a valid C string) since <Code>my_string + N</Code> points to some character <It>after</It> the null terminator.</P>

      <SectionHeading id="and-more">And more!</SectionHeading>

      <P>There are many other string functions provided by <Code>string.h</Code>, and some in <Code>stdlib.h</Code>, that weren't discussed in this lecture. I encourage you to take a look through <Link href="https://man7.org/linux/man-pages/man0/string.h.0p.html">the documentation</Link> to see what's available before reinventing the wheel.</P>

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
