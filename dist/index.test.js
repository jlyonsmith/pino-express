'use strict';

var _ = require('.');

var pinoExpress = _interopRequireWildcard(_);

var _memoryStreams = require('memory-streams');

var _autoBind = require('auto-bind2');

var _autoBind2 = _interopRequireDefault(_autoBind);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class MockPino {
  constructor(opts, stream) {
    (0, _autoBind2.default)(this);
    this.opts = opts;
    this.stream = stream;
  }

  info(obj, msg) {
    obj.msg = msg || '';
    this.stream.write(JSON.stringify(obj), { encoding: 'utf8' });
  }
}

test('test not pino JSON', async done => {
  const pretty = pinoExpress.pretty({});
  const mockStdout = new _memoryStreams.WritableStream();
  const mockLog = new MockPino({}, mockStdout);
  const obj = { "not_pino": true };

  pretty.pipe(mockStdout);

  mockLog.info(obj);
  expect(mockStdout.toString()).toMatch(JSON.stringify(obj));
  done();
});

test('test pino JSON', async done => {
  const pretty = pinoExpress.pretty({});
  const mockStdout = new _memoryStreams.WritableStream();
  const mockLog = new MockPino({}, mockStdout);
  const obj = { hostname: 'localhost', pid: 123, v: 1, time: 1510859218915, level: 30 };

  pretty.pipe(mockStdout);

  mockLog.info(obj);
  expect(mockStdout.toString()).toMatch(JSON.stringify(obj));
  done();
});
//# sourceMappingURL=index.test.js.map