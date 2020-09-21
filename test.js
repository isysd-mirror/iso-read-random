import assert from '../iso-assert/assert.js'
import { fs } from '../iso-fs/fs.js'
import global from '../always-global/global.js'
import { Process } from '../iso-process/process.js'
import { Buffer } from '../iso-buffer/buffer.js'
import { readRandom, readRandomStream, entropyAvail } from './read-random.js'
import { finishTest } from '../iso-test/index.js'
global.process = Process.getProcess()

var stream
var buff = Buffer.alloc(0)
var device = '/dev/urandom'

function resetBuff () {
  buff = Buffer.alloc(0)
}

new Promise(async (resolve, reject) => {
  //stream = readRandom(1)
  //stream = readRandom(1, '/dev/random')
  buff = await readRandom({
    bytes: 16,
    device: device
  }).catch(e => finishTest)
  assert(buff)
  assert(buff.length === 16)
  finishTest('pass read 16 bytes from urandom')

  resetBuff()

  buff = await readRandom({
    bytes: 16,
    device: '/dev/random'
  }).catch(e => finishTest)
  assert(buff)
  assert(buff.length === 16)
  finishTest('pass read 16 bytes from random')

  resetBuff()
  // TODO check amount of entropy and only ask for slightly more, to avoid waste
  buff = await readRandom({
    bytes: 1024
  }).catch(e => {
    console.error(e)
    finishTest(e)
  })
  assert(buff)
  assert(buff.length === 1024)
  finishTest('pass read 1024 bytes from random')

  resetBuff()
  // check amount of entropy and only ask for slightly more, to avoid waste
  var avail = await entropyAvail().catch(e => 4097)
  avail = parseInt(avail) + 1 // convert to bits and read 1 more bit than available
  buff = await readRandom({
    bytes: avail,
    device: '/dev/random'
  }).catch(e => {
    console.error(e)
    finishTest(e)
  })
  assert(buff)
  assert(buff.length === avail)
  finishTest(`pass read ${avail} bytes from random`)
}).catch(e => {
  console.error(e)
  finishTest(e)
})

