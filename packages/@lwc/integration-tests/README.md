# @lwc/integration-tests

Add tests to @lwc/integration-karma instead of @lwc/integration-tests unless the tests are related to
keyboard navigation.

End-to-end tests run in the browser across different modes with the option to run tests remotely on Sauce Labs.

## Commands

Build artifacts in `prod` mode:

```
yarn build
```

Build artifacts in `dev` mode:

```
MODE=dev yarn build
```

Run integration tests locally in headless Chrome:

```
yarn local
```

Run test suites or individual files locally in headless Chrome:

```
yarn local --suite SUITE_NAME
```

```
yarn local --spec path/to/my/spec.js
```

Run integration tests across all browsers on Sauce Labs (see below for more details):

```
yarn sauce
```

Run integration tests on specific browsers on Sauce Labs (see below for more details):

```
yarn sauce --browsers firefox
```

Starts the server (not needed for testing)

```
yarn start
```

## Sauce Labs Integration

To run tests on Sauce Labs, Sauce Connect must be started on the machine running the tests and the Sauce Labs username and key must be set.

### Setting Username and Key

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

### Sauce Connect

See the Sauce Labs [documentation](https://wiki.saucelabs.com/display/DOCS/Setting+Up+Sauce+Connect+Proxy) for setting up Sauce Connect. The general steps are:

1. Download Sauce Connect and unzip
2. `cd` into the unzipped directory
3. Run `bin/sc -u YOUR_USERNAME -k YOUR_ACCESS_KEY -i YOUR_TUNNEL_ID` with your username, key from above, and tunnel ID (see below)

You will also need to set the `SAUCE_TUNNEL_ID` environment variable when running the tests, so that the tests know which tunnel to use:

```
SAUCE_TUNNEL_ID=my-tunnel-id
```

### Modifying Browsers

To select a single browser for a run, pass `--browsers` followed by a comma separated list of browser you wish to run. The name of the browser to specify must match the `commonName` entry of the browsers in the webdriver.io config file (wdio.sauce.conf.js).

```
SAUCE_USERNAME=my_user SAUCE_KEY=123-456-789 yarn sauce:prod --browsers chrome
```

To modify the master list of browsers Sauce Labs runs on, use their [Platform Configurator](https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/) to get the settings for the desired browser. Then, update the `capabilities` section of wdio.sauce.conf.js.

## Headless Chrome

When Chrome tests are run locally via the `yarn local` command, they will run in headless Chrome by default. To run in non-headless Chrome, set `process.env.HEADLESS_CHROME` to `false`. When run on Sauce Labs, Chrome will always be in non-headless mode.

## Contributing

### Principle

Only 1 repro per test case

### Directory structure

```
lwc-integration/src/components/<functional-area>
--test-<specific-repro>
----<specific-repro>
------<specific-repro>.html
------<specific-repro>.js
----app
------app.html
------app.js
----child
------child.html
------child.js
----<specific-repro>.spec.js
```

Here `<functional-area>` would be the broader area under test such as events, slots, track, etc. These top level directory categories should be regulated by us (Lightning Web Components core team) to ensure no duplicate or unnecessary categories are added.

`<specific-repro>` will be the more specific area of the broader category that is under test. For example, you could have `connectedCallback-listener` under the `events` category for a test case that adds an event listener inside the connectedCallback. It is important to note we only want a single repro per component to make debugging as easy as possible.

In the above example, `app` and `child` are present because the test verifies event handling between a child and parent component and to reflect the playground setup, but are not required for every test. `<specific-repro>.html` may also use the `<test-case>` template currently used in some lwc-integration tests to cleanly display Github issue and Lightning Web Components playground links.

The level describe blocks inside `<specific-repro>.spec.js` should also note the Github issue number if relevant. For example, `` describe('Issue 657: Cannot attach event in `connectedCallback`', () => {...}) ``.

If it doesn't require additional components for the repro, you could simply have

```
lwc-integration/src/components/<functional-area>
--test-<specific-repro>
----<specific-repro>.html
----<specific-repro>.js
----<specific-repro>.spec.js
```

Note that `<specific-repro>.spec.js` should always be at the top level under `test-<specific-repro>`.

### Pro tips

-   `browser.keys(['Shift', 'Tab'])` keeps you in a state where the shift key is toggled so you may run into unexpected results unless you explicitly untoggle the shift key. The recommendation is to use the command `browser.keys(['Shift', 'Tab', 'Shift'])` which toggles and untoggles the shift key in a single command.

-   On top of the [commands](https://webdriver.io/docs/api.html) already provided by WebdriverIO, this project also provides [custom command](scripts/commands) for common operation like shadow tree query selection and focus.
