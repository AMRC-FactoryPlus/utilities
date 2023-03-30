> **Note**
> The AMRC Connectivity Stack is an open-source implementation of the AMRC's [Factory+ Framework](https://factoryplus.app.amrc.co.uk/).

This is a NodeJS library for writing clients for Factory+. It was used extensively when building the AMRC Connectivity Stack.

## Getting Started

Because this library has native code dependencies, the easiest way to use it from your code is to base your container image on the Docker images that we provide.

Start a new project by running

```bash
npm init -y
```

then follow the instructions, creating a new `Dockerfile` instead of updating an existing one.

### Updating your Dockerfile

If your code currently has a basic Node.js Dockerfile which looks like this:

```dockerfile
FROM node:lts-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY package*.json ./
USER node
RUN npm install --save=false

COPY --chown=node . .

CMD npm start
```

then you need to replace it with one which looks like this, setting `utility_ver` to the desired version:

```dockerfile
ARG utility_prefix=ghcr.io/amrc-factoryplus/utilities
ARG utility_ver=v1.0.6

FROM ${utility_prefix}-build:${utility_ver} AS build

# Install the node application on the build container where we can
# compile the native modules.
RUN install -d -o node -g node /home/node/app
WORKDIR /home/node/app
USER node
COPY package*.json ./
RUN npm install --save=false
COPY . .

FROM ${utility_prefix}-run:${utility_ver}

# Copy across from the build container.
WORKDIR /home/node/app
COPY --from=build --chown=root:root /home/node/app ./

USER node
CMD npm start
```

This makes the following changes from the original:

* The build is now multi-stage, because we need compilers and so on for the build stage which we don't need at runtime.
  This means that we do most of the building in one container, and then just copy the results across into a fresh
  container at the end.

* Both stages of the build are based on the Docker images provided for this library. These images include the tools
  needed to build the library and the native libraries needed to run it. They also set up npm to reference the NPM
  registry for `@amrc-factoryplus` packages.

* The build stage runs the build as user `node`, but the code is copied across to the run stage owned by `root`. This
  improves security but may cause problems if your app assumes it can write to its working directory. This is, in
  general, a bad Idea for a Docker container (you should be writing to a volume probably), but if necessary the commands
  can be adjusted to change the permissions.

If you have a more complicated Dockerfile you will need to adjust this appropriately. Try to do as much work as possible
in the build container, and then just copy the results across into the runtime container. This will make the final
images smaller.

### Adding to `package.json`

You now need to add the following entry to your `package.json`:

```
{
    "dependencies": {
        "@amrc-factoryplus/utilities": "^1.0.0"
    }
}
```

The library will install on Windows; however we do not have access to the GSSAPI libraries on Windows so most of the
functionality will not work. However this allows `npm update` to work at least.

## Using the package

This module is an ESM-only module; it cannot be loaded with `require`. If you are writing ESM code (if you
have `"type": "module"` in your`package.json`, or if you are using `.mjs` file extensions) then you can load the module
like this:

```js
import * as factoryplus from "@amrc-factoryplus/utilities";

// or

import { WebAPI } from "@amrc-factoryplus/utilities";
```

If you are using CommonJS (using `require` to load modules) you will need to use:

```js
const factoryplus = await import("@amrc-factoryplus/utilities");
```

Be aware that because you can't do top-level `await` in CommonJS you will need to call this from within an `async` function. 

If you are using Typescript then the ESM import should work fine. There are currently no `.d.ts` files; feel free to submit a PR 😀!

## Exports

### Third-party libraries

```js
import { MQTT, GSS, Pg, SpB, fetch } from "@amrc-factoryplus/utilities";
```

These are re-exports of third party modules. They are re-exported here partly to provide protection from future changes to the third-party modules, and partly to work around bugs or problems with importing.

- [Full Third-Party Library Documentation](./docs/deps.md)

### Database access

```js
import { DB } from "@amrc-factoryplus/utilities";
```

A class for accessing a Postgres database. Provides basic transaction/retry support on top of the `pg` module.

- [Full Database Documentation](./docs/db.md)

### Logging

```js
import { Debug } from "@amrc-factoryplus/utilities";
```

Configurable logging support.

- [Full Debug/Logging Documentation](./docs/debug.md)

### Factory+ Service Client

```js
import { ServiceClient } from "@amrc-factoryplus/utilities";
```

This provides client access to the Factory+ service framework, including automatic support for service discovery and GSSAPI authentication.

- [Full Service Client Documentation](./docs/service-client.md)

### Sparkplug support

```js
import { 
    Address, Topic,
    MetricBuilder,
    MetricBranch, MetricTree,
} from "@amrc-factoryplus/utilities";
```

Utility classes for working with Sparkplug packets.

- [Full Sparkplug Utility Class Documentation](./docs/sparkplug-util.md)

### Miscellaneous utilities

```js
import {
    Version,
    resolve, pkgVersion,
    loadJsonObj, loadAllJson,
} from "@amrc-factoryplus/utilities";
```

- [Full Miscellaneous Utility Documentation](./docs/util.md)

### Well-known UUIDs

```js
import { UUIDs } from "@amrc-factoryplus/utilities";
```

Constants representing well-known UUIDs. For more information on the well-known UUIDs specified by Factory+ [refer to the Factory+ framework](https://factoryplus.app.amrc.co.uk).

### Web API boilerplate

```js
import { FplusHttpAuth, WebAPI } from "@amrc-factoryplus/utilities";
```

Classes useful in implementing an HTTP service confirming to the Factory+ spec.

- [Full Web API Documentation](./docs/webapi.md)

### Deprecated APIs

```js
import { debug, secrets, gss_mqtt } from "@amrc-factoryplus/utilities";
```

These are deprecated APIs.

* `debug` has been replaced by the Debug object.
* `secrets` provides support for reading from Docker secrets; since moving to Kubernetes this has been redundant.
* `gss_mqtt` connects to an MQTT server with GSSAPI authentication. It is better to use a ServiceClient instead, as this will discover the MQTT server via the Directory.

### Coding Style

| Language | Standard |
| -- | -- |
| Javascript | [AirBnB](https://github.com/airbnb/javascript) |

## Contributing

Development practice follows [GitHub flow](https://guides.github.com/introduction/flow/).