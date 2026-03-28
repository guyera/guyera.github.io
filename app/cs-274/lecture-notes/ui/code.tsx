import { robotoMono } from '@/app/ui/fonts';
import { registerMDGenerator, concatenateChildrenMD } from './mdregistry'

export default async function Code({ children }: { children?: any }) {
  return (
    <span className={`text-[calc(100%-2px)] align-baseline bg-gray-200 dark:bg-[rgb(40,40,40)] rounded-md my-0 py-0 px-2 ${robotoMono.className}`}>{children}</span>
  )
}

registerMDGenerator(Code, (props: any, children: any) => {
  var res = '`'
  res += concatenateChildrenMD(children)
  res += '`'
  return res
})
