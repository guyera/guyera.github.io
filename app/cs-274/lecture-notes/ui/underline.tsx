import { registerMDGenerator, concatenateChildrenMD } from './mdregistry'

export default async function Underline({ children }: { children?: any }) {
  return (
    <span className={`underline`}>{children}</span>
  )
}

registerMDGenerator(Underline, (props, children) => {
  return '<ins>' + concatenateChildrenMD(children) + '</ins>'
})
