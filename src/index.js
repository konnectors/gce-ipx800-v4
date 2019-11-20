process.env.SENTRY_DSN =
  process.env.SENTRY_DSN ||
  'https://952be08222804f8ea0ed6a0c4a03db6d:05269248034f4ac6a9dc2d872a84ad4c@sentry.cozycloud.cc/64'

const { BaseKonnector, log, errors, saveFiles } = require('cozy-konnector-libs')
const { URL } = require('url')
const http = require('http')
const format = require('date-fns/format')

module.exports = new BaseKonnector(start)

async function start(fields) {
  const filestream = await getResponse(fields)
  const filename = `graph_${format(new Date(), 'yyyy_MM_dd_HH_MM')}.xml`

  await saveFiles([{ filestream, filename }], fields, {
    contentType: 'application/xml'
  })
}

function getResponse(fields) {
  return new Promise((resolve, reject) => {
    const url = new URL(fields.loginUrl)
    url.username = fields.login
    url.password = fields.password
    url.pathname = '/user/graph.xml'
    http.get(url, response => {
      if (response.statusCode === 401) {
        return reject(new Error(errors.LOGIN_FAILED))
      } else if (response.statusCode !== 200) {
        log('error', `Failed to load page, status code: ${response.statusCode}`)
        return reject(new Error(errors.VENDOR_DOWN))
      }
      // const body = []
      return resolve(response)
      // response.on('data', chunk => body.push(chunk))
      // response.on('end', () => resolve(body.join('')))
    })
  })
}
