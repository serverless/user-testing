const helloHttp = (event, context, callback) => {
  callback({
    statusCode: 200,
    body: 'Hello HTTP!'
  })
}

module.exports = {
  helloHttp
}
