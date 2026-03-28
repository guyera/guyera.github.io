import { garamond } from '@/app/ui/fonts';
import Item from './item'
import { registerMDGenerator, concatenateChildrenMD, generateMD } from './mdregistry'

export default async function Itemize({ children, listStyleType="dash" }: { children?: any, listStyleType?: string }) {
  let listStyleClass: string
  switch (listStyleType) {
    case "dash":
      listStyleClass = "list-['-_']"
      break
    case "lower-alpha":
      listStyleClass = "list-[lower-alpha]"
      break
    default:
      throw new Error(`Expected listStyleType to be one of ['dash', 'lower-alpha'], but got ${listStyleType}`)
  }
  return (
    <ul className={`${listStyleClass} list-inside pl-16 mb-7`}>
      {children}
    </ul>
  )
}

registerMDGenerator(Itemize, (props: any, children: any) => {
  var res = []
  for (const child of children) {
    var childRes = []
    var childMD = generateMD(child)
    var childMDLines = childMD.split('\n')
    var firstLine = childMDLines.shift()
    if (child.type == Item) {
      childRes.push('- ' + firstLine)
    } else {
      childRes.push('  ' + firstLine)
    }

    for (const line of childMDLines) {
      childRes.push('  ' + line)
    }
    var childResStr = childRes.join('\n')
    res.push(childResStr)
  }
  var resStr = res.join('\n')
  resStr += '\n\n'
  return resStr
})
