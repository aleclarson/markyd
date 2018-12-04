import { Break, Node, NodeTypes } from 'markdown-ast'

type Options = {
  /** The string used for line breaks. Defaults to `\n` */
  lineBreak?: string
  /** Override all borders with a string */
  borderOverride?: string
  /** Collapse simultaneous breaks into a double line break */
  collapseBreaks?: boolean
}

// Packed types prefer nothing between each other.
const packedTypes = { list: 1, quote: 1, linkDef: 1 }

// Padded types prefer a break node on each side.
const paddedTypes = { quote: 1, title: 1, border: 1, codeBlock: 1 }

/** Create a markdown string from an AST */
export function stringify(ast: Node | Node[], opts: Options = {}) {
  if (!Array.isArray(ast)) ast = [ast]

  let result = ''
  let prevNode: Node | null = null

  const lineBreak = opts.lineBreak || (opts.lineBreak = '\n')
  const breakNode: Break = { type: 'break', text: lineBreak + lineBreak }

  // Empty paragraphs cannot be ended.
  const endParagraph = (breakCount: number = 2) => {
    if (prevNode && prevNode.type !== 'break') {
      if (prevNode.type == 'text' && prevNode.text.slice(-1) == '\n') {
        breakCount--
      }
      result += lineBreak.repeat(breakCount)
      prevNode = breakNode
    }
  }

  for (let node of ast) {
    let isPacked = !!packedTypes[node.type]
    let isPadded = !!paddedTypes[node.type]
    if (isPacked) {
      if (checkType(prevNode, node.type)) {
        // Hug similar nodes.
        result += lineBreak
      } else {
        // Ensure this node starts its line.
        endParagraph(isPadded ? 2 : 1)
      }
    } else if (node.type == 'break') {
      // Use the same break text everywhere.
      node.text = breakNode.text
      // Omit excessive spacing.
      if (opts.collapseBreaks && checkType(prevNode, 'break')) continue
    }
    let chunk = printInline(node, opts)
    if (chunk) {
      if (isPadded) endParagraph()
      result += chunk
      if (isPadded) endParagraph()
      prevNode = node
    }
  }

  // Always end with an empty line.
  return result
}

export function printInline(node: Node, opts: Options = {}) {
  switch (node.type) {
    case 'text':
    case 'break':
      return node.text.replace(/\r?\n/g, opts.lineBreak!)
    case 'bold':
    case 'italic':
    case 'strike':
      return node.style + stringify(node.block, opts) + node.style
    case 'codeSpan':
      return '`' + node.code + '`'
    case 'link':
    case 'image':
      return (
        ('block' in node
          ? `[${stringify(node.block, opts)}]`
          : `![${node.alt}]`) +
        (node.ref ? `[${node.ref}]` : node.url ? `(${node.url})` : '')
      )
    /**
     * Block nodes
     */
    case 'title':
      return '#'.repeat(node.rank) + ' ' + stringify(node.block, opts)
    case 'border':
      return opts.borderOverride || node.text
    case 'list':
      return (
        node.bullet +
        ' ' +
        stringify(node.block, opts).replace(/\n/g, '\n  ')
      ).replace(/^/gm, node.indent)
    case 'quote':
      let match = /^([\s\S]*?)(\r?\n)?$/.exec(stringify(node.block, opts))!
      return (
        match[1].replace(/^/gm, '>').replace(/^>(.+)$/gm, '> $1') +
        (match[2] ? opts.lineBreak : '')
      )
    case 'codeBlock':
      if (node.indent) return node.code.replace(/^/gm, node.indent)
      return (
        '```' +
        node.syntax +
        opts.lineBreak +
        (node.code ? node.code + opts.lineBreak : '') +
        '```'
      )
    case 'linkDef':
      return `[${node.key}]: ${node.url}`
  }
  return ''
}

export function checkType<T extends Node['type']>(
  node: Node | null,
  type: T
): node is NodeTypes[T] {
  return !!node && node.type == type
}
