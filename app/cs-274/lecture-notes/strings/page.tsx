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
import Caption from '../ui/caption'

import { inter } from '@/app/ui/fonts'
import { lusitana } from '@/app/ui/fonts'
import { garamond } from '@/app/ui/fonts'

import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

import AsciiTable from './assets/ascii-table.png'

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
        <Item><Link href="#character-encodings">Character encodings</Link></Item>
        <Item><Link href="#string-literals">String literals and C strings</Link></Item>
        <Item><Link href="#printing-strings">Printing strings</Link></Item>
        <Item><Link href="#strlen"><Code>strlen()</Code></Link></Item>
        <Item><Link href="#other-string-functions">Other string functions?</Link></Item>
        <Item><Link href="#const-char-pointer">Why is it <Code>const char*</Code> instead of just <Code>char*</Code>?</Link></Item>
      </Itemize>
      
      <SectionHeading id="character-encodings">Character encodings</SectionHeading>

      <P>Computers represent all data in binary form. Numbers in particular (e.g., integers, floats, etc) are pretty easy to represent in binary form. After all, binary is itself a numbering system, just like decimal<Emdash/>you just have two symbols to work with instead of ten.</P>

      <P>But what about data that isn't inherently numeric? For example, what about characters like the letter <Code>'A'</Code>? How can computers store such data if computers operate entirely in terms of binary?</P>

      <P>The answer is <Bold>encodings</Bold>. An encoding is simply a way of converting data from one format to another. An encoding that specifically converts characters to binary, or to some other numbering system, is referred to as a <Bold>character encoding</Bold>. Most regular character encodings are bijections, meaning after a character is encoded into a number, it can just as easily be decoded by to a character<Emdash/>the mapping is one-to-one and works in both directions.</P>

      <P>The simplest common character encoding is the American Standard Code for Information Exchange (ASCII). At its core, it's simply a table that maps characters to numbers (and back). Since binary is a numbering system, computers can store and operate on these numbers in binary form.</P>

      <P>The ASCII table looks like this:</P>

      <Image src={AsciiTable} alt="A table with a column containing character symbols and a column containing corresponding integers" caption={<Caption>(<Link href="https://commons.wikimedia.org/wiki/File:Ascii-codes-table.png">Sourced from Wikimedia Commons</Link>, licensed CC BY-SA)</Caption>}/>

      <P>The ASCII table only covers a total of 127 characters, primarily those found on American keyboards in addition to a few others. It doesn't cover other countries' alphabets. However, it's a subset of other standard, more comprehensive character encodings (e.g., UTF-8), so most C implementations use the ASCII table for encoding these 127 characters. For example, the ASCII encoding of capital A is 65. This means that whenever a C program needs to store or operate on a capital A, it will most likely represent it under the hood as the number 65 (in binary form).</P>

      <P>However, it's not guaranteed that C programs will necessarily encode characters as numbers via the ASCII table. It's largely up to the compiler to decide exactly how to encode characters in binary form. The only guarantees are 1) characters must be encoded as numbers <It>somehow</It> (<Code>char</Code> is an integral type), and 2) a single <Code>char</Code> is allotted exactly one byte of space in memory.</P>

      <P>Note: I've only told you all this for context. In practice, you should basically <Ul>never</Ul> write ASCII values explicitly in your C programs (unless you're specifically writing some sort of dedicated ASCII encoder / decoder). Just let the compiler do the conversions for you. That's its job. If your code mentions any ASCII values explicitly, you're probably operating under the assumption that the compiler does, indeed, use ASCII as its character encoding. And as I said, that's not guaranteed. Still, it's <It>usually</It> a valid assumption in practice.</P>

      <SectionHeading id="string-literals">String literals and C strings</SectionHeading>

      <P>A <Bold>string</Bold> is a sequence of characters. A <Bold>string literal</Bold> is a hard-coded string value. As you've seen, they're enclosed in quotation marks in C, such as <Code>"Hello, World!\n"</Code>.</P>

      <P>Suppose you want to store a string literal inside a variable in C. In that case, you need some sort of string data type to represent the variable. But as it turns out, C doesn't have a string data type. Instead, in C, a string is considered to be <Ul>any array of characters whose content ends with one or more <Bold>null terminator</Bold> characters</Ul>. We'll discuss arrays in greater detail later, but for now, just understand that an array is a fixed-size, homogeneous sequence of values (if you're familiar with Python, think of arrays as being like Python's <Code>List</Code> objects, except arrays are homogeneous and fixed-size). C defines the null terminator character to be whatever character has the encoded value of 0 (regardless of the compiler's chosen character encoding). And, indeed, if you look back at the above ASCII table, you'll see that the character with the ASCII value of 0 is labeled "NULL". Null terminators are not printable / visible; they're "invisible" characters whose purpose is to mark the end of a C string. (The ASCII table supports several other non-printable characters as well, such as control characters like carriage returns, end-of-text, backspace, and so on).</P>

      <P>For example, suppose you construct an array of 8 characters: <Code>'H'</Code>, <Code>'e'</Code>, <Code>'l'</Code>, <Code>'l'</Code>, <Code>'o'</Code>, followed by two null terminator characters, and finally a capital <Code>'Z'</Code>. Such an array would be a valid C string<Emdash/>it's an array of characters, and its content ends in one or more null terminators (two, in this case). Based on that description, you might have noticed that the last character, <Code>'Z'</Code>, is <Ul>not</Ul> considered to be part of the string's content. Indeed, it's a part of the array of characters, but not really part of the <It>string</It>. This is precisely what null terminators do: they mark the end of the string's content, so anything appearing after them is ignored by functions that operate on strings (e.g., <Code>printf()</Code>). If this string were to be printed to the terminal, the output would simply be <Code>Hello</Code>. The null terminators would not be printed (they're non-printable), nor would the <Code>'Z'</Code> that comes after them.</P>

      {/*TODO diagram of H, e, l, l, o, two null terminators, Z*/}

      <P>We'll discuss this all in greater detail when we cover arrays. For now, I just want to show you how to store string literals inside of variables in C. Well, there are actually a few ways to do it, but here's one of them: </P>

      <SyntaxBlock>{
`const char* <name> = <string literal>;`
      }</SyntaxBlock>

      <P>Replace <Code>{'<name>'}</Code> with the name of the variable, and replace <Code>{'<string literal>'}</Code> with the string literal. For example:</P>

      <CBlock showLineNumbers={false}>{
`const char* my_string = "Hello, World!\\n";`
      }</CBlock>

      <P>I said that C represents strings as arrays of characters, so what's with the pointer? Well, when the compiler sees the string literal, <Code>"Hello, World!\n"</Code>, it embeds instructions into the executable to create an array of characters to represent the string when the program first starts. That array of characters contains an <Code>'H'</Code>, followed by an <Code>'e'</Code>, and so on, up to the <Code>'\n'</Code>, and finally one or more null terminator characters (yes, the compiler creates the null terminator for you in this case; you don't have to do it yourself). However, this all happens when the program first <It>starts</It>. When the program actually arrives at the above line of code, it doesn't need to create an array of characters<Emdash/>it has already done that. Instead, the string literal itself is effectively replaced with the <Ul>memory address of the first character</Ul> in that pre-created array: the capital <Code>'H'</Code>, in this case.</P>

      <P>That's to say, <Code>my_string</Code> is not technically an array, but rather a pointer that points to the first character (<Code>'H'</Code>) in an array that was created when the program first started.</P>
      
      <P>That might seem very indirect, but it actually works out really well. This will make more sense once we've covered arrays, but it turns out that if you have a pointer that stores the memory address of the first element of an array<Emdash/>often referred to as the array's <Bold>base address</Bold><Emdash/>then that pointer can be used as if it were the array itself. In other words, <Code>my_string</Code> is not technically an array of characters, but since it <It>points</It> to an array, it can be used as if it <It>were</It> the array. This saves the computer quite a bit of time. If the same string literal is used several times (e.g., because it's used within a function that's called several times), the computer doesn't need to allocate or initialize several identical arrays of characters<Emdash/>it just creates <It>one</It> array of characters to represent the string literal when the program first starts, and then whenever the string literal is used within the program, it simply refers back to that array of characters through its memory address.</P>

      <P>So, a pointer to an array can be used as if it were that array, and <Code>my_string</Code> is a pointer to an array of characters representing a C string. This means that we can use <Code>my_string</Code> anywhere that we could use a C string. There are many functions in C that operate on C strings. <Code>my_string</Code> can be passed to any one of them.</P>

      <P>We'll cover most of these string functions in a future lecture. To conclude this lecture, I'll just cover two of them: <Code>printf()</Code>, and <Code>strlen()</Code>.</P>

      <SectionHeading id="printing-strings">Printing strings</SectionHeading>

      <P>As you know, <Code>printf()</Code> is capable of printing various kinds of values. Just use the appropriate format specifier as a placeholder in the format string, and then supply an additional argument of a corresponding type. For example, <Code>%d</Code> is the format specifier for a decimal integer value (e.g., <Code>int</Code>), <Code>%f</Code> is the format specifier for a floating point value (e.g., <Code>float</Code>), <Code>%lf</Code> is for double-precision floating point numbers (<Code>double</Code>), and so on. It's even capable of printing memory addresses by supplying <Code>%p</Code> as the format specifier and providing a corresponding pointer argument.</P>

      <P>Regardless of how you use it, though, the first argument<Emdash/>the format string<Emdash/>must always be a C string. As of yet, we've always used a string literal for that argument. But you can also supply string variables here, such as variables of type <Code>const char*</Code>:</P>

      <CBlock fileName="printingstrings.c">{
`#include <stdio.h>

int main() {
        const char* my_string = "Hello, World!\\n";
        printf(my_string);
}`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o printingstrings printingstrings.c 
$ valgrind ./printingstrings 
==1297837== Memcheck, a memory error detector
==1297837== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1297837== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==1297837== Command: ./printingstrings
==1297837== 
Hello, World!
==1297837== 
==1297837== HEAP SUMMARY:
==1297837==     in use at exit: 0 bytes in 0 blocks
==1297837==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==1297837== 
==1297837== All heap blocks were freed -- no leaks are possible
==1297837== 
==1297837== For lists of detected and suppressed errors, rerun with: -s
==1297837== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Fine, but what's perhaps more useful is that you can also embed placeholders for other strings within the format string. The correct format specifier to use in such a case is <Code>%s</Code>. The additional corresponding arguments can either be string literals or string variables, just like the format string itself:</P>

      <CBlock fileName="printingstrings.c">{
`#include <stdio.h>

int main() {
        const char* format = "%s, %s!\\n";
        const char* first_word = "Hello";
        const char* second_word = "World";
        printf(format, first_word, second_word);
}`
      }</CBlock>

      <P>The output is the same as before.</P>

      <P>Of course, as you saw a moment ago, the above program doesn't really need string variables, so this is a crude example. But suppose you want to write a program that asks the user to enter a word, and then at some point it prints out a message with that word embedded in it. In such a case, the word would have to be stored in a string variable somewhere, and later it'd need to be embedded in a format string as above. Although that's a much better example, we haven't covered enough concepts to know how to prompt the user for a string input, so we'll stick with our crude example for now.</P>

      <SectionHeading id="strlen"><Code>strlen()</Code></SectionHeading>

      <P><Code>strlen</Code>, provided by <Code>{'<string.h>'}</Code>, is another function that operates on C strings. It accepts a string as an argument and returns a value of type <Code>size_t</Code> denoting its <Bold>length</Bold>. A string's length is the number of characters of content that the string contains. "Content", in this case, does not count the null terminator.</P>

      <P>Recall that <Code>size_t</Code>, the return type of <Code>strlen</Code>, is similar to the <Code>int</Code> type, except it's unsigned (it doesn't support negative values) and is guaranteed to support sufficiently large values to represent any single object's size (in bytes).</P>

      <P>Here's an example:</P>

      <CBlock fileName="strlen.c">{
`#include <stdio.h>
#include <string.h> // Necessary for strlen()!

int main() {
        size_t length_of_hello_world = strlen("Hello, World!");
        printf("%ld\\n", length_of_hello_world);
        // Notice: %ld for size_t since it supports very large numbers
        // (similar to unsigned long long int on many platforms)

        // Of course, strlen can also operate on string variables
        const char* str = "The epic highs and lows of "
                "high school football";
        size_t length_of_str = strlen(str);
        printf("%ld\\n", length_of_str);

}`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o strlen strlen.c 
$ valgrind ./strlen 
==1306285== Memcheck, a memory error detector
==1306285== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1306285== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==1306285== Command: ./strlen
==1306285== 
13
47
==1306285== 
==1306285== HEAP SUMMARY:
==1306285==     in use at exit: 0 bytes in 0 blocks
==1306285==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==1306285== 
==1306285== All heap blocks were freed -- no leaks are possible
==1306285== 
==1306285== For lists of detected and suppressed errors, rerun with: -s
==1306285== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Notice that <Code>strlen("Hello, World!\n")</Code> is 13. That includes the comma, the space, the exclamation point, and even the line feed character (<Code>\n</Code>), but <Ul>not</Ul> the null terminator(s) that the compiler embeds at the end of the string's underlying character array (nor any garbage characters appearing after that null terminator). Indeed, <Code>strlen()</Code> does not simply tell you the size of the array underlying the C string. Rather, it counts the number of characters in the array leading up to (but not including) the first null terminator and returns that count.</P>

      <SectionHeading id="other-string-functions">Other string functions?</SectionHeading>

      <P>There are many other functions, especially those provided by <Code>{'<string.h>'}</Code>, that operate on strings in various ways. However, you won't be able to use many of them until we've covered arrays, so we'll discuss them later.</P>

      <SectionHeading id="const-char-pointer">Why is it <Code>const char*</Code> instead of just <Code>char*</Code>?</SectionHeading>

      <P>When I've declared string variables, I've used the type <Code>const char*</Code>. Recall that this syntax is equivalent to <Code>char const *</Code>, which is interpreted by reading the full type signature from right to left: a pointer to a constant character.</P>

      <P>In other words, <Code>const char* my_string = "Hello"</Code> creates a pointer (<Code>my_string</Code>) that stores the memory address of the first character (<Code>'H'</Code>) in an array of characters that was created when the program first started, but <It>also</It>, the character that <Code>my_string</Code> points to (<Code>'H'</Code>) is not modifiable through the pointer itself. For example, <Code>*my_string = 'J'</Code> is not legal since <Code>my_string</Code> is const-qualified (if it was, it'd change the string contents to <Code>"Jello"</Code>).</P>

      <P>So now you're probably wondering: what if <Code>my_string</Code> was of type <Code>char*</Code> instead of <Code>const char*</Code>? Then would we be able to modify the first character<Emdash/>or any characters<Emdash/>of the string by dereferencing the pointer? Well, let's try it:</P>

      <CBlock fileName="cannotmodifystring.c">{
`#include <stdio.h>

int main() {
        char* my_string = "Hello";
        *my_string = 'J';
}
`
      }</CBlock>

      <P>Looks fine, but here's the result:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o cannotmodifystring cannotmodifystring.c 
$ valgrind ./cannotmodifystring 
==1310851== Memcheck, a memory error detector
==1310851== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1310851== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==1310851== Command: ./cannotmodifystring
==1310851== 
==1310851== 
==1310851== Process terminating with default action of signal 11 (SIGSEGV): dumping core
==1310851==  Bad permissions for mapped region at address 0x402010
==1310851==    at 0x401116: main (cannotmodifystring.c:5)
==1310851== 
==1310851== HEAP SUMMARY:
==1310851==     in use at exit: 0 bytes in 0 blocks
==1310851==   total heap usage: 0 allocs, 0 frees, 0 bytes allocated
==1310851== 
==1310851== All heap blocks were freed -- no leaks are possible
==1310851== 
==1310851== For lists of detected and suppressed errors, rerun with: -s
==1310851== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
Segmentation fault (core dumped)
`
      }</TerminalBlock>

      <P>The program crashed due to a segmentation fault. Why?</P>

      <P>As I said earlier, the array of characters representing the string contents of the literal <Code>"Hello"</Code> are created by the program when it first starts<Emdash/>not when it arrives at the line of code that uses it. When the program does arrive at that line of code, it simply initializes <Code>my_string</Code> to point to that pre-created array.</P>

      <P>Since the array of characters is created when the program first starts, it also goes in a special place in memory; it's not stored alongside local automatic variables (the pointer, <Code>my_string</Code>, is stored on the stack, but the array of characters that it points to is not). In <Ul>most</Ul> cases, that underlying array is specifically stored in the read-only segment of the program's data section. This is a special place in memory primarily used to store <Ul>global and static constants</Ul>. The operating system actually protects this memory from being modified once the program starts. Hence, attempting to modify it results in a segmentation fault. Officially, this is undefined behavior.</P>

      <P>The simplest way to avoid making this mistake is to use <Code>const char*</Code> instead of <Code>char*</Code> to store such strings. That way, if you do accidentally attempt to modify the string's contents, you get a compilation error instead of undefined behavior at runtime:</P>

      <CBlock fileName="cannotmodifystring.c" highlightLines="{4}">{
`#include <stdio.h>

int main() {
        const char* my_string = "Hello";
        *my_string = 'J';
}`
      }</CBlock>

      <P>And here's the compilation error:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -Wall -g -o cannotmodifystring cannotmodifystring.c 
cannotmodifystring.c: In function ‘main’:
cannotmodifystring.c:5:20: error: assignment of read-only location ‘*my_string’
    5 |         *my_string = 'J';
      |                    ^
`
      }</TerminalBlock>

      <P>That's all to say, the <Code>const</Code> keyword isn't actually what prevents you from modifying the string's contents through the pointer. Modifications aren't allowed either way. However, putting the <Code>const</Code> keyword there makes the error a compilation error instead of a runtime error, which is easier to diagnose and hence preferred.</P>

      <P>But what if you <It>do</It> want to be able to modify the string's contents after creating it? And not just modify the <It>first</It> character (e.g., changing <Code>"Hello"</Code> to <Code>"Jello"</Code>, as in the above example), but <It>all</It> of the string's characters? This is indeed possible, but it requires declaring and initializing your strings using an alternative array syntax instead of the pointer syntax that I've shown you throughout this lecture. We'll revisit this idea once we've covered arrays.</P>
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
