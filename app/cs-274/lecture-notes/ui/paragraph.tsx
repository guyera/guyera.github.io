import { registerMDGenerator, concatenateChildrenMD } from './mdregistry'

export default async function Paragraph({ children, spaceBelow=true }: { children?: any, spaceBelow?: boolean }) {
  return (
    <p className={spaceBelow ? 'mb-7' : 'mb-0'}>
      {children}
    </p>
  )
}

registerMDGenerator(Paragraph, (props, children) => {
  return concatenateChildrenMD(children) + '\n\n'
})
