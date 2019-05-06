/*
SPDX-License-Identifier: MIT

Copyright (c) 2017 Kyle E. Mitchell

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { fs } from '../fs/fs.js'

var DEFAULT_DEVICE = '/dev/urandom'

export function readRandomStream (
  options // Number > 0 OR {bytes: Number > 0[, device: String]}
) {
  // Argument Parsing
  var bytesToRead
  var device
  if (typeof options === 'number') {
    bytesToRead = options
    device = DEFAULT_DEVICE
  } else {
    if (typeof options.bytes !== 'number') {
      throw new Error('invalid byte count')
    }
    bytesToRead = options.bytes
    device = options.device || DEFAULT_DEVICE
  }
  if (bytesToRead < 1) {
    throw new Error('invalid byte count: ' + bytesToRead)
  }
  // Open the device and return stream
  return fs.createReadStream(device, {
    flags: 'r',
    end: bytesToRead - 1 // starts at 0
  })
}

export async function readRandom (
  options // Number > 0 OR {bytes: Number > 0[, device: String]}
) {
  // Argument Parsing
  return new Promise((resolve, reject) => {
    var buff = Buffer.alloc(0)
    try {
      var stream = readRandomStream(options)
    } catch (e) {
      reject(e)
    }
    stream.on('error', reject)
    stream.on('data', d => {     
      buff = Buffer.concat([buff, Buffer.from(d)])
    })
    stream.on('close', e => {
      if (e) reject(e)
      else resolve(buff)
    })
  })
}

export function entropyAvailStream (entropyFile = '/proc/sys/kernel/random/entropy_avail') {
  return fs.createReadStream(entropyFile, {
    flags: 'r',
    encoding: 'utf-8'
  })
}

export async function entropyAvail (entropyFile = '/proc/sys/kernel/random/entropy_avail') {
  return parseInt(await fs.promises.readFile(entropyFile, 'utf-8'))
}

export default {
  readRandom: readRandom,
  readRandomStream: readRandomStream,
  entropyAvailStream: entropyAvailStream,
  entropyAvail: entropyAvail
}
