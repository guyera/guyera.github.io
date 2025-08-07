export default async function Paragraph({ children }: { children?: any }) {
  return (
    <p className={`mb-7`}>
      {children}
    </p>
  )
}
