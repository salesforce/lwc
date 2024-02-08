/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

exports.STANDARD_SAUCE_BROWSERS = [
    {
        label: 'sl_chrome_latest',
        browserName: 'chrome',
        // Hydration tests are broken on Chrome 121 due to changes with shadowRoot, but fixed on Chrome 122.
        // Pinning Chrome version to unblock tests.
        // TODO [#3987]: Should be removed once Chrome 122 becomes latest.
        browserVersion: '120',
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

exports.LEGACY_SAUCE_BROWSERS = [
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
