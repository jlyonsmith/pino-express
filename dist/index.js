'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pretty = pretty;
exports.config = config;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _split = require('split2');

var _split2 = _interopRequireDefault(_split);

var _fastJsonParse = require('fast-json-parse');

var _fastJsonParse2 = _interopRequireDefault(_fastJsonParse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const levelMap = {
  60: _chalk2.default.red('FATAL'),
  50: _chalk2.default.red('ERROR'),
  40: _chalk2.default.yellow('WARN'),
  30: 'INFO',
  20: _chalk2.default.cyan('DEBUG'),
  10: _chalk2.default.cyan('TRACE')
};
function pretty(options) {
  const eol = options.eol || '\n';

  function isPinoLine(line) {
    return line && line.hasOwnProperty('hostname') && line.hasOwnProperty('pid') && line.hasOwnProperty('level') && line.hasOwnProperty('time') && line.hasOwnProperty('v') && line.v === 1;
  }

  function parseLine(line) {
    const parsed = new _fastJsonParse2.default(line);
    const obj = parsed.value;

    if (parsed.err || !isPinoLine(obj)) {
      return line + eol;
    }

    const time = new Date(obj.time).toISOString();

    if (obj.req && obj.res) {
      const method = _chalk2.default.green(obj.req.method);
      const url = obj.req.originalUrl;
      const responseTime = obj.res.responseTime;
      const remoteAddr = obj.req.hostname;
      const length = obj.res.headers['Content-Length'] || 0;
      let status = obj.res.statusCode;

      status = status >= 500 ? _chalk2.default.red(status) : status >= 400 ? _chalk2.default.yellow(status) : status >= 300 ? _chalk2.default.cyan(status) : status >= 200 ? _chalk2.default.green(status) : status;

      return `[${time}] ${remoteAddr} - ${method} ${url} ${status} ${responseTime} ms - ${length}${eol}`;
    } else {
      const level = levelMap[obj.level] || 'USER';
      const pid = obj.pid;
      const hostname = obj.hostname;
      let line2 = `[${time}] ${level} (${pid} on ${hostname}): ${_chalk2.default.cyan(obj.msg)}${eol}`;

      if (obj.type === 'Error') {
        line2 += `${obj.stack.split(/\r?\n/).slice(1).join(eol)}${eol}`;
      }

      return line2;
    }
  }

  return (0, _split2.default)(parseLine);
}

function config(options) {
  const log = options.log;
  const isProduction = options.isProduction || false;

  function onResFinished(error) {
    this.removeListener('finish', onResFinished);
    this.removeListener('error', onResFinished);

    if (error) {
      log.error(error);
      return;
    }

    if (isProduction) {
      log.info({ req: this.req, res: this });
    } else {
      // We don't need as much information for simple debug messages

      const reqInfo = {
        method: this.req.method,
        hostname: this.req.hostname,
        originalUrl: this.req.originalUrl
      };

      const resInfo = {
        responseTime: Date.now() - this.startTime,
        statusCode: this.statusCode,
        headers: {
          'Content-Length': this.get('Content-Length')
        }
      };

      log.info({ req: reqInfo, res: resInfo });
    }
  }

  return function (req, res, next) {
    res.startTime = res.startTime || Date.now();
    res.addListener('finish', onResFinished);
    res.addListener('error', onResFinished);
    next();
  };
}
//# sourceMappingURL=index.js.map