import { registerMDGenerator, concatenateChildrenMD } from './mdregistry'

export default async function Emdash() {
  return (
    <span>&mdash;</span>
  )
}

registerMDGenerator(Emdash, (props: any, children: any) => {
  return '---'
})
