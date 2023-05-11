#!/usr/bin/env node

import { carToDot } from './index.js'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

await pipeline(Readable.from(carToDot(process.stdin)), process.stdout)
