// force non-headless Chrome on Sauce Labs for debugability
process.env.HEADLESS_CHROME=false;
const base = require('./wdio.conf.js');
const merge = require('deepmerge');

if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_KEY) {
    throw new Error("process.env.SAUCE_USERNAME and process.env.SAUCE_KEY are required to be set to run tests against SauceLabs");
}

const browsers = [
    // Chrome inherited from base config file
    {
        browserName: 'MicrosoftEdge',
        platform: 'Windows 10',
        version: '15.15063'
    },
    {
        browserName: 'safari',
        platform: 'macOS 10.12',
        version: '11.0'
    },
    {
        browserName: 'firefox',
        platform: 'macOS 10.12',
        version: '55.0'
    },
];

// Browsers that are only expected to work in compat mode
const compatBrowsers = [
    {
        browserName: 'internet explorer',
        platform: 'Windows 10',
        version: '11.103'
    },
    {
        browserName: 'safari',
        platform: 'macOS 10.12',
        version: '10.1'
    },
    {
        browserName: 'safari',
        platform: 'OS X 10.11',
        version: '9.0'
    },
    {
        browserName: 'chrome',
        platform: 'Windows 8.1',
        version: '30.0'
    },
    {
        browserName: 'firefox',
        platform: 'Windows 8',
        version: '45.0'
    },
];

const sauce = {
    services: ['sauce'],
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_KEY,
    sauceConnect: true,
    // Use Sauce Lab's "Platform Configurator" to select new browser settings
    // https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
    capabilities: process.env.MODE.indexOf('compat') !== -1 ? compatBrowsers : browsers
}

/**
 * Custom logic for merging arrays. Assume we want to always add any array entries
 * in this config to the base. Without this, default logic for an array of objects
 * would be for this config to override the base, forcing us to duplicate browser
 * entries in the 'capabilities' setting.
 */
function arrayMerge(dest, src, options) {
    return dest.concat(src);
}

exports.config = merge(base.config, sauce, { arrayMerge });
