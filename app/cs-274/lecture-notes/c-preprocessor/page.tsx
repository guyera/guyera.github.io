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
        <Item><Link href="#the-preprocessor">The preprocessor</Link></Item>
        <Item><Link href="#define-and-undef"><Code>#define</Code> and <Code>#undef</Code></Link></Item>
        <Item><Link href="#conditionals">Conditional compilation</Link></Item>
        <Item><Link href="#and-more">And more!</Link></Item>
      </Itemize>

      <SectionHeading id="the-preprocessor">The preprocessor</SectionHeading>

      <P><Code>gcc</Code> is much more than a compiler; it's a full-fledged C build tool. Building a C program into an executable involves several steps, only one of which is compilation:</P>

      <Enumerate listStyleType="decimal">
        <Item><Bold>Preprocessing</Bold>: The <Bold>C preprocessor</Bold> interprets <Bold>preprocessing directives</Bold> and modifies the C source code accordingly.</Item>
        <Item><Bold>Compilation</Bold>: The C compiler compiles the preprocessed C source code into object code. This is done in <Bold>translation units</Bold> (loosely, each <Code>.c</Code> file in a C program represents a distinct translation unit).</Item>
        <Item><Bold>Linking</Bold>: All the compiled translation units' object code, along with the object code of any libraries the program uses (including the C standard library), is <Bold>linked</Bold> together into a final product (e.g., an executable, or a library).</Item>
      </Enumerate>

      <P><Code>gcc</Code> does all these things and more.</P>

      <P>In this lecture, we'll learn a bit more about the first step: <Bold>preprocessing</Bold>. As stated above, the job of the preprocessor is to analyze the program's C source code and modify it according to its <Bold>preprocessing directives</Bold>. A preprocessing directive is any line of code starting with a hashtag (<Code>#</Code>).</P>

      <P>For example, <Code>{'#include <stdio.h>'}</Code> is a preprocessing directive. Believe it or not, this code is <Ul>not</Ul> compiled. Rather, the preprocessor encounters this directive and "executes" it before the compilation stage of the build pipeline even begins.</P>

      <P>Preprocessing directives tell the preprocessor to modify (preprocess) the program's source code in some way just before passing it off to the compiler. There are many preprocessing directives, and they all tell the preprocessor to make different kinds of transformations to the source code. The <Code>#include</Code> directive, for example, tells the preprocessor to fetch the contents of another source code file and include it in the translation unit, replacing the directive itself with those contents (and then to recursively execute any preprocessing directives that were contained in said contents).</P>
      
        <P>(We'll talk more about the <Code>#include</Code> preprocessing directive in the next lecture. This lecture will focus on some other directives.)</P>
      
      <P>The preprocessor always parses and executes preprocessing directives in the source code in a "top-down" fashion (except when its control flow is modified by certain preprocessing directives, such as <Code>#include</Code>). That is, it generally executes the directives in the order that they appear in the source code. For example, suppose some function <Code>a</Code> contains a preprocessing directive. Suppose another function <Code>b</Code> is defined <Ul>below</Ul> <Code>a</Code> and contains another preprocessing directive. Suppose the <Code>main</Code> function calls <Code>b</Code>, and <It>then</It> <Code>a</Code>. At runtime, <Code>b</Code> is executed before <Code>a</Code>. But during the preprocessing stage (part of the build pipeline, long before runtime), the preprocessor will execute the preprocessing directive in <Code>a</Code> before it executes the directive in <Code>b</Code> (because <Code>a</Code> is defined above <Code>b</Code>).</P>

      <P>Because the preprocessor's control flow has absolutely nothing to do with the program's <It>runtime</It> control flow, it's conventional to leave preprocessing directives unindented, even if they appear within nested scopes. This makes them stand out visually, and it aligns with the fact that preprocessor directives are completely separated from the program's scope rules (i.e., a preprocessing directive within a scope is not really a "part" of that scope; scopes mean nothing to the preprocessor.). We'll discuss the <Code>#define</Code> directive in a moment, but just to illustrate:</P>
        
      <CBlock showLineNumbers={false}>{
`int main() {
        if (1 + 1 == 2) {
                // Notice: The below preprocessor directive
                // is unindented. But these lines of code
                // are indented.
#define HELLO
                // These lines of code should also be
                // indented.
        }
}`
      }</CBlock>

      <SectionHeading id="define-and-undef"><Code>define</Code> and <Code>undef</Code></SectionHeading>

      <P>Perhaps the simplest preprocessing directive is <Code>#define</Code>. It's used to define <Bold>macros</Bold>, which are essentially constants that are automatically substituted for their text values by the preprocessor wherever they appear in the source code. You can use it like so:</P>

      <SyntaxBlock>{
`#define <name> [value]`
      }</SyntaxBlock>

      <P>Replace <Code>{'<name>'}</Code> with the name of the macro that you want to define, and replace <Code>{'[value]'}</Code> with the value that you want it to have. I write <Code>{'[value]'}</Code> in square brackets because the value is actually <Ul>optional</Ul>. Indeed, you can define valueless macros. These are useful for representing flags, whose existence might be checked for <Link href="#conditionals">conditional compilation</Link>. More on that shortly.</P>

      <P>When the preprocessor is analyzing the source code of a given translation unit (e.g., a given <Code>.c</Code> file) and it encounters a <Code>#define</Code> directive, it records the name of the defined macro and its corresponding value (if one is specified). From that point on, if the preprocessor ever encounters the name of the macro (as a complete identifier) <Ul>anywhere</Ul> else in the translation unit's source code (or in other files included within it via the <Code>#include</Code> directive), it will automatically replace the macro's name with its specified textual value. If the macro is not given a value, then all instances of its name are simply removed from the source code (i.e., replaced with nothing).</P>

      <P>For example:</P>

      <CBlock fileName="define.c">{
`#include <stdio.h>

// Define the PRINT macro, and give it the text value 'printf'.
#define PRINT printf

// If the word PRINT appears anywhere in the source code, the
// preprocessor will automatically replace it with printf.

// Define the NOTHING macro, giving it no value whatsoever
#define NOTHING

// If the word NOTHING appears anywhere in the source code,
// the preprocessor will automatically remove it.

int main() {
        // The preprocessor will "rewrite" the below line of code as
        // printf("Hello, World!\\n");
        // before passing it off to the compiler. In other words,
        // it removes both instances of NOTHING, treating them
        // as if they weren't even there, and it replaces PRINT
        // with printf
        PRINT(NOTHING"Hello, World!\\n"NOTHING);
}`
      }</CBlock>

      <P>Here's the output:</P>
      
      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o define define.c 
$ valgrind ./define
==1926540== Memcheck, a memory error detector
==1926540== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1926540== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==1926540== Command: ./define
==1926540== 
Hello, World!
==1926540== 
==1926540== HEAP SUMMARY:
==1926540==     in use at exit: 0 bytes in 0 blocks
==1926540==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==1926540== 
==1926540== All heap blocks were freed -- no leaks are possible
==1926540== 
==1926540== For lists of detected and suppressed errors, rerun with: -s
==1926540== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)`
      }</TerminalBlock>

      <P>You can also define macros that accept arguments. These are known as <Bold>function-like macros</Bold>. Once defined, a function-like macro can be used almost like a function: write the name of the macro, then a comma-separated list of arguments in between parentheses. The preprocessor will replace the "call" of the function-like macro with the macro's definition, which may in turn reference its parameters.</P>

      <P>For example:</P>

      <CBlock fileName="functionlikemacro.c">{
`#include <stdio.h>

// Defines macro PRINT_INTEGER with a parameter x. Expands to
// printf("%d\\n", <x>), where <x> is the value of the argument
// given to it. This is kind of like a function (but not
// exactly).
#define PRINT_INTEGER(x) printf("%d\\n", x)

int main() {
        // The preprocessor rewrites the below line as
        // printf("%d\\n", 2);
        PRINT_INTEGER(2);
}`
      }</CBlock>

      <P>The above program prints <Code>2</Code> to the terminal.</P>

      <P>Let's discuss a slightly more advanced example. Suppose you want to write a function that accepts an integer and squares it. So you do that:</P>

      <CBlock showLineNumbers={false}>{
`int square_int(int x) {
        return x * x;
}`
      }</CBlock>

      <P>But then, later, you realize that you also need to be able to square <Code>float</Code> values. So you write another function:</P>

      <CBlock showLineNumbers={false}>{
`float square_float(float x) {
        return x * x;
}`
      }</CBlock>

      <P>(Of course, we <It>could</It> get rid of the <Code>square_int</Code> function and just always use <Code>square_float</Code>, but that would convert integers into floating point values in the process of squaring them. Maybe we don't want that, perhaps because it's unintuitive, or perhaps because it increases the chance of integer overflows.)</P>

      <P>So we now have two squaring functions. But you can imagine needing even more as we come up with other data types for which we might want to compute squares. That might mean a lot of duplicated code (more importantly, this is just illustrative; the benefits of what I'm about to show you scale with the complexity of the function in question).</P>

      <P>The preprocessor can help us out here: we can define a function-like macro that accepts a type name <Code>t</Code> as an argument and expands to the definition of a function that's capable of squaring values of type <Code>t</Code>. For example, we could define a function-like macro named <Code>DEF_SQUARE(t)</Code> such that:</P>

      <Itemize>
        <Item><Code>DEF_SQUARE(int)</Code> expands to <Code>{'int square_int(int x) {return x * x;\}'}</Code></Item>
        <Item><Code>DEF_SQUARE(float)</Code> expands to <Code>{'float square_float(float x) {return x * x;}'}</Code></Item>
        <Item>And so on...</Item>
      </Itemize>

      <P>This would allow us to define a squaring function for a new data type by just writing <Code>{'DEF_SQUARE(<type>)'}</Code>, replacing <Code>{'<type>'}</Code> with the data type in question.</P>

      <P>If this sounds a bit like generics and parametric polymorphism, you could argue that it is; the preprocessor is a metaprogramming tool, much like generics in other programming languages.</P>

      <P>How might you do this? Well, a naive attempt might look like this:</P>

      <CBlock showLineNumbers={false}>{
`#define DEF_SQUARE(t) t square_t(t x) {return x * x;}`
      }</CBlock>

      <P>After all, the idea is that each instance of <Code>t</Code> will be replaced with whatever argument is passed to the <Code>DEF_SQUARE</Code> macro when invoked later on.</P>

      <P>That <It>almost</It> works, but there's one issue: when the preprocessor sees the <Code>square_t</Code> part of the above macro definition, it doesn't understand that the goal is to replace the "t" with the macro's given argument. Basically, it doesn't treat the <Code>t</Code> as a separate token from the rest of <Code>square_</Code>. It treats it all as part of a single token. (In general, the preprocessor will treat any valid identifier as a single token).</P>

      <P>That's to say, with the above macro written as-is, <Code>DEF_SQUARE(int)</Code> would be replaced by the preprocessor with <Code>{'int square_t(int x) {return x * x;}'}</Code>. That's almost right, except we don't want the function to be named <Code>square_t</Code>. We want it to be named <Code>square_int</Code>. This is important since, in C, two functions are not allowed to have the same name, even if their parameter lists are different (this is different from C++'s function naming rules). As such, our int-squaring function must have a distinct name from our float-squaring function, and so on. They can't just all be named <Code>square_t</Code>. That would result in a compiler error (multiple definitions of the same function).</P>

      <P>The solution to this issue is the <Bold>concatenation operator</Bold>, which is a sequence of two hashtags (<Code>##</Code>). It can be used anywhere in a C program, including in the definition of a function-like macro. All it does is evaluate the token to its left, evaluate the token to its right, and "glue" (concatenate) the two text values together. For example, we can fix our above macro like so:</P>

      <CBlock showLineNumbers={false}>{
`#define DEF_SQUARE(t) t square_##t(t x) {return x * x;}`
      }</CBlock>

      <P>By placing the concatenation operator (<Code>##</Code>) between the <Code>square_</Code> and the <Code>t</Code>, it makes it clear to the preprocessor that these should be treated as two separate tokens (i.e., parsed separately). <Code>t</Code> in particular will be recognized as the name of the macro's parameter, so it'll be replaced with whatever argument was given to the macro when invoked. <Code>square_</Code> is not a macro nor a parameter, so it'll be left alone. It'll then concatenate <Code>square_</Code> with the substituted textual value of the macro's argument, giving us the intended result (e.g., <Code>DEF_SQUARE(int)</Code> will expand to <Code>{'int square_int(int x) {return x * x;}'}</Code>).</P>

      <P>Here's a full demonstration:</P>

      <CBlock fileName="concatenationoperator.c">{
`#include <stdio.h>

#define DEF_SQUARE(t) t square_##t(t x) {return x * x;}

// Defines the square_int function
DEF_SQUARE(int)

// Defines the square_float function
DEF_SQUARE(float)

// Defines the square_double function
DEF_SQUARE(double)

// ... And so on

int main() {
        printf("2^2 = %d\\n", square_int(2));
        printf("3.14^2 = %f\\n", square_float(3.14f));
}`
      }</CBlock>

      <P>And here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o concatenationoperator concatenationoperator.c 
$ valgrind ./concatenationoperator 
==1937222== Memcheck, a memory error detector
==1937222== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1937222== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==1937222== Command: ./concatenationoperator
==1937222== 
2^2 = 4
3.14^2 = 9.859601
==1937222== 
==1937222== HEAP SUMMARY:
==1937222==     in use at exit: 0 bytes in 0 blocks
==1937222==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==1937222== 
==1937222== All heap blocks were freed -- no leaks are possible
==1937222== 
==1937222== For lists of detected and suppressed errors, rerun with: -s
==1937222== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>As you write more and more complex macros, especially function-like macros that in turn define C functions, you may find yourself wanting the definition of the macro to span multiple lines. It turns out that you <It>can</It> place line breaks in the middle of a macro definition, but there must be a backslash character (<Code>{'\\'}</Code>) just before the line break:</P>

      <CBlock fileName="concatenationoperator.c" highlightLines="{3-7}">{
`#include <stdio.h>

// Note the \\ characters at the end of each line, just before
// the line break
#define DEF_SQUARE(t) t square_##t(t x) {\\
        return x * x;\\
}

// Defines the square_int function
DEF_SQUARE(int)

// Defines the square_float function
DEF_SQUARE(float)

// Defines the square_double function
DEF_SQUARE(double)

// ... And so on

int main() {
        printf("2^2 = %d\\n", square_int(2));
        printf("3.14^2 = %f\\n", square_float(3.14f));
}`
      }</CBlock>

      <P>As you can imagine, this is quite powerful. For a programming language so low-level as C, this gets us fairly close to some of the metaprogramming techniques available in other languages. And we're just scratching the surface of the preprocessor's capabilities in this lecture.</P>

      <P>Finally, in addition to the <Code>#define</Code> directive, there's also the <Code>#undef</Code> directive. It simply deletes the existing definition of the specified macro, "undefining" it. For example, if we were to write <Code>#undef DEF_SQUARE</Code> just prior to the <Code>DEF_SQUARE(double)</Code> line, we'd get a bunch of compiler errors:</P>

      <CBlock fileName="undef.c" showLineNumbers={false} highlightLines="{6-20}">{
`// ... (same code as before, omitted for brevity)

// Defines the square_float function
DEF_SQUARE(float)

// Undefine the DEF_SQUARE macro.
#undef DEF_SQUARE

// From this point on, the preprocessor will no longer
// replace DEF_SQUARE(...) invocations with the
// previous DEF_SQUARE function-like macro's definition.
// Rather, when the preprocessor sees DEF_SQUARE from this
// point on, it will simply ignore it, leaving it as-is
// in the source code. (That will obviously cause tons
// of compiler errors).

// The compiler does not know what this means, and the
// preprocessor will NOT replace it with some actual
// code that the compiler can understand.
DEF_SQUARE(double)

// ... (same code as before, omitted for brevity)`
      }</CBlock>

      <P>And here are the compiler errors:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o undef undef.c 
undef.c:18:1: warning: return type defaults to ‘int’ [-Wimplicit-int]
   18 | DEF_SQUARE(double)
      | ^~~~~~~~~~
undef.c: In function ‘DEF_SQUARE’:
undef.c:22:12: error: expected ‘=’, ‘,’, ‘;’, ‘asm’ or ‘__attribute__’ before ‘{’ token
   22 | int main() {
      |            ^
undef.c:26: error: expected ‘{’ at end of input
undef.c:26: warning: control reaches end of non-void function [-Wreturn-type]
`
      }</TerminalBlock>

      <SectionHeading id="conditionals">Conditional compilation</SectionHeading>

      <P>There are various preprocessing directives that enable something known as <Bold>conditional compilation</Bold>. Conditional compilation allows you to put some source code within a "preprocessor if statement" (that's not standard terminology, but I think it's descriptive). Such if statements are evaluated by the preprocessor (not at runtime) and, if their conditions are false, then the preprocessor will essentially "delete" all the source code contained within them. Since the preprocessing stage happens before compilation, this means that all of that source code is never seen by the compiler. Hence, "conditional compilation"<Emdash/>source code that will only be compiled if some condition is satisfied as determined by the preprocessor.</P>

      <P>These "preprocessor if statements" begin with one of several conditional preprocessing directives, such as <Code>#if</Code>, <Code>#ifdef</Code>, <Code>#ifndef</Code>, etc, and end with an <Code>#endif</Code> directive.</P>

      <P>Let's start with <Code>#ifdef</Code> since it's the simplest. The <Code>#ifdef</Code> directive marks the beginning of a preprocessor if statement. Give it an identifier, and it will determine whether that identifier is currently defined as a macro (e.g., due to a a previous <Code>#define</Code> directive). If the identifier is <It>not</It> defined, either because the <Code>#define</Code> directive was never used to define it, or because it was undefined via an <Code>#undef</Code> directive, then the preprocessor will "delete" all the source code contained within the preprocessor if statement. That means everything up to the subsequent <Code>#endif</Code> directive.</P>

      <P>Let's extend our previous program a bit, "fixing" the <Code>DEF_SQUARE(double)</Code> issue in the process:</P>

      <CBlock fileName="ifdef.c" highlightLines="{17-24,32-60}">{
`#include <stdio.h>

// Note the \\ characters at the end of each line, just before
// the line break
#define DEF_SQUARE(t) t square_##t(t x) {\\
        return x * x;\\
}

// Defines the square_int function
DEF_SQUARE(int)

// Defines the square_float function
DEF_SQUARE(float)

#undef DEF_SQUARE

// Checks whether DEF_SQUARE is defined. It isn't, since it
// was just undefined via #undef. As such, lines 22-24 will
// be "deleted" by the preprocessor. From the compiler's
// perspective, the below lines of code simply aren't part
// of the program.
#ifdef DEF_SQUARE
DEF_SQUARE(double)
#endif

// ... And so on

int main() {
        printf("2^2 = %d\\n", square_int(2));
        printf("3.14^2 = %f\\n", square_float(3.14f));

        // Also, just for further demonstration, let's define the
        // HELLO macro here
#define HELLO

        // Now we'll check if it's defined. It is, so the
        // contained code will be included in what's passed to
        // the compiler. Hence, this will, indeed, print
        // "Hello, World!".
#ifdef HELLO
        printf("Hello, World!\\n");
#endif

        // However, GOODBYE is NOT defined, so the below printf
        // statement will be "deleted" by the preprocessor, and
        // the compiler will never see it.
#ifdef GOODBYE
        printf("Goodbye, World!\\n");
#endif

        // In fact, consider the following code, which is riddled
        // with syntax errors. Ordinarily, the compiler would
        // print out all sorts of error messages. But the compiler
        // never even gets a chance to SEE this code since GODOBYE
        // is not defined. Hence, no errors are generated.
#ifdef GOODBYE
        jfdsajfsd(hello!)
                        this() _is_ a bogus!! line of code()()()
        int x = int x = int int int; Woo hoo!
#endif
}
`
      }</CBlock>

      <P>The above program compiles and runs just fine:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o ifdef ifdef.c
$ valgrind ./ifdef 
==1945160== Memcheck, a memory error detector
==1945160== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1945160== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==1945160== Command: ./ifdef
==1945160== 
2^2 = 4
3.14^2 = 9.859601
Hello, World!
==1945160== 
==1945160== HEAP SUMMARY:
==1945160==     in use at exit: 0 bytes in 0 blocks
==1945160==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==1945160== 
==1945160== All heap blocks were freed -- no leaks are possible
==1945160== 
==1945160== For lists of detected and suppressed errors, rerun with: -s
==1945160== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)`
      }</TerminalBlock>

      <P>There's also an <Code>#ifndef</Code> directive, which is exactly the opposite of <Code>#ifdef</Code>: it checks whether the specified macro is <Ul>not</Ul> defined. If it <Ul>is</Ul> defined, then it "deletes" the code within the preprocessor if statement, hiding it from the compiler.</P>

      <P>Moreover, there's an <Code>#else</Code> directive. This allows you to define two blocks of code, exactly one of which will be passed to the compiler (if the first isn't, then the second is). Simply write <Code>#else</Code> at the end of the first preprocessor if statement's body (instead of <Code>#endif</Code>). Then, at the end of the preprocessor else statement's body, write <Code>#endif</Code>. For example:</P>

      <CBlock fileName="ifdef.c" highlightLines="{62-71}">{
`#include <stdio.h>

// Note the \\ characters at the end of each line, just before
// the line break
#define DEF_SQUARE(t) t square_##t(t x) {\\
        return x * x;\\
}

// Defines the square_int function
DEF_SQUARE(int)

// Defines the square_float function
DEF_SQUARE(float)

#undef DEF_SQUARE

// Checks whether DEF_SQUARE is defined. It isn't, since it
// was just undefined via #undef. As such, lines 22-24 will
// be "deleted" by the preprocessor. From the compiler's
// perspective, the below lines of code simply aren't part
// of the program.
#ifdef DEF_SQUARE
DEF_SQUARE(double)
#endif

// ... And so on

int main() {
        printf("2^2 = %d\\n", square_int(2));
        printf("3.14^2 = %f\\n", square_float(3.14f));

        // Also, just for further demonstration, let's define the
        // HELLO macro here
#define HELLO

        // Now we'll check if it's defined. It is, so the
        // contained code will be included in what's passed to
        // the compiler. Hence, this will, indeed, print
        // "Hello, World!".
#ifdef HELLO
        printf("Hello, World!\\n");
#endif

        // However, GOODBYE is NOT defined, so the below printf
        // statement will be "deleted" by the preprocessor, and
        // the compiler will never see it.
#ifdef GOODBYE
        printf("Goodbye, World!\\n");
#endif

        // In fact, consider the following code, which is riddled
        // with syntax errors. Ordinarily, the compiler would
        // print out all sorts of error messages. But the compiler
        // never even gets a chance to SEE this code since GODOBYE
        // is not defined. Hence, no errors are generated.
#ifdef GOODBYE
        jfdsajfsd(hello!)
                        this() _is_ a bogus!! line of code()()()
        int x = int x = int int int; Woo hoo!
#endif
        
        // Checks if HELLO is NOT defined. But it is, so the
        // printf("ABC\\n") statement will be "deleted" by the
        // preprocessor. However, there's an attached #else
        // directive; its body of code WILL be passed to the
        // compiler. Hence, the program will print "XYZ"
#ifndef HELLO
        printf("ABC\\n");
#else
        printf("XYZ\\n");
#endif
}`
      }</CBlock>

      <P>And here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -g -Wall -o ifdef ifdef.c
$ valgrind ./ifdef 
==1945160== Memcheck, a memory error detector
==1945160== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==1945160== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==1945160== Command: ./ifdef
==1945160== 
2^2 = 4
3.14^2 = 9.859601
Hello, World!
XYZ
==1945160== 
==1945160== HEAP SUMMARY:
==1945160==     in use at exit: 0 bytes in 0 blocks
==1945160==   total heap usage: 1 allocs, 1 frees, 1,024 bytes allocated
==1945160== 
==1945160== All heap blocks were freed -- no leaks are possible
==1945160== 
==1945160== For lists of detected and suppressed errors, rerun with: -s
==1945160== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>There's also the <Code>#if</Code> directive. It's a bit more advanced; you must give it an expression that the preprocessor is capable of evaluating. Such expressions may contain arithmetic and logical operators (but not function calls, of course), reference existing defined macros, and so on (any used identifiers that <It>aren't</It> defined macros are simply replaced with zeroes). The preprocessor will then evaluate the expression and check if it's nonzero, much like a regular if statement in C. If so, the code contained in the preprocessor if statement body is left as-is. Else, it's "deleted" by the preprocessor, hiding it from the compiler.</P>

      <P>Moreover, there's an <Code>#elif</Code> directive, which can be used to create preprocessor else-if statements. It must be given an expression, which it evaluates and checks in the same way as the <Code>#if</Code> directive.</P>

      <P>Here's an example:</P>

      <CBlock fileName="if.c">{
`#include <stdio.h>

int main() {
        // The preprocessor evaluates the expression 1 + 2 == 4
        // and finds it to be false (0). So printf("123\\n"); is
        // "deleted" by the preprocessor. It then evaluates
        // 2 + 7 == 9 and finds it to be true (nonzero). So
        // printf("456\\n"); is NOT deleted. Any subsequent #elif and
        // #else blocks will not be evaluated; their contained
        // code will immediately be "deleted" by the preprocessor.
        // That's all to say, this program prints "456"
#if 1 + 2 == 4
        printf("123\\n");
#elif 2 + 7 == 9
        printf("456\\n");
#else
        printf("789\\n");
#endif
}
`
      }</CBlock>

      <P>The above program prints <Code>456</Code> to the terminal.</P>

      <P>Now, you might be thinking that a lot of this conditional compilation stuff seems pretty pointless. For example, why use a preprocessor if statement when you can just use a regular if statement? All this seems <It>especially</It> limited by the fact that it happens at build time, meaning that preprocessor if statements cannot use, say, runtime variables in any meaningful way.</P>

      <P>However, there's something I haven't told you: when building a C program with <Code>gcc</Code> (or any other C compiler), you can specify custom build flags that automatically define macros at the start of preprocessing. You can do this like so:</P>

      <TerminalBlock copyable={false}>{
`gcc -D<NAME> ...`
      }</TerminalBlock>

      <P>Replace <Code>{'<NAME>'}</Code> with the name of a macro that you want to be defined automatically at the start of preprocessing (and replace <Code>...</Code> with the rest of your build command, as normal).</P>

      <P>Consider the following program:</P>

      <CBlock fileName="quadraticformula.c">{
`#include <math.h>
#include <stdio.h>

int main() {
        printf("Enter a, b, and c, the coefficients of a quadratic formula: ");
        double a;
        double b;
        double c;
        scanf("%lf", &a);
        scanf("%lf", &b);
        scanf("%lf", &c);

#ifdef FIRST_ROOT
        // Compute the first root of the quadratic formula
        double root = (-b - sqrt(b*b - 4*a*c)) / (2*a);
#else
        // Compute the second root
        double root = (-b + sqrt(b*b - 4*a*c)) / (2*a);
#endif

        // One of the two above statements will be "deleted"
        // by the preprocessor. If FIRST_ROOT is defined, then
        // the second statement will be deleted, and root will
        // store the first root. Otherwise, the first statement
        // will be deleted, and root will store the second root.

        // Print whichever root was computed
        printf("Root: %lf\\n", root);
}
`
      }</CBlock>

      <P>Now, suppose we compile it <Ul>twice, into two separate executables</Ul>, like so:</P>

      <TerminalBlock copyable={false}>{
`$ gcc -DFIRST_ROOT -g -Wall -lm -o first_root quadraticformula.c
$ gcc -DSECOND_ROOT -g -Wall -lm -o second_root quadraticformula.c`
      }</TerminalBlock>

      <P>Notice: When compiling the <Code>first_root</Code> executable, I specify <Code>-DFIRST_ROOT</Code>. This tells the preprocessor to automatically define the <Code>FIRST_ROOT</Code> macro at the start of preprocessing. As such, when the preprocessor reaches the <Code>#ifdef FIRST_ROOT</Code> directive, it will keep the first statement (which computes the first root of the quadratic) but "delete" the second statement (which computes the second root). In contrast, when compiling the <Code>second_root</Code> executable, I specify <Code>-DSECOND_ROOT</Code> (and <Ul>not</Ul> <Code>-DFIRST_ROOT</Code>). As such, when the preprocessor reaches the <Code>#ifdef FIRST_ROOT</Code> directive, it will "delete" the first statement but keep the second.</P>

      <P>The result is two separate programs, <Code>first_root</Code> and <Code>second_root</Code>, which are <It>almost</It> identical, except one of them computes the first root of a given quadratic, and the other computes the second root. Most importantly, both of these executable programs were built from the same source code file (<Code>quadraticformula.c</Code>), just with different compilation commands.</P>

      <P>That is, conditional compilation makes it possible for build flags passed to <Code>gcc</Code> to affect the behavior of the built program.</P>

      <P>Here's an example output (I didn't run it through valgrind since I wanted to keep the outputs clean and easily comparable):</P>

      <TerminalBlock copyable={false}>{
`$ ./first_root
Enter a, b, and c, the coefficients of a quadratic formula: 2 4 1
Root: -1.707107
$ ./second_root
Enter a, b, and c, the coefficients of a quadratic formula: 2 4 1
Root: -0.292893`
      }</TerminalBlock>

      <P>This enables lots of possibilities. To name a couple:</P>

      <Itemize>
        <Item>You can write a bunch of blocks of code enclosed in preprocessor if statements that look like this:</Item>

        <CBlock showLineNumbers={false}>{
`#ifdef DEBUG
// ... Code goes here
#endif`
        }</CBlock>

        <P>Such code will only be compiled if the <Code>DEBUG</Code> macro is defined. Whenever you want to run the program in "debug mode", just supply <Code>-DDEBUG</Code> when building it, "enabling" blocks of code enclosed in such preprocessor if statements. When you want to build the program for deployment to a production environment, just omit <Code>-DDEBUG</Code>, and those blocks will be "deleted" by the preprocessor before the source code is passed to the compiler.</P>

        <Item>There exist built-in macros that are already defined by default and available to the preprocessor. For example, most C build tools will automatically define the <Code>_WIN32</Code> macro when building an executable to be run on Windows systems. Hence, if you want your program to have some code that only gets executed when run on Windows, you can put it in a preprocessor if statement block like so:</Item>

        <CBlock showLineNumbers={false}>{
`#ifdef _WIN32
// ... Code goes here
#endif`
        }</CBlock>

        <P>There are similar macros for various other platforms. This is extremely helpful when writing low-level code that requires platform-specific dependencies<Emdash/>you can write different versions of it that work on different platforms, and put each version of the code in its own preprocessor if statement body so that only one of them will be passed to the compiler depending on the target build platform.</P>
      </Itemize>

      <SectionHeading id="and-more">And more!</SectionHeading>

      <P>This lecture barely scratched the surface of the capabilities of the C preprocessor. If you want to know more, <Link href="https://gcc.gnu.org/onlinedocs/cpp.pdf">here's</Link> a link to GCC's manual on the topic.</P>

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
