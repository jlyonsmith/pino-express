import chalk from 'chalk'
import split from 'split2'
import Parse from 'fast-json-parse'

const levelMap = {
  60: chalk.red('FATAL'),
  50: chalk.red('ERROR'),
  40: chalk.yellow('WARN'),
  30: 'INFO',
  20: chalk.cyan('DEBUG'),
  10: chalk.cyan('TRACE')
}
export function pretty(options) {
  const eol = options.eol || '\n'

  function isPinoLine(line) {
    return line &&
      line.hasOwnProperty('hostname') &&
      line.hasOwnProperty('pid') &&
      (line.hasOwnProperty('v') && line.v === 1)
  }

  function parseLine(line) {
    const parsed = new Parse(line)
    const obj = parsed.value

    if (parsed.err || !isPinoLine(obj)) {
      return line + eol
    }

    const time = new Date(obj.time).toISOString()

    if (obj.req && obj.res) {
      const method = chalk.green(obj.req.method)
      const url = obj.req.originalUrl
      const responseTime = obj.res.responseTime
      const remoteAddr = obj.req.ip
      const length = obj.res.headers['Content-Length'] || 0
      let status = obj.res.statusCode

      status =
        status >= 500 ? chalk.red(status) :
        status >= 400 ? chalk.yellow(status) :
        status >= 300 ? chalk.cyan(status) :
        status >= 200 ? chalk.green(status) :
        status

      return `[${time}] ${remoteAddr} - ${method} ${url} ${status} ${responseTime} ms - ${length}${eol}`
    } else {
      const level = levelMap[obj.level] || 'USER'
      const pid = obj.pid
      const hostname = obj.hostname
      let line2 = `[${time}] ${level} (${pid} on ${hostname}): ${chalk.cyan(obj.msg)}${eol}`

      if (obj.type === 'Error') {
         line2 += `${obj.stack.split(/\r?\n/).slice(1).join(eol)}${eol}`
      }

      return line2
    }
  }

  return split(parseLine)
}

export function config(options) {
  const log = options.log
  const isProduction = options.isProduction || false

  function onResFinished(error) {
    this.removeListener('finish', onResFinished)
    this.removeListener('error', onResFinished)

    if (error) {
      log.error(error)
      return
    }

    if (isProduction) {
      log.info({ req: this.req, res: this })
    } else {
      // We don't need as much information for simple debug messages

      const reqInfo = {
        method: this.req.method,
        ip: this.req.ip,
        originalUrl: this.req.originalUrl
      }

      const resInfo = {
        responseTime: Date.now() - this.startTime,
        statusCode: this.statusCode,
        headers: {
          'Content-Length': this.get('Content-Length')
        }
      }

      log.info({ req: reqInfo, res: resInfo })
    }
  }

  return function(req, res, next) {
    res.startTime = res.startTime || Date.now()
    res.addListener('finish', onResFinished)
    res.addListener('error', onResFinished)
    next()
  }
}
