const parse = require('markdown-ast')

/** Create a Markdown document */
function md(input) {
  if (typeof input == 'string') {
    return new md.Document(input)
  }
  if (input && (input.type || Array.isArray(input))) {
    return stringify(input)
  }
  throw TypeError('Must pass a string, node, or array of nodes')
}

/** Markdown document */
class Document {
  constructor(input) {
    this.ast = parse(input)
  }
  edit(recipe) {

  }
}
