import RehypeCopyableCodeBlock from '@/app/ui/codeblock/rehypecopyablecodeblock'
import RehypeCodeBlock from '@/app/ui/codeblock/rehypecodeblock'
import { registerMDGenerator, concatenateChildrenMD } from './mdregistry'

export default async function TerminalBlock({ children, fileName, highlightLines, copyable=true }: { children?: any, copyable?: boolean, highlightLines?: string, fileName?: string }) {
  return (
    <div className="mb-7 mx-3 text-base">
      {copyable ? <RehypeCopyableCodeBlock code={children} language="none" fileName={fileName} highlightLines={highlightLines}/> : <RehypeCodeBlock code={children} language="none" fileName={fileName} highlightLines={highlightLines}/>}
    </div>
  )
}

registerMDGenerator(TerminalBlock, (props: any, children: any) => {
  return '```\n' + concatenateChildrenMD(children) + '\n```\n\n'
})
