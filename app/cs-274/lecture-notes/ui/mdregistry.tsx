import React from 'react'
import P from './paragraph'

export const mdGeneratorMap = new Map()

export function registerMDGenerator(reactComponentType: any, mdGenerator: any) {
  mdGeneratorMap.set(reactComponentType, mdGenerator)
}

export function concatenateChildrenMD(children: any): string {
  var res = []
  for (const child of children) {
    res.push(generateMD(child))
  }
  return res.join('')
}

export function generateMD(node: any): string {
  if (typeof node === 'string') {
    return node
  }
  if (typeof node === 'number') {
    return node.toString()
  }
  if (!React.isValidElement(node)) {
    return '' // Log warning?
  }

  const { type, props } = node
  const children = React.Children.toArray(props.children)
  if (mdGeneratorMap.has(type)) {
    return mdGeneratorMap.get(type)(props, children)
  } else {
    console.log('Warning: No MD generator found for type ', type)
    return concatenateChildrenMD(children)
  }
}
