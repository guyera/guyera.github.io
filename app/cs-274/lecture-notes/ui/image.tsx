import NextImage from 'next/image'

import Caption from './caption'
import { registerMDGenerator, concatenateChildrenMD } from './mdregistry'

export default async function Image({ src, alt, caption, srcDarkMode, width, height, className }: { src: any, alt: string, caption?: any, srcDarkMode?: any, width?: any, height?: any, className?: any }) {

  if (srcDarkMode) {
    return (
      <>
        <picture>
          <source srcSet={srcDarkMode.src} media="(prefers-color-scheme: dark)" />
          <NextImage src={src} alt={alt} className={`ml-auto mr-auto max-w-[100%] ${caption ? 'mb-1' : 'mb-7'} ${className ? className : ''}`} width={width} height={height}/>
        </picture>
        {caption}
      </>
    )
  } else {
    return (
      <>
        <NextImage src={src} alt={alt} className={`ml-auto mr-auto max-w-[100%] ${caption ? 'mb-1' : 'mb-7'} ${className ? className : ''}`} width={width} height={height}/>
        {caption}
      </>
    )
  }
}

registerMDGenerator(Image, (props: any, children: any) => {
  var res = '['
  if (props.alt) {
    res += props.alt
  }
  res += ']('

  if (process.env.ASSET_ROOT) {
    res += process.env.ASSET_ROOT
  } else {
    console.warn('Warning: Missing environment variable ASSET_ROOT for locating assets to reference in generated markdown pages. Please configure this environment variable to store, e.g., "https://<domain>", where <domain> is the fully qualified domain name at which this project is deployed')
  }

  res += props.src.src

  res += ')'

  return res
})
