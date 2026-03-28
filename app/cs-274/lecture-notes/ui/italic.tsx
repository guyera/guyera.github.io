import { registerMDGenerator, concatenateChildrenMD } from './mdregistry'

export default async function Italic({ children }: { children?: any }) {
  return (
    <span className={`italic`}>{children}</span>
  )
}

registerMDGenerator(Italic, (props: any, children: any) => {
  return '*' + concatenateChildrenMD(children) + '*'
})
