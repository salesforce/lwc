// force non-headless Chrome on Sauce Labs for debugability
process.env.HEADLESS_CHROME=false;
const base = require('./wdio.conf.js');
const merge = require('deepmerge');

if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_KEY) {
    throw new Error("process.env.SAUCE_USERNAME and process.env.SAUCE_KEY are required to be set to run tests against SauceLabs");
}

const browsers = [
    // Note that headless Chrome also needs to be updated in wdio.conf.js for non-SauceLabs runs
    {
        commonName: 'chrome',
        browserName: 'chrome',
        platform: 'Windows 10',
        version: '61.0',
        chromeOptions: {
                //binary: CHROME_BIN_PATH,
                args: [
                    'headless',
                    'disable-gpu',
                ],
            },
    },
    {
        commonName: 'edge',
        browserName: 'MicrosoftEdge',
        platform: 'Windows 10',
        version: '15.15063'
    },
    {
        commonName: 'safari',
        browserName: 'safari',
        platform: 'macOS 10.12',
        version: '11.0'
    },
    {
        commonName: 'firefox',
        browserName: 'firefox',
        platform: 'macOS 10.12',
        version: '55.0'
    },
];

// Browsers that are only expected to work in compat mode
const compatBrowsers = [
    {
        commonName: 'ie11',
        browserName: 'internet explorer',
        platform: 'Windows 10',
        version: '11.103'
    },
    {
        commonName: 'safari10',
        browserName: 'safari',
        platform: 'macOS 10.12',
        version: '10.1'
    },
    {
        commonName: 'safari9',
        browserName: 'safari',
        platform: 'OS X 10.11',
        version: '9.0'
    },
    {
        commonName: 'chrome30',
        browserName: 'chrome',
        platform: 'Windows 8.1',
        version: '30.0'
    },
    {
        commonName: 'firefox45',
        browserName: 'firefox',
        platform: 'Windows 8',
        version: '45.0'
    },
];

const filteredBrowsers = filterBrowsers();

const sauce = {
    services: ['sauce'],
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_KEY,
    sauceConnect: true,
    // Use Sauce Lab's "Platform Configurator" to select new browser settings
    // https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
    capabilities: filteredBrowsers
}

function filterBrowsers() {
    let filtered = process.env.MODE.indexOf('compat') !== -1 ? compatBrowsers : browsers;

    if (process.env.BROWSERS) {
        const userBrowsers = process.env.BROWSERS.split(',');
        filtered = filtered.filter(b => {
            if (userBrowsers.includes(b.commonName)) {
                return true;
            }
            return false;
        });

        if (filtered.length === 0) {
            throw new Error('No target browsers after filtering for the following browsers: ' + userBrowsers);
        }
    }

    return filtered;
}

exports.config = merge(base.config, sauce);
