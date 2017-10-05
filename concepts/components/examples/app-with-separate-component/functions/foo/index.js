const foo = (event, context, callback) => {
  callback({
    statusCode: 200,
    body: 'Hello Foo!'
  })
}

module.exports = foo
