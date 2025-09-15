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
      <P>There's a special primitive data type in Python that we haven't covered yet: <Code>NoneType</Code>. <Code>NoneType</Code> is the type of the <Code>None</Code> literal (in the same way that <Code>boolean</Code> is the type of the <Code>True</Code> and <Code>False</Code> literals, and <Code>int</Code> is the type of the literal <Code>100</Code>). <Code>NoneType</Code> is special in that <Code>None</Code> is the <Ul>only</Ul> value in all of Python whose type is <Code>NoneType</Code> (whereas there are two valid boolean values, billions of valid integer values, and so on).</P>

      <P>The purpose of the value <Code>None</Code> is to indicate the absence of data. This can be helpful for constructing variables that sometimes store actual values but sometimes don't. As a simple example, suppose you have a list of <Code>Person</Code> objects and want to retrieve the age of a person with a given name from the list. Naively, you might try something like this:</P>

      <PythonBlock copyable={false} showLineNumbers={false}>{
`for p in list_of_people:
    if p.name == 'Joe':
      found_age = p.age
      break

print(f"Joe's age is {found_age}")`
      }</PythonBlock>
        
      <P>But there's an issue with the above code: what happens if Joe is not present in <Code>list_of_people</Code>? Simple: <Code>found_age</Code> will never be defined, so the program will throw an exception (specifically an <Code>UnboundLocalError</Code>) and crash. Actually, MyPy will even report errors about the above code, stating something about being unable to infer the type of <Code>found_age</Code> because, in some contexts, it's not properly defined.</P>

      <P>There are various solutions to this issue. One solution is to store some sort of "dummy" value within <Code>found_age</Code> in the case that Joe is not present in the list. For example, a person's age should never be negative, so we might use the value of <Code>-1</Code> to indicate that Joe was not found in the list:</P>

      <PythonBlock copyable={false} showLineNumbers={false}>{
`found_age = -1
for p in list_of_people:
    if p.name == 'Joe':
      found_age = p.age
      break

if found_age != -1:
    print(f"Joe's age is {found_age}")`
      }</PythonBlock>

      <P>This technically works in this particular case, but it's messy for various reasons. For one, it only works because the <Code>int</Code> type supports negative values, but ages cannot be negative, so we can use those negative values as dummy values. If we were dealing with something other than ages that <It>could</It> be negative, this strategy wouldn't work; you wouldn't be able to distinguish a negative "dummy" value from a negative "real" value.</P>

      <P>Second, this strategy is problematic because the syntax of the code does not align with its semantics. That's to say, <Code>found_age</Code> being <Code>-1</Code> does not very clearly communicate that the person "Joe" could not be found within the list (this special, unintuive meaning of the value <Code>-1</Code> makes it a so-called "magic number", which are an infamous problem in many poorly designed codebases). This makes the code hard to understand.</P>

      <P>There are several other more reasonable solutions to this particular example, but the one that I want to highlight is the use of <Code>None</Code>. Indeed, the purpose of <Code>None</Code> is to indicate the absence of data. If Joe is not present in the list, then <Code>found_age</Code> should not store an age at all<Emdash/>it should store <It>nothing</It>. We can indicate this by assigning it the value <Code>None</Code>:</P>

      <PythonBlock copyable={false} showLineNumbers={false} highlightLines="{1,7}">{
`found_age = None
for p in list_of_people:
    if p.name == 'Joe':
      found_age = p.age
      break

if found_age is not None:
    print(f"Joe's age is {found_age}")`
      }</PythonBlock>

      <P>Important: Notice that I check whether <Code>found_age</Code> stores the value <Code>None</Code> via the syntax <Code>if found_age is not None</Code>. I did <Ul>not</Ul> use the <Code>!=</Code> operator. This is critical. In Python, the correct way to check whether a value <Code>x</Code> is <Code>None</Code> is via one of two syntaxes: a) <Code>if x is None</Code> (to check if <Code>x</Code> stores the value <Code>None</Code>), or b) <Code>if x is not None</Code> (to check if <Code>x</Code> does <It>not</It> store the value <Code>None</Code>). Using the <Code>==</Code> or <Code>!=</Code> operator to check for noneness <It>sometimes</It> works, but it's not completely reliable.</P>

      <P>The above code works while avoiding many of the issues with magic numbers and other dummy values. It also passes through Mypy without errors.</P>

      <P>The fact that it passes through Mypy without errors might surprise you. In the past, I've said that Mypy does not allow a variable's (static) type to change during the duration of a program. And yet, <Code>found_age</Code> clearly changes types throughout the above code: it starts out as <Code>None</Code>, which is of the special type <Code>NoneType</Code>, and then it changes to <Code>p.age</Code>, which is (presumably) of type <Code>int</Code>. The reason that Mypy is okay with this in this particular case is a bit complicated. For now, I'll just explain a small part of the reason: Mypy treats <Code>found_age</Code> to be of a special type known as an <Bold>optional</Bold>. An optional is a special data type that's allowed to store either a) a value of a certain, specific type, or b) the value <Code>None</Code>. In particular, the actual type of <Code>found_age</Code> is not <Code>int</Code>, nor is it <Code>NoneType</Code>, but rather <Code>typing.Optional[int]</Code>. This indicates that <Code>found_age</Code> is allowed to store either a) an integer value, or b) the value <Code>None</Code>.</P>

      <P>(Similarly, a value of type <Code>typing.Optional[str]</Code> would be allowed to store either a) a string value, or b) the value <Code>None</Code>. You can put any type you want between the square brackets to create an optional type that wraps around that specific type.)</P>

      <P>Mypy is able to infer that <Code>found_age</Code> is an optional by analyzing the code. It sees that, sometimes (/ in some cases), <Code>found_age</Code> stores the value <Code>None</Code>, and at other times (/ in other cases), it stores an integer value (<Code>p.age</Code>). It then infers that <Code>found_age</Code> must be of a type that supports that usage pattern, so it concludes that the type must be <Code>typing.Optional[int]</Code>.</P>

      <P>You can also use <Code>typing.Optional</Code> for explicit type annotations. For example, suppose you want to write a function that returns the age of a person with a given name from a given list, returning <Code>None</Code> in the case that no such person is found (i.e., we want to move some of the above code into its own function). This means that the return type must be able to support both a) int values, and b) the value <Code>None</Code>. Hence, its return type should be <Code>typing.Optional[int]</Code>, so that's how it should be explicitly annotated:</P>

      <PythonBlock fileName="main.py">{
`import typing # Necessary in order to use typing.Optional

from person import Person # A POD type

# Return type is typing.Optional[int], meaning the return value
# will either be an integer or None. If the person with the given
# name is found in the given list, this function returns their age
# as an integer. Otherwise, it returns None.
def age_of_person(
        name: str,
        list_of_people: list[Person]) -> typing.Optional[int]:
    for p in list_of_people:
        if p.name == name:
            return p.age

    # Person was not found. Return None
    return None

def main() -> None:
    my_people = []
    my_people.append(Person('Joe', 42))
    my_people.append(Person('Amanda', 17))

    chosen_name = input('Whose age would you like to search for?: ')

    # found_age's type is typing.Optional[int], meaning it's either
    # an integer or None
    found_age = age_of_person(chosen_name, my_people)

    if found_age is None:
        # found_age is None, meaning the person couldn't be found
        print(f"Sorry, I don't know {chosen_name}'s age.")
    else:
        # found_age is not None, meaning the person was found.
        # Print their age.
        print(f"{chosen_name}'s age is {found_age}.")
    

if __name__ == '__main__':
    main()
`
      }</PythonBlock>

      <P>The above program passes through Mypy with no errors, assuming <Code>Person</Code> is properly defined in <Code>person.py</Code>. Here are some example runs:</P>

      <TerminalBlock copyable={false}>{
`(env) $ python main.py 
Whose age would you like to search for?: Joe
Joe's age is 42.
(env) $ python main.py 
Whose age would you like to search for?: Amanda
Amanda's age is 17.
(env) $ python main.py 
Whose age would you like to search for?: Sally
Sorry, I don't know Sally's age.
`
      }</TerminalBlock>

      <P>One improvement we could make to the above code would be to import <Code>Optional</Code> from the <Code>typing</Code> package using the alternative <Code>{'from <x> import <y>'}</Code> syntax:</P>

      <PythonBlock fileName="main.py" highlightLines="{1,11}">{
`from typing import Optional

from person import Person # A POD type

# Return type is Optional[int], meaning the return value
# will either be an integer or None. If the person with the given
# name is found in the given list, this function returns their age
# as an integer. Otherwise, it returns None.
def age_of_person(
        name: str,
        list_of_people: list[Person]) -> Optional[int]:
    for p in list_of_people:
        if p.name == name:
            return p.age

    # Person was not found. Return None
    return None

def main() -> None:
    my_people = []
    my_people.append(Person('Joe', 42))
    my_people.append(Person('Amanda', 17))

    chosen_name = input('Whose age would you like to search for?: ')

    # found_age's type is Optional[int], meaning it's either
    # an integer or None
    found_age = age_of_person(chosen_name, my_people)

    if found_age is None:
        # found_age is None, meaning the person couldn't be found
        print(f"Sorry, I don't know {chosen_name}'s age.")
    else:
        # found_age is not None, meaning the person was found.
        # Print their age.
        print(f"{chosen_name}'s age is {found_age}.")
    

if __name__ == '__main__':
    main()
`
      }</PythonBlock>

      <P>As I mentioned earlier, you can put whatever you want between the square brackets in <Code>Optional[]</Code>. It doesn't even have to be a primitive type, such as <Code>int</Code>. It can be any valid type. Knowing that, another improvement we could make to the above program's design is to have the function return the entire <Code>Person</Code> object with the given name rather than just returning their age. That would make the function support more flexible use cases:</P>

      <PythonBlock fileName="main.py" highlightLines="{11,14,28,30,36}">{
`from typing import Optional

from person import Person # A POD type

# Return type is Optional[Person], meaning the return value
# will either be an Person or None. If the person with the given
# name is found in the given list, this function returns the Person
# object. Otherwise, it returns None.
def age_of_person(
        name: str,
        list_of_people: list[Person]) -> Optional[Person]:
    for p in list_of_people:
        if p.name == name:
            return p

    # Person was not found. Return None
    return None

def main() -> None:
    my_people = []
    my_people.append(Person('Joe', 42))
    my_people.append(Person('Amanda', 17))

    chosen_name = input('Whose age would you like to search for?: ')

    # found_person's type is Optional[Person], meaning it's either
    # a Person or None
    found_person = age_of_person(chosen_name, my_people)

    if found_person is None:
        # found_person is None, meaning the person couldn't be found
        print(f"Sorry, I don't know {chosen_name}'s age.")
    else:
        # found_person is not None, meaning the person was found.
        # Print their age.
        print(f"{chosen_name}'s age is {found_person.age}.")
    

if __name__ == '__main__':
    main()
`
      }</PythonBlock>
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
