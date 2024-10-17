/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import type { ViteUserConfig } from 'vitest/config';

type TestConfig = Required<ViteUserConfig>['test'];
type BrowserConfig = Required<TestConfig>['browser'];
type BrowserBuiltinProvider = BrowserConfig['provider'];

export type BrowserName = 'chrome' | 'firefox' | 'safari' | 'edge';

const BROWSER = process.env.BROWSER ?? 'chrome';

export const name = BROWSER;
export const provider: BrowserBuiltinProvider = 'webdriverio';

export const STANDARD_BROWSERS: Record<string, WebdriverIO.Capabilities> = {
    chrome: {
        // label: 'sl_chrome_latest',
        browserName: 'chrome',
        browserVersion: 'latest',
    },
    firefox: {
        //label: 'sl_firefox_latest',
        browserName: 'firefox',
        browserVersion: 'latest',
        'moz:debuggerAddress': true, // See https://github.com/karma-runner/karma-sauce-launcher/issues/275#issuecomment-1318593354
    },
    safari: {
        //label: 'sl_safari_latest',
        browserName: 'safari',
    },
    edge: {
        //label: 'sl_edge_latest',
        browserName: 'microsoftedge',
        browserVersion: 'latest',
    },
};

export const LEGACY_BROWSERS: WebdriverIO.Capabilities[] = [
    {
        //label: 'sl_chrome_compat',
        browserName: 'chrome',
        browserVersion: 'latest-2',
    },
    {
        //label: 'sl_safari_compat',
        browserName: 'safari',
        browserVersion: '14',
        platformName: 'macOS 11',
    },
];

export const providerOptions: WebdriverIO.RemoteConfig = {
    strictSSL: false,

    capabilities: {
        ...STANDARD_BROWSERS[name],
        acceptInsecureCerts: true,
    },
};

export const browser: BrowserConfig = {
    enabled: true,
    ui: true,
    screenshotFailures: false,
    name,
    provider,
    testerScripts: [
        {
            src: '@lwc/engine-dom/dist/index.js?iife',
        },
    ],

    providerOptions,
};
