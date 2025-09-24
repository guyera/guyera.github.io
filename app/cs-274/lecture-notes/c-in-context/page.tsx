import PythonBlock from '../ui/pythonblock'
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
        <Item><Link href="#history-of-c">History of C</Link></Item>
        <Item><Link href="#c-today">C Today</Link></Item>
        <Item><Link href="#c-safety-concerns">C Safety Concerns</Link></Item>
      </Itemize>

      <SectionHeading id="history-of-c">History of C</SectionHeading>
      
      <P>This entire course is designed primarily to teach you the C programming language, so it's important that you understand a bit about its history and purpose.</P>

      <P>The C programming language was developed by Dennis Ritchie at AT&T Bell Labs. It was an iteration on the B programming language, which was developed by Ritchie's colleague, Ken Thompson. Ritchie and Thompson were part of a small team developing the UNIX operating system. As they worked on UNIX and its utilities, they realized that they would benefit from doing their development in a programming language that could leverage the advanced low-level features of evolving CPU architectures (e.g., the Intel 8086) while also providing high-level abstractions over the underlying CPU instruction set. But no such language existed, so they created their own<Emdash/>first B, and then C.</P>

      <P>Once C was production-ready, they rewrote UNIX and its utilities in C (they were originally written in assembly language for the PDP-11, which was not portable to other CPUs with different architectures).</P>

      <SectionHeading id="c-today">C Today</SectionHeading>

      <P>C was created for the purpose of building an operating system and its utilities, so this is where it excels<Emdash/>OS development and systems programming. It offers direct access to low-level CPU instructions and system calls (you can even embed inline assembly code into a C program) as well as high-level abstractions over those low-level features. The access to low-level features gives the programmer fine-grained control over the hardware while the high-level abstractions assist portability (e.g., a single C program can be compiled for and executed on various CPUs with different architectures, so long as a C compiler exists that targets the respective platform). This is in contrast to assembly languages, which are highly unportable (a program written in assembly would have to be rewritten for each target CPU architecture), as well as other modern high-level languages like Python, which do not offer very direct hardware interaction mechanisms.</P>

      <P>C is also designed such that it can be used to create highly performant programs. This, too, lends to its original purpose of OS and utilities development<Emdash/>the operating system is the most central program of a modern computer system, so, in most cases, it's critical that it's highly performant.</P>

      <P>So perhaps unsurprisingly, C is most commonly used today in low-level / systems programming, including development of operating systems, system utilities, computer graphics applications (which require interfacing heavily with the GPU), and more. It's also commonly used for development of performance-critical applications like compilers and interpreters (e.g., <Link href="https://github.com/python/cpython">CPython</Link>, the standard implemention of Python).</P>

      <P>Also, having been used in the development of various modern operating systems and their utilities (including Windows, Linux, MacOS, FreeBSD, and more), most other programming languages are designed to be able to interoperate with C so that they can in turn use those utilities. For example, a function written in Python can call a function written in C (see, e.g., <Code><Link href="https://docs.python.org/3/library/ctypes.html">ctypes</Link></Code>).</P>

      <P>For these reasons, C is ubiquitous nowadays. You'd be hard-pressed to find a large-scale, production-ready software application that doesn't rely on C in some way or another, whether it be written in C directly or call upon procedures compiled from C.</P>

      <SectionHeading id="c-safety-concerns">C Safety Concerns</SectionHeading>

      <P>In order to support development of high-performance, low-level software (e.g., operating systems), C provides very direct hardware interaction capabilities. This includes mechanisms to manipulate and manage the computer's memory in fairly direct ways.</P>

      <P>But manipulation and management of computer memory is difficult. It's easy to do it wrong. Putting that responsibility in the hands of the programmer often leads to bugs, and some of these bugs are potentially dangerous. For example, a C program can allocate some memory, use it for some time, free it, and then continue to try to access it as if it hasn't already been freed. This is majorly problematic; once a block of memory has been freed, the operating system may recycle it for other purposes within the same process / program. So when the program later accesses the already-freed block of memory, it may be accessing other data that has since been allocated to use that same space. This can lead to some bizarre behavior wherein variables' values change suddenly and unexpectedly, but no exceptions are thrown, and no stack traces are printed to the terminal.</P>

      <P>Similarly, an array in C is simply a contiguous chunk of bytes with a base address. C does not provide an internal mechanism to keep track of the size of each array (or, at least, it provides no interface for such a mechanism). That is, if a C program attempts to access an element beyond the bounds of an array (e.g., accessing the 11th element in an array of size 10), the computer is not inherently capable of detecting such an error. It's the programmer's responsibility to carefully write the program such that it never attempts to access an array at an out-of-bounds index. If the programmer makes a mistake and the C program <It>does</It> attempt to access an out-of-bounds array element, much like in the previous scenario, this can cause the program to access other data that's being used by the process / program for other purposes, potentially changing the values of other variables in unexpected ways.</P>

      <P>(These sorts of bugs can be extremely dangerous. Microsoft <Link href="https://www.microsoft.com/en-us/msrc/blog/2019/07/a-proactive-approach-to-more-secure-code">reported in 2019</Link> that 70% of their vulnerabilities that they assigned a CVE were due to memory safety issues of languages like C and C++. Also, many historically prominent security vulnerabilities have been due to memory safety issues, including <Link href="https://www.heartbleed.com/">Heartbleed</Link>. And if you're a gamer, you might remember that much of the Dark Souls franchise went offline for about a year and a half starting in 2022<Emdash/>that was in response to a major security vulnerability caused by a memory management bug in the franchsise's matchmaking system, also due to memory safety issues of languages like C and C++.)</P>

      <P>For these reasons and others, the White House and the NSA have put out statements warning programmers to be wary of "memory-unsafe" languages like C and C++, preferring other programming languages that put abstractions over memory access and management to prevent dangerous bugs. Of course, there's no free lunch. If these abstractions are executed at runtime (e.g., garbage collectors, reference counters, etc), then they slow down the program. If they're implemented at build time (e.g., Rust's borrow checking), then they usually need to impose serious constraints on the program's representation to ensure provability of correctness (e.g., forbidding raw references from escaping the call stack or being passed down the call stack, even temporarily), which can also hurt performance as well as complicate development (if you've heard that Rust development involves spending a lot of time fighting with the compiler, this is why<Emdash/>it's extremely strict, sometimes in seemingly unnecessary ways).</P>

      <P>Regardless, C isn't going anywhere anytime soon. Although there have been various initiatives and debates over replacing C with other languages (notably Rust) in various contexts, such as in development of Linux kernel modules, it will be a very long time from now (if ever) before we see C fully phased out of modern software systems. So, for now, it's a critical tool.</P>

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
