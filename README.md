# markyd

The legendary `.md` transformer

**Project status:** Planning

```js
import md from 'markyd'

// Parse some markdown.
let doc = md('# hello world')

// Edit the AST using a mutable proxy.
doc.edit(draft => {
  // Change the draft in anyway you see fit.
  // Add nodes, delete nodes, change node properties,
  // or even pass the draft to an imported transform.
  //
  // To get the string value of a node (or array of nodes):
  let str = md(draft)

  // Use `md.visit` to walk the AST for specific node types.
  // Visitors are called at the end of this pass.
  md.visit(draft, {
    image(node, parents) {
      assert(node.type == 'image')
      // The `parents` argument is the array of ancestors for this node,
      // and `this` is bound to an object shared between all visitors.
    },
  })
})

// The AST is copied when edited.
assert(ast !== doc.ast)

// All changes made to this document, as an array of JSON patches.
doc.changes

// Generate some markdown.
doc.toString()
```

## Plugins

Plugins are just functions that mutate the draft you pass them.

```js
let myPlugin = draft => {
  // Change the draft however you see fit.
}

// Plugins can be used in 2 ways.
let doc = md('# foo')

// Nest the plugin in your own pass:
doc.edit(draft => {
  myPlugin(draft)
})

// Give the plugin its own pass: (slower in most cases)
doc.edit(myPlugin)
```

### Creating nodes

Adding nodes is intuitive and painless.

Let's write a plugin that adds a node:

```js
import md from 'markyd'

let myPlugin = ast => {
  let firstNode = ast[0]

  // Add an <h1> if none exists.
  if (firstNode.type !== 'title') {
    ast.unshift(md('# foo'))
  }

  // Convert <h2> and under into an <h1>
  else if (firstNode.rank !== 1) {
    firstNode.rank = 1
  }
}
```

No manual string splicing required. 😊

## Multi-pass editing

Every `edit` call is considered a "pass".

Nested `edit` calls are queued for the _next_ pass.

```js
// This works:
doc.edit(ast => /* TODO: first pass */)
doc.edit(ast => /* TODO: second pass */)

// This also works:
doc.edit(ast => {
  /* TODO: first pass */
  doc.edit(ast => {
    /* TODO: second pass */
  })
})

// This works the same after either of the above:
doc.edit(ast => /* TODO: third pass */)
```
