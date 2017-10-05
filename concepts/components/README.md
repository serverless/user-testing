### Overview

In the Serverless Platform we use the term **component** to refer to a new concept. This concept is
- additive; multiple components can be put together to create a Serverless Application
- hierarchical; components can be made of other components, and an application is itself a component
- configurable; components can expect parameter values and declare dependencies that have to be provided by the component using them
- namespaced; while wiring by-convention out of the box on par with the current framework, everything that a component provides can be scoped explicitly by name


### Exmaple: A single-component application

1. Specify a `serverless.yml` with a function
    ```yml
    name: my-application
    version: 1.0.0

    functions:
      greet:
        handler: handler.js:sayHello
    ```
    ```js
    function sayHello() {
      console.log("Hello.")
    }
    ```
2. Run `sls deploy`
3. Visit the Platform dashboard and see that `my-application` is deployed
4. Run `sls invoke my-application/greet` which prints `Hello.` to the log

This will be familiar to anyone who has used Framework V1

Components can be used to compose together an application from multiple sub-components.
These components can be independently managed as well as written by separate
developers. They are independently pushable to the Serverless Platform.

### Example: Managing component packages and deployments

1. Write a component
    ```yml
    name: greeter
    version: 1.0.0

    functions:
      greet:
        handler: handler.js:sayHello
    ```
    ```js
    function sayHello() {
      console.log("Hello.")
    }
    ```
2. Run `sls push`. This will package the functions in the component independently and then push the packages and the component to the Platform registering it under the component name and version to your user account.
3. The component and its version number is visible in the Platform under my components, but nothing was deployed.
4. Now you can deploy this `serverless.yml` WITHOUT locally having the code or package of `greeter`
    ```yml
    name: hello-app
    version: 1.0.0

    components:
      greeter:
        type: greeter@1.0.0
    ```
5. You can now invoke `hello-app/greeter/greet`, which prints `Hello.` to the log.


### Example: An application with two components

1. Specify `hello/serverless.yml`
    ```yml
    name: greeter
    version: 1.1.0

    functions:
      greet:
        handler: handler.js:sayHello
    ```
    ```js
    function sayHello() {
      console.log("Hello.")
    }
    ```
2. Specify `goodbye/serverless.yml`
    ```yml
    name: dismisser
    version: 1.0.0

    functions:
      dismiss:
        handler: handler.js:sayGoodbye
    ```
    ```js
    function sayHello() {
      console.log("Goodbye.")
    }
    ```
3. Now, specify a main `serverless.yml` that uses these components
    ```yml
    name: hello-goodbye
    version: 2.0.0  # versions of components are separate from one another

    components:
      greeter:
        type: greeter@1.1.0
      dismisser:
        type: dismisser@1.0.0
    ```
4. Deploy `hello-goodbye`
5. Visit the Platform dashboard and see that `hello-goodbye` is deployed
6. Invoke `greet` which prints `Hello.` to the log
7. Invoke `dismiss` which prints `Goodbye.` to the log


## Use-cases

* I am a developer who wants to make new versions of my application ready-for-deploy, but deploying them is not my responsibility
* I am a dev-op who needs to deploy new versions of a service, but building and centralizing and determining the newest "ready" version is not my responsibility
* I am a developer who publishes a piece of code that encapsulates a piece of event-driven behavior.
* I am a developer creating an application that involves pieces of third-party code.
* I want to respond to events from external sources.
* I am developing an application that will depend on other applications deployed separately.
* I am a dev-op deploying an application that depends on other services and applications which may or may not already be deployed
* I am an enterprise architect who wants my on-premise Serverless Platform to offer integration with my company's proprietary ecosystem in a way that is consistent with the well-established concepts in the Platform
