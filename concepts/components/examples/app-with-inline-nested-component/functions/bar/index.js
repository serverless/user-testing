const bar = (event, context, callback) => {
  callback({
    statusCode: 200,
    body: 'Hello Bar!'
  })
}

module.exports = bar
