# Pino Pretty Express

This is middleware for the [Pino](https://github.com/pinojs/pino) logging library, that also includes an alternative implementation of the `pretty()` function that comes with Pino.

It formats regular Pino messages and the middleware formats HTTP activity messages, similarly to the [dev](https://github.com/expressjs/morgan#dev) format of the [morgan](https://github.com/expressjs/morgan) Express middleware.

The logging middleware can be used in development and production.  The pretty formatter is intended to be used in development environments only.

## Installation

Use this package with Pino and a Node Express server.  First install in your package:

```
npm install pino-pretty-express
```

Then, add the following initialization to your your code:

```Javascript
import fs from 'fs'
import pino from 'pino'
import * as pinoExpress from 'pino-pretty-express'

const isProduction = (process.env.NODE_ENV == 'production')
const pinoOpts = { name: 'app-name' }
let log = null

if (isProduction) {
  log = pino(pinoOpts, fs.createWriteStream('app-name.log'))
} else {
  const pretty = pinoExpress.pretty({})
  pretty.pipe(process.stdout)
  log = pino(pinoOpts, pretty)
}

app = express()
app.use(pinoExpress.config({ log }))
```

Now you'll get nicely colorized logs for both regular and HTTP messages in development and full JSON logs in production.
