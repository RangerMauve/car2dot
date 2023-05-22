import { Block } from 'multiformats/block'
import * as json from 'multiformats/codecs/json'
import * as raw from 'multiformats/codecs/raw'
import * as cbor from '@ipld/dag-cbor'
import * as pb from '@ipld/dag-pb'

import { CarBlockIterator } from '@ipld/car'

const BAFY_PREFIX = 'bafybei'
const DEFAULT_DIRECTION = 'LR'
const DEFAULT_TITLE = 'CAR File Contents'

const codecs = new Map()
codecs.set(pb.code, pb)
codecs.set(raw.code, raw)
codecs.set(cbor.code, cbor)
codecs.set(json.code, json)

const DOT_STYLE = `
  labelloc=t
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
`

const DOT_FOOTER = `
}
`

const DEFAULT_OPTS = {
  style: DOT_STYLE,
  direction: DEFAULT_DIRECTION,
  title: DEFAULT_TITLE
}

export async function * carToDot (bufferIterable, opts = DEFAULT_OPTS) {
  const blocks = await CarBlockIterator.fromIterable(bufferIterable)

  yield * blocksToDot(blocks, opts)
}

export async function * blocksToDot (blocks, opts = DEFAULT_OPTS) {
  const {
    style = DOT_STYLE,
    direction = DEFAULT_DIRECTION,
    title = DEFAULT_TITLE
  } = opts
  yield DOT_HEADER
  yield `  label="${title}"\n`
  yield `  rankdir=${direction}\n`
  yield style

  for await (const block of blocks) {
    const { cid, bytes } = block

    const shortName = cid.toString().slice(BAFY_PREFIX.length, BAFY_PREFIX.length + 8)

    yield `\n  ${cid} [label="${shortName} (${bytes.length})"]\n`

    if (!codecs.has(cid.code)) {
      throw new Error(`Unable to parse Block: ${cid}. Unknown codec. Only pb/json/cbor/raw is currently supported`)
    }

    const codec = codecs.get(cid.code)
    const value = codec.decode(bytes)

    const fullBlock = new Block({ cid, bytes, value })

    for (const [name, link] of fullBlock.links()) {
      yield `${cid} -> ${link} [label="${name}"]\n`
    }
  }

  yield DOT_FOOTER
}
