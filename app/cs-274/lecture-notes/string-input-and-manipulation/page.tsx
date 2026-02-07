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
        <Item><Link href="#strlen"><Code>strlen</Code></Link></Item>
        <Item><Link href="#str"><Code>strcmp</Code></Link></Item>
        <Item><Link href="#strcpy"><Code>strcpy</Code></Link></Item>
        <Item><Link href="#strcat"><Code>strcat</Code></Link></Item>
        <Item><Link href="#sprintf"><Code>sprintf</Code></Link></Item>
        <Item><Link href="#strstr"><Code>strstr</Code></Link></Item>
        <Item><Link href="#strtok"><Code>strtok_r</Code></Link></Item>
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

int main() {
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

int main() {
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

      <P>A much better way<Emdash/>perhaps the best way<Emdash/>to read string user inputs is via the <Code>getline</Code> function, provided by <Code>stdio.h</Code>. It reads an entire line of text from a specified file stream (e.g., standard input). It accepts three arguments: 1) A pointer that stores the address <It>of a character pointer</It> (yes, a <Code>char**</Code> value); 2) A pointer that stores the address of a <Code>size_t</Code> variable (i.e., a <Code>size_t*</Code> value); and 3) a pointer to a file stream from which you'd like to read a line of text. In most cases, when the goal is to read from standard input (the terminal), the character pointer <It>that the first argument points to</It> should be initialized to <Code>NULL</Code>; the <Code>size_t</Code> variable that the second argument points to should be initialized to 0, and the third argument should simply be the builtin constant <Code>stdin</Code> (it's a file stream pointer that refers to the process's standard input).</P>

      <P>In other words, you can call <Code>getline()</Code> to read a line of text from the user like so:</P>

      <CBlock showLineNumbers={false}>{
`// We will pass the ADDRESS of this as the first arg to getline
char* line = NULL;

// We will pass the ADDRESS of this as the second arg to getline
size_t n = 0;

// Now we call getline, passing stdin (standard input) as the third arg
getline(&line, &n, stdin);`
      }</CBlock>

      <P>As you might've guessed, the reason that <Code>line</Code> and <Code>n</Code> are passed by pointer is so that the <Code>getline</Code> function can <Ul>modify</Ul> them (this is a very common reason for passing things around by pointer). And, indeed, <Code>getline</Code> will do precisely that. When the above <Code>getline</Code> call is done executing:</P>

      <Enumerate listStyleType="decimal">
        <Item><Code>line</Code> will store the base address of a brand new <Ul>dynamically allocated</Ul> character array containing a (null-terminated) C string representing an entire line of text that was read from standard input (e.g., supplied by the user).</Item>
        <Item><Code>n</Code> will store the size (in bytes) of the dynamically allocated character array that <Code>line</Code> now points to.</Item>
      </Enumerate>

      <P><Code>getline</Code> is a very clever function. It determines the amount of characters contained in the line of text entered by the user, and it dynamically allocates a character array that's big enough to store all of those characters as well as at least one null terminator. It stores said characters in the array, and then it then updates the character pointer whose address was supplied as the first argument, causing to point to that dynamically allocated array. The dynamic sizing of the character array according to the length of the line of text means that there's no chance of a buffer overflow occurring as a result of the user typing in a large number of characters (unlike with <Code>scanf</Code>).</P>

      <P>However, there's a convenience tradeoff: any call to <Code>getline</Code> can allocate dynamic memory, and <Ul>you're responsible for freeing it</Ul>. That's to say, once the program is done with the C string containing the user's supplied line of text, it must use the <Code>free()</Code> function to free it, or else your program will have a memory leak.</P>

      <P>Here's an example:</P>

      {/*TODO*/}

      <CBlock fileName="getline.c">{
`#include <stdlib.h> // For free()
#include <stdio.h>

int main() {
        char* line = NULL;
        size_t n = 0;
        printf("Give me a fun quote: ");

        getline(&line, &n, stdin);

        printf("Your quote was: %s\\n", line);
        printf("%ld bytes were allocated to the character array to store "
                "the line of text\\n", n);

        // The program is done with the line of text, so we should free
        // it
        free(line);

        // I know, this program is boring. We'll make it more interesting
        // soon.
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

      <P>Now, you might have noticed a couple funny things about the above program. First of all, the quote <Code>The epic highs and lows of high school football</Code> has a total of 47 characters (including the letters and spaces), and a single <Code>char</Code> always occupies a single byte of space, and yet a whopping 120 bytes were allocated for the array. Indeed, <Code>getline</Code> can, and often does, allocate more memory than is technically necessary to store the user's provided line of text. There are good reasons for this (e.g., to prioritize runtime efficiency over memory efficiency in its dynamic allocation strategy), but we won't get into the details.</P>

      <P>More importantly, take a close look at the program's output:</P>

      <TerminalBlock copyable={false}>{
`Give me a fun quote: The epic highs and lows of high school football
Your quote was: The epic highs and lows of high school football

120 bytes were allocated to the character array to store the line of text`
      }</TerminalBlock>

      <P>Notice: There's an extra empty line between the printed quote and the subsequent printout about the number of allocated bytes. There's a good reason for this. Earlier, I mentioned that <Code>scanf</Code> skips leading whitespace and leaves trailing whitespace in the buffer. <Code>getline</Code>, in contrast, reads and retrieves all whitespace that it encounters, <Ul>including the newline character sequence (<Code>\n</Code>) at the end of the user's line of text.</Ul></P>

      <P>The result? In the above program run, the dynamic array that <Code>line</Code> points to actually has 48 characters of string content: the 47 characters of letters and spaces in the user's provided quote, and a single <Code>\n</Code> character. (There's also a null terminator, <Code>\0</Code>, in the character array following the <Code>\n</Code>, but that's not part of the string's "contents" by definition).</P>

      <P>(Also, on Windows and other platforms that use DOS-style line endings, the string would actually have 49 characters of string content. More on this in a moment.</P>

      <P>When the program then calls <Code>printf("Your quote was: %s\n", line)</Code>, it ends up printing <Ul>two</Ul> newline character sequences: 1) the one stored in the C string that <Code>line</Code> points to, and 2) the one at the end of the format string supplied as the first argument to <Code>printf</Code>.</P>

      <P>Of course, if we just wanted to get rid of the extra empty line in the program's output, we could just omit the <Code>\n</Code> from the end of our format string in the <Code>printf</Code> call. But often times, the program needs to do more to the user's input than just print it back out to them. For instance, programs often need to parse the user's input and respond accordingly. In such a case, the newline character sequence at the end of the C string can confuse the parsing code.</P>

      <P>For this reason, it's often a good idea to trim the newline character sequence at the end of the C string by replacing it with a null terminator. The trouble, though, is that different platforms represent newline character sequences in different ways. On Unix-like systems, a newline character sequence is simply a single line feed character. But on Windows, which uses DOS-style line endings, a newline character sequence is a sequence of two characters: a carriage return character, followed by a line feed character.</P>

      <P>So, to properly trim the newline character sequence at the end of the C string in a platform-independent way, you have to be a bit clever:</P>

      <CBlock fileName="getline.c" highlightLines="{3,12-25}">{
`#include <stdlib.h> // For free()
#include <stdio.h>
#include <string.h>

int main() {
        char* line = NULL;
        size_t n = 0;
        printf("Give me a fun quote: ");

        getline(&line, &n, stdin);

        // Remember strlen? Determines length of C string's contents
        size_t len = strlen(line);

        // Replace the last character of the string's contents with a
        // null terminator, shortening it by one character:
        line[len - 1] = '\\0';

        // But if this is Windows or a similar platform, then there will
        // additionally be a carriage return (\\r) before the line feed
        // character. Let's check for that with an if statement and trim
        // it as well if necessary
        if (line[len - 2] == '\\r') {
                line[len - 2] = '\\0';
        }

        printf("Your quote was: %s\\n", line);
        printf("%ld bytes were allocated to the character array to store "
                "the line of text\\n", n);

        // The program is done with the line of text, so we should free
        // it
        free(line);

        // I know, this program is boring. We'll make it more interesting
        // soon.
}
`
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

      <P>There's something that I glossed over: <Code>getline</Code> actually produces a return value. Specifically, it returns an <Code>ssize_t</Code> value (i.e., a "signed size-type" value) representing the length of the string contents of the user's entered line of text. In other words, in the above program, <Code>strlen(line)</Code> can be replaced with the return value of the <Code>getline</Code> call that retrieved the line of next. Note that this is different from the value that <Code>n</Code> is updated to store, which is the size (in bytes) of the dynamic character array <It>containing</It> the C string (which is often much larger than the string itself, as in the above example runs).</P>

      <P>The reason that the return type is <Code>ssize_t</Code> instead of <Code>size_t</Code> is that <Code>getline</Code> can be used to read from arbitrary file input streams<Emdash/>not just standard input<Emdash/>and when reading from a regular file instead of standard input, you'll eventually reach the <It>end</It> of the file. When that happens, subsequent calls to <Code>getline</Code> return <Code>-1</Code>. But since this is a negative value, it can't be represented by a <Code>size_t</Code> return type. Hence, it uses <Code>ssize_t</Code><Emdash/>"signed size type"<Emdash/>which is capable of storing signed (positive <It>or</It> negative) values.</P>

      <P>Here's an updated version of our code that makes use of the <Code>getline</Code> call's return value:</P>

      <CBlock fileName="getline.c" highlightLines="{9}">{
`#include <stdlib.h> // For free()
#include <stdio.h>

int main() {
        char* line = NULL;
        size_t n = 0;
        printf("Give me a fun quote: ");

        ssize_t len = getline(&line, &n, stdin);

        // Replace the last character of the string's contents with a
        // null terminator, shortening it by one character:
        line[len - 1] = '\\0';

        // But if this is Windows or a similar platform, then there will
        // additionally be a carriage return (\\r) before the line feed
        // character. Let's check for that with an if statement and trim
        // it as well if necessary
        if (line[len - 2] == '\\r') {
                line[len - 2] = '\\0';
        }

        printf("Your quote was: %s\\n", line);
        printf("%ld bytes were allocated to the character array to store "
                "the line of text\\n", n);

        // The program is done with the line of text, so we should free
        // it
        free(line);

        // I know, this program is boring. We'll make it more interesting
        // soon.
}
`
      }</CBlock>

      <P>Notice: We no longer need a <Code>strlen()</Code> call (which saves the program some time, since <Code>strlen</Code> fundamentally just counts characters in a loop until it encounters a null terminator), and we were even able to omit the <Code>string.h</Code> include in turn.</P>

      <P>Finally, I mentioned that, when reading from standard input, the character pointer and <Code>size_t</Code> value that are both passed by pointer as the first two arguments to <Code>getline</Code> should typically be initialized to <Code>NULL</Code> and 0, respectively, prior to the call. This is actually very important. If the character pointer whose address is passed as the first arugment to <Code>getline</Code> (i.e., <Code>line</Code>, in the above program) <It>isn't</It> <Code>NULL</Code>, then it <Ul>must</Ul> store the base address of a pre-allocated dynamic array of characters, and the <Code>size_t</Code> value passed by pointer as the second argument (i.e., <Code>n</Code>, in the above program) <Ul>must</Ul> store the size (in bytes) of that character array. In such a case, <Code>getline</Code> will attempt to use that pre-allocated character array to store the user's entered line of text. If the line of text doesn't fit in that character array, it will reallocate the character array via <Code>realloc</Code>.</P>

      <P>(Technically, it doesn't matter what the <Code>size_t</Code> value is initialized to if the character pointer is initialized to <Code>NULL</Code>, but initializing it to 0 in such a case is conventional.)</P>

      <P>This feature can be useful for performance reasons. If you already have a pre-allocated dynamic array, and you think that there's a good chance that the user's line of text will fit in it, you can have <Code>getline</Code> simply use that character array rather than allocating a new one.</P>

      <P>However, it also means that you must be extremely careful when calling getline<Emdash/>if the character pointer whose address is passed as the first argument to <Code>getline</Code> isn't <Code>NULL</Code>, then <Code>getline</Code> will dereference it and try to store characters inside it. If it's <It>uninitialized</It>, then <Code>getline</Code> will end up dereferencing an uninitialized pointer, and undefined behavior will ensue. Similarly, if the <Code>size_t</Code> value that the second argument points to is uninitialized (and the character pointer that the first argument points to isn't <Code>NULL</Code>), then <Code>getline</Code> will dereference the second argument and read the uninitialized <Code>size_t</Code> value, also invoking undefined behavior.</P>

      <P>To be safe, I strongly recommend just building a habit of initializing the character pointer to <Code>NULL</Code> and the <Code>size_t</Code> value to 0 before passing them each by pointer as the first two arguments to <Code>getline</Code>. Only go against this advice when you're looking to improve performance (and, in that case, make sure you know what you're doing).</P>

      <SectionHeading id="fgets"><Code>fgets</Code></SectionHeading>

      {/*TODO*/}

      <SectionHeading id="strlen"><Code>strlen</Code></SectionHeading>

      {/*TODO*/}

      <SectionHeading id="strcmp"><Code>strcmp</Code></SectionHeading>

      {/*TODO*/}
      
      <SectionHeading id="strcpy"><Code>strcpy</Code></SectionHeading>

      {/*TODO*/}

      <SectionHeading id="strcat"><Code>strcat</Code></SectionHeading>

      {/*TODO*/}

      <SectionHeading id="sprintf"><Code>sprintf</Code></SectionHeading>

      {/*TODO*/}

      <SectionHeading id="strstr"><Code>strstr</Code></SectionHeading>

      {/*TODO*/}

      <SectionHeading id="strtok"><Code>strtok_r</Code></SectionHeading>

      {/*TODO*/}

      <SectionHeading id="and-more">And more!</SectionHeading>

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
