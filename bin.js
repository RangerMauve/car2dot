#!/usr/bin/env node

import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { parseArgs } from 'node:util'

import { carToDot } from './index.js'

const options = parseArgs({
  options: {
    direction: { type: 'string' },
    title: { type: 'string' },
    style: { type: 'string' }
  }
})

await pipeline(
  Readable.from(
    carToDot(process.stdin, options)
  ),
  process.stdout
)
