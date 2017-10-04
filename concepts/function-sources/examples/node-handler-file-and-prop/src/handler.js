const helloWorld = (event, context, callback) => {
  callback({
    statusCode: 200,
    body: 'Hello World!'
  })
}

module.exports = {
  helloWorld
}
