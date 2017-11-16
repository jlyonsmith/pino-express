import * as pinoExpress from '.'
import { WritableStream } from 'memory-streams'
import autoBind from 'auto-bind2'

class MockPino {
  constructor(opts, stream) {
    autoBind(this)
    this.opts = opts
    this.stream = stream
  }

  info(obj, msg) {
    obj.msg = msg || ''
    this.stream.write(JSON.stringify(obj), { encoding: 'utf8' })
  }
}

test('test not pino JSON', async (done) => {
  const pretty = pinoExpress.pretty({})
  const mockStdout = new WritableStream()
  const mockLog = new MockPino({}, mockStdout)
  const obj = { "not_pino": true }

  pretty.pipe(mockStdout)

  mockLog.info(obj)
  expect(mockStdout.toString()).toMatch(JSON.stringify(obj))
  done()
})

test('test pino JSON', async (done) => {
  const pretty = pinoExpress.pretty({})
  const mockStdout = new WritableStream()
  const mockLog = new MockPino({}, mockStdout)
  const obj = { hostname: 'localhost', pid: 123, v: 1, time: 1510859218915, level: 30 }

  pretty.pipe(mockStdout)

  mockLog.info(obj)
  expect(mockStdout.toString()).toMatch(JSON.stringify(obj))
  done()
})
