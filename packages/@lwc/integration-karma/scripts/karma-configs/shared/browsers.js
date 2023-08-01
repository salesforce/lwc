exports.STANDARD_SAUCE_BROWSERS = [
    {
        label: 'sl_chrome_latest',
        browserName: 'chrome',
        browserVersion: 'latest',
    },
    // TODO [#3083]: Update to latest firefox and geckodriver.
    // Pin firefox version to 105 and geckodriver to 0.30.0 for now because of issues running the latest version of
    // firefox with geckodriver > 0.30.0 in saucelabs.
    // https://saucelabs.com/blog/update-firefox-tests-before-oct-4-2022
    // https://github.com/karma-runner/karma-sauce-launcher/issues/275
    {
        label: 'sl_firefox_latest',
        browserName: 'firefox',
        browserVersion: '105',
        sauceOptions: {
            geckodriverVersion: '0.30.0',
        },
    },
    {
        label: 'sl_safari_latest',
        browserName: 'safari',
        browserVersion: 'latest',
        platformName: 'macOS 12', // Note: this must be updated when macOS releases new updates
    },
];

exports.LEGACY_SAUCE_BROWSERS = [
    {
        label: 'sl_chrome_compat',
        browserName: 'chrome',
        version: 'latest-2',
    },
    {
        label: 'sl_safari_compat',
        browserName: 'safari',
        version: '14',
    },
];
