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
      <P>This lecture will teach you about some of Python's basic built-in collections and data structures (beyond lists). We'll cover the following:</P>

      <Itemize>
        <Item><Link href="#tuples">Tuples</Link></Item>
        <Item><Link href="#sets">Sets</Link></Item>
        <Item><Link href="#dictionaries">Dictionaries</Link></Item>
      </Itemize>

      <SectionHeading id="tuples">Tuples</SectionHeading>
      
      <P>A <Term>tuple</Term> is a group of values. In Python, tuples are <Bold>immutable</Bold> and fixed in size, meaning that once a tuple has been created, you cannot modify the values in it, nor can you add or remove values to / from it. This is in contrast to lists, which are both mutable (modifiable) and resizable.</P>

      <P>There are various ways to create tuples in Python. A simple way is to write out a comma-separated list of values in between a pair of parentheses. The interpreter will automatically convert the entire grouping into a single tuple containing all of the provided values. For example:</P>

      <PythonBlock fileName='tuples.py'>{
`def main():
    my_tuple = ('James', 25, 'Strawberries')

if __name__ == '__main__':
    main()
`
      }</PythonBlock>

      <P>Once a tuple has been created, you can access the values within it using square brackets and an index, just like you would with a list:</P>

      <PythonBlock fileName='tuples.py'>{
`def main():
    my_tuple = ('James', 25, 'Strawberries')
    print(my_tuple[0]) # Prints James
    print(my_tuple[1]) # Prints 25
    print(my_tuple[2]) # Prints Strawberries

if __name__ == '__main__':
    main()
`
      }</PythonBlock>

      <P>As with lists, attempting to index a tuple with an out-of-bounds index results in an exception being thrown (specifically an <Code>IndexError</Code>), causing the program to crash if the exception isn't caught.</P>
      
      <P>Again, although you can access the values within a tuple, you <Ul>cannot</Ul> modify the values within a tuple. Attempting to do so <It>also</It> results in an exception being thrown (specifically a <Code>TypeError</Code>). And, like all other exceptions, this causes your program to crash if the exception isn't caught:</P>

      <PythonBlock fileName='cant-modify-tuple.py'>{
`def main():
    my_tuple = ('James', 25, 'Strawberries')
    print(my_tuple[0]) # Prints James
    print(my_tuple[1]) # Prints 25
    print(my_tuple[2]) # Prints Strawberries

    # Try to change 'James' to 'Jesse'. This isn't allowed. Crashes the
    # program
    my_tuple[0] = 'Jesse' 

if __name__ == '__main__':
    main()
`
      }</PythonBlock>

      <P>Running the above program produces the following output:</P>

      <TerminalBlock>{
`pythons-basic-data-structures $ python cant-modify-tuple.py 
James
25
Strawberries
Traceback (most recent call last):
  File "/home/alex/instructor/static-content/guyera.github.io/code-samples/pythons-basic-data-structures/cant-modify-tuple.py", line 12, in <module>
    main()
    ~~~~^^
  File "/home/alex/instructor/static-content/guyera.github.io/code-samples/pythons-basic-data-structures/cant-modify-tuple.py", line 9, in main
    my_tuple[0] = 'Jesse'
    ~~~~~~~~^^^
TypeError: 'tuple' object does not support item assignment
`
      }</TerminalBlock>

      {/*TODO Unpacking tuples*/}

      {/*TODO Returning tuples from functions*/}

      {/*TODO Passing tuples to functions (mypy typing)*/}

      <SectionHeading id="sets">Sets</SectionHeading>

      {/*TODO*/}

      <SectionHeading id="dictionaries">Dictionaries</SectionHeading>

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
