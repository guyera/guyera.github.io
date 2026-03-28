import RehypeCopyableCodeBlock from '@/app/ui/codeblock/rehypecopyablecodeblock'
import RehypeCodeBlock from '@/app/ui/codeblock/rehypecodeblock'
import { registerMDGenerator, concatenateChildrenMD } from './mdregistry'

export default async function CBlock({ children, fileName, highlightLines='', copyable=true, showLineNumbers=true }: { children?: any, fileName?: string, highlightLines?: string, copyable?: boolean, showLineNumbers?: boolean }) {
  return (
    <div className="mb-7 mx-3 text-base">
      {copyable ? <RehypeCopyableCodeBlock code={children} language="c" fileName={fileName} showLineNumbers={showLineNumbers} highlightLines={highlightLines}/> : <RehypeCodeBlock code={children} language="c" fileName={fileName} showLineNumbers={showLineNumbers} highlightLines={highlightLines}/>}
    </div>
  )
}

registerMDGenerator(CBlock, (props, children) => {
  var res = ''
  if (Object.hasOwn(props, 'fileName')) {
    res += props.fileName + ':\n'
  }
  res += '```c\n' + concatenateChildrenMD(children) + '\n```\n\n'
  return res
})
