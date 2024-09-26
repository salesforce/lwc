export const STANDARD_SAUCE_BROWSERS = [
    {
        label: 'sl_chrome_latest',
        browserName: 'chrome',
        browserVersion: 'latest',
    },
    {
        label: 'sl_firefox_latest',
        browserName: 'firefox',
        browserVersion: 'latest',
        'moz:debuggerAddress': true, // See https://github.com/karma-runner/karma-sauce-launcher/issues/275#issuecomment-1318593354
    },
    {
        label: 'sl_safari_latest',
        browserName: 'safari',
        browserVersion: 'latest',
        platformName: 'macOS 12', // Note: this must be updated when macOS releases new updates
    },
];

export const LEGACY_SAUCE_BROWSERS = [
    {
        label: 'sl_chrome_compat',
        browserName: 'chrome',
        browserVersion: 'latest-2',
    },
    {
        label: 'sl_safari_compat',
        browserName: 'safari',
        browserVersion: '14',
        platformName: 'macOS 11',
    },
];
