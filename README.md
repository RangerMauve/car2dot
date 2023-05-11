# car2dot
Convert IPFS CAR files to GraphViz DOT syntax for viewing graphs.

## Running

```
# Output the raw dot file
cat example.car | npx --yes car2dot > graph.dot
# Render it to SVG with graphviz
cat example.car | npx --yes car2dot | dot -Tsvg > graph.svg
```

## API

```JavaScript
import {cartoDot, blocksToDot} from 'car2dot'

import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

// Pass a stream of binary for the CAR file contents
// Get back an async iterator of strings for the dot file
const dotIterator = carToDot(process.stdin)

// Iterate over the dot file and pipe it into the STDOUT
await pipeline(
  Readable.from(dotIterator),
  process.stdout
)

const blocks = [block1, block2, block3]
// Pass whatever iterator of IPLD blocks (see the js-multiformats repo)
// Get back an async iterator of strings for the dot file
const dotIterator = blocksToDot(blocks)

// Iterate through it and log chunks to the console
for await(const chunk of dotIterator) {
  consle.log(chunk)
}

```
