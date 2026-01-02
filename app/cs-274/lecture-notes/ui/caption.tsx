export default async function Caption({ children }: { children?: any }) {
  return (
    <p className='mb-7 text-center italic'>{children}</p>
  )
}
