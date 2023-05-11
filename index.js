import { Block } from 'multiformats/block'
import * as json from 'multiformats/codecs/json'
import * as cbor from '@ipld/dag-cbor'
import * as pb from '@ipld/dag-pb'

import { CarBlockIterator } from '@ipld/car'

const BAFY_PREFIX = 'bafybei'

const DOT_STYLE = `
  labelloc=t
  rankdir=LR
  bgcolor="#11111"
  fontname="system-ui"
  fontcolor="#F2F2F2"
  pad=0.5
  node [
    shape=rect
    style="filled,rounded"
    fillcolor="#6e2de5"
    fontcolor="#F2F2F2"
    fontname="System-UI"
    width=2
  ]
  edge [
    color="#2de56e"
    fontcolor="#F2F2F2"
  ]
`

const DOT_HEADER = `
digraph {
  label="CAR file contents"

`

const DOT_FOOTER = `
}
`

export async function * carToDot (bufferIterable, style = DOT_STYLE) {
  const blocks = await CarBlockIterator.fromIterable(bufferIterable)

  yield * blocksToDot(blocks, style)
}

export async function * blocksToDot (blocks, style = DOT_STYLE) {
  yield DOT_HEADER
  yield DOT_STYLE

  for await (const block of blocks) {
    const { cid, bytes } = block

    const shortName = cid.toString().slice(BAFY_PREFIX.length, BAFY_PREFIX.length + 8)

    yield `\n  ${cid} [label="${shortName} ${bytes.length}"]\n`

    let value = null

    try {
      value = pb.decode(bytes)
    } catch {
      try {
        value = cbor.decode(bytes)
      } catch {
        try {
          value = json.decode(bytes)
        } catch (e) {
          throw new Error(`Unable to parse Block: ${cid}. Unknown codec (only pb/json/cbor is currently supported`)
        }
      }
    }

    const fullBlock = new Block({ cid, bytes, value })

    for (const [name, link] of fullBlock.links()) {
      yield `${cid} -> ${link} [label="${name}"]\n`
    }
  }

  yield DOT_FOOTER
}
