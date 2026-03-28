import { registerMDGenerator, concatenateChildrenMD } from './mdregistry'

export default async function Item({ children }: { children?: any }) {
  return (
    <li className={`mb-4`}>
      {children}
    </li>
  )
}

registerMDGenerator(Item, (props, children) => {
  return concatenateChildrenMD(children) + '\n\n'
})
