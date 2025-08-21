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
      <P>This lecture covers the following contents:</P>

      <Itemize>
        <Item><Link href="#encapsulation">Encapsulation</Link></Item>
        <Item><Link href="#private-attributes-and-methods">Private attributes and methods</Link></Item>
        <Item><Link href="#managing-coupling">Managing coupling</Link></Item>
        <Item><Link href="#class-invariants">Class invariants</Link></Item>
        <Item><Link href="#getters-and-setters">Getters and setters</Link></Item>
      </Itemize>

      <SectionHeading id="encapsulation">Encapsulation</SectionHeading>

      {/*TODO Define encapsulation*/}

      <SectionHeading id="private-attributes-and-methods">Private attributes and methods</SectionHeading>

      {/*TODO Define private attributes / methods, enforces encapsulation (loosely, in Python), gives you control over separation between interface and implementation (define these things)*/}

      <SectionHeading id="managing-coupling">Managing coupling</SectionHeading>

      {/*TODO Define coupling. Large scope = potentially high degree of coupling. Coupling is inevitable, but it makes things harder to change. So the goal is to take the things that are likely to need to change (design decisions), and put them away into small scopes (with therefore low coupling). "Information hiding" (information representation is almost always a design decision). Hide design decisions away as implementation details, exposed via a carefully crafted interface. The interface (in a large scope, possibly global) then absorbs the coupling. But if it's stable, you're golden. Give examples. Start with obvious example, like object with a list that requires supporting complex search queries. One day, you decide to introduce a cache. But if everyone is accessing the list directly, the cache is a moot point. Reminder of Tell Dont Ask (tell the object to do the thing rather than asking the object for some data so that the thing can be done elsewhere).*/}

      <SectionHeading id="class-invariants">Class invariants</SectionHeading>

      {/*TODO Define class invariants. Go back to cache example. Need the cache to be updated and invalidated when appropriate. Simpler example: max HP and HP. HP should never exceed max. Curate an interface that guarantees this.*/}

      <SectionHeading id="getters-and-setters">Getters and setters</SectionHeading>

      {/*TODO Getters and setters. Circle w/ radius attribute is a good example. Replace with diameter, that's okay. Getter and setter can be reimplemented, interface kept the same. A simple trick that offers a tiny, tiny bit more encapsulation than public attributes. But also breaks encapsulation in some sense (allows extraction of data for processing via external behavior, rather than co-locating the data with said behavior). Counter example: a getter / setter for the cache would break our interface / invariants AND increase coupling between the cache and the rest of the codebase, making it hard to get rid of the cache / change its representation. Perhaps mention that the cache itself is coupled to the underlying attributes (in the smaller, class-local scope), so if you don't need the cache, then you shouldn't have it since it just makes changing those attributes more difficult. But if you can't get rid of the cache since it's coupled to the rest of the program, then that's a problem.*/}

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
