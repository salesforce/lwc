# lwc-jest-transformer

Compile LWC and engine for [Jest](https://facebook.github.io/jest/) tests

## Requirements

-   Node 8.x
-   NPM 5.x
-   Yarn >= 1.0.0
-   lwc-compiler >= 0.17.0

## Prerequisites

-   `lwc-compiler` must be installed in the project.

-   You may also want to install jest globally to run tests directly from the command line:

    `yarn global add jest`

## Installation

`yarn add -D lwc-jest-transformer`

## Usage

1. Update your `jest` config to point the transformer to this package.

```json
{
    "jest": {
        "moduleFileExtensions": ["js", "html"],
        "transform": {
            "^.+\\.(js|html)$": "lwc-jest-transformer"
        }
    }
}
```

2. Update `moduleNameMapper` to point to where your LWC modules reside in the project.
3. Follow steps 4 through 6 of Option A.
