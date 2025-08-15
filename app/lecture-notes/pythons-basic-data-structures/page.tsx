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

      <P>Because tuples are immutable and fixed in size, they're usually only used to store a small number of (e.g., two or three) related values. Lists, in contrast, are often used to store hundreds, thousands, or even millions of values. However, this is not a hard and fast rule. Tuples can technically be as large as you want them to be, and lists can even be explicitly type-casted into tuples (and vice-versa).</P>

      <P>There are various ways to create tuples in Python. A simple way is to write out a comma-separated list of values in between a pair of parentheses. The interpreter will automatically convert the entire grouping into a single tuple containing all of the provided values. For example:</P>

      <PythonBlock fileName='tuples.py'>{
`def main() -> None:
    my_tuple = ('James', 25, 'Strawberries')

if __name__ == '__main__':
    main()
`
      }</PythonBlock>

      <P>Once a tuple has been created, you can access the values within it using square brackets and an index, just like you would with a list:</P>

      <PythonBlock fileName='tuples.py'>{
`def main() -> None:
    my_tuple = ('James', 25, 'Strawberries')
    print(my_tuple[0]) # Prints James
    print(my_tuple[1]) # Prints 25
    print(my_tuple[2]) # Prints Strawberries

if __name__ == '__main__':
    main()
`
      }</PythonBlock>

      <P>Running the above program produces the following output:</P>

      <TerminalBlock copyable={false}>{
`(env) $ python tuples.py 
James
25
Strawberries
`
      }</TerminalBlock>

      <P>You might have noticed that <Code>my_tuple</Code> from the above example is heterogeneous, meaning that it contains values of different types (it contains a <Code>str</Code> value, an <Code>int</Code> value, and another <Code>str</Code> value). Indeed, although it's uncommon to find a good use case for a heterogeneous list, heterogeneous <It>tuples</It> are incredibly common. This is because a tuple is usually used to group a few pieces of related data<Emdash/>not to construct an ordered sequence of potentially thousands of different instances of the same kind of thing. For example, a tuple might store a few pieces of information about a person (e.g., their name, age, and favorite fruit, as in the above example), and those pieces of information might not be of the same type. A list, in contrast, might store an ordered sequence of a thousand people, or a thousand people's names, or a thousand people's ages, etc<Emdash/>every element of the list is of the same type.</P>

      <P>As with lists, attempting to index a tuple with an out-of-bounds index results in an exception being thrown (specifically an <Code>IndexError</Code>), causing the program to crash if the exception isn't caught.</P>
      
      <P>Again, although you can access the values within a tuple, you <Ul>cannot</Ul> modify the values within a tuple. Attempting to do so <It>also</It> results in an exception being thrown (specifically a <Code>TypeError</Code>). And, like all other exceptions, this causes your program to crash if the exception isn't caught:</P>

      <PythonBlock fileName='cant_modify_tuple.py'>{
`def main() -> None:
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
`(env) $ python cant_modify_tuple.py 
James
25
Strawberries
Traceback (most recent call last):
  File "/home/alex/instructor/static-content/guyera.github.io/code-samples/pythons-basic-data-structures/cant_modify_tuple.py", line 12, in <module>
    main()
    ~~~~^^
  File "/home/alex/instructor/static-content/guyera.github.io/code-samples/pythons-basic-data-structures/cant_modify_tuple.py", line 9, in main
    my_tuple[0] = 'Jesse'
    ~~~~~~~~^^^
TypeError: 'tuple' object does not support item assignment
`
      }</TerminalBlock>

      <P>A tuple can be <Term>unpacked</Term> into a set of individual variables. Those variables then refer to the respective values within the tuple. There are various contexts in which a tuple can be unpacked. The simplest is via assignment. Suppose you have a tuple called <Code>my_tuple</Code> with three elements (values) inside it. Then those three values can be unpacked into three individual variables like so:</P>

      <SyntaxBlock>{
`my_first_variable, my_second_variable, my_third_variable = my_tuple`
      }</SyntaxBlock>

      <P>Here's a complete example:</P>

      <PythonBlock fileName='unpacking.py'>{
`def main() -> None:
    my_tuple = ('James', 25, 'Strawberries')
    print(my_tuple[0]) # Prints James
    print(my_tuple[1]) # Prints 25
    print(my_tuple[2]) # Prints Strawberries

    print('-------------------------')
    print('Unpacking tuple correctly:')
    
    # Unpack the three tuple values into three variables: name, age,
    # and favorite_fruit.
    name, age, favorite_fruit = my_tuple
    print(f'name: {name}') # Prints James
    print(f'age: {age}') # Prints 25
    print(f'favorite_fruit: {favorite_fruit}') # Prints Strawberries

    print('-------------------------')
    print('Unpacking tuple incorrectly:')

    # Tuples are always unpacked left-to-right. my_tuple has three
    # elements: 'James', 25, and 'Strawberries'. So those three
    # values will be unpacked into the three respective variables
    # in that exact order. If you mess up the order of your variables,
    # the wrong values will be unpacked into them:
    favorite_fruit, age, name = my_tuple
    print(f'name: {name}') # Prints Strawberries
    print(f'age: {age}') # Prints 25
    print(f'favorite_fruit: {favorite_fruit}') # Prints James


if __name__ == '__main__':
    main()
`
      }</PythonBlock>

      <P>Running the above program produces the following output:</P>

<TerminalBlock copyable={false}>{
`(env) $ python unpacking.py 
James
25
Strawberries
-------------------------
Unpacking tuple correctly:
name: James
age: 25
favorite_fruit: Strawberries
-------------------------
Unpacking tuple incorrectly:
name: Strawberries
age: 25
favorite_fruit: James
`
}</TerminalBlock>

      <P>As demonstrated in the above example, it's easy to mess up when unpacking tuples. The values are always unpacked from the tuple in the order of their indices, and those unpacked values are stored in the respective variables in left-to-right order. Listing the variables in the wrong order, then, can result in those variables storing the wrong values. If you're lucky, it can sometimes introduce type errors, which Mypy is capable of detecting (e.g., if <Code>name</Code> is already defined as a string variable, but you accidentally list it as the second variable when unpacking <Code>my_tuple</Code>, that would try to store the value <Code>25</Code> in it, which would change the type of <Code>name</Code> from <Code>str</Code> to <Code>int</Code><Emdash/>Mypy doesn't allow that). But in some cases, Mypy is not capable of detecting these kinds of mistakes, especially if two or more values in the tuple are of the same type.</P>

      <P>Besides unpacking values from a tuple in the wrong order, another common mistake is unpacking the wrong number of values. For example, suppose we have a tuple of three values, but we try to unpack it into just two variables:</P>

      <PythonBlock fileName='bad_unpacking.py' highlightLines='{7}'>{
`def main() -> None:
    my_tuple = ('James', 25, 'Strawberries')
    print(my_tuple[0]) # Prints James
    print(my_tuple[1]) # Prints 25
    print(my_tuple[2]) # Prints Strawberries

    name, age = my_tuple


if __name__ == '__main__':
    main()
i`
      }</PythonBlock>

      <P>Luckily, Mypy is capable of catching the above mistake:</P>

      <TerminalBlock copyable={false}>{
`(env) $ mypy bad_unpacking.py 
bad_unpacking.py:7: error: Too many values to unpack (2 expected, 3 provided)  [misc]
Found 1 error in 1 file (checked 1 source file)
`
      }</TerminalBlock>

      <P>If you ignore Mypy's errors and try to run the above program anyways, it throws an exception (specifically a <Code>ValueError</Code>) and crashes, assuming the exception isn't caught:</P>

<TerminalBlock copyable={false}>{
`(env) $ python bad_unpacking.py 
James
25
Strawberries
Traceback (most recent call last):
  File "/home/alex/instructor/static-content/guyera.github.io/code-samples/pythons-basic-data-structures/bad_unpacking.py", line 11, in <module>
    main()
    ~~~~^^
  File "/home/alex/instructor/static-content/guyera.github.io/code-samples/pythons-basic-data-structures/bad_unpacking.py", line 7, in main
    name, age = my_tuple
    ^^^^^^^^^
ValueError: too many values to unpack (expected 2)
`
}</TerminalBlock>
      
      <P>A similar exception is thrown if you try to unpack a tuple into <It>too many</It> variables.</P>

      <P>Suppose you want to write a function that accepts a tuple as a parameter or returns a tuple. In that case, you'll need to know how to explicitly type-annotate tuples so that they're accepted by Mypy. The syntax for a tuple type annotation is as follows:</P>

      <SyntaxBlock>{
`tuple[<type1>, <type2>, <type3>, ..., <typeN>]`
      }</SyntaxBlock>

      <P>Replace each of the the <Code>{'<typeX>'}</Code> instances with the type of the element in the tuple at the corresponding position.</P>

      <P>For example, suppose you want to write a function named <Code>foo()</Code> that has a single parameter <Code>x</Code>, which is in turn a tuple that consists of a string, followed by an integer, followed by another string. You could define <Code>foo()</Code> like so:</P>

      <SyntaxBlock>{
`def foo(x: tuple[str, int, str]):
    # Do something interesting with x...`
      }</SyntaxBlock>

      <P>Here's a more complete example that defines a function named <Code>quadratic_formula</Code> that returns the two roots of a quadratic equation in a single tuple:</P>

      <PythonBlock fileName={'tuple_typing.py'}>{
`from math import sqrt

def quadratic_formula(
        a: float,
        b: float,
        c: float) -> tuple[float, float]:
    first_root = (-b - sqrt(b**2 - 4*a*c)) / (2 * a)
    second_root = (-b + sqrt(b**2 - 4*a*c)) / (2 * a)
    return (first_root, second_root) # Return the roots as a tuple

def main() -> None:
    # Consider the quadratic equation 4x^2 + 2x - 3 = 0. Under the
    # standard pattern (ax^2 + bx + c), that means:
    # a = 4, b = 2, c = -3.

    # Compute the roots using the quadratic formula:
    roots = quadratic_formula(4, 2, -3)

    # Unpack the tuple
    first_root, second_root = roots

    print('The roots of the equation "4x^2 + 2x - 3 = 0" are:')
    print(f'x1: {first_root}')
    print(f'x2: {second_root}')

if __name__ == '__main__':
    main()
`
      }</PythonBlock>

      <P>Running the above program produces the following output:</P>

      <TerminalBlock copyable={false}>{
`(env) $ python tuple_typing.py 
The roots of the equation "4x^2 + 2x - 3 = 0" are:
x1: -1.1513878188659974
x2: 0.6513878188659973
`
      }</TerminalBlock>
      
      <P>We can actually clean up the above code in a couple of ways:</P>

      <Itemize>
        <Item>When a tuple is used as a return value, you can optionally leave out the parentheses. For example, to return a tuple consisting of the variables <Code>a</Code>, <Code>b</Code>, and <Code>c</Code>, you can simply write <Code>return a, b, c</Code> as opposed to <Code>return (a, b, c)</Code>. Leaving out the parentheses in such a case is more idiomatic / conventional, so we should do that.</Item>
        <Item>We're currently storing the returned tuple in a variable named <Code>roots</Code> and <It>then</It> unpacking it into <Code>first_root</Code> and <Code>second_root</Code>. But, as you might have surmised, there's no reason that we couldn't directly unpack the return value into <Code>first_root</Code> and <Code>second_root</Code>, skipping the need for the <Code>roots</Code> variable altogether. This is also more idiomatic, so we should do this as well.</Item>
      </Itemize>

      <P>Here's the updated code taking into account the above changes:</P>

      <PythonBlock fileName={'tuple_typing.py'} highlightLines={'{9, 17}'}>{
`from math import sqrt

def quadratic_formula(
        a: float,
        b: float,
        c: float) -> tuple[float, float]:
    first_root = (-b - sqrt(b**2 - 4*a*c)) / (2 * a)
    second_root = (-b + sqrt(b**2 - 4*a*c)) / (2 * a)
    return first_root, second_root # Return the roots as a tuple

def main() -> None:
    # Consider the quadratic equation 4x^2 + 2x - 3 = 0. Under the
    # standard pattern (ax^2 + bx + c), that means:
    # a = 4, b = 2, c = -3.

    # Compute the roots using the quadratic formula:
    first_root, second_root = quadratic_formula(4, 2, -3)

    print('The roots of the equation "4x^2 + 2x - 3 = 0" are:')
    print(f'x1: {first_root}')
    print(f'x2: {second_root}')

if __name__ == '__main__':
    main()
`
      }</PythonBlock>

      <P>(Running it does the same thing as before)</P>

      <P>By the way, now might be a good time to remind you that a variable only exists within the scope in which it's defined. This means that the above program has multiple variables with the same names. The <Code>quadratic_formula()</Code> function has variables named <Code>first_root</Code> and <Code>second_root</Code>, and the <Code>main()</Code> function <It>also</It> has variables named <Code>first_root</Code> and <Code>second_root</Code>. However, don't be fooled<Emdash/>the two variables in <Code>main()</Code> are completely separate variables from those in <Code>quadratic_formula()</Code> (of course, the variables in <Code>main()</Code> are created by unpacking the tuple returned from <Code>quadratic_formula()</Code>, so they store the same <It>values</It> as the variables from <Code>quadratic_formula()</Code>, but they're separate variables nonetheless). The point is, I could have very well named the two variables in <Code>main()</Code> something completely different from those in <Code>quadratic_formula()</Code>, and the program would still work in the exact same way. The fact that these variables share names does not mean anything<Emdash/>names are just names.</P>

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
