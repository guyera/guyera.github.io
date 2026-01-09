import NextImage from 'next/image'

import Caption from './caption'

export default async function Image({ src, alt, caption, srcDarkMode }: { src: any, alt: string, caption?: any, srcDarkMode?: any }) {

  if (srcDarkMode) {
    return (
      <>
        <picture>
          <source srcSet={srcDarkMode.src} alt={alt} className={`ml-auto mr-auto max-w-[100%] ${caption ? 'mb-1' : 'mb-7'}`} media="(prefers-color-scheme: dark)" />
          <NextImage src={src} alt={alt} className={`ml-auto mr-auto max-w-[100%] ${caption ? 'mb-1' : 'mb-7'}`}/>
        </picture>
        {caption}
      </>
    )
  } else {
    return (
      <>
        <NextImage src={src} alt={alt} className={`ml-auto mr-auto max-w-[100%] ${caption ? 'mb-1' : 'mb-7'}`}/>
        {caption}
      </>
    )
  }
}
