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
        <Item><Link href="#what-is-cpp">What is C++?</Link></Item>
        <Item><Link href="#noted-differences">Some noted differences</Link></Item>
        <Item><Link href="#standard-output">Standard output</Link></Item>
        <Item><Link href="#strings">Strings</Link></Item>
        <Item><Link href="#references">References</Link></Item>
        <Item><Link href="#methods">Methods (member functions)</Link></Item>
        <Item><Link href="#access-modifiers">Access modifiers</Link></Item>
        <Item><Link href="#constructors-and-destructors">Constructors and destructors</Link></Item>
        <Item><Link href="#cpp-classes">C++ Classes</Link></Item>
        <Item><Link href="#raii-unique-pointers-and-vectors">RAII, unique pointers, and vectors</Link></Item>
        <Item><Link href="#and-more">And more</Link></Item>
      </Itemize>

      <SectionHeading id="what-is-cpp">What is C++?</SectionHeading>

      <P>C++, originally (but only briefly) named "C with Classes", is a programming language designed by Bjarne Stroustrup that's highly similar to C but offers various additional language features to facilitate, for example, object-oriented programming (OOP). Just a name a few, C++ supports classes, methods, access modifiers (<Code>private</Code>, <Code>public</Code>, and <Code>protected</Code>), inheritance, subtype polymorphism, and [compile-time] generics (class templates, function templates, etc).</P>

      <P>Some people mistakenly believe C++ to be a "superset" of C, meaning that any and all C code constitutes valid C++ code. That isn't <It>quite</It> true; there are plenty of C features that aren't supported in C++ (e.g., stack-allocated VLAs, and designated initializers for structure initialization prior to C++20). However, as you'll see, the syntax of the basic imperative aspects of C++ is so similar to the syntax of C that, if you know C, and you know the fundamentals of object-oriented programming (as you should from CS 162 or equivalent), then learning the basics of C++ from there is fairly easy.</P>

      <P>This lecture will teach you some of the basics of C++. It assumes you  have a strong understanding of C (as you do, from taking this course) as well as a strong understanding of the fundamentals of object-oriented programming (as you should, from CS 162 or equivalent). In particular, most students reading these lecture notes will likely have some Python experience, so that's how these lecture notes are framed. But if you learned about OOP in the context of some other programming language, that's fine; the fundamental concepts map fairly well from one language to another.</P>

      <SectionHeading id="noted-differences">Some noted differences</SectionHeading>

      <P>First, a couple notes:</P>

      <Itemize>
        <Item>The GNU Compiler Collection (GCC) comes with a C++ command-line build tool, <Code>g++</Code>. <Code>g++</Code> has a very similar interface to that of <Code>gcc</Code>, but it's used to compile C++ programs instead of C programs. I'll use it for my demonstrations.</Item>
        <Item>There are various accepted file extensions for C++ source code files. There's <Code>.cpp</Code>, <Code>.cc</Code> (perhaps standing for "C with Classes", though historians can bicker about this), <Code>.c++</Code>, <Code>.cxx</Code>, <Code>.C</Code>, <Code>.CPP</Code>, and <Code>.cxx</Code>. I'll use <Code>.cpp</Code>, for no particular reason. The choice doesn't matter that much, so long as you're consistent with the rest of the codebase and surrounding (e.g., GNU Make) build tools.</Item>
        <Item>For header files that use C++-specific features and therefore can't be included in a regular C translation unit, use the <Code>.hpp</Code> file extension instead of <Code>.h</Code>. If the header file uses features that are compatible with both C and C++, you can use either <Code>.h</Code> or <Code>.hpp</Code>, depending on your goals (e.g., use <Code>.h</Code> if you plan to maintain the file such that it will continue to be includeable in C translation units, else use <Code>.hpp</Code>).</Item>
        <Item>In C, a function taking no arguments should have the parameter list <Code>(void)</Code>. For example, <Code>int main(void)</Code>. In C++, a function taking no arguments should simply have an empty parameter list. For example, <Code>int main()</Code>. Technically, <Code>int main(void)</Code> is acceptable in C++ for backwards-compatibility with C, but it's equivalent to <Code>int main()</Code>, and the latter is more common.</Item>
        <Item>In C++, the <Code>struct</Code> keyword is optional when declaring a structure (though still necessary when defining a structure type). For example, to create a person structure in C++, you can simply write <Code>person samantha;</Code> instead of <Code>struct person samantha;</Code></Item>
      </Itemize>

      <SectionHeading id="standard-output">Standard output</SectionHeading>

      <P>To print to standard output in C++, you <It>can</It> just include <Code>stdio.h</Code> (or, similarly, <Code>cstdio</Code>) and use <Code>printf</Code>, as you do in C. But C++ offers its own nicer mechanisms for printing to standard output.</P>

      <P>First, include <Code>iostream</Code> (<Code>{'#include <iostream>'}</Code>). Notice that it has no file extension; this is common for header files that are part of the C++ standard library.</P>

      <P>Then, to print a value to standard output, write <Code>{'std::cout << VALUE << std::endl;'}</Code>, replacing <Code>VALUE</Code> with the value to be printed. This value can be just about any primitive expression. It can be a <Code>float</Code>, <Code>double</Code>, <Code>int</Code>, etc), C string (<Code>char*</Code> pointing to a null-terminated character array), etc. In fact, it can be <It>any</It> data type for which the right operator has been defined (you can even make your own custom types printable).</P>

      <P>Here's a breakdown of this syntax:</P>

      <Itemize>
        <Item><Code>std::cout</Code> refers to the <Code>cout</Code> object ("console output") that's part of the <Code>std</Code> ("standard") namespace, provided by <Code>iostream</Code>. It's a special object that represents the program's standard output stream.</Item>
        <Item><Code>{'<<'}</Code> is the stream insertion operator. It inserts the value on the right into the output stream on the left (such as <Code>std::cout</Code>, the standard output stream, hooked up to the terminal by default in most cases).</Item>
        <Item><Code>{'<<'}</Code> can be chained multiple times in a single statement to print multiple values all at once. For example, <Code>{'std::cout << "Hello, " << "World!"'}</Code> will print <Code>Hello, World!</Code> to the terminal.</Item>
        <Item><Code>{'std::endl'}</Code> is the <Code>endl</Code> object from the <Code>std</Code> namespace, also provided by <Code>iostream</Code>. It stands for "endline". It just represents a newline character sequence. That is, it's similar to <Code>\n</Code>. There are minor differences between <Code>std::endl</Code> and <Code>\n</Code> in terms of flushing behavior for non-standard output buffers, but that's beyond the scope of this lecture.</Item>
      </Itemize>

      <P>So, here's a "Hello, World!" program in C++:</P>

      <CBlock fileName="hello_world.cpp">{
`#include <iostream>

// Notice: It's just int main(), not int main(void)
int main() {
        std::cout << "Hello, World!" << std::endl;
}
`
      }</CBlock>

      <P>And here's how to build and run it using <Code>g++</Code> instead of <Code>gcc</Code> (notice that C++ programs can still be run through Valgrind):</P>

      <TerminalBlock copyable={false}>{
`$ g++ -g -Wall -o hello_world hello_world.cpp
$ valgrind ./hello_world 
==2942549== Memcheck, a memory error detector
==2942549== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2942549== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2942549== Command: ./hello_world
==2942549== 
Hello, World!
==2942549== 
==2942549== HEAP SUMMARY:
==2942549==     in use at exit: 0 bytes in 0 blocks
==2942549==   total heap usage: 2 allocs, 2 frees, 73,728 bytes allocated
==2942549== 
==2942549== All heap blocks were freed -- no leaks are possible
==2942549== 
==2942549== For lists of detected and suppressed errors, rerun with: -s
==2942549== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <SectionHeading id="strings">Strings</SectionHeading>
      
      <P>The C++ standard library provides a special custom data type, <Code>std::string</Code>, to represent strings. It's provided by the <Code>{'<string>'}</Code> header file. Under the hood, objects of this type store an underlying C string in a heap-allocated character. But what's nice is that they automatically manage the memory of these character arrays via constructors, destructors, and other methods, so that you don't have to think about it:</P>

      <CBlock fileName="string.cpp">{
`#include <iostream>
#include <string>

int main() {
        // C strings can be casted into std::string objects
        // implicitly
        std::string hello = "Hello, World!";
        std::cout << hello << std::endl;

        // This program may allocate some dynamic memory to
        // store the "Hello, World" contents in the std::string
        // object. But it also frees that dynamic memory
        // automatically. (Technically, it can sometimes avoid
        // using the heap via an optimization technique known
        // as small-string optimization. And that might happen
        // here since "Hello, World" is a pretty small string.)
}
`
      }</CBlock>

      <P>Here's the output:</P>

      <TerminalBlock copyable={false}>{
`$ g++ -g -Wall -o string string.cpp 
$ valgrind ./string
==2950535== Memcheck, a memory error detector
==2950535== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2950535== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2950535== Command: ./string
==2950535== 
Hello, World!
==2950535== 
==2950535== HEAP SUMMARY:
==2950535==     in use at exit: 0 bytes in 0 blocks
==2950535==   total heap usage: 2 allocs, 2 frees, 73,728 bytes allocated
==2950535== 
==2950535== All heap blocks were freed -- no leaks are possible
==2950535== 
==2950535== For lists of detected and suppressed errors, rerun with: -s
==2950535== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <SectionHeading id="references">References</SectionHeading>

      <P>In addition to pointers, C++ also has <Bold>references</Bold>. Loosely, you can think of a reference as being equivalent to a pointer, except:</P>

      <Itemize>
        <Item>While a pointer is declared using the <Code>*</Code> symbol, a reference instead uses the <Code>&</Code> symbol (e.g., <Code>int& my_reference</Code>, versus <Code>int* my_pointer</Code>).</Item>
        <Item>All references are themselves constant. Therefore, a reference must be initialized the moment it's declared. (Or the reference must be a parameter of a function, in which case it's automatically initialized to refer to the given argument at the time of the function call).</Item>
        <Item>When initializing a reference, you do <Ul>not</Ul> have to write the address-of operator (<Code>&</Code>) in front of the object whose address you'd like to store inside it. In fact, you can't. The address-of operator is implied.</Item>
        <Item>After a reference has been declared, any time you write out the name of the reference, it's automatically dereferenced. That is, you do <Ul>not</Ul> have to write out the dereference operator (<Code>*</Code>) in front of a reference in order to dereference it. In fact, you can't. The dereference operator is implied.</Item>
      </Itemize>

      <P>Okay, that's not exactly how the C++ standard defines references, but it's a simple way of thinking about them, and it's <It>essentially</It> true.</P>

      <P>Here's some documented code to give you the idea:</P>

      <CBlock fileName="references.cpp">{
`int main() {
        int x;

        // p is a pointer. It stores the address of x.
        int* p = &x;

        // r is a reference. It references x ("stores the
        // address of x". Technically, it might reference x in
        // some other, non-address way. But, in practice, it's
        // usually just an address, just like a pointer.)
        // Notice: No & on the right-hand side. It's "implied".
        // However, there is a & on the left-hand side.
        // References use & instead of * in their type
        // signatures.
        int& r = x;

        // You cannot declare a reference without initializing
        // it to refer to some variable at that moment. For
        // example, this wouldn't be allowed:
        // int& my_reference;
        // However, you can obviously do this with pointers:
        // int* my_pointer;

        // This changes x to 10
        *p = 10;

        // This changes x to 20. Notice: no dereference
        // operator. Again, it's "implied".
        r = 20;

        // Because the dereference operator is "implied"
        // whenever a reference is used, the reference itself
        // cannot be changed. Consider:
        int y = 1;
        r = y;

        // The above, r = y, does NOT change r to make it
        // refer to y. Instead, it changes x to store the
        // value of y. Again, the dereference operator is
        // "implied", so r = y is equivalent to x = y.

        // This is what I meant when I said that "all references
        // are themselves constant". References cannot be
        // changed. Only the values of the things that they
        // refer to can be changed (unless you const-qualify
        // the reference, so that it's a
        // reference-to-a-constant).
}
`
      }</CBlock>

      <P>References are more limited in their capabilities than pointers are. As I've said, references themselves can't be modified. Also, there's no way to retrieve the address <It>of</It> a reference. In the above program, <Code>&r</Code> would simply give us the address of <Code>x</Code> (Technically, it's possible that a given reference might not occupy <It>any</It> space in memory, if the compiler can optimize it to work without storage. That's indeed possible in certain limited contexts, perhaps even in the case of <Code>r</Code> in the above program).</P>

      <P>However, references are <It>simpler</It> than pointers. After all, there's less that you can do with them, so there are fewer ways to use them incorrectly. And we all know how easy it is to use a pointer incorrectly. If you have no intention of ever changing a pointer to point to a new location in memory, then you might as well use a reference instead.</P>

      <SectionHeading id="methods">Methods (member functions)</SectionHeading>

      <P>In C++ (but not C), a structure type can have functions inside it. That is, a structure type can have <Bold>methods</Bold>, or <Bold>member functions</Bold>. You should know what these are from CS 162 (or equivalent).</P>

      <P>Within a method definition, you can access the object on which the method is being called via the <Code>this</Code> keyword. Or, rather, <Code>this</Code> serves as a <It>pointer</It> to the object on which the method is being called. This is similar to the conventional <Code>self</Code> parameter in a method of a Python class.</P>

      <P>(However, in Python, the <Code>self</Code> parameter must be declared explicitly as the method's first parameter. In C++, the <Code>this</Code> parameter is implicit. It cannot be declared explicitly; every method automatically has it.)</P>

      <P>Importantly, method definitions [that are written outside the structure type or class definition] must be prefixed with the name of the containing structure type / class followed by the scope resolution operator (<Code>::</Code>).</P>

      <P>Below is a brief demonstration. First, a header file defining a structure type with a method:</P>

      <CBlock fileName="greeter.hpp">{
`#ifndef GREETER_HPP
#define GREETER_HPP

#include <string>

struct greeter {
        std::string name;

        // Prototype methods in structure type definitions
        // (could be in a .hpp file)
        void greet();
};

#endif
`
      }</CBlock>

      <P>Next, the corresponding <Code>.cpp</Code> file in which the method (<Code>greet</Code>) is defined:</P>

      <CBlock fileName="greeter.cpp">{
`#include <iostream>

// Include the header file defining the greeter structure type
#include "greeter.hpp"

// Now define the functions and methods prototyped in
// greeter.hpp

// Must prefix the method's name with the name of
// the structure type (greeter) and the scope resolution
// operator (::) to make it clear that this isn't a global
// function, but rather a method of the greeter type.
void greeter::greet() {
        // "this" is a pointer to the greeter on which this
        // method is currently being called. Access this
        // greeter's name and include it in the printout
        std::cout << "Hello, my name is " << this->name <<
                std::endl;
}
`
      }</CBlock>

      <P>Finally, a <Code>main</Code> function to tie it all together into a program:</P>

      <CBlock>{
`#include "greeter.hpp"

int main() {
        greeter g;
        g.name = "Joe";

        // C++ did not support designated initializers until
        // C++20. That is, greeter g = {.name = "Joe"}
        // is not supported by earlier versions of C++. It
        // supports other initialization styles, but we won't
        // cover them.

        // Call g's greet() method. Prints
        // "Hello, my name is Joe"
        g.greet();
}
`
      }</CBlock>

      <P>And here's the output (same as with C programs, list out all your <Code>.cpp</Code> files to <Code>g++</Code>, but do <Ul>not</Ul> list out the header files unless you want to create precompiled header files):</P>

      <TerminalBlock copyable={false}>{
`$ g++ -g -o methods methods.cpp greeter.cpp 
$ valgrind ./methods
==2956456== Memcheck, a memory error detector
==2956456== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2956456== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2956456== Command: ./methods
==2956456== 
Hello, my name is Joe
==2956456== 
==2956456== HEAP SUMMARY:
==2956456==     in use at exit: 0 bytes in 0 blocks
==2956456==   total heap usage: 2 allocs, 2 frees, 73,728 bytes allocated
==2956456== 
==2956456== All heap blocks were freed -- no leaks are possible
==2956456== 
==2956456== For lists of detected and suppressed errors, rerun with: -s
==2956456== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <SectionHeading id="access-modifiers">Access modifiers</SectionHeading>

      <P>C++ has access modifiers: <Code>private</Code>, <Code>public</Code>, and <Code>protected</Code>. These can be used inside a structure type (or class) definition to control the locations in the codebase from which certain members (fields and methods) are accessible. We'll focus on <Code>private</Code> and <Code>public</Code>.</P>

      <P>To mark a set of members as publicly accessible, write <Code>public:</Code> above their declarations in the structure type (or class) definition. To mark a set of members as privately accessible, write <Code>private:</Code> above their declarations in the structure type (or class) definition. In many style guides, these access modifiers are often unindented (or their indentation level matches that of the <Code>struct</Code> keyword, rather than that of the members themselves). For example:</P>

      <CBlock fileName="greeter.hpp" highlightLines="{7}">{
`#ifndef GREETER_HPP
#define GREETER_HPP

#include <string>

struct greeter {
public:
        std::string name;

        // Prototype methods in structure type definitions
        // (could be in a .hpp file)
        void greet();
};

#endif
`
      }</CBlock>

      <P>The accessibility of a given member is that of the most recent access modifier appearing above it in the structure type (or class) definition. In the above code, all members of the <Code>greeter</Code> structure type are marked as public. That said, note that structure types' members are public by default, so if we got rid of line 7, everything would still be public.</P>

      <P>A public member can be accessed (e.g., via the <Code>.</Code> or <Code>{'->'}</Code> operator) from anywhere in the codebase. In contrast, a private member of a given structure type (or class) can <Ul>only</Ul> be accessed from within the definitions of the methods of that very structure type (or class). That is, private members in C++ are similar to members in a Python class whose names start with a leading underscore.</P>

      <P>However, in the case of C++, access is strictly enforced by the compiler. For example, suppose we change <Code>public:</Code> to <Code>private:</Code> on line 7 above, and suppose we additionally write <Code>public:</Code> on line 9. Then the <Code>name</Code> field would no longer be accessible from, say, the <Code>main</Code> function (rather, it'd only be accessible from within methodss of the <Code>greeter</Code> structure type, such as the <Code>greet()</Code> method). We'd then get compiler errors when we try to build the program:</P>

      <CBlock fileName="greeter.hpp">{
`#ifndef GREETER_HPP
#define GREETER_HPP

#include <string>

struct greeter {
private:
        std::string name;
public:
        // Prototype methods in structure type definitions
        // (could be in a .hpp file)
        void greet();
};

#endif
`
      }</CBlock>

      <P>And here are the compiler errors:</P>

      <TerminalBlock copyable={false}>{
`(env) guyera@flip1:cpp$ g++ -g -o methods methods.cpp greeter.cpp 
methods.cpp: In function ‘int main()’:
methods.cpp:5:11: error: ‘std::string greeter::name’ is private within this context
    5 |         g.name = "Joe";
      |           ^~~~
In file included from methods.cpp:1:
greeter.hpp:8:21: note: declared private here
    8 |         std::string name;
      |                     ^~~~
`
      }</TerminalBlock>

      <P>Indeed, this is an example of information hiding to enforce encapsulation. Again, in Python, we'd do this by simply renaming <Code>name</Code> to <Code>_name</Code>. But in Python, information hiding (and access control in general) is not enforced. In C++, it is.</P>

      <SectionHeading id="constructors-and-destructors">Constructors and destructors</SectionHeading>
      
      <P>We now need a way to initialize the <Code>name</Code> field of the <Code>greeter</Code> structure type from within the <Code>main</Code> function. We could introduce a setter to do that. But a better idea would be to use a constructor.</P>

      <P>To define a constructor in C++, simply create a method in the structure type (or class) that 1) has no return type (not even <Code>void</Code>), and 2) is named after the structure type (or class) itself. In simple cases, constructors should usually be public, else they can't be called from arbitrary locations in the codebase. Constructors can have parameters, or not. It's up to you. (Arguably, every constructor has an implicit <Code>this</Code> parameter, but you don't have to write it out in the parameter list, unlike in Python).</P>

      <P>As you should know, a constructor is simply a method that's called automatically the moment the given data type is instantiated. It's responsible for "setting up" the object.</P>

      <P>Here's an example declaration:</P>

      <CBlock fileName="greeter.hpp" highlightLines="{10-16}">{
`#ifndef GREETER_HPP
#define GREETER_HPP

#include <string>

struct greeter {
private:
        std::string name;
public:
        // Define a constructor for the greeter structure type
        // accepting a name string as the only argument. We
        // accept it by constant reference (similar to constant
        // pointer) since we don't intend to modify it but
        // also don't want it to be copied twice---just once
        // (into the object field, but not into the parameter).
        greeter(const std::string& name);

        // Prototype methods in structure type definitions
        // (could be in a .hpp file)
        void greet();
};

#endif
`
      }</CBlock>

      <P>And here's the definition:</P>

      <CBlock fileName="greeter.cpp" highlightLines="{10-16}">{
`#include <string>
#include <iostream>

// Include the header file defining the greeter structure type
#include "greeter.hpp"

// Now define the functions and methods prototyped in
// greeter.hpp

greeter::greeter(const std::string& name) {
        // Copy the name parameter into this greeter's
        // name field. Yes, std::string objects can be
        // deep-copied simply via the assignment operator.
        // No need for strcpy, nor memcpy, etc.
        this->name = name;
}

// Must prefix the method's name with the name of
// the structure type (greeter) and the scope resolution
// operator (::) to make it clear that this isn't a global
// function, but rather a method of the greeter type.
void greeter::greet() {
        // "this" is a pointer to the greeter on which this
        // method is currently being called. Access this
        // greeter's name and include it in the printout
        std::cout << "Hello, my name is " << this->name <<
                std::endl;
}
`
      }</CBlock>

      <P>To call a constructor in the simplest case, simply declare an object of the given structure type (or class), but before the semicolon, write out a pair of parentheses enclosing the constructor argument list. Here's an updated <Code>methods.cpp</Code> file:</P>

      <CBlock fileName="methods.cpp">{
`#include "greeter.hpp"

int main() {
        // Construct a greeter g with the name "Joe". This
        // calls the greeter constructor and passes "Joe"
        // (casted to a std::string object) as the first
        // argument.
        greeter g("Joe");

        // Call g's greet() method. Prints
        // "Hello, my name is Joe"
        g.greet();
}
`
      }</CBlock>

      <P>Since we're no longer trying to access the <Code>name</Code> field directly from the <Code>main</Code> function (or anywhere outside the methods of the <Code>greeter</Code> structure type), we're no longer violating the <Code>private</Code> access modifier. Once again, everything compiles and runs, but now our structure type's <Code>name</Code> field is well encapsulated:</P>

      <TerminalBlock copyable={false}>{
`(env) guyera@flip1:cpp$ g++ -g -o methods methods.cpp greeter.cpp 
(env) guyera@flip1:cpp$ valgrind ./methods 
==2971312== Memcheck, a memory error detector
==2971312== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==2971312== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==2971312== Command: ./methods
==2971312== 
Hello, my name is Joe
==2971312== 
==2971312== HEAP SUMMARY:
==2971312==     in use at exit: 0 bytes in 0 blocks
==2971312==   total heap usage: 2 allocs, 2 frees, 73,728 bytes allocated
==2971312== 
==2971312== All heap blocks were freed -- no leaks are possible
==2971312== 
==2971312== For lists of detected and suppressed errors, rerun with: -s
==2971312== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <SectionHeading id="cpp-classes">C++ Classes</SectionHeading>

      <P>Besides structure types, C++ also has <Bold>classes</Bold>. In C++, classes and structure types are essentially identical. To create a class, simply create a structure type definition, but replace the keyword <Code>struct</Code> with the keyword <Code>class</Code>. The only differences between them are:</P>

      <Itemize>
        <Item>In a structure type, members are public by default. In a class, members are private by default.</Item>
        <Item>When a structure type inherits from another data type, that inheritance relationship is public by default. When a class inherits from another data type, that inheritance relationship is private by default.</Item>
      </Itemize>

      <P>I don't expect you to understand the second bullet point. But either way, both of these bullet points simply describe <It>default</It> access control. Defaults are just that<Emdash/>defaults. Access control can be changed using access modifiers. Indeed, although structure type members are public by default, and class members are private by default, you can easily create a structure type where all members are private (just write <Code>private:</Code> at the top of its definition), and you can easily create a class where all members are public (just write <Code>public:</Code> at the top of its definition).</P>

      <P>However, many programmers have their own philosophies, or rules of thumb, to decide when to use a structure type versus a class. Often, classes are used when you want to emphasize encapsulation and information hiding or establish class invariants (e.g., lots of private member variables, the access to which is funneled through a few public member functions with narrow but stable interfaces), whereas structure types are used to represent <Bold>plain-old-data (POD)</Bold> types (i.e., passive data structures / record types). But that's just one possible philosophy; do as you will. Just be consistent with the existing codebase and the rest of your team.</P>

      <P>Just to show you, here's all it takes to convert <Code>greeter</Code> into a class:</P>

      <CBlock fileName="greeter.hpp" highlightLines="{6}">{
`#ifndef GREETER_HPP
#define GREETER_HPP

#include <string>

class greeter {
private:
        std::string name;
public:
        // Define a constructor for the greeter structure type
        // accepting a name string as the only argument. We
        // accept it by constant reference (similar to constant
        // pointer) since we don't intend to modify it but
        // also don't want it to be copied twice---just once
        // (into the object field, but not into the parameter).
        greeter(const std::string& name);

        // Prototype methods in structure type definitions
        // (could be in a .hpp file)
        void greet();
};

#endif
`
      }</CBlock>

      <P>Since <Code>greeter</Code> is a class now, its members are private by default. This means that, if we wanted to, we could omit line 7 above (<Code>private:</Code>), and it wouldn't change anything. The <Code>name</Code> field would still be private (by default), and the methods would still be public due to the <Code>public</Code> access modifier above them.</P>

      <SectionHeading id="raii-unique-pointers-and-vectors">RAII, unique pointers, and vectors</SectionHeading>

      <P>A famous idiom that governs a lot of modern C++ programming practices is <Bold>RAII</Bold>, which stands for <Bold>Resource Acquisition Is Initialization</Bold> (coined by Bjarne Stroustrup himself). The chief idea of RAII is that any resources that need to be acquired should be acquired during the initialization of an object that's responsible for owning and managing (e.g., freeing) said resources.</P>

      <P>For example, suppose you want to allocate a dynamic array of integers. This requires "acquiring resources", specifically dynamic (e.g., heap-allocated) memory. RAII suggests that this should be done in, say, the constructor of an object that <It>owns</It> that dynamic memory. Said object is responsible for managing that dynamic memory, including freeing it at some point. Nobody else should ever have to worry about it.</P>

      <P>Consider <Code>std::string</Code>. As I said, this is a special data type (it's actually a class) provided by <Code>{'<string>'}</Code> that "owns", or "manages", a dynamic array of characters storing an underlying C string. Even though the greeter <Code>g</Code> in the previous program has a <Code>name</Code> field, which is a <Code>std::string</Code> and therefore is backed by dynamic memory, you might have noticed that my program doesn't contain any <Code>free()</Code> calls or similar. And yet, it has no memory leaks. How can this be?</P>

      <P>Well, this is the idea of RAII. The dynamic memory needed to store the C string for a <Code>std::string</Code> object is <It>owned</It> by said <Code>std::string</Code> object. The <Code>std::string</Code> object is <It>responsible</It> for that memory. It's allocated automatically when needed by the <Code>std::string</Code> constructor (and / or other member functions). It's also freed automatically when needed by the <Code>std::string</Code> <Bold>destructor</Bold>.</P>

      <P>Wait<Emdash/>what's a destructor? Well, just as a constructor is a method that's automatically called on an object when it's created, a destructor is a method that's automatically called on an object when it's freed. The <Code>std::string</Code> class's destructor frees the dynamic memory associated with the underlying C string. The moment our <Code>main</Code> function ends, <Code>g</Code> falls out of scope, and therefore its <Code>name</Code> field does as well. This automatically invokes the <Code>std::string</Code> class's destructor on <Code>g</Code>'s <Code>name</Code> object, which in turn frees the dynamic memory of its underlying C string.</P>

      <P>This is the power of RAII. If used correctly, you [almost] never need to worry about resource leaks, such as memory leaks.</P>

      <P>I won't go into the details of destructors or how to implement RAII at a deep level. However, I'll quickly teach you about two more mechanisms provided by the C++ standard library (in addition to <Code>std::string</Code>) that follow RAII principles and make it easier to manage dynamic memory: 1) unique pointers, and 2) vectors.</P>

      <P>Let's start with unique pointers. Suppose you want to create a single integer on the heap with value <Code>42</Code>. In C, you'd do this like so:</P>

      <CBlock showLineNumbers={false}>{
`int* heap_integer = malloc(sizeof(int));
*heap_integer = 42;`
      }</CBlock>

      <P>In C++, the RAII way to do it is like so:</P>

      <CBlock>{
`#include <memory> // Provides std::unique_ptr class template
std::unique_ptr<int> heap_integer = std::make_unique<int>(42);`
      }</CBlock>

      <P><Code>std::unique_ptr</Code> is not actually a class. Rather, it's a <Bold>class template</Bold>. However, <Code>{'std::unqiue_ptr<int>'}</Code> <It>is</It> a class. Similarly, <Code>std::make_unique</Code> is a function template, and <Code>{'std::make_unique<int>'}</Code> is a function. Class templates and function templates are examples of generics in C++ (similar to generic classes in Python). Hopefully this isn't a wildly new idea to you (if it is, please research generics; every programmer should know what they are).</P>

      <P>An object of type <Code>{'std::unique_ptr<int>'}</Code> is basically just an object that, inside it, contains a pointer field that points to a single integer on the heap. The <Code>{'std::make_unique<int>'}</Code> function accepts an integer as an argument, creates a block of bytes on the heap big enough to store it, copies the integer argument's value into that heap-allocated block, and wraps it all in a <Code>{'std::unique_ptr<int>'}</Code> object.</P>

      <P>A unique pointer can be "dereferenced" using the <Code>*</Code> and <Code>{'->'}</Code> operators, similar to a regular pointer (this is possible because C++ classes support extensive operator overloading). This gives you access to the underlying object that its internal pointer points to. For example:</P>

      <CBlock fileName="unique_ptr.cpp">{
`#include <iostream>
#include <memory>

int main() {
        std::unique_ptr<int> heap_integer =
                std::make_unique<int>(42);

        // Prints 42
        std::cout << *heap_integer << std::endl;
}
`
      }</CBlock>

      <P>So, why use unique pointers instead of just using <Code>malloc</Code>? Well, perhaps I can convince you of the power of unique pointers by showing you the valgrind output of the above program:</P>

      <TerminalBlock copyable={false}>{
`(env) guyera@flip1:cpp$ g++ -g -Wall -o unique_ptr unique_ptr.cpp 
(env) guyera@flip1:cpp$ valgrind ./unique_ptr 
==3005178== Memcheck, a memory error detector
==3005178== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==3005178== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==3005178== Command: ./unique_ptr
==3005178== 
42
==3005178== 
==3005178== HEAP SUMMARY:
==3005178==     in use at exit: 0 bytes in 0 blocks
==3005178==   total heap usage: 3 allocs, 3 frees, 73,732 bytes allocated
==3005178== 
==3005178== All heap blocks were freed -- no leaks are possible
==3005178== 
==3005178== For lists of detected and suppressed errors, rerun with: -s
==3005178== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
`
      }</TerminalBlock>

      <P>Notice: no memory leaks, and yet we never had to call <Code>free()</Code> or similar. Indeed, just as <Code>std::make_unique</Code> allocates the required dynamic memory to store the integer on the heap, unique pointers also have destructors that automatically free that memory from the heap the moment the unique pointer itself is freed. So when the <Code>main</Code> function ends and <Code>heap_integer</Code> falls out of scope, its destructor will get called, freeing the dynamic memory of the heap-allocated integer that it owns.</P>

      <P>That's to say, if you simply <It>always</It> use unique pointers over <Code>malloc</Code> when allocating a single object on the heap, then you'll [almost] never have to worry about that object's memory being leaked.</P>

      <P>To be clear, unique pointers can be created for <It>any</It> type of data. This is the power of generics. You can even create them for class types, such as <Code>greeter</Code>. Simply pass the constructor arguments for the target class into the function instantiated from <Code>make_unique</Code>. Here's an updated version of <Code>methods.cpp</Code> from earlier, constructing <Code>g</Code> on the heap via a unique pointer instead of constructing it on the stack:</P>

      <CBlock fileName="methods.cpp" highlightLines="{6-13}">{
`#include <memory>

#include "greeter.hpp"

int main() {
        // Create the greeter on the heap using a unique pointer
        std::unique_ptr<greeter> g =
                std::make_unique<greeter>("Joe");

        // Call the greet() method of the greeter on the heap
        // that's managed by the unique pointer g. Prints
        // "Hello, my name is Joe"
        g->greet();
}
`
      }</CBlock>

      <P>There's still one issue: unique pointers can only manage a <It>single</It> object on the heap. What if you want a dynamic <It>array</It> of objects? After all, that's the most common use case for dynamic memory in C.</P>

      <P>Well, C++ offers some other RAII-minded tools for such purposes, the most popular of which being the class template known as <Code>std::vector</Code>, provided by <Code>{'<vector>'}</Code>. Just as a unique pointer owns and manages a single object (of any specified type) on the heap, a vector owns and manages a dynamic array of objects (of any specified type) on the heap.</P>

      <P>In fact, not only do vectors have constructors and destructors that automatically allocate and free all the required dynamic memory for the underlying array, they also have various methods that make it extremely easy to add elements to and remove elements from the underlying dynamic array, resizing it in the process. Indeed, gone are the days of having to use <Code>malloc</Code>, <Code>calloc</Code>, <Code>realloc</Code>, and <Code>free</Code> for your dynamic arrays. These methods manage all that for you. (Not to mention, <Code>std::vector</Code> is implemented quite cleverly; it intentionally allocates a larger-than-necessary dynamic array so that it doesn't have to expand as frequently as elements are added to it, making it far more runtime-efficient (but slightly less space-efficient) than a naive expand-array-by-1-element strategy).</P>

      <P>Moreover, vectors have an element-access method named <Code>at</Code> that conducts bounds-checking, unlike the subscript operator (<Code>[]</Code>). That is, if you use vectors and their <Code>at</Code> methods religiously, then buffer overflows and buffer overreads will be detected at runtime rather than invoking undefined behavior (if you don't catch the thrown exception, the program will crash, but that's better than a very dangerous buffer overread or buffer overflow).</P>

      <P>This isn't a C++ course, so I don't have time to teach you the extensive and complicated syntax of vectors. I just want you to know about the tools that exist so that you can research them if you're curious.</P>

      <P>Ultimately, this is the takeaway:</P>

      <Itemize>
        <Item>If you want to create a single object on the heap, you should probably just use a unique pointer.</Item>
        <Item>If you want to create a resizable list of objects on the heap, you should probably just use a vector.</Item>
      </Itemize>

      <P>These are not hard and fast rules. There are other language mechanisms that you can also use to manage dynamic memory. But these are the two simplest and most common tools for the job. If you follow this advice, the RAII mechanisms (e.g., destructors) will take care of the dynamic memory, making memory leaks [almost] impossible. And, again, methods like <Code>std::vector::at</Code> perform bounds-checking, catching buffer overreads and buffer overflows as well.</P>

      <P>(Unfortunately, there are lots of memory errors that these tools do <It>not</It> necessarily solve for you. For example, dangling pointers and use-after-free errors are still very common bugs in many C++ programs.)</P>

      <SectionHeading id="and-more">And more</SectionHeading>

      <P>There are <It>tons</It> of details about C++ that I didn't cover in this lecture. It's a <It>massive</It> language with lots of modern, extensive features. If you want to learn more, I recommend starting with the following topics:</P>

      <Itemize>
        <Item>More on constructors, including member initializer lists.</Item>
        <Item>Destructors, and how to create them yourself.</Item>
        <Item>Resource ownership (and more in depth on RAII).</Item>
        <Item>Inheritance, <Code>protected</Code>, and method overrides.</Item>
        <Item>Subtype polymorphism, including object slicing, the <Code>virtual</Code> keyword, and the <Code>override</Code> keyword.</Item>
        <Item>Shared pointers. Similar to unique pointers, but copyable (unique pointers can't be copied, though you can copy the objects that they point to and wrap new unique pointers around them). They use automatic reference counters to keep track of the number of shared pointers pointing to the same object.</Item>
        <Item>Also, weak pointers, which are related to shared pointers.</Item>

        <P>Note: Unique pointers, shared pointers, and weak pointers are often grouped together under the umbrella term "smart pointers".</P>
        <Item><Code>std::array</Code> and other C++-standard generic collections (e.g., <Code>std::set</Code>, <Code>std::map</Code>, <Code>std::deque</Code>, unordered versions of these generics, and countless more).</Item>
        <Item><Code>new</Code>, <Code>delete</Code>, and <Code>delete[]</Code>. These are similar to <Code>malloc</Code> and <Code>free</Code>, but 1) they're built-in operators instead of functions provided by a header file, and 2) they interact with constructors and destructors. In fact, using <Code>malloc</Code> to try to allocate an object with a constructor in C++ often leads to undefined behavior if you don't know what you're doing; you usually must use <Code>new</Code> instead. But again, you usually shouldn't need <It>any</It> of these tools if you opt for RAII-minded generics like smart pointers and vectors instead.</Item>
        <Item>Generics (e.g., class templates and function templates), and how to create them yourself.</Item>
        <P>Dislcaimer: C++'s generics model is extremely extensive, perhaps more so than that of any other conventional programming language out there. If you explore this topic, you'll run into plenty of complicated subtopics, like SFINAE.</P>
        <Item><Code>std::optional</Code></Item>
        <Item>Exceptions (<Code>throw</Code>, <Code>try</Code>, and <Code>catch)</Code>.</Item>

        <P>Disclaimer: C++ exceptions are unchecked. Lots of people don't like that (for good reasons). Some people project the issues with unchecked exceptions onto exceptions in general (e.g., because they don't know that there's a difference). This has created a whole group of people who say, unconditionally, "exceptions are bad". There's another group of people who strongly disagree. Arguments ensue. If you encounter that side of the internet, approach it with an open mind. It's a complicated debate with decades of history behind it.</P>
      </Itemize>

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
