import { registerMDGenerator, concatenateChildrenMD } from './mdregistry'

export default async function Bold({ children }: { children?: any }) {
  return (
    <span className={`font-bold`}>{children}</span>
  )
}

registerMDGenerator(Bold, (props: any, children: any) => {
  return '**' + concatenateChildrenMD(children) + '**'
})
