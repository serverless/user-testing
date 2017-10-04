### Overview

We propose the term **component** to refer to a new concept built in to Framework V2 and the Platform. This concept is
- additive; multiple components can be put together to create an application
- hierarchical; components can be made of other components, and an application is itself a component
- configurable; components can expect parameter values and declare dependencies that have to be provided by the component using them
- namespaced; while wiring by-convention out of the box on par with the current framework, everything that a component provides can be scoped explicitly by name


### A single-component application

1. I specify my `serverless.yml` with a function
    ```yml
    serverless:
      name: my-application

    functions:
      greet:
        handler: handler.js:sayHello
    ```
    ```js
    function sayHello() {
      console.log("Hello.")
    }
    ```
2. I deploy
3. I visit the Platform dashboard and see that `my-application` is deployed
4. I invoke `greet` which prints `Hello.` to the log

This will be familiar to anyone who has used Framework V1

### Managing component packages and deployments

1. I have a component
    ```yml
    serverless:
      name: greeter

    functions:
      greet:
        handler: handler.js:sayHello
    ```
    ```js
    function sayHello() {
      console.log("Hello.")
    }
    ```
2. I `package` the component and `push` the package to the Platform.
3. The package and its version number is visible in the Platform under my packages, but nothing was deployed.
4. I deploy this serverless.yml WITHOUT locally having the code or package of `greeter`
    ```yml
    serverless:
      name: hello-app
    components:
      greeter:
        type: greeter@NN # NN is the version number assigned to the package by the Platform
    ```
5. I can invoke `greet`, which prints `Hello.` to the log.

#### Incremental plan
1. The CLI packages the code and uploads the package, which the platform immediately deploys. You cannot push undeployable package components

### An application with two components

1. I specify `hello/serverless.yml`
    ```yml
    serverless:
      name: greeter

    functions:
      greet:
        handler: handler.js:sayHello
    ```
    ```js
    function sayHello() {
      console.log("Hello.")
    }
    ```
2. I specify `goodbye/serverless.yml`
    ```yml
    serverless:
      name: dismisser

    functions:
      dismiss:
        handler: handler.js:sayGoodbye
    ```
    ```js
    function sayHello() {
      console.log("Goodbye.")
    }
    ```
3. I specify a main `serverless.yml` that uses these components
    ```yml
    serverless:
      name: hello-goodbye

    components:
      greeter:
        type: greeter
      dismisser:
        type: dismisser
    ```
4. I deploy `hello-goodbye`
5. I visit the Platform dashboard and see that `hello-goodbye` is deployed
6. I invoke `greet` which prints `Hello.` to the log
7. I invoke `dismiss` which prints `Goodbye.` to the log

### An application template that requires parameters

1. I declare some parameters
    ```yml
    parameters:
      - message
    ```
2. I declare a function
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
    serverless:
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

## Use-cases

* I am a developer who wants to make new versions of my application ready-for-deploy, but deploying them is not my responsibility
* I am a dev-op who needs to deploy new versions of a service, but building and centralizing and determining the newest "ready" version is not my responsibility
* I am a developer who publishes a piece of code that encapsulates a piece of event-driven behavior.
* I am a developer creating an application that involves pieces of third-party code.
* I want to respond to events from external sources.
* I am developing an application that will depend on other applications deployed separately.
* I am a dev-op deploying an application that depends on other services and applications which may or may not already be deployed
* I am an enterprise architect who wants my on-premise Serverless Platform to offer integration with my company's proprietary ecosystem in a way that is consistent with the well-established concepts in the Platform
