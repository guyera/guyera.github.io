import RehypeCopyableCodeBlock from '@/app/ui/codeblock/rehypecopyablecodeblock'
import RehypeCodeBlock from '@/app/ui/codeblock/rehypecodeblock'

export default async function PythonBlock({ children, fileName, highlightLines='', copyable=true }: { children?: any, fileName?: string, highlightLines?: string, copyable?: boolean }) {
  return (
    <div className="mb-7 mx-3 text-base">
      {copyable ? <RehypeCopyableCodeBlock code={children} language="python" fileName={fileName} showLineNumbers highlightLines={highlightLines}/> : <RehypeCodeBlock code={children} language="python" fileName={fileName} showLineNumbers highlightLines={highlightLines}/>}
    </div>
  )
}
