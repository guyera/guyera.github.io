import { garamond } from '@/app/ui/fonts';

export default async function Enumerate({ children }: { children?: any }) {
  return (
    <ul className={`list-[lower-alpha] list-inside pl-16`}>
      {children}
    </ul>
  )
}
