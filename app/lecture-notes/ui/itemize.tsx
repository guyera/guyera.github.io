import { garamond } from '@/app/ui/fonts';

export default async function Itemize({ children }: { children?: any }) {
  return (
    <ul className={`list-['–_'] list-inside pl-16`}>
      {children}
    </ul>
  )
}
