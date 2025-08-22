import { garamond } from '@/app/ui/fonts';

export default async function Enumerate({ children, listStyleType="lower-alpha" }: { children?: any, listStyleType?: string }) {
  let listStyleClass: string
  switch (listStyleType) {
    case "decimal":
      listStyleClass = "list-decimal"
      break
    case "lower-alpha":
      listStyleClass = "list-[lower-alpha]"
      break
    default:
      listStyleClass = `list-[${listStyleType}]`
      break
  }
  return (
    <ol className={`${listStyleClass} list-inside pl-16 mb-7`}>
      {children}
    </ol>
  )
}
