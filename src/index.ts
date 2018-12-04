import parse from 'markdown-ast'

/** Create a Markdown document */
export function md(input) {
  if (typeof input == 'string') {
    return new md.Document(input)
  }
  if (input && (input.type || Array.isArray(input))) {
    return stringify(input)
  }
  throw TypeError('Must pass a string, node, or array of nodes')
}

/** Markdown document */
md.Document = class {
  constructor(input) {
    this.ast = parse(input)
  }

  edit(recipe) {}
}
