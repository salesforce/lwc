# compat-tests
Compatibility integration tests

## Commands

Builds artifacts in `compat` mode:
```
yarn build
```

Builds artifacts in `dev` mode:
```
MODE=dev yarn build
```

Run integration tests locally in headless Chrome:

```
yarn test:integration
```

Run integration tests across all browsers on Sauce Labs (see below for more details):

```
yarn test:integration:sauce
```

Starts the server (not needed for testing)

```
yarn start
```

## Sauce Labs Integration

### Configuration 

To run tests on Sauce Labs, set `process.env.SAUCE_USERNAME` and `process.env.SAUCE_KEY` to your Sauce Labs username and key, respectively.

To access your key:
1. Log in to saucelabs.com
2. Click on your profile name in the top right --> My Account
3. Scroll down to the Access Key section and click "Show"

To set these these variables, do one of the following:

1. Set them while running the test script

```
SAUCE_USERNAME=my-user SAUCE_KEY=123-456-789 yarn run test:integration:sauce
```

2. Create a `.env` file in the root directory that sets the values

```
SAUCE_USERNAME=my-user
SAUCE_KEY=123-456-789
```

### Modifying Browsers

To modify the browsers Sauce Labs runs on, use their [Platform Configurator](https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/) to get the settings for the desired browser. Then, update the `capabilities` section of wdio.sauce.conf.js.

## Headless Chrome

When Chrome tests are run locally via the `yarn run test:integration` command, they will run in headless Chrome by default. To run in non-headless Chrome, set `process.env.HEADLESS_CHROME` to `false`. When run on Sauce Labs, Chrome will always be in non-headless mode. 