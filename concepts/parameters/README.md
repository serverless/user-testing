
### An application template that requires parameters

1. Declare some parameters and your functions
    ```yml
    params:
      - message
    ```
2. Declare a function
    ```yml
    functions:
      logMessage:
        handler: handler.js:logMessage
        environment:
          message: ${params.message}
    ```
    ```js
    function logMessage() {
      const msg = process.env.message
      console.log(msg) // prints the plaintext secret
    }
    ```
3. I attempt to deploy with no additional arguments. The CLI names the needed parameter.
4. I deploy with an argument to specify the parameter value `message = "Hello."`
5. I invoke `logMessage` and the log prints `Hello.`

### Application that supplies parameters to a component

1. I declare component with some parameters
    ```yml
    serverless:
      name: greeter

    parameters:
      - message
    ```
2. ... and a function
    ```yml
    functions:
      logMessage:
        handler: handler.js:logMessage
        environment:
          message: $parameters.message
    ```
    ```js
    function logMessage() {
      const msg = process.env.message
      console.log(msg) // prints the plaintext secret
    }
    ```
3. I declare an application that will use that component
    ```yml
    serverless:
      name: hello-app

    components:
      greeter:
        type: greeter # leaving out version will use latest available
        params:
          message: "Hello."
    ```
4. I deploy.
5. I invoke `logMessage` and the log prints `Hello.`

### Using an event source component

1. I add configuration for an event source
    ```yml
    components:
      github:
        type: githubEventSource@1.0.0
        parameters:
          token: $encrypted(enCrypt3d/k3Y=)
    ```
2. I add a subscription to an event from that source
    ```yml
    functions:
      runTestSuite:
        handler: path/to/module.js:runTests
        events:
          github.push: # Documented at https://developer.github.com/v3/activity/events/types/#pushevent
            data:
              ref: refs/heads/master # only on master
              head_commit:
                id: ?commitId # see https://github.com/serverless/product/issues/108
    ```
3. I deploy
4. I cause my event source to emit an event
5. My function receives the data
    ```js
    function runTests(event, context) {
      const { commitId } = event.data
      console.log(commitId) // prints the expected commit ID
    }
    ```

### Providing an event source to a component explicitly

1. I have a component that requires an event source
    ```yml
    name: continuousIntegration

    functions:
      runTestSuite:
        handler: handler.js:runTests
        events:
          github.push:
            # etc

    dependencies: # this name might suck
      # Just specify the component type expected
      github: githubEventSource@1.0.0
    ```
2. I have an application that configures a matching event source
    ```yml
    serverless:
      name: my-ci-application

    components:
      primaryGithub:
        type: githubEventSource@1.0.0 #satisfies the dependency
        parameters:
          token: 8W74TCIYFGTY7GV67F4N37CF
      ci:
        type: continuousIntegration
        use:
          github: primaryGithub
    ```
3. I deploy
4. I cause the source source to emit an event
5. The `runTestSuite` behavior fires

### Providing an event source to a component implicitly

1. I have a component that requires an event source
```yml
serverless:
  name: continuousIntegration

functions:
  runTestSuite:
    handler: handler.js:runTests
    events:
      github.push:
        # etc

dependencies:
  # Just specify the component type expected
  github: githubEventSource@1.0.0
```
2. I have an application that configures a matching event source
```yml
serverless:
  name: my-ci-application

components:
  github:
    type: githubEventSource@1.0.0 #satisfies the dependency
    parameters:
      token: 8W74TCIYFGTY7GV67F4N37CF
  ci:
    type: continuousIntegration
```
3. I deploy
4. I cause the source source to emit an event
5. The `runTestSuite` behavior fires
