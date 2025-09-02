export default async function Paragraph({ children, spaceBelow=true }: { children?: any, spaceBelow?: bool }) {
  return (
    <p className={spaceBelow ? 'mb-7' : 'mb-0'}>
      {children}
    </p>
  )
}
