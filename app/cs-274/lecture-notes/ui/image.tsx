import NextImage from 'next/image'

import Caption from './caption'

export default async function Image({ src, alt, caption }: { src: any, alt: string, caption?: Caption }) {
  return (
    <>
      <NextImage src={src} alt={alt} className={`ml-auto mr-auto max-w-[100%] ${caption ? 'mb-1' : 'mb-7'}`}/>
      {caption}
    </>
  )
}
