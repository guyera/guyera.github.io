import { garamond } from '@/app/ui/fonts';
import { registerMDGenerator, concatenateChildrenMD, generateMD } from './mdregistry'
import Item from './item'

export default async function Enumerate({ children, listStyleType="lower-alpha" }: { children?: any, listStyleType?: string }) {
  let listStyleClass: string
  switch (listStyleType) {
    case "decimal":
      listStyleClass = "list-decimal"
      break
    case "lower-alpha":
      listStyleClass = "list-[lower-alpha]"
      break
    default:
      throw new Error(`Expected listStyleType to be one of ['decimal', 'lower-alpha'], but got ${listStyleType}`)
      break
  }
  return (
    <ol className={`${listStyleClass} list-inside pl-16 mb-7`}>
      {children}
    </ol>
  )
}

registerMDGenerator(Enumerate, (props, children) => {
  var res = []
  var counter = 1
  for (const child of children) {
    var childRes = []
    var childMD = generateMD(child)
    var childMDLines = childMD.split('\n')
    var firstLine = childMDLines.shift()
    if (child.type == Item) {
      childRes.push(counter.toString() + '. ' + firstLine)
      counter++
    } else {
      childRes.push('  ' + firstLine)
    }

    for (const line of childMDLines) {
      childRes.push('  ' + line)
    }
    childRes = childRes.join('\n')
    res.push(childRes)
  }
  res = res.join('\n')
  res += '\n\n'
  return res
})
