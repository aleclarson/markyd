import * as fs from 'fs'
import parse from 'markdown-ast'
import * as path from 'path'
import { printInline, stringify } from '../src/stringify'

process.chdir(__dirname)

describe('stringify()', () => {
  test('takes either a node or array of nodes', () => {
    expect(stringify({ type: 'text', text: 'foo' })).toBe('foo')
    expect(stringify([{ type: 'text', text: 'foo' }])).toBe('foo')
  })
  /**
   * Fixtures
   */
  const FIXTURES_DIR = 'fixtures'
  // Expected format changes are given a snapshot.
  const snapshots = {
    'paragraphs-empty.md': true,
    'paragraphs-and-indentation.md': true,
    'reference-link-escape.nooutput.md': true,
    'reference-link-not-closed.md': true,
    'stringify-escape.md': true,
    'stringify-escape.output.md': true,
    'stringify-escape.output.commonmark.md': true,
    'stringify-escape.output.nogfm.md': true,
    'stringify-escape.output.nogfm.commonmark.md': true,
    'stringify-escape.output.pedantic.md': true,
    'stringify-escape.output.noposition.pedantic.md': true,
    'strong-and-em-together-one.md': true,
    'strong-and-em-together-two.nooutput.md': true,
    'strong-initial-white-space.md': true,
    'table-loose.output.loose-table.md': true,
    'table-in-list.md': true,
    'table-invalid-alignment.md': true,
    'tabs.md': true,
    'tabs-and-spaces.md': true,
    'tidyness.md': true,
    'toplevel-paragraphs.md': true,
    'task-list.md': true,
    'list-unordered-empty-no-space-single-item.md': true,
    'ordered-and-unordered-lists.md': true,
    'ordered-with-parentheses.md': true,
    'no-positionals.nooutput.md': true,
    'mixed-indentation.md': true,
  }
  fs.readdirSync(FIXTURES_DIR).forEach(name => {
    let file = path.join(FIXTURES_DIR, name)
    let input = fs.readFileSync(file, 'utf8')
    test(name, () => {
      let output = stringify(parse(input))
      if (name in snapshots) expect(output).toMatchSnapshot()
      else expect(output).toBe(input)
    })
  })
})

describe('printInline()', () => {
  it('returns an empty string if the node type is unknown', () => {
    expect(printInline({ type: 'unknown' } as any)).toBe('')
  })
})
