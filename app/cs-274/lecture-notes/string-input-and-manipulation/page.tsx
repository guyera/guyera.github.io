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
        <Item><Link href="#str"><Code>strcmp</Code></Link></Item>
        <Item><Link href="#strcpy"><Code>strcpy</Code></Link></Item>
        <Item><Link href="#strcat"><Code>strcat</Code></Link></Item>
        <Item><Link href="#sprintf"><Code>sprintf</Code></Link></Item>
        <Item><Link href="#strstr"><Code>strstr</Code></Link></Item>
        <Item><Link href="#strtol-strtod"><Code>strtol</Code> and <Code>strtod</Code></Link></Item>
        <Item><Link href="#strtok_r"><Code>strtok_r</Code></Link></Item>
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

        // I know, this program is boring. We'll learn how to do more
        // interesting things with strings soon.
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

        // I know, this program is boring. We'll learn how to do more
        // interesting things with strings soon.
}
`
      }</CBlock>

      <P>Notice: We no longer need a <Code>strlen()</Code> call (which saves the program some time, since <Code>strlen</Code> fundamentally just counts characters in a loop until it encounters a null terminator), and we were even able to omit the <Code>string.h</Code> include in turn.</P>

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

int main() {
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

      <P>To be clear, you should usually just use <Code>getline</Code> to read text inputs, especially when those inputs are coming from the user. But again, <Code>fgets</Code> can yield some performance advantages over <Code>getline</Code> in contexts where it's safe to make assumptions about the maximum length of a line.</P>

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

      <P>To compare the strings' contents, you'd have to iterate through them both simultaneously (e.g., with a for loop) and compare their characters one at a time. Luckily, the <Code>strcmp</Code> function is already implemented for you, and it does exactly that. It accepts two C strings as inputs and returns an <Code>int</Code> value. If the two C strings contain the exact same contents (case-sensitive), it returns 0. Otherwise, it returns a nonzero value. Specifically, it returns a positive value if the first string comes after the second string in lexicographical order (like alphabetical order, but based on the characters' integer encodings (e.g., ASCII values)), and it returns a negative value if the first string comes before the second string in lexicographical order.</P>

      <P>Here's an example:</P>

      <CBlock fileName="strcmp.c">{
`#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main() {
        printf("Enter the password: ");
        char* line = NULL;
        size_t n = 0;
        ssize_t len = getline(&line, &n, stdin);
        line[len - 1] = '\\0';
        if (line[len - 2] == '\\r') {
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

      <P>Again, if you want to copy the <It>contents</It> of a C string, in the general case, you'd have to use a loop and copy one character at a time until you encounter a null terminator. The <Code>strcpy</Code> function does exactly that. It accepts two arguments: 1) the base address of a character array into which you would like to store a copy of an existing C string; and 2) the existing C string that you would like to copy. That is, the argument order is 1) the <It>destination</It>, then 2) the <It>source</It>.</P>

      <P>The second argument <Ul>must</Ul> be a properly null-terminated character array. Moreover, the first argument <Ul>must</Ul> point to a character array that is sufficiently large enough to store the copied contents. If either of these conditions is violated, undefined behavior will ensue.</P>

      <P>Here's an example:</P>

      <CBlock fileName="strcpy.c">{
`#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main() {
        printf("Enter a sentence: ");
        char* line = NULL;
        size_t n = 0;
        ssize_t len = getline(&line, &n, stdin);
        line[len - 1] = '\\0';
        if (line[len - 2] == '\\r') {
                line[len - 2] = '\\0';
        }

        // Create a copy of the sentence. First, create an array
        // that's big enough to store the copy (strlen(line), plus
        // one for a null terminator).
        len = strlen(line);
        char* copy = malloc((len + 1) * sizeof(char));

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
}
`
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

      <SectionHeading id="strcat"><Code>strcat</Code></SectionHeading>

      <P>Suppose you want to concatenate two C strings together (i.e., "glue" their contents together, one after another). It's actually possible to do this by using <Code>strcpy</Code> with a little bit of pointer arithmetic. For example:</P>

      <SyntaxBlock>{
`strcpy(string_1 + strlen(string_1), string_2);`
      }</SyntaxBlock>

      <P>Recall: Adding an integer to a pointer essentially shifts over that many "spaces" in memory, where a "space" is the size of the data type (in bytes) that the pointer points to. Hence, <Code>string_1 + strlen(1)</Code> evaluates to a pointer that points to the null terminator at the end of the first string. Since we're using that address as the destination address of <Code>strcpy</Code>, that null terminator will be modified, along with many characters following it in memory, to contain a copy of the contents of <Code>string_2</Code>.</P>

      <P>Of course, this only works if the array underlying <Code>string_1</Code> is big enough to store the current contents of <Code>string_1</Code> as well as the contents of <Code>string_2</Code> (plus a null terminator). You're responsible for making sure that's the case. Otherwise, you'll get a buffer overflow and undefined behavior.</P>

      <P>The above works perfectly fine, but there's another function that does the pointer arithmetic for you: <Code>strcat</Code>. It accepts two C strings as arguments. It then concatenates ("glues") the contents of the second argument onto the end of the contents of the first argument (and appends a null terminator). Again, this requires that the first string's underlying array be big enough to store the concatenated contents, plus one null terminator.</P>

      <P>Here's a complete example:</P>

      <CBlock fileName="strcat.c">{
`#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main() {
        printf("Enter a sentence: ");
        char* line = NULL;
        size_t n = 0;
        ssize_t len = getline(&line, &n, stdin);
        line[len - 1] = '\\0';
        if (line[len - 2] == '\\r') {
                line[len - 2] = '\\0';
        }

        printf("Enter another sentence: ");
        char* line2 = NULL;
        n = 0;
        len = getline(&line2, &n, stdin);
        line2[len - 1] = '\\0';
        if (line2[len - 2] == '\\r') {
                line2[len - 2] = '\\0';
        }

        // Create a character array that's big enough to store the
        // concatenated contents, plus a period and space between
        // them, plus one null terminator at the end
        size_t len1 = strlen(line);
        size_t len2 = strlen(line2);
        char* concatenated = malloc((len1 + len2 + 3) * sizeof(char));

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

      <P>But what if you want to combine lots of data together into a single string but <It>not</It> print it to the terminal? For example, what if you want to combine the contents of a bunch of pre-existing strings in some carefully formatted way, and simply store the result in another string? In the previous program, we hacked our way through this by calling <Code>strcpy</Code> and <Code>strcat</Code> a bunch of times. But as it turns out, there exists another function, <Code>sprintf</Code>, that makes these tasks much easier. It's exactly like <Code>printf</Code>, except instead of printing formatted string contents to standard output, it prints formated string contents <It>into a character array</It> as a C string (and properly null-terminates it).</P>

      <P><Code>sprintf</Code> accepts two or more arguments. The first argument is the base address of the character array (or the middle of the character array, etc) where you'd like to store the formatted C string. The second argument and on follow the same semantics as the arguments of <Code>printf</Code>. That is, the second argument of <Code>sprintf</Code> is the format string, and the third argument and on are the values that you'd like to substitute into the format specifiers within the format string.</P>
      
      <P>As with <Code>strcpy</Code> and <Code>strcat</Code>, there must be sufficient allocated space in the destination character array to store the produced C string, or else a buffer overflow and undefined behavior will ensue.</P>

      <P>Let's rewrite our previous program using <Code>sprintf</Code> instead of <Code>strcpy</Code> and <Code>strcat</Code>:</P>

      <CBlock fileName="sprintf.c" highlightLines="{31-33}">{
`#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main() {
        printf("Enter a sentence: ");
        char* line = NULL;
        size_t n = 0;
        ssize_t len = getline(&line, &n, stdin);
        line[len - 1] = '\\0';
        if (line[len - 2] == '\\r') {
                line[len - 2] = '\\0';
        }

        printf("Enter another sentence: ");
        char* line2 = NULL;
        n = 0;
        len = getline(&line2, &n, stdin);
        line2[len - 1] = '\\0';
        if (line2[len - 2] == '\\r') {
                line2[len - 2] = '\\0';
        }

        // Create a character array that's big enough to store the
        // concatenated contents, plus a period and space between
        // them, plus one null terminator at the end
        size_t len1 = strlen(line);
        size_t len2 = strlen(line2);
        char* concatenated = malloc((len1 + len2 + 3) * sizeof(char));

        // Print the first line, then ". ", then the second line,
        // all into 'concatenated'
        sprintf(concatenated, "%s. %s", line, line2);

        printf("The concatenated result is: %s\\n", concatenated);

        free(concatenated);
        free(line2);
        free(line);
}
`
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

      {/*TODO*/}
      
      <SectionHeading id="strtol-strtod"><Code>strtol</Code> and <Code>strtod</Code></SectionHeading>

      {/*TODO*/}

      <SectionHeading id="strtok_r"><Code>strtok_r</Code></SectionHeading>

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
