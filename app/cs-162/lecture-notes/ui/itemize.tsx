import { garamond } from '@/app/ui/fonts';

export default async function Itemize({ children }: { children?: any }) {
  return (
    <ul className={`list-['–_'] list-outside pl-16 mb-7`}>
      {children}
    </ul>
  )
}
